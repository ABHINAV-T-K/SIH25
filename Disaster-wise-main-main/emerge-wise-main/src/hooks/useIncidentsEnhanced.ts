import { useState, useEffect } from 'react';
import { incidentsAPI, aiAPI } from '@/services/api';
import { socketService } from '@/services/socket';
import { toast } from 'sonner';

export interface Incident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  contact_info?: string;
  is_anonymous: boolean;
  ai_severity_score?: number;
  verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useIncidentsEnhanced = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await incidentsAPI.getAll();
      setIncidents(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const reportIncident = async (incidentData: Partial<Incident>) => {
    try {
      // First, get AI severity assessment
      const severityResponse = await aiAPI.calculateSeverity({
        type: incidentData.type,
        description: incidentData.description,
        location: incidentData.location
      });

      const enhancedData = {
        ...incidentData,
        ai_severity_score: severityResponse.data.ai_severity_score
      };

      const response = await incidentsAPI.create(enhancedData);
      
      // Emit real-time update
      socketService.reportIncident(response.data);
      
      toast.success('Incident reported successfully');
      return response.data;
    } catch (err) {
      toast.error('Failed to report incident');
      throw err;
    }
  };

  const verifyIncident = async (id: string, verified: boolean, verified_by: string) => {
    try {
      const response = await incidentsAPI.verify(id, verified, verified_by);
      toast.success(`Incident ${verified ? 'verified' : 'rejected'}`);
      return response.data;
    } catch (err) {
      toast.error('Failed to verify incident');
      throw err;
    }
  };

  const getResourcePrediction = async (incident: Incident) => {
    try {
      const response = await aiAPI.predictResources({
        type: incident.type,
        description: incident.description,
        location: incident.location,
        severity: getSeverityNumber(incident.severity)
      });
      return response.data;
    } catch (err) {
      console.error('Failed to get resource prediction:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchIncidents();

    // Set up real-time listeners
    const handleHighSeverityIncident = (incident: Incident) => {
      setIncidents(prev => [incident, ...prev]);
      toast.error(`High severity ${incident.type} reported in ${incident.location}`, {
        duration: 8000,
      });
    };

    const handleNearbyIncident = (incident: any) => {
      toast.warning(`New ${incident.type} reported nearby: ${incident.location}`, {
        duration: 5000,
      });
    };

    socketService.on('high_severity_incident', handleHighSeverityIncident);
    socketService.on('new_incident_nearby', handleNearbyIncident);

    return () => {
      socketService.off('high_severity_incident', handleHighSeverityIncident);
      socketService.off('new_incident_nearby', handleNearbyIncident);
    };
  }, []);

  const getSeverityNumber = (severity: string): number => {
    const levels: { [key: string]: number } = {
      'low': 3,
      'medium': 5,
      'high': 7,
      'critical': 9
    };
    return levels[severity] || 5;
  };

  return { 
    incidents, 
    loading, 
    error, 
    refetch: fetchIncidents,
    reportIncident,
    verifyIncident,
    getResourcePrediction
  };
};
