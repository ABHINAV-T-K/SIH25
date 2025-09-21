import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { getSocketInstance } from '../socket/handlers';
import { calculateAISeverity } from '../services/aiService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all incident reports
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Submit new incident report
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { type, severity, location, description, contact_info, is_anonymous } = req.body;
    
    // Calculate AI severity score
    const aiSeverity = await calculateAISeverity({
      type,
      description,
      location
    });

    const { data, error } = await supabase
      .from('incident_reports')
      .insert({
        type,
        severity,
        location,
        description,
        contact_info: is_anonymous === 'true' ? null : contact_info,
        is_anonymous: is_anonymous === 'true',
        ai_severity_score: aiSeverity,
        status: 'monitoring'
      })
      .select()
      .single();

    if (error) throw error;

    // Emit real-time notification for high severity incidents
    const io = getSocketInstance();
    if (io && (aiSeverity >= 7 || severity === 'critical')) {
      io.emit('high_severity_incident', data);
    }

    logger.info('New incident reported:', data.id);
    res.status(201).json(data);
  } catch (error) {
    logger.error('Error creating incident report:', error);
    res.status(500).json({ error: 'Failed to create incident report' });
  }
});

// Verify incident (admin only)
router.patch('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, verified_by } = req.body;

    const { data, error } = await supabase
      .from('incident_reports')
      .update({
        verified,
        verified_by,
        verified_at: verified ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If verified and high severity, create alert
    if (verified && (data.ai_severity_score >= 7 || data.severity === 'critical')) {
      const alertData = {
        title: `Verified ${data.type} incident`,
        description: data.description,
        location: data.location,
        severity: data.severity,
        type: data.type,
        status: 'active'
      };

      await supabase.from('emergency_alerts').insert(alertData);
      
      const io = getSocketInstance();
      if (io) {
        io.emit('incident_verified_alert', alertData);
      }
    }

    res.json(data);
  } catch (error) {
    logger.error('Error verifying incident:', error);
    res.status(500).json({ error: 'Failed to verify incident' });
  }
});

// Get incidents by location
router.get('/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .ilike('location', `%${location}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching incidents by location:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

export default router;
