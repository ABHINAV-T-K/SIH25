import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IncidentReport {
  id: string;
  type: 'flood' | 'fire' | 'earthquake' | 'weather' | 'accident' | 'hazmat' | 'medical' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  contact_info?: string;
  is_anonymous: boolean;
  images?: string[];
  ai_severity_score?: number;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  status: 'active' | 'resolved' | 'monitoring' | 'watch';
  created_at: string;
  updated_at: string;
}

export const useIncidentReports = () => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incident reports');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: Omit<IncidentReport, 'id' | 'created_at' | 'updated_at' | 'verified' | 'ai_severity_score' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('incident_reports')
        .insert([{
          ...reportData,
          ai_severity_score: Math.random() * 10, // Mock AI severity score for now
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchReports(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to create report' 
      };
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('incident_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incident_reports'
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { reports, loading, error, createReport, refetch: fetchReports };
};