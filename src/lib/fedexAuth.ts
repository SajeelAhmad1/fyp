import crypto from 'crypto';

export async function getFedExAuthToken() {
  const authUrl = process.env.NODE_ENV === 'production' 
    ? 'https://apis.fedex.com/oauth/token'
    : 'https://apis-sandbox.fedex.com/oauth/token';
  
  const clientId = process.env.FEDEX_CLIENT_ID;
  const clientSecret = process.env.FEDEX_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('FedEx API credentials are not configured');
  }
  
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`FedEx Auth error: ${response.status} - ${JSON.stringify(errorData)}`);
  }
  
  const tokenData = await response.json();
  return tokenData.access_token;
}

export function generateTransactionId() {
  return crypto.randomUUID();
}