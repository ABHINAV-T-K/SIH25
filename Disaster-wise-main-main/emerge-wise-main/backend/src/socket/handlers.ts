import { Server } from 'socket.io';
import { logger } from '../utils/logger';
import { supabase } from '../config/supabase';

let ioInstance: Server | null = null;

export const getSocketInstance = () => ioInstance;

export const initializeSocketHandlers = (io: Server) => {
  ioInstance = io;
  io.on('connection', (socket) => {
    logger.info('Client connected:', socket.id);

    // Join location-based rooms
    socket.on('join_location', (location: string) => {
      socket.join(`location_${location}`);
      logger.info(`Client ${socket.id} joined location room: ${location}`);
    });

    // Join role-based rooms
    socket.on('join_role', (role: string) => {
      socket.join(`role_${role}`);
      logger.info(`Client ${socket.id} joined role room: ${role}`);
    });

    // Handle incident reporting
    socket.on('report_incident', async (data) => {
      try {
        const { type, location, severity, description } = data;
        
        // Broadcast to location-specific room
        socket.to(`location_${location}`).emit('new_incident_nearby', {
          type,
          location,
          severity,
          timestamp: new Date().toISOString()
        });

        // Notify admins and operators
        socket.to('role_admin').emit('new_incident_report', data);
        socket.to('role_operator').emit('new_incident_report', data);

        logger.info('Incident reported via socket:', { type, location, severity });
      } catch (error) {
        logger.error('Error handling incident report:', error);
        socket.emit('error', { message: 'Failed to process incident report' });
      }
    });

    // Handle resource status updates
    socket.on('update_resource_status', async (data) => {
      try {
        const { resource_id, status, occupancy } = data;
        
        // Update database
        await supabase
          .from('emergency_resources')
          .update({ 
            available: status === 'available',
            current_occupancy: occupancy 
          })
          .eq('id', resource_id);

        // Broadcast update
        io.emit('resource_status_updated', {
          resource_id,
          status,
          occupancy,
          timestamp: new Date().toISOString()
        });

        logger.info('Resource status updated via socket:', { resource_id, status });
      } catch (error) {
        logger.error('Error updating resource status:', error);
        socket.emit('error', { message: 'Failed to update resource status' });
      }
    });

    // Handle evacuation route updates
    socket.on('update_route_status', async (data) => {
      try {
        const { route_id, status, current_usage } = data;
        
        // Update database
        await supabase
          .from('evacuation_routes')
          .update({ 
            current_status: status,
            current_usage 
          })
          .eq('id', route_id);

        // Broadcast update
        io.emit('route_status_updated', {
          route_id,
          status,
          current_usage,
          timestamp: new Date().toISOString()
        });

        logger.info('Route status updated via socket:', { route_id, status });
      } catch (error) {
        logger.error('Error updating route status:', error);
        socket.emit('error', { message: 'Failed to update route status' });
      }
    });

    // Handle emergency alerts
    socket.on('create_alert', async (data) => {
      try {
        const { title, description, location, severity, type } = data;
        
        // Insert into database
        const { data: alertData, error } = await supabase
          .from('emergency_alerts')
          .insert({
            title,
            description,
            location,
            severity,
            type,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;

        // Broadcast to all clients
        io.emit('new_emergency_alert', alertData);
        
        // Send to location-specific room
        socket.to(`location_${location}`).emit('local_emergency_alert', alertData);

        logger.info('Emergency alert created via socket:', alertData.id);
      } catch (error) {
        logger.error('Error creating alert:', error);
        socket.emit('error', { message: 'Failed to create alert' });
      }
    });

    // Handle location tracking for emergency responders
    socket.on('update_responder_location', (data) => {
      try {
        const { responder_id, latitude, longitude, status } = data;
        
        // Broadcast to admin dashboard
        socket.to('role_admin').emit('responder_location_update', {
          responder_id,
          latitude,
          longitude,
          status,
          timestamp: new Date().toISOString()
        });

        logger.info('Responder location updated:', { responder_id, status });
      } catch (error) {
        logger.error('Error updating responder location:', error);
      }
    });

    // Handle chat messages for coordination
    socket.on('send_coordination_message', (data) => {
      try {
        const { room, message, sender, priority } = data;
        
        const messageData = {
          id: generateMessageId(),
          message,
          sender,
          priority: priority || 'normal',
          timestamp: new Date().toISOString()
        };

        // Send to specific room (incident, location, or role-based)
        socket.to(room).emit('coordination_message', messageData);
        
        logger.info('Coordination message sent:', { room, sender, priority });
      } catch (error) {
        logger.error('Error sending coordination message:', error);
      }
    });

    // Handle real-time dashboard updates
    socket.on('request_dashboard_data', async () => {
      try {
        // Fetch latest statistics
        const [alerts, resources, routes, incidents] = await Promise.all([
          supabase.from('emergency_alerts').select('*').eq('status', 'active'),
          supabase.from('emergency_resources').select('*').eq('available', true),
          supabase.from('evacuation_routes').select('*').eq('current_status', 'open'),
          supabase.from('incident_reports').select('*').eq('verified', true)
        ]);

        const dashboardData = {
          active_alerts: alerts.data?.length || 0,
          available_resources: resources.data?.length || 0,
          open_routes: routes.data?.length || 0,
          verified_incidents: incidents.data?.length || 0,
          timestamp: new Date().toISOString()
        };

        socket.emit('dashboard_data', dashboardData);
      } catch (error) {
        logger.error('Error fetching dashboard data:', error);
        socket.emit('error', { message: 'Failed to fetch dashboard data' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('Client disconnected:', socket.id);
    });
  });

  // Periodic updates
  setInterval(async () => {
    try {
      // Send periodic updates to all connected clients
      const { data: activeAlerts } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      io.emit('periodic_update', {
        active_alerts: activeAlerts || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error sending periodic update:', error);
    }
  }, 30000); // Every 30 seconds
};

const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
