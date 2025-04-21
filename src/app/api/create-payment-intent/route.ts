// import { NextRequest, NextResponse } from "next/server";
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// export async function POST(request: NextRequest) {
//   try {
//     const { amount, email, name } = await request.json();

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: "gbp",
//       automatic_payment_methods: { enabled: true },
//     });

//     console.log("checkout", paymentIntent)

//     return NextResponse.json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error("Internal Error:", error);
//     // Handle other errors (e.g., network issues, parsing errors)
//     return NextResponse.json(
//       { error: `Internal Server Error: ${error}` },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { amount, email, name } = await request.json();

    // First create or retrieve a customer
    let customer;
    
    // Search for existing customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length > 0) {
      // Use existing customer
      customer = customers.data[0];
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: email,
        name: name || undefined, // Only include if name is provided
        metadata: {
          created_from: "checkout_page" // Optional tracking info
        }
      });
    }

    // Create payment intent associated with the customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "gbp",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        customer_id: customer.id // Store customer ID in metadata for reference
      }
    });

    console.log("checkout", paymentIntent);

    // Return both the client secret and customer ID
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id
    });
  } catch (error) {
    console.error("Internal Error:", error);
    // Handle other errors (e.g., network issues, parsing errors)
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}