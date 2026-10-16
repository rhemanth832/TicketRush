'use strict';
const paths = {
    'zap': 'm13 2-9 12h7l-1 8 10-12h-7l1-8Z', 'ticket': 'M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5Zm10 0v3m0 3v2m0 3v3', 'map-pin': 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'chevron-down': 'm6 9 6 6 6-6', 'chevron-right': 'm9 5 7 7-7 7', 'bell': 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4', 'bookmark': 'M6 3h12v18l-6-4-6 4V3Z', 'sparkles': 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7-2v4m-2-2h4', 'calendar': 'M4 5h16v16H4V5Zm3-3v6m10-6v6M4 10h16', 'arrow-up-right': 'M6 18 18 6M6 6h12v12', 'arrow-right': 'M4 12h16m-6-6 6 6-6 6', 'arrow-left': 'M20 12H4m6-6-6 6 6 6', 'arrow-down': 'M12 4v16m-6-6 6 6 6-6', 'search': 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z', 'wallet': 'M20 8V5H4v14h16V8Zm-4 3h5v5h-5v-5Z', 'sliders': 'M4 7h16M4 17h16M8 4v6m8 4v6', 'grid': 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z', 'music': 'M9 18V5l12-3v13M9 8l12-3M9 18a3 3 0 1 1-3-3c2 0 3 1 3 3Zm12-3a3 3 0 1 1-3-3c2 0 3 1 3 3Z', 'mic': 'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5Zm-3 6v1a6 6 0 0 0 12 0v-1m-6 7v4m-3 0h6', 'ball': 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM2 12h20M12 2c-5 5-5 15 0 20m0-20c5 5 5 15 0 20M5 5c8 0 14 6 14 14M5 19C5 11 11 5 19 5', 'palette': 'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-4-5-6-9-6ZM7 8h.01M12 6h.01m5 2h.01M5 13h.01', 'laptop': 'M5 4h14v12H5V4ZM2 20h20l-3-4H5l-3 4Z', 'clock': 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-5v5l3 2', 'shield-check': 'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6l-9-4Zm-4 10 3 3 5-6', 'headphones': 'M4 14v-2a8 8 0 0 1 16 0v2M4 13H2v7h5v-7H4Zm16 0h2v7h-5v-7h3Z', 'x': 'm6 6 12 12M6 18 18 6', 'check': 'm5 12 4 4L19 6', 'code': 'm8 5-7 7 7 7m8-14 7 7-7 7m-3-17-2 20', 'heart': 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z', 'download': 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', 'user': 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2', 'mail': 'M3 5h18v14H3V5Zm0 0 9 8 9-8', 'flame': 'M12 2c1 6 7 7 7 13a7 7 0 1 1-14 0c0-3 1-5 4-8 0 3 1 4 2 5 3-4 2-7 1-10Z'
};
const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.ticket}"/></svg>`;
function icons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => el.outerHTML = icon(el.dataset.icon)); }
const $ = s => document.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupees = n => '₹' + (Number(n || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const dateText = (s, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => s ? new Date(s).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...opts }) : 'Date to be announced';
const timeText = s => s ? new Date(s).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }) : '';
const dateInput = s => { if (!s)
    return ''; const d = new Date(new Date(s).getTime() + 330 * 60000); return d.toISOString().slice(0, 16); };
const toISO = s => new Date(s + '+05:30').toISOString();
let session = null;
try {
    session = JSON.parse(sessionStorage.getItem('tr-market-session'));
}
catch { }
let catalog = [], orders = [], organiserData = null, health = {}, city = localStorage.getItem('tr-market-city') || 'All cities', saved = [];
try {
    saved = JSON.parse(localStorage.getItem('tr-market-saved')) || [];
}
catch { }
let category = 'All events', search = '', when = 'all', price = 'all', sort = 'recommended', expanded = false, toastTimeout, viewVersion = 0, heroIndex = 0, authRegister = false;
let currentSeats = [], selectedSeatIds = [], seatEvent = null, seatTier = 'all', seatPage = 0, hold = null, currentOrder = null, holdTimer = null, seatTimer = null, checkoutContact = null, refreshPromise = null, organiserFilter = 'all';
let editorState = null, editorStep = 0;
const categories = [['All events', 'grid'], ['Music', 'music'], ['Comedy', 'mic'], ['Sports', 'ball'], ['Arts & Culture', 'palette'], ['Tech & More', 'laptop']];
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 4000); }
function go(path) { location.hash = path; }
async function api(path, method = 'GET', body, headers = {}, retry = true) { const isFile = body instanceof File || body instanceof Blob; const r = await fetch('/api' + path, { method, headers: { ...(body && !isFile ? { 'Content-Type': 'application/json' } : {}), ...(isFile ? { 'Content-Type': body.type || 'application/octet-stream' } : {}), ...(session ? { Authorization: 'Bearer ' + session.accessToken } : {}), ...headers }, ...(body ? { body: isFile ? body : JSON.stringify(body) } : {}) }); if (r.status === 401 && session?.refreshToken && retry) {
    if (!refreshPromise)
        refreshPromise = fetch('/api/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: session.refreshToken }) }).then(async (x) => { if (!x.ok)
            throw new Error('Please sign in again.'); session = await x.json(); sessionStorage.setItem('tr-market-session', JSON.stringify(session)); }).finally(() => refreshPromise = null);
    try {
        await refreshPromise;
        return api(path, method, body, headers, false);
    }
    catch {
        session = null;
        sessionStorage.removeItem('tr-market-session');
        updateHeader();
    }
} const data = r.status === 204 ? null : await r.json().catch(() => ({ error: { message: 'The server returned an unexpected response.' } })); if (!r.ok) {
    const error = new Error(data?.error?.message || 'This request could not be completed.');
    error.status = r.status;
    error.code = data?.error?.code;
    throw error;
} return data; }
function modal(html, wide = false) { clearInterval(holdTimer); $('#modal').classList.toggle('checkout-dialog', wide); $('#modal-body').innerHTML = html; icons($('#modal')); if (!$('#modal').open)
    $('#modal').showModal(); }
function closeModal() { clearInterval(holdTimer); clearInterval(seatTimer); $('#modal').close(); }
$('#modal').querySelector('.modal-close').onclick = closeModal;
$('#modal').addEventListener('close', () => { clearInterval(holdTimer); clearInterval(seatTimer); });
$('#modal').addEventListener('click', e => { if (e.target === $('#modal')) {
    const r = $('#modal').getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        closeModal();
} });
function updateHeader() { icons(); $('#city-label').textContent = city; const b = $('#profile-button'); if (session) {
    b.className = 'avatar';
    b.textContent = session.user.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
    b.setAttribute('aria-label', 'Open account');
}
else {
    b.className = 'button blue sign-in';
    b.textContent = 'Sign in';
} $('#ticket-count').textContent = orders.filter(o => o.status === 'confirmed').length || ''; $('.organiser-link').textContent = session?.user.role === 'organiser' ? 'Organiser workspace' : 'For organisers'; const mode = health.paymentMode; $('#payment-mode').textContent = mode === 'razorpay' ? 'Razorpay checkout · Verified payments' : 'Test checkout · No real charges'; }
$('#profile-button').onclick = () => { if (!session)
    return go('login/attendee'); modal(`<div class="modal-pad"><span class="small-kicker">YOUR TICKETRUSH</span><h2 id="modal-title">Hey, ${esc(session.user.name.split(' ')[0])}.</h2><p>${esc(session.user.email)}</p><div class="account-subtitle"><span class="profile-role">${session.user.role === 'organiser' ? 'Event organiser' : 'Attendee'}</span>${esc(session.user.organization || '')}</div><div class="account-menu">${session.user.role === 'organiser' ? `<a href="#organiser">${icon('grid')}Organiser dashboard</a><a href="#organiser/new">${icon('sparkles')}Create an event</a>` : `<a href="#tickets">${icon('ticket')}My tickets</a><a href="#saved">${icon('bookmark')}Saved experiences</a>`}<button id="switch-account">${icon('user')}Switch to ${session.user.role === 'organiser' ? 'attendee' : 'organiser'} sign-in</button><button id="logout" class="logout">Sign out</button></div></div>`); $$('.account-menu a').forEach(a => a.onclick = closeModal); $('#switch-account').onclick = () => { closeModal(); go('login/' + (session.user.role === 'organiser' ? 'attendee' : 'organiser')); }; $('#logout').onclick = async () => { const token = session.refreshToken; await api('/auth/logout', 'POST', { refreshToken: token }).catch(() => { }); session = null; orders = []; organiserData = null; sessionStorage.removeItem('tr-market-session'); updateHeader(); closeModal(); go('discover'); toast('Signed out. See you soon.'); }; };
$('#city-button').onclick = () => { const cities = [...new Set(['All cities', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi NCR', 'Chennai', 'Pune', ...catalog.map(e => e.city)])]; modal(`<div class="modal-pad"><span class="small-kicker">GOOD TIMES, CLOSE TO YOU</span><h2 id="modal-title">Where are we going?</h2><p>Find experiences in your city.</p><div class="city-list">${cities.map(c => `<button class="city-option ${c === city ? 'selected' : ''}" data-city="${esc(c)}">${icon('map-pin')}${esc(c)}</button>`).join('')}</div></div>`); $$('[data-city]').forEach(b => b.onclick = () => { city = b.dataset.city; localStorage.setItem('tr-market-city', city); closeModal(); updateHeader(); if ((location.hash || '#discover') === '#discover')
    renderDiscover();
else
    go('discover'); }); };
function statusPill(status) { const labels = { published: 'Live', draft: 'Draft', pending: 'Awaiting payment', confirmed: 'Confirmed', refund_pending: 'Refund processing', refunded: 'Refunded', cancelled: 'Cancelled', failed: 'Payment failed' }; return `<span class="status-pill ${status}"><i></i>${labels[status] || esc(status)}</span>`; }
function empty(title, description, action = '', href = 'discover') { return `<div class="empty-state no-results">${icon('ticket')}<h3>${title}</h3><p>${description}</p>${action ? `<a class="button blue" href="#${href}">${action} ${icon('arrow-right')}</a>` : ''}</div>`; }
function toggleSaved(id) { saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]; localStorage.setItem('tr-market-saved', JSON.stringify(saved)); toast(saved.includes(id) ? 'Saved. A good plan for later.' : 'Removed from your saved experiences.'); if (location.hash === '#saved')
    renderSaved();
else if (location.hash.startsWith('#event/'))
    renderEvent(catalog.find(e => e.id === id));
else
    renderCards(); }
