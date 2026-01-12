
import React from 'react';
import { VoteRecord } from '../types';
import { Shield, Link as LinkIcon, Box } from 'lucide-react';

interface Props {
  ledger: VoteRecord[];
}

const BlockchainVisualizer: React.FC<Props> = ({ ledger }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Box className="text-indigo-600" />
          Blockchain Ledger State
        </h3>
        <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
          {ledger.length} BLOCKS TOTAL
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
        <div className="space-y-8">
          {ledger.map((block, idx) => (
            <div key={block.id} className="relative pl-14 group">
              <div className="absolute left-4 top-1 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full z-10 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded">
                      BLOCK #{block.blockNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Shield size={14} />
                    <span className="text-[10px] font-bold uppercase">Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Voter Hash</label>
                    <div className="mono text-xs bg-slate-50 p-2 rounded truncate border border-slate-100">
                      {block.voterHash}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate Hash</label>
                    <div className="mono text-xs bg-slate-50 p-2 rounded truncate border border-slate-100">
                      SHA256: {block.candidateId}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                    <LinkIcon size={12} className="text-slate-400" />
                    <span className="text-[10px] font-mono text-slate-400">PREV_HASH: {block.previousHash.substring(0, 16)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon size={12} className="text-indigo-400" />
                    <span className="text-[10px] font-mono text-indigo-500 font-bold">CURR_HASH: {block.hash.substring(0, 16)}...</span>
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
