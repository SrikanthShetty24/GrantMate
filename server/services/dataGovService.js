const axios = require('axios');

const fetchFromDataGov = async () => {
  const apiKey = process.env.DATA_GOV_API_KEY;

  if (!apiKey) throw new Error('data.gov.in API key not configured');

  // Search-based endpoint — no resource ID needed
  const response = await axios.get(
    'https://api.data.gov.in/catalog/search',
    {
      params: {
        'api-key': apiKey,
        format: 'json',
        filters: JSON.stringify({ keyword: 'scholarship' }),
        limit: 50,
        offset: 0,
      },
      timeout: 10000,
    }
  );

  console.log('data.gov.in response:', JSON.stringify(response.data).substring(0, 500));

  const records = response.data?.results || response.data?.records || response.data?.data || [];

  if (!records.length) throw new Error('No records returned from data.gov.in');

  return records.map(r => ({
    title: r.title || r.name || r.scheme_name || 'Unnamed Scheme',
    description: r.description || r.desc || r.details || 'Government scholarship scheme.',
    courseRequired: ['All'],
    categoryRequired: ['All'],
    incomeLimit: 0,
    state: ['All'],
    minPercentage: 0,
    genderRequired: 'All',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    officialLink: r.url || r.link || r.source || 'https://data.gov.in',
    amount: 'As per scheme guidelines',
    source: 'data.gov.in',
    sourceUrl: 'https://data.gov.in',
    apiFetched: true,
  }));
};

module.exports = fetchFromDataGov;