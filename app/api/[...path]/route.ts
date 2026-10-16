import { env } from 'cloudflare:workers';
import { handleMarket } from '../../../marketplace/hosted';
export const dynamic = 'force-dynamic';
export const GET = (request: Request) => handleMarket(request, env);
export const POST = (request: Request) => handleMarket(request, env);
export const PATCH = (request: Request) => handleMarket(request, env);
export const DELETE = (request: Request) => handleMarket(request, env);
