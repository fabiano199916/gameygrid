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
        
        const occupant = liveDbSlots.find(s => parseInt(s.x_coordinate) === x && parseInt(s.y_coordinate) === y);
        const isCurrentlyHovered = activeHover && activeHover.x === x && activeHover.y === y;

        const renderScaleMultiplier = 760 / 1000;
        const leftPositionPx = x * renderScaleMultiplier;
        const topPositionPx = y * renderScaleMultiplier;
        const renderedSizePx = specs.size * renderScaleMultiplier;

        cellBlocks.push(
          /* 📦 CORE CELL WRAPPER */
          <div
            key={`${x}-${y}`}
            style={{ 
              position: 'absolute',
              left: `${leftPositionPx}px`,
              top: `${topPositionPx}px`,
              width: `${renderedSizePx}px`,  
              height: `${renderedSizePx}px`, 
              zIndex: isCurrentlyHovered ? 999999 : 10,
              display: 'block', 
              padding: '0px',   
              margin: '0px',
              overflow: 'visible'
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
                  left: isCurrentlyHovered ? `-${(300 - renderedSizePx) / 2}px` : '0px',
                  top: isCurrentlyHovered ? `-${(300 - renderedSizePx) / 2}px` : '0px',
                  width: isCurrentlyHovered ? '300px' : `${renderedSizePx}px`, 
                  height: isCurrentlyHovered ? '300px' : `${renderedSizePx}px`,
                  
                  // 🔥 INJECT AS BACKGROUND IMAGE
                  backgroundImage: `url(${occupant.image_storage_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                  
                  // 🔥 VISUAL OVERRIDE: Blows up the unhovered cell block size by 300% so it looks huge!
                  transform: isCurrentlyHovered ? 'scale(1)' : 'scale(3)',
                  transformOrigin: 'center center',
                  
                  backgroundColor: '#0f172a',
                  zIndex: isCurrentlyHovered ? 9999999 : 20,
                  boxShadow: isCurrentlyHovered ? '0 0 50px 20px rgba(239, 68, 68, 0.6)' : 'none',
                  
                  border: isCurrentlyHovered ? '4px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: isCurrentlyHovered ? '50%' : '0px',
                  
                  transition: 'width 0.15s cubic-bezier(0.16, 1, 0.3, 1), height 0.15s cubic-bezier(0.16, 1, 0.3, 1), left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'block'
                }}
                title={occupant.studio_name}
              >
                {/* 🖼️ INNER IMAGE ELEMENT: Visible only during hover zoom expansion */}
                {isCurrentlyHovered && (
                  <img 
                    src={occupant.image_storage_url} 
                    alt={occupant.studio_name} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    className="pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                )}
              </a>
            ) : (
              /* ⏳ PROMO-OPTIMIZED INTERACTIVE TEXT CELL DESIGN */
              <div 
                onClick={() => setSelectedBlock({ x, y, specs })}
                className="absolute inset-0 bg-slate-950/60 border border-slate-900/40 hover:bg-orange-500/20 border-dashed cursor-pointer flex flex-col items-center justify-center font-mono opacity-0 hover:opacity-100 transition-opacity duration-100 z-10"
              >
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-orange-500/30">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">GAMEYGRID.COM</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Live Onboarding Production Console Engine</p>
        </div>
        <div className="flex gap-2">
          {['USD', 'EUR', 'NZD'].map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all duration-150 ${selectedCurrency === curr ? 'bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
            >
              {curr}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 📦 THE BIG FRAME GRID - CHANGED TO OVERFLOW-VISIBLE TO STOP LENS CLIPPING */}
        <section className="lg:col-span-2 relative bg-slate-950 border border-slate-900 rounded-xl p-4 min-h-[800px] overflow-visible shadow-2xl shadow-black/50">
          <div className="absolute inset-4 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />
          
          {/* THE SPECIFIC MATRIX FRAME CONTAINER - ALSO SET TO OVERFLOW-VISIBLE */}
          <div className="relative w-[760px] h-[760px] mx-auto bg-slate-950/80 rounded border border-slate-900 shadow-inner overflow-visible">
            {renderGridMatrix()}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 backdrop-blur-sm">
            <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase font-mono mb-4">Live Canvas Inventory</h2>
            <div className="grid grid-cols-2 gap-4 font-mono text-center">
              <div className="bg-slate-950 border border-slate-900 p-3 rounded-lg">
                <span className="block text-2xl font-bold text-amber-400">{inventoryCounts.anchorsLeft}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Anchors Left</span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-3 rounded-lg">
                <span className="block text-2xl font-bold text-orange-400">{inventoryCounts.premiumLeft}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Premium Left</span>
              </div>
            </div>
          </div>

          {selectedBlock ? (
            <div className="bg-slate-900/60 border border-orange-500/20 rounded-xl p-5 backdrop-blur-sm shadow-xl shadow-orange-500/5 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold text-orange-400 font-mono">Reserve Slot</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">X: {selectedBlock.x} | Y: {selectedBlock.y}</p>
                </div>
                <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedBlock.specs.zoneName}
                </span>
              </div>

              <form onSubmit={executeSecureStripeCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Studio Name</label>
                  <input
                    type="text"
                    required
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    placeholder="e.g., Team Cherry"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Steam Store Page URL</label>
                  <input
                    type="url"
                    required
                    value={steamUrl}
                    onChange={(e) => setSteamUrl(e.target.value)}
                    placeholder="https://steampowered.com..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Capsule Logo Image URL (.png / .jpg)</label>
                  <input
                    type="url"
                    required
                    value={logoImageUrl}
                    onChange={(e) => setLogoImageUrl(e.target.value)}
                    placeholder="e.g., https://postimages.org"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">💡 For best results, use a 300x300px square crop.</p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Subscription Billing Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'weekly', label: 'Weekly', desc: 'Free 7D Promo' },
                      { id: 'monthly', label: 'Monthly', desc: '10% Disc.' },
                      { id: 'annual', label: 'Annual', desc: '25% Disc.' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSubscriptionTier(t.id)}
                        className={`p-2 border rounded text-center transition-all duration-150 flex flex-col items-center justify-center ${subscriptionTier === t.id ? 'border-orange-500 bg-orange-500/5 text-orange-400 font-bold' : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'}`}
                      >
                        <span className="text-xs font-mono">{t.label}</span>
                        <span className="text-[8px] opacity-60 font-mono mt-0.5">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {errorPrompt && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 font-mono leading-relaxed">
                    {errorPrompt}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold font-mono rounded text-sm transition-all duration-150 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <span className="block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Generate Checkout Protocol</span>
                      <span className="text-xs px-1.5 py-0.5 bg-slate-950 text-orange-400 rounded border border-orange-500/20 font-bold">
                        {subscriptionTier === 'weekly' ? 'FREE' : displayCurrencySymbol(selectedBlock.specs.basePriceUSD)}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-900 border-dashed rounded-xl p-8 text-center backdrop-blur-sm">
              <p className="text-xs text-slate-500 font-mono leading-relaxed">
                Select an available canvas coordinate box matrix slot from the live map dashboard to generate checkout protocols.
              </p>
            </div>
          )}
        </section>
      </main>

            <footer className="max-w-6xl mx-auto mt-12 border-t border-slate-900 pt-6 pb-12 flex flex-col items-center gap-4 text-center px-4">
        <p className="text-[10px] text-slate-500 font-mono">
          • Framework tracks actual data rows fetched from live cloud clusters.
        </p>
        
        {/* 💳 DYNAMIC SELF-SERVE CUSTOMER BILLING CONNECTOR */}
        <button 
          onClick={async () => {
            const customerEmailInput = prompt("🔑 Manage Your Space: Enter the exact billing email address you used at checkout:");
            if (!customerEmailInput) return;
            
            try {
              const response = await fetch('/api/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: customerEmailInput })
              });
              
              const data = await response.json();
              if (response.ok && data.url) {
                window.open(data.url, '_blank', 'noopener,noreferrer');
              } else {
                alert(`❌ Verification Failed: ${data.error || 'Could not verify account records.'}`);
              }
            } catch (err) {
              alert("❌ Cloud Communication Timeout. Please try again.");
            }
          }}
          className="text-[10px] text-slate-400 hover:text-orange-400 font-mono transition-colors duration-150 underline decoration-dotted bg-transparent border-none cursor-pointer p-0"
        >
          Manage / Cancel Subscription
        </button>

        {/* ⚖️ LEGAL SAFETY DISCLAIMER CARD BLOCK PANEL */}
        <div className="mt-2 max-w-2xl bg-slate-950 border border-slate-900/60 p-4 rounded-lg text-left font-mono">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">⚖️ Terms of Service & Liability Disclaimer</h4>
          <p className="text-[9px] text-slate-500 leading-relaxed">
            GameyGrid operates strictly as a neutral spatial hosting canvas. All drawings, logos, and destination links are provided entirely by third-party users. The platform founder (Fabiano Baretta) does not guarantee the integrity or safety of external links. Under no circumstances shall the platform be held liable for any malware, digital fraud, phishing scripts, or malicious intent originating from user-allocated slots. Users navigate outbound links entirely at their own risk.
          </p>
        </div>
      </footer>

    </div>
  );
}
