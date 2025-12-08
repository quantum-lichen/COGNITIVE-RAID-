import { ConsensusResult, Divergence } from '../types';

// 1. Extraction des Concepts (Stopwords Français)
export const extractConcepts = (text: string): string[] => {
  if (!text || text.length < 50) return [];
  const words = text.match(/\b[a-zàâäéèêëïîôöùûüœæç]{5,}\b/gi) || [];
  const stopwords = new Set([
    'cette', 'comme', 'dans', 'pour', 'avec', 'sont', 'leurs', 'plus', 'peut',
    'être', 'fait', 'permet', 'avoir', 'faire', 'entre', 'donc', 'aussi', 'ainsi',
    'nous', 'vous', 'elles', 'notre', 'votre', 'cela', 'ceci', 'vers', 'depuis',
    'pendant', 'alors', 'apres', 'avant', 'toute', 'tous'
  ]);
  const freq: Record<string, number> = {};
  words.forEach(w => {
    const normalized = w.toLowerCase();
    if (!stopwords.has(normalized)) {
      freq[normalized] = (freq[normalized] || 0) + 1;
    }
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
};

// 2. Segmentation
export const splitSentences = (text: string): string[] => {
  if (!text) return [];
  return text
    .split(/[.!?]\s+|\n{2,}/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 500);
};

// 3. Extraction des Affirmations (Claims)
export const extractClaims = (text: string): string[] => {
  if (!text || text.length < 100) return [];
  const markers = [
    'est ', 'sont ', 'représente', 'correspond', 'signifie', 'implique',
    'démontre', 'prouve', 'est une', 'est le', 'est la', 'émerge', 'propose',
    'affirme', 'suggère', 'indique', 'montre', 'révèle', 'confirme', 'faut',
    'doit', 'peuvent', 'nécessite'
  ];
  const sentences = splitSentences(text);
  return sentences
    .filter(s => markers.some(m => s.toLowerCase().includes(m)))
    .slice(0, 25);
};

// 4. Calcul de Similarité (Jaccard)
export const claimsSimilarity = (claim1: string, claim2: string): number => {
  if (!claim1 || !claim2 || claim1.length < 10 || claim2.length < 10) return 0;
  const words1 = new Set(claim1.toLowerCase().match(/\b\w{4,}\b/g) || []);
  const words2 = new Set(claim2.toLowerCase().match(/\b\w{4,}\b/g) || []);
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? intersection / union : 0;
};

// 5. Algorithme de Consensus (C)
export const findConsensus = (allResponses: Record<string, string>): ConsensusResult => {
  const activeResponses = Object.entries(allResponses)
    .filter(([_, data]) => data && data.length > 100)
    .map(([key, content]) => ({ key, name: key.toUpperCase(), content }));
  
  if (activeResponses.length < 2) return { concepts: [], claims: [], confidence: 0 };

  // Concepts Communs
  const conceptSets = activeResponses.map(resp => new Set(extractConcepts(resp.content)));
  let commonConcepts = conceptSets.length > 0 ? Array.from(conceptSets[0]) : [];
  for (let i = 1; i < conceptSets.length; i++) {
    commonConcepts = commonConcepts.filter(c => conceptSets[i].has(c));
  }

  // Claims Communs
  const allClaims: { claim: string; ai: string }[] = [];
  activeResponses.forEach(resp => {
    extractClaims(resp.content).forEach(claim => {
      allClaims.push({ claim, ai: resp.name });
    });
  });

  const consensusClaims: any[] = [];
  const seen = new Set();
  
  // Limite pour éviter freeze UI
  const maxChecks = 600; 
  let checks = 0;

  for (let i = 0; i < allClaims.length && checks < maxChecks; i++) {
    const claimNorm = allClaims[i].claim.toLowerCase().substring(0, 50);
    if (seen.has(claimNorm)) continue;
    seen.add(claimNorm);

    let supporters = [allClaims[i].ai];
    for (let j = i + 1; j < allClaims.length; j++) {
      checks++;
      if (claimsSimilarity(allClaims[i].claim, allClaims[j].claim) > 0.45) {
        if (!supporters.includes(allClaims[j].ai)) {
          supporters.push(allClaims[j].ai);
        }
      }
    }

    if (supporters.length >= 2) {
      consensusClaims.push({
        claim: allClaims[i].claim,
        support: supporters.length,
        ais: supporters,
        confidence: supporters.length / activeResponses.length
      });
    }
  }

  return {
    concepts: commonConcepts.slice(0, 20),
    claims: consensusClaims.sort((a, b) => b.confidence - a.confidence).slice(0, 10),
    confidence: commonConcepts.length > 0 ? Math.min(commonConcepts.length / 20, 1) : 0
  };
};

// 6. Algorithme de Divergences (D) & Insights (I)
export const findDivergencesAndInsights = (allResponses: Record<string, string>) => {
  const activeResponses = Object.entries(allResponses)
    .filter(([_, content]) => content && content.length > 100)
    .map(([key, content]) => ({ key, name: key.toUpperCase(), content }));

  const divergences: Divergence[] = [];
  const insights: Record<string, string[]> = {};

  if (activeResponses.length < 2) return { divergences, insights };

  activeResponses.forEach((resp, idx) => {
    // Divergences Conceptuelles
    const concepts = new Set(extractConcepts(resp.content));
    const otherConcepts = new Set();
    activeResponses.forEach((other, oidx) => {
      if (oidx !== idx) extractConcepts(other.content).forEach(c => otherConcepts.add(c));
    });
    const uniqueConcepts = [...concepts].filter(c => !otherConcepts.has(c)).slice(0, 8);
    if (uniqueConcepts.length > 0) {
      divergences.push({ ai: resp.name, concepts: uniqueConcepts });
    }

    // Insights Uniques (Claims)
    const claims = extractClaims(resp.content);
    const uniqueClaims: string[] = [];
    let checks = 0;
    
    claims.forEach(claim => {
      if (checks > 200) return;
      let isUnique = true;
      activeResponses.forEach((other, oidx) => {
        if (oidx === idx) return;
        extractClaims(other.content).forEach(otherClaim => {
          checks++;
          if (claimsSimilarity(claim, otherClaim) > 0.50) isUnique = false;
        });
      });
      if (isUnique) uniqueClaims.push(claim);
    });
    insights[resp.name] = uniqueClaims.slice(0, 4);
  });

  return { divergences, insights };
};