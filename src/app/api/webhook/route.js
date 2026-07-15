import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; 
import { Resend } from 'resend'; 
import Stripe from 'stripe'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY); 

// 🛡️ INITIALISE SECURE ADMIN CLIENT BYPASSING RLS
const secureAdminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export async function POST(request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`⚠️ Webhook Validation Defect: ${err.message}`);
    return NextResponse.json({ error: `Security Validation Failed: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // 🔍 FIXED: Extracted 'steamUrl' directly from your actual Stripe payload metadata layout!
    const { x, y, size, studioName, steamUrl, logoImageUrl, tier } = session.metadata;

    let daysToAdd = 7;
    if (tier === 'monthly') daysToAdd = 30;
    if (tier === 'annual') daysToAdd = 365;
    
    const expirationTimestamp = new Date();
    expirationTimestamp.setDate(expirationTimestamp.getDate() + daysToAdd);

    try {
      // 1. SAVE TO DATABASE WITH CORRECT MAPPING KEY DATA VALUES
      const { error } = await secureAdminSupabase 
        .from('gaming_grid_slots')
        .insert([{
          x_coordinate: parseInt(x),
          y_coordinate: parseInt(y),
          block_size_px: parseInt(size),
          studio_name: studioName,
          destination_link: steamUrl, // 🚀 FIXED: Now safely maps your live metadata parameter field!
          image_storage_url: logoImageUrl,
          availability_status: 'pending_review', 
          subscription_tier: tier,
          expiration_date: expirationTimestamp.toISOString()
        }]);

      if (error) throw error;

      // 2. 📬 GENERATE AND TRANSMIT THE ENCRYPTED MODERATOR REVIEW EMAIL
      const cleanStudioQuery = encodeURIComponent(studioName);
      const iponzSearchLink = `https://iponz.govt.nz{cleanStudioQuery}`; 

      await resend.emails.send({
        from: 'GameyGrid Security <security@gameygrid.com>',
        to: process.env.MODERATOR_NOTIFICATION_EMAIL,
        subject: `🚨 [QUARANTINE REVIEW] New Grid Placement: ${studioName}`,
        html: `
          <div style="font-family: monospace; background-color: #020617; color: #f1f5f9; padding: 24px; border-radius: 16px; border: 1px solid #1e293b; max-w: 600px;">
            <h2 style="color: #f97316; text-transform: uppercase; margin-bottom: 4px;">Security Audit Required</h2>
            <p style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 0;">GameyGrid Compliance Pipeline</p>
            
            <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; border: 1px solid #334155; margin: 20px 0;">
              <p><strong>Studio Name:</strong> ${studioName}</p>
              <p><strong>Coordinates:</strong> (${x}, ${y}) - [Size: ${size}px]</p>
              <p><strong>Subscription Package:</strong> ${tier.toUpperCase()}</p>
              <p><strong>Target Destination:</strong> <a href="${steamUrl}" target="_blank" style="color: #38bdf8;">${steamUrl}</a></p>
            </div>

            <h4 style="color: #f97316; text-transform: uppercase;">Submitted Artwork Drawing:</h4>
            <div style="background-color: #020617; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; text-align: center; margin-bottom: 24px;">
              <img src="${logoImageUrl}" alt="User Drawing" style="max-width: 150px; border-radius: 4px; border: 1px solid #334155;" />
              <p style="font-size: 10px; color: #64748b; margin-top: 8px; word-break: break-all;">${logoImageUrl}</p>
            </div>

            <h4 style="color: #f97316; text-transform: uppercase;">Intellectual Property Actions:</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td>
                  <a href="${iponzSearchLink}" target="_blank" style="display: block; text-align: center; background-color: #1e293b; color: #f1f5f9; text-decoration: none; font-weight: bold; padding: 10px; border-radius: 6px; border: 1px solid #475569; font-size: 12px; margin-right: 5px;">
                    🔎 Verify NZ Trademark (IPONZ)
                  </a>
                </td>
                <td>
                  <a href="https://supabase.com" target="_blank" style="display: block; text-align: center; background-color: #10b981; color: #020617; text-decoration: none; font-weight: bold; padding: 10px; border-radius: 6px; font-size: 12px; margin-left: 5px;">
                    🟢 Approve & Unlock Slot
                  </a>
                </td>
              </tr>
            </table>
          </div>
        `
      });

      console.log(`📬 Security Notification dispatched to moderator for ${studioName}`);

    } catch (dbError) {
      console.error('⚠️ Database Ingestion Crash:', dbError.message);
      return NextResponse.json({ error: 'Data Ingestion Exception' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
