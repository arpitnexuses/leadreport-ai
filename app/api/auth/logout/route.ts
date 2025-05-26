import { NextResponse } from 'next/server';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'),
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
} as const;

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { 
      status: 200,
      headers: corsHeaders
    }
  );

  // Clear the token cookie
  response.cookies.delete({
    name: 'token',
    path: '/',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined
  });

  return response;
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
} 