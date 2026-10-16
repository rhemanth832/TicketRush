import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { Store, Statement } from '../src/marketplace/hosted';
class SQLiteStatement implements Statement {
    values: any[] = [];
    constructor(public db: DatabaseSync, public sql: string) { }
    bind(...values: any[]) { const s = new SQLiteStatement(this.db, this.sql); s.values = values; return s; }
    execute() { const s = this.db.prepare(this.sql); if (/^SELECT/i.test(this.sql) || this.sql.includes(' RETURNING ')) {
        const results = s.all(...this.values);
        return { results, meta: { changes: results.length } };
    } const r = s.run(...this.values); return { results: [], meta: { changes: Number(r.changes) } }; }
    async first<T = any>(): Promise<T | null> { return this.execute().results[0] as T || null; }
    async all<T = any>(): Promise<{
        results: T[];
    }> { return this.execute() as any; }
    async run() { return this.execute(); }
}
export class SQLiteStore implements Store {
    db = new DatabaseSync(':memory:');
    constructor() { for (const file of fs.readdirSync(path.join(__dirname, '../../drizzle')).filter(f => f.endsWith('.sql')).sort())
        this.db.exec(fs.readFileSync(path.join(__dirname, '../../drizzle', file), 'utf8')); }
    prepare(sql: string) { return new SQLiteStatement(this.db, sql); }
    async batch(stmts: Statement[]) { this.db.exec('BEGIN'); try {
        const out = stmts.map(s => (s as SQLiteStatement).execute());
        this.db.exec('COMMIT');
        return out;
    }
    catch (e) {
        this.db.exec('ROLLBACK');
        throw e;
    } }
}
