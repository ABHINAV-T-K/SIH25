import express from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { getSocketInstance } from '../socket/handlers';

const router = express.Router();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const { type, available } = req.query;
    
    let query = supabase.from('emergency_resources').select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (available !== undefined) {
      query = query.eq('available', available === 'true');
    }
    
    const { data, error } = await query.order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Update resource availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { available, current_occupancy } = req.body;

    const { data, error } = await supabase
      .from('emergency_resources')
      .update({ 
        available,
        ...(current_occupancy !== undefined && { current_occupancy })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Emit real-time update
    const io = getSocketInstance();
    if (io) {
      io.emit('resource_updated', data);
    }
    
    res.json(data);
  } catch (error) {
    logger.error('Error updating resource availability:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Get nearby resources
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10, type } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // For now, return all resources (in production, implement proper geospatial queries)
    let query = supabase.from('emergency_resources').select('*').eq('available', true);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query.order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching nearby resources:', error);
    res.status(500).json({ error: 'Failed to fetch nearby resources' });
  }
});

// Get resource capacity status
router.get('/capacity-status', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emergency_resources')
      .select('type, capacity, current_occupancy, available')
      .not('capacity', 'is', null);

    if (error) throw error;

    const capacityStatus = data.reduce((acc: any, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = {
          total_capacity: 0,
          total_occupancy: 0,
          available_resources: 0
        };
      }
      
      acc[resource.type].total_capacity += resource.capacity || 0;
      acc[resource.type].total_occupancy += resource.current_occupancy || 0;
      if (resource.available) {
        acc[resource.type].available_resources += 1;
      }
      
      return acc;
    }, {});

    res.json(capacityStatus);
  } catch (error) {
    logger.error('Error fetching capacity status:', error);
    res.status(500).json({ error: 'Failed to fetch capacity status' });
  }
});

// Add new resource
router.post('/', async (req, res) => {
  try {
    const { name, type, address, phone, email, capacity } = req.body;
    
    const { data, error } = await supabase
      .from('emergency_resources')
      .insert({
        name,
        type,
        address,
        phone,
        email,
        capacity,
        available: true,
        current_occupancy: 0
      })
      .select()
      .single();

    if (error) throw error;

    // Emit real-time notification
    const io = getSocketInstance();
    if (io) {
      io.emit('new_resource', data);
    }
    
    logger.info('New resource added:', data.id);
    res.status(201).json(data);
  } catch (error) {
    logger.error('Error adding resource:', error);
    res.status(500).json({ error: 'Failed to add resource' });
  }
});

export default router;
