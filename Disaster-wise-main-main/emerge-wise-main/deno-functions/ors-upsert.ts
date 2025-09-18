// deno-functions/ors-upsert.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ORS_API_KEY = Deno.env.get("ORS_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json();
    // expected body: { from: {lat, lng, name}, to: {lat, lng, name}, name?: string }
    const { from, to, name } = body;
    if (!from || !to) {
      return new Response(JSON.stringify({ error: "Provide 'from' and 'to' with lat/lng" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    if (!ORS_API_KEY) {
      return new Response(JSON.stringify({ error: "ORS_API_KEY not configured on server" }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    // Build POST body for OpenRouteService GeoJSON directions
    const orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
    const orsResp = await fetch(orsUrl, {
      method: "POST",
      headers: {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        coordinates: [
          [from.lng, from.lat],
          [to.lng, to.lat]
        ],
        // optional: you can pass extra options
      })
    });

    if (!orsResp.ok) {
      const text = await orsResp.text();
      console.error("ORS error:", orsResp.status, text);
      return new Response(JSON.stringify({ error: "Failed to fetch route from ORS", details: text }), { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    const orsJson = await orsResp.json();
    const feature = Array.isArray(orsJson.features) && orsJson.features[0];
    if (!feature) {
      return new Response(JSON.stringify({ error: "No route returned by ORS" }), { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    // GeoJSON geometry (LineString)
    const geometry = feature.geometry; // { type: "LineString", coordinates: [[lng, lat], ...] }
    const props = feature.properties || {};
    const summary = props.summary || (props.segments && props.segments[0] && props.segments[0].summary) || {};
    const distanceMeters = summary.distance ?? (props.summary?.distance ?? null);
    const durationSeconds = summary.duration ?? (props.summary?.duration ?? null);

    const distance_km = distanceMeters ? Number(distanceMeters) / 1000 : null;
    const estimated_time_minutes = durationSeconds ? Math.round(Number(durationSeconds) / 60) : null;

    const routeName = name || `${from.name ?? "Start"} → ${to.name ?? "End"}`;

    // Upsert into Supabase. Using unique index on from_location,to_location
    const upsertBody: any = {
      name: routeName,
      from_location: from.name ?? `${from.lat},${from.lng}`,
      to_location: to.name ?? `${to.lat},${to.lng}`,
      route_points: geometry,
      distance_km,
      estimated_time_minutes,
      current_status: "open",
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
      .from("evacuation_routes")
      .upsert(upsertBody, { onConflict: "from_location,to_location" });

    if (upsertError) {
      console.error("Supabase upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to save route to Supabase", details: upsertError }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, geometry, distance_km, estimated_time_minutes }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Server error", details: String(err) }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
