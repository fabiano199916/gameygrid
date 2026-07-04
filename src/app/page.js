'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Links your canvas directly to your cloud data tunnel

// CONCENTRIC MATHEMATICAL ALGORITHM: Sizing segments decrease outward from center (500,500)
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
  const [logoImageUrl, setLogoImageUrl] = useState(''); // 🎨 Coded custom artwork link tracker state
  const [subscriptionTier, setSubscriptionTier] = useState('weekly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState('');
  
  // State variables for real cloud data
  const [liveDbSlots, setLiveDbSlots] = useState([]);
  const [inventoryCounts, setInventoryCounts] = useState({ anchorsLeft: 10, premiumLeft: 100 });

  // FETCH THE ABSOLUTE TRUTH DIRECTLY FROM SUPABASE ON PAGE LOAD
  useEffect(() => {
    const fetchCloudGridMemory = async () => {
      try {
        const { data, error } = await supabase
          .from('gaming_grid_slots')
          .select('*')
          .eq('availability_status', 'active');

        if (error) throw error;
        if (data) {
          setLiveDbSlots(data);
          
          // Legally compliant dynamic inventory counter math
          const activeAnchors = data.filter(s => s.block_size_px === 100).length;
          const activePremium = data.filter(s => s.block_size_px === 40).length;
          setInventoryCounts({
            anchorsLeft: 10 - activeAnchors,
            premiumLeft: 100 - activePremium
          });
        }
      } catch (err) {
        console.error("Database connection failure:", err.message);
      }
    };
    fetchCloudGridMemory();
  }, []);

  const displayCurrencySymbol = (priceUSD) => {
    if (selectedCurrency === 'EUR') return `€${(priceUSD * 0.92).toFixed(0)}`;
    if (selectedCurrency === 'NZD') return `NZ$${(priceUSD * 1.65).toFixed(0)}`;
    return `US$${priceUSD}`;
  };
  // DISPATCH FORM PAYLOAD DIRECTLY TO THE STRIPE BACKEND ENDPOINT
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
          logoImageUrl, // 🔏 Securely tunneled custom image link to payment metadata
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
        
        // Check if this coordinate cell exists inside your live Supabase array
        const occupant = liveDbSlots.find(s => s.x_coordinate === x && s.y_coordinate === y);
        const isCurrentlyHovered = activeHover && activeHover.x === x && activeHover.y === y;

        // Mathematical conversion from 1000px virtual scale to your 760px HTML display scale
        const renderScaleMultiplier = 760 / 1000;
        const leftPositionPx = x * renderScaleMultiplier;
        const topPositionPx = y * renderScaleMultiplier;
        const renderedSizePx = specs.size * renderScaleMultiplier;

        // TARGET DIMENSION LOCK: Force the viewing glass to balloon to exactly 300px regardless of base size
        const targetLensSizePx = 300;
        const offsetCorrectionPx = (targetLensSizePx - renderedSizePx) / 2;

        cellBlocks.push(
          <div
            key={`${x}-${y}`}
            style={{ 
              position: 'absolute',
              left: isCurrentlyHovered ? `${leftPositionPx - offsetCorrectionPx}px` : `${leftPositionPx}px`,
              top: isCurrentlyHovered ? `${topPositionPx - offsetCorrectionPx}px` : `${topPositionPx}px`,
              width: isCurrentlyHovered ? `${targetLensSizePx}px` : `${renderedSizePx}px`, 
              height: isCurrentlyHovered ? `${targetLensSizePx}px` : `${renderedSizePx}px`,
              zIndex: isCurrentlyHovered ? 999999 : 10,
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={() => occupant && setActiveHover({ ...occupant, specs, x, y })}
            onMouseLeave={() => setActiveHover(null)}
          >
            {occupant ? (
              /* 🎯 HARDWARE-ACCELERATED FLOATING PIXEL DILATION ENGINE */
              <a 
                href={occupant.destination_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'block', // Forces the anchor to match the cell borders completely at all times
                  backgroundColor: '#0f172a',
                  zIndex: isCurrentlyHovered ? 9999999 : 20,
                  boxShadow: isCurrentlyHovered ? '0 0 50px 20px rgba(239, 68, 68, 0.6)' : 'none',
                  
                  // 🔴 THE MASSIVE RED RADAR CIRCLE RING (Only frames as a large circle on hover)
                  border: isCurrentlyHovered ? '4px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: isCurrentlyHovered ? '50%' : '0px',
                  
                  transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.15s ease, box-shadow 0.15s ease',
                  cursor: 'pointer',
                  overflow: 'hidden' // Keeps the artwork perfectly clipped inside your red circle lens on hover
                }}
              >
                <img 
                  src={occupant.image_storage_url} 
                  alt={occupant.studio_name} 
                  style={{ 
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://unsplash.com';
                  }}
                />
              </a>
            ) : (
                            /* 🎯 PROMO-OPTIMIZED INTERACTIVE TEXT CELL DESIGN */
              <div 
                onClick={() => setSelectedBlock({ x, y, specs })}
                className="absolute inset-0 bg-slate-950/60 border border-slate-900/40 hover:bg-orange-500/20 border-dashed cursor-pointer flex flex-col items-center justify-center font-mono opacity-0 hover:opacity-100 transition-opacity duration-100 z-10"
              >
                {/* Automatically displays "FREE 7D" if browsed before midnight on July 10, 2026 */}
                {new Date() < new Date('2026-07-11T00:00:00Z') ? (
                  <>
                    <span className="text-[6px] text-orange-400 font-bold tracking-tighter">FREE 7D</span>
                    <span className="text-[5px] text-slate-500 line-through">
                      {displayCurrencySymbol(specs.basePriceUSD)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[7px] text-emerald-400">OPEN</span>
                    <span className="text-[7px] text-emerald-500/80">
                      {displayCurrencySymbol(specs.basePriceUSD)}
                    </span>
                  </>
                )}
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
        
        {/* NAVIGATION LAYER */}
        <div className="w-full max-w-[800px] flex justify-between items-center mb-6 bg-slate-900/60 border border-slate-800 px-6 py-4 rounded-2xl backdrop-blur-md">
          <h1 className="font-black text-sm tracking-widest text-slate-100 uppercase">GAMEYGRID    TEST PAGE</h1>
          <select 
            value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}
            className="bg-slate-950 text-xs font-bold border border-slate-700 text-orange-400 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="USD">USD ($) — Global</option>
            <option value="EUR">EUR (€) — Eurozone</option>
            <option value="NZD">NZD (NZ$) — Local</option>
          </select>
        </div>

        
        {/* ✅ CORRECT UNCLIPPED CODE (Unlocks the floating 5x zoom lens display): */}
{/* GEOMETRIC AD CANVAS */}
<div className="relative border-4 border-slate-800 bg-slate-900/20 rounded-2xl p-3 shadow-2xl overflow-visible max-w-full z-10">
  <div className="relative w-[760px] h-[760px] bg-slate-950 rounded-lg border border-slate-900 overflow-visible">
          {renderGridMatrix()}
        </div>


          {/* DYNAMIC HOVER VIDEO OVERLAY */}
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

      {/* SIDEBAR CONTAINER PANEL */}
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
            <input type="url" required value={steamUrl} onChange={(e) => setSteamUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-300 focus:outline-none" placeholder="https://steampowered.com..." />
          </div>

          {/* 🎨 BRAND NEW FIELD: CUSTOM LOGO DESIGN IMAGE LINK */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Custom Logo or Drawing Image URL</label>
            <input 
              type="url" 
              required 
              value={logoImageUrl} 
              onChange={(e) => setLogoImageUrl(e.target.value)} 
              placeholder="https://imgur.com" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-300 focus:outline-none" 
            />
            {/* ✅ CORRECT CODE (Displays clear structural asset guidelines near the input text field): */}
<p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal">
  Paste a direct asset web link to your game drawing or icon design (supports PNG, JPG, or animated GIFs). <span className="text-orange-500/80 font-bold">Max recommended file size: 5MB</span> for optimal 300px hover zoom response speeds.
</p>

          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Billing Rental Cycle</label>
            <select value={subscriptionTier} onChange={(e) => setSubscriptionTier(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-orange-400 font-bold focus:outline-none cursor-pointer">
              <option value="weekly">Weekly — Base Rate</option>
              <option value="monthly">Monthly — Save 10%</option>
              <option value="annual">Annual — Save 25%</option>
            </select>
          </div>

          {/* 🛡️ THE MANDATORY LEGAL SHIELD GATEWAY INPUT */}
          <div className="flex items-start gap-2.5 my-4">
            <input 
              type="checkbox" 
              required 
              className="w-4 h-4 mt-0.5 accent-orange-500 rounded cursor-pointer focus:ring-0" 
            />
            <span className="text-[10px] text-slate-400 font-mono leading-relaxed">
              I explicitly read, accept, and agree to the 
              <a href="/terms" target="_blank" className="text-orange-400 hover:underline mx-1">Terms of Service</a> 
              and the 
              <a href="/privacy" target="_blank" className="text-orange-400 hover:underline ml-1">Refund Policy</a>. 
              I verify that I hold all legal trademarks and permissions for the uploaded media assets.
            </span>
          </div>

          <button type="submit" disabled={checkoutLoading} className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-slate-800 text-black font-extrabold py-2.5 rounded-lg transition-colors cursor-pointer text-center">
            {checkoutLoading ? 'Encrypting Tokens...' : 'Open Sandbox Checkout'}
          </button>
        </form>


          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
            <h3 className="text-xs font-black tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Live Compliance Tracker
            </h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Mega Anchors:</span>
                <span className="text-orange-400 font-bold">{inventoryCounts.anchorsLeft} / 10 Left</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Premium Slots:</span>
                <span className="text-orange-400 font-bold">{inventoryCounts.premiumLeft} / 100 Left</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono mt-4 border-t border-slate-800/80 pt-3">
              • Inventory tracks actual data rows fetched from live cloud clusters.
            </p>
            {/* 💳 SELF-SERVE CUSTOMER BILLING PORTAL ROUTER SHORTCUT */}
<a 
  href="https://stripe.com" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-[10px] text-slate-500 hover:text-orange-400 font-mono transition-colors duration-150 underline decoration-dotted"
>
  Manage / Cancel Subscription
</a>

          </div>
        )}
      </div>
    </div>
  );
}
