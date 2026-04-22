// api/tradera.js - Vercel Serverless Function
const APP_ID = process.env.TRADERA_APP_ID || '5909';
const APP_KEY = process.env.TRADERA_APP_KEY || 'ceadfa2c-9481-4d25-930d-8390c639e911';
const SELLER_ID = process.env.TRADERA_SELLER_ID || '7030056';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sellerItemsUrl = `https://api.tradera.com/v3/PublicService.asmx/GetSellerItems?appId=${APP_ID}&appKey=${APP_KEY}&sellerId=${SELLER_ID}&pageNumber=1&itemsPerPage=50`;
    const sellerRes = await fetch(sellerItemsUrl);
    const sellerXml = await sellerRes.text();

    // Try multiple ID tag formats
    let itemIds = [...sellerXml.matchAll(/<Id>(\d+)<\/Id>/g)].map(m => m[1]);
    if (itemIds.length === 0) itemIds = [...sellerXml.matchAll(/<ItemId>(\d+)<\/ItemId>/g)].map(m => m[1]);
    if (itemIds.length === 0) itemIds = [...sellerXml.matchAll(/<id>(\d+)<\/id>/g)].map(m => m[1]);

    if (itemIds.length === 0) {
      // Return debug info so we can see the raw XML
      return res.status(200).json({ items: [], count: 0, debug: sellerXml.substring(0, 1000) });
    }

    const itemsToFetch = itemIds.slice(0, 20);
    const itemDetails = await Promise.all(
      itemsToFetch.map(async (id) => {
        try {
          const itemUrl = `https://api.tradera.com/v3/PublicService.asmx/GetItem?appId=${APP_ID}&appKey=${APP_KEY}&itemId=${id}`;
          const itemRes = await fetch(itemUrl);
          const itemXml = await itemRes.text();
          return parseItem(itemXml, id);
        } catch (e) { return null; }
      })
    );

    const validItems = itemDetails.filter(item => item !== null && item.title);
    return res.status(200).json({ items: validItems, count: validItems.length, sellerId: SELLER_ID, fetchedAt: new Date().toISOString() });

  } catch (error) {
    return res.status(500).json({ error: 'Kunde inte hämta annonser', details: error.message });
  }
}

function parseItem(xml, id) {
  const get = (tag) => {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].trim() : '';
  };
  const getInt = (tag) => { const val = get(tag); return val ? parseInt(val, 10) : 0; };

  const imageMatches = [...xml.matchAll(/<Url>(https?:\/\/[^<]+)<\/Url>/g)];
  const images = imageMatches.map(m => m[1]);

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
    id, title: get('Title') || get('ShortDescription'),
    currentBid: getInt('MaxBid'), reservePrice: getInt('ReservePrice'),
    buyNowPrice: getInt('BuyNowPrice'), currency: 'SEK',
    endDate: endDateStr, timeLeft, images, thumbnail: images[0] || '',
    bids: getInt('BidCount'), traderaUrl: `https://www.tradera.com/item/${id}`,
  };
}
