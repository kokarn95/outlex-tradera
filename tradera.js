// api/tradera.js - Vercel Serverless Function
// Hämtar aktiva annonser från Tradera för säljaren Outlex

const APP_ID = process.env.TRADERA_APP_ID || '5909';
const APP_KEY = process.env.TRADERA_APP_KEY || 'ceadfa2c-9481-4d25-930d-8390c639e911';
const SELLER_ID = process.env.TRADERA_SELLER_ID || '7030056';

export default async function handler(req, res) {
  // CORS headers so Shopify can call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // Cache 5 min

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Step 1: Get seller's active item IDs
    const sellerItemsUrl = `https://api.tradera.com/v3/PublicService.asmx/GetSellerItems?appId=${APP_ID}&appKey=${APP_KEY}&sellerId=${SELLER_ID}&pageNumber=1&itemsPerPage=50`;

    const sellerRes = await fetch(sellerItemsUrl);
    const sellerXml = await sellerRes.text();

    // Parse item IDs from XML
    const itemIds = [...sellerXml.matchAll(/<Id>(\d+)<\/Id>/g)].map(m => m[1]);

    if (itemIds.length === 0) {
      return res.status(200).json({ items: [], count: 0 });
    }

    // Step 2: Fetch details for each item (max 20 to stay within rate limits)
    const itemsToFetch = itemIds.slice(0, 20);
    const itemDetails = await Promise.all(
      itemsToFetch.map(async (id) => {
        try {
          const itemUrl = `https://api.tradera.com/v3/PublicService.asmx/GetItem?appId=${APP_ID}&appKey=${APP_KEY}&itemId=${id}`;
          const itemRes = await fetch(itemUrl);
          const itemXml = await itemRes.text();
          return parseItem(itemXml, id);
        } catch (e) {
          return null;
        }
      })
    );

    const validItems = itemDetails.filter(item => item !== null && item.title);

    return res.status(200).json({
      items: validItems,
      count: validItems.length,
      sellerId: SELLER_ID,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Tradera API error:', error);
    return res.status(500).json({ error: 'Kunde inte hämta annonser från Tradera', details: error.message });
  }
}

function parseItem(xml, id) {
  const get = (tag) => {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].trim() : '';
  };

  const getInt = (tag) => {
    const val = get(tag);
    return val ? parseInt(val, 10) : 0;
  };

  // Parse images - get all image URLs
  const imageMatches = [...xml.matchAll(/<Url>(https?:\/\/[^<]+)<\/Url>/g)];
  const images = imageMatches.map(m => m[1]).filter(url => url.includes('tradera') || url.includes('cdn'));

  // Parse end date
  const endDateStr = get('EndDate');
  const endDate = endDateStr ? new Date(endDateStr) : null;

  // Calculate time left
  let timeLeft = '';
  if (endDate) {
    const now = new Date();
    const diff = endDate - now;
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) timeLeft = `${days}d ${hours}h`;
      else if (hours > 0) timeLeft = `${hours}h ${minutes}m`;
      else timeLeft = `${minutes}m`;
    } else {
      timeLeft = 'Avslutad';
    }
  }

  const maxBid = getInt('MaxBid');
  const reservePrice = getInt('ReservePrice');
  const buyNowPrice = getInt('BuyNowPrice');

  return {
    id: id,
    title: get('Title') || get('ShortDescription'),
    description: get('LongDescription') || get('ShortDescription'),
    currentBid: maxBid,
    reservePrice: reservePrice,
    buyNowPrice: buyNowPrice,
    currency: 'SEK',
    endDate: endDateStr,
    timeLeft: timeLeft,
    images: images,
    thumbnail: images[0] || '',
    bids: getInt('BidCount'),
    category: get('CategoryName'),
    condition: get('Condition'),
    traderaUrl: `https://www.tradera.com/item/${id}`,
    isAuction: maxBid > 0 || reservePrice > 0,
  };
}
