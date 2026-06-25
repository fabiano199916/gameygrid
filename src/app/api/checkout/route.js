import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; // Access your live data tables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { x, y, size, studioName, steamUrl, logoImageUrl, tier } = body;

    const origin = request.headers.get('origin') || 'https://gameygrid.com';

    // 1. Convert incoming boundary markers to strict integers for spatial checks
    const newX1 = parseInt(x);
    const newY1 = parseInt(y);
    const newSize = parseInt(size);
    const newX2 = newX1 + newSize;
    const newY2 = newY1 + newSize;

    // 2. FETCH ALL ACTIVE OCCUPIED TILES DIRECTLY FROM SUPABASE
    const { data: activeSlots, error: dbError } = await supabase
      .from('gaming_grid_slots')
      .select('x_coordinate, y_coordinate, block_size_px')
      .eq('availability_status', 'active');

    if (dbError) throw dbError;

    // 3. 🛡️ MATHEMATICAL COLLISION DETECTION ALGORITHM (Prevents spatial overlapping)
    if (activeSlots) {
      for (const slot of activeSlots) {
        const existX1 = slot.x_coordinate;
        const existY1 = slot.y_coordinate;
        const existSize = slot.block_size_px;
        const existX2 = existX1 + existSize;
        const existY2 = existY1 + existSize;

        // Check if the new boundary box intersects with an existing active boundary box
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

    // Calculate baseline pricing tiers dynamically for Stripe ledger clearance
    let priceInUSD = 25;
    if (newSize === 100) priceInUSD = 400;
    if (newSize === 40) priceInUSD = 150;
    if (newSize === 20) priceInUSD = 75;

    // Apply subscription models discount percentages
    if (tier === 'monthly') priceInUSD = Math.round(priceInUSD * 0.90);
    if (tier === 'annual') priceInUSD = Math.round(priceInUSD * 0.75);

    const priceInCents = priceInUSD * 100;

    // Build the secure payment checkout session structure
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Grid Coordinate Slot (${x}, ${y})`,
              description: `Spatial Ad Grid Matrix Rental Allocation Unit [Size: ${size}px]`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: { x, y, size, studioName, link: steamUrl, logoImageUrl, tier },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout Pipeline Defect:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
