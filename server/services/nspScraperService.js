const axios = require('axios');
const cheerio = require('cheerio');

// Keywords that indicate a real scholarship title
const SCHOLARSHIP_KEYWORDS = [
  'scholarship', 'scheme', 'fellowship', 'stipend', 'award',
  'merit', 'financial assistance', 'post matric', 'pre matric',
  'sc ', 'st ', 'obc', 'minority', 'girl', 'girls', 'ews',
  'aicte', 'ugc', 'nsp', 'dst', 'inspire', 'pragati', 'saksham',
];

// Keywords that indicate navigation/junk text — skip these
const JUNK_KEYWORDS = [
  'click here', 'read more', 'view more', 'state wise', 'statewise',
  'district wise', 'login', 'register', 'home', 'contact', 'about',
  'faq', 'help', 'back', 'next', 'previous', 'download', 'upload',
  'search', 'submit', 'reset', 'cancel', 'close', 'open', 'menu',
  'follow us', 'social', 'facebook', 'twitter', 'youtube', 'instagram',
  'copyright', 'privacy', 'terms', 'disclaimer', 'sitemap',
  'last updated', 'total visitor', 'page visit',
  'ministry', 'government of india',
  'national scholarship portal',
];

const isRealScholarship = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  if (lower.length < 15 || lower.length > 200) return false;
  if (JUNK_KEYWORDS.some(j => lower.includes(j))) return false;
  if (!SCHOLARSHIP_KEYWORDS.some(k => lower.includes(k))) return false;
  if (text === text.toUpperCase() && text.length > 10) return false;
  return true;
};

const scrapeNSP = async () => {
  const urls = [
    'https://scholarships.gov.in/public/schemeGuidelines',
    'https://scholarships.gov.in',
  ];

  let html = null;
  let workingUrl = null;

  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      html = response.data;
      workingUrl = url;
      console.log(`NSP scraper: connected to ${url}`);
      break;
    } catch (e) {
      console.log(`NSP scraper: ${url} failed — ${e.message}`);
    }
  }

  if (!html) throw new Error('All NSP URLs blocked. Using fallback.');

  const $ = cheerio.load(html);
  const seen = new Set();
  const schemes = [];

  // Remove junk elements from DOM before parsing
  $('nav, header, footer, script, style, .navbar, .footer, .header, .breadcrumb, .pagination, .social-links').remove();

  // Strategy 1: Table rows
  $('table tr').each((i, el) => {
    if (i === 0) return;
    const cols = $(el).find('td');
    if (cols.length < 1) return;
    let title = '';
    let link = $(el).find('a').first().attr('href') || '';
    cols.each((j, col) => {
      const text = $(col).text().trim();
      if (isRealScholarship(text) && text.length > title.length) title = text;
    });
    if (!title || seen.has(title.toLowerCase())) return;
    seen.add(title.toLowerCase());
    const desc = cols.length > 1 ? $(cols[1]).text().trim() : '';
    schemes.push(buildScheme(title, desc, link));
  });

  // Strategy 2: List items
  if (schemes.length < 3) {
    $('li, .scheme-item, .scholarship-item, [class*="scheme"], [class*="scholarship"]').each((i, el) => {
      const title = $(el).find('a').first().text().trim() || $(el).text().trim().split('\n')[0];
      if (!isRealScholarship(title) || seen.has(title.toLowerCase())) return;
      seen.add(title.toLowerCase());
      const link = $(el).find('a').first().attr('href') || '';
      const desc = $(el).find('p, span').first().text().trim();
      schemes.push(buildScheme(title, desc, link));
    });
  }

  // Strategy 3: Anchor tags
  if (schemes.length < 3) {
    $('a').each((i, el) => {
      const title = $(el).text().trim();
      if (!isRealScholarship(title) || seen.has(title.toLowerCase())) return;
      seen.add(title.toLowerCase());
      const href = $(el).attr('href') || '';
      schemes.push(buildScheme(title, '', href));
    });
  }

  console.log(`NSP scraper: found ${schemes.length} valid schemes from ${workingUrl}`);
  if (schemes.length === 0) throw new Error('NSP page loaded but no valid scholarship entries found.');
  return schemes;
};

const buildScheme = (title, desc, link) => ({
  title: title.trim(),
  description: desc?.trim() || `Government scholarship scheme: ${title.trim()}`,
  courseRequired: ['All'],
  categoryRequired: inferCategory(title),
  incomeLimit: inferIncomeLimit(title),
  state: ['All'],
  minPercentage: inferPercentage(title),
  genderRequired: inferGender(title),
  deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  officialLink: link?.startsWith('http') ? link : `https://scholarships.gov.in${link || ''}`,
  amount: 'As per scheme guidelines',
  source: 'NSP',
  sourceUrl: 'https://scholarships.gov.in',
  apiFetched: true,
});

const inferCategory = (title) => {
  const t = title.toLowerCase();
  const cats = [];
  if (t.includes(' sc ') || t.includes('scheduled caste') || t.includes(' sc/')) cats.push('SC');
  if (t.includes(' st ') || t.includes('scheduled tribe') || t.includes('/st')) cats.push('ST');
  if (t.includes('obc')) cats.push('OBC');
  if (t.includes('minority') || t.includes('minorities')) cats.push('Minority');
  if (t.includes('ews')) cats.push('EWS');
  return cats.length > 0 ? cats : ['All'];
};

const inferIncomeLimit = (title) => {
  const t = title.toLowerCase();
  if (t.includes('merit') && !t.includes('means')) return 0;
  if (t.includes('post matric') || t.includes('pre matric')) return 250000;
  if (t.includes('minority')) return 200000;
  return 0;
};

const inferPercentage = (title) => {
  const t = title.toLowerCase();
  if (t.includes('merit') || t.includes('inspire') || t.includes('top')) return 80;
  return 0;
};

const inferGender = (title) => {
  const t = title.toLowerCase();
  if (t.includes(' girl') || t.includes(' girls') || t.includes('women') || t.includes('female')) return 'Female';
  return 'All';
};

module.exports = scrapeNSP;