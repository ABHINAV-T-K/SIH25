import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization,content-type" };

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  alerts: any[];
  forecast: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { location, type = "current" } = await req.json();
    if (!location) {
      return new Response(JSON.stringify({ error: "Location required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Fetching ${type} weather for ${location}`);

    // 🔹 Try IMD API first
    let weatherData: WeatherData;
    try {
      const stationId = await lookupStationId(location);
      const url =
        type === "forecast"
          ? `https://city.imd.gov.in/api/cityweather_loc.php?id=${stationId}`
          : `https://mausam.imd.gov.in/api/current_wx_api.php?id=${stationId}`;

      const res = await fetch(url);
      const json = await res.json();

      weatherData = {
        location,
        temperature: json.temp || 30,
        humidity: json.humidity || 70,
        windSpeed: json.wind_speed || 10,
        conditions: json.weather || "Clear",
        alerts: json.alerts || [],
        forecast: json.forecast || [],
      };
    } catch {
      console.log("IMD API unavailable → fallback to mock");
      weatherData = await getMockWeatherData(location, type);
    }

    // 🔹 Save in Supabase
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    await supabase.from("weather_cache").upsert(
      { location, type, data: weatherData, fetched_at: new Date().toISOString() },
      { onConflict: "location,type" },
    );

    return new Response(JSON.stringify(weatherData), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error in weather-api:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch weather" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getMockWeatherData(location: string, type: string): Promise<WeatherData> {
  const patterns: Record<string, any> = {
    mumbai: { temp: 32, humidity: 85, wind: 15, cond: "Heavy Rain", alerts: [{ type: "rain", severity: "high" }] },
    delhi: { temp: 44, humidity: 30, wind: 10, cond: "Heat Wave", alerts: [{ type: "heat", severity: "critical" }] },
    kolkata: { temp: 29, humidity: 88, wind: 20, cond: "Cyclone Warning", alerts: [{ type: "cyclone", severity: "critical" }] },
    shimla: { temp: 16, humidity: 60, wind: 8, cond: "Landslide Risk", alerts: [{ type: "landslide", severity: "high" }] },
  };

  const base = patterns[location.toLowerCase()] || { temp: 30, humidity: 65, wind: 12, cond: "Partly Cloudy", alerts: [] };
  const forecast = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    temperature: base.temp + (Math.random() * 6 - 3),
    humidity: base.humidity + (Math.random() * 10 - 5),
    windSpeed: base.wind + (Math.random() * 4 - 2),
    conditions: base.cond,
  }));

  return { location, temperature: base.temp, humidity: base.humidity, windSpeed: base.wind, conditions: base.cond, alerts: base.alerts, forecast };
}

async function lookupStationId(location: string): Promise<string> {
  const map: Record<string, string> = {
    delhi: "40278",
    mumbai: "43003",
    kolkata: "40110",
    chennai: "43109",
    bangalore: "43279",
  };
  return map[location.toLowerCase()] || "40278"; // default to Delhi
}
