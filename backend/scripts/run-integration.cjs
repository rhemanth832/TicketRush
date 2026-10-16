const {spawnSync}=require('node:child_process');
const path=require('node:path');
const result=spawnSync(process.execPath,['--experimental-vm-modules',path.join(__dirname,'../node_modules/jest/bin/jest.js'),'--runInBand'],{stdio:'inherit',env:{...process.env,RUN_INTEGRATION:'1'}});
process.exit(result.status??1);
