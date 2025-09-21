import { useState, useEffect } from 'react';
import { alertsAPI } from '@/services/api';
import { socketService } from '@/services/socket';
import { toast } from 'sonner';

export interface Alert {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  ai_severity_score: number;
  affected_population: string;
  status: 'active' | 'resolved' | 'monitoring' | 'watch';
  created_at: string;
  updated_at: string;
}

export const useAlertsEnhanced = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAll();
      setAlerts(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Partial<Alert>) => {
    try {
      const response = await alertsAPI.create(alertData);
      toast.success('Alert created successfully');
      return response.data;
    } catch (err) {
      toast.error('Failed to create alert');
      throw err;
    }
  };

  const updateAlertStatus = async (id: string, status: string) => {
    try {
      const response = await alertsAPI.updateStatus(id, status);
      toast.success('Alert status updated');
      return response.data;
    } catch (err) {
      toast.error('Failed to update alert status');
      throw err;
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up real-time listeners
    const handleNewAlert = (alert: Alert) => {
      setAlerts(prev => [alert, ...prev]);
      toast.error(`New ${alert.severity} alert: ${alert.title}`, {
        description: alert.location,
        duration: 5000,
      });
    };

    const handleAlertUpdate = (alert: Alert) => {
      setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a));
      toast.info(`Alert updated: ${alert.title}`);
    };

    socketService.on('new_emergency_alert', handleNewAlert);
    socketService.on('alert_updated', handleAlertUpdate);

    return () => {
      socketService.off('new_emergency_alert', handleNewAlert);
      socketService.off('alert_updated', handleAlertUpdate);
    };
  }, []);

  return { 
    alerts, 
    loading, 
    error, 
    refetch: fetchAlerts,
    createAlert,
    updateAlertStatus
  };
};
