const Scholarship = require('../models/Scholarship');

/**
 * Filters out scholarships that already exist in DB (by title + deadline).
 */
const deduplicateScholarships = async (incoming) => {
  if (!incoming.length) return [];

  const existing = await Scholarship.find({}, 'title deadline').lean();
  const existingSet = new Set(
    existing.map(s => `${s.title.toLowerCase().trim()}|${new Date(s.deadline).toDateString()}`)
  );

  return incoming.filter(s => {
    const key = `${s.title.toLowerCase().trim()}|${new Date(s.deadline).toDateString()}`;
    return !existingSet.has(key);
  });
};

module.exports = { deduplicateScholarships };
