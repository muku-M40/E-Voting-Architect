
import React from 'react';
import { VoteRecord } from '../types';
import { Shield, Link as LinkIcon, Box, Activity, Cpu } from 'lucide-react';

interface Props {
  ledger: VoteRecord[];
}

const BlockchainVisualizer: React.FC<Props> = ({ ledger }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Box size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Live Ledger</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time immutable storage stream</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Blocks</p>
            <p className="text-lg font-mono font-bold text-indigo-600">{ledger.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Block Time</p>
            <p className="text-lg font-mono font-bold text-emerald-600">12.4s</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 border-l border-dashed border-slate-300"></div>
        <div className="space-y-6">
          {ledger.map((block, idx) => (
            <div key={block.id} className="relative pl-20 group">
              <div className="absolute left-6 top-6 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full z-10 flex items-center justify-center shadow-[0_0_10px_rgba(79,70,229,0.4)]">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-indigo-600">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="mono text-xs font-bold text-indigo-600">#{(block.blockNumber).toString().padStart(6, '0')}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">Mined</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Activity size={12} />
                      <span className="text-[10px] mono">244k Gas</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Voter Address</label>
                        <Shield size={10} className="text-emerald-500" />
                      </div>
                      <div className="mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 break-all leading-relaxed">
                        {block.voterHash}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">State Merkle Root</label>
                        <Cpu size={10} className="text-indigo-400" />
                      </div>
                      <div className="mono text-[11px] bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/50 text-indigo-700 break-all leading-relaxed">
                        0x{block.hash.substring(0, 42)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-50 grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between text-[10px] mono">
                      <div className="flex items-center gap-2">
                         <LinkIcon size={10} className="text-slate-300" />
                         <span className="text-slate-400 uppercase font-bold">Prev:</span>
                         <span className="text-slate-500">{block.previousHash.substring(0, 24)}...</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
                        <Shield size={10} />
                        <span>Valid Signature</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )).reverse()}
        </div>
      </div>
    </div>
  );
};

export default BlockchainVisualizer;
