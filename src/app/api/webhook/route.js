import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; // Access your Singapore database vault
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    // 1. SECURITY BLOCKER: Verify that this data payload actually came from Stripe
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // Hidden verification token in .env.local
    );
  } catch (err) {
    console.error(`⚠️ Webhook Validation Defect: ${err.message}`);
    return NextResponse.json({ error: `Security Validation Failed: ${err.message}` }, { status: 400 });
  }

  // 2. PARSE SUCCESSFUL SANDBOX CREDIT CARD PROTOCOLS
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Extract the pixel coordinates and metadata tokens we attached to the Stripe session earlier
    const { x, y, size, studioName, link, tier } = session.metadata;

    // Calculate a legally compliant expiration calendar profile based on their chosen subscription tier
    let daysToAdd = 7; // Weekly baseline fallback format
    if (tier === 'monthly') daysToAdd = 30;
    if (tier === 'annual') daysToAdd = 365;
    
    const expirationTimestamp = new Date();
    expirationTimestamp.setDate(expirationTimestamp.getDate() + daysToAdd);

    try {
      // 3. SECURELY INGEST THE GEOMETRIC AD PACKET DATA DIRECTLY INTO SUPABASE
      const { error } = await supabase
        .from('gaming_grid_slots')
        .insert([{
          x_coordinate: parseInt(x),
          y_coordinate: parseInt(y),
          block_size_px: parseInt(size),
          studio_name: studioName,
          destination_link: link,
          image_storage_url: 'https://unsplash.com', // Default secure placeholder avatar asset
          game_trailer_url: 'https://youtube.com',
          availability_status: 'pending_review', // Safely quarantined until you approve it from your app!
          subscription_tier: tier,
          expiration_date: expirationTimestamp.toISOString()
        }]);

      if (error) throw error;
      console.log(`🚀 Automation Pipeline Success: Coordinates (${x}, ${y}) safely cached in queue for ${studioName}`);

    } catch (dbError) {
      console.error('⚠️ Database Ingestion Crash:', dbError.message);
      return NextResponse.json({ error: 'Data Ingestion Exception' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
