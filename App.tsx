import React, { useState } from 'react';
import { 
  Copy, CheckCircle, TrendingUp, 
  AlertCircle, Brain, Eye, EyeOff, 
  Settings, ChevronRight, Share2, Activity
} from 'lucide-react';
import { FleurDeLys } from './components/FleurDeLys';
import { findConsensus, findDivergencesAndInsights } from './utils/craidEngine';
import { callAPI } from './services/aiService';
import { ApiKeys, Synthesis } from './types';

export default function App() {
  // ===== STATE MANAGEMENT =====
  const [step, setStep] = useState<'keys' | 'question' | 'processing' | 'results'>('keys');
  
  // Clés API pour les 4 moteurs du RAID
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    claude: '',
    chatgpt: '',
    gemini: '',
    grok: ''
  });

  const [showKeys, setShowKeys] = useState<Record<keyof ApiKeys, boolean>>({
    claude: false,
    chatgpt: false,
    gemini: false,
    grok: false
  });

  const [question, setQuestion] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const handleLaunchRAID = async () => {
    if (!question.trim()) { setError('⚠️ Question requise'); return; }
    
    // Vérifier qu'au moins 2 clés sont présentes pour la redondance
    const activeKeys = Object.entries(apiKeys).filter(([_, k]) => (k as string).length > 5);
    if (activeKeys.length < 2) { setError('⚠️ Le protocole RAID exige au moins 2 sources d\'intelligence.'); return; }

    setLoading(true);
    setError(null);
    setResponses({});
    setStep('processing');
    
    const results: Record<string, string> = {};
    const providers = activeKeys.map(k => k[0]);

    // Exécution Parallèle (RAID 0 Striping simulé pour la vitesse)
    try {
      const promises = providers.map(async (provider) => {
        setProgress(`Connexion au noeud ${provider.toUpperCase()}...`);
        try {
          const text = await callAPI(provider, apiKeys[provider as keyof ApiKeys], question);
          if (text) results[provider] = text;
        } catch (e: any) {
          console.error(e);
          // On continue même si un noeud échoue (Tolérance aux pannes RAID)
        }
      });

      await Promise.all(promises);

      if (Object.keys(results).length < 2) {
        throw new Error("Échec critique: Pas assez de réponses pour le consensus.");
      }

      setResponses(results);
      setProgress('Assemblage CRAID en cours...');
      
      // Synthèse locale
      await new Promise(r => setTimeout(r, 800)); // Petit délai pour UX
      
      const consensus = findConsensus(results);
      const { divergences, insights } = findDivergencesAndInsights(results);

      setSynthesis({
        question,
        timestamp: new Date().toISOString(),
        consensus,
        divergences,
        insights,
        sourceCount: Object.keys(results).length
      });

      setStep('results');

    } catch (err: any) {
      setError(err.message);
      setStep('question');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  // ===== GENERATION MARKDOWN =====
  const generateMarkdown = () => {
    if (!synthesis) return '';
    const date = new Date(synthesis.timestamp).toLocaleString('fr-CA');
    let md = `# ⚜️ COGNITIVE RAID REPORT\n\n`;
    md += `**Date:** ${date}\n**Sources:** ${synthesis.sourceCount} Nodes\n**Question:** ${synthesis.question}\n\n---\n\n`;
    
    md += `## ✅ CONSENSUS (La Vérité Émergente)\n`;
    synthesis.consensus.claims.forEach((c) => {
      md += `- **[${Math.round(c.confidence * 100)}%]** ${c.claim}\n`;
    });
    md += `\n**Concepts Clés:** ${synthesis.consensus.concepts.join(', ')}\n\n`;

    md += `## 💡 INSIGHTS (Signaux Faibles)\n`;
    Object.entries(synthesis.insights).forEach(([ai, list]) => {
      const insightsList = list as string[];
      if (insightsList.length > 0) {
        md += `**${ai}:**\n${insightsList.map((l) => `- ${l}`).join('\n')}\n`;
      }
    });

    md += `\n## 🔥 DIVERGENCES (Zones d'Incertitude)\n`;
    synthesis.divergences.forEach((d) => {
      md += `- **${d.ai}** focus sur: ${d.concepts.join(', ')}\n`;
    });

    md += `\n---\n*Généré par Cognitive RAID v1.0 | Bryan Ouellette*`;
    return md;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMarkdown());
    alert('Rapport copié dans le presse-papier.');
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">
      
      {/* BACKGROUND FRACTAL / GRADIENT QUEBEC */}
      <div className="fixed inset-0 z-0 bg-[#000510]">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#002060] to-black opacity-90"></div>
        {/* Motif Fractal Subtil */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px' 
        }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="flex flex-col items-center justify-center mb-16 space-y-4">
          <div className="flex items-center gap-6">
            <FleurDeLys className="w-12 h-12 text-white animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400 drop-shadow-[0_0_15px_rgba(0,100,255,0.5)]">
              COGNITIVE RAID
            </h1>
            <FleurDeLys className="w-12 h-12 text-white animate-pulse" />
          </div>
          <p className="text-blue-200 text-lg md:text-xl font-light tracking-widest uppercase border-b border-blue-500/30 pb-2">
            Architecture de Symbiose Humain-IA Distribuée
          </p>
        </header>

        {/* MAIN CONTENT AREA - GOLDEN RATIO PROPORTIONS */}
        <main className="flex-grow w-full">
          
          {/* STEP 1: API KEYS (THE VAULT) */}
          {step === 'keys' && (
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl animate-fade-in">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-cyan-400">
                <Settings className="w-8 h-8" /> Configuration du Cluster
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'claude', label: 'Claude (Anthropic)', color: 'border-orange-500/50' },
                  { id: 'chatgpt', label: 'ChatGPT (OpenAI)', color: 'border-green-500/50' },
                  { id: 'gemini', label: 'Gemini (Google)', color: 'border-blue-500/50' },
                  { id: 'grok', label: 'Grok (xAI)', color: 'border-white/50' },
                ].map((provider) => (
                  <div key={provider.id} className={`bg-white/5 border ${provider.color} p-4 rounded-xl transition hover:bg-white/10`}>
                    <label className="block text-sm font-bold mb-2 tracking-wide text-gray-300">{provider.label}</label>
                    <div className="flex gap-2">
                      <input 
                        type={showKeys[provider.id as keyof ApiKeys] ? "text" : "password"}
                        value={apiKeys[provider.id as keyof ApiKeys]}
                        onChange={(e) => setApiKeys({...apiKeys, [provider.id]: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono text-sm"
                        placeholder={provider.id === 'gemini' ? 'AIza...' : 'sk-...'}
                      />
                      <button 
                        onClick={() => setShowKeys({...showKeys, [provider.id]: !showKeys[provider.id as keyof ApiKeys]})}
                        className="text-gray-400 hover:text-white"
                      >
                        {showKeys[provider.id as keyof ApiKeys] ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <button 
                  onClick={() => setStep('question')}
                  className="group relative px-8 py-4 bg-white text-blue-900 font-black text-lg rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center gap-3"
                >
                  ACTIVER LE RAID <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: QUESTION (THE INPUT) */}
          {step === 'question' && (
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Requête Principale</h2>
                <button onClick={() => setStep('keys')} className="text-sm text-gray-400 hover:text-white underline">Reconfigurer Clés</button>
              </div>

              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Entrez votre question complexe ici. Le RAID va la distribuer et synthétiser la vérité émergente..."
                className="w-full h-64 bg-black/30 border border-blue-500/30 rounded-xl p-6 text-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none font-light leading-relaxed"
              />

              {error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500 text-red-300 rounded flex items-center gap-3">
                  <AlertCircle /> {error}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleLaunchRAID}
                  disabled={loading}
                  className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-xl rounded-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(0,100,255,0.6)] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-4"
                >
                  <Brain className="w-8 h-8" /> LANCER LA SYNTHÈSE
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING (THE CRUNCH) */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-blue-900 rounded-full animate-spin border-t-cyan-400"></div>
                <FleurDeLys className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white animate-pulse" />
              </div>
              <h3 className="mt-8 text-2xl font-bold text-cyan-300 animate-pulse">{progress}</h3>
              <p className="text-blue-300 mt-2">Réduction de l'entropie en cours...</p>
            </div>
          )}

          {/* STEP 4: RESULTS (THE TRUTH) */}
          {step === 'results' && synthesis && (
            <div className="space-y-8 animate-fade-in">
              
              {/* STATUS BAR */}
              <div className="flex items-center justify-between bg-white/5 rounded-full px-6 py-3 border border-white/10">
                <div className="flex items-center gap-4">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-mono text-cyan-300">RAID COMPLETED ({synthesis.sourceCount} NODES)</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="p-2 hover:bg-white/10 rounded-full text-white"><Copy size={20}/></button>
                  <button onClick={() => { setStep('question'); setSynthesis(null); }} className="p-2 hover:bg-white/10 rounded-full text-white"><Share2 size={20}/></button>
                </div>
              </div>

              {/* CONSENSUS CARD (HERO) */}
              <div className="bg-gradient-to-br from-blue-900/40 to-black border border-cyan-500/50 rounded-2xl p-8 md:p-10 shadow-[0_0_40px_rgba(0,50,150,0.3)]">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <CheckCircle className="text-green-400 w-8 h-8" /> CONSENSUS
                </h2>
                {synthesis.consensus.claims.length > 0 ? (
                  <ul className="space-y-6">
                    {synthesis.consensus.claims.map((claim, i) => (
                      <li key={i} className="flex gap-4 items-start group">
                        <div className="mt-1 min-w-[3rem] text-right font-mono text-green-400 font-bold border-r border-white/20 pr-3">
                          {Math.round(claim.confidence * 100)}%
                        </div>
                        <p className="text-gray-100 text-lg leading-relaxed group-hover:text-white transition-colors">
                          {claim.claim}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">Aucun consensus fort détecté. Le sujet est hautement controversé.</p>
                )}
                
                {synthesis.consensus.concepts.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
                    {synthesis.consensus.concepts.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-cyan-900/30 text-cyan-300 text-xs font-mono uppercase tracking-wider rounded border border-cyan-500/20">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* INSIGHTS CARD */}
                <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6" /> INSIGHTS UNIQUES
                  </h2>
                  <div className="space-y-6">
                    {Object.entries(synthesis.insights).map(([ai, list]) => {
                      const insightsList = list as string[];
                      return insightsList.length > 0 && (
                      <div key={ai}>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{ai}</h3>
                        <ul className="space-y-2 border-l-2 border-purple-500/30 pl-4">
                          {insightsList.map((l, i) => (
                            <li key={i} className="text-sm text-gray-300">{l}</li>
                          ))}
                        </ul>
                      </div>
                    )})}
                  </div>
                </div>

                {/* DIVERGENCES CARD */}
                <div className="bg-black/40 border border-orange-500/30 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-orange-300 mb-6 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6" /> DIVERGENCES
                  </h2>
                  <div className="space-y-4">
                    {synthesis.divergences.length > 0 ? synthesis.divergences.map((div, i) => (
                      <div key={i} className="bg-orange-900/10 p-4 rounded border border-orange-500/20">
                        <div className="font-bold text-orange-200 mb-2">{div.ai}</div>
                        <div className="flex flex-wrap gap-2">
                          {div.concepts.map((c, j) => (
                            <span key={j} className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">{c}</span>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-sm">Alignement parfait entre les modèles.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex justify-center mt-12 pb-12">
                <button 
                  onClick={() => { setStep('question'); setSynthesis(null); setQuestion(''); }}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white transition flex items-center gap-2"
                >
                  <Activity size={18} /> NOUVELLE ANALYSE
                </button>
              </div>

            </div>
          )}

        </main>

        {/* FOOTER */}
        <footer className="mt-auto py-8 text-center border-t border-blue-900/30">
          <div className="flex justify-center items-center gap-2 mb-2">
            <FleurDeLys className="w-4 h-4 text-blue-500" />
            <span className="text-blue-500 font-mono text-sm tracking-widest">COGNITIVE RAID v1.0</span>
            <FleurDeLys className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-gray-500 text-xs">
            Powered by Bryan Ouellette and CRAID. Minimizing Cognitive Entropy.
          </p>
        </footer>

      </div>
    </div>
  );
}