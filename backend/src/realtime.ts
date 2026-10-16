import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server as HttpServer } from 'node:http';
import { config } from './config';
import { redis } from './infra';
const channel='ticketrush:seat-events';
export async function notify(eventId:string){await redis.publish(channel,JSON.stringify({eventId,at:new Date().toISOString()}));}
export async function setupSockets(server:HttpServer){const io=new Server(server,{cors:{origin:config.CORS_ORIGIN.split(',')},maxHttpBufferSize:1024,pingTimeout:20000});const pub=new Redis(config.REDIS_URL),sub=pub.duplicate(),updates=pub.duplicate();io.adapter(createAdapter(pub,sub));await updates.subscribe(channel);updates.on('message',(_channel,data)=>{try{const update=JSON.parse(data);io.local.to('event:'+update.eventId).emit('seats:changed',update);}catch{}});io.on('connection',socket=>{let joined='',last=0;socket.on('event:join',(id:unknown)=>{if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id)||Date.now()-last<1000)return;last=Date.now();if(joined)socket.leave(joined);joined='event:'+id;socket.join(joined);socket.emit('event:joined',{eventId:id});});});return {io,close:async()=>{await new Promise<void>(r=>io.close(()=>r()));pub.disconnect();sub.disconnect();updates.disconnect();}};}
