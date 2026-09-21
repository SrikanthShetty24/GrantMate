/**
 * Server-side eligibility matching engine.
 * Matches an array of scholarships against a student profile using 6 criteria.
 */
const matchEligible = (scholarships, profile) => {
  return scholarships.filter(s => {
    const incomeOk = s.incomeLimit === 0 || profile.annualIncome <= s.incomeLimit;

    const categoryOk = s.categoryRequired.includes('All') || s.categoryRequired.includes(profile.category);

    const courseOk = s.courseRequired.includes('All') || s.courseRequired.includes(profile.course);

    const percentageOk = s.minPercentage === 0 || profile.percentage >= s.minPercentage;

    const stateOk = s.state.includes('All') || s.state.includes(profile.state);

    const genderOk = s.genderRequired === 'All' || s.genderRequired === profile.gender;

    const deadlineOk = new Date(s.deadline) >= new Date();

    return incomeOk && categoryOk && courseOk && percentageOk && stateOk && genderOk && deadlineOk;
  });
};

module.exports = { matchEligible };
