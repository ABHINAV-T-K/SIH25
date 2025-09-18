import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EvacuationRoute {
  id: string;
  name: string;
  from_location: string;
  to_location: string;
  route_points?: { coordinates: [number, number][] }; // GeoJSON style
  distance_km: number;
  estimated_time_minutes: number;
  difficulty_level: string;
  current_status: string;
  ai_optimized: boolean;
  capacity: number;
  current_usage: number;
  created_at: string;
  updated_at: string;
}

export const useEvacuationRoutes = () => {
  const [routes, setRoutes] = useState<EvacuationRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("evacuation_routes")
        .select("*")
        .order("name");

      if (error) throw error;
      setRoutes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch evacuation routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();

    const channel = supabase
      .channel("evacuation_routes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "evacuation_routes" },
        () => fetchRoutes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { routes, loading, error, refetch: fetchRoutes };
};
