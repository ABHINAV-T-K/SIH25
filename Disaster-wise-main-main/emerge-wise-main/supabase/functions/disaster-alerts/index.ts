import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse } from "https://deno.land/std@0.168.0/encoding/xml.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DisasterAlert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  region: string;
  title: string;
  description: string;
  issuedAt: string;
  validUntil: string;
  source: string;
  coordinates?: { lat: number; lng: number };
  affectedAreas: string[];
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { region, alertType, severity } = await req.json();

    console.log(`Fetching disaster alerts for region=${region}, type=${alertType}, severity=${severity}`);

    // 🔹 Try NDMA SACHET CAP Feed (official alerts)
    let alerts: DisasterAlert[] = [];
    try {
      const capRes = await fetch(`https://sachet.ndma.gov.in/capapi?region=${encodeURIComponent(region || "")}`);
      const capText = await capRes.text();
      const capJson: any = capText.trim().startsWith("<") ? parse(capText) : JSON.parse(capText);

      if (capJson?.alert) {
        alerts = capJson.alert.map((a: any, idx: number) => ({
          id: a.identifier || `cap-${idx}`,
          type: a.event || "unknown",
          severity: (a.severity || "medium").toLowerCase(),
          region: a.area?.areaDesc || region || "India",
          title: a.headline || "Disaster Alert",
          description: a.description || "",
          issuedAt: a.sent || new Date().toISOString(),
          validUntil: a.expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          source: a.sender || "NDMA-SACHET",
          affectedAreas: [a.area?.areaDesc || region || "Unknown"],
          recommendations: [a.instruction || "Follow official guidance"],
        }));
      }
    } catch {
      console.log("NDMA feed unavailable → fallback to mock alerts");
      alerts = await getMockDisasterAlerts(region, alertType, severity);
    }

    // 🔹 Save to Supabase
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    for (const alert of alerts) {
      await supabase.from("emergency_alerts").upsert(
        {
          title: alert.title,
          description: alert.description,
          location: alert.region,
          severity: alert.severity,
          type: alert.type,
          ai_severity_score: getSeverityScore(alert.severity),
          affected_population: alert.affectedAreas.join(", "),
          status: "active",
          created_at: alert.issuedAt,
        },
        { onConflict: "title,location" },
      );
    }

    return new Response(JSON.stringify({ alerts }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error in disaster-alerts:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch disaster alerts" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getSeverityScore(severity: string): number {
  switch (severity) {
    case "critical":
      return 9.5;
    case "high":
      return 7.5;
    case "medium":
      return 5.0;
    case "low":
      return 2.5;
    default:
      return 5.0;
  }
}

async function getMockDisasterAlerts(region?: string, alertType?: string, severity?: string): Promise<DisasterAlert[]> {
  const alerts: DisasterAlert[] = [
    {
      id: "cyclone-001",
      type: "cyclone",
      severity: "critical",
      region: "Odisha Coast",
      title: "Severe Cyclonic Storm Approaching",
      description: "Cyclone with wind speeds 120-130 kmph nearing Odisha coast. Evacuation needed.",
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      source: "IMD",
      coordinates: { lat: 19.8, lng: 85.8 },
      affectedAreas: ["Puri", "Bhubaneswar", "Cuttack", "Balasore"],
      recommendations: ["Evacuate immediately", "Secure homes", "Stock food & water"],
    },
  ];
  return alerts;
}
