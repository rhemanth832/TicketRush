import './setup';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { makeLegacyApp as makeApp,eventInput,authInput } from '../src/legacy-app';
import { verifyAccess } from '../src/auth';
import { config } from '../src/config';
import { ticketPayload } from '../src/jobs';
import { createHmac,randomUUID } from 'node:crypto';
const app=makeApp();
describe('Request boundaries',()=>{
 test('rejects privilege escalation in registration data',()=>{expect(()=>authInput.extend({}).parse({email:'you@example.com',password:'LongPassword2026!',role:'admin'})).toThrow();});
 test('requires a strong bounded password',()=>{expect(()=>authInput.parse({email:'you@example.com',password:'short'})).toThrow();expect(()=>authInput.parse({email:'you@example.com',password:'x'.repeat(73)})).toThrow();});
 test('rejects past dates and fractional inventory',()=>{const fixture={slug:'test-event',title:'Test event',description:'A sufficiently descriptive event',category:'Music',venue:'Test venue',city:'Bengaluru',startsAt:'2020-01-01T00:00:00Z',price:49900,capacity:1.5};expect(()=>eventInput.parse(fixture)).toThrow();});
 test('rejects unsigned or wrong-audience access tokens',()=>{const t=jwt.sign({email:'a@b.com'},config.JWT_SECRET,{subject:randomUUID(),audience:'another-app',issuer:'ticketrush'});expect(()=>verifyAccess(t)).toThrow();expect(()=>verifyAccess('not-a-jwt')).toThrow();});
 test('creates verifiable signed QR payloads',()=>{const id=randomUUID(),parts=ticketPayload(id).split(':');expect(parts[0]).toBe('ticketrush');expect(parts[1]).toBe(id);expect(parts[2]).toBe(createHmac('sha256',config.TICKET_SECRET).update(id).digest('base64url'));});
 test('protects order and admin routes before database access',async()=>{if(process.env.RUN_INTEGRATION==='1')return;await request(app).post('/api/orders').send({holdId:randomUUID()}).expect(401);await request(app).post('/api/events').send({}).expect(401);});
 test('validates JSON and auth input without leaking stack traces',async()=>{if(process.env.RUN_INTEGRATION==='1')return;const r=await request(app).post('/api/auth/register').send({name:'J',email:'invalid',password:'bad'}).expect(400);expect(r.body.error.code).toBe('VALIDATION_ERROR');expect(r.body.error.stack).toBeUndefined();await request(app).post('/api/auth/login').set('Content-Type','application/json').send('{').expect(400);});
});
