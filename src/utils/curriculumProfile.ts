import { PracticePrompt, QuizQuestion } from '../types/platform';

export type CurriculumTier = 'foundation' | 'standard' | 'advanced';

export interface GradeOption {
  label: string;
  suggestedAge: number;
  tier: CurriculumTier;
}

export interface CountryCurriculumConfig {
  country: string;
  systemName: string;
  grades: GradeOption[];
}

export const COUNTRY_CURRICULA: CountryCurriculumConfig[] = [
  {
    country: 'Australia',
    systemName: 'Australian Curriculum / ATAR',
    grades: [
      { label: 'Year 7', suggestedAge: 12, tier: 'foundation' },
      { label: 'Year 8', suggestedAge: 13, tier: 'foundation' },
      { label: 'Year 9', suggestedAge: 14, tier: 'standard' },
      { label: 'Year 10', suggestedAge: 15, tier: 'standard' },
      { label: 'Year 11', suggestedAge: 16, tier: 'advanced' },
      { label: 'Year 12', suggestedAge: 17, tier: 'advanced' },
    ],
  },
  {
    country: 'United Kingdom',
    systemName: 'National Curriculum / GCSE & A-Level',
    grades: [
      { label: 'Year 7 (KS3)', suggestedAge: 11, tier: 'foundation' },
      { label: 'Year 8 (KS3)', suggestedAge: 12, tier: 'foundation' },
      { label: 'Year 9 (KS3)', suggestedAge: 13, tier: 'foundation' },
      { label: 'Year 10 (GCSE)', suggestedAge: 14, tier: 'standard' },
      { label: 'Year 11 (GCSE)', suggestedAge: 15, tier: 'standard' },
      { label: 'Year 12 (A-Level)', suggestedAge: 16, tier: 'advanced' },
      { label: 'Year 13 (A-Level)', suggestedAge: 17, tier: 'advanced' },
    ],
  },
  {
    country: 'United States',
    systemName: 'US Secondary (Middle & High School)',
    grades: [
      { label: 'Grade 6', suggestedAge: 11, tier: 'foundation' },
      { label: 'Grade 7', suggestedAge: 12, tier: 'foundation' },
      { label: 'Grade 8', suggestedAge: 13, tier: 'foundation' },
      { label: 'Grade 9 (Freshman)', suggestedAge: 14, tier: 'standard' },
      { label: 'Grade 10 (Sophomore)', suggestedAge: 15, tier: 'standard' },
      { label: 'Grade 11 (Junior)', suggestedAge: 16, tier: 'advanced' },
      { label: 'Grade 12 (Senior)', suggestedAge: 17, tier: 'advanced' },
    ],
  },
  {
    country: 'Canada',
    systemName: 'Canadian Provincial Secondary',
    grades: [
      { label: 'Grade 7', suggestedAge: 12, tier: 'foundation' },
      { label: 'Grade 8', suggestedAge: 13, tier: 'foundation' },
      { label: 'Grade 9', suggestedAge: 14, tier: 'standard' },
      { label: 'Grade 10', suggestedAge: 15, tier: 'standard' },
      { label: 'Grade 11', suggestedAge: 16, tier: 'advanced' },
      { label: 'Grade 12', suggestedAge: 17, tier: 'advanced' },
    ],
  },
  {
    country: 'New Zealand',
    systemName: 'NZ Curriculum / NCEA',
    grades: [
      { label: 'Year 7', suggestedAge: 11, tier: 'foundation' },
      { label: 'Year 8', suggestedAge: 12, tier: 'foundation' },
      { label: 'Year 9', suggestedAge: 13, tier: 'foundation' },
      { label: 'Year 10', suggestedAge: 14, tier: 'standard' },
      { label: 'Year 11 (NCEA Level 1)', suggestedAge: 15, tier: 'standard' },
      { label: 'Year 12 (NCEA Level 2)', suggestedAge: 16, tier: 'advanced' },
      { label: 'Year 13 (NCEA Level 3)', suggestedAge: 17, tier: 'advanced' },
    ],
  },
  {
    country: 'India',
    systemName: 'CBSE / ICSE Secondary',
    grades: [
      { label: 'Class 6', suggestedAge: 11, tier: 'foundation' },
      { label: 'Class 7', suggestedAge: 12, tier: 'foundation' },
      { label: 'Class 8', suggestedAge: 13, tier: 'foundation' },
      { label: 'Class 9', suggestedAge: 14, tier: 'standard' },
      { label: 'Class 10 (Board)', suggestedAge: 15, tier: 'standard' },
      { label: 'Class 11', suggestedAge: 16, tier: 'advanced' },
      { label: 'Class 12 (Board)', suggestedAge: 17, tier: 'advanced' },
    ],
  },
  {
    country: 'Singapore',
    systemName: 'MOE Secondary / JC',
    grades: [
      { label: 'Secondary 1', suggestedAge: 13, tier: 'foundation' },
      { label: 'Secondary 2', suggestedAge: 14, tier: 'standard' },
      { label: 'Secondary 3', suggestedAge: 15, tier: 'standard' },
      { label: 'Secondary 4 (O-Level)', suggestedAge: 16, tier: 'standard' },
      { label: 'JC 1 (A-Level)', suggestedAge: 17, tier: 'advanced' },
      { label: 'JC 2 (A-Level)', suggestedAge: 18, tier: 'advanced' },
    ],
  },
  {
    country: 'International / IB',
    systemName: 'IB Middle Years & Diploma',
    grades: [
      { label: 'MYP Year 1', suggestedAge: 11, tier: 'foundation' },
      { label: 'MYP Year 2', suggestedAge: 12, tier: 'foundation' },
      { label: 'MYP Year 3', suggestedAge: 13, tier: 'foundation' },
      { label: 'MYP Year 4', suggestedAge: 14, tier: 'standard' },
      { label: 'MYP Year 5', suggestedAge: 15, tier: 'standard' },
      { label: 'DP Year 1', suggestedAge: 16, tier: 'advanced' },
      { label: 'DP Year 2', suggestedAge: 17, tier: 'advanced' },
    ],
  },
  {
    country: 'Other',
    systemName: 'International Secondary',
    grades: [
      { label: 'Grade / Year 6', suggestedAge: 11, tier: 'foundation' },
      { label: 'Grade / Year 7', suggestedAge: 12, tier: 'foundation' },
      { label: 'Grade / Year 8', suggestedAge: 13, tier: 'foundation' },
      { label: 'Grade / Year 9', suggestedAge: 14, tier: 'standard' },
      { label: 'Grade / Year 10', suggestedAge: 15, tier: 'standard' },
      { label: 'Grade / Year 11', suggestedAge: 16, tier: 'advanced' },
      { label: 'Grade / Year 12', suggestedAge: 17, tier: 'advanced' },
    ],
  },
];

