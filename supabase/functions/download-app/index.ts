import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appId } = await req.json();
    
    if (!appId) {
      return new Response(
        JSON.stringify({ error: 'App ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get app details
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id, current_version, title')
      .eq('id', appId)
      .single();

    if (appError || !app) {
      console.error('Error fetching app:', appError);
      return new Response(
        JSON.stringify({ error: 'App not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client info for logging
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Log the download
    const { error: logError } = await supabase
      .from('download_logs')
      .insert({
        app_id: appId,
        version: app.current_version,
        ip_address: ip,
        user_agent: userAgent,
      });

    if (logError) {
      console.error('Error logging download:', logError);
    }

    // Increment download count
    const { error: incrementError } = await supabase.rpc('increment_download_count', {
      app_id_param: appId,
    });

    if (incrementError) {
      console.error('Error incrementing download count:', incrementError);
    }

    // Get the latest version file URL
    const { data: version, error: versionError } = await supabase
      .from('app_versions')
      .select('file_url')
      .eq('app_id', appId)
      .eq('version', app.current_version)
      .single();

    if (versionError || !version) {
      console.error('Error fetching version:', versionError);
      return new Response(
        JSON.stringify({ error: 'App version not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        downloadUrl: version.file_url,
        appName: app.title,
        version: app.current_version
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in download-app function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
