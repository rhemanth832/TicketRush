import http from 'k6/http';
import { check,sleep } from 'k6';
export const options={stages:[{duration:'20s',target:5},{duration:'30s',target:5},{duration:'10s',target:0}],thresholds:{http_req_failed:['rate<0.01'],http_req_duration:['p(95)<500']}};
export default function(){const r=http.get((__ENV.BASE_URL||'http://localhost:4000')+'/api/events?city=Bengaluru');check(r,{'events load':r=>r.status===200});sleep(2);}