export function getCountryConfig(country: string): CountryCurriculumConfig {
  return (
    COUNTRY_CURRICULA.find((c) => c.country === country) ?? COUNTRY_CURRICULA[0]
  );
}

export function resolveCurriculumTier(
  country: string,
  gradeLevel: string,
  age?: number
): { tier: CurriculumTier; tierLabel: string; systemName: string } {
  const cfg = getCountryConfig(country);
  const gradeMatch = cfg.grades.find((g) => g.label === gradeLevel);

  let tier: CurriculumTier = gradeMatch?.tier ?? 'standard';
  if (typeof age === 'number' && !Number.isNaN(age)) {
    if (age <= 13) tier = 'foundation';
    else if (age >= 17) tier = 'advanced';
    else if (!gradeMatch) tier = 'standard';
  }

  const tierLabel =
    tier === 'foundation'
      ? 'Middle Secondary (Ages 11–13)'
      : tier === 'advanced'
      ? 'Senior Secondary (Ages 17–18+)'
      : 'Upper Secondary (Ages 14–16)';

  return { tier, tierLabel, systemName: cfg.systemName };
}

// Age- & Grade-Calibrated Question Overrides by Subject & Tier
// Standard tier uses the rich base pack questions; Foundation (ages 11–13) and Advanced (ages 17–18+) adapt complexity and framing.
const TIER_QUIZ_SETS: Partial<Record<string, Record<'foundation' | 'advanced', QuizQuestion[]>>> = {
  bio: {
    foundation: [
      {
        id: 'bio-f-1',
        topicId: 'bio-respiration',
        prompt: 'What is the main job of cellular respiration in living plant and animal cells?',
        options: [
          'To break down food molecules like glucose to release usable cell energy',
          'To turn sunlight directly into soil minerals',
          'To destroy cell membranes when oxygen is present',
          'To store water inside chloroplasts',
        ],
        correctIndex: 0,
        explanation:
          'Living cells carry out respiration to release energy from glucose so they can grow, move, and repair.',
        misconceptionNote: 'Confusing respiration (releasing energy from food) with breathing or photosynthesis',
        sourceRef: 'Foundational Cell Biology',
      },
      {
        id: 'bio-f-2',
        topicId: 'bio-enzymes',
        prompt: 'Why do enzymes stop working properly if the temperature gets far too hot?',
        options: [
          'Their shape changes so the substrate no longer fits the active site',
          'They turn into glucose molecules',
          'They evaporate out of the cell',
          'They freeze into solid crystals',
        ],
        correctIndex: 0,
        explanation:
          'High heat shakes the enzyme protein until its 3D shape unravels (denatures), so it can no longer match its target molecule.',
        misconceptionNote: 'Thinking enzymes are "killed" like living organisms rather than losing their 3D shape',
        sourceRef: 'Foundational Cell Biology',
      },
    ],
    advanced: [
      {
        id: 'bio-a-1',
        topicId: 'bio-respiration',
        prompt: 'Why does fermentation occur in mammalian muscle or yeast cells under anoxic conditions?',
        options: [
          'To re-oxidise NADH back to NAD⁺ so glycolysis can continue generating ATP',
          'To drive ATP synthase across the inner mitochondrial cristae without O₂',
          'To convert pyruvate directly into acetyl-CoA inside the cytosol',
          'To generate more ATP per glucose molecule than oxidative phosphorylation',
        ],
        correctIndex: 0,
        explanation:
          'Without oxygen as the terminal electron acceptor, the electron transport chain stalls; fermentation regenerates NAD⁺ so glyceraldehyde-3-phosphate oxidation in glycolysis continues.',
        misconceptionNote: 'Assuming fermentation produces extra ATP directly rather than regenerating NAD⁺ for glycolysis',
        sourceRef: 'Senior Cellular Bioenergetics',
      },
      {
        id: 'bio-a-2',
        topicId: 'bio-enzymes',
        prompt: 'How does non-competitive inhibition differ from competitive inhibition on enzyme kinetics?',
        options: [
          'It binds an allosteric site, lowering Vmax without changing Km',
          'It binds the active site and can be outcompeted at saturating [S]',
          'It increases both Km and Vmax proportionally',
          'It permanently cleaves peptide bonds at room temperature',
        ],
        correctIndex: 0,
        explanation:
          'Allosteric binding alters active-site geometry regardless of substrate concentration, reducing functional enzyme turnover (lower Vmax) while leaving affinity (Km) unchanged.',
        misconceptionNote: 'Confusing competitive (Km increases, Vmax unchanged) with non-competitive inhibition',
        sourceRef: 'Senior Enzyme Kinetics',
      },
    ],
  },
  math: {
    foundation: [
      {
        id: 'math-f-1',
        topicId: 'math-discriminant',
        prompt: 'What is the value of y when x = 0 in the equation y = x² - 5x + 6?',
        options: ['6', '-5', '0', '1'],
        correctIndex: 0,
        explanation: 'Substituting x = 0 gives y = 0² - 5(0) + 6 = 6, which is the y-intercept.',
        misconceptionNote: 'Reading the middle coefficient instead of the constant term for the y-intercept',
        sourceRef: 'Middle Secondary Algebra',
      },
      {
        id: 'math-f-2',
        topicId: 'math-completing-square',
        prompt: 'Which two numbers multiply to 12 and add to 7 when factoring x² + 7x + 12?',
        options: ['3 and 4', '2 and 6', '1 and 12', '-3 and -4'],
        correctIndex: 0,
        explanation: '3 × 4 = 12 and 3 + 4 = 7, so x² + 7x + 12 = (x + 3)(x + 4).',
        misconceptionNote: 'Picking factor pairs that multiply to 12 without checking their sum',
        sourceRef: 'Middle Secondary Algebra',
      },
    ],
    advanced: [
      {
        id: 'math-a-1',
        topicId: 'math-discriminant',
        prompt: 'For which values of k does kx² + 4x + k = 0 (k ≠ 0) have two distinct real roots?',
        options: ['-2 < k < 2 (k ≠ 0)', 'k > 2 or k < -2', 'k = ±2', 'k > 4'],
        correctIndex: 0,
        explanation:
          'Δ = 16 - 4k² > 0 requires k² < 4, giving -2 < k < 2 with k ≠ 0 for a quadratic.',
        misconceptionNote: 'Reversing the inequality direction when solving 16 - 4k² > 0',
        sourceRef: 'Senior Algebraic Analysis',
      },
      {
        id: 'math-a-2',
        topicId: 'math-completing-square',
        prompt: 'What is the vertex of f(x) = 3x² - 12x + 7 after completing the square?',
        options: ['(2, -5)', '(-2, -5)', '(2, 7)', '(4, -5)'],
        correctIndex: 0,
        explanation: 'f(x) = 3(x² - 4x) + 7 = 3(x - 2)² - 12 + 7 = 3(x - 2)² - 5, vertex (2, -5).',
        misconceptionNote: 'Forgetting to multiply the subtracted square term by the factored leading coefficient 3',
        sourceRef: 'Senior Algebraic Analysis',
      },
    ],
  },
  chem: {
    foundation: [
      {
        id: 'chem-f-1',
        topicId: 'chem-limiting',
        prompt: 'Why must a chemical equation be balanced with equal atoms on both sides?',
        options: [
          'Atoms are rearranged, not created or destroyed during a reaction',
          'Reactions always double the number of oxygen atoms',
          'Balancing turns solids into liquids automatically',
          'Only gases need equal numbers of atoms',
        ],
        correctIndex: 0,
        explanation:
          'By the Law of Conservation of Mass, every atom present in the reactants must appear in the products.',
        misconceptionNote: 'Changing chemical subscripts instead of coefficients when balancing',
        sourceRef: 'Middle Secondary Chemistry',
      },
    ],
    advanced: [
      {
        id: 'chem-a-1',
        topicId: 'chem-limiting',
        prompt: 'In 2Al + 3Cl₂ → 2AlCl₃, 5.40 g Al (M = 27.0) reacts with 14.2 g Cl₂ (M = 71.0). Which is limiting?',
        options: [
          'Cl₂ (0.200 mol available requires 0.133 mol Al; 0.200 mol Al is in excess)',
          'Al, because 5.40 g is less than 14.2 g',
          'Neither, because both equal 0.200 mol',
          'AlCl₃, because it is the product',
        ],
        correctIndex: 0,
        explanation:
          'n(Al) = 0.200 mol and n(Cl₂) = 0.200 mol. From the 2:3 ratio, 0.200 mol Al needs 0.300 mol Cl₂, so Cl₂ runs out first.',
        misconceptionNote: 'Assuming equal mole amounts mean neither reagent is limiting when coefficients differ',
        sourceRef: 'Senior Quantitative Stoichiometry',
      },
    ],
  },
  hist: {
    foundation: [
      {
        id: 'hist-f-1',
        topicId: 'hist-versailles',
        prompt: 'Why did rapid money printing in Germany in 1923 harm ordinary families?',
        options: [
          'Prices rose much faster than wages, making savings almost worthless',
          'Everyone suddenly could afford twice as much food',
          'Banks closed permanently so no coins existed',
          'Foreign trade immediately became free',
        ],
        correctIndex: 0,
        explanation:
          'Hyperinflation meant the currency lost value hour by hour, eroding fixed wages and life savings.',
        misconceptionNote: 'Thinking printing more banknotes creates real wealth',
        sourceRef: 'Middle Secondary History',
      },
    ],
    advanced: [
      {
        id: 'hist-a-1',
        topicId: 'hist-weimar',
        prompt: 'How did the interaction between proportional representation and Article 48 destabilise Weimar democracy (1930–33)?',
        options: [
          'Fragmented Reichstag coalitions failed to pass budgets, leading Hindenburg to govern via Article 48 presidential decrees',
          'Proportional representation banned extremist parties from standing in elections',
          'Article 48 required unanimous approval from every German state before issuing decrees',
          'It abolished the office of Chancellor after 1924',
        ],
        correctIndex: 0,
        explanation:
          'Low electoral thresholds produced fragile multi-party coalitions that fractured during the Great Depression, normalising rule by emergency presidential decree.',
        misconceptionNote: 'Treating Article 48 as the sole cause without linking it to Reichstag deadlock',
        sourceRef: 'Senior Historiography & Weimar Crisis',
      },
    ],
  },
  eng: {
    foundation: [
      {
        id: 'eng-f-1',
        topicId: 'eng-macbeth-soliloquy',
        prompt: 'What does a soliloquy allow a playwright like Shakespeare to show the audience?',
        options: [
          'A character’s private inner thoughts and doubts spoken aloud alone on stage',
          'A loud argument between two opposing armies',
          'Stage lighting instructions written for the theatre crew',
          'A summary read by the audience before the play begins',
        ],
        correctIndex: 0,
        explanation:
          'A soliloquy reveals a character’s honest internal conflict directly to the audience while no other characters are listening.',
        misconceptionNote: 'Confusing a soliloquy (alone on stage) with a dialogue or chorus',
        sourceRef: 'Middle Secondary Literature',
      },
    ],
    advanced: [
      {
        id: 'eng-a-1',
        topicId: 'eng-macbeth-soliloquy',
        prompt: 'How does Shakespeare’s shift from balanced legalistic clauses to equestrian metaphor ("vaulting ambition") function in Act 1 Scene 7?',
        options: [
          'It dramatises moral reasoning collapsing into uncontrollable, self-destructive hubris',
          'It shows Macbeth calmly rejecting kingship in favour of loyal service',
          'It functions purely as comic relief before Duncan arrives',
          'It signals that Lady Macbeth has abandoned the plot',
        ],
        correctIndex: 0,
        explanation:
          'Measured conditional syntax gives way to violent horse-riding imagery that anticipates Macbeth overreaching and falling.',
        misconceptionNote: 'Identifying the metaphor without analysing its syntactic shift and dramatic irony',
        sourceRef: 'Senior Literary Criticism',
      },
    ],
  },
};

