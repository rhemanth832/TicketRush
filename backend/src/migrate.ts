import fs from 'node:fs';
import path from 'node:path';
import { pool,tx } from './infra';
export async function migrate(){const sql=fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8');await tx(async c=>{await c.query("SELECT pg_advisory_xact_lock(781237891)");await c.query(sql);});}
if(require.main===module)migrate().then(()=>{console.log('Schema ready');return pool.end();}).then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
