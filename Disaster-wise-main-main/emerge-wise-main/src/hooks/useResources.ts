import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'fire_station' | 'police_station' | 'emergency_contact';
  address: string;
  phone: string;
  email?: string;
  capacity?: number;
  current_occupancy: number;
  available: boolean;
  coordinates?: any;
  additional_info?: any;
  created_at: string;
  updated_at: string;
}

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_resources')
        .select('*')
        .order('name');

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('emergency_resources_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_resources'
        },
        () => {
          fetchResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { resources, loading, error, refetch: fetchResources };
};