const TIER_PRACTICE_OVERRIDES: Partial<Record<string, Record<'foundation' | 'advanced', PracticePrompt>>> = {
  bio: {
    foundation: {
      id: 'bio-prac-f',
      topicId: 'bio-respiration',
      question:
        'In your own words, explain two differences between aerobic respiration (with oxygen) and anaerobic respiration (without oxygen).',
      marks: 3,
      hint: 'Compare whether oxygen is needed and which one releases more energy from glucose.',
      markScheme: [
        'States aerobic respiration requires oxygen while anaerobic respiration does not.',
        'States aerobic respiration releases much more usable energy per glucose molecule.',
        'Names a valid product (carbon dioxide & water for aerobic, or lactic acid / ethanol for anaerobic).',
      ],
      modelReasoning:
        'Aerobic respiration uses oxygen to break down glucose completely into carbon dioxide and water, releasing a large amount of energy. Anaerobic respiration occurs without oxygen, breaking glucose down partially into lactic acid (in muscles) and releasing much less energy.',
      sourceRef: 'Foundational Cell Biology',
    },
    advanced: {
      id: 'bio-prac-a',
      topicId: 'bio-respiration',
      question:
        'Explain biochemically why both the Krebs cycle and oxidative phosphorylation cease when oxygen is depleted, yet glycolysis persists temporarily.',
      marks: 5,
      hint: 'Trace electron transport termination → NADH accumulation → loss of NAD⁺ → lactate fermentation rescue.',
      markScheme: [
        'Identifies O₂ as the final electron acceptor at Complex IV of the electron transport chain.',
        'Explains that without O₂, NADH and FADH₂ cannot be re-oxidised.',
        'Links depleted NAD⁺/FAD supply to halting pyruvate oxidation and Krebs cycle dehydrogenases.',
        'Explains that cytosolic glycolysis continues only while fermentation re-oxidises NADH to NAD⁺.',
      ],
      modelReasoning:
        'Oxygen acts as the terminal electron acceptor in oxidative phosphorylation. Without it, the electron transport chain backs up, preventing NADH and FADH₂ oxidation. Because the Krebs cycle depends on recycled NAD⁺ and FAD, it stalls. Cytosolic glycolysis continues transiently because lactate fermentation oxidises NADH back to NAD⁺.',
      sourceRef: 'Senior Cellular Bioenergetics',
    },
  },
  math: {
    foundation: {
      id: 'math-prac-f',
      topicId: 'math-completing-square',
      question:
        'Solve x² + 5x + 6 = 0 by factoring, and state the y-intercept of y = x² + 5x + 6.',
      marks: 3,
      hint: 'Find two numbers that multiply to 6 and add to 5, then set each factor equal to 0.',
      markScheme: [
        'Factors expression into (x + 2)(x + 3) = 0.',
        'Solves correctly to x = -2 and x = -3.',
        'Identifies the y-intercept as (0, 6).',
      ],
      modelReasoning:
        'Two numbers multiplying to 6 and adding to 5 are 2 and 3, giving (x + 2)(x + 3) = 0, so x = -2 or x = -3. Setting x = 0 gives y = 6, so the y-intercept is (0, 6).',
      sourceRef: 'Middle Secondary Algebra',
    },
    advanced: {
      id: 'math-prac-a',
      topicId: 'math-discriminant',
      question:
        'Find the exact range of values for k such that y = kx² + 6x + k lies strictly above the x-axis for all real x.',
      marks: 4,
      hint: 'Strictly above the x-axis requires both a positive leading coefficient (k > 0) and zero real roots (Δ < 0).',
      markScheme: [
        'States k > 0 so the parabola opens upward.',
        'Sets discriminant Δ = 36 - 4k² < 0.',
        'Solves k² > 9 to obtain k > 3 or k < -3.',
        'Intersects with k > 0 to conclude k > 3.',
      ],
      modelReasoning:
        'For kx² + 6x + k > 0 for all x ∈ ℝ, the parabola must open upward (k > 0) and have no x-intercepts (Δ < 0). Solving 36 - 4k² < 0 gives k² > 9, so combining with k > 0 yields k > 3.',
      sourceRef: 'Senior Algebraic Analysis',
    },
  },
  chem: {
    foundation: {
      id: 'chem-prac-f',
      topicId: 'chem-limiting',
      question:
        'In a reaction between hydrogen and oxygen (2H₂ + O₂ → 2H₂O), explain what happens if you have plenty of oxygen gas but run out of hydrogen gas.',
      marks: 2,
      hint: 'Think about which reactant stops the reaction from making any more water.',
      markScheme: [
        'Identifies hydrogen as the limiting reactant that gets used up completely.',
        'Explains the reaction stops and leftover oxygen remains unreacted in excess.',
      ],
      modelReasoning:
        'Hydrogen is the limiting reactant. Once all the hydrogen molecules have reacted, no more water can form even though leftover oxygen remains in excess.',
      sourceRef: 'Middle Secondary Chemistry',
    },
    advanced: {
      id: 'chem-prac-a',
      topicId: 'chem-limiting',
      question:
        '4.86 g of Mg (M = 24.3 g/mol) reacts with 100 mL of 1.50 mol/L HCl via Mg + 2HCl → MgCl₂ + H₂. Determine the limiting reagent and the theoretical volume of H₂ at STP (22.7 L/mol).',
      marks: 4,
      hint: 'Calculate n(Mg) and n(HCl) separately, then divide by stoichiometric coefficients (1 vs 2).',
      markScheme: [
        'Calculates n(Mg) = 4.86 / 24.3 = 0.200 mol.',
        'Calculates n(HCl) = 0.100 × 1.50 = 0.150 mol.',
        'Identifies HCl as limiting (0.150 mol HCl only reacts with 0.075 mol Mg).',
        'Calculates n(H₂) = 0.075 mol and V(H₂) = 0.075 × 22.7 = 1.70 L.',
      ],
      modelReasoning:
        'n(Mg) = 0.200 mol and n(HCl) = 0.150 mol. Since 1 mol Mg requires 2 mol HCl, 0.200 mol Mg would need 0.400 mol HCl; thus HCl is limiting. Only 0.0750 mol H₂ forms, giving 0.0750 × 22.7 = 1.70 L at STP.',
      sourceRef: 'Senior Quantitative Stoichiometry',
    },
  },
  hist: {
    foundation: {
      id: 'hist-prac-f',
      topicId: 'hist-versailles',
      question:
        'Give two reasons why many ordinary citizens in Germany were angry about the Treaty of Versailles in 1919.',
      marks: 3,
      hint: 'Consider both the blame for starting the war and the money Germany was forced to pay.',
      markScheme: [
        'Mentions War Guilt (Article 231) blaming Germany alone.',
        'Mentions heavy reparations payments or loss of territory/military limits.',
        'Connects anger to political distrust of the new Weimar government that signed it.',
      ],
      modelReasoning:
        'Many Germans resented Article 231 because it forced Germany to accept sole blame for World War I, and they feared massive reparations payments alongside lost territory would keep the country poor.',
      sourceRef: 'Middle Secondary History',
    },
    advanced: {
      id: 'hist-prac-a',
      topicId: 'hist-weimar',
      question:
        'Evaluate the extent to which structural flaws in the Weimar Constitution—rather than the Great Depression alone—accounted for the collapse of parliamentary democracy between 1930 and 1933.',
      marks: 6,
      hint: 'Weigh long-term structural vulnerabilities (PR, Article 48) against economic shock (unemployment, bank failures) as a catalyst.',
      markScheme: [
        'Analyses proportional representation fragmenting Reichstag coalitions from 1919 onward.',
        'Explains Article 48 enabling rule by presidential decree under Brüning, Papen, and Schleicher.',
        'Assesses the Great Depression as the catalyst that polarised voters and broke coalition compromise.',
        'Reaches a balanced judgment linking structural fragility with economic crisis.',
      ],
      modelReasoning:
        'While proportional representation and Article 48 created latent instability, the Weimar Republic survived and stabilised during 1924–29. The Great Depression acted as the decisive catalyst that destroyed centrist coalitions, prompting Hindenburg to rely routinely on Article 48 decrees and eroding faith in parliamentary democracy.',
      sourceRef: 'Senior Historiography & Weimar Crisis',
    },
  },
  eng: {
    foundation: {
      id: 'eng-prac-f',
      topicId: 'eng-macbeth-soliloquy',
      question:
        'In Act 1 Scene 7 of Macbeth, why does Macbeth hesitate before deciding whether to kill King Duncan?',
      marks: 3,
      hint: 'Think about Macbeth’s duties as Duncan’s host and loyal soldier, versus his ambition.',
      markScheme: [
        'Notes that Macbeth is Duncan’s kinsman, loyal subject, and host.',
        'Notes that Duncan has been a fair and virtuous king.',
        'Identifies that only Macbeth’s "vaulting ambition" pushes him toward murder.',
      ],
      modelReasoning:
        'Macbeth hesitates because he has three strong reasons to protect Duncan—he is his relative, his subject, and his host—and admits Duncan has ruled fairly, leaving only ambition pushing him forward.',
      sourceRef: 'Middle Secondary Literature',
    },
    advanced: {
      id: 'eng-prac-a',
      topicId: 'eng-macbeth-soliloquy',
      question:
        'Analyse how Shakespeare uses conditional syntax and equestrian imagery in Macbeth’s Act 1 Scene 7 soliloquy to expose the fracture between moral awareness and tragic hubris.',
      marks: 5,
      hint: 'Examine "If it were done when ’tis done" alongside "I have no spur... only vaulting ambition, which o’erleaps itself".',
      markScheme: [
        'Analyses opening conditional/anaphoric phrasing ("If it were done...") showing calculated anxiety over consequences.',
        'Explains the legal/moral accumulation ("kinsman... subject... host") establishing full ethical awareness.',
        'Analyses the equestrian metaphor ("spur", "vaulting ambition, which o’erleaps itself") foreshadowing self-destruction.',
        'Links syntax breakdown to Lady Macbeth’s imminent persuasion.',
      ],
      modelReasoning:
        'Shakespeare opens with compressed conditional repetition ("If it were done when ’tis done") to mirror Macbeth’s attempt to compartmentalise murder. Yet his moral tally—kinsman, subject, host—exposes complete ethical lucidity before collapsing into violent equestrian imagery ("vaulting ambition"), dramatising hubris outrunning restraint.',
      sourceRef: 'Senior Literary Criticism',
    },
  },
};

export function getCalibratedQuiz(
  subjectId: string,
  baseQuiz: QuizQuestion[],
  tier: CurriculumTier
): QuizQuestion[] {
  if (tier === 'standard') return baseQuiz;
  const override = TIER_QUIZ_SETS[subjectId]?.[tier];
  return override && override.length > 0 ? override : baseQuiz;
}

export function getCalibratedPractice(
  subjectId: string,
  basePractice: PracticePrompt,
  tier: CurriculumTier
): PracticePrompt {
  if (tier === 'standard') return basePractice;
  return TIER_PRACTICE_OVERRIDES[subjectId]?.[tier] ?? basePractice;
}
