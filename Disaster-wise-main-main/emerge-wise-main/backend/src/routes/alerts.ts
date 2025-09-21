import express from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { getSocketInstance } from '../socket/handlers';

const router = express.Router();

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const { title, description, location, severity, type, affected_population } = req.body;
    
    const { data, error } = await supabase
      .from('emergency_alerts')
      .insert({
        title,
        description,
        location,
        severity,
        type,
        affected_population,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    // Emit real-time notification
    const io = getSocketInstance();
    if (io) {
      io.emit('new_alert', data);
    }
    
    logger.info('New alert created:', data.id);
    res.status(201).json(data);
  } catch (error) {
    logger.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update alert status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('emergency_alerts')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Emit real-time update
    const io = getSocketInstance();
    if (io) {
      io.emit('alert_updated', data);
    }
    
    res.json(data);
  } catch (error) {
    logger.error('Error updating alert status:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

// Get alerts by severity
router.get('/severity/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    const { data, error } = await supabase
      .from('emergency_alerts')
      .select('*')
      .eq('severity', level)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching alerts by severity:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;
