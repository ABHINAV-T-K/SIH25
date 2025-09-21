import cron from 'node-cron';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { getSocketInstance } from '../socket/handlers';

export const startCronJobs = () => {
  // Check for stale alerts every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: staleAlerts, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('status', 'active')
        .lt('created_at', oneHourAgo);

      if (error) throw error;

      if (staleAlerts && staleAlerts.length > 0) {
        // Update stale alerts to monitoring status
        await supabase
          .from('emergency_alerts')
          .update({ status: 'monitoring' })
          .in('id', staleAlerts.map(alert => alert.id));

        logger.info(`Updated ${staleAlerts.length} stale alerts to monitoring status`);
        
        // Notify connected clients
        const io = getSocketInstance();
        if (io) {
          io.emit('alerts_status_updated', {
            updated_count: staleAlerts.length,
            new_status: 'monitoring'
          });
        }
      }
    } catch (error) {
      logger.error('Error checking stale alerts:', error);
    }
  });

  // Generate daily statistics report every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
      const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

      // Fetch daily statistics
      const [alertsResult, incidentsResult, resourcesResult] = await Promise.all([
        supabase
          .from('emergency_alerts')
          .select('*')
          .gte('created_at', yesterdayStart)
          .lte('created_at', yesterdayEnd),
        supabase
          .from('incident_reports')
          .select('*')
          .gte('created_at', yesterdayStart)
          .lte('created_at', yesterdayEnd),
        supabase
          .from('emergency_resources')
          .select('*')
          .eq('available', true)
      ]);

      const dailyStats = {
        date: yesterday.toISOString().split('T')[0],
        alerts_created: alertsResult.data?.length || 0,
        incidents_reported: incidentsResult.data?.length || 0,
        available_resources: resourcesResult.data?.length || 0,
        critical_alerts: alertsResult.data?.filter(a => a.severity === 'critical').length || 0,
        verified_incidents: incidentsResult.data?.filter(i => i.verified).length || 0
      };

      logger.info('Daily statistics generated:', dailyStats);
      
      // Emit to admin dashboard
      const io = getSocketInstance();
      if (io) {
        io.to('role_admin').emit('daily_statistics', dailyStats);
      }
    } catch (error) {
      logger.error('Error generating daily statistics:', error);
    }
  });

  // Check resource capacity every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const { data: resources, error } = await supabase
        .from('emergency_resources')
        .select('*')
        .not('capacity', 'is', null)
        .eq('available', true);

      if (error) throw error;

      const overcrowdedResources = resources?.filter(resource => {
        const utilization = (resource.current_occupancy || 0) / (resource.capacity || 1);
        return utilization > 0.9; // More than 90% capacity
      }) || [];

      if (overcrowdedResources.length > 0) {
        logger.warn(`Found ${overcrowdedResources.length} overcrowded resources`);
        
        // Emit capacity warning
        const io = getSocketInstance();
        if (io) {
          io.emit('capacity_warning', {
            overcrowded_resources: overcrowdedResources.map(r => ({
              id: r.id,
              name: r.name,
              type: r.type,
              utilization: Math.round(((r.current_occupancy || 0) / (r.capacity || 1)) * 100)
            }))
          });
        }
      }
    } catch (error) {
      logger.error('Error checking resource capacity:', error);
    }
  });

  // Update evacuation route traffic every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const { data: routes, error } = await supabase
        .from('evacuation_routes')
        .select('*')
        .eq('current_status', 'open');

      if (error) throw error;

      // Simulate traffic updates (in production, integrate with real traffic APIs)
      const updatedRoutes = routes?.map(route => {
        const trafficFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
        const updatedTime = Math.round((route.estimated_time_minutes || 30) * trafficFactor);
        
        return {
          id: route.id,
          estimated_time_minutes: updatedTime,
          traffic_status: trafficFactor > 1.1 ? 'heavy' : trafficFactor > 0.9 ? 'moderate' : 'light'
        };
      }) || [];

      // Emit traffic updates
      const io = getSocketInstance();
      if (io) {
        io.emit('traffic_updates', {
          routes: updatedRoutes,
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Updated traffic information for ${updatedRoutes.length} routes`);
    } catch (error) {
      logger.error('Error updating route traffic:', error);
    }
  });

  // Clean up old logs every week
  cron.schedule('0 2 * * 0', async () => {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Clean up resolved alerts older than a week
      const { error: alertsError } = await supabase
        .from('emergency_alerts')
        .delete()
        .eq('status', 'resolved')
        .lt('updated_at', oneWeekAgo);

      if (alertsError) throw alertsError;

      logger.info('Weekly cleanup completed - removed old resolved alerts');
    } catch (error) {
      logger.error('Error during weekly cleanup:', error);
    }
  });

  // Health check ping every hour
  cron.schedule('0 * * * *', () => {
    logger.info('System health check - all services running');
    
    // Emit system status
    const io = getSocketInstance();
    if (io) {
      io.emit('system_status', {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    }
  });

  logger.info('Cron jobs started successfully');
};
