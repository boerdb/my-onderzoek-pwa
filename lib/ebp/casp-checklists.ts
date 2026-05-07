import type { Article } from "@/lib/types/article";
import { deriveEvidenceLevel } from "@/lib/ebp/evidence-levels";

export type CaspAnswer = "ja" | "nee" | "onduidelijk" | null;

export interface CaspQuestion {
  id: string;
  text: string;
  hint?: string;
}

export interface CaspChecklist {
  type: string;
  label: string;
  questions: CaspQuestion[];
}

const SYSTEMATIC_REVIEW: CaspChecklist = {
  type: "systematic_review",
  label: "Systematische Review (CASP)",
  questions: [
    {
      id: "sr1",
      text: "Stelt de review een duidelijk omschreven vraag?",
      hint: "Denk aan PICO: populatie, interventie, uitkomst.",
    },
    {
      id: "sr2",
      text: "Zocht men naar het juiste type studies?",
      hint: "Zijn de inclusie- en exclusiecriteria passend bij de onderzoeksvraag?",
    },
    {
      id: "sr3",
      text: "Zijn alle relevante studies meegenomen?",
      hint: "Zijn meerdere databases doorzocht? Is gepubliceerd én ongepubliceerd materiaal meegenomen?",
    },
    {
      id: "sr4",
      text: "Is de methodologische kwaliteit van de studies beoordeeld?",
      hint: "Gebruikten de auteurs een gevalideerde beoordelingstool?",
    },
    {
      id: "sr5",
      text: "Is het verantwoord om de resultaten samen te voegen (meta-analyse)?",
      hint: "Zijn de studies vergelijkbaar genoeg qua populatie, interventie en uitkomst?",
    },
    {
      id: "sr6",
      text: "Wat zijn de overall resultaten van de review?",
      hint: "Zijn de resultaten duidelijk samengevat?",
    },
    {
      id: "sr7",
      text: "Hoe nauwkeurig zijn de resultaten?",
      hint: "Worden betrouwbaarheidsintervallen gerapporteerd?",
    },
    {
      id: "sr8",
      text: "Zijn de resultaten toepasbaar op de eigen patiëntengroep?",
      hint: "Komen de studiedeelnemers overeen met jouw doelgroep?",
    },
    {
      id: "sr9",
      text: "Zijn alle klinisch relevante uitkomsten meegenomen?",
      hint: "Ontbreken er uitkomsten die voor jouw praktijk belangrijk zijn?",
    },
    {
      id: "sr10",
      text: "Wegen de voordelen op tegen de nadelen en kosten?",
    },
  ],
};

const RCT: CaspChecklist = {
  type: "rct",
  label: "Randomized Controlled Trial (CASP)",
  questions: [
    {
      id: "rct1",
      text: "Stelt de studie een duidelijk omschreven vraag?",
    },
    {
      id: "rct2",
      text: "Was de verdeling van patiënten over de groepen gerandomiseerd?",
      hint: "Is de randomisatieprocedure beschreven?",
    },
    {
      id: "rct3",
      text: "Zijn alle deelnemers die startten ook meegenomen in de eindanalyse?",
      hint: "Intention-to-treat analyse? Zijn uitvallers verantwoord?",
    },
    {
      id: "rct4",
      text: "Waren patiënten, behandelaars en onderzoekers geblindeerd?",
      hint: "Single-blind, double-blind of open-label?",
    },
    {
      id: "rct5",
      text: "Waren de groepen vergelijkbaar aan het begin van de studie?",
      hint: "Zijn baseline-kenmerken beschreven en vergelijkbaar?",
    },
    {
      id: "rct6",
      text: "Werden de groepen, behalve de interventie, gelijk behandeld?",
    },
    {
      id: "rct7",
      text: "Hoe groot was het behandeleffect?",
      hint: "Relatief risico, absolute risicoreductie, NNT gerapporteerd?",
    },
    {
      id: "rct8",
      text: "Hoe nauwkeurig is de schatting van het effect?",
      hint: "Betrouwbaarheidsintervallen en p-waarden gerapporteerd?",
    },
    {
      id: "rct9",
      text: "Zijn de resultaten toepasbaar op de eigen patiëntengroep?",
    },
    {
      id: "rct10",
      text: "Zijn alle klinisch relevante uitkomsten meegenomen?",
    },
    {
      id: "rct11",
      text: "Wegen de voordelen op tegen de nadelen en kosten?",
    },
  ],
};

const COHORT: CaspChecklist = {
  type: "cohort",
  label: "Cohortonderzoek (CASP)",
  questions: [
    {
      id: "co1",
      text: "Stelt de studie een duidelijk omschreven vraag?",
    },
    {
      id: "co2",
      text: "Is de cohort op een aanvaardbare manier gerekruteerd?",
      hint: "Is de studiepopulatie representatief?",
    },
    {
      id: "co3",
      text: "Is de blootstelling nauwkeurig gemeten?",
      hint: "Werden gevalideerde meetinstrumenten gebruikt?",
    },
    {
      id: "co4",
      text: "Is de uitkomst nauwkeurig gemeten?",
      hint: "Waren de uitkomstmeting en blootstellingsmeting onafhankelijk van elkaar?",
    },
    {
      id: "co5",
      text: "Zijn de belangrijkste confounders geïdentificeerd en gecorrigeerd?",
      hint: "Zijn sociaal-demografische en klinische factoren meegenomen?",
    },
    {
      id: "co6",
      text: "Was de follow-up compleet genoeg?",
      hint: "Wat was de uitval? Zijn redenen voor uitval beschreven?",
    },
    {
      id: "co7",
      text: "Wat zijn de resultaten van de studie?",
    },
    {
      id: "co8",
      text: "Hoe nauwkeurig zijn de resultaten?",
      hint: "Betrouwbaarheidsintervallen gerapporteerd?",
    },
    {
      id: "co9",
      text: "Zijn de resultaten geloofwaardig?",
      hint: "Sluit het biologisch mechanisme aan bij de bevindingen?",
    },
    {
      id: "co10",
      text: "Zijn de resultaten toepasbaar op de eigen populatie?",
    },
    {
      id: "co11",
      text: "Sluiten de resultaten aan bij ander beschikbaar bewijs?",
    },
  ],
};

const GENERIC: CaspChecklist = {
  type: "generic",
  label: "Kritische beoordeling (algemeen)",
  questions: [
    {
      id: "gen1",
      text: "Is er een duidelijke onderzoeksvraag geformuleerd?",
    },
    {
      id: "gen2",
      text: "Is de onderzoeksmethode passend bij de vraagstelling?",
    },
    {
      id: "gen3",
      text: "Is de studiepopulatie beschreven en representatief?",
    },
    {
      id: "gen4",
      text: "Zijn de meetinstrumenten valide en betrouwbaar?",
    },
    {
      id: "gen5",
      text: "Is er rekening gehouden met verstorende factoren (confounders)?",
    },
    {
      id: "gen6",
      text: "Zijn de resultaten duidelijk en volledig gerapporteerd?",
    },
    {
      id: "gen7",
      text: "Zijn de conclusies onderbouwd door de resultaten?",
    },
    {
      id: "gen8",
      text: "Zijn de resultaten toepasbaar in de eigen praktijksituatie?",
    },
  ],
};

export function getCaspChecklist(article: Article): CaspChecklist {
  const level = deriveEvidenceLevel(article);
  if (level.level === 1) return SYSTEMATIC_REVIEW;
  if (level.level === 2) return RCT;
  if (level.level === 3) return COHORT;
  return GENERIC;
}
