{% comment %}
  Outlex – Tradera Annonser Sektion
  Fil: sections/tradera-listings.liquid
{% endcomment %}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">

<style>
  .outlex-tradera {
    --gold: #b8952a;
    --gold-light: #d4af5a;
    --gold-dim: rgba(184,149,42,0.12);
    --dark: #1e1c1a;
    --dark-2: #252320;
    --dark-3: #2e2b27;
    --dark-4: #383430;
    --cream: #f0ebe0;
    --text: #e8e0d0;
    --muted: #8a8070;
    --border: rgba(184,149,42,0.18);
    --font-display: 'Cinzel', serif;
    --font-body: 'Crimson Pro', serif;
    --font-ui: 'Jost', sans-serif;
    background: var(--dark-2);
    padding: 100px 0;
    font-family: var(--font-body);
  }

  .outlex-tradera__inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 60px;
  }

  .outlex-tradera__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 64px;
    gap: 24px;
    flex-wrap: wrap;
  }

  .outlex-tradera__eyebrow {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--gold);
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .outlex-tradera__eyebrow::before {
    content: '';
    width: 32px;
    height: 1px;
    background: var(--gold);
  }

  .outlex-tradera__title {
    font-family: var(--font-display);
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 400;
    letter-spacing: 0.08em;
    line-height: 1;
    color: var(--cream);
    text-transform: uppercase;
    margin: 0;
  }

  .outlex-tradera__cta-top {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--gold);
    text-decoration: none;
    border: 1px solid var(--border);
    padding: 12px 28px;
    transition: all 0.3s;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .outlex-tradera__cta-top:hover {
    border-color: var(--gold);
    background: var(--gold-dim);
  }

  .outlex-tradera__cta-top svg { width: 14px; height: 14px; transition: transform 0.2s; }
  .outlex-tradera__cta-top:hover svg { transform: translateX(3px); }

  .outlex-tradera__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 16px;
    color: var(--muted);
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .outlex-tradera__spinner {
    width: 20px; height: 20px;
    border: 1px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .outlex-tradera__error {
    text-align: center;
    padding: 60px 24px;
    color: var(--muted);
    font-family: var(--font-body);
    font-style: italic;
    font-size: 18px;
  }

  .outlex-tradera__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2px;
  }

  .outlex-tradera__card {
    background: var(--dark-3);
    border: 1px solid var(--border);
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    transition: border-color 0.3s, transform 0.3s;
    opacity: 0;
    transform: translateY(16px);
    animation: fadeUp 0.5s forwards;
  }

  .outlex-tradera__card:nth-child(1) { animation-delay: 0.05s; }
  .outlex-tradera__card:nth-child(2) { animation-delay: 0.1s; }
  .outlex-tradera__card:nth-child(3) { animation-delay: 0.15s; }
  .outlex-tradera__card:nth-child(4) { animation-delay: 0.2s; }
  .outlex-tradera__card:nth-child(5) { animation-delay: 0.25s; }
  .outlex-tradera__card:nth-child(6) { animation-delay: 0.3s; }

  @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

  .outlex-tradera__card:hover {
    border-color: rgba(184,149,42,0.5);
    transform: translateY(-4px);
    z-index: 1;
    position: relative;
  }

  .outlex-tradera__img-wrap {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--dark-4);
  }

  .outlex-tradera__img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    filter: sepia(8%) contrast(1.05);
  }

  .outlex-tradera__card:hover .outlex-tradera__img { transform: scale(1.06); }

  .outlex-tradera__no-img {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); font-size: 48px; opacity: 0.3;
  }

  .outlex-tradera__time-badge {
    position: absolute;
    top: 14px; right: 14px;
    background: rgba(30,28,26,0.9);
    border: 1px solid var(--border);
    backdrop-filter: blur(10px);
    color: var(--gold);
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    padding: 5px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .outlex-tradera__time-badge.urgent { border-color: #c0392b; color: #e74c3c; }

  .outlex-tradera__time-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--gold);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .urgent .outlex-tradera__time-dot { background: #e74c3c; }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  .outlex-tradera__body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 16px;
    border-top: 1px solid var(--border);
  }

  .outlex-tradera__item-title {
    font-family: var(--font-body);
    font-size: 17px;
    font-weight: 400;
    color: var(--text);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  .outlex-tradera__pricing {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: auto;
  }

  .outlex-tradera__bid-label {
    font-family: var(--font-ui);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .outlex-tradera__bid-amount {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 400;
    letter-spacing: 0.05em;
    color: var(--gold);
    line-height: 1;
  }

  .outlex-tradera__bid-currency { font-size: 14px; margin-left: 2px; opacity: 0.7; }

  .outlex-tradera__bid-count {
    font-family: var(--font-ui);
    font-size: 10px;
    color: var(--muted);
    margin-top: 4px;
    letter-spacing: 0.05em;
  }

  .outlex-tradera__buy-now { text-align: right; }

  .outlex-tradera__buy-now-label {
    font-family: var(--font-ui);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .outlex-tradera__buy-now-price {
    font-family: var(--font-body);
    font-size: 16px;
    color: var(--text);
  }

  .outlex-tradera__footer {
    margin-top: 64px;
    text-align: center;
  }

  .outlex-tradera__cta-bottom {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-display);
    font-size: 13px;
    letter-spacing: 0.15em;
    color: var(--dark);
    background: var(--gold);
    padding: 18px 48px;
    text-decoration: none;
    transition: all 0.3s;
    text-transform: uppercase;
  }

  .outlex-tradera__cta-bottom:hover {
    background: var(--gold-light);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(184,149,42,0.3);
  }

  .outlex-tradera__count {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 20px;
  }
</style>

<div class="outlex-tradera">
  <div class="outlex-tradera__inner">

    <div class="outlex-tradera__header">
      <div>
        <p class="outlex-tradera__eyebrow">Live på Tradera</p>
        <h2 class="outlex-tradera__title">{{ section.settings.heading | default: 'Aktiva Auktioner' }}</h2>
      </div>
      <a href="https://www.tradera.com/profile/items/7030056/outlex" target="_blank" rel="noopener" class="outlex-tradera__cta-top">
        Se alla på Tradera
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>

    <div id="outlex-tradera-container">
      <div class="outlex-tradera__loading">
        <div class="outlex-tradera__spinner"></div>
        Hämtar auktioner
      </div>
    </div>

    <div class="outlex-tradera__footer">
      <a href="https://www.tradera.com/profile/items/7030056/outlex" target="_blank" rel="noopener" class="outlex-tradera__cta-bottom">
        Visa alla auktioner
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
      <p class="outlex-tradera__count" id="outlex-item-count"></p>
    </div>

  </div>
</div>

<script>
(function() {
  const API_URL = '{{ section.settings.api_url | default: "https://outlex-tradera.vercel.app/api/tradera" }}';
  const container = document.getElementById('outlex-tradera-container');
  const countEl = document.getElementById('outlex-item-count');

  function formatPrice(amount) {
    if (!amount || amount === 0) return null;
    return new Intl.NumberFormat('sv-SE').format(amount);
  }

  function isUrgent(timeLeft) {
    return timeLeft && !timeLeft.includes('d') && !timeLeft.includes('h');
  }

  function renderItems(items) {
    if (!items || items.length === 0) {
      container.innerHTML = '<div class="outlex-tradera__error">Inga aktiva auktioner just nu.</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'outlex-tradera__grid';

    items.forEach(item => {
      const card = document.createElement('a');
      card.className = 'outlex-tradera__card';
      card.href = item.traderaUrl;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';

      const urgent = isUrgent(item.timeLeft);
      const bidPrice = formatPrice(item.currentBid);
      const buyNow = formatPrice(item.buyNowPrice);

      card.innerHTML = `
        <div class="outlex-tradera__img-wrap">
          ${item.thumbnail
            ? `<img class="outlex-tradera__img" src="${item.thumbnail}" alt="${item.title}" loading="lazy">`
            : `<div class="outlex-tradera__no-img">⚖</div>`}
          ${item.timeLeft ? `
            <div class="outlex-tradera__time-badge ${urgent ? 'urgent' : ''}">
              <span class="outlex-tradera__time-dot"></span>
              ${item.timeLeft}
            </div>` : ''}
        </div>
        <div class="outlex-tradera__body">
          <p class="outlex-tradera__item-title">${item.title || 'Utan titel'}</p>
          <div class="outlex-tradera__pricing">
            <div>
              <div class="outlex-tradera__bid-label">${bidPrice ? 'Högsta bud' : 'Utropspris'}</div>
              <div class="outlex-tradera__bid-amount">${bidPrice || formatPrice(item.reservePrice) || '1'}<span class="outlex-tradera__bid-currency">kr</span></div>
              <div class="outlex-tradera__bid-count">${item.bids > 0 ? item.bids + ' bud' : 'Inga bud ännu'}</div>
            </div>
            ${buyNow ? `<div class="outlex-tradera__buy-now"><div class="outlex-tradera__buy-now-label">Köp nu</div><div class="outlex-tradera__buy-now-price">${buyNow} kr</div></div>` : ''}
          </div>
        </div>`;

      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
    if (countEl) countEl.textContent = items.length + ' aktiva auktioner';
  }

  async function fetchListings() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      renderItems(data.items || []);
    } catch (err) {
      container.innerHTML = '<div class="outlex-tradera__error">Kunde inte ladda auktioner just nu.</div>';
    }
  }

  fetchListings();
})();
</script>

{% schema %}
{
  "name": "Tradera Annonser",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Rubrik",
      "default": "Aktiva Auktioner"
    },
    {
      "type": "text",
      "id": "api_url",
      "label": "Vercel API URL",
      "default": "https://outlex-tradera.vercel.app/api/tradera"
    }
  ],
  "presets": [{ "name": "Tradera Annonser" }]
}
{% endschema %}
