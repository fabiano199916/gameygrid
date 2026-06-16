'use client';
import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 md:p-16 flex justify-center">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black tracking-wider uppercase text-orange-400">Terms of Service & Advertising Agreement</h1>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase">Governing Law: New Zealand Jurisdiction</p>
        </div>

        <section className="space-y-3 text-xs leading-relaxed text-slate-300">
          <h3 className="font-bold text-slate-200 uppercase tracking-wide font-mono text-[11px] text-orange-400/80">1. Intellectual Property & Trademark Indemnity</h3>
          <p>
            By purchasing advertising space, the Advertiser represents and warrants that they own or possess all necessary global legal rights, licenses, and consents for the trademarks, images, logos, titles, and redirect destination links submitted. GameyGrid assumes zero liability for third-party trademark or copyright infringements. 
          </p>
          <p className="bg-slate-950 p-3 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-400">
            <strong>INDEMNITY CLAUSE:</strong> The Advertiser agrees to fully indemnify, defend, and hold harmless GameyGrid, its software stack engineers, and operators from any legal claims, damages, court fees, or enforcement costs resulting from a breach of this intellectual property warranty.
          </p>
        </section>

        <section className="space-y-3 text-xs leading-relaxed text-slate-300">
          <h3 className="font-bold text-slate-200 uppercase tracking-wide font-mono text-[11px] text-orange-400/80">2. Post-Approval Content Removal & Moderation Right</h3>
          <p>
            GameyGrid operates a strict content quarantine pipeline. We reserve the absolute operational right to reject, suspend, alter, or permanently delete any grid placement cell layout at our sole discretion, without warning or prior notice, if the content or destination redirect link is deemed malicious, fraudulent, offensive, or in violation of our platform safety guidelines.
          </p>
          <p>
            Advertisers explicitly agree that grid content deletions resulting from a post-approval Terms of Service violation (such as modifying redirect paths to unauthorized domains) forfeit all rental subscription funds. No refunds will be issued for contract violations occurring post-activation.
          </p>
        </section>

        <section className="space-y-3 text-xs leading-relaxed text-slate-300">
          <h3 className="font-bold text-slate-200 uppercase tracking-wide font-mono text-[11px] text-orange-400/80">3. Complete Limitation of Liability</h3>
          <p>
            To the maximum extent permitted under New Zealand law, GameyGrid provides its ad matrix services on an "as-is" and "as-available" baseline framework. In no event shall GameyGrid or its operators be held liable for any indirect, incidental, punitive, or consequential damages, including but not limited to loss of corporate profits, database data corruption, network downtime, Steam store traffic fluctuations, or financial loss arising from the use or inability to use this platform.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span>GAMEYGRID SYSTEM CODES</span>
          <a href="/" className="text-orange-400 hover:underline font-bold">← Return to Grid Map</a>
        </div>
      </div>
    </div>
  );
}
