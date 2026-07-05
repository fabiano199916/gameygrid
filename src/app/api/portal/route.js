// JavaScript source code
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();
    const origin = request.headers.get('origin') || 'https://gameygrid.com';

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is strictly required.' }, { status: 400 });
    }

    // 1. Query your live Supabase database slots row to locate the customer record string
    const { data: slotRecord, error: dbError } = await supabase
      .from('gaming_grid_slots')
      .select('stripe_customer_id') 
      .eq('customer_email', email.trim().toLowerCase())
      .limit(1);

    // 2. Fallback check: If the user didn't register a customer ID yet, locate them straight inside Stripe
    let targetCustomerId = slotRecord && slotRecord[0]?.stripe_customer_id;

    if (!targetCustomerId) {
      const stripeCustomers = await stripe.customers.list({
        email: email.trim().toLowerCase(),
        limit: 1,
      });
      if (stripeCustomers.data.length > 0) {
        targetCustomerId = stripeCustomers.data[0].id;
      }
    }

    if (!targetCustomerId) {
      return NextResponse.json({ 
        error: 'No active advertising profile or matching billing account found for this email address.' 
      }, { status: 404 });
    }

    // 3. Ask Stripe to generate a unique single-use login portal url link for this specific creator
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: targetCustomerId,
      return_url: origin,
    });

    // Send the custom link straight back to their browser tab window
    return NextResponse.json({ url: portalSession.url });

  } catch (error) {
    console.error('Billing Portal Pipeline Defect:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
