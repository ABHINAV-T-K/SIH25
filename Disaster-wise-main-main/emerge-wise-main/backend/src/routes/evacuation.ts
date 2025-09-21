import express from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { getSocketInstance } from '../socket/handlers';
import { optimizeEvacuationRoute } from '../services/routeOptimization';

const router = express.Router();

// Get all evacuation routes
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase.from('evacuation_routes').select('*');
    
    if (status) {
      query = query.eq('current_status', status);
    }
    
    const { data, error } = await query.order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching evacuation routes:', error);
    res.status(500).json({ error: 'Failed to fetch evacuation routes' });
  }
});

// Get optimal route
router.post('/optimize', async (req, res) => {
  try {
    const { from_location, to_location, preferences } = req.body;
    
    if (!from_location || !to_location) {
      return res.status(400).json({ error: 'From and to locations are required' });
    }

    const optimizedRoute = await optimizeEvacuationRoute({
      from_location,
      to_location,
      preferences
    });

    res.json(optimizedRoute);
  } catch (error) {
    logger.error('Error optimizing route:', error);
    res.status(500).json({ error: 'Failed to optimize route' });
  }
});

// Update route status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { current_status, current_usage } = req.body;

    const { data, error } = await supabase
      .from('evacuation_routes')
      .update({ 
        current_status,
        ...(current_usage !== undefined && { current_usage })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Emit real-time update
    const io = getSocketInstance();
    if (io) {
      io.emit('route_status_updated', data);
    }
    
    res.json(data);
  } catch (error) {
    logger.error('Error updating route status:', error);
    res.status(500).json({ error: 'Failed to update route status' });
  }
});

// Get routes by location
router.get('/from/:location', async (req, res) => {
  try {
    const { location } = req.params;
    
    const { data, error } = await supabase
      .from('evacuation_routes')
      .select('*')
      .ilike('from_location', `%${location}%`)
      .eq('current_status', 'open')
      .order('distance_km');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching routes by location:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Add new evacuation route
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      from_location, 
      to_location, 
      route_points, 
      distance_km, 
      estimated_time_minutes,
      difficulty_level,
      capacity 
    } = req.body;
    
    const { data, error } = await supabase
      .from('evacuation_routes')
      .insert({
        name,
        from_location,
        to_location,
        route_points,
        distance_km,
        estimated_time_minutes,
        difficulty_level,
        capacity,
        current_status: 'open',
        current_usage: 0,
        ai_optimized: true
      })
      .select()
      .single();

    if (error) throw error;

    // Emit real-time notification
    const io = getSocketInstance();
    if (io) {
      io.emit('new_evacuation_route', data);
    }
    
    logger.info('New evacuation route added:', data.id);
    res.status(201).json(data);
  } catch (error) {
    logger.error('Error adding evacuation route:', error);
    res.status(500).json({ error: 'Failed to add evacuation route' });
  }
});

// Get route capacity status
router.get('/capacity-status', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('evacuation_routes')
      .select('current_status, capacity, current_usage')
      .not('capacity', 'is', null);

    if (error) throw error;

    const totalCapacity = data.reduce((sum, route) => sum + (route.capacity || 0), 0);
    const totalUsage = data.reduce((sum, route) => sum + (route.current_usage || 0), 0);
    const openRoutes = data.filter(route => route.current_status === 'open').length;
    const closedRoutes = data.filter(route => route.current_status === 'closed').length;

    res.json({
      total_capacity: totalCapacity,
      total_usage: totalUsage,
      utilization_percentage: totalCapacity > 0 ? (totalUsage / totalCapacity) * 100 : 0,
      open_routes: openRoutes,
      closed_routes: closedRoutes,
      total_routes: data.length
    });
  } catch (error) {
    logger.error('Error fetching route capacity status:', error);
    res.status(500).json({ error: 'Failed to fetch route capacity status' });
  }
});

export default router;
