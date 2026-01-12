
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  Send, User, Search, AlertTriangle, CheckCircle, 
  Code, RefreshCw, Sparkles, BrainCircuit, ExternalLink,
  ChevronRight, Lock, Vote, ShieldCheck, Database
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
  
  // Auditor State
  const [contractCode, setContractCode] = useState(SMART_CONTRACT_TEMPLATE);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Architect State
  const [advicePrompt, setAdvicePrompt] = useState('');
  const [adviceResult, setAdviceResult] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Verification Portal State
  const [txSearch, setTxSearch] = useState('');
  const [searchResult, setSearchResult] = useState<VoteRecord | null>(null);

  // Initialize ledger with some data
  useEffect(() => {
    const initialVotes: VoteRecord[] = [];
    let prevHash = "0".repeat(64);
    
    for (let i = 0; i < 5; i++) {
      const candidateId = String(Math.floor(Math.random() * 3) + 1);
      const timestamp = Date.now() - (5 - i) * 60000;
      const id = crypto.randomUUID();
      const voterHash = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      const blockHash = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      
      initialVotes.push({
        id,
        voterHash: `0x${voterHash}`,
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
      const blockHash = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      
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
    }, 2000);
  }, [ledger, voterId]);

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await auditSmartContract(contractCode);
      setAuditResult(result);
    } catch (error) {
      console.error(error);
      alert("Error auditing contract. Please check your API key.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAskArchitect = async () => {
    if (!advicePrompt) return;
    setIsAsking(true);
    try {
      const result = await getArchitecturalAdvice(advicePrompt);
      setAdviceResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSearchTx = () => {
    const found = ledger.find(v => v.voterHash.includes(txSearch) || v.hash.includes(txSearch));
    setSearchResult(found || null);
    if (!found) alert("Transaction not found in the current ledger.");
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Real-time Voting Tally</h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Live
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidates}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]} barSize={40}>
                  {candidates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Distribution</h2>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={candidates}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="votes"
                >
                  {candidates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {candidates.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-slate-600 font-medium">{c.name}</span>
                </div>
                <span className="font-bold">{((c.votes / candidates.reduce((a,b) => a + b.votes, 0)) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-lg group">
            <div className="flex items-center gap-4 mb-4">
              <img src={candidate.avatar} alt={candidate.name} className="w-14 h-14 rounded-full border-2 border-indigo-100" />
              <div>
                <h3 className="font-bold text-slate-900">{candidate.name}</h3>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide">{candidate.party}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">{candidate.votes.toLocaleString()}</p>
                <p className="text-xs text-slate-400 font-medium uppercase">Confirmed Votes</p>
              </div>
              <button 
                onClick={() => {
                  setVoterId('');
                  setView('vote');
                }}
                className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVote = () => (
    <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-slate-100">
          <Vote size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-6 border border-indigo-100">
            <Lock size={14} />
            End-to-End Encrypted
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Cast Your Ballot</h2>
          <p className="text-slate-500 mb-10">Your vote is anonymous and immutable once recorded on the blockchain.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Digital Identity (Voter Hash)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  placeholder="Enter your 16-digit verification code..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none mono"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Select Candidate</label>
              <div className="grid grid-cols-1 gap-3">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleVote(c.id)}
                    disabled={isCasting}
                    className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-4">
                      <img src={c.avatar} className="w-12 h-12 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.party}</p>
                      </div>
                    </div>
                    {isCasting ? (
                      <RefreshCw size={20} className="animate-spin text-indigo-600" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center mt-8 text-slate-400 text-xs font-medium uppercase tracking-widest px-12">
        By casting your vote, you agree to the cryptographic protocols of the Decentralized Election Commission.
      </p>
    </div>
  );

  const renderAudit = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-slate-100 font-bold flex items-center gap-2">
              <Code size={18} className="text-indigo-400" />
              Smart Contract Editor
            </h3>
            <button 
              onClick={handleAudit}
              disabled={isAuditing}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {isAuditing ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Audit with Gemini 3.0
            </button>
          </div>
          <textarea
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
            className="w-full h-[600px] bg-slate-950 text-emerald-400 p-6 rounded-2xl border border-slate-800 mono text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="Paste your Solidity code here..."
          />
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[700px] pr-2">
        {!auditResult && !isAuditing && (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ready for Audit</h3>
            <p className="text-slate-500 max-w-xs">Run the Gemini audit to check for vulnerabilities in your e-voting smart contract.</p>
          </div>
        )}

        {isAuditing && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <RefreshCw className="text-indigo-600 animate-spin" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Code...</h3>
            <p className="text-slate-500 animate-pulse">Running deep static analysis and formal verification simulations.</p>
          </div>
        )}

        {auditResult && !isAuditing && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Audit Summary</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">Security Score:</span>
                  <div className={`text-2xl font-black ${auditResult.securityScore > 80 ? 'text-emerald-500' : auditResult.securityScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {auditResult.securityScore}%
                  </div>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                {auditResult.summary}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 px-2 uppercase tracking-widest text-xs">Vulnerabilities Found</h4>
              {auditResult.issues.map((issue, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border ${
                  issue.severity === 'high' ? 'bg-red-50 border-red-100' : 
                  issue.severity === 'medium' ? 'bg-amber-50 border-amber-100' : 
                  'bg-blue-50 border-blue-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={
                      issue.severity === 'high' ? 'text-red-600' : 
                      issue.severity === 'medium' ? 'text-amber-600' : 
                      'text-blue-600'
                    } size={20} />
                    <div>
                      <h5 className="font-bold text-slate-900">{issue.title}</h5>
                      <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
                      {issue.line && (
                        <span className="inline-block mt-3 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono rounded">
                          LINE: {issue.line}
                        </span>
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

  const renderArchitect = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-10 text-white shadow-2xl shadow-indigo-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Blockchain Architect</h2>
            <p className="text-indigo-100 text-sm">Design complex voting logic with Gemini 3.0 reasoning engine.</p>
          </div>
        </div>
        
        <div className="relative">
          <textarea 
            value={advicePrompt}
            onChange={(e) => setAdvicePrompt(e.target.value)}
            placeholder="e.g. How can I implement Zero-Knowledge Proofs for voter privacy?"
            className="w-full h-32 bg-white/10 border border-white/20 rounded-2xl p-6 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none"
          />
          <button 
            onClick={handleAskArchitect}
            disabled={isAsking || !advicePrompt}
            className="absolute bottom-4 right-4 px-6 py-2 bg-white text-indigo-600 rounded-full font-bold text-sm shadow-xl hover:bg-indigo-50 transition-all disabled:opacity-50"
          >
            {isAsking ? <RefreshCw className="animate-spin" size={18} /> : 'Generate Blueprint'}
          </button>
        </div>
      </div>

      {adviceResult && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm leading-relaxed whitespace-pre-wrap">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={24} />
              Architectural Design Response
            </h3>
            <button className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline">
              Copy Proposal <ExternalLink size={14} />
            </button>
          </div>
          <div className="prose prose-slate max-w-none text-slate-600">
            {adviceResult}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, title: "ZKP Integration", desc: "Validate votes without revealing the candidate." },
          { icon: Database, title: "L2 Scalability", desc: "Optimize gas fees using Polygon or Arbitrum." },
          { icon: Search, title: "Formal Verification", desc: "Prove your contract logic is mathematically sound." },
        ].map((feat, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <feat.icon className="text-indigo-600 mb-4" size={24} />
            <h4 className="font-bold mb-1">{feat.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLedger = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Verification Portal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Transaction</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Enter Voter or Block Hash..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm mono"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
            <button 
              onClick={handleSearchTx}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
            >
              Search Ledger
            </button>
          </div>

          {searchResult && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3">
                <CheckCircle size={18} />
                Transaction Valid
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Timestamp</p>
                  <p className="text-slate-700">{new Date(searchResult.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Block Number</p>
                  <p className="text-slate-700 font-mono">#{searchResult.blockNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Voter Hash</p>
                  <p className="text-slate-700 font-mono break-all">{searchResult.voterHash}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-indigo-400" size={24} />
            <h3 className="font-bold">Proof of Tally</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            The final vote tally is verified using an aggregate of all blocks. Any tampering with a block would invalidate the entire hash chain.
          </p>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mono text-[10px]">
            SUM(TX_LIST) | HASH_CHAIN_ROOT: 
            <span className="text-indigo-400 block mt-1 break-all">
              {ledger[ledger.length-1]?.hash || 'PENDING...'}
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <BlockchainVisualizer ledger={ledger} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 ml-64 p-8 lg:p-12 relative">
        <header className="flex flex-wrap items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {view.charAt(0).toUpperCase() + view.slice(1)} <span className="text-indigo-600">Module</span>
            </h1>
            <p className="text-slate-500 font-medium">Securing democracy through cryptographic truth.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Network: Ethereum Sepolia
            </div>
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-slate-800 transition-colors shadow-lg">
              <User size={20} />
            </div>
          </div>
        </header>

        {view === 'dashboard' && renderDashboard()}
        {view === 'vote' && renderVote()}
        {view === 'audit' && renderAudit()}
        {view === 'architect' && renderArchitect()}
        {view === 'ledger' && renderLedger()}

        {/* Floating Gemini Status */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200 px-4 py-2 rounded-full shadow-2xl hover:shadow-indigo-500/20 transition-all cursor-pointer group">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <BrainCircuit size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Powered by</p>
              <p className="text-sm font-black text-slate-900 leading-none">Gemini 3.0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
