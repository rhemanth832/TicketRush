import { createServer } from 'node:http';
import { config } from './config';
import { connectRedis,shutdownInfra } from './infra';
import { makeApp } from './app';
import { setupSockets } from './realtime';
async function main(){await connectRedis();const server=createServer(makeApp());const sockets=await setupSockets(server);server.listen(config.PORT,()=>console.log(`TicketRush API listening on ${config.PORT}; Swagger at /docs`));const stop=async()=>{await sockets.close();await new Promise<void>(resolve=>server.close(()=>resolve()));await shutdownInfra();process.exit(0);};process.once('SIGTERM',stop);process.once('SIGINT',stop);}
main().catch(e=>{console.error(e);process.exit(1);});
