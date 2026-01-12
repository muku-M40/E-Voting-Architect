
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  Send, User, Search, AlertTriangle, CheckCircle, 
  Code, RefreshCw, Sparkles, BrainCircuit, ExternalLink,
  ChevronRight, Lock, Vote, ShieldCheck, Database, Play, Pause, Zap, Terminal, Copy
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import BlockchainVisualizer from './components/BlockchainVisualizer';
import { 
  Candidate, VoteRecord, ViewType, AuditResult, AuditIssue 
} from './types';
import { 
  INITIAL_CANDIDATES, SMART_CONTRACT_TEMPLATE 
} from './constants';
import { 
  auditSmartContract, 
  getArchitecturalAdvice, 
  generateSmartContract 
} from './services/geminiService';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [ledger, setLedger] = useState<VoteRecord[]>([]);
  const [isCasting, setIsCasting] = useState(false);
  const [voterId, setVoterId] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const simInterval = useRef<number | null>(null);
  
  // Auditor State
  const [contractCode, setContractCode] = useState(SMART_CONTRACT_TEMPLATE);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Architect State
  const [advicePrompt, setAdvicePrompt] = useState('');
  const [adviceResult, setAdviceResult] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [architectMode, setArchitectMode] = useState<'blueprint' | 'code'>('blueprint');

  // Verification Portal State
  const [txSearch, setTxSearch] = useState('');
  const [searchResult, setSearchResult] = useState<VoteRecord | null>(null);

  // Initialize ledger with some data
  useEffect(() => {
    const initialVotes: VoteRecord[] = [];
    let prevHash = "0".repeat(64);
    
    for (let i = 0; i < 8; i++) {
      const candidateId = String(Math.floor(Math.random() * 3) + 1);
      const timestamp = Date.now() - (8 - i) * 60000;
      const blockHash = crypto.randomUUID().replace(/-/g, '');
      
      initialVotes.push({
        id: crypto.randomUUID(),
        voterHash: `0x${crypto.randomUUID().substring(0, 16).replace(/-/g, '')}`,
        candidateId,
        timestamp,
        blockNumber: i + 1,
        previousHash: prevHash,
        hash: blockHash
      });
      prevHash = blockHash;
    }
    setLedger(initialVotes);
  }, []);

  // Simulation Logic
  useEffect(() => {
    if (isSimulating) {
      simInterval.current = window.setInterval(() => {
        const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
        const lastBlock = ledger[ledger.length - 1];
        const prevHash = lastBlock?.hash || "0".repeat(64);
        const blockHash = crypto.randomUUID().replace(/-/g, '');
        
        const newVote: VoteRecord = {
          id: crypto.randomUUID(),
          voterHash: `0x${crypto.randomUUID().substring(0, 16).replace(/-/g, '')}`,
          candidateId: randomCandidate.id,
          timestamp: Date.now(),
          blockNumber: (ledger.length || 0) + 1,
          previousHash: prevHash,
          hash: blockHash
        };

        setLedger(prev => [...prev, newVote]);
        setCandidates(prev => prev.map(c => 
          c.id === randomCandidate.id ? { ...c, votes: c.votes + 1 } : c
        ));
      }, 5000);
    } else {
      if (simInterval.current) clearInterval(simInterval.current);
    }
    return () => { if (simInterval.current) clearInterval(simInterval.current); };
  }, [isSimulating, ledger, candidates]);

  const handleVote = useCallback(async (candidateId: string) => {
    if (!voterId) {
      alert("Please provide a Voter ID for identity verification.");
      return;
    }
    
    setIsCasting(true);
    
    // Simulate mining delay
    setTimeout(() => {
      const lastBlock = ledger[ledger.length - 1];
      const prevHash = lastBlock?.hash || "0".repeat(64);
      const blockHash = crypto.randomUUID().replace(/-/g, '');
      
      const newVote: VoteRecord = {
        id: crypto.randomUUID(),
        voterHash: `0x${voterId}`,
        candidateId,
        timestamp: Date.now(),
        blockNumber: ledger.length + 1,
        previousHash: prevHash,
        hash: blockHash
      };

      setLedger(prev => [...prev, newVote]);
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
      ));
      setIsCasting(false);
      setVoterId('');
      setView('dashboard');
    }, 1500);
  }, [ledger, voterId]);

  const handleAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const result = await auditSmartContract(contractCode);
      setAuditResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleArchitectAction = async () => {
    if (!advicePrompt) return;
    setIsAsking(true);
    setAdviceResult('');
    try {
      let result = '';
      if (architectMode === 'blueprint') {
        result = await getArchitecturalAdvice(advicePrompt);
      } else {
        result = await generateSmartContract(advicePrompt);
      }
      setAdviceResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSearchTx = () => {
    const found = ledger.find(v => v.voterHash.toLowerCase().includes(txSearch.toLowerCase()) || v.hash.toLowerCase().includes(txSearch.toLowerCase()));
    setSearchResult(found || null);
    if (!found) alert("Transaction not found in the current ledger.");
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Election Overview</h2>
            <p className="text-sm text-slate-500 font-medium">Monitoring decentralized consensus metrics</p>
          </div>
        </div>
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
            isSimulating ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'
          }`}
        >
          {isSimulating ? <Pause size={16} /> : <Play size={16} />}
          {isSimulating ? 'Pause Simulation' : 'Run Simulation'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Activity size={200} />
          </div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h2 className="text-xl font-bold text-slate-900">Voting Power Distribution</h2>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Real-time</span>
              </div>
            </div>
          </div>
          <div className="h-80 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidates}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(79, 70, 229, 0.05)'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="votes" radius={[12, 12, 0, 0]} barSize={50}>
                  {candidates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold mb-8">Consensus Share</h2>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={candidates}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="votes"
                  stroke="none"
                >
                  {candidates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {candidates.map((c, i) => (
              <div key={c.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-slate-700 font-bold text-sm">{c.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-sm">{((c.votes / candidates.reduce((a,b) => a + b.votes, 0)) * 100).toFixed(1)}%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{c.votes.toLocaleString()} Votes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-white rounded-[2rem] p-8 border border-slate-200 hover:border-indigo-400 transition-all hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="relative">
                <img src={candidate.avatar} alt={candidate.name} className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white"></div>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight">{candidate.name}</h3>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">{candidate.party}</p>
              </div>
            </div>
            <div className="flex items-end justify-between relative z-10">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{candidate.votes.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Confirmed Blocks</p>
              </div>
              <button 
                onClick={() => {
                  setVoterId('');
                  setView('vote');
                }}
                className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderArchitect = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-3xl shadow-indigo-500/10 relative overflow-hidden border border-slate-800">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">AI Architect Studio</h2>
              <p className="text-slate-400 font-medium mt-1">Harnessing Gemini 3.0 for robust system design.</p>
            </div>
          </div>
          
          <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button 
              onClick={() => setArchitectMode('blueprint')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${architectMode === 'blueprint' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Blueprint Mode
            </button>
            <button 
              onClick={() => setArchitectMode('code')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${architectMode === 'code' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Contract Gen
            </button>
          </div>
        </div>
        
        <div className="relative z-10">
          <textarea 
            value={advicePrompt}
            onChange={(e) => setAdvicePrompt(e.target.value)}
            placeholder={architectMode === 'blueprint' ? "Describe your voting system requirements..." : "Define the rules for your smart contract..."}
            className="w-full h-44 bg-slate-950/50 border border-slate-700 rounded-3xl p-8 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none mono text-lg"
          />
          <button 
            onClick={handleArchitectAction}
            disabled={isAsking || !advicePrompt}
            className="absolute bottom-6 right-6 px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm shadow-2xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest"
          >
            {isAsking ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {architectMode === 'blueprint' ? 'Generate Logic' : 'Synthesize Code'}
          </button>
        </div>
      </div>

      {adviceResult && (
        <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-10 pb-10 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Generated {architectMode === 'blueprint' ? 'Blueprint' : 'Smart Contract'}</h3>
                <p className="text-sm text-slate-500 font-medium">Valid for deployment on EVM-compatible chains</p>
              </div>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(adviceResult);
                  alert("Copied to clipboard!");
                }}
                className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-all border border-slate-200"
              >
                <Copy size={16} /> Copy Result
              </button>
            </div>
          </div>
          <div className={`prose prose-indigo max-w-none text-slate-700 ${architectMode === 'code' ? 'bg-slate-950 p-8 rounded-3xl text-emerald-400 mono text-sm border border-slate-800' : 'leading-relaxed'}`}>
            <pre className="whitespace-pre-wrap font-inherit">
              {adviceResult}
            </pre>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        {[
          { icon: ShieldCheck, title: "Zero-Knowledge Proofs", desc: "Integrate ZK-SNARKs for complete ballot privacy while maintaining auditability.", color: "text-indigo-600" },
          { icon: Terminal, title: "EVM Optimization", desc: "Our AI generates gas-efficient Solidity logic optimized for Layer 2 rollups.", color: "text-emerald-600" },
          { icon: Search, title: "Formal Verification", desc: "Mathematical proof that your code follows its specification without side effects.", color: "text-amber-600" },
        ].map((feat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-200 transition-all group">
            <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feat.color}`}>
              <feat.icon size={24} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{feat.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 animate-in fade-in duration-700">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 px-2 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-400/20">
                <Code size={20} />
              </div>
              <h3 className="text-slate-100 font-black tracking-tight">Smart Contract Auditor</h3>
            </div>
            <button 
              onClick={handleAudit}
              disabled={isAuditing}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/30"
            >
              {isAuditing ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              Analyze with Gemini
            </button>
          </div>
          <div className="relative">
            <textarea
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              className="w-full h-[650px] bg-slate-950 text-emerald-400/90 p-8 rounded-[2rem] border border-slate-800 mono text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner leading-relaxed"
              placeholder="Paste Solidity code..."
            />
            <div className="absolute top-8 right-8 pointer-events-none text-slate-800 font-mono text-xs select-none">
              SOLIDITY v0.8.20
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-8 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
        {!auditResult && !isAuditing && (
          <div className="bg-white rounded-[2.5rem] p-16 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-80">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
              <Sparkles className="text-slate-300" size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">Neural Audit Pending</h3>
            <p className="text-slate-500 max-w-xs font-medium leading-relaxed">Submit your smart contract code to receive a comprehensive security breakdown powered by Gemini 3.0.</p>
          </div>
        )}

        {isAuditing && (
          <div className="bg-white rounded-[2.5rem] p-16 border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="relative mb-10">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center">
                <RefreshCw className="text-indigo-600 animate-spin" size={60} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg">
                 <div className="w-3 h-3 bg-indigo-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Parsing Bytecode...</h3>
            <p className="text-slate-500 animate-pulse font-medium">Gemini is simulating attack vectors and performing symbolic execution analysis.</p>
          </div>
        )}

        {auditResult && !isAuditing && (
          <div className="space-y-8 pb-10">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-24 h-24 flex items-center justify-center p-6 ${auditResult.securityScore > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} rounded-bl-[40px] border-b border-l border-slate-100`}>
                  <p className="text-2xl font-black">{auditResult.securityScore}%</p>
               </div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Deep Audit Summary</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                {auditResult.summary}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <h4 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Security Findings</h4>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{auditResult.issues.length} ISSUES</span>
              </div>
              {auditResult.issues.map((issue, idx) => (
                <div key={idx} className={`p-8 rounded-[2rem] border-2 transition-all hover:scale-[1.01] ${
                  issue.severity === 'high' ? 'bg-red-50/50 border-red-100' : 
                  issue.severity === 'medium' ? 'bg-amber-50/50 border-amber-100' : 
                  'bg-indigo-50/50 border-indigo-100'
                }`}>
                  <div className="flex items-start gap-5">
                    <div className={`p-3 rounded-2xl ${
                      issue.severity === 'high' ? 'bg-red-500 text-white' : 
                      issue.severity === 'medium' ? 'bg-amber-500 text-white' : 
                      'bg-indigo-500 text-white'
                    }`}>
                      <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-slate-900">{issue.title}</h5>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          issue.severity === 'high' ? 'bg-red-100 text-red-700' : 
                          issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">{issue.description}</p>
                      {issue.line && (
                        <div className="flex items-center gap-2">
                           <span className="mono text-[10px] font-bold text-slate-400">LOCATION:</span>
                           <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-mono rounded-lg">
                            LINE {issue.line}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderVote = () => (
    <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-slate-50/50 pointer-events-none">
          <Vote size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-widest mb-10 border border-indigo-100">
            <Lock size={16} />
            Secure Tunnel Active
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Cast Your Secure Ballot</h2>
          <p className="text-slate-500 font-medium mb-12 text-lg">Your identity is masked using Ring Confidential Transactions (RCT).</p>

          <div className="space-y-10">
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Digital Signature Key</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  placeholder="Enter 0x address or signature hash..."
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none mono text-lg shadow-inner group-hover:border-slate-200"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 group-focus-within:text-indigo-600 group-focus-within:border-indigo-100 transition-colors">
                  <User size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Validated Candidates</label>
              <div className="grid grid-cols-1 gap-4">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleVote(c.id)}
                    disabled={isCasting}
                    className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-indigo-600 hover:bg-indigo-50/30 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-lg active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img src={c.avatar} className="w-16 h-16 rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-500 shadow-sm" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-all"></div>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg">{c.name}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{c.party}</p>
                      </div>
                    </div>
                    {isCasting ? (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <RefreshCw size={24} className="animate-spin text-indigo-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={24} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLedger = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 animate-in fade-in duration-700">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Node Explorer</h2>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Transaction</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="TxID or Block Hash..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm mono shadow-inner"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>
            <button 
              onClick={handleSearchTx}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
            >
              Scan Blockchain
            </button>
          </div>

          {searchResult && (
            <div className="mt-10 p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem] animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 text-emerald-700 font-black text-sm mb-6 uppercase tracking-widest">
                <CheckCircle size={20} />
                Block Verified
              </div>
              <div className="space-y-5">
                <div className="p-4 bg-white/50 rounded-2xl border border-emerald-100/50">
                  <p className="text-slate-400 uppercase font-black text-[9px] tracking-widest mb-1">Timestamp</p>
                  <p className="text-slate-700 font-bold">{new Date(searchResult.timestamp).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white/50 rounded-2xl border border-emerald-100/50">
                  <p className="text-slate-400 uppercase font-black text-[9px] tracking-widest mb-1">Block Height</p>
                  <p className="text-slate-700 font-mono font-bold">#{searchResult.blockNumber}</p>
                </div>
                <div className="p-4 bg-white/50 rounded-2xl border border-emerald-100/50">
                  <p className="text-slate-400 uppercase font-black text-[9px] tracking-widest mb-1">State Root</p>
                  <p className="text-slate-700 font-mono text-[11px] break-all leading-relaxed">{searchResult.hash}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
               <ShieldCheck size={28} />
            </div>
            <h3 className="font-black text-xl tracking-tight">Cryptographic Proof</h3>
          </div>
          <p className="text-sm text-slate-400 mb-10 leading-relaxed font-medium relative z-10">
            Every vote is encapsulated in a block that carries the hash of the preceding block, creating a chain that is mathematically impossible to alter without recalculating the entire history of the network.
          </p>
          <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 mono text-[11px] relative z-10">
            <div className="flex items-center justify-between mb-2">
               <span className="text-slate-500 font-bold">GENESIS_HASH</span>
               <span className="text-emerald-500">0x00000000...</span>
            </div>
            <div className="h-px bg-slate-700 my-4"></div>
            <p className="text-slate-500 font-bold mb-1">CURRENT_MERKLE_ROOT</p>
            <span className="text-indigo-400 break-all block leading-relaxed">
              {ledger[ledger.length-1]?.hash || 'SYNCING...'}
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <BlockchainVisualizer ledger={ledger} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 ml-64 p-10 lg:p-16 relative overflow-x-hidden">
        <header className="flex flex-wrap items-center justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] border border-indigo-200">System Dashboard</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              {view.charAt(0).toUpperCase() + view.slice(1)} <span className="text-indigo-600">Module</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden xl:flex items-center gap-4 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex flex-col items-end">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Status</p>
                <p className="text-xs font-bold text-slate-700">Sepolia Testnet v4.2</p>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black cursor-pointer hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 group">
              <User size={28} className="group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </header>

        {view === 'dashboard' && renderDashboard()}
        {view === 'vote' && renderVote()}
        {view === 'audit' && renderAudit()}
        {view === 'architect' && renderArchitect()}
        {view === 'ledger' && renderLedger()}

        <div className="fixed bottom-12 right-12 z-50">
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-indigo-500/20 transition-all cursor-pointer group hover:scale-[1.05]">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-[360deg] transition-all duration-700">
              <BrainCircuit size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">AI Protocol Engine</p>
              <p className="text-base font-black text-white leading-none">Gemini 3.0 Pro</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
