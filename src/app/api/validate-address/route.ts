import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { message: 'Address is required' },
        { status: 400 }
      );
    }

    // Log the incoming request for debugging
    console.log('Address validation request:', address);

    // Step 1: Get the OAuth token
    const tokenUrl = 'https://apis-sandbox.fedex.com/oauth/token';
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.FEDEX_CLIENT_ID || '',
        client_secret: process.env.FEDEX_CLIENT_SECRET || '',
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      console.error('Token error:', tokenError);
      return NextResponse.json(
        { message: 'Failed to authenticate with FedEx API' },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Ensure all required fields are present
    if (!address.city || !address.stateOrProvinceCode || !address.postalCode || !address.countryCode) {
      return NextResponse.json(
        { message: 'Missing required address fields (city, state, postal code, or country)' },
        { status: 400 }
      );
    }

    // Ensure streetLines is always an array
    const streetLines = Array.isArray(address.streetLines) 
      ? address.streetLines 
      : address.streetLines 
        ? [address.streetLines] 
        : [];

    // Step 2: Use the token to make the address validation request
    const payload = {
      inEffectAsOfTimestamp: new Date().toISOString().split('T')[0],
      validateAddressControlParameters: {
        includeResolutionTokens: true
      },
      addressesToValidate: [
        {
          address: {
            streetLines: streetLines,
            city: address.city,
            stateOrProvinceCode: address.stateOrProvinceCode,
            postalCode: address.postalCode,
            countryCode: address.countryCode
          },
          clientReferenceId: "address_validation"
        }
      ]
    };

    // Log the outgoing payload for debugging
    console.log('FedEx API payload:', JSON.stringify(payload));

    const apiUrl = 'https://apis-sandbox.fedex.com/address/v1/addresses/resolve';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-locale': 'en_UK'
      },
      body: JSON.stringify(payload)
    });

    // Handle API response
    const responseBody = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseBody);
    } catch (e) {
      console.error('Error parsing FedEx API response:', responseBody);
      return NextResponse.json(
        { message: 'Invalid response from FedEx API' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('FedEx API error:', data);
      return NextResponse.json(
        { message: data.message || 'FedEx API request failed' },
        { status: response.status }
      );
    }

    // Log the response for debugging
    console.log('FedEx API response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in address validation:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}