function card(e) { const date = new Date(e.startsAt); return `<article class="event-card" tabindex="0" role="button" data-event="${e.id}" aria-label="View ${esc(e.title)}"><div class="event-image"><img loading="lazy" src="${esc(e.coverUrl || '/assets/concert.jpg')}" alt="${esc(e.title)}"><span class="event-tag">${e.isDemo ? 'Sample experience' : e.available < 20 ? icon('flame') + 'Selling fast' : 'New experience'}</span><button class="save-event ${saved.includes(e.id) ? 'saved' : ''}" data-save="${e.id}" aria-label="${saved.includes(e.id) ? 'Unsave' : 'Save'} event">${icon('bookmark')}</button><div class="date-tile"><span>${dateText(e.startsAt, { month: 'short' }).toUpperCase()}</span><strong>${dateText(e.startsAt, { day: 'numeric' })}</strong></div><span class="event-time">${icon('clock')}${timeText(e.startsAt)}</span></div><div class="event-details"><div class="event-type">${esc(e.category)}<i></i>${esc(e.language)}</div><h3>${esc(e.title)}</h3><p class="event-location">${icon('map-pin')}${esc(e.venue)}, ${esc(e.city)}</p><div class="event-card-bottom"><div class="event-price">${e.price ? rupees(e.price) : 'Free'}<span>onwards</span></div><span class="availability ${e.available < 30 ? 'limited' : ''}"><i></i>${e.available === 0 ? 'Sold out' : e.available < 30 ? `${e.available} seats left` : 'Tickets available'}</span></div></div></article>`; }
function wireCards() { const root = $('#main-content'); $$('[data-event]', root).forEach(c => { c.onclick = e => { if (!e.target.closest('[data-save]'))
    go('event/' + c.dataset.event); }; c.onkeydown = e => { if (e.target === c && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    go('event/' + c.dataset.event);
} }; }); $$('[data-save]', root).forEach(b => b.onclick = e => { e.stopPropagation(); toggleSaved(b.dataset.save); }); }
function filtered() { let es = catalog.filter(e => (city === 'All cities' || e.city === city) && (category === 'All events' || e.category === category) && `${e.title} ${e.venue} ${e.city} ${e.category}`.toLowerCase().includes(search.toLowerCase()) && (price === 'all' || e.price <= Number(price))); if (when === 'weekend')
    es = es.filter(e => [0, 6].includes(new Date(e.startsAt).getDay())); if (when === 'month')
    es = es.filter(e => new Date(e.startsAt).getMonth() === new Date().getMonth()); if (sort === 'price')
    es.sort((a, b) => a.price - b.price); if (sort === 'date')
    es.sort((a, b) => a.startsAt.localeCompare(b.startsAt)); return es; }
function renderCards() { if (!$('#event-grid'))
    return; const es = filtered(); $('#event-grid').innerHTML = es.length ? (expanded ? es : es.slice(0, 6)).map(card).join('') : empty('No plans here. Yet.', 'Try another city, category, or search.'); $('#result-count').textContent = `${es.length} experiences · Updated live`; $('#view-more').parentElement.style.display = es.length > 6 && !expanded ? 'block' : 'none'; $('#events-heading').innerHTML = category === 'All events' ? 'The city’s talking about these<span class="blue-dot">.</span>' : `${esc(category)} that moves you<span class="blue-dot">.</span>`; wireCards(); }
function renderDiscover() { const es = catalog.filter(e => city === 'All cities' || e.city === city), featured = es.find(e => e.category === 'Music') || es[0] || catalog[0]; $('#main-content').innerHTML = `<section class="intro home-intro content-width"><div><div class="eyebrow"><span class="live-dot"></span> LESS SCROLLING. MORE LIVING.</div><h1>Be there. <span>Feel everything.</span></h1></div><p>Your next “I was there” moment<br>is just a ticket away.</p></section>${featured ? `<section class="hero content-width"><img id="hero-image" src="${esc(featured.coverUrl)}" alt="${esc(featured.title)}"><div class="hero-shade"></div><div class="hero-top"><span class="featured-label">${icon('sparkles')} THE SPOTLIGHT</span><button class="hero-save" id="hero-save" aria-label="Save featured event">${icon('bookmark')}</button></div><div class="hero-content"><span class="hero-kicker">ONE STAGE. A THOUSAND FEELINGS.</span><h2>Some nights<br>stay with you.</h2><p>${esc(featured.title)}</p><div class="hero-meta"><span>${icon('calendar')}${dateText(featured.startsAt, { weekday: 'short', day: 'numeric', month: 'short' })} · ${timeText(featured.startsAt)}</span><span>${icon('map-pin')}${esc(featured.venue)}, ${esc(featured.city)}</span></div><div class="hero-book"><a class="button blue" href="#event/${featured.id}">Get tickets ${icon('arrow-up-right')}</a><span>From <strong>${rupees(featured.price)}</strong></span></div></div><div class="hero-footer"><div class="hero-pages"><span class="activity-dot"></span><span>EXPERIENCE IT LIVE</span></div><span style="font-size:9px;color:#dedee8">${featured.isDemo ? 'Sample experience · Test checkout' : 'Live event · Book your place'}</span></div></section>` : ''}<section class="explore content-width"><div class="section-title"><div><span class="small-kicker">FIND YOUR KIND OF GOOD TIME</span><h2>What moves you?</h2></div><a class="text-link" href="#all-events" id="explore-all">Explore all events ${icon('arrow-right')}</a></div><div class="categories">${categories.map(([name, ic]) => `<button class="category ${name === category ? 'active' : ''}" data-category="${esc(name)}"><span class="category-icon">${icon(ic)}</span><div><h3>${name}</h3><p>${es.filter(e => name === 'All events' || e.category === name).length} experiences</p></div>${icon('chevron-right')}</button>`).join('')}</div></section><section class="events-section content-width" id="all-events"><div class="section-title events-title"><div><span class="small-kicker">MAKE PLANS. MAKE MEMORIES.</span><h2 id="events-heading"></h2></div><span class="subtle" id="result-count"></span></div><div class="filter-bar"><div class="search-box">${icon('search')}<input id="search" type="search" placeholder="Search artists, events, or venues" aria-label="Search events" value="${esc(search)}"><kbd>⌘ K</kbd></div><div class="filters"><label class="filter-select">${icon('calendar')}<select id="date-filter" aria-label="Filter by date"><option value="all">Any date</option><option value="month">This month</option><option value="weekend">Weekends</option></select>${icon('chevron-down')}</label><label class="filter-select">${icon('wallet')}<select id="price-filter" aria-label="Filter by price"><option value="all">Any price</option><option value="100000">Under ₹1,000</option><option value="250000">Under ₹2,500</option><option value="500000">Under ₹5,000</option></select>${icon('chevron-down')}</label><button class="filter-button" id="sort-button">${icon('sliders')} Sort</button></div></div><div class="event-grid" id="event-grid"></div><div class="view-more-wrap"><button class="button outline" id="view-more">A little more to explore ${icon('arrow-down')}</button></div></section><section class="promise content-width"><div class="promise-heading"><span class="promise-mark">${icon('ticket')}</span><h2>Big moments.<br>Zero second thoughts.</h2><p>You bring the excitement.<br>We’ll take care of the tickets.</p></div><div class="promise-item">${icon('shield-check')}<h3>Your seat. Secured.</h3><p>Live inventory. Reserved seats.<br>A little peace of mind.</p></div><div class="promise-item">${icon('zap')}<h3>In, in a heartbeat.</h3><p>A few taps to book.<br>One QR code to get you there.</p></div><div class="promise-item">${icon('headphones')}<h3>Plans can change.</h3><p>Clear cancellation policies.<br>Refund status in your account.</p></div></section><section class="organiser-banner content-width"><div><span class="small-kicker">YOU MAKE THE MOMENT. WE BRING THE CROWD.</span><h2>Got something worth showing up for?</h2><p>Create your event, set your tickets, and fill the room.<br>Your next sold-out story starts here.</p></div><a class="button blue" href="#organiser">Start creating ${icon('arrow-up-right')}</a></section>`; if (featured)
    $('#hero-save').onclick = () => toggleSaved(featured.id); $$('[data-category]').forEach(b => b.onclick = () => { category = b.dataset.category; expanded = false; $$('[data-category]').forEach(x => x.classList.toggle('active', x === b)); renderCards(); $('#all-events').scrollIntoView({ behavior: 'smooth' }); }); $('#search').oninput = e => { search = e.target.value; expanded = true; renderCards(); }; $('#date-filter').value = when; $('#price-filter').value = price; $('#date-filter').onchange = e => { when = e.target.value; renderCards(); }; $('#price-filter').onchange = e => { price = e.target.value; renderCards(); }; $('#view-more').onclick = () => { expanded = true; renderCards(); }; $('#sort-button').onclick = () => { modal(`<div class="modal-pad"><h2 id="modal-title">Your plans. Your way.</h2><p>Find the experience that fits.</p><div class="filter-options">${[['recommended', 'Recommended'], ['date', 'Soonest first'], ['price', 'Price: low to high']].map(([v, t]) => `<button data-sort="${v}" class="filter-option ${sort === v ? 'selected' : ''}">${t}</button>`).join('')}</div></div>`); $$('[data-sort]').forEach(b => b.onclick = () => { sort = b.dataset.sort; closeModal(); renderCards(); }); }; $('#explore-all').onclick = e => { e.preventDefault(); $('#all-events').scrollIntoView({ behavior: 'smooth' }); }; renderCards(); }
