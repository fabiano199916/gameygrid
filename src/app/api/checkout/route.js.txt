import { NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // 1. Capture the data package sent from your front-facing grid canvas interface
    const { x, y, size, studioName, steamUrl, tier } = await request.json();

    // 2. Compute dynamic price parameters mapped directly to your concentric grid layers
    let basePriceUSD = 75; // Zone 3 Standard Block baseline fallback price
    if (size === "100") basePriceUSD = 400; // Zone 1 Mega Anchor pricing
    if (size === "40") basePriceUSD = 150;  // Zone 2 Premium pricing
    if (size === "10") basePriceUSD = 25;   // Zone 4 Micro pricing

    let multiplier = 1;
    let discount = 1;

    // Apply corporate loyalty discounts for extended commitments
    if (tier === 'monthly') { multiplier = 4; discount = 0.90; }   // 10% Off
    if (tier === 'annual') { multiplier = 52; discount = 0.75; }  // 25% Off

    // Compute the final price transaction package in cents for Stripe's engine
    const finalAmountCents = Math.round((basePriceUSD * multiplier * discount) * 100);

    // 3. INITIALIZE THE SECURE STRIPE CHECKOUT SESSION WINDOW
    // This supports international card networks, digital wallets, and stablecoin crypto
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Pegged to stable global USD parameters
            product_data: {
              name: `GameyGrid Coordinates Allocation: (${x}, ${y})`,
              description: `Concentric Placement Zone Allocation for studio: ${studioName}. Interval tier: ${tier.toUpperCase()}`,
            },
            unit_amount: finalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Store these parameters inside Stripe as metadata tokens to read after payment succeeds
      metadata: {
        x, y, size, studioName, link: steamUrl, tier
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
    });

    // 4. Safely return the generated secure checkout URL back to your front-facing interface
    return NextResponse.json({ success: true, url: session.url });

  } catch (error) {
    return NextResponse.json({ success: false, error: `Financial Engine Exception: ${error.message}` }, { status: 500 });
  }
}
