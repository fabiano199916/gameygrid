import { NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { x, y, size, studioName, steamUrl, logoImageUrl, tier } = body;

    // 🌐 FIXED POSITION: Capturing your live website address cleanly before building the Stripe metrics
    const origin = request.headers.get('origin') || 'https://gameygrid.com';

    // Calculate baseline pricing tiers dynamically for Stripe ledger clearance
    let priceInUSD = 25;
    if (parseInt(size) === 100) priceInUSD = 400;
    if (parseInt(size) === 40) priceInUSD = 150;
    if (parseInt(size) === 20) priceInUSD = 75;

    // Apply corporate subscription tier discount models
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
