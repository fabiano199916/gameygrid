import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { x, y, size, studioName, steamUrl, logoImageUrl, tier } = body;

    const origin = request.headers.get('origin') || 'https://gameygrid.com';

    const newX1 = parseInt(x);
    const newY1 = parseInt(y);
    const newSize = parseInt(size);
    const newX2 = newX1 + newSize;
    const newY2 = newY1 + newSize;

    // 1. Fetch active slots to prevent overlapping coordinates
    const { data: activeSlots, error: dbError } = await supabase
      .from('gaming_grid_slots')
      .select('x_coordinate, y_coordinate, block_size_px')
      .eq('availability_status', 'active');

    if (dbError) throw dbError;

    if (activeSlots) {
      for (const slot of activeSlots) {
        const existX1 = slot.x_coordinate;
        const existY1 = slot.y_coordinate;
        const existSize = slot.block_size_px;
        const existX2 = existX1 + existSize;
        const existY2 = existY1 + existSize;

        const isOverlappingX = newX1 < existX2 && newX2 > existX1;
        const isOverlappingY = newY1 < existY2 && newY2 > existY1;

        if (isOverlappingX && isOverlappingY) {
          return NextResponse.json(
            { error: `Spatial Conflict: Coordinates overlap an existing reserved grid allocation.` },
            { status: 400 }
          );
        }
      }
    }

    // 2. Calculate baseline pricing
    let priceInUSD = 25;
    if (newSize === 100) priceInUSD = 400;
    if (newSize === 40) priceInUSD = 150;
    if (newSize === 20) priceInUSD = 75;

    if (tier === 'monthly') priceInUSD = Math.round(priceInUSD * 0.90);
    if (tier === 'annual') priceInUSD = Math.round(priceInUSD * 0.75);

    const priceInCents = priceInUSD * 100;

    // ⏳ 3. AUTOMATED TIME-LOCKED PROMOTION CLOCK ENGINE
    // Free trials for weekly tiers vanish completely at midnight rolling out of July 10, 2026
    const currentTime = new Date();
    const promoExpirationDeadline = new Date('2026-07-11T00:00:00Z');
    const isPromoWindowCurrentlyActive = currentTime < promoExpirationDeadline;
    
    const isEligibleForFreeTrial = isPromoWindowCurrentlyActive && tier === 'weekly';

    const sessionOptions = {
      payment_method_types: ['card', 'link'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Grid Coordinate Slot (${x}, ${y}) ${isEligibleForFreeTrial ? '[7-DAY FREE TRIAL SPECIAL]' : ''}`,
              description: `Spatial Ad Grid Matrix Rental Allocation Unit [Size: ${size}px] ${isEligibleForFreeTrial ? '- Promo Trial ends automatically after July 10, 2026' : ''}`,
            },
            unit_amount: priceInCents,
            recurring: {
              interval: tier === 'weekly' ? 'week' : tier === 'monthly' ? 'month' : 'year'
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
       // 🔥 CRITICAL DATA FIX: Explicitly pass your layout variables inside the master object metadata!
      metadata: { 
          x: x.toString(),
          y: y.toString(), 
          size: size.toString(), 
          studioName: studioName, 
          link: steamUrl, 
          logoImageUrl: logoImageUrl, 
          tier: tier 
      },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
    };

    if (isEligibleForFreeTrial) {
      sessionOptions.subscription_data = {
        trial_period_days: 7
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionOptions);
    return NextResponse.json({ url: checkoutSession.url });

  } catch (error) {
    console.error('Checkout Pipeline Defect:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
