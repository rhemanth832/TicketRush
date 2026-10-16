import { MarketError, fail, text, eventData, contactData, imageType } from './validation';
import { seedEvents } from './seed';
import { signatureMatches, razorRequest, verifyCapturedPayment, refundPayment, GatewayKeys } from '../gateway';
export interface Statement {
    bind(...values: any[]): Statement;
    first<T = any>(): Promise<T | null>;
    all<T = any>(): Promise<{
        results: T[];
    }>;
    run(): Promise<{
        meta: {
            changes: number;
        };
    }>;
}
export interface Store {
    prepare(sql: string): Statement;
    batch(statements: Statement[]): Promise<any[]>;
}
export type Env = {
    signAccess?: (user: any) => string;
    verifyAccess?: (token: string) => void;
    DB?: Store;
    BUCKET?: {
        get(key: string): Promise<any>;
        put(key: string, value: any, options: any): Promise<any>;
    };
    leases?: {
        acquire(ids: string[], id: string, ttl: number): Promise<boolean>;
        release(ids: string[], id: string): Promise<void>;
    };
    publish?: (eventId: string) => Promise<void>;
    TICKET_SECRET?: string;
    RAZORPAY_KEY_ID?: string;
    RAZORPAY_KEY_SECRET?: string;
    RAZORPAY_WEBHOOK_SECRET?: string;
};
type Row = {
    id: string;
    owner_id: string;
    document: string;
    inventory: string;
    version: number;
    status: string;
    user_id?: string;
    event_id?: string;
};
const encoder = new TextEncoder(), uid = () => crypto.randomUUID(), now = () => Date.now(), stamp = () => new Date().toISOString();
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
async function sha(s: string) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(s)))].map(x => x.toString(16).padStart(2, '0')).join(''); }
const hex = (b: Uint8Array) => [...b].map(n => n.toString(16).padStart(2, '0')).join('');
async function passwordHash(password: string, salt = hex(crypto.getRandomValues(new Uint8Array(16)))) { const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']); return salt + ':' + hex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256))); }
function safeEqual(a: string, b: string) { if (a.length !== b.length)
    return false; let n = 0; for (let i = 0; i < a.length; i++)
    n |= a.charCodeAt(i) ^ b.charCodeAt(i); return n === 0; }
async function readBytes(req: Request, max: number) { if (Number(req.headers.get('content-length') || 0) > max)
    return fail(413, 'TOO_LARGE', 'This upload is too large.'); const reader = req.body?.getReader(); if (!reader)
    return new Uint8Array(); let size = 0; const chunks: Uint8Array[] = []; for (;;) {
    const r = await reader.read();
    if (r.done)
        break;
    size += r.value.length;
    if (size > max) {
        await reader.cancel();
        return fail(413, 'TOO_LARGE', 'This request is too large.');
    }
    chunks.push(r.value);
} const bytes = new Uint8Array(size); let offset = 0; for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
} return bytes; }
async function readJSON(req: Request) { try {
    return JSON.parse(new TextDecoder().decode(await readBytes(req, 65536)));
}
catch (e) {
    if (e instanceof MarketError)
        throw e;
    return fail(400, 'INVALID_JSON', 'Send a valid JSON request.');
} }
function makeInventory(event: any) { return event.tiers.flatMap((t: any, ti: number) => Array.from({ length: t.quantity }, (_, i) => ({ id: uid(), label: `${String.fromCharCode(65 + ti)}${i + 1}`, tierId: t.id, tierName: t.name, price: t.price, holdId: null, userId: null, expiresAt: 0, orderId: null }))); }
function cleanInventory(seats: any[]) { for (const s of seats)
    if (!s.orderId && s.expiresAt <= now()) {
        s.holdId = null;
        s.userId = null;
        s.expiresAt = 0;
    } return seats; }
function publicEvent(row: Row) { const e = JSON.parse(row.document), seats = cleanInventory(JSON.parse(row.inventory)); return { ...e, available: seats.filter((s: any) => !s.orderId && !s.holdId).length, tiers: e.tiers.map((t: any) => ({ ...t, available: seats.filter((s: any) => s.tierId === t.id && !s.orderId && !s.holdId).length })), sold: seats.filter((s: any) => !!s.orderId).length }; }
async function rate(db: Store, key: string, max: number) { const bucket = Math.floor(now() / 60000); const r: any = await db.prepare('INSERT INTO market_rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=market_rate_limits.count+1 RETURNING count').bind(key + ':' + bucket, now() + 120000).first(); if (r.count > max)
    return fail(429, 'RATE_LIMITED', 'Too many requests. Please wait a minute and try again.'); if (Math.random() < .01)
    await db.prepare('DELETE FROM market_rate_limits WHERE expires_at<?').bind(now()).run(); }
