'use client';
import React, { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = '/';
      return;
    }
    const timerInterval = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timerInterval);
  }, [countdown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-sans text-white p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        
        <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-xl font-black uppercase tracking-wider text-emerald-400">Transaction Cleared</h2>
        <p className="text-xs text-slate-400 font-mono mt-1 uppercase">Sandbox Ledger Verified</p>

        <div className="my-6 bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2.5 text-xs text-slate-300 font-mono">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wide text-orange-400">Allocation Security Pipeline</p>
          <p>• Secure digital payment processed successfully via Stripe NZ.</p>
          <p>• Transmitted pixel coordinate parameters registered in server queue.</p>
          <p>• Your logo placement is now pending moderator activation check.</p>
        </div>

        <a 
          href="/"
          className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 rounded-xl transition-all border border-slate-700 cursor-pointer"
        >
          Return to Matrix Dashboard
        </a>

        <p className="text-[10px] text-slate-500 font-mono mt-4">
          Auto-returning to matrix grid viewport in <span className="text-orange-400 font-bold">{countdown}s</span>...
        </p>

      </div>
    </div>
  );
}
