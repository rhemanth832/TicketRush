import { Worker } from 'bullmq';
import { connectRedis, queueConnection, shutdownInfra } from './infra';
import { dispatchOutbox, processPayment, processRefund, sendConfirmation } from './jobs';
import { dispatchMarketOutbox, sendMarketEmail } from './market-jobs';
import { expireHolds } from './booking';
async function main() { await connectRedis(); const connection = queueConnection(); const worker = new Worker('orders', async (job) => { switch (job.name) {
    case 'market-email': return sendMarketEmail(job.data.orderId);
    case 'payment': return processPayment(job.data.orderId);
    case 'refund': return processRefund(job.data.orderId);
    case 'email': return sendConfirmation(job.data.orderId);
    default: throw new Error('Unknown job ' + job.name);
} }, { connection, concurrency: 10 }); worker.on('failed', (job, err) => console.error('Job failed', { id: job?.id, kind: job?.name, error: err.message })); let busy = false; const tick = async () => { if (busy)
    return; busy = true; try {
    await dispatchOutbox();
    await dispatchMarketOutbox();
    await expireHolds();
}
catch (e) {
    console.error('Worker maintenance error', e);
}
finally {
    busy = false;
} }; await tick(); const timer = setInterval(tick, 1000); const stop = async () => { clearInterval(timer); await worker.close(); connection.disconnect(); await shutdownInfra(); process.exit(0); }; process.once('SIGTERM', stop); process.once('SIGINT', stop); console.log('TicketRush workers ready; simulated payments, SMTP confirmations.'); }
main().catch(e => { console.error(e); process.exit(1); });
