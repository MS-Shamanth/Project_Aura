const AURA_CONFIG = {
  champion_uri: 'models:/workspace.default.aura_credit_champion@champion',
  challenger_uri: 'models:/workspace.default.aura_credit_challenger@challenger',
  gold_tables: {
    drift_metrics: 'gold.drift_metrics',
    model_comparison: 'gold.model_comparison',
    retraining_log: 'gold.retraining_log',
    llm_evaluation: 'gold.llm_evaluation_metrics',
  },
  champion_auc: 0.7210,
  challenger_auc: 0.7540,
  feature_count: 11,
  feature_cols: [
    'income', 'age_years', 'credit_income_ratio', 'employment_years',
    'ext_source_1', 'ext_source_2', 'ext_source_3', 'ext_mean', 'ext_min',
    'income_age_ratio', 'credit_per_year'
  ],
};

const DRIFT_DATA = [
  { feature: 'income',              psi_score: 0.45, status: 'CRITICAL DRIFT', action: 'TRIGGER RETRAIN' },
  { feature: 'credit_income_ratio', psi_score: 0.45, status: 'CRITICAL DRIFT', action: 'TRIGGER RETRAIN' },
  { feature: 'age_years',           psi_score: 0.08, status: 'STABLE',         action: 'MONITOR' },
];

const RETRAIN_DATA = {
  event: 'AUTONOMOUS_RETRAIN',
  trigger: 'PSI > 0.2',
  champion_auc: 0.7210,
  challenger_auc: 0.7540,
  message: 'PROMOTED CHALLENGER TO PRODUCTION',
};

const HALLUC_FIREWALL_DATA = [
  { app_id: 'APP_001', error_type: 'Regulatory Hallucination', cited_law: 'Section 23B',    action: 'BLOCKED'  },
  { app_id: 'APP_002', error_type: 'Factual Mismatch',         cited_law: 'None',            action: 'BLOCKED'  },
  { app_id: 'APP_003', error_type: 'None',                     cited_law: 'RBI/2015-16/76',  action: 'APPROVED' },
];

const PSI_FEATURES = [
  { name: 'income',              psi: 0.45, severity: 'high',   training_mean: 168797, production_mean: 124312, action: 'Retrain triggered' },
  { name: 'credit_income_ratio', psi: 0.45, severity: 'high',   training_mean: 7.14,   production_mean: 12.3,   action: 'Retrain triggered' },
  { name: 'age_years',           psi: 0.08, severity: 'low',    training_mean: 43.1,   production_mean: 39.4,   action: 'Stable' },
  { name: 'employment_years',    psi: 0.06, severity: 'low',    training_mean: 6.2,    production_mean: 5.9,    action: 'Stable' },
  { name: 'debt_service_ratio',  psi: 0.04, severity: 'low',    training_mean: 0.21,   production_mean: 0.22,   action: 'Stable' },
];

