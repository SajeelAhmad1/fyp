import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { paymentMethodId } = await req.json();

  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return NextResponse.json(paymentMethod);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch payment method' },
      { status: 500 }
    );
  }
}