async function account(db: Store, req: Request, role?: string) { const token = req.headers.get('Authorization')?.replace(/^Bearer /, ''); if (!token)
    return fail(401, 'UNAUTHORIZED', 'Please sign in to continue.'); const a: any = await db.prepare("SELECT a.* FROM market_sessions s JOIN market_accounts a ON a.id=s.user_id WHERE s.hash=? AND s.kind='access' AND s.revoked=0 AND s.expires_at>?").bind(await sha(token), now()).first(); if (!a)
    return fail(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.'); if (role && a.role !== role)
    return fail(403, 'FORBIDDEN', `Please use your ${role} account for this action.`); return { id: a.id, email: a.email, name: a.name, role: a.role, organization: a.organization }; }
async function issue(db: Store, user: any, family = uid(), signAccess?: (user: any) => string) { const accessToken = signAccess ? signAccess(user) : hex(crypto.getRandomValues(new Uint8Array(32))), refreshToken = hex(crypto.getRandomValues(new Uint8Array(48))); await db.batch([db.prepare('INSERT INTO market_sessions(hash,user_id,expires_at,kind,family) VALUES(?,?,?,?,?)').bind(await sha(accessToken), user.id, now() + 900000, 'access', family), db.prepare('INSERT INTO market_sessions(hash,user_id,expires_at,kind,family) VALUES(?,?,?,?,?)').bind(await sha(refreshToken), user.id, now() + 30 * 86400000, 'refresh', family)]); return { user, accessToken, refreshToken, expiresIn: 900 }; }
async function seed(db: Store) { const found = await db.prepare('SELECT id FROM market_events LIMIT 1').first(); if (found)
    return; const rows = seedEvents(); await db.batch(rows.map(e => db.prepare('INSERT OR IGNORE INTO market_events(id,owner_id,status,starts_at,city,document,inventory,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(e.id, e.ownerId, e.status, e.startsAt, e.city, JSON.stringify(e), JSON.stringify(makeInventory(e)), e.createdAt))); }
async function eventRow(db: Store, id: string) { const r = await db.prepare('SELECT * FROM market_events WHERE id=?').bind(id).first<Row>(); if (!r)
    return fail(404, 'EVENT_NOT_FOUND', 'This event could not be found.'); return r; }
async function orderRow(db: Store, id: string) { const r = await db.prepare('SELECT * FROM market_orders WHERE id=?').bind(id).first<Row>(); if (!r)
    return fail(404, 'ORDER_NOT_FOUND', 'This order could not be found.'); return r; }
async function ownOrder(db: Store, req: Request, id: string) { const user = await account(db, req, 'attendee'), row = await orderRow(db, id); if (row.user_id !== user.id)
    return fail(404, 'ORDER_NOT_FOUND', 'This order could not be found.'); return { user, row, order: JSON.parse(row.document) }; }
async function atomic(db: Store, statements: Statement[]) { const checks: string[] = []; const stmts: Statement[] = []; for (const stmt of statements) {
    const id = uid();
    checks.push(id);
    stmts.push(stmt, db.prepare('INSERT INTO market_mutation_checks(id,ok) VALUES(?,changes())').bind(id));
} stmts.push(db.prepare(`DELETE FROM market_mutation_checks WHERE id IN (${checks.map(() => '?').join(',')})`).bind(...checks)); return db.batch(stmts); }
async function changeOrder(db: Store, id: string, change: (o: any) => any) { for (let tries = 0; tries < 8; tries++) {
    const row = await orderRow(db, id), o = JSON.parse(row.document);
    const result = change(o);
    if (result === false)
        return o;
    const r = await db.prepare('UPDATE market_orders SET document=?,status=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(o), o.status, id, row.version).run();
    if (r.meta.changes === 1)
        return o;
} return fail(409, 'TRY_AGAIN', 'This order changed. Please try again.'); }
function keys(env: Env, event?: any): GatewayKeys | null { if (event?.isDemo)
    return null; if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET)
    return { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET, webhookSecret: env.RAZORPAY_WEBHOOK_SECRET }; return null; }
async function releaseOrder(db: Store, id: string, status: string, refundId?: string) { for (let tries = 0; tries < 8; tries++) {
    const oRow = await orderRow(db, id), o = JSON.parse(oRow.document);
    if (['cancelled', 'failed'].includes(status) && o.paymentId && o.status === 'confirmed')
        return fail(409, 'PAYMENT_CHANGED', 'Payment completed during cancellation. Request cancellation again to receive a refund.');
    if (['refunded', 'cancelled', 'failed'].includes(o.status))
        return o;
    const eRow = await eventRow(db, o.eventId), seats = cleanInventory(JSON.parse(eRow.inventory));
    for (const s of seats)
        if (s.orderId === id)
            s.orderId = null;
    o.status = status;
    o.refundId = refundId || o.refundId;
    o.cancelledAt = stamp();
    try {
        await atomic(db, [db.prepare('UPDATE market_orders SET document=?,status=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(o), status, id, oRow.version), db.prepare('UPDATE market_events SET inventory=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(seats), eRow.id, eRow.version)]);
        return o;
    }
    catch (e) {
        if (tries === 7)
            throw e;
    }
} }
async function captured(db: Store, env: Env, id: string, paymentId: string) { const row = await orderRow(db, id), o = JSON.parse(row.document); if (o.paymentId && o.paymentId !== paymentId)
    return fail(409, 'PAYMENT_CONFLICT', 'A different payment is already recorded.'); if (o.status === 'confirmed')
    return o; if (['cancelled', 'failed', 'refunded', 'refund_pending'].includes(o.status)) {
    const k = keys(env, o.event);
    if (k) {
        const refund = await refundPayment(k, paymentId, o.amount, id);
        return changeOrder(db, id, x => { x.paymentId = paymentId; x.refundId = refund.id; x.status = refund.status === 'processed' ? 'refunded' : 'refund_pending'; });
    }
    return o;
} const updated = await changeOrder(db, id, x => { if (x.status !== 'pending')
    return false; x.status = 'confirmed'; x.paymentId = paymentId; x.paidAt = stamp(); }); if (updated.status !== 'confirmed')
    return captured(db, env, id, paymentId); return updated; }
async function signQR(id: string, secret: string) { const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return hex(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(id)))); }
export async function handleMarket(request: Request, env: Env): Promise<Response> {
    try {
        if (!env.DB)
            return json({ error: { code: 'DATABASE_UNAVAILABLE', message: 'The database is being connected. Please try again shortly.' } }, 503);
        const db = env.DB, url = new URL(request.url), p = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean), method = request.method;
        if (p[0] !== 'auth' && request.headers.get('Authorization') && env.verifyAccess) {
            try {
                env.verifyAccess(request.headers.get('Authorization')!.replace(/^Bearer /, ''));
            }
            catch {
                return fail(401, 'UNAUTHORIZED', 'Your access token has expired. Please sign in again.');
            }
        }
        await rate(db, 'api:' + (request.headers.get('cf-connecting-ip') || 'visitor'), 400);
        if (p[0] === 'health')
            return json({ status: 'ok', service: 'ticketrush', version: 2, storage: env.leases ? 'postgresql' : 'hosted', transport: env.leases ? 'socketio' : 'polling', paymentMode: keys(env) ? 'razorpay' : 'sandbox' });
        if (p[0] === 'media' && method === 'GET') {
            if (!env.BUCKET || !p[1] || !/^[a-f0-9-]+\.(jpg|png|webp)$/.test(p[1]))
                return fail(404, 'NOT_FOUND', 'Image not found.');
            const file = await env.BUCKET.get(p[1]);
            if (!file)
                return fail(404, 'NOT_FOUND', 'Image not found.');
            return new Response(file.body, { headers: { 'Content-Type': file.httpMetadata?.contentType || 'application/octet-stream', 'Cache-Control': 'public,max-age=31536000,immutable', 'X-Content-Type-Options': 'nosniff' } });
        }
        if (p[0] === 'uploads' && method === 'POST') {
            const u = await account(db, request, 'organiser');
            await rate(db, 'uploads:' + u.id, 20);
            if (!env.BUCKET)
                return fail(503, 'UPLOADS_UNAVAILABLE', 'Image uploads are temporarily unavailable.');
            const bytes = await readBytes(request, 5 * 1024 * 1024), kind = imageType(bytes), name = uid() + '.' + kind.ext;
            await env.BUCKET.put(name, bytes, { httpMetadata: { contentType: kind.mime }, customMetadata: { owner: u.id } });
            return json({ url: '/api/media/' + name }, 201);
        }
        if (p[0] === 'auth') {
            await rate(db, 'auth:' + (request.headers.get('cf-connecting-ip') || 'visitor'), 30);
            const b = method === 'POST' ? await readJSON(request) : {};
            if (p[1] === 'me')
                return json({ user: await account(db, request) });
            if (p[1] === 'register' || p[1] === 'login') {
                const email = text(b.email, 254, 3).toLowerCase(), password = typeof b.password === 'string' && b.password.length >= 10 && b.password.length <= 128 ? b.password : fail(400, 'INVALID_PASSWORD', 'Use a password between 10 and 128 characters.'), role = b.role === 'organiser' ? 'organiser' : 'attendee';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                    return fail(400, 'INVALID_EMAIL', 'Enter a valid email address.');
                let user: any;
                if (p[1] === 'register') {
                    const name = text(b.name, 100, 2), organization = role === 'organiser' ? text(b.organization, 150, 2) : '';
                    user = { id: uid(), name, email, role, organization };
                    try {
                        await db.prepare('INSERT INTO market_accounts(id,email,name,password_hash,role,organization,created_at) VALUES(?,?,?,?,?,?,?)').bind(user.id, email, name, await passwordHash(password), role, organization, stamp()).run();
                    }
                    catch {
                        return fail(409, 'EMAIL_EXISTS', 'This email is already registered. Sign in instead.');
                    }
                }
                else {
                    const a: any = await db.prepare('SELECT * FROM market_accounts WHERE email=?').bind(email).first();
                    if (!a || !safeEqual(await passwordHash(password, a.password_hash.split(':')[0]), a.password_hash))
                        return fail(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
                    if (a.role !== role)
                        return fail(403, 'WRONG_PORTAL', `This is an ${a.role} account. Switch to the ${a.role} sign-in.`);
                    user = { id: a.id, name: a.name, email: a.email, role: a.role, organization: a.organization };
                }
                return json(await issue(db, user, uid(), env.signAccess), p[1] === 'register' ? 201 : 200);
            }
            if (p[1] === 'refresh') {
                const hash = await sha(text(b.refreshToken, 200, 32)), s: any = await db.prepare("SELECT * FROM market_sessions WHERE hash=? AND kind='refresh'").bind(hash).first();
                if (!s || s.expires_at < now())
                    return fail(401, 'INVALID_REFRESH', 'Please sign in again.');
                if (s.revoked) {
                    await db.prepare('UPDATE market_sessions SET revoked=1 WHERE family=?').bind(s.family).run();
                    return fail(401, 'INVALID_REFRESH', 'This session was reused. Please sign in again.');
                }
                const used = await db.prepare('UPDATE market_sessions SET revoked=1 WHERE hash=? AND revoked=0').bind(hash).run();
                if (used.meta.changes !== 1)
                    return fail(401, 'INVALID_REFRESH', 'Please sign in again.');
                const a: any = await db.prepare('SELECT * FROM market_accounts WHERE id=?').bind(s.user_id).first();
                return json(await issue(db, { id: a.id, name: a.name, email: a.email, role: a.role, organization: a.organization }, s.family, env.signAccess));
            }
            if (p[1] === 'logout') {
                const s: any = await db.prepare('SELECT family FROM market_sessions WHERE hash=?').bind(await sha(text(b.refreshToken, 200, 32))).first();
                if (s)
                    await db.prepare('UPDATE market_sessions SET revoked=1 WHERE family=?').bind(s.family).run();
                return new Response(null, { status: 204 });
            }
        }
        if (p[0] === 'organiser') {
            const user = await account(db, request, 'organiser');
            const all = await db.prepare('SELECT * FROM market_events WHERE owner_id=? ORDER BY created_at DESC').bind(user.id).all<Row>();
            if (p[1] === 'events' && p[3] === 'attendees') {
                if (!all.results.some(e => e.id === p[2]))
                    return fail(404, 'EVENT_NOT_FOUND', 'Event not found.');
                const orders = await db.prepare("SELECT document FROM market_orders WHERE event_id=? AND status IN ('confirmed','refund_pending','refunded') ORDER BY created_at DESC LIMIT 1000").bind(p[2]).all<{
                    document: string;
                }>();
                return json({ attendees: orders.results.map(r => { const o = JSON.parse(r.document); return { orderId: o.id, name: o.contact.name, email: o.contact.email, phone: o.contact.phone, seats: o.seatLabels, amount: o.amount, status: o.status, paymentMode: o.paymentMode, createdAt: o.createdAt }; }) });
            }
            const ids = all.results.map(r => r.id);
            const o = ids.length ? await db.prepare(`SELECT document FROM market_orders WHERE event_id IN (${ids.map(() => '?').join(',')}) ORDER BY created_at DESC LIMIT 2000`).bind(...ids).all<{
                document: string;
            }>() : { results: [] };
            const orders = o.results.map(r => JSON.parse(r.document));
            const evs = all.results.map(publicEvent);
            return json({ events: evs, stats: { totalEvents: evs.length, published: evs.filter(e => e.status === 'published').length, ticketsSold: orders.filter(o => o.status === 'confirmed').reduce((n, o) => n + o.seats.length, 0), grossSales: orders.filter(o => o.status === 'confirmed').reduce((n, o) => n + o.amount, 0) }, recentOrders: orders.slice(0, 8).map(o => ({ id: o.id, eventTitle: o.event.title, name: o.contact.name, seats: o.seatLabels, status: o.status, amount: o.amount, paymentMode: o.paymentMode, createdAt: o.createdAt })), gateway: { configured: !!keys(env), mode: keys(env) ? (env.RAZORPAY_KEY_ID!.startsWith('rzp_live_') ? 'live' : 'test') : 'sandbox' } });
        }
        if (p[0] === 'events' && p.length === 1 && method === 'GET') {
            await seed(db);
            const rows = await db.prepare("SELECT * FROM market_events WHERE status='published' AND starts_at>? ORDER BY starts_at LIMIT 250").bind(stamp()).all<Row>();
            let events = rows.results.map(publicEvent);
            const q = (url.searchParams.get('q') || '').toLowerCase(), city = url.searchParams.get('city'), category = url.searchParams.get('category');
            if (q)
                events = events.filter(e => (e.title + ' ' + e.venue + ' ' + e.description).toLowerCase().includes(q));
            if (city && city !== 'All cities')
                events = events.filter(e => e.city === city);
            if (category && category !== 'All events')
                events = events.filter(e => e.category === category);
            return json({ events });
        }
        if (p[0] === 'events' && p.length === 1 && method === 'POST') {
            const u = await account(db, request, 'organiser');
            await rate(db, 'create:' + u.id, 20);
            const d = eventData(await readJSON(request)), e = { ...d, id: uid(), ownerId: u.id, organizerName: u.organization || u.name, isDemo: false, createdAt: stamp() };
            await db.prepare('INSERT INTO market_events(id,owner_id,status,starts_at,city,document,inventory,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(e.id, u.id, e.status, e.startsAt, e.city, JSON.stringify(e), JSON.stringify(makeInventory(e)), e.createdAt).run();
            return json({ ...e, available: e.capacity, sold: 0 }, 201);
        }
        if (p[0] === 'events' && p[1]) {
            const row = await eventRow(db, p[1]);
            if (method === 'PATCH') {
                const u = await account(db, request, 'organiser');
                if (row.owner_id !== u.id)
                    return fail(404, 'EVENT_NOT_FOUND', 'Event not found.');
                const d = eventData(await readJSON(request)), old = JSON.parse(row.document), seats = cleanInventory(JSON.parse(row.inventory)), busy = seats.some((s: any) => s.orderId || s.holdId);
                if (busy && JSON.stringify(d.tiers) !== JSON.stringify(old.tiers))
                    return fail(409, 'INVENTORY_IN_USE', 'Ticket tiers cannot change while bookings or active holds exist. Other event details can still be edited.');
                const e = { ...old, ...d, updatedAt: stamp() };
                const result = await db.prepare('UPDATE market_events SET document=?,inventory=?,status=?,starts_at=?,city=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(e), JSON.stringify(busy ? seats : makeInventory(e)), e.status, e.startsAt, e.city, e.id, row.version).run();
                if (result.meta.changes !== 1)
                    return fail(409, 'TRY_AGAIN', 'The event changed. Refresh and try again.');
                return json({ ...e, available: e.capacity, sold: 0 });
            }
            if (row.status !== 'published') {
                const u = await account(db, request, 'organiser');
                if (row.owner_id !== u.id)
                    return fail(404, 'EVENT_NOT_FOUND', 'Event not found.');
            }
            if (p[2] === 'seats') {
                const seats = cleanInventory(JSON.parse(row.inventory));
                return json({ seats: seats.map((s: any) => ({ id: s.id, label: s.label, tierId: s.tierId, tierName: s.tierName, price: s.price, status: s.orderId ? 'booked' : s.holdId ? 'held' : 'available' })), version: row.version, serverTime: now() });
            }
            return json(publicEvent(row));
        }
        if (p[0] === 'holds') {
            const u = await account(db, request, 'attendee');
            await rate(db, 'hold:' + u.id, 30);
            if (method === 'POST') {
                const b = await readJSON(request), ids = b.seatIds;
                if (!Array.isArray(ids) || ids.length < 1 || ids.length > 6 || new Set(ids).size !== ids.length)
                    return fail(400, 'INVALID_SEATS', 'Select 1–6 distinct seats.');
                for (let attempt = 0; attempt < 8; attempt++) {
                    const row = await eventRow(db, text(b.eventId, 50)), e = JSON.parse(row.document), seats = cleanInventory(JSON.parse(row.inventory));
                    if (row.status !== 'published' || Date.parse(e.bookingDeadline) <= now())
                        return fail(409, 'SALES_CLOSED', 'Ticket sales are closed for this event.');
                    const chosen = seats.filter((s: any) => ids.includes(s.id));
                    if (chosen.length !== ids.length || chosen.some((s: any) => s.orderId || s.holdId))
                        return fail(409, 'SEAT_UNAVAILABLE', 'A selected seat was just reserved. Please choose another.');
                    const holdId = uid(), expiresAt = now() + 300000;
                    for (const s of chosen) {
                        s.holdId = holdId;
                        s.userId = u.id;
                        s.expiresAt = expiresAt;
                    }
                    if (env.leases && !await env.leases.acquire(ids, holdId, 300000))
                        return fail(409, 'SEAT_UNAVAILABLE', 'A selected seat is being reserved. Please choose another.');
                    let r;
                    try {
                        r = await db.prepare('UPDATE market_events SET inventory=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(seats), row.id, row.version).run();
                    }
                    catch (err) {
                        await env.leases?.release(ids, holdId).catch(() => { });
                        throw err;
                    }
                    if (r.meta.changes === 1) {
                        env.publish?.(row.id).catch(() => { });
                        return json({ id: holdId, eventId: row.id, seatIds: ids, expiresAt }, 201);
                    }
                    await env.leases?.release(ids, holdId).catch(() => { });
                }
                return fail(409, 'TRY_AGAIN', 'A lot of people are booking. Please try again.');
            }
            if (method === 'DELETE') {
                const eventId = url.searchParams.get('eventId');
                if (!eventId)
                    return fail(400, 'EVENT_REQUIRED', 'An event identifier is required.');
                for (let i = 0; i < 8; i++) {
                    const r = await eventRow(db, eventId), seats = cleanInventory(JSON.parse(r.inventory));
                    const releasedIds = seats.filter((s: any) => s.holdId === p[1] && s.userId === u.id).map((s: any) => s.id);
                    for (const s of seats)
                        if (s.holdId === p[1] && s.userId === u.id) {
                            s.holdId = null;
                            s.userId = null;
                            s.expiresAt = 0;
                        }
                    const result = await db.prepare('UPDATE market_events SET inventory=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(seats), r.id, r.version).run();
                    if (result.meta.changes === 1) {
                        await env.leases?.release(releasedIds, p[1]).catch(() => {});
                        env.publish?.(r.id).catch(() => {});
                        return new Response(null, { status: 204 });
                    }
                }
                return fail(409, 'TRY_AGAIN', 'Try releasing your seats again.');
            }
        }
        if (p[0] === 'orders' && method === 'POST' && p.length === 1) {
            const u = await account(db, request, 'attendee'), b = await readJSON(request), key = text(request.headers.get('Idempotency-Key'), 100, 8), contact = contactData(b.contact), fingerprint = await sha(JSON.stringify({ eventId: b.eventId, holdId: b.holdId, contact }));
            for (let i = 0; i < 8; i++) {
                const existing: any = await db.prepare('SELECT document FROM market_orders WHERE user_id=? AND idempotency_key=?').bind(u.id, key).first();
                if (existing) {
                    const o = JSON.parse(existing.document);
                    if (o.requestHash !== fingerprint)
                        return fail(409, 'IDEMPOTENCY_CONFLICT', 'This booking key was already used with different details.');
                    return json(o);
                }
                const r = await eventRow(db, text(b.eventId, 50)), e = JSON.parse(r.document), seats = cleanInventory(JSON.parse(r.inventory)), chosen = seats.filter((s: any) => s.holdId === b.holdId && s.userId === u.id && !s.orderId);
                if (!chosen.length || chosen.some((s: any) => s.expiresAt <= now()))
                    return fail(409, 'HOLD_EXPIRED', 'Your seat reservation expired. Please choose seats again.');
                const id = uid(), o = { id, userId: u.id, eventId: r.id, holdId: b.holdId, requestHash: fingerprint, event: e, seats: chosen.map((s: any) => ({ id: s.id, label: s.label, tierName: s.tierName, price: s.price, ticketId: uid() })), seatLabels: chosen.map((s: any) => s.label), amount: chosen.reduce((n: number, s: any) => n + s.price, 0), currency: 'INR', contact, status: 'pending', paymentMode: chosen.reduce((n: number, s: any) => n + s.price, 0) === 0 ? 'free' : keys(env, e) ? 'razorpay' : 'sandbox', gatewayOrderId: null, paymentId: null, createdAt: stamp(), checkoutDeadline: now() + 15 * 60000 };
                for (const s of chosen) {
                    s.orderId = id;
                    s.holdId = null;
                    s.userId = null;
                    s.expiresAt = 0;
                }
                try {
                    await atomic(db, [db.prepare('UPDATE market_events SET inventory=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(seats), r.id, r.version), db.prepare('INSERT INTO market_orders(id,user_id,event_id,status,idempotency_key,document,created_at) VALUES(?,?,?,?,?,?,?)').bind(id, u.id, r.id, 'pending', key, JSON.stringify(o), o.createdAt)]);
                    await env.leases?.release(chosen.map((s: any) => s.id), b.holdId).catch(() => { });
                    env.publish?.(r.id).catch(() => { });
                    return json(o, 202);
                }
                catch (e) {
                    if (i === 7)
                        throw e;
                }
            }
        }
        if (p[0] === 'orders' && method === 'GET' && p.length === 1) {
            const u = await account(db, request, 'attendee');
            const r = await db.prepare('SELECT document FROM market_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(u.id).all<{
                document: string;
            }>();
            return json({ orders: r.results.map(r => JSON.parse(r.document)) });
        }
        if (p[0] === 'orders' && p[1]) {
            const { order: o } = await ownOrder(db, request, p[1]);
            if (p[2] === 'cancel' && method === 'POST') {
                if (['refunded', 'cancelled', 'failed'].includes(o.status))
                    return json(o);
                if (o.event.refundPolicy === 'none' && o.status === 'confirmed')
                    return fail(409, 'NON_REFUNDABLE', 'This event’s tickets are non-refundable.');
                const cutoff = o.event.refundPolicy === '24-hours' ? 86400000 : 0;
                if (o.status === 'confirmed' && Date.parse(o.event.startsAt) - now() < cutoff)
                    return fail(409, 'CANCELLATION_CLOSED', 'The cancellation window has closed.');
                let refund: any;
                if (o.paymentId && o.paymentMode === 'razorpay') {
                    const k = keys(env, o.event);
                    if (!k)
                        return fail(503, 'PAYMENTS_UNAVAILABLE', 'Payment configuration is unavailable.');
                    refund = await refundPayment(k, o.paymentId, o.amount, o.id);
                }
                const cancelled = await releaseOrder(db, o.id, o.paymentId ? (refund && refund.status !== 'processed' ? 'refund_pending' : 'refunded') : 'cancelled', refund?.id);
                env.publish?.(o.eventId).catch(() => { });
                return json(cancelled);
            }
            return json(o);
        }
        if (p[0] === 'payments' && p[1] === 'webhook' && method === 'POST') {
            const raw = new TextDecoder().decode(await readBytes(request, 262144));
            if (!env.RAZORPAY_WEBHOOK_SECRET || !signatureMatches(raw, request.headers.get('x-razorpay-signature') || '', env.RAZORPAY_WEBHOOK_SECRET))
                return fail(400, 'INVALID_SIGNATURE', 'Webhook signature is invalid.');
            let b: any;
            try {
                b = JSON.parse(raw);
            }
            catch {
                return fail(400, 'INVALID_JSON', 'Invalid webhook.');
            }
            const payment = b.payload?.payment?.entity;
            if (['payment.captured', 'order.paid'].includes(b.event) && payment?.order_id) {
                const row: any = await db.prepare("SELECT * FROM market_orders WHERE json_extract(document,'$.gatewayOrderId')=? LIMIT 1").bind(payment.order_id).first();
                if (row) {
                    const o = JSON.parse(row.document), k = keys(env, o.event);
                    if (k) {
                        await verifyCapturedPayment(k, o.gatewayOrderId, payment.id, o.amount);
                        await captured(db, env, o.id, payment.id);
                    }
                }
            }
            if (b.event === 'refund.processed') {
                const refund = b.payload?.refund?.entity;
                const row: any = await db.prepare("SELECT * FROM market_orders WHERE json_extract(document,'$.refundId')=? LIMIT 1").bind(refund?.id || '').first();
                if (row)
                    await changeOrder(db, row.id, o => { if (o.status === 'refund_pending')
                        o.status = 'refunded'; });
            }
            return json({ received: true });
        }
        if (p[0] === 'payments' && p[1]) {
            const { order: o, user } = await ownOrder(db, request, p[1]);
            if (p[2] === 'checkout' && method === 'POST') {
                if (o.status !== 'pending')
                    return fail(409, 'ORDER_NOT_PENDING', 'This order is no longer awaiting payment.');
                if (o.checkoutDeadline < now())
                    return fail(409, 'CHECKOUT_EXPIRED', 'Checkout expired. Cancel this order to release the seats, then book again.');
                if (o.paymentMode === 'free')
                    return json({ provider: 'free', order: await captured(db, env, o.id, 'free-' + o.id) });
                if (o.paymentMode === 'sandbox')
                    return json({ provider: 'sandbox', amount: o.amount, currency: 'INR', orderId: o.id });
                const k = keys(env, o.event);
                if (!k)
                    return fail(503, 'PAYMENTS_UNAVAILABLE', 'The payment gateway is not configured.');
                let gatewayOrderId = o.gatewayOrderId;
                if (!gatewayOrderId) {
                    const gateway = await razorRequest(k, '/orders', 'POST', { amount: o.amount, currency: 'INR', receipt: o.id, notes: { ticketRushOrderId: o.id }, partial_payment: false });
                    const stored = await changeOrder(db, o.id, x => { if (x.gatewayOrderId)
                        return false; x.gatewayOrderId = gateway.id; });
                    gatewayOrderId = stored.gatewayOrderId;
                }
                return json({ provider: 'razorpay', key: k.keyId, order_id: gatewayOrderId, amount: o.amount, currency: 'INR', name: 'TicketRush', description: o.event.title, prefill: { name: o.contact.name, email: o.contact.email, contact: o.contact.phone }, testMode: k.keyId.startsWith('rzp_test_') });
            }
            if (p[2] === 'test' && method === 'POST') {
                if (o.paymentMode !== 'sandbox')
                    return fail(403, 'TEST_DISABLED', 'Test confirmation is disabled for gateway orders.');
                const b = await readJSON(request);
                if (b.outcome === 'failure') {
                    if (o.status !== 'pending')
                        return fail(409, 'ORDER_NOT_PENDING', 'This order is no longer awaiting payment.');
                    return json(await releaseOrder(db, o.id, 'failed'));
                }
                if (b.outcome !== 'success')
                    return fail(400, 'INVALID_OUTCOME', 'Choose a test outcome.');
                return json(await captured(db, env, o.id, 'sandbox-' + o.id));
            }
            if (p[2] === 'verify' && method === 'POST') {
                if (o.paymentMode !== 'razorpay' || !o.gatewayOrderId)
                    return fail(409, 'INVALID_PAYMENT', 'Create a payment checkout first.');
                const b = await readJSON(request), k = keys(env, o.event);
                if (!k)
                    return fail(503, 'PAYMENTS_UNAVAILABLE', 'Payment gateway configuration is unavailable.');
                if (b.razorpay_order_id !== o.gatewayOrderId)
                    return fail(400, 'INVALID_PAYMENT', 'Payment belongs to another order.');
                await verifyCapturedPayment(k, o.gatewayOrderId, text(b.razorpay_payment_id, 100, 5), o.amount, text(b.razorpay_signature, 64, 64));
                return json(await captured(db, env, o.id, b.razorpay_payment_id));
            }
        }
        if (p[0] === 'tickets' && p[1]) {
            const u = await account(db, request, 'attendee');
            const rows = await db.prepare("SELECT document FROM market_orders WHERE user_id=? AND status='confirmed'").bind(u.id).all<{
                document: string;
            }>();
            for (const row of rows.results) {
                const o = JSON.parse(row.document), ticket = o.seats.find((s: any) => s.ticketId === p[1]);
                if (ticket)
                    return json({ ticketId: ticket.ticketId, orderId: o.id, event: o.event, seat: ticket.label, name: o.contact.name, paymentMode: o.paymentMode, qrPayload: env.TICKET_SECRET ? ticket.ticketId + ':' + await signQR(ticket.ticketId, env.TICKET_SECRET) : JSON.stringify({ ticket: ticket.ticketId, order: o.id, event: o.eventId, seat: ticket.label }) });
            }
            return fail(404, 'TICKET_NOT_FOUND', 'This ticket is unavailable or has been cancelled.');
        }
        return fail(404, 'NOT_FOUND', 'This endpoint could not be found.');
    }
    catch (e: any) {
        if (e instanceof MarketError)
            return json({ error: { code: e.code, message: e.message } }, e.status);
        if (e?.name === 'GatewayError')
            return json({ error: { code: 'PAYMENT_ERROR', message: e.message } }, e.retryable ? 503 : 400);
        console.error('Market API error', e?.message);
        return json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } }, 500);
    }
}