const LLM_EVALUATIONS = [
  {
    id: 1,
    explanation: 'Based on RBI/2022-23/103, your debt-service ratio of 0.62 exceeds threshold. Employment stability of 2 years is below the 5-year preferred baseline per RBI/2021-22/125.',
    citations: ['RBI/2022-23/103', 'RBI/2021-22/125'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
  {
    id: 2,
    explanation: 'Per Section 23B of the Banking Regulation Act, a minimum CIBIL score of 750 is mandatory for this loan category.',
    citations: ['Section 23B'],
    hallucinated: ['Section 23B'],
    grounding_score: 0.0,
    halluc_score: 1.0,
    has_hallucination: true,
  },
  {
    id: 3,
    explanation: 'As per RBI Circular RBI/2023/999, NBFCs must reject applicants with employment tenure under 6 months.',
    citations: ['RBI/2023/999'],
    hallucinated: ['RBI/2023/999'],
    grounding_score: 0.0,
    halluc_score: 1.0,
    has_hallucination: true,
  },
  {
    id: 4,
    explanation: 'Your income of ₹3.2L per annum results in a credit-income ratio of 9.4, exceeding the NBFC lending guideline under RBI/2022-23/103.',
    citations: ['RBI/2022-23/103'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
  {
    id: 5,
    explanation: 'Under Article 15C of the RBI Master Direction on Credit, a debt-service ratio above 0.4 is prohibited.',
    citations: ['Article 15C'],
    hallucinated: ['Article 15C'],
    grounding_score: 0.0,
    halluc_score: 1.0,
    has_hallucination: true,
  },
  {
    id: 6,
    explanation: 'Per SEBI/LAD-NRO/GN/2021/29 and DBR.No.Dir.BC.12/13.03.00/2015-16, the applicant\'s profile meets lending criteria. Loan approved.',
    citations: ['SEBI/LAD-NRO/GN/2021/29', 'DBR.No.Dir.BC.12/13.03.00/2015-16'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
  {
    id: 7,
    explanation: 'Employment history of 8 years and income of ₹6.5L supports loan approval per Digital Lending Guidelines RBI/2021-22/125.',
    citations: ['RBI/2021-22/125'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
  {
    id: 8,
    explanation: 'Loan rejected under Credit Rating Agencies norms SEBI/LAD-NRO/GN/2021/29 due to high debt-service ratio.',
    citations: ['SEBI/LAD-NRO/GN/2021/29'],
    hallucinated: [],
    grounding_score: 1.0,
    halluc_score: 0.0,
    has_hallucination: false,
  },
];

const VALID_REGULATIONS = [
  'DBR.No.Dir.BC.12/13.03.00/2015-16',
  'RBI/2021-22/125',
  'RBI/2022-23/103',
  'RBI/2023-24/73',
  'RBI/2015-16/76',
  'SEBI/LAD-NRO/GN/2021/29',
];

const REJECTION_EXPLANATIONS = [
  'Based on RBI/2022-23/103 (Fair Practices Code for NBFCs), your application was assessed against our 11-feature credit risk model. Your credit-income ratio of {cir} significantly exceeds the acceptable threshold. Combined with external source scores (ext_mean: {ext_mean}), the model determined a default probability of {prob}%. Employment tenure of {emp_years} years is below the 5-year preferred baseline per RBI/2021-22/125.',
  'As per the Digital Lending Guidelines (RBI/2021-22/125), your application has been evaluated across 11 engineered features. The credit_per_year of {cpy} and income_age_ratio of {iar} indicate disproportionate credit exposure relative to earning capacity. The Random Forest model flagged elevated risk.',
  'Under DBR.No.Dir.BC.12/13.03.00/2015-16, your profile was assessed using external bureau scores (ext_source_2: {ext2}, ext_source_3: {ext3}) and credit ratios. The credit-income ratio of {cir} combined with limited employment stability indicate that loan approval poses significant default risk.',
];

const APPROVAL_EXPLANATIONS = [
  'Your application has been reviewed against RBI/2021-22/125 (Digital Lending Guidelines). With employment tenure of {emp_years} years, a healthy credit-income ratio of {cir}, and strong external bureau scores (ext_mean: {ext_mean}), your profile meets all 11 credit risk criteria. Default probability: {prob}%. Loan approved.',
  'As per RBI/2022-23/103 (Fair Practices Code for NBFCs), your credit profile demonstrates stable repayment capacity. Your external source scores (ext_source_2: {ext2}, ext_source_3: {ext3}) and credit_per_year of {cpy} confirm low risk. Approved with confidence.',
];

const DEMO_PROFILES = {
  high_risk: {
    label: 'High Risk Customer',
    probability: 0.424,
    approved: false,
    features: {
      income:               0.9,
      age_years:            51.5288,
      credit_income_ratio:  10.0,
      employment_years:     2.1068,
      ext_source_1:         0.5,
      ext_source_2:         0.5053,
      ext_source_3:         0.6347,
      ext_mean:             0.5467,
      ext_min:              0.5,
      income_age_ratio:     0.0175,
      credit_per_year:      3.2187,
    },
  },
  low_risk: {
    label: 'Low Risk Customer',
    probability: 0.058,
    approved: true,
    features: {
      income:               1.575,
      age_years:            27.474,
      credit_income_ratio:  2.1802,
      employment_years:     4.463,
      ext_source_1:         0.5,
      ext_source_2:         0.855,
      ext_source_3:         0.6956,
      ext_mean:             0.6835,
      ext_min:              0.5,
      income_age_ratio:     0.0573,
      credit_per_year:      0.3991,
    },
  },
};

async function API_scoreLoan(payload) {
  await mockDelay(900);

  if (payload._preset) {
    const profile = DEMO_PROFILES[payload._preset];
    const feats = profile.features;
    const prob = profile.probability;
    const approved = profile.approved;

    const templates = approved ? APPROVAL_EXPLANATIONS : REJECTION_EXPLANATIONS;
    const template = templates[Math.floor(Math.random() * templates.length)];
    const explanation = template
      .replace('{income}', feats.income.toFixed(4))
      .replace('{cir}', feats.credit_income_ratio.toFixed(4))
      .replace('{emp_years}', feats.employment_years.toFixed(2))
      .replace('{ext_mean}', feats.ext_mean.toFixed(4))
      .replace('{ext2}', feats.ext_source_2.toFixed(4))
      .replace('{ext3}', feats.ext_source_3.toFixed(4))
      .replace('{cpy}', feats.credit_per_year.toFixed(4))
      .replace('{iar}', feats.income_age_ratio.toFixed(4))
      .replace('{prob}', (prob * 100).toFixed(1));

    const hallucination = detectHallucinations(explanation);

    return {
      approved,
      probability: prob,
      features: feats,
      explanation,
      hallucination,
      model: 'aura_credit_champion/Production',
      preset_used: payload._preset,
    };
  }

  const income = payload.income;
  const age_years = Math.abs(payload.age);
  const credit_income_ratio = payload.credit / payload.income;
  const employment_years = Math.max(0, payload.employment_years);
  const ext_source_1 = 0.5;
  const ext_source_2 = payload.ext_source_2 || 0.5;
  const ext_source_3 = payload.ext_source_3 || 0.5;
  const ext_mean = (ext_source_1 + ext_source_2 + ext_source_3) / 3;
  const ext_min = Math.min(ext_source_1, ext_source_2, ext_source_3);
  const income_age_ratio = income / (age_years * 10000);
  const credit_per_year = credit_income_ratio / (employment_years || 1);

  let default_prob = 0.12;
  if (credit_income_ratio > 8)       default_prob += 0.18;
  else if (credit_income_ratio > 5)  default_prob += 0.08;
  if (employment_years < 2)          default_prob += 0.10;
  else if (employment_years < 4)     default_prob += 0.04;
  if (ext_mean < 0.55)               default_prob += 0.08;
  if (ext_source_2 < 0.55)           default_prob += 0.06;
  if (credit_per_year > 2.5)         default_prob += 0.08;
  if (income_age_ratio < 0.02)       default_prob += 0.05;
  if (age_years > 50)                default_prob += 0.04;
  default_prob = Math.min(0.95, Math.max(0.02, default_prob));

  const approved = default_prob < 0.35;

  const feats = {
    income, age_years, credit_income_ratio,
    employment_years, ext_source_1, ext_source_2, ext_source_3,
    ext_mean, ext_min, income_age_ratio, credit_per_year,
  };

  const templates = approved ? APPROVAL_EXPLANATIONS : REJECTION_EXPLANATIONS;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const explanation = template
    .replace('{income}', income.toLocaleString('en-IN'))
    .replace('{cir}', credit_income_ratio.toFixed(4))
    .replace('{emp_years}', employment_years.toFixed(2))
    .replace('{ext_mean}', ext_mean.toFixed(4))
    .replace('{ext2}', ext_source_2.toFixed(4))
    .replace('{ext3}', ext_source_3.toFixed(4))
    .replace('{cpy}', credit_per_year.toFixed(4))
    .replace('{iar}', income_age_ratio.toFixed(4))
    .replace('{prob}', (default_prob * 100).toFixed(1));

  const hallucination = detectHallucinations(explanation);

  return {
    approved,
    probability: default_prob,
    features: feats,
    explanation,
    hallucination,
    model: 'aura_credit_champion/Production',
  };
}

async function API_runPSI() {
  await mockDelay(1200);
  return PSI_FEATURES.map(f => ({
    ...f,
    psi: Math.max(0.01, f.psi + (Math.random() * 0.06 - 0.03)),
  }));
}

async function API_evaluateExplanation(payload) {
  await mockDelay(700);
  return detectHallucinations(payload.text);
}

async function API_promoteChallenger() {
  await mockDelay(1500);
  return { success: true, message: 'Challenger promoted to Production. Champion archived. Model URI updated in Unity Catalog.' };
}

function detectHallucinations(text) {
  const regex = /\b(Section\s+\d+[A-Z]?[A-Z]?|RBI\/\d{4}[/-]\d+[/-]?\d*|SEBI\/[A-Z-]+\/[A-Z]+\/\d+\/\d+|DBR\.[A-Z.]+\/[A-Z.]+\/\d{4}-\d+|Article\s+\d+[A-Z]?)\b/g;
  const citations = [...new Set(text.match(regex) || [])];

  const valid_found = citations.filter(c => VALID_REGULATIONS.includes(c));
  const invalid_found = citations.filter(c => !VALID_REGULATIONS.includes(c));

  const halluc_score = citations.length === 0 ? 0 : invalid_found.length / citations.length;
  const grounding_score = citations.length === 0 ? 0.5 : valid_found.length / citations.length;

  return {
    citations,
    valid_citations: valid_found,
    invalid_citations: invalid_found,
    grounding_score: parseFloat(grounding_score.toFixed(2)),
    halluc_score: parseFloat(halluc_score.toFixed(2)),
    has_hallucination: invalid_found.length > 0,
  };
}

function mockDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function psiSeverity(val) {
  if (val > 0.2) return 'high';
  if (val > 0.1) return 'medium';
  return 'low';
}

function psiBarWidth(val) {
  return Math.min(100, (val / 0.5) * 100).toFixed(1) + '%';
}
