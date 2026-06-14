'use client';
import React, { useState } from 'react';

const computeZoneSpecs = (x, y) => {
  const centerX = 500;
  const centerY = 500;
  const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

  if (distance <= 150) return { size: 100, basePriceUSD: 400, zoneName: "Mega Anchor" };
  if (distance <= 350) return { size: 40, basePriceUSD: 150, zoneName: "Premium Slot" };
  if (distance <= 450) return { size: 20, basePriceUSD: 75, zoneName: "Standard Block" };
  return { size: 10, basePriceUSD: 25, zoneName: "Micro Block" };
};

export default function GameyGridDashboard() {
  const [activeHover, setActiveHover] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [studioName, setStudioName] = useState('');
  const [steamUrl, setSteamUrl] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('weekly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState('');

  const dummyStudioSlots = [
    { x_coordinate: 460, y_coordinate: 460, studio_name: "Cyber Rebel Studios", destination_link: "https://steampowered.com", image_storage_url: "https://unsplash.com", game_trailer_url: "https://youtube.com" }
  ];

  const displayCurrencySymbol = (priceUSD) => {
    if (selectedCurrency === 'EUR') return `€${(priceUSD * 0.92).toFixed(0)}`;
    if (selectedCurrency === 'NZD') return `NZ$${(priceUSD * 1.65).toFixed(0)}`;
    return `US$${priceUSD}`;
  };

  const executeSecureStripeCheckout = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setErrorPrompt('');

    if (!steamUrl.includes('://steampowered.com')) {
      setErrorPrompt('Format Error: Please paste a valid Steam application store link.');
      setCheckoutLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: selectedBlock.x,
          y: selectedBlock.y,
          size: selectedBlock.specs.size.toString(),
          studioName,
          steamUrl,
          tier: subscriptionTier
        })
      });

      const outcome = await response.json();
      if (!response.ok) throw new Error(outcome.error || 'Connection timed out.');
      if (outcome.url) window.location.href = outcome.url;
    } catch (err) {
      setErrorPrompt(`Infrastructure Exception: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const renderGridMatrix = () => {
    let cellBlocks = [];
    for (let x = 0; x < 1000; x += 20) {
      for (let y = 0; y < 1000; y += 20) {
        const specs = computeZoneSpecs(x, y);
        const occupant = dummyStudioSlots.find(s => s.x_coordinate === x && s.y_coordinate === y);

        cellBlocks.push(
          <div
            key={`${x}-${y}`}
            style={{ width: `${specs.size}px`, height: `${specs.size}px` }}
            className={`border border-slate-900/40 relative group transition-all duration-150 ${
              occupant ? 'bg-slate-800 border-orange-500/40' : 'bg-slate-950/60 hover:bg-emerald-500/20 border-dashed cursor-pointer'
            }`}
            onMouseEnter={() => occupant && setActiveHover({ ...occupant, specs, x, y })}
            onMouseLeave={() => setActiveHover(null)}
            onClick={() => !occupant && setSelectedBlock({ x, y, specs })}
          >
            {occupant ? (
              <img src={occupant.image_storage_url} alt="Indie Game Poster" className="w-full h-full object-cover" />
            ) : (
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-[7px] text-emerald-400 font-mono p-0.5 pointer-events-none z-10">
                <span>OPEN</span>
                <span>{displayCurrencySymbol(specs.basePriceUSD)}</span>
              </div>
            )}
          </div>
        );
      }
    }
    return cellBlocks;
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center min-h-screen p-6 bg-slate-950 gap-8 font-sans">
      <div className="flex flex-col items-center flex-1 w-full">
        <div className="w-full max-w-[800px] flex justify-between items-center mb-6 bg-slate-900/60 border border-slate-800 px-6 py-4 rounded-2xl backdrop-blur-md">
          <h1 className="font-black text-sm tracking-widest text-slate-100 uppercase">GAMEYGRID.GG</h1>
          <select 
            value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}
            className="bg-slate-950 text-xs font-bold border border-slate-700 text-orange-400 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="USD">USD ($) — Global</option>
            <option value="EUR">EUR (€) — Eurozone</option>
            <option value="NZD">NZD (NZ$) — Local</option>
          </select>
        </div>

        <div className="relative border-4 border-slate-800 bg-slate-900/20 rounded-2xl p-3 shadow-2xl overflow-hidden max-w-full">
          <div className="flex flex-wrap w-[760px] h-[760px] bg-slate-950 rounded-lg overflow-hidden border border-slate-900">
            {renderGridMatrix()}
          </div>

          {activeHover && (
            <div className="absolute z-50 bottom-6 right-6 w-64 bg-slate-900 border border-orange-500/60 rounded-xl p-4 shadow-2xl backdrop-blur-md">
              <h4 className="font-black text-xs text-slate-100 uppercase truncate">{activeHover.studio_name}</h4>
              <p className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">{activeHover.specs.zoneName} Slot</p>
              <div className="my-3 aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black">
                <iframe className="w-full h-full" src={activeHover.game_trailer_url} title="Trailer player" />
              </div>
              <a href={activeHover.destination_link} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-orange-500 text-black text-xs font-bold py-2 rounded-lg">
                View Game on Steam
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-6 lg:mt-16">
        {selectedBlock ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-black uppercase text-orange-400">Configure Placement</h3>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">Coordinates: ({selectedBlock.x}, {selectedBlock.y})</p>
              </div>
              <button onClick={() => setSelectedBlock(null)} className="text-slate-500 hover:text-slate-300 text-xs font-bold font-mono">✕ Close</button>
            </div>

            {errorPrompt && <p className="text-xs font-mono text-red-400 bg-red-950/30 p-2 border border-red-900 rounded-lg mb-3">⚠️ {errorPrompt}</p>}

            <form onSubmit={executeSecureStripeCheckout} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Studio / Developer Name</label>
                <input type="text" required value={studioName} onChange={(e) => setStudioName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none" placeholder="e.g. Pixel Forge Games" />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Steam Game Store link</label>
                <input type="url" required value={steamUrl} onChange={(e) => setSteamUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-300 focus:outline-none" placeholder="https://steampowered.com/app/..." />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Billing Rental Cycle</label>
                <select value={subscriptionTier} onChange={(e) => setSubscriptionTier(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-orange-400 font-bold focus:outline-none cursor-pointer">
                  <option value="weekly">Weekly — Base Rate</option>
                  <option value="monthly">Monthly — Save 10%</option>
                  <option value="annual">Annual — Save 25%</option>
                </select>
              </div>

              <button type="submit" disabled={checkoutLoading} className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-slate-800 text-black font-extrabold py-2.5 rounded-lg transition-colors cursor-pointer text-center">
                {checkoutLoading ? 'Encrypting Tokens...' : 'Open Sandbox Checkout'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
            <h3 className="text-xs font-black tracking-wider text-slate-400 uppercase mb-2">Live Canvas Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Click any open, dashed square layout boundary on the geometric map to view real-time multi-currency pricing discount brackets and initialize a sandbox session.</p>
          </div>
        )}
      </div>
    </div>
  );
}
