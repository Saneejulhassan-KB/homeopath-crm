import type { CaseTemplate } from "../types/proTypes";

export const caseTemplates: CaseTemplate[] = [
  {
    templateId: "ct001",
    name: "Classical Migraine",
    condition: "Migraine Headache",
    description:
      "Comprehensive template for migraine cases including aura evaluation, trigger identification, constitutional and acute remedy selection.",
    icon: "Brain",
    keySymptoms: [
      {
        symptom: "Unilateral throbbing headache",
        category: "Head",
        intensity: "severe",
      },
      {
        symptom: "Visual aura — zigzag, flashes, scotoma",
        category: "Head",
        intensity: "moderate",
      },
      {
        symptom: "Nausea and vomiting during attack",
        category: "Abdomen",
        intensity: "moderate",
      },
      {
        symptom: "Photophobia and phonophobia",
        category: "General",
        intensity: "severe",
      },
      {
        symptom: "Emotional trigger — grief, disappointment",
        category: "Mind",
        intensity: "moderate",
      },
      {
        symptom: "Better lying in dark quiet room",
        category: "General",
        intensity: "mild",
      },
      {
        symptom: "Worse from noise, light, motion",
        category: "General",
        intensity: "severe",
      },
    ],
    modalities: {
      better: [
        "Dark quiet room",
        "Lying still",
        "Sleep",
        "Pressure on affected side",
      ],
      worse: ["Light", "Noise", "Motion", "Hormonal changes", "Grief", "Anger"],
    },
    commonRemedies: [
      {
        name: "Natrum Muriaticum",
        matchScore: 92,
        rationale:
          "Left-sided migraine with visual aura, zigzag lights, suppressed grief, worse consolation, craving salt. Classic headache worse from sunrise to noon.",
      },
      {
        name: "Belladonna",
        matchScore: 87,
        rationale:
          "Sudden violent onset, throbbing, flushed face, dilated pupils, worse from light and noise. Acute high-intensity migraine.",
      },
      {
        name: "Iris Versicolor",
        matchScore: 78,
        rationale:
          "Migraine with blurred vision before headache, severe nausea and vomiting, burning in GI tract. Periodic migraines.",
      },
      {
        name: "Gelsemium",
        matchScore: 72,
        rationale:
          "Dull heavy migraine, heavy eyelids, dizziness, anticipatory anxiety before onset. Viral-triggered migraines.",
      },
    ],
    dosageGuidance:
      "Acute attack: 200C every 15-30 minutes for up to 3 doses. Constitutional: 200C once, repeat in 4-6 weeks based on response. Avoid repeating if improving.",
    followUpProtocol:
      "Review at 4 weeks: assess frequency, intensity, duration. Document using 1-10 pain scale. Assess sleep, mood, energy. Adjust potency if plateau reached at 6 months.",
    redFlags: [
      "Thunderclap headache — sudden onset worst-ever headache (exclude subarachnoid hemorrhage)",
      "Headache with fever and neck stiffness (exclude meningitis)",
      "New onset headache in patients >50 years",
      "Headache with neurological deficits",
      "Headache worsening progressively over days/weeks",
    ],
  },
  {
    templateId: "ct002",
    name: "Atopic Eczema",
    condition: "Atopic Dermatitis",
    description:
      "Structured case-taking for eczema patients covering morphology, location, discharge, modalities, and constitutional type.",
    icon: "Droplets",
    keySymptoms: [
      {
        symptom: "Intense itching worse at night",
        category: "Skin",
        intensity: "severe",
      },
      {
        symptom: "Oozing, crusting, or dry eruptions",
        category: "Skin",
        intensity: "moderate",
      },
      {
        symptom: "Location: folds, face, hands, or generalized",
        category: "Skin",
        intensity: "mild",
      },
      {
        symptom: "Seasonal pattern (winter or summer)",
        category: "General",
        intensity: "moderate",
      },
      {
        symptom: "Personal or family history of atopy",
        category: "General",
        intensity: "mild",
      },
      {
        symptom: "Emotional state: anxiety, suppressed emotions",
        category: "Mind",
        intensity: "moderate",
      },
      {
        symptom: "Suppressed eruptions with steroids",
        category: "Skin",
        intensity: "severe",
      },
    ],
    modalities: {
      better: [
        "Cool application (oozing type)",
        "Warmth (dry type)",
        "Summer",
        "After scratching",
      ],
      worse: [
        "Wool clothing",
        "Washing",
        "Cold and damp",
        "Emotional stress",
        "Suppression with steroids",
      ],
    },
    commonRemedies: [
      {
        name: "Sulphur",
        matchScore: 90,
        rationale:
          "Burning intensely itchy eruptions, worse bathing, worse warmth of bed, aversion to washing. Philosophical unkempt patient.",
      },
      {
        name: "Graphites",
        matchScore: 88,
        rationale:
          "Oozing sticky honey-like discharge, eruptions in folds, constipation, obesity, worse cold. Classic chronic eczema.",
      },
      {
        name: "Petroleum",
        matchScore: 80,
        rationale:
          "Deep cracking skin worse in winter, bleeding fissures, hunger at night, eczema with rawness and moisture.",
      },
      {
        name: "Arsenicum Album",
        matchScore: 75,
        rationale:
          "Dry burning eruptions, restless, fastidious, worse cold, better warmth. Anxiety-type eczema patient.",
      },
    ],
    dosageGuidance:
      "Constitutional: 200C once, assess over 4-6 weeks. Expect initial aggravation (healing crisis) within first 2 weeks. Do NOT suppress with steroids during aggravation unless medically necessary. LM potencies if very sensitive.",
    followUpProtocol:
      "Photograph eruptions at baseline and each follow-up. Use SCORAD or IGA scale for objectivity. Assess sleep quality, itch frequency, discharge quantity. Repeat constitutional after 6-8 weeks.",
    redFlags: [
      "Secondary bacterial infection (oozing, yellow crusts, fever)",
      "Eczema herpeticum (widespread painful vesicular eruption)",
      "Failure to thrive in children with severe eczema",
      "Eczema unresponsive to any treatment after 6 months — refer to dermatologist",
      "Widespread skin involvement with systemic symptoms",
    ],
  },
  {
    templateId: "ct003",
    name: "Anxiety & Panic Disorder",
    condition: "Generalized Anxiety / Panic Attacks",
    description:
      "Case-taking framework for anxiety spectrum disorders — generalized anxiety, panic attacks, phobias, OCD tendencies.",
    icon: "Heart",
    keySymptoms: [
      {
        symptom: "Anticipatory anxiety before events",
        category: "Mind",
        intensity: "severe",
      },
      {
        symptom: "Panic attacks — palpitations, sweating",
        category: "Chest",
        intensity: "severe",
      },
      {
        symptom: "Specific phobias (heights, crowds, dark)",
        category: "Mind",
        intensity: "moderate",
      },
      {
        symptom: "Digestive disturbance from anxiety",
        category: "Abdomen",
        intensity: "moderate",
      },
      {
        symptom: "Sleep disturbance — restless mind at night",
        category: "General",
        intensity: "moderate",
      },
      {
        symptom: "Trembling or weakness in anxiety",
        category: "General",
        intensity: "mild",
      },
      {
        symptom: "Worse when alone or in dark",
        category: "Mind",
        intensity: "moderate",
      },
    ],
    modalities: {
      better: ["Company", "Reassurance", "Fresh air", "Distraction"],
      worse: [
        "Anticipation",
        "Stage fright",
        "Crowd",
        "Dark",
        "Alone",
        "Caffeine",
      ],
    },
    commonRemedies: [
      {
        name: "Argentum Nitricum",
        matchScore: 94,
        rationale:
          "Anticipatory anxiety with pre-event diarrhea, fear of heights, claustrophobia, hurried impulsive, craving sweets.",
      },
      {
        name: "Gelsemium",
        matchScore: 88,
        rationale:
          "Stage fright, trembling, weakness, diarrhea before performance, wants to be held. Dull heavy paralytic anxiety.",
      },
      {
        name: "Arsenicum Album",
        matchScore: 82,
        rationale:
          "Health anxiety, restlessness, fear of death and disease, fastidious. 2-4am waking with anxiety.",
      },
      {
        name: "Phosphorus",
        matchScore: 76,
        rationale:
          "Fear of thunderstorms and dark, desires company, burning anxieties, sympathetic oversensitive constitution.",
      },
    ],
    dosageGuidance:
      "Acute panic: 200C every 15 minutes during attack, max 3 doses. Constitutional management: 30C daily during high-stress periods or 200C every 3-4 weeks for constitutional treatment.",
    followUpProtocol:
      "Use GAD-7 score to track progress. Assess panic attack frequency, intensity, and duration. Review triggers and lifestyle. Reassess remedy selection every 6-8 weeks. Cognitive-behavioral strategies recommended alongside.",
    redFlags: [
      "Suicidal ideation in severe anxiety-depression overlap",
      "Panic attacks with chest pain — exclude cardiac causes (ECG, troponin)",
      "Anxiety with significant weight loss — exclude thyrotoxicosis",
      "OCD with contamination fears that prevent function — refer to psychiatry",
      "Anxiety with substance use requiring medical detox",
    ],
  },
  {
    templateId: "ct004",
    name: "Irritable Bowel Syndrome",
    condition: "IBS & Functional Gut Disorders",
    description:
      "Comprehensive IBS case template covering bowel habit changes, pain character, emotional triggers, and dietary modalities.",
    icon: "Zap",
    keySymptoms: [
      {
        symptom: "Cramping abdominal pain",
        category: "Abdomen",
        intensity: "severe",
      },
      {
        symptom: "Alternating constipation and diarrhea",
        category: "Abdomen",
        intensity: "moderate",
      },
      {
        symptom: "Bloating and flatulence",
        category: "Abdomen",
        intensity: "moderate",
      },
      {
        symptom: "Emotional trigger — anger, grief, anxiety",
        category: "Mind",
        intensity: "severe",
      },
      {
        symptom: "Pain better or worse from stool",
        category: "Abdomen",
        intensity: "moderate",
      },
      { symptom: "Mucus in stool", category: "Abdomen", intensity: "mild" },
      {
        symptom: "Urgency and tenesmus",
        category: "Abdomen",
        intensity: "moderate",
      },
    ],
    modalities: {
      better: [
        "Bending double (Colocynthis)",
        "Heat (Magnesia Phos)",
        "After stool",
        "Rest",
      ],
      worse: [
        "Emotional upset",
        "Anger",
        "Eating",
        "Cold drinks",
        "Morning on waking",
      ],
    },
    commonRemedies: [
      {
        name: "Colocynthis",
        matchScore: 91,
        rationale:
          "Violent cramping colic better bending double, after anger or indignation. Dysentery-like with mucus.",
      },
      {
        name: "Lycopodium",
        matchScore: 84,
        rationale:
          "Bloating and flatulence right-sided, 4-8pm aggravation, better after passing flatus, anticipatory anxiety.",
      },
      {
        name: "Nux Vomica",
        matchScore: 80,
        rationale:
          "Ineffectual urging, irritable sedentary patient, worse in morning, after overindulgence in food/drink/stimulants.",
      },
      {
        name: "China",
        matchScore: 74,
        rationale:
          "Tympanic abdomen with flatulence, periodic diarrhea, debility after fluid loss, worse touching abdomen.",
      },
    ],
    dosageGuidance:
      "Acute flare: 30C hourly for 4 hours then 3 times daily. Constitutional: 200C every 4-6 weeks. Dietary advice essential — identify personal trigger foods. Avoid insoluble fiber during acute phases.",
    followUpProtocol:
      "IBS Severity Scoring System (IBS-SSS) at baseline and each visit. Food diary for first 4 weeks. Bowel habit diary. Assess psychological triggers and life stressors at each visit.",
    redFlags: [
      "Blood in stool — exclude colorectal cancer, inflammatory bowel disease",
      "Unexplained weight loss >5kg in 3 months",
      "Nocturnal diarrhea waking from sleep",
      "New onset IBS symptoms after age 50",
      "Fever with bowel symptoms — exclude infection or IBD",
    ],
  },
  {
    templateId: "ct005",
    name: "Rheumatoid Arthritis",
    condition: "Rheumatoid Arthritis & Inflammatory Arthritis",
    description:
      "Case template for inflammatory joint diseases focusing on joint distribution, modalities, inflammatory markers, and constitutional remedy selection.",
    icon: "Bone",
    keySymptoms: [
      {
        symptom: "Symmetrical joint pain and stiffness",
        category: "Extremities",
        intensity: "severe",
      },
      {
        symptom: "Morning stiffness > 1 hour",
        category: "Extremities",
        intensity: "severe",
      },
      {
        symptom: "Hot swollen joints",
        category: "Extremities",
        intensity: "moderate",
      },
      {
        symptom: "Worse on first motion, better continued",
        category: "Extremities",
        intensity: "severe",
      },
      {
        symptom: "Constitutional chilliness or heat",
        category: "General",
        intensity: "moderate",
      },
      {
        symptom: "History of skin suppression or infections",
        category: "Skin",
        intensity: "mild",
      },
      {
        symptom: "Anxiety, restlessness at night",
        category: "Mind",
        intensity: "moderate",
      },
    ],
    modalities: {
      better: [
        "Continued motion (Rhus Tox)",
        "Absolute rest (Bryonia)",
        "Warmth",
        "Dry weather",
      ],
      worse: [
        "First motion (Rhus Tox)",
        "Any motion (Bryonia)",
        "Cold damp",
        "Winter",
      ],
    },
    commonRemedies: [
      {
        name: "Rhus Toxicodendron",
        matchScore: 93,
        rationale:
          "Worse initial motion better continued, restlessness, worse cold damp, better warmth, suppressed skin eruptions history.",
      },
      {
        name: "Bryonia Alba",
        matchScore: 87,
        rationale:
          "Worse any motion, better absolute rest and pressure, dryness, irritable wants to be left alone.",
      },
      {
        name: "Causticum",
        matchScore: 79,
        rationale:
          "Contractures and deformities, paralytic weakness, worse dry cold, sympathy for others, urinary incontinence.",
      },
      {
        name: "Ledum Palustre",
        matchScore: 72,
        rationale:
          "Arthritis ascending from below, better cold application despite being chilly, puncture-like joint pains.",
      },
    ],
    dosageGuidance:
      "Constitutional 200C every 6-8 weeks during stable phase. Acute flare: 30C twice daily for 5-7 days. Always coordinate with rheumatologist for disease-modifying drug management. Monitor ESR, CRP, RF at each allopathic review.",
    followUpProtocol:
      "DAS-28 scoring for disease activity. Joint tenderness count at each visit. Photograph any deformities for tracking. X-ray hands and feet annually. Reassess constitutional remedy after 3-4 doses if no improvement.",
    redFlags: [
      "Joint destruction with functional loss despite treatment — urgent rheumatology referral",
      "Cervical spine involvement with neurological symptoms",
      "Vasculitis symptoms: leg ulcers, digital gangrene",
      "Lung involvement: breathlessness, pleuritis",
      "New onset with very high CRP/ESR — rule out septic arthritis",
    ],
  },
];
