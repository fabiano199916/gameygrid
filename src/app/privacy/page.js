'use client';
import React from 'react';

export default function PrivacyAndRefundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 md:p-16 flex justify-center">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black tracking-wider uppercase text-orange-400">Privacy Policy & Refund Framework</h1>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase">Compliance Blueprint: New Zealand Privacy Act 2020</p>
        </div>

        <section className="space-y-3 text-xs leading-relaxed text-slate-300">
          <h3 className="font-bold text-slate-200 uppercase tracking-wide font-mono text-[11px] text-orange-400/80">1. Clean Transparent Refund Policy</h3>
          <p>
            Because grid matrix blocks occupy finite, real-time spatial real estate on our homepage directory view, all coordinate rentals are considered customized digital allocations and are generally non-refundable once activated live. 
          </p>
          <p>
            <strong>Pre-Activation Rejections:</strong> If your slot application is rejected by our moderation loop during the initial quarantine review phase due to a mismatch of parameters, branding questions, or asset formatting errors, a 100% full transaction refund will be automatically initialized via Stripe back to your payment card.
          </p>
        </section>

        <section className="space-y-3 text-xs leading-relaxed text-slate-300">
          <h3 className="font-bold text-slate-200 uppercase tracking-wide font-mono text-[11px] text-orange-400/80">2. Data Management Compliance</h3>
          <p>
            In absolute compliance with the New Zealand Privacy Act 2020, GameyGrid collects only the core transactional identifiers required to manage your grid cells safely (including studio names, public digital image URLs, and Steam store links). We do not store, access, or log raw credit card tokens on our data matrices; all financial clearing protocols are handled strictly by Stripe NZ's encrypted cloud nodes.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span>DATA VAULT PROTECTION SECURE</span>
          <a href="/" className="text-orange-400 hover:underline font-bold">← Return to Grid Map</a>
        </div>
      </div>
    </div>
  );
}
