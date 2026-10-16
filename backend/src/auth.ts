import { randomBytes,randomUUID,createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { RequestHandler } from 'express';
import { PoolClient } from 'pg';
import { config } from './config';
import { AppError,tx,pool } from './infra';
export type User={id:string;email:string;name:string;role:'user'|'admin'};
declare global{namespace Express{interface Request{user?:User}}}
export const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const access=(u:User)=>jwt.sign({email:u.email,name:u.name,role:u.role},config.JWT_SECRET,{subject:u.id,expiresIn:'15m',issuer:'ticketrush',audience:'ticketrush-api',algorithm:'HS256'});
async function issue(c:PoolClient,u:User,family=randomUUID()){const refreshToken=randomBytes(48).toString('base64url');await c.query("INSERT INTO refresh_tokens(token_hash,user_id,family_id,expires_at) VALUES($1,$2,$3,now()+interval '30 days')",[digest(refreshToken),u.id,family]);return {user:u,accessToken:access(u),refreshToken,expiresIn:900};}
export async function register(name:string,email:string,password:string){const hash=await bcrypt.hash(password,12);try{return await tx(async c=>{const {rows}=await c.query<User>('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role',[name,email.toLowerCase(),hash]);return issue(c,rows[0]);});}catch(e:any){if(e.code==='23505')throw new AppError(409,'EMAIL_EXISTS','An account with this email already exists.');throw e;}}
export async function login(email:string,password:string){const {rows}=await pool.query('SELECT * FROM users WHERE email=$1',[email.toLowerCase()]);const u=rows[0];if(!u||!await bcrypt.compare(password,u.password_hash))throw new AppError(401,'INVALID_CREDENTIALS','Email or password is incorrect.');return tx(c=>issue(c,{id:u.id,name:u.name,email:u.email,role:u.role}));}
export async function refresh(token:string){const result=await tx(async c=>{const {rows}=await c.query('SELECT r.*,u.name,u.email,u.role FROM refresh_tokens r JOIN users u ON u.id=r.user_id WHERE token_hash=$1 FOR UPDATE OF r',[digest(token)]);const r=rows[0];if(!r)return null;if(r.revoked_at){await c.query('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,now()) WHERE family_id=$1',[r.family_id]);return null;}if(new Date(r.expires_at)<=new Date())return null;await c.query('UPDATE refresh_tokens SET revoked_at=now() WHERE token_hash=$1',[digest(token)]);return issue(c,{id:r.user_id,name:r.name,email:r.email,role:r.role},r.family_id);});if(!result)throw new AppError(401,'INVALID_REFRESH','Refresh token is invalid, expired, or has been reused. Sign in again.');return result;}
export async function logout(token:string){await pool.query('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,now()) WHERE family_id=(SELECT family_id FROM refresh_tokens WHERE token_hash=$1)',[digest(token)]);}
export function verifyAccess(token:string):User{const claims=jwt.verify(token,config.JWT_SECRET,{algorithms:['HS256'],issuer:'ticketrush',audience:'ticketrush-api'}) as jwt.JwtPayload;if(typeof claims.sub!=='string')throw new Error('Invalid subject');return {id:claims.sub,name:claims.name,email:claims.email,role:claims.role};}
export const authenticated:RequestHandler=(req,res,next)=>{try{const h=req.headers.authorization;if(!h?.startsWith('Bearer '))throw new Error();req.user=verifyAccess(h.slice(7));next();}catch{next(new AppError(401,'UNAUTHORIZED','A valid access token is required.'));}};
export const admin:RequestHandler=(req,res,next)=>{if(req.user?.role!=='admin')return next(new AppError(403,'FORBIDDEN','Administrator access is required.'));next();};
