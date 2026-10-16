export class MarketError extends Error {
    constructor(public status: number, public code: string, message: string) { super(message); }
}
export const fail = (status: number, code: string, msg: string): never => { throw new MarketError(status, code, msg); };
export function text(value: unknown, max = 150, min = 0) { if (typeof value !== 'string' || value.trim().length < min || value.length > max)
    return fail(400, 'VALIDATION_ERROR', `A text field must contain ${min}–${max} characters.`); return value.trim(); }
export function imageURL(v: unknown) { const s = text(v, 2000); if (!s)
    return ''; if (/^\/api\/media\/[a-f0-9-]+\.(jpg|png|webp)$/.test(s) || /^\/assets\/[a-z]+\.jpg$/.test(s))
    return s; try {
    const u = new URL(s);
    if (u.protocol === 'https:' && !u.username && !u.password)
        return u.href;
}
catch { } return fail(400, 'INVALID_IMAGE', 'Use a secure HTTPS image URL or upload a JPEG, PNG, or WebP image.'); }
export type Tier = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description: string;
};
export function eventData(body: any) { if (!body || typeof body !== 'object')
    return fail(400, 'VALIDATION_ERROR', 'Event data is required.'); const title = text(body.title, 150, 3), description = text(body.description, 6000, 20), category = text(body.category, 40); if (!['Music', 'Comedy', 'Sports', 'Arts & Culture', 'Tech & More'].includes(category))
    return fail(400, 'VALIDATION_ERROR', 'Choose an event category.'); const startsAt = text(body.startsAt, 50), endsAt = text(body.endsAt, 50); if (!Number.isFinite(Date.parse(startsAt)) || !Number.isFinite(Date.parse(endsAt)) || Date.parse(endsAt) <= Date.parse(startsAt))
    return fail(400, 'INVALID_DATES', 'End time must be after the event starts.'); if (Date.parse(startsAt) <= Date.now())
    return fail(400, 'INVALID_DATES', 'Choose a future event date.'); const status = body.status === 'draft' ? 'draft' : 'published'; const coverUrl = imageURL(body.coverUrl); if (status === 'published' && !coverUrl)
    return fail(400, 'COVER_REQUIRED', 'Add a cover image before publishing.'); if (!Array.isArray(body.tiers) || !body.tiers.length || body.tiers.length > 6)
    return fail(400, 'INVALID_TIERS', 'Add between 1 and 6 ticket tiers.'); const tiers: Tier[] = body.tiers.map((t: any, i: number) => { const quantity = Number(t.quantity), price = Number(t.price); if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000 || !Number.isInteger(price) || price < 0 || price > 10000000)
    return fail(400, 'INVALID_TIERS', 'Ticket quantities must be whole numbers and prices must be valid paise amounts.'); return { id: typeof t.id === 'string' && /^[a-zA-Z0-9_-]{1,50}$/.test(t.id) ? t.id : 'tier-' + i, name: text(t.name, 70, 2), price, quantity, description: text(t.description || '', 300) }; }); if (new Set(tiers.map(t => t.id)).size !== tiers.length)
    return fail(400, 'INVALID_TIERS', 'Ticket tier identifiers must be unique.'); const capacity = tiers.reduce((n, t) => n + t.quantity, 0); if (capacity > 10000)
    return fail(400, 'INVALID_CAPACITY', 'An event can have up to 10,000 seats.'); if (body.bookingDeadline && !Number.isFinite(Date.parse(body.bookingDeadline)))
    return fail(400, 'INVALID_DATES', 'Choose a valid sales closing date.'); const bookingDeadline = body.bookingDeadline ? new Date(body.bookingDeadline).toISOString() : startsAt; if (Date.parse(bookingDeadline) > Date.parse(startsAt) || Date.parse(bookingDeadline) <= Date.now())
    return fail(400, 'INVALID_DATES', 'Ticket sales must close before the event starts and after now.'); return { title, description, summary: text(body.summary || '', 220), category, venue: text(body.venue, 150, 2), address: text(body.address, 500, 5), city: text(body.city, 100, 2), state: text(body.state || '', 100), postalCode: text(body.postalCode || '', 12), startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), bookingDeadline, timezone: 'Asia/Kolkata', coverUrl, galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls.slice(0, 5).map(imageURL) : [], language: text(body.language || 'English', 80), ageRestriction: text(body.ageRestriction || 'All ages', 50), refundPolicy: ['flexible', '24-hours', 'none'].includes(body.refundPolicy) ? body.refundPolicy : '24-hours', tags: Array.isArray(body.tags) ? body.tags.slice(0, 8).map((x: any) => text(x, 30)) : [], status, tiers, capacity, price: Math.min(...tiers.map(t => t.price)) }; }
export function contactData(d: any) { const name = text(d?.name, 100, 2), email = text(d?.email, 254, 3).toLowerCase(), phone = text(d?.phone || '', 20); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail(400, 'INVALID_CONTACT', 'Enter a valid email address.'); if (phone && !/^[+\d() -]{7,20}$/.test(phone))
    return fail(400, 'INVALID_CONTACT', 'Enter a valid phone number.'); return { name, email, phone }; }
export function imageType(bytes: Uint8Array) { if (bytes.length > 5 * 1024 * 1024 || bytes.length < 12)
    return fail(400, 'INVALID_IMAGE', 'Upload an image up to 5 MB.'); if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return { ext: 'jpg', mime: 'image/jpeg' }; if ([137, 80, 78, 71, 13, 10, 26, 10].every((x, i) => bytes[i] === x))
    return { ext: 'png', mime: 'image/png' }; if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP')
    return { ext: 'webp', mime: 'image/webp' }; return fail(400, 'INVALID_IMAGE', 'Use a JPEG, PNG, or WebP image.'); }
