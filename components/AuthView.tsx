
import React, { useState } from 'react';
import { Shield, Lock, Mail, User as UserIcon, Fingerprint, Zap, Key, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authType, setAuthType] = useState<'web2' | 'web3'>('web3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [voterId, setVoterId] = useState('');

  const handleWeb3Auth = async () => {
    setIsProcessing(true);
    setStatus('Connecting to Wallet...');
    await new Promise(r => setTimeout(r, 1200));
    
    setStatus('Requesting Signature...');
    // Simulate SIWE signature request
    await new Promise(r => setTimeout(r, 1500));
    
    const mockAddress = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
    
    const user: User = {
      id: crypto.randomUUID(),
      type: 'web3',
      identifier: mockAddress,
      isVerified: true,
      voterId: `VID-${Math.random().toString(36).substring(7).toUpperCase()}`
    };

    onLogin(user);
    setIsProcessing(false);
  };

  const handleWeb2Auth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsProcessing(true);
    setStatus(mode === 'login' ? 'Authenticating...' : 'Creating Secure Account...');
    await new Promise(r => setTimeout(r, 2000));
    
    const user: User = {
      id: crypto.randomUUID(),
      type: 'web2',
      identifier: email,
      isVerified: mode === 'login',
      voterId: mode === 'login' ? 'VID-EXISTING' : voterId
    };

    onLogin(user);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse duration-700"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden shadow-indigo-500/10">
          <div className="p-12 text-center border-b border-slate-800 bg-slate-900/50">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 mx-auto mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Shield size={40} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">ChainVote Protocol</h1>
            <p className="text-slate-400 font-medium">Decentralized Identity & Secure Tallying Interface</p>
          </div>

          <div className="p-12">
            {isProcessing ? (
              <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <div className="relative mb-10">
                  <div className="w-24 h-24 border-4 border-indigo-900 rounded-full animate-spin border-t-indigo-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <Zap size={32} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{status}</h3>
                <p className="text-slate-500 font-medium">Verifying cryptographic integrity across distributed nodes.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                  <button 
                    onClick={() => setAuthType('web3')}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${authType === 'web3' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    <Fingerprint size={16} /> Web3 Wallet
                  </button>
                  <button 
                    onClick={() => setAuthType('web2')}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${authType === 'web2' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    <Mail size={16} /> Web2 Hybrid
                  </button>
                </div>

                {authType === 'web3' ? (
                  <div className="space-y-6">
                    <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center">
                      <Lock className="mx-auto text-indigo-500 mb-6" size={40} />
                      <h3 className="text-white font-black text-xl mb-2">Passwordless Login</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8">Authenticate using your private key. We use Sign-In with Ethereum (SIWE) to ensure your identity remains sovereign.</p>
                      <button 
                        onClick={handleWeb3Auth}
                        className="w-full py-5 bg-white text-indigo-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        Connect & Sign
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleWeb2Auth} className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative group">
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full pl-14 pr-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500" size={20} />
                      </div>
                      <div className="relative group">
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Secure Password"
                          className="w-full pl-14 pr-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500" size={20} />
                      </div>
                      {mode === 'register' && (
                        <div className="relative group animate-in fade-in duration-300">
                          <input 
                            type="text" 
                            required
                            value={voterId}
                            onChange={(e) => setVoterId(e.target.value)}
                            placeholder="Government/Voter ID"
                            className="w-full pl-14 pr-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                          <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500" size={20} />
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                    >
                      {mode === 'login' ? 'Enter Dashboard' : 'Complete Registration'}
                    </button>

                    <div className="text-center pt-4">
                      <button 
                        type="button"
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-indigo-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors"
                      >
                        {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-slate-500 grayscale opacity-50">
           <div className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase"><Lock size={14} /> SOC2 Compliant</div>
           <div className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase"><CheckCircle size={14} /> audited v2.0</div>
           <div className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase"><Zap size={14} /> 1.2s Finality</div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
