interface SuburbDetails {
  weeklyRent: number;
  transportScore: number;
  vibe: string | string[];
}

interface Preferences {
  budget: number;
  minTransportScore: number;
  preferredVibe: string;
}

interface MatchResult {
  score: number;
  tier: 'RECOMMENDED' | 'MARGINAL' | 'OUT_OF_BUDGET' | 'POOR_MATCH';
  summary: string[];
}

export function calculateMatchScore(
  suburbDetails: SuburbDetails,
  preferences: Preferences,
  commuteMinutes: number | null,
): MatchResult {
  let score = 100;
  const summary: string[] = [];

  const { weeklyRent, transportScore, vibe } = suburbDetails;
  const { budget, minTransportScore, preferredVibe } = preferences;

  // 1. Budget Calculation
  const isOverBudget = weeklyRent > budget;

  if (isOverBudget) {
    const overage = weeklyRent - budget;
    score -= (overage / 10) * 5;
    summary.push(`⚠️ Rent is $${overage} over your weekly budget.`);
  } else {
    summary.push(`✅ Rent ($${weeklyRent}) fits within your budget.`);
  }

  // 2. Commute Calculation
  const maxIdealCommute = 45;

  if (commuteMinutes === null) {
    summary.push(`⚠️ Commute time unavailable.`);
    score -= 10;
  } else if (commuteMinutes > maxIdealCommute) {
    const extraMinutes = commuteMinutes - maxIdealCommute;
    score -= extraMinutes * 1.5;
    summary.push(`⚠️ Commute is long (approx. ${commuteMinutes} mins).`);
  } else {
    summary.push(`✅ Great commute time (${commuteMinutes} mins).`);
  }

  // 3. Transport Score Calculation
  if (transportScore < minTransportScore) {
    const gap = minTransportScore - transportScore;
    score -= gap * 10;
    summary.push(`⚠️ Transport access is lower than requested.`);
  } else {
    summary.push(`✅ Transport score meets your preference.`);
  }

  // 4. Vibe Calculation
  if (preferredVibe !== 'Any') {
    const suburbVibes = Array.isArray(vibe) ? vibe : [vibe];

    if (!suburbVibes.includes(preferredVibe)) {
      score -= 20;
      summary.push(`⚠️ Does not match your preferred vibe.`);
    } else {
      summary.push(`✅ Matches your preferred '${preferredVibe}' lifestyle.`);
    }
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let tier: MatchResult['tier'] = 'POOR_MATCH';

  if (weeklyRent > budget + 50) {
    tier = 'OUT_OF_BUDGET';
  } else if (finalScore >= 80) {
    tier = 'RECOMMENDED';
  } else if (finalScore >= 50) {
    tier = 'MARGINAL';
  }

  return {
    score: finalScore,
    tier,
    summary: summary.slice(0, 3),
  };
}
