import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400, headers: corsHeaders })
    }

    // Wait 15 seconds
    console.log(Waiting 15 seconds before sending push to \...);
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Send push via Entrig API
    const entrigKey = Deno.env.get("ENTRIG_API_KEY");
    
    // According to standard Entrig REST API structure
    const response = await fetch("https://api.entrig.com/v1/notifications", {
      method: "POST",
      headers: {
        "Authorization": Bearer \,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userIds: [userId],
        title: "Delayed Demo Push! 🚀",
        body: "This notification arrived exactly 15 seconds after you pressed the button."
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, entrigResponse: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
