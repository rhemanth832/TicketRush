import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import path from 'node:path';
import { handleMarket } from './marketplace/hosted';
import { marketEnv } from './market-adapter';
import { config } from './config';
import { openapi } from './openapi';
export { authInput, eventInput } from './legacy-app';
export function makeApp() { const app = express(); app.disable('x-powered-by'); app.set('trust proxy', false); app.use(helmet({ contentSecurityPolicy: { directives: { ...helmet.contentSecurityPolicy.getDefaultDirectives(), "img-src": ["'self'", "data:", "blob:", "https:"], "script-src": ["'self'", "https://checkout.razorpay.com"], "connect-src": ["'self'", "https://*.razorpay.com", "wss:"], "frame-src": ["https://*.razorpay.com"], "style-src": ["'self'", "'unsafe-inline'"] } } })); app.use(cors({ origin: config.CORS_ORIGIN.split(',') })); app.get('/api/openapi.json', (_req, res) => res.json(openapi)); app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi)); app.use('/api', express.raw({ type: () => true, limit: '5mb' }), async (req: Request, res: Response, next: NextFunction) => { try {
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers))
        if (typeof v === 'string')
            headers.set(k, v);
    headers.set('cf-connecting-ip', req.ip || 'local');
    const body = Buffer.isBuffer(req.body) && req.body.length ? req.body : undefined;
    const request = new globalThis.Request('http://localhost' + req.originalUrl, { method: req.method, headers, ...(body ? { body: new Uint8Array(body) } : {}) });
    const reply = await handleMarket(request, marketEnv());
    res.status(reply.status);
    reply.headers.forEach((v, k) => res.set(k, v));
    res.send(Buffer.from(await reply.arrayBuffer()));
}
catch (e) {
    next(e);
} }); app.use(express.static(path.resolve(__dirname, '../../public'))); app.use((err: any, _req: Request, res: Response, _next: NextFunction) => { console.error('Request error', err.message); res.status(err.status === 413 ? 413 : 500).json({ error: { code: 'REQUEST_ERROR', message: err.status === 413 ? 'Upload an image under 5 MB.' : 'The request could not be completed.' } }); }); return app; }
