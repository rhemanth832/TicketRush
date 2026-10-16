import { Pool,PoolClient } from 'pg';
import Redis from 'ioredis';
import { Queue } from 'bullmq';
import { config } from './config';
export const pool=new Pool({connectionString:config.DATABASE_URL,max:20,connectionTimeoutMillis:5000,idleTimeoutMillis:30000,statement_timeout:15000});
pool.on('error',err=>console.error('PostgreSQL idle client error',err.message));
export const redis=new Redis(config.REDIS_URL,{maxRetriesPerRequest:1,enableOfflineQueue:false,lazyConnect:true});
redis.on('error',err=>console.error('Redis connection error',err.message));
export const queueConnection=()=>new Redis(config.REDIS_URL,{maxRetriesPerRequest:null});
let queue:Queue|undefined;let bullConnection:Redis|undefined;
export function getOrderQueue(){if(!queue){bullConnection=queueConnection();queue=new Queue('orders',{connection:bullConnection,defaultJobOptions:{attempts:6,backoff:{type:'exponential',delay:1000},removeOnComplete:{age:86400},removeOnFail:{age:604800}}});}return queue;}
export async function tx<T>(fn:(c:PoolClient)=>Promise<T>):Promise<T>{const c=await pool.connect();try{await c.query('BEGIN');const out=await fn(c);await c.query('COMMIT');return out;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
export class AppError extends Error{constructor(public status:number,public code:string,message:string){super(message);}}
export const ensure=(condition:unknown,status:number,code:string,message:string):asserts condition=>{if(!condition)throw new AppError(status,code,message);};
export async function connectRedis(){if(redis.status==='wait')await redis.connect();}
export async function shutdownInfra(){if(queue)await queue.close();bullConnection?.disconnect();await pool.end();redis.disconnect();}