function renderSaved() { $('#main-content').innerHTML = `<section class="app-page content-width"><div class="page-heading" style="padding-top:0"><span class="small-kicker">FOR YOUR SOMEDAY. OR THIS SATURDAY.</span><h1>Keep the good ones close<span class="blue-dot">.</span></h1><p>Your next great plans, saved for later.</p></div><div class="event-grid">${catalog.filter(e => saved.includes(e.id)).map(card).join('') || empty('Something will catch your eye.', 'Save an event with the bookmark button and find it here.', 'Explore events')}</div></section>`; wireCards(); }
function renderEvent(e) { if (!e)
    return renderError('This event is unavailable.', 'It may have been unpublished by its organiser.'); $('#main-content').innerHTML = `<section class="app-page content-width"><a class="back-link" href="#discover">${icon('arrow-left')} Back to experiences</a><img class="detail-cover" src="${esc(e.coverUrl || '/assets/concert.jpg')}" alt="${esc(e.title)}"><div class="detail-layout"><div class="detail-copy"><div class="detail-tags">${esc(e.category)} · ${esc(e.language)} ${e.isDemo ? '<span class="sample-label">Sample experience</span>' : ''}</div><h1>${esc(e.title)}</h1><div class="detail-facts"><div class="detail-fact">${icon('calendar')}<div><strong>${dateText(e.startsAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong><small>${timeText(e.startsAt)} – ${timeText(e.endsAt)} IST</small></div></div><div class="detail-fact">${icon('map-pin')}<div><strong>${esc(e.venue)}</strong><small>${esc(e.address)}, ${esc(e.city)}</small></div></div><div class="detail-fact">${icon('user')}<div><strong>${esc(e.ageRestriction)}</strong><small>${esc(e.language)} · Live experience</small></div></div><div class="detail-fact">${icon('shield-check')}<div><strong>${e.refundPolicy === 'none' ? 'Non-refundable' : e.refundPolicy === '24-hours' ? 'Cancel up to 24 hours before' : 'Cancel before the event starts'}</strong><small>See the policy before booking.</small></div></div></div><h2>About the experience</h2><p>${esc(e.description)}</p>${e.tags?.length ? `<div class="tag-list">${e.tags.map(t => `<span class="tag-pill">${esc(t)}</span>`).join('')}</div>` : ''}${e.galleryUrls?.length ? `<div class="gallery-grid">${e.galleryUrls.map(u => `<img loading="lazy" src="${esc(u)}" alt="Event gallery photograph">`).join('')}</div>` : ''}<h2>Your host</h2><p>${esc(e.organizerName)}<br>Bringing people together, one good moment at a time.</p>${e.isDemo ? '<div class="sample-notice">This sample listing demonstrates the booking experience. It always uses test checkout, and its tickets are not valid for admission.</div>' : ''}</div><aside class="booking-box"><small>YOUR PLACE IN THE CROWD</small><h3>${e.price ? rupees(e.price) : 'Free'}<span> / person, onwards</span></h3><p class="live-line"><span class="live-pulse"></span><span id="detail-available">${e.available} seats available</span> · Live</p><div class="tier-summary">${e.tiers.map(t => `<div><span>${esc(t.name)}</span><strong>${t.price ? rupees(t.price) : 'Free'}</strong></div>`).join('')}</div><button class="button blue full-width" id="choose-seats" ${e.available === 0 ? 'disabled' : ''}>${e.available === 0 ? 'Sold out' : 'Choose your seats'} ${icon('arrow-right')}</button><button class="form-switch" id="detail-save">${icon('bookmark')}${saved.includes(e.id) ? 'Saved to your plans' : 'Save for later'}</button><div class="safe-line">${icon('shield-check')}Secure checkout · Verified availability</div><p class="muted-note">Ticket sales close ${dateText(e.bookingDeadline)} at ${timeText(e.bookingDeadline)}</p></aside></div></section>`; $('#choose-seats').onclick = () => chooseSeats(e); $('#detail-save').onclick = () => toggleSaved(e.id); }
function renderAuth(role = 'attendee', register = authRegister) { role = role === 'organiser' ? 'organiser' : 'attendee'; authRegister = register; const org = role === 'organiser'; $('#main-content').innerHTML = `<section class="auth-page"><div class="auth-visual"><img src="/assets/${org ? 'concert' : 'hero'}.jpg" alt="Live concert audience"><a href="#discover" class="brand">Ticket<span>Rush.</span></a><span class="small-kicker">${org ? 'FOR THE ONES WHO BRING US TOGETHER' : 'FOR THE MOMENTS YOU’LL NEVER FORGET'}</span><h2>${org ? 'Make the moment.<br>Build your crowd.' : 'Your next<br>“I was there.”'}</h2><p>${org ? 'Your own events. Your own audience. One workspace to turn a great idea into an unforgettable experience.' : 'Discover your kind of good time. Book your place, keep your tickets together, and show up for something great.'}</p></div><div class="auth-form-wrap"><div class="role-switch"><a href="#login/attendee" class="${!org ? 'active' : ''}">I’m attending</a><a href="#login/organiser" class="${org ? 'active' : ''}">I’m organising</a></div><span class="small-kicker">${org ? 'ORGANISER WORKSPACE' : 'YOUR TICKETRUSH ACCOUNT'}</span><h1>${register ? (org ? 'Bring your next idea to life.' : 'Good plans start here.') : (org ? 'Welcome back, creator.' : 'Welcome back. Let’s make plans.')}</h1><p>${register ? 'Create your account to get started.' : `Sign in to ${org ? 'manage your events and your audience' : 'book experiences and see your tickets'}.`}</p><form id="login-form" novalidate>${register ? `<label class="form-field">Your full name<input name="name" autocomplete="name" minlength="2" maxlength="100" required placeholder="Jamie Davis"></label>${org ? '<label class="form-field">Organisation / brand name<input name="organization" autocomplete="organization" minlength="2" maxlength="150" required placeholder="Your event company"></label>' : ''}` : ''}<label class="form-field">Email address<input name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com"></label><label class="form-field">Password<input name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="10" maxlength="72" required placeholder="${register ? 'At least 10 characters' : 'Your password'}">${register ? '<small>Use at least 10 characters. Your account is protected with a hashed password.</small>' : ''}</label><p id="auth-error" class="error-text" role="alert"></p><button class="button blue full-width" id="auth-submit">${register ? (org ? 'Create organiser account' : 'Create attendee account') : 'Sign in'} ${icon('arrow-right')}</button></form><div class="auth-switch">${register ? 'Already have an account?' : 'New to TicketRush?'}<button id="toggle-auth">${register ? 'Sign in' : 'Create an account'}</button></div><p class="account-note">${org ? 'Organiser accounts manage events. Use an attendee account to buy tickets.' : 'Your account, your tickets. Organisers have their own workspace.'}</p></div></section>`; $('#toggle-auth').onclick = () => renderAuth(role, !register); $('#login-form').onsubmit = async (ev) => { ev.preventDefault(); const form = ev.target; if (!form.reportValidity())
    return; const b = Object.fromEntries(new FormData(form)); b.role = role; const button = $('#auth-submit'); button.disabled = true; button.textContent = register ? 'Creating account…' : 'Signing in…'; $('#auth-error').textContent = ''; try {
    session = await api('/auth/' + (register ? 'register' : 'login'), 'POST', b, {}, false);
    sessionStorage.setItem('tr-market-session', JSON.stringify(session));
    orders = [];
    organiserData = null;
    updateHeader();
    authRegister = false;
    go(org ? 'organiser' : sessionStorage.getItem('tr-return-to') || 'discover');
    sessionStorage.removeItem('tr-return-to');
    toast(register ? 'Your account is ready. Let’s make something happen.' : 'Welcome back, ' + session.user.name.split(' ')[0] + '.');
}
catch (err) {
    $('#auth-error').textContent = err.message;
    button.disabled = false;
    button.textContent = register ? 'Create account' : 'Sign in';
} }; }
function requireRole(role, returnTo) { if (session?.user.role === role)
    return true; if (returnTo)
    sessionStorage.setItem('tr-return-to', returnTo); authRegister = false; go('login/' + role); if (session)
    toast(`Use a separate ${role} account for this workspace.`); return false; }
async function chooseSeats(e) { if (!requireRole('attendee', 'event/' + e.id))
    return; closeModal(); seatEvent = e; seatTier = 'all'; seatPage = 0; selectedSeatIds = []; hold = null; try {
    const data = await api(`/events/${e.id}/seats`);
    currentSeats = data.seats;
    if (window.ticketRushSocket)
        window.ticketRushSocket.emit('event:join', e.id);
    renderSeatModal();
    seatTimer = setInterval(refreshSeatMap, 5000);
}
catch (err) {
    toast(err.message);
} }
function renderSeatModal() { const e = seatEvent; modal(`<div class="modal-pad"><div class="checkout-head"><div><span class="small-kicker">YOUR NEXT GOOD TIME STARTS HERE</span><h2 id="modal-title">Find your place.</h2></div><span class="discover-live"><span class="live-pulse"></span> Live availability</span></div><p class="seat-modal-desc">${esc(e.title)} · ${dateText(e.startsAt)} · ${timeText(e.startsAt)}</p><div class="seat-controls"><select class="seat-tier-select" id="seat-tier" aria-label="Ticket tier"><option value="all">All ticket tiers</option>${e.tiers.map(t => `<option value="${esc(t.id)}">${esc(t.name)} · ${rupees(t.price)}</option>`).join('')}</select><button id="auto-seats">${icon('sparkles')} Find 2 seats together</button></div><div class="stage">STAGE / FRONT OF VENUE</div><div class="seat-page"><div class="seats" id="live-seats"></div></div><div class="seat-pager"><button id="prev-seats">← Previous</button><span id="seat-page-label"></span><button id="next-seats">Next →</button></div><div class="seat-legend"><span><i></i>Available</span><span><i class="blue-square"></i>Your seats</span><span><i style="background:#fff2da;border-color:#f6e5c2"></i>Held</span><span><i class="gray-square"></i>Booked</span></div><div class="seat-view-bottom"><div class="seat-total"><strong id="seat-total">₹0</strong><small id="selected-seats-label">Choose up to 6 seats</small></div><button class="button blue" id="reserve-seats">Continue ${icon('arrow-right')}</button></div><p class="seat-footer-note">Your selected seats will be reserved for 5 minutes when you continue.</p></div>`, true); $('#seat-tier').value = seatTier; $('#seat-tier').onchange = ev => { seatTier = ev.target.value; seatPage = 0; renderSeatGrid(); }; $('#auto-seats').onclick = () => { const available = currentSeats.filter(s => s.status === 'available' && (seatTier === 'all' || s.tierId === seatTier)); if (available.length < 2)
    return toast('Fewer than 2 seats are available in this tier.'); selectedSeatIds = available.slice(0, 2).map(s => s.id); renderSeatGrid(); }; $('#prev-seats').onclick = () => { seatPage = Math.max(0, seatPage - 1); renderSeatGrid(); }; $('#next-seats').onclick = () => { const n = currentSeats.filter(s => seatTier === 'all' || s.tierId === seatTier).length; seatPage = Math.min(Math.ceil(n / 100) - 1, seatPage + 1); renderSeatGrid(); }; $('#reserve-seats').onclick = reserveSeats; renderSeatGrid(); }
function renderSeatGrid() { if (!$('#live-seats'))
    return; const filtered = currentSeats.filter(s => seatTier === 'all' || s.tierId === seatTier), page = filtered.slice(seatPage * 100, seatPage * 100 + 100); $('#live-seats').innerHTML = page.map(s => `<button class="seat ${s.status === 'booked' ? 'sold' : s.status === 'held' ? 'held' : ''} ${selectedSeatIds.includes(s.id) ? 'selected' : ''}" data-seat-id="${s.id}" ${s.status !== 'available' ? 'disabled' : ''} title="${esc(s.tierName)} · ${rupees(s.price)}" aria-label="${esc(s.tierName)} seat ${esc(s.label)}, ${s.status}" aria-pressed="${selectedSeatIds.includes(s.id)}">${esc(s.label)}</button>`).join(''); $('#seat-page-label').textContent = `${filtered.length ? seatPage * 100 + 1 : 0}–${Math.min((seatPage + 1) * 100, filtered.length)} of ${filtered.length} seats`; $('#prev-seats').disabled = seatPage === 0; $('#next-seats').disabled = (seatPage + 1) * 100 >= filtered.length; $$('[data-seat-id]').forEach(b => b.onclick = () => { if (selectedSeatIds.includes(b.dataset.seatId))
    selectedSeatIds = selectedSeatIds.filter(id => id !== b.dataset.seatId);
else if (selectedSeatIds.length < 6)
    selectedSeatIds.push(b.dataset.seatId);
else
    return toast('A maximum of 6 seats per booking.'); renderSeatGrid(); }); const chosen = currentSeats.filter(s => selectedSeatIds.includes(s.id)); $('#seat-total').textContent = rupees(chosen.reduce((n, s) => n + s.price, 0)); $('#selected-seats-label').textContent = chosen.length ? chosen.map(s => s.label).join(', ') + ' · ' + chosen.length + ' ticket' + (chosen.length > 1 ? 's' : '') : 'Choose up to 6 seats'; }
async function refreshSeatMap() { if (!seatEvent || !$('#live-seats') || document.hidden)
    return; try {
    const r = await api(`/events/${seatEvent.id}/seats`);
    currentSeats = r.seats;
    const before = selectedSeatIds.length;
    selectedSeatIds = selectedSeatIds.filter(id => currentSeats.some(s => s.id === id && s.status === 'available'));
    if (before !== selectedSeatIds.length)
        toast('A selected seat was reserved by someone else. Please choose again.');
    renderSeatGrid();
}
catch { } }
async function reserveSeats() { if (!selectedSeatIds.length)
    return toast('Choose at least one seat to continue.'); const button = $('#reserve-seats'); button.disabled = true; button.textContent = 'Reserving…'; try {
    hold = await api('/holds', 'POST', { eventId: seatEvent.id, seatIds: selectedSeatIds });
    clearInterval(seatTimer);
    showContact();
}
catch (err) {
    toast(err.message);
    button.disabled = false;
    button.textContent = 'Continue';
    await refreshSeatMap();
} }
function summaryHTML(event, seats, amount) { return `<aside class="order-mini-summary"><img src="${esc(event.coverUrl)}" alt="${esc(event.title)}"><div><h3>${esc(event.title)}</h3><p>${dateText(event.startsAt)} · ${timeText(event.startsAt)}<br>${esc(event.venue)}<br>Seats: ${seats.map(s => esc(s.label)).join(', ')}</p></div><div class="price-breakdown"><div><span>Tickets (${seats.length})</span><span>${rupees(amount)}</span></div><div><span>Booking fee</span><span>₹0</span></div><div class="total"><span>Total</span><span>${rupees(amount)}</span></div></div></aside>`; }
function startHoldTimer() { const tick = () => { const target = $('#hold-countdown'); if (!target)
    return; const seconds = Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000)); target.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; if (seconds === 0) {
    clearInterval(holdTimer);
    if ($('#create-order'))
        $('#create-order').disabled = true;
    toast('Your seat hold expired. Close checkout and choose seats again.');
} }; tick(); holdTimer = setInterval(tick, 1000); }
function showContact() { const chosen = currentSeats.filter(s => selectedSeatIds.includes(s.id)), amount = chosen.reduce((n, s) => n + s.price, 0); modal(`<div class="modal-pad"><div class="checkout-head"><div><span class="small-kicker">YOUR SEATS ARE RESERVED</span><h2 id="modal-title">A few details. Then you’re there.</h2></div><span class="hold-timer">${icon('clock')}<span id="hold-countdown">5:00</span></span></div><div class="contact-checkout"><form id="contact-form" novalidate><label class="form-field">Ticket holder name<input name="name" required minlength="2" maxlength="100" value="${esc(session.user.name)}" autocomplete="name"></label><label class="form-field">Email address<input name="email" required type="email" value="${esc(session.user.email)}" autocomplete="email"></label><label class="form-field">Phone number<input name="phone" required type="tel" minlength="7" maxlength="20" placeholder="+91 98765 43210" autocomplete="tel"></label><p class="form-helper">Your tickets will be available in your TicketRush account.</p><label style="display:flex;gap:8px;align-items:flex-start;font-size:9px;line-height:1.8;color:#909db1;margin-top:20px"><input id="policy-agree" type="checkbox" required>I agree to the event’s cancellation policy: ${seatEvent.refundPolicy === 'none' ? 'tickets are non-refundable' : seatEvent.refundPolicy === '24-hours' ? 'cancel up to 24 hours before the event' : 'cancel before the event starts'}.</label><p class="error-text" id="checkout-error" role="alert"></p><button class="button blue full-width" id="create-order">Continue to payment ${icon('arrow-right')}</button></form>${summaryHTML(seatEvent, chosen, amount)}</div>${seatEvent.isDemo ? '<div class="sample-notice">Sample experience. Checkout will use test payments with no real charges.</div>' : ''}</div>`, true); startHoldTimer(); let idempotencyKey = crypto.randomUUID(); $('#contact-form').onsubmit = async (ev) => { ev.preventDefault(); if (!ev.target.reportValidity())
    return; if (hold.expiresAt <= Date.now())
    return toast('Your hold expired. Please select seats again.'); const contact = Object.fromEntries(new FormData(ev.target)); const button = $('#create-order'); button.disabled = true; button.textContent = 'Preparing checkout…'; try {
    currentOrder = await api('/orders', 'POST', { holdId: hold.id, eventId: seatEvent.id, contact }, { 'Idempotency-Key': idempotencyKey });
    await showPayment(currentOrder);
    refreshCatalog();
}
catch (err) {
    $('#checkout-error').textContent = err.message;
    button.disabled = false;
    button.textContent = 'Retry checkout';
} }; }
async function showPayment(order) { clearInterval(holdTimer); modal(`<div class="modal-pad"><div class="loading-screen" style="min-height:270px"><span class="loading-ring"></span><h2>Preparing your secure checkout.</h2></div></div>`); try {
    const checkout = await api('/payments/' + order.id + '/checkout', 'POST', {});
    if (checkout.provider === 'free') {
        showReceipt(checkout.order);
        await loadOrders();
        refreshCatalog();
        return;
    }
    if (checkout.provider === 'razorpay') {
        await openRazorpay(order, checkout);
        return;
    }
    modal(`<div class="modal-pad payment-checkout"><div class="payment-brand-row"><a class="brand" href="#discover">Ticket<span>Rush.</span></a><span class="test-tag">TEST CHECKOUT</span></div><h2 id="modal-title">One step from a good time.</h2><p style="font-size:11px;color:#929fb4;line-height:1.8">${esc(order.event.title)}<br>${order.seatLabels.map(esc).join(', ')} · ${dateText(order.event.startsAt)}</p><div class="payment-amount"><span>Total payable</span><strong>${rupees(order.amount)}</strong></div><div class="notice-box"><strong>No money will be charged.</strong>This workspace is using test checkout. Choose a payment outcome to try the full ticket and cancellation flow. Real payment details are not collected.</div><div class="test-outcome"><button class="button blue" id="test-success">${icon('shield-check')}Complete test payment</button><button class="decline" id="test-failure">Try a declined payment</button></div><p class="muted-note">Order ${order.id.slice(0, 8).toUpperCase()} · Your seats are reserved</p></div>`);
    $('#test-success').onclick = () => completeTest(order, 'success');
    $('#test-failure').onclick = () => completeTest(order, 'failure');
}
catch (err) {
    modal(`<div class="modal-pad"><h2 id="modal-title">Your order is saved.</h2><p>${esc(err.message)}</p><p class="form-notice">Your seats are reserved. Open My tickets to retry checkout or cancel this order.</p><button class="button blue full-width" id="payment-retry">Retry payment</button><a class="form-switch" href="#tickets" id="payment-orders">View my orders</a></div>`);
    $('#payment-retry').onclick = () => showPayment(order);
    $('#payment-orders').onclick = closeModal;
} }
async function completeTest(order, outcome) { $$('.test-outcome button').forEach(b => b.disabled = true); try {
    const updated = await api('/payments/' + order.id + '/test', 'POST', { outcome });
    if (updated.status === 'confirmed')
        showReceipt(updated);
    else {
        modal(`<div class="modal-pad"><span class="small-kicker">TEST PAYMENT DECLINED</span><h2 id="modal-title">No charge. No worries.</h2><p>Your test payment was declined. Your seats have been released so you can try again.</p><button class="button blue full-width" id="try-booking-again">Choose seats again</button><a href="#tickets" class="form-switch" id="failed-orders">View my orders</a></div>`);
        $('#try-booking-again').onclick = () => chooseSeats(order.event);
        $('#failed-orders').onclick = closeModal;
    }
    await loadOrders();
    await refreshCatalog();
}
catch (err) {
    toast(err.message);
    $$('.test-outcome button').forEach(b => b.disabled = false);
} }
async function razorScript() { if (window.Razorpay)
    return; await new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = resolve; script.onerror = () => reject(new Error('Razorpay checkout could not load. Check your connection.')); document.head.appendChild(script); }); }
async function openRazorpay(order, options) { await razorScript(); modal(`<div class="modal-pad"><span class="small-kicker">SECURE RAZORPAY CHECKOUT</span><h2 id="modal-title">Your seats are ready.</h2><p>Complete your payment in the Razorpay window. Your ticket is issued after the server verifies that payment was captured.</p><div class="payment-amount"><span>Order total</span><strong>${rupees(order.amount)}</strong></div><button class="button blue full-width" id="reopen-razorpay">Open payment window</button><a class="form-switch" href="#tickets" id="razorpay-orders">Back to my orders</a></div>`); const start = () => { const rzp = new window.Razorpay({ ...options, theme: { color: '#0071e3' }, handler: async (response) => { try {
        const paid = await api('/payments/' + order.id + '/verify', 'POST', response);
        showReceipt(paid);
        await loadOrders();
        refreshCatalog();
    }
    catch (err) {
        toast(err.message + ' Your order stays available in My tickets.');
    } }, modal: { ondismiss: () => toast('Checkout closed. You can resume this order from My tickets.') } }); rzp.on('payment.failed', () => toast('Payment was not completed. Retry from the Razorpay window or My tickets.')); rzp.open(); }; $('#reopen-razorpay').onclick = start; $('#razorpay-orders').onclick = closeModal; start(); }
function showReceipt(order) { currentOrder = order; modal(`<div class="modal-pad"><div class="receipt-header"><div class="success-icon">${icon('check')}</div><span class="small-kicker">YOUR SEATS ARE CONFIRMED</span><h2 id="modal-title">You’re going. Feel everything.</h2><p style="font-size:11px;color:#95a1b3;margin-top:10px">Your tickets are ready in your account.</p></div><div class="receipt-event"><h3 style="font-size:20px;font-weight:600;letter-spacing:-.4px">${esc(order.event.title)}</h3><p style="margin-top:12px">${dateText(order.event.startsAt, { weekday: 'long', day: 'numeric', month: 'long' })} · ${timeText(order.event.startsAt)}<br>${esc(order.event.venue)}, ${esc(order.event.city)}</p><div class="receipt-seats">${order.seatLabels.map(s => `<span>Seat ${esc(s)}</span>`).join('')}</div></div><div class="receipt-total"><span>${order.paymentMode === 'sandbox' ? 'Test payment complete' : order.paymentMode === 'free' ? 'No payment required' : 'Payment verified'}</span><strong>${rupees(order.amount)}</strong></div><p class="receipt-id">${order.id}</p><button class="button blue full-width" id="view-confirmed-tickets">${icon('ticket')}View QR tickets</button><a class="form-switch" href="#tickets" id="receipt-orders">See all my tickets</a>${order.event.isDemo ? '<p class="muted-note">Sample event · Not valid for real-world admission</p>' : ''}</div>`); $('#view-confirmed-tickets').onclick = () => showQRTicket(order); $('#receipt-orders').onclick = closeModal; }
async function loadOrders() { if (session?.user.role !== 'attendee') {
    orders = [];
    return;
} const d = await api('/orders'); orders = d.orders; updateHeader(); }
async function renderTickets() { if (!requireRole('attendee', 'tickets'))
    return; const version = ++viewVersion; loading('Getting your good times together.'); try {
    await loadOrders();
    if (version !== viewVersion)
        return;
    $('#main-content').innerHTML = `<section class="app-page content-width"><div class="page-heading tickets-page-head" style="padding-top:0"><div><span class="small-kicker">THE COUNTDOWN STARTS HERE</span><h1>Your good times, lined up<span class="blue-dot">.</span></h1><p>Tickets, pending checkouts, and refunds. All in one place.</p></div><a class="button outline" href="#discover">Explore events ${icon('arrow-up-right')}</a></div><section class="ticket-list">${orders.length ? orders.map(o => `<article class="my-ticket"><img src="${esc(o.event.coverUrl)}" alt="${esc(o.event.title)}"><div class="my-ticket-content">${statusPill(o.status)}<h3>${esc(o.event.title)}</h3><p>${dateText(o.event.startsAt)} · ${timeText(o.event.startsAt)}<br>${esc(o.event.venue)}<br>Seats ${o.seatLabels.map(esc).join(', ')} · ${rupees(o.amount)}</p><div class="my-ticket-actions">${o.status === 'confirmed' ? `<button data-ticket="${o.id}">View QR tickets ${icon('arrow-up-right')}</button>` : ''}${o.status === 'pending' ? `<button data-pay="${o.id}">Resume payment ${icon('arrow-right')}</button>` : ''}${['pending', 'confirmed'].includes(o.status) ? `<button class="cancel-ticket" data-cancel-order="${o.id}">${o.status === 'pending' ? 'Cancel order' : 'Cancel & refund'}</button>` : ''}${o.status === 'refund_pending' ? '<span style="font-size:9px;color:#b19468">Your refund is being processed.</span>' : ''}</div><small style="display:block;margin-top:12px;font-size:8px;color:#a7b0be">${o.paymentMode === 'sandbox' ? 'Test payment · No real charge' : o.paymentMode === 'free' ? 'Free ticket' : 'Razorpay payment'} · ${o.id.slice(0, 8).toUpperCase()}</small></div></article>`).join('') : empty('The best plans are still ahead.', 'Book an experience and we’ll keep your tickets right here.', 'Find your next good time')}</section></section>`;
    $$('[data-ticket]').forEach(b => b.onclick = () => showQRTicket(orders.find(o => o.id === b.dataset.ticket)));
    $$('[data-pay]').forEach(b => b.onclick = () => showPayment(orders.find(o => o.id === b.dataset.pay)));
    $$('[data-cancel-order]').forEach(b => b.onclick = () => cancelOrder(orders.find(o => o.id === b.dataset.cancelOrder)));
}
catch (err) {
    renderError('Your tickets could not load.', err.message);
} }
async function showQRTicket(order) { modal(`<div class="modal-pad"><span class="small-kicker">YOUR TICKET TO A GOOD TIME</span><h2 id="modal-title" style="text-align:center">${esc(order.event.title)}</h2><div class="ticket-controls"><select id="ticket-seat" aria-label="Choose ticket">${order.seats.map(s => `<option value="${s.ticketId}">Seat ${esc(s.label)} · ${esc(s.tierName)}</option>`).join('')}</select></div><canvas id="ticket-qr" class="ticket-qr" aria-label="Ticket QR code"></canvas><p class="qr-verified">${icon('shield-check')}Verified against your active booking</p><div class="confirmation-card"><h3>${esc(order.contact.name)}</h3><p>${dateText(order.event.startsAt)} · ${timeText(order.event.startsAt)}<br>${esc(order.event.venue)}, ${esc(order.event.city)}<br>Seats: ${order.seatLabels.map(esc).join(', ')}</p></div><button class="button blue full-width" id="download-ticket">${icon('download')}Download selected ticket</button><p class="muted-note">${order.event.isDemo ? 'Sample ticket · Not valid for admission' : 'Keep your QR code ready at the venue.'}</p></div>`); let currentTicket = null; async function loadQR() { try {
    currentTicket = await api('/tickets/' + $('#ticket-seat').value);
    if (window.makeQR)
        await window.makeQR($('#ticket-qr'), currentTicket.qrPayload, { width: 240, margin: 1, color: { dark: '#152944', light: '#ffffff' } });
}
catch (err) {
    toast(err.message);
} } $('#ticket-seat').onchange = loadQR; $('#download-ticket').onclick = () => { if (!currentTicket)
    return; const qr = $('#ticket-qr').toDataURL(), label = currentTicket.seat; const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="430"><rect width="760" height="430" rx="25" fill="#fafbfe"/><text x="35" y="58" font-family="Arial" font-size="25" fill="#0071e3" font-weight="bold">TicketRush.</text><text x="35" y="110" font-family="Arial" font-size="22" fill="#253e61">${esc(order.event.title)}</text><text x="35" y="155" font-family="Arial" font-size="15" fill="#6a7e9b">${esc(dateText(order.event.startsAt))} · ${esc(timeText(order.event.startsAt))}</text><text x="35" y="193" font-family="Arial" font-size="14" fill="#6a7e9b">${esc(order.event.venue)}</text><text x="35" y="234" font-family="Arial" font-size="17" fill="#2e4e79">${esc(order.contact.name)} · Seat ${esc(label)}</text><text x="35" y="278" font-family="monospace" font-size="10" fill="#9aa7b9">${esc(currentTicket.ticketId)}</text><text x="35" y="386" font-family="Arial" font-size="10" fill="#9aa7b9">${order.event.isDemo ? 'SAMPLE TICKET — NOT VALID FOR ADMISSION' : 'Show this QR code at the venue. Cancelled tickets are invalid.'}</text><image href="${qr}" x="505" y="148" width="215" height="215"/></svg>`; downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'TicketRush-' + label + '.svg'); }; await loadQR(); }
function downloadBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
function cancelOrder(order) { modal(`<div class="modal-pad"><span class="small-kicker">PLANS CHANGE. WE GET IT.</span><h2 id="modal-title">${order.status === 'pending' ? 'Cancel this order?' : 'Cancel your tickets?'}</h2><p>${esc(order.event.title)}<br>Seats ${order.seatLabels.map(esc).join(', ')} · ${rupees(order.amount)}</p><div class="notice-box">${order.status === 'pending' ? 'Your seats will be released. If a payment arrives after cancellation, it will be refunded.' : order.event.refundPolicy === 'none' ? 'This organiser has set a non-refundable ticket policy.' : order.event.refundPolicy === '24-hours' ? 'Cancellation is available up to 24 hours before the event starts.' : 'Cancellation is available before the event starts.'}${order.paymentMode === 'sandbox' ? '<br>This is a test payment. No money was charged.' : ''}</div><p id="cancel-error" class="error-text"></p><button class="button blue full-width" id="confirm-cancel">${order.status === 'pending' ? 'Cancel order' : 'Request cancellation & refund'}</button><button class="form-switch" id="keep-order">Keep my plans</button></div>`); $('#keep-order').onclick = closeModal; $('#confirm-cancel').onclick = async () => { const b = $('#confirm-cancel'); b.disabled = true; b.textContent = 'Processing…'; try {
    const o = await api('/orders/' + order.id + '/cancel', 'POST', {});
    closeModal();
    toast(o.status === 'refund_pending' ? 'Cancellation accepted. Your refund is processing.' : 'Booking cancelled. Your seats have been released.');
    await refreshCatalog();
    renderTickets();
}
catch (err) {
    $('#cancel-error').textContent = err.message;
    b.disabled = false;
    b.textContent = 'Request cancellation';
} }; }
function workspaceNav(active) { return `<aside class="dashboard-sidebar"><div class="workspace-badge"><small>ORGANISER WORKSPACE</small><strong>${esc(session.user.organization || session.user.name)}</strong><span>Your events. Your audience.</span></div><nav class="sidebar-nav" aria-label="Organiser navigation">${[['organiser', 'Overview', 'grid'], ['organiser/events', 'My events', 'calendar'], ['organiser/attendees', 'Orders & attendees', 'user'], ['organiser/payments', 'Payments', 'wallet'], ['organiser/settings', 'Settings', 'sliders']].map(([href, label, ic]) => `<a href="#${href}" class="${active === href ? 'active' : ''}">${icon(ic)}${label}</a>`).join('')}</nav><div class="sidebar-help">${icon('sparkles')}<h4>Make your next big moment.</h4><p>From the first idea to the last seat. Your whole event, together.</p><a href="#organiser/new">Create an experience ${icon('arrow-up-right')}</a></div></aside>`; }
function statsHTML(data) { const s = data.stats; return `<div class="stats-grid"><div class="stat-card highlight"><span>Ticket sales ${icon('wallet')}</span><strong>${rupees(s.grossSales)}</strong><small>Confirmed bookings · INR</small></div><div class="stat-card"><span>Tickets sold ${icon('ticket')}</span><strong>${s.ticketsSold}</strong><small>Across your events</small></div><div class="stat-card"><span>Live events ${icon('calendar')}</span><strong>${s.published}</strong><small>Ready for their next audience</small></div><div class="stat-card"><span>Total events ${icon('grid')}</span><strong>${s.totalEvents}</strong><small>${s.totalEvents - s.published} in draft</small></div></div>`; }
function eventTable(events) { if (!events.length)
    return `<div class="organiser-empty">${icon('calendar')}<h3>Your next big moment starts here.</h3><p>Create your first event. Set the stage, open your tickets,<br>and let the good times find their people.</p><a class="button blue" href="#organiser/new">Create your first event ${icon('arrow-right')}</a></div>`; return `<div class="table-scroll"><table class="data-table"><thead><tr><th>Event</th><th>Status</th><th>Tickets</th><th>Price from</th><th>Manage</th></tr></thead><tbody>${events.map(e => `<tr><td><div class="event-cell"><img src="${esc(e.coverUrl || '/assets/concert.jpg')}" alt="${esc(e.title)}"><div><strong>${esc(e.title)}</strong><small>${dateText(e.startsAt)} · ${esc(e.city)}</small></div></div></td><td>${statusPill(e.status)}</td><td>${e.sold} / ${e.capacity}<span class="capacity-progress"><i style="width:${Math.min(100, e.sold / e.capacity * 100)}%"></i></span></td><td>${rupees(e.price)}</td><td><a class="table-action" href="#organiser/edit/${e.id}">Edit</a><a class="table-action" href="#organiser/attendees/${e.id}">Attendees</a>${e.status === 'published' ? `<a class="table-action" href="#event/${e.id}">View</a>` : ''}</td></tr>`).join('')}</tbody></table></div>`; }
function salesChart(orders) { const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return { date: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en-IN', { weekday: 'short' }), amount: 0 }; }); for (const o of orders)
    if (o.status === 'confirmed') {
        const d = days.find(x => x.date === o.createdAt.slice(0, 10));
        if (d)
            d.amount += o.amount;
    } const max = Math.max(...days.map(d => d.amount), 1); return `<div class="sales-chart">${days.map((d, i) => `<div class="sales-column" title="${esc(d.label)}: ${rupees(d.amount)}"><div class="sales-bar ${i === 6 ? 'current' : ''}" style="height:${d.amount ? Math.max(5, d.amount / max * 90) : 3}px"></div><small>${d.label}</small></div>`).join('')}</div><p class="chart-key">Confirmed ticket sales · Last 7 days · ${orders.some(o => o.paymentMode === 'sandbox') ? 'Includes test payments' : 'INR'}</p>`; }
async function renderWorkspace(path = 'organiser') { if (!requireRole('organiser', path))
    return; const version = ++viewVersion; loading('Opening your organiser workspace.'); try {
    organiserData = await api('/organiser/overview');
    if (version !== viewVersion)
        return;
    const d = organiserData;
    const headings = { 'organiser': ['YOUR NEXT SOLD-OUT STORY', 'Good things are taking shape.', 'Your events, your audience, and your next big moment.'], 'organiser/events': ['MAKE SOMETHING WORTH SHOWING UP FOR', 'Your events. All together.', 'Create, refine, and manage the experiences you bring to life.'], 'organiser/attendees': ['THE PEOPLE BEHIND THE GOOD TIMES', 'Your crowd, at a glance.', 'See who’s coming, manage orders, and export your attendee list.'], 'organiser/payments': ['YOUR EVENTS. CLEAR NUMBERS.', 'Every booking, accounted for.', 'Understand checkout, payment status, and your event sales.'], 'organiser/settings': ['YOUR ORGANISER ACCOUNT', 'Make yourself at home.', 'Your organisation and your workspace details.'] };
    const key = path.startsWith('organiser/attendees') ? 'organiser/attendees' : path;
    const h = headings[key] || headings.organiser;
    let content = '';
    if (key === 'organiser') {
        content = statsHTML(d) + `<div class="dashboard-panels"><section class="panel"><div class="panel-head"><h2>A week of good plans</h2><span>Last 7 days</span></div><div class="panel-body">${salesChart(d.recentOrders)}</div></section><section class="panel"><div class="panel-head"><h2>Your crowd favourites</h2><span>By reservations</span></div><div class="panel-body">${d.events.length ? [...d.events].sort((a, b) => b.sold - a.sold).slice(0, 3).map(e => `<div class="top-event"><img src="${esc(e.coverUrl || '/assets/concert.jpg')}" alt="${esc(e.title)}"><div><strong>${esc(e.title)}</strong><small>${e.sold} reserved · ${e.available} available</small></div><span>${e.capacity ? Math.round(e.sold / e.capacity * 100) : 0}%</span></div>`).join('') : '<div class="small-empty">Your first event could be your<br>next crowd favourite.</div>'}</div></section></div><section class="panel"><div class="panel-head"><h2>Your events</h2><a href="#organiser/events">View all ${icon('arrow-right')}</a></div>${eventTable(d.events.slice(0, 4))}</section>`;
    }
    else if (key === 'organiser/events') {
        content = `<div class="dashboard-toolbar"><div class="tabs">${[['all', 'All events'], ['published', 'Live'], ['draft', 'Drafts']].map(([value, label]) => `<button class="${organiserFilter === value ? 'active' : ''}" data-event-filter="${value}">${label}</button>`).join('')}</div><div class="search-box">${icon('search')}<input id="organiser-search" type="search" placeholder="Search your events" aria-label="Search your events"></div></div><section class="panel" id="organiser-event-table">${eventTable(d.events.filter(e => organiserFilter === 'all' || e.status === organiserFilter))}</section>`;
    }
    else if (key === 'organiser/attendees') {
        content = `<div class="dashboard-toolbar"><select id="attendee-event" aria-label="Choose an event"><option value="">Choose an event</option>${d.events.map(e => `<option value="${e.id}">${esc(e.title)}</option>`).join('')}</select><button class="button outline" id="export-attendees" disabled>${icon('download')}Export CSV</button></div><section class="panel" id="attendee-table"><div class="small-empty">Choose an event to see its attendees and orders.</div></section>`;
    }
    else if (key === 'organiser/payments') {
        content = statsHTML(d) + `<div class="payment-settings"><section class="panel gateway-card"><div class="gateway-brand"><span class="razorpay-brand">Razorpay</span>${d.gateway.configured ? `<span class="status-pill"><i></i>${d.gateway.mode === 'live' ? 'Live gateway' : 'Test gateway'} connected</span>` : '<span class="test-tag">TEST CHECKOUT ACTIVE</span>'}</div><h3>${d.gateway.configured ? 'Checkout is connected.' : 'Build your event. Try the whole flow.'}</h3><p>${d.gateway.configured ? 'Payments open in Razorpay’s secure checkout. TicketRush verifies the captured payment on the server before confirming tickets.' : 'Your workspace currently uses a clearly labelled test checkout. It lets you try successful payments, declined payments, QR tickets, and refunds without charging money.'}</p><div class="payment-methods"><span>UPI</span><span>VISA</span><span>Mastercard</span><span>Netbanking</span></div><p>${d.gateway.configured ? 'Available methods depend on your Razorpay merchant account and checkout settings.' : 'These payment methods become available through Razorpay after the platform’s merchant credentials are configured.'}</p><div class="gateway-options"><span>${icon('check')}Server-verified payment signatures</span><span>${icon('check')}Captured-payment checks before tickets</span><span>${icon('check')}Signed webhooks and retry-safe refunds</span></div></section><aside class="panel gateway-card"><span class="small-kicker">A CLEAR VIEW OF YOUR MONEY</span><h3>What these numbers mean.</h3><p>Ticket sales show confirmed bookings at their ticket value. Test payments are included and labelled in your orders.</p><div class="notice-box"><strong>Merchant configuration</strong>Razorpay keys are configured securely on the server. Payouts to organisers require a separate settlement setup and are not enabled here.</div><p style="margin-top:18px">Sample experiences always use test payments, even if a live gateway is connected.</p></aside></div>`;
    }
    else {
        content = `<div class="payment-settings"><section class="panel gateway-card"><h3>Your organisation</h3><div class="settings-list"><div class="settings-row"><span>Organisation</span><strong>${esc(session.user.organization)}</strong></div><div class="settings-row"><span>Account owner</span><strong>${esc(session.user.name)}</strong></div><div class="settings-row"><span>Email</span><strong>${esc(session.user.email)}</strong></div><div class="settings-row"><span>Account type</span><strong>Event organiser</strong></div><div class="settings-row"><span>Event time zone</span><strong>India · IST</strong></div></div><p style="margin-top:20px">This workspace only shows events and attendees owned by your organiser account.</p></section></div>`;
    }
    $('#main-content').innerHTML = `<section class="dashboard-shell content-width">${workspaceNav(key)}<div class="dashboard-content"><div class="dashboard-heading"><div><span class="small-kicker">${h[0]}</span><h1>${h[1]}</h1><p>${h[2]}</p></div><a class="button blue" href="#organiser/new">${icon('sparkles')}Create event</a></div>${content}<div class="updated-note"><span class="live-pulse"></span>Connected to your workspace · Updated ${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</div></div></section>`;
    if (key === 'organiser/events') {
        $$('[data-event-filter]').forEach(b => b.onclick = () => { organiserFilter = b.dataset.eventFilter; $$('[data-event-filter]').forEach(x => x.classList.toggle('active', x === b)); drawOrganiserEvents(); });
        $('#organiser-search').oninput = drawOrganiserEvents;
    }
    if (key === 'organiser/attendees') {
        let attendees = [];
        async function load() { const id = $('#attendee-event').value; if (!id) {
            $('#attendee-table').innerHTML = '<div class="small-empty">Choose an event to view its attendees.</div>';
            return;
        } $('#attendee-table').innerHTML = '<div class="small-empty">Loading your crowd…</div>'; try {
            const r = await api('/organiser/events/' + id + '/attendees');
            attendees = r.attendees;
            $('#export-attendees').disabled = !attendees.length;
            $('#attendee-table').innerHTML = attendees.length ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>Attendee</th><th>Seats</th><th>Amount</th><th>Status</th><th>Payment</th></tr></thead><tbody>${attendees.map(a => `<tr><td><strong style="font-size:11px;font-weight:500">${esc(a.name)}</strong><small class="table-sub">${esc(a.email)}</small><small class="table-sub">${esc(a.phone)}</small></td><td>${a.seats.map(esc).join(', ')}</td><td>${rupees(a.amount)}</td><td>${statusPill(a.status)}</td><td>${a.paymentMode === 'sandbox' ? '<span class="test-tag">TEST</span>' : 'Razorpay'}<small class="table-sub">${dateText(a.createdAt)}</small></td></tr>`).join('')}</tbody></table></div>` : '<div class="small-empty">No completed orders yet. Share your event and bring the crowd.</div>';
        }
        catch (err) {
            $('#attendee-table').innerHTML = `<div class="small-empty">${esc(err.message)}</div>`;
        } }
        $('#attendee-event').onchange = load;
        $('#export-attendees').onclick = () => { const cell = v => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s))
            s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }; const rows = [['Order ID', 'Name', 'Email', 'Phone', 'Seats', 'Amount (INR)', 'Status', 'Payment mode'], ...attendees.map(a => [a.orderId, a.name, a.email, a.phone, a.seats.join(' '), a.amount / 100, a.status, a.paymentMode])]; downloadBlob(new Blob(['\uFEFF' + rows.map(r => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'TicketRush-attendees.csv'); };
        const id = path.split('/')[2];
        if (id && d.events.some(e => e.id === id)) {
            $('#attendee-event').value = id;
            load();
        }
    }
}
catch (err) {
    renderError('Your workspace could not load.', err.message);
} }
function drawOrganiserEvents() { const term = $('#organiser-search')?.value.toLowerCase() || ''; $('#organiser-event-table').innerHTML = eventTable(organiserData.events.filter(e => (organiserFilter === 'all' || e.status === organiserFilter) && e.title.toLowerCase().includes(term))); }
function defaultEvent() { const start = new Date(Date.now() + 30 * 86400000); start.setUTCHours(12, 30, 0, 0); return { id: null, title: '', summary: '', description: '', category: 'Music', venue: '', address: '', city: 'Bengaluru', state: 'Karnataka', postalCode: '', startsAt: start.toISOString(), endsAt: new Date(start.getTime() + 3 * 3600000).toISOString(), bookingDeadline: start.toISOString(), language: 'English', ageRestriction: 'All ages', refundPolicy: '24-hours', coverUrl: '', galleryUrls: [], tags: [], status: 'draft', tiers: [{ id: 'general', name: 'General admission', price: 49900, quantity: 100, description: '' }] }; }
function tierEditor(t, i) { return `<div class="tier-editor" data-tier="${esc(t.id)}"><div class="tier-editor-top"><strong>Ticket tier ${i + 1}</strong>${i > 0 ? '<button type="button" class="remove-tier">Remove</button>' : ''}</div><div class="form-grid"><label class="form-field">Tier name<input class="tier-name" required minlength="2" maxlength="70" value="${esc(t.name)}" placeholder="General / VIP / Early bird"></label><label class="form-field">Price (₹)<input class="tier-price" type="number" required min="0" max="100000" step="0.01" value="${t.price / 100}"></label><label class="form-field">Number of seats<input class="tier-quantity" type="number" required min="1" max="10000" step="1" value="${t.quantity}"></label></div><label class="form-field">What’s included <span style="color:#b0b8c5;font-weight:400">(optional)</span><input class="tier-description" maxlength="300" value="${esc(t.description || '')}" placeholder="Tell people what makes this tier special"></label></div>`; }
async function renderEditor(id) { if (!requireRole('organiser', id ? 'organiser/edit/' + id : 'organiser/new'))
    return; const version = ++viewVersion; loading('Setting the stage for your next event.'); try {
    let e = defaultEvent();
    if (id) {
        const d = organiserData || await api('/organiser/overview');
        e = d.events.find(e => e.id === id) || await api('/events/' + id);
        if (e.ownerId !== session.user.id)
            throw new Error('This event is not in your organiser workspace.');
    }
    if (version !== viewVersion)
        return;
    editorState = e;
    editorStep = 0;
    $('#main-content').innerHTML = `<section class="dashboard-shell content-width">${workspaceNav('organiser/events')}<div class="dashboard-content"><div class="editor-heading"><div class="editor-heading-top"><a href="#organiser/events">${icon('arrow-left')} Back to your events</a><div class="editor-actions"><button type="button" class="button outline" id="save-draft">Save draft</button><button type="button" class="button blue" id="publish-event">${e.status === 'published' ? 'Save changes' : 'Publish event'} ${icon('arrow-up-right')}</button></div></div><h1>${id ? 'Make a good thing even better.' : 'Let’s make something worth showing up for.'}</h1><p>${id ? 'Update your event details, media, and information for your audience.' : 'The details, the place, the people. Your next great event starts here.'}</p></div><div class="editor-layout"><form class="editor-form" id="event-form" novalidate><div class="editor-steps">${['The details', 'Date & venue', 'Tickets', 'Media & review'].map((t, i) => `<button type="button" class="editor-step ${i === 0 ? 'active' : ''}" data-step="${i}"><span>${i + 1}</span>${t}</button>`).join('')}</div><fieldset class="editor-fieldset active" data-fieldset="0"><h2>Tell your story.</h2><p>Start with the essentials. Give people a reason to be there.</p><label class="form-field">Event name *<input name="title" required minlength="3" maxlength="150" placeholder="Give your next big moment a name" value="${esc(e.title)}"></label><div class="form-grid"><label class="form-field">Category *<select name="category">${categories.slice(1).map(([c]) => `<option ${c === e.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label class="form-field">Language<input name="language" maxlength="80" value="${esc(e.language)}" placeholder="English, Hindi, Telugu…"></label></div><label class="form-field">A short introduction<input name="summary" maxlength="220" value="${esc(e.summary)}" placeholder="One line that gets people excited"><small class="form-helper">Up to 220 characters. Make the first impression count.</small></label><label class="form-field">About the experience *<textarea name="description" rows="6" required minlength="20" maxlength="6000" placeholder="The atmosphere. The line-up. What to expect. Why they’ll love it.">${esc(e.description)}</textarea></label><label class="form-field">Tags<input name="tags" value="${esc((e.tags || []).join(', '))}" placeholder="Live music, outdoor, weekend…"><small class="form-helper">Separate tags with commas. Up to 8 tags.</small></label></fieldset><fieldset class="editor-fieldset" data-fieldset="1"><h2>Set the time. Set the scene.</h2><p>All dates and times use India Standard Time (IST).</p><div class="form-grid"><label class="form-field">Starts at *<input name="startsAt" type="datetime-local" required value="${dateInput(e.startsAt)}"></label><label class="form-field">Ends at *<input name="endsAt" type="datetime-local" required value="${dateInput(e.endsAt)}"></label></div><label class="form-field">Ticket sales close *<input name="bookingDeadline" type="datetime-local" required value="${dateInput(e.bookingDeadline)}"><small class="form-helper">Sales must close before the event starts.</small></label><label class="form-field">Venue name *<input name="venue" required minlength="2" maxlength="150" value="${esc(e.venue)}" placeholder="Where the good times happen"></label><label class="form-field">Full address *<textarea name="address" rows="2" required minlength="5" maxlength="500" placeholder="Street, area, landmark…">${esc(e.address)}</textarea></label><div class="form-grid address-grid"><label class="form-field">City *<input name="city" required minlength="2" maxlength="100" value="${esc(e.city)}"></label><label class="form-field">State<input name="state" maxlength="100" value="${esc(e.state)}"></label></div><label class="form-field">PIN code<input name="postalCode" maxlength="12" value="${esc(e.postalCode)}" placeholder="560001"></label></fieldset><fieldset class="editor-fieldset" data-fieldset="2"><h2>A place for everyone.</h2><p>Set prices and capacity for each ticket tier. Seats are generated automatically.</p><div id="tier-editors">${e.tiers.map(tierEditor).join('')}</div><button class="tier-add" type="button" id="add-tier">${icon('sparkles')} Add a ticket tier</button><div class="capacity-total"><span>Total event capacity</span><strong id="capacity-total">${e.tiers.reduce((n, t) => n + t.quantity, 0)} seats</strong></div><div class="form-grid"><label class="form-field">Age restriction<select name="ageRestriction">${['All ages', '12+', '16+', '18+', '21+'].map(v => `<option ${e.ageRestriction === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label><label class="form-field">Cancellation policy<select name="refundPolicy"><option value="24-hours" ${e.refundPolicy === '24-hours' ? 'selected' : ''}>Up to 24 hours before</option><option value="flexible" ${e.refundPolicy === 'flexible' ? 'selected' : ''}>Before event starts</option><option value="none" ${e.refundPolicy === 'none' ? 'selected' : ''}>Non-refundable</option></select></label></div><div class="notice-box">After reservations begin, ticket tiers and capacities are protected so existing tickets stay valid. You can still update event information and images.</div></fieldset><fieldset class="editor-fieldset" data-fieldset="3"><h2>Make them stop scrolling.</h2><p>Add a beautiful cover. Bring the experience to life with a few more photographs.</p><label class="upload-zone ${e.coverUrl ? 'has-image' : ''}" id="cover-zone">${e.coverUrl ? `<img src="${esc(e.coverUrl)}" alt="Event cover preview">` : icon('download') + '<strong>Click to upload your event cover</strong><small>JPEG, PNG, or WebP · Up to 5 MB<br>A wide image works best</small>'}<input type="file" id="cover-file" accept="image/jpeg,image/png,image/webp" aria-label="Upload event cover"></label><div class="image-url-row"><input id="cover-url" type="url" placeholder="Or paste an HTTPS image URL" value="${esc(e.coverUrl.startsWith('https:') ? e.coverUrl : '')}"><button type="button" id="apply-cover-url">Use image URL</button></div><label class="upload-small">${icon('sparkles')} Add gallery photographs (up to 5)<input type="file" id="gallery-files" accept="image/jpeg,image/png,image/webp" multiple></label><div id="gallery-thumbs" class="gallery-thumbs"></div><div class="publish-checklist"><div>${icon('check')}Event details, date and venue</div><div>${icon('check')}Ticket tiers and total capacity</div><div>${icon('check')}Clear age and cancellation policies</div></div><div class="notice-box"><strong>Your event. Ready for its audience.</strong>Publishing makes your event visible in Discover. You can save it as a draft to keep working on it.</div></fieldset><div id="event-editor-error" class="event-editor-error" role="alert"></div><div class="editor-bottom"><button type="button" class="button outline" id="editor-prev">${icon('arrow-left')} Back</button><span id="editor-progress">Step 1 of 4</span><button type="button" class="button blue" id="editor-next">Continue ${icon('arrow-right')}</button></div></form><aside class="event-preview"><p class="preview-label">YOUR EVENT, AT A GLANCE</p><div class="preview-card"><img id="preview-cover" src="${esc(e.coverUrl || '/assets/concert.jpg')}" alt="Event card preview"><div><span class="event-type" id="preview-category">${esc(e.category)}</span><h3 id="preview-title">${esc(e.title || 'Your next unforgettable experience')}</h3><p id="preview-meta">${dateText(e.startsAt)} · ${timeText(e.startsAt)}<br>${esc(e.venue || 'Your venue')}, ${esc(e.city)}</p><div class="preview-price" id="preview-price">From ${rupees(Math.min(...e.tiers.map(t => t.price)))}</div></div></div><p class="preview-note">A little glimpse of how your experience will appear. Good images and a clear story go a long way.</p></aside></div></div></section>`;
    $$('[data-step]').forEach(b => b.onclick = () => setEditorStep(Number(b.dataset.step)));
    $('#editor-next').onclick = () => { if (editorStep < 3)
        setEditorStep(editorStep + 1);
    else
        saveEvent('published'); };
    $('#editor-prev').onclick = () => setEditorStep(Math.max(0, editorStep - 1));
    $('#save-draft').onclick = () => saveEvent('draft');
    $('#publish-event').onclick = () => saveEvent('published');
    $('#event-form').onsubmit = ev => ev.preventDefault();
    $('#event-form').oninput = updatePreview;
    $('#add-tier').onclick = () => { if ($$('[data-tier]').length >= 6)
        return toast('You can add up to 6 ticket tiers.'); const i = $$('[data-tier]').length; $('#tier-editors').insertAdjacentHTML('beforeend', tierEditor({ id: 'tier-' + crypto.randomUUID().slice(0, 8), name: '', price: 99900, quantity: 50, description: '' }, i)); wireTiers(); updatePreview(); };
    wireTiers();
    wireUploads();
    renderGallery();
    setEditorStep(0);
}
catch (err) {
    renderError('This event could not be opened.', err.message);
} }
function setEditorStep(step) { editorStep = step; $$('[data-step]').forEach(b => b.classList.toggle('active', Number(b.dataset.step) === step)); $$('[data-fieldset]').forEach(b => b.classList.toggle('active', Number(b.dataset.fieldset) === step)); $('#editor-progress').textContent = `Step ${step + 1} of 4`; $('#editor-prev').disabled = step === 0; $('#editor-next').innerHTML = step === 3 ? `Publish event ${icon('arrow-up-right')}` : `Continue ${icon('arrow-right')}`; }
function wireTiers() { $$('.remove-tier').forEach(b => b.onclick = () => { b.closest('[data-tier]').remove(); updatePreview(); }); }
function formEvent(status) { const f = Object.fromEntries(new FormData($('#event-form'))); return { ...f, status, startsAt: toISO(f.startsAt), endsAt: toISO(f.endsAt), bookingDeadline: toISO(f.bookingDeadline), tiers: $$('[data-tier]').map(row => ({ id: row.dataset.tier, name: row.querySelector('.tier-name').value, price: Math.round(Number(row.querySelector('.tier-price').value) * 100), quantity: Number(row.querySelector('.tier-quantity').value), description: row.querySelector('.tier-description').value })), coverUrl: editorState.coverUrl, galleryUrls: editorState.galleryUrls, tags: String(f.tags || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 8) }; }
function updatePreview() { if (!$('#event-form'))
    return; const f = Object.fromEntries(new FormData($('#event-form'))); $('#preview-title').textContent = f.title || 'Your next unforgettable experience'; $('#preview-category').textContent = f.category; let date = 'Choose a date', time = ''; try {
    date = dateText(toISO(f.startsAt));
    time = timeText(toISO(f.startsAt));
}
catch { } $('#preview-meta').innerHTML = `${esc(date)} · ${esc(time)}<br>${esc(f.venue || 'Your venue')}, ${esc(f.city || 'Your city')}`; const prices = $$('.tier-price').map(el => Number(el.value) * 100); $('#preview-price').textContent = 'From ' + rupees(Math.min(...prices)); $('#capacity-total').textContent = $$('.tier-quantity').reduce((n, el) => n + Number(el.value), 0).toLocaleString('en-IN') + ' seats'; }
async function saveEvent(status) { const form = $('#event-form'); const invalid = $$('input,select,textarea', form).find(el => el.willValidate && !el.checkValidity() && el.id !== 'cover-url'); if (invalid) {
    const fieldset = invalid.closest('[data-fieldset]');
    if (fieldset)
        setEditorStep(Number(fieldset.dataset.fieldset));
    invalid.reportValidity();
    return;
} if (status === 'published' && !editorState.coverUrl) {
    setEditorStep(3);
    $('#event-editor-error').textContent = 'Add a cover image before publishing.';
    return;
} const buttons = [$('#save-draft'), $('#publish-event'), $('#editor-next')]; buttons.forEach(b => b.disabled = true); $('#event-editor-error').textContent = ''; try {
    const payload = formEvent(status), event = await api(editorState.id ? '/events/' + editorState.id : '/events', editorState.id ? 'PATCH' : 'POST', payload);
    organiserData = null;
    await refreshCatalog();
    toast(status === 'published' ? 'Your event is live. Let’s bring people together.' : 'Draft saved. Your next big moment can wait.');
    go('organiser/events');
}
catch (err) {
    $('#event-editor-error').textContent = err.message;
    toast(err.message);
    buttons.forEach(b => b.disabled = false);
} }
async function upload(file) { if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Choose a JPEG, PNG, or WebP image.'); if (file.size > 5 * 1024 * 1024)
    throw new Error('Choose an image under 5 MB.'); return (await api('/uploads', 'POST', file)).url; }
function coverChanged(url) { editorState.coverUrl = url; const zone = $('#cover-zone'); let img = zone.querySelector('img'); if (!img) {
    img = document.createElement('img');
    img.alt = 'Event cover preview';
    zone.prepend(img);
} img.src = url; zone.classList.add('has-image'); $('#preview-cover').src = url; $('#event-editor-error').textContent = ''; }
function wireUploads() { $('#cover-file').onchange = async (ev) => { const file = ev.target.files[0]; if (!file)
    return; toast('Uploading your cover…'); try {
    coverChanged(await upload(file));
    toast('Cover image ready. Looking good.');
}
catch (err) {
    toast(err.message);
} }; $('#apply-cover-url').onclick = () => { const value = $('#cover-url').value.trim(); try {
    if (new URL(value).protocol !== 'https:')
        throw new Error();
    coverChanged(value);
}
catch {
    toast('Paste a valid HTTPS image URL.');
} }; $('#gallery-files').onchange = async (ev) => { const files = [...ev.target.files]; if (files.length + editorState.galleryUrls.length > 5)
    return toast('Choose up to 5 gallery images in total.'); try {
    for (const file of files) {
        toast('Uploading gallery photo…');
        editorState.galleryUrls.push(await upload(file));
        renderGallery();
    }
    toast('Your gallery is ready.');
}
catch (err) {
    toast(err.message);
} }; }
function renderGallery() { $('#gallery-thumbs').innerHTML = editorState.galleryUrls.map((u, i) => `<div class="gallery-thumb"><img src="${esc(u)}" alt="Gallery photo ${i + 1}"><button type="button" data-remove-gallery="${i}" aria-label="Remove gallery photo ${i + 1}">×</button></div>`).join(''); $$('[data-remove-gallery]').forEach(b => b.onclick = () => { editorState.galleryUrls.splice(Number(b.dataset.removeGallery), 1); renderGallery(); }); }
function loading(message) { $('#main-content').innerHTML = `<div class="loading-screen"><span class="loading-ring"></span><h2>${message}</h2></div>`; }
function renderError(title, message) { $('#main-content').innerHTML = `<section class="app-page content-width"><div class="error-panel">${icon('ticket')}<h2>${title}</h2><p>${esc(message)}</p><button class="button blue" id="retry-page">Try again ${icon('arrow-right')}</button><a class="form-switch" href="#discover">Back to experiences</a></div></section>`; $('#retry-page').onclick = () => route(); }
async function refreshCatalog() { const d = await api('/events'); catalog = d.events; return catalog; }
async function route() { const path = (location.hash.slice(1) || 'discover').replace(/^\//, ''); if (path === 'all-events')
    return; ++viewVersion; closeModal(); window.scrollTo(0, 0); $$('.nav-link').forEach(a => a.classList.toggle('active', a.hash === '#' + path)); try {
    if (path.startsWith('login/'))
        return renderAuth(path.split('/')[1], authRegister);
    if (path === 'organiser/new')
        return renderEditor();
    if (path.startsWith('organiser/edit/'))
        return renderEditor(path.split('/')[2]);
    if (path.startsWith('organiser'))
        return renderWorkspace(path);
    if (path === 'tickets')
        return renderTickets();
    if (path === 'saved')
        return renderSaved();
    if (path.startsWith('event/')) {
        const id = path.split('/')[1];
        let e = catalog.find(e => e.id === id);
        if (!e)
            e = await api('/events/' + id);
        return renderEvent(e);
    }
    renderDiscover();
}
catch (err) {
    renderError('Something got in the way.', err.message);
} }
$('#help-button').onclick = () => modal(`<div class="modal-pad"><span class="small-kicker">WE’VE GOT YOU</span><h2 id="modal-title">A little help for your plans.</h2><div class="help-list"><details open><summary>How do I create an event?</summary><p>Choose For organisers, create an organiser account, then use Create event in your workspace. Add your date, venue, ticket tiers, seat counts, cover and gallery. Publish when you’re ready.</p></details><details><summary>How do I buy tickets?</summary><p>Create an attendee account, choose an event, select seats, add ticket-holder details, and continue to checkout. Your seats are reserved while you complete your booking.</p></details><details><summary>Are payments real?</summary><p>Checkout clearly shows the payment mode. The default test checkout never charges money. When merchant credentials are configured, Razorpay handles payment and the server verifies capture before issuing tickets. Sample listings always use test payments.</p></details><details><summary>Where are my QR tickets and refunds?</summary><p>Open My tickets. Confirmed orders have downloadable QR tickets. Pending orders can resume checkout or be cancelled. Refund eligibility follows the policy shown on each event.</p></details></div></div>`);
window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if ($('#search')) {
        $('#search').focus();
        $('#all-events').scrollIntoView();
    }
    else
        go('discover');
} });
async function boot() { icons(); updateHeader(); try {
    health = await api('/health');
    await refreshCatalog();
    if (session) {
        try {
            const d = await api('/auth/me');
            session.user = d.user;
            if (session.user.role === 'attendee')
                await loadOrders();
        }
        catch {
            session = null;
            sessionStorage.removeItem('tr-market-session');
        }
    }
    updateHeader();
    route();
    if (health.transport === 'socketio') {
        const script = document.createElement('script');
        script.src = '/socket.io/socket.io.js';
        script.onload = () => { const socket = window.io({ transports: ['websocket'] }); socket.on('seats:changed', () => { refreshSeatMap(); refreshCatalog(); }); window.ticketRushSocket = socket; };
        document.head.appendChild(script);
    }
}
catch (err) {
    renderError('Your next good time is almost here.', err.message);
} }
setInterval(async () => { if (document.hidden || $('#modal').open || !health.service)
    return; const path = location.hash.slice(1) || 'discover'; try {
    if (path === 'discover' || path === 'saved') {
        await refreshCatalog();
        if (path === 'discover')
            renderCards();
    }
    else if (path.startsWith('event/')) {
        const id = path.split('/')[1], d = await api('/events/' + id);
        const i = catalog.findIndex(e => e.id === id);
        if (i >= 0)
            catalog[i] = d;
        if ($('#detail-available'))
            $('#detail-available').textContent = d.available + ' seats available';
    }
    else if (path === 'tickets' && !document.activeElement.closest('.my-ticket-actions')) {
        await loadOrders();
    }
}
catch { } }, 15000);
boot();
