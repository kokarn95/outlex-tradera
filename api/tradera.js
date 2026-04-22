// api/tradera.js - Vercel Serverless Function
const APP_ID = process.env.TRADERA_APP_ID || '5909';
const APP_KEY = process.env.TRADERA_APP_KEY || 'ceadfa2c-9481-4d25-930d-8390c639e911';
const SELLER_ALIAS = process.env.TRADERA_SELLER_ALIAS || 'outlex';

async function soapRequest(service, method, bodyParams, extraHeaders = '') {
  const paramXml = Object.entries(bodyParams)
    .map(([k, v]) => `<${k}>${v}</${k}>`)
    .join('\n      ');

  const body = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthenticationHeader xmlns="http://api.tradera.com">
      <AppId>${APP_ID}</AppId>
      <AppKey>${APP_KEY}</AppKey>
    </AuthenticationHeader>
    <ConfigurationHeader xmlns="http://api.tradera.com">
      <Sandbox>0</Sandbox>
      <MaxResultAge>0</MaxResultAge>
    </ConfigurationHeader>
    ${extraHeaders}
  </soap:Header>
  <soap:Body>
    <${method} xmlns="http://api.tradera.com">
      ${paramXml}
    </${method}>
  </soap:Body>
</soap:Envelope>`;

  const res = await fetch(`https://api.tradera.com/v3/${service}.asmx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `"http://api.tradera.com/${method}"`,
    },
    body,
  });
  return res.text();
}

function getTag(xml, tag) {
  const match = xml.match(new RegExp(`<(?:[^:>]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[^:>]+:)?${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function getAllBlocks(xml, tag) {
  return [...xml.matchAll(new RegExp(`<(?:[^:>]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[^:>]+:)?${tag}>`, 'gi'))].map(m => m[1].trim());
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Step 1: Get userId from alias
    const userXml = await soapRequest('PublicService', 'GetUserByAlias', { alias: SELLER_ALIAS });
    const userId = getTag(userXml, "Id");

    if (!userId) {
      return res.status(200).json({ items: [], count: 0, step: 'getUserByAlias', debug: userXml.substring(0, 800) });
    }

    // Step 2: Get seller items using userId
    const itemsXml = await soapRequest('PublicService', 'GetSellerItems', {
      userId: userId,
      categoryId: 0,
      filterActive: 'Active',
      minEndDate: '2000-01-01T00:00:00',
      maxEndDate: '2099-01-01T00:00:00',
      filterItemType: 'All',
    });

    // Parse item blocks
    const itemBlocks = getAllBlocks(itemsXml, 'Item');

    if (itemBlocks.length === 0) {
      return res.status(200).json({ items: [], count: 0, userId, step: 'getSellerItems', debug: itemsXml.substring(0, 800) });
    }

    // Parse each item
    const items = itemBlocks.map(block => {
      const get = (tag) => getTag(block, tag);
      const getInt = (tag) => { const v = get(tag); return v ? parseInt(v, 10) : 0; };

      const id = get('Id') || get('ItemId');
      const images = getAllBlocks(block, 'Url').filter(u => u.startsWith('http'));

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
        thumbnail: images.find(u => u.includes('/images/')) || images[0] || '',
        bids: getInt('BidCount'),
        traderaUrl: `https://www.tradera.com/item/${id}`,
      };
    }).filter(item => item.id && item.title);

    return res.status(200).json({ items, count: items.length, fetchedAt: new Date().toISOString() });

  } catch (error) {
    return res.status(500).json({ error: 'Kunde inte hämta annonser', details: error.message });
  }
}
