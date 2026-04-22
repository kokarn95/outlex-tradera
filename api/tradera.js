// api/tradera.js - Vercel Serverless Function
const APP_ID = process.env.TRADERA_APP_ID || '5909';
const APP_KEY = process.env.TRADERA_APP_KEY || 'ceadfa2c-9481-4d25-930d-8390c639e911';
const SELLER_ALIAS = process.env.TRADERA_SELLER_ALIAS || 'outlex';

async function soapRequest(service, method, params) {
  const paramXml = Object.entries(params)
    .map(([k, v]) => `<${k}>${v}</${k}>`)
    .join('');

  const body = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthenticationHeader xmlns="http://api.tradera.com">
      <AppId>${APP_ID}</AppId>
      <AppKey>${APP_KEY}</AppKey>
    </AuthenticationHeader>
  </soap:Header>
  <soap:Body>
    <${method} xmlns="http://api.tradera.com">
      ${paramXml}
    </${method}>
  </soap:Body>
</soap:Envelope>`;

  const url = `https://api.tradera.com/v3/${service}.asmx`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `http://api.tradera.com/${method}`,
    },
    body,
  });
  return res.text();
}

function getTag(xml, tag) {
  const match = xml.match(new RegExp(`<(?:[^:>]+:)?${tag}>([\\s\\S]*?)<\\/(?:[^:>]+:)?${tag}>`));
  return match ? match[1].trim() : '';
}

function getAllTags(xml, tag) {
  return [...xml.matchAll(new RegExp(`<(?:[^:>]+:)?${tag}>([\\s\\S]*?)<\\/(?:[^:>]+:)?${tag}>`, 'g'))].map(m => m[1].trim());
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Use GetSellerItems with SOAP - correct format
    const searchXml = await soapRequest('PublicService', 'GetSellerItems', {
      sellerId: 7030056,
      pageNumber: 1,
      itemsPerPage: 50,
    });

    const itemIds = getAllTags(searchXml, 'Id');

    if (itemIds.length === 0) {
      return res.status(200).json({ items: [], count: 0, debug: searchXml.substring(0, 1000) });
    }

    const itemsToFetch = itemIds.slice(0, 20);
    const itemDetails = await Promise.all(
      itemsToFetch.map(async (id) => {
        try {
          const itemXml = await soapRequest('PublicService', 'GetItem', { itemId: id });
          return parseItem(itemXml, id);
        } catch (e) { return null; }
      })
    );

    const validItems = itemDetails.filter(item => item !== null && item.title);
    return res.status(200).json({ items: validItems, count: validItems.length, fetchedAt: new Date().toISOString() });

  } catch (error) {
    return res.status(500).json({ error: 'Kunde inte hämta annonser', details: error.message });
  }
}

function parseItem(xml, id) {
  const get = (tag) => getTag(xml, tag);
  const getInt = (tag) => { const val = get(tag); return val ? parseInt(val, 10) : 0; };

  const images = getAllTags(xml, 'Url').filter(u => u.startsWith('http'));

  const endDateStr = get('EndDate');
  const endDate = endDateStr ? new Date(endDateStr) : null;
  let timeLeft = '';
  if (endDate) {
    const diff = endDate - new Date();
    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      if (days > 0) timeLeft = `${days}d ${hours}h`;
      else if (hours > 0) timeLeft = `${hours}h ${minutes}m`;
      else timeLeft = `${minutes}m`;
    } else { timeLeft = 'Avslutad'; }
  }

  return {
    id,
    title: get('Title') || get('ShortDescription'),
    currentBid: getInt('MaxBid'),
    reservePrice: getInt('ReservePrice'),
    buyNowPrice: getInt('BuyNowPrice'),
    currency: 'SEK',
    endDate: endDateStr,
    timeLeft,
    images,
    thumbnail: images[0] || '',
    bids: getInt('BidCount'),
    traderaUrl: `https://www.tradera.com/item/${id}`,
  };
}
