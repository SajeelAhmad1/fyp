// app/api/shipping-cost/route.ts
import { NextResponse } from 'next/server';
import { 
  formatFreightRateRequest 
} from '@/lib/fedex';

import { getFedExAuthToken, generateTransactionId } from '@/lib/fedexAuth';

async function callFedExRateAPI(requestData, authToken, transactionId) {
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://apis.fedex.com/rate/v1/freight/rates/quotes'
    : 'https://apis-sandbox.fedex.com/rate/v1/freight/rates/quotes';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'X-Customer-Transaction-Id': transactionId,
      'X-locale': 'en_GB'
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.error('FedEx API error details:', errorData);
    } catch (e) {
      console.error('Failed to parse error response:', e);
    }
    
    throw new Error(`FedEx API error: ${response.status} - ${JSON.stringify(errorData || 'No details')}`);
  }
  
  return response.json();
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    
    // Validate country codes explicitly
    if (!requestData.originAddress?.countryCode) {
      console.error('Missing origin country code in request');
      return NextResponse.json(
        { error: 'Origin country code is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.destinationAddress?.countryCode) {
      console.error('Missing destination country code in request');
      return NextResponse.json(
        { error: 'Destination country code is required' },
        { status: 400 }
      );
    }
    
    const fedexToken = await getFedExAuthToken();
    const transactionId = generateTransactionId();
    
    const formattedRequest = formatFreightRateRequest(requestData);

    const fedexResponse = await callFedExRateAPI(formattedRequest, fedexToken, transactionId);
    return NextResponse.json(fedexResponse);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate shipping rates' },
      { status: 500 }
    );
  }
}