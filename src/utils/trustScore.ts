import { ConfidenceCategory, TrustScoreBreakdown, SeverityLevel } from '../types';

/**
 * FloodLens TrustScore Engine
 * 
 * Transparent mathematical formulation:
 * TrustScore = (Base_Weight + Corroboration_Score + Evidence_Bonus + Role_Multiplier) * Freshness_Decay
 * Capped between 15% and 98% (never 100% since street floods are volatile dynamic events).
 * 
 * Guiding Principles:
 * 1. Freshness Decay: Floods evolve quickly; a report older than 3 hours loses up to 50% confidence.
 * 2. Spatial Corroboration: Independent reports within 500m reinforce confidence.
 * 3. Photographic Grounding: Visual timestamped proof provides a quantifiable corroboration leap.
 * 4. Transparent Reasoning: Every point gain or penalty is visible to the citizen & municipality.
 * 5. ETHICAL GUARDRAIL: We NEVER mark unmonitored roads as safe or invent flood-free routes.
 */

export function calculateTrustScore(params: {
  reportedTimestamp: number;
  corroborationCount: number;
  hasPhoto: boolean;
  reporterRole: 'Citizen Commuter' | 'Traffic Warden' | 'Flood Volunteer' | 'Municipal Field Officer';
  waterDepthCm: number;
  severity: SeverityLevel;
}): TrustScoreBreakdown {
  const now = Date.now();
  const ageMinutes = Math.max(0, Math.floor((now - params.reportedTimestamp) / (1000 * 60)));

  // 1. Freshness Multiplier:
  // 0 - 30 mins: 1.0 (peak freshness)
  // 30 - 90 mins: 0.90
  // 90 - 180 mins: 0.75
  // 180 - 360 mins: 0.55
  // > 360 mins: 0.40
  let freshnessMultiplier = 1.0;
  let freshnessImpactText = 'Fresh report (< 30m ago), high temporal relevance.';
  if (ageMinutes > 360) {
    freshnessMultiplier = 0.40;
    freshnessImpactText = `Report is ${Math.round(ageMinutes / 60)}h old. Flood levels may have receded or worsened.`;
  } else if (ageMinutes > 180) {
    freshnessMultiplier = 0.55;
    freshnessImpactText = `Report is over 3h old (${Math.round(ageMinutes / 60)}h). Moderate decay applied.`;
  } else if (ageMinutes > 90) {
    freshnessMultiplier = 0.75;
    freshnessImpactText = `Report is ${ageMinutes}m old. Minor freshness discount applied.`;
  } else if (ageMinutes > 30) {
    freshnessMultiplier = 0.90;
    freshnessImpactText = `Report is ${ageMinutes}m old. Strong temporal accuracy.`;
  }

  // 2. Base weight by role
  let baseWeight = 42;
  let roleBonus = 0;
  if (params.reporterRole === 'Municipal Field Officer') {
    roleBonus = 25;
  } else if (params.reporterRole === 'Traffic Warden') {
    roleBonus = 20;
  } else if (params.reporterRole === 'Flood Volunteer') {
    roleBonus = 12;
  } else {
    roleBonus = 5; // Citizen commuter
  }

  // 3. Corroboration Factor
  // 0 corroborations: +0
  // 1 corroboration: +12
  // 2 corroborations: +22
  // 3 corroborations: +30
  // 4+ corroborations: +36
  const corroborationFactor = Math.min(36, params.corroborationCount * 11);

  // 4. Evidence bonus
  const evidenceBonus = params.hasPhoto ? 16 : 0;

  // Raw combined score before decay
  const rawSum = baseWeight + roleBonus + corroborationFactor + evidenceBonus;
  
  // Apply freshness multiplier
  let finalScore = Math.round(rawSum * freshnessMultiplier);

  // Bounds clamp [18, 98]
  finalScore = Math.max(18, Math.min(98, finalScore));

  // Determine Categorical Label
  let confidenceLevel: ConfidenceCategory = 'Single Unverified Report';
  if (ageMinutes > 240 && params.corroborationCount === 0) {
    confidenceLevel = 'Stale / Needs Re-check';
  } else if (params.corroborationCount >= 2 && params.hasPhoto) {
    confidenceLevel = 'High Confidence — Multi-Source';
  } else if (params.corroborationCount >= 1 || params.hasPhoto) {
    confidenceLevel = 'Community Corroborated';
  } else {
    confidenceLevel = 'Single Unverified Report';
  }

  // Generate Reasoning Factors
  const reasoningFactors: TrustScoreBreakdown['reasoningFactors'] = [];

  // Factor 1: Corroboration
  if (params.corroborationCount >= 2) {
    reasoningFactors.push({
      factor: 'Spatial-Temporal Cross-Check',
      impact: 'positive',
      detail: `${params.corroborationCount} independent citizens/wardens corroborated this junction within 350m.`
    });
  } else if (params.corroborationCount === 1) {
    reasoningFactors.push({
      factor: 'Single Corroboration',
      impact: 'positive',
      detail: '1 adjacent report confirmed water accumulation in this zone.'
    });
  } else {
    reasoningFactors.push({
      factor: 'Awaiting Corroboration',
      impact: 'neutral',
      detail: 'No independent confirmations logged yet within the active 45-minute window.'
    });
  }

  // Factor 2: Photo evidence
  if (params.hasPhoto) {
    reasoningFactors.push({
      factor: 'Photographic Reference',
      impact: 'positive',
      detail: 'Photographic evidence attached (illustrative in seeded demo, user-uploaded in live session).'
    });
  } else {
    reasoningFactors.push({
      factor: 'No Photo Evidence',
      impact: 'neutral',
      detail: 'Text report without attached water level photography.'
    });
  }

  // Factor 3: Freshness
  reasoningFactors.push({
    factor: 'Freshness Index',
    impact: freshnessMultiplier >= 0.85 ? 'positive' : freshnessMultiplier >= 0.6 ? 'neutral' : 'negative',
    detail: freshnessImpactText
  });

  // Factor 4: Reporter Role
  if (roleBonus >= 18) {
    reasoningFactors.push({
      factor: 'Official Field Verification',
      impact: 'positive',
      detail: `Report filed by certified ${params.reporterRole}.`
    });
  }

  // Generate clear summary explanation
  const explanation = `${confidenceLevel} (${finalScore}% score): ${
    params.corroborationCount > 0 
      ? `Backed by ${params.corroborationCount} independent corroborations` 
      : 'Initial single report'
  }${params.hasPhoto ? ' with photographic proof' : ''}. ${
    freshnessMultiplier < 0.7 
      ? 'Score discounted due to elapsed time since report.' 
      : 'Recently updated.'
  }`;

  return {
    score: finalScore,
    confidenceLevel,
    freshnessMultiplier,
    corroborationFactor,
    evidenceBonus,
    sourceCredibility: roleBonus,
    explanation,
    reasoningFactors
  };
}

/**
 * Civic Safety Notice constants required for responsible civic tech.
 */
export const CIVIC_SAFETY_NOTICE = {
  TITLE: 'Critical Civic Safety Advisory',
  NO_SAFE_ROUTING: 'FloodLens provides crowdsourced flood intelligence only. Never assume an unmapped or unmentioned street is dry or safe.',
  UNDERPASS_RULE: 'Do not enter submerged underpasses or moving flood waters regardless of vehicle size. 30cm of moving water can float a passenger car.',
  DISCLAIMER: 'All initial demo reports are curated sample data for hackathon evaluation and must not be used for emergency navigation in live disasters.'
};
