import { useState, useEffect } from 'react';
import { socketService } from '@/services/socket';
import { resourcesAPI, evacuationAPI } from '@/services/api';
import { toast } from 'sonner';

interface DashboardStats {
  active_alerts: number;
  available_resources: number;
  open_routes: number;
  verified_incidents: number;
  timestamp: string;
}

interface SystemStatus {
  status: string;
  timestamp: string;
  uptime: number;
}

export const useRealTimeDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [capacityData, setCapacityData] = useState<any>(null);
  const [routeCapacity, setRouteCapacity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCapacityData = async () => {
    try {
      const [resourceCapacity, routeCapacityData] = await Promise.all([
        resourcesAPI.getCapacityStatus(),
        evacuationAPI.getCapacityStatus()
      ]);
      
      setCapacityData(resourceCapacity.data);
      setRouteCapacity(routeCapacityData.data);
    } catch (error) {
      console.error('Failed to fetch capacity data:', error);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchCapacityData();
    socketService.requestDashboardData();

    // Set up real-time listeners
    const handleDashboardData = (data: DashboardStats) => {
      setStats(data);
      setLoading(false);
    };

    const handlePeriodicUpdate = (data: any) => {
      if (data.active_alerts) {
        setStats(prev => prev ? { ...prev, ...data } : data);
      }
    };

    const handleSystemStatus = (status: SystemStatus) => {
      setSystemStatus(status);
    };

    const handleCapacityWarning = (data: any) => {
      toast.warning('Resource Capacity Warning', {
        description: `${data.overcrowded_resources.length} resources are at high capacity`,
        duration: 10000,
      });
    };

    const handleResourceUpdate = () => {
      fetchCapacityData();
    };

    const handleRouteUpdate = () => {
      fetchCapacityData();
    };

    const handleTrafficUpdates = (data: any) => {
      toast.info('Traffic conditions updated', {
        description: `Updated ${data.routes.length} evacuation routes`,
        duration: 3000,
      });
    };

    // Socket listeners
    socketService.on('dashboard_data', handleDashboardData);
    socketService.on('periodic_update', handlePeriodicUpdate);
    socketService.on('system_status', handleSystemStatus);
    socketService.on('capacity_warning', handleCapacityWarning);
    socketService.on('resource_updated', handleResourceUpdate);
    socketService.on('route_status_updated', handleRouteUpdate);
    socketService.on('traffic_updates', handleTrafficUpdates);

    // Request periodic updates
    const interval = setInterval(() => {
      socketService.requestDashboardData();
      fetchCapacityData();
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      socketService.off('dashboard_data', handleDashboardData);
      socketService.off('periodic_update', handlePeriodicUpdate);
      socketService.off('system_status', handleSystemStatus);
      socketService.off('capacity_warning', handleCapacityWarning);
      socketService.off('resource_updated', handleResourceUpdate);
      socketService.off('route_status_updated', handleRouteUpdate);
      socketService.off('traffic_updates', handleTrafficUpdates);
    };
  }, []);

  const refreshData = () => {
    setLoading(true);
    socketService.requestDashboardData();
    fetchCapacityData();
  };

  return {
    stats,
    systemStatus,
    capacityData,
    routeCapacity,
    loading,
    refreshData
  };
};
