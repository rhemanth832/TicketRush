import { PoolClient } from 'pg';
import fs from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { MarketError } from './marketplace/validation';
import { pool, tx, redis } from './infra';
import { Statement, Store, Env } from './marketplace/hosted';
import { ACQUIRE_LUA, RELEASE_LUA } from './booking';
import { notify } from './realtime';
import { config } from './config';
function convert(sql: string) { let n = 0; sql = sql.replace(/\?/g, () => '$' + (++n)).replace(/json_extract\(document,'\$\.([a-zA-Z]+)'\)/g, "(document::jsonb->>'$1')"); if (sql.startsWith('INSERT OR IGNORE'))
    sql = sql.replace('INSERT OR IGNORE', 'INSERT') + ' ON CONFLICT DO NOTHING'; return sql; }
class PgStatement implements Statement {
    values: any[] = [];
    constructor(public sql: string) { }
    bind(...values: any[]) { const s = new PgStatement(this.sql); s.values = values; return s; }
    async execute(client?: PoolClient) { if (this.sql.startsWith('INSERT INTO market_rate_limits')) {
        const n = await redis.eval("local n=redis.call('INCR',KEYS[1]);if n==1 then redis.call('EXPIRE',KEYS[1],120) end;return n", 1, 'rate:' + this.values[0]);
        return { results: [{ count: Number(n) }], meta: { changes: 1 } };
    } const q = client || pool; const result = await q.query(convert(this.sql), this.values); return { results: result.rows, meta: { changes: result.rowCount || 0 } }; }
    async run() { if (this.sql.startsWith('UPDATE market_orders SET document=') && this.values[1] === 'confirmed')
        return tx(async (c) => { const r = await this.execute(c); if (r.meta.changes === 1)
            await c.query('INSERT INTO market_outbox(order_id) VALUES($1) ON CONFLICT DO NOTHING', [this.values[2]]); return r; }); return this.execute(); }
    async first<T = any>(): Promise<T | null> { return (await this.execute()).results[0] || null; }
    async all<T = any>(): Promise<{
        results: T[];
    }> { return this.execute(); }
}
export class PostgresMarketStore implements Store {
    prepare(sql: string) { return new PgStatement(sql); }
    async batch(statements: Statement[]) { return tx(async (c) => { let last = 0; const out = []; for (const x of statements) {
        const s = x as PgStatement;
        if (s.sql.startsWith('INSERT INTO market_mutation_checks')) {
            if (last !== 1)
                throw new Error('Concurrent marketplace mutation; retry required');
            out.push({ meta: { changes: 1 } });
            continue;
        }
        if (s.sql.startsWith('DELETE FROM market_mutation_checks')) {
            out.push({ meta: { changes: 0 } });
            continue;
        }
        const result = await s.execute(c);
        last = result.meta.changes;
        out.push(result);
    } return out; }); }
}
const mediaPath = path.resolve(process.cwd(), 'uploads');
const bucket = { async get(key: string) { try {
        const bytes = await fs.readFile(path.join(mediaPath, key));
        return { body: bytes, httpMetadata: { contentType: key.endsWith('.png') ? 'image/png' : key.endsWith('.webp') ? 'image/webp' : 'image/jpeg' } };
    }
    catch {
        return null;
    } }, async put(key: string, bytes: Uint8Array) { await fs.mkdir(mediaPath, { recursive: true }); await fs.writeFile(path.join(mediaPath, key), bytes); } };
export function marketEnv(): Env { return { signAccess: user => jwt.sign({ name: user.name, email: user.email, role: user.role, organization: user.organization }, config.JWT_SECRET, { subject: user.id, expiresIn: '15m', issuer: 'ticketrush', audience: 'ticketrush-api', algorithm: 'HS256' }), verifyAccess: token => { jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'], issuer: 'ticketrush', audience: 'ticketrush-api' }); }, DB: new PostgresMarketStore(), BUCKET: bucket, TICKET_SECRET: config.TICKET_SECRET, RAZORPAY_KEY_ID: config.RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET: config.RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET: config.RAZORPAY_WEBHOOK_SECRET, leases: { async acquire(ids, id, ttl) { try {
            return await redis.eval(ACQUIRE_LUA, ids.length, ...ids.map(s => 'market-seat:' + s), id, ttl) === 1;
        }
        catch {
            throw new MarketError(503, 'HOLDS_UNAVAILABLE', 'Seat reservations are temporarily unavailable. Please try again shortly.');
        } }, async release(ids, id) { if (ids.length)
            await redis.eval(RELEASE_LUA, ids.length, ...ids.map(s => 'market-seat:' + s), id); } }, publish: notify }; }
