import './setup';
import request from 'supertest';
import { makeApp } from '../src/app';
import { pool, connectRedis, shutdownInfra } from '../src/infra';
import { migrate } from '../src/migrate';
import { config } from '../src/config';
import jwt from 'jsonwebtoken';
const integration = process.env.RUN_INTEGRATION === '1' ? describe : describe.skip;
integration('Marketplace with real PostgreSQL and Redis', () => {
    const app = makeApp();
    let org: any, buyer: any;
    beforeAll(async () => { if (!config.DATABASE_URL.includes('_test'))
        throw new Error('Dedicated _test database required'); await connectRedis(); await migrate(); for (const role of ['organiser', 'attendee']) {
        const r = await request(app).post('/api/auth/register').send({ name: 'Integration User', email: crypto.randomUUID() + '@example.com', password: 'TestPassword2026!', role, organization: 'Integration Events' }).expect(201);
        if (role === 'organiser')
            org = r.body;
        else
            buyer = r.body;
    } });
    afterAll(async () => shutdownInfra());
    test('issues JWTs for distinct roles and prevents attendee publishing', async () => { const claims = jwt.verify(buyer.accessToken, config.JWT_SECRET, { algorithms: ['HS256'], issuer: 'ticketrush', audience: 'ticketrush-api' }) as any; expect(claims.role).toBe('attendee'); await request(app).post('/api/events').set('Authorization', 'Bearer ' + buyer.accessToken).send({}).expect(403); });
    test('serializes overlapping holds and idempotent orders, then records confirmation in the outbox', async () => { const startsAt = new Date(Date.now() + 4 * 86400000).toISOString(), endsAt = new Date(Date.now() + 4 * 86400000 + 3600000).toISOString(); const e = await request(app).post('/api/events').set('Authorization', 'Bearer ' + org.accessToken).send({ title: 'Concurrent market event', description: 'A real PostgreSQL and Redis transactional inventory test.', category: 'Music', venue: 'Integration Venue', address: 'Integration address', city: 'Test City', startsAt, endsAt, coverUrl: '/assets/concert.jpg', status: 'published', tiers: [{ id: 'one', name: 'Last seat', quantity: 1, price: 10000, description: '' }] }).expect(201); const seats = await request(app).get('/api/events/' + e.body.id + '/seats').expect(200); const holds = await Promise.all(Array.from({ length: 10 }, () => request(app).post('/api/holds').set('Authorization', 'Bearer ' + buyer.accessToken).send({ eventId: e.body.id, seatIds: [seats.body.seats[0].id] }))); expect(holds.filter(h => h.status === 201)).toHaveLength(1); expect(holds.filter(h => h.status === 409)).toHaveLength(9); const hold = holds.find(h => h.status === 201)!; const orders = await Promise.all(Array.from({ length: 5 }, () => request(app).post('/api/orders').set('Authorization', 'Bearer ' + buyer.accessToken).set('Idempotency-Key', 'integration-' + e.body.id).send({ eventId: e.body.id, holdId: hold.body.id, contact: { name: 'Test Attendee', email: 'test@example.com', phone: '9876543210' } }))); expect(orders.every(o => [200, 202].includes(o.status))).toBe(true); expect(new Set(orders.map(o => o.body.id)).size).toBe(1); const paid = await request(app).post('/api/payments/' + orders[0].body.id + '/test').set('Authorization', 'Bearer ' + buyer.accessToken).send({ outcome: 'success' }).expect(200); expect(paid.body.status).toBe('confirmed'); const outbox = await pool.query('SELECT count(*) FROM market_outbox WHERE order_id=$1', [paid.body.id]); expect(Number(outbox.rows[0].count)).toBe(1); });
});
