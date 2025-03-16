// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const APP_URL = Deno.env.get('APP_URL');

async function sendEmail(to: string, inviterEmail: string, invitationToken: string) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!APP_URL) {
    throw new Error('APP_URL is not configured');
  }

  console.log('Sending email to:', to);
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Financial App <onboarding@resend.dev>',
      to: to,
      subject: 'Invitation to collaborate',
      html: `
        <h2>You've been invited to collaborate!</h2>
        <p>${inviterEmail} has invited you to collaborate on their financial dashboard.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${APP_URL}/invite?token=${invitationToken}">Accept Invitation</a>
        <p>This invitation link will expire in 7 days.</p>
      `,
    }),
  });

  const data = await res.json();
  console.log('Resend API response:', data);
  
  if (!res.ok) {
    throw new Error(data.message || 'Failed to send email');
  }

  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const { to, inviterEmail, invitationToken } = await req.json();
    console.log('Received request:', { to, inviterEmail, invitationToken });
    
    if (!to || !inviterEmail || !invitationToken) {
      throw new Error('Missing required fields');
    }

    const emailResult = await sendEmail(to, inviterEmail, invitationToken);
    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ success: true, data: emailResult }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      },
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-invite-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
