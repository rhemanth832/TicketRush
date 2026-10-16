import { createHmac, timingSafeEqual } from 'node:crypto';
export type GatewayKeys = {
    keyId: string;
    keySecret: string;
    webhookSecret?: string;
};
export class GatewayError extends Error {
    constructor(message: string, public retryable = true) { super(message); this.name = 'GatewayError'; }
}
export async function razorRequest(keys: GatewayKeys, path: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}) { const res = await fetch('https://api.razorpay.com/v1' + path, { method, headers: { Authorization: 'Basic ' + Buffer.from(keys.keyId + ':' + keys.keySecret).toString('base64'), 'Content-Type': 'application/json', ...headers }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(12000) }); const data: any = await res.json(); if (!res.ok)
    throw new GatewayError(data.error?.description || 'The payment provider could not complete this request.', res.status >= 500 || res.status === 429 || res.status === 409); return data; }
export function signatureMatches(data: string, signature: string, secret: string) { if (!/^[a-f0-9]{64}$/i.test(signature))
    return false; const expected = createHmac('sha256', secret).update(data).digest(); return timingSafeEqual(expected, Buffer.from(signature, 'hex')); }
export async function verifyCapturedPayment(keys: GatewayKeys, serverOrderId: string, paymentId: string, amount: number, signature?: string) { if (signature && !signatureMatches(serverOrderId + '|' + paymentId, signature, keys.keySecret))
    throw new GatewayError('Payment signature is invalid.', false); const payment = await razorRequest(keys, '/payments/' + encodeURIComponent(paymentId)); if (payment.order_id !== serverOrderId || payment.amount !== amount || payment.currency !== 'INR')
    throw new GatewayError('Payment does not match this order.', false); if (payment.status !== 'captured')
    throw new GatewayError('Payment has not been captured yet. Your order remains pending.', true); return payment; }
export async function refundPayment(keys: GatewayKeys, paymentId: string, amount: number, orderId: string) { return razorRequest(keys, '/payments/' + encodeURIComponent(paymentId) + '/refund', 'POST', { amount, speed: 'normal', receipt: orderId }, { 'X-Refund-Idempotency': 'refund-' + orderId }); }
