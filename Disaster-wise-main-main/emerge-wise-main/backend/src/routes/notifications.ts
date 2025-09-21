import express from 'express';
import { logger } from '../utils/logger';
import { io } from '../server';

const router = express.Router();

// Send emergency notification
router.post('/emergency', async (req, res) => {
  try {
    const { title, message, severity, location, type, recipients } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const notification = {
      id: generateNotificationId(),
      title,
      message,
      severity: severity || 'medium',
      location,
      type: type || 'general',
      timestamp: new Date().toISOString(),
      recipients: recipients || 'all'
    };

    // Emit to all connected clients
    io.emit('emergency_notification', notification);
    
    // Log the notification
    logger.info('Emergency notification sent:', {
      id: notification.id,
      title,
      severity,
      location
    });

    res.status(201).json({
      success: true,
      notification_id: notification.id,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    logger.error('Error sending emergency notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send SMS alert (mock implementation)
router.post('/sms', async (req, res) => {
  try {
    const { phone_numbers, message, priority } = req.body;
    
    if (!phone_numbers || !message) {
      return res.status(400).json({ error: 'Phone numbers and message are required' });
    }

    // Mock SMS sending
    const smsResults = phone_numbers.map((phone: string) => ({
      phone,
      status: 'sent',
      message_id: generateMessageId(),
      timestamp: new Date().toISOString()
    }));

    logger.info('SMS alerts sent:', {
      count: phone_numbers.length,
      priority: priority || 'normal'
    });

    res.json({
      success: true,
      sent_count: phone_numbers.length,
      results: smsResults
    });
  } catch (error) {
    logger.error('Error sending SMS alerts:', error);
    res.status(500).json({ error: 'Failed to send SMS alerts' });
  }
});

// Send push notification
router.post('/push', async (req, res) => {
  try {
    const { title, body, data, tokens } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Mock push notification sending
    const pushResults = (tokens || ['all']).map((token: string) => ({
      token,
      status: 'sent',
      message_id: generateMessageId(),
      timestamp: new Date().toISOString()
    }));

    // Emit to connected clients
    io.emit('push_notification', { title, body, data });

    logger.info('Push notifications sent:', {
      title,
      recipient_count: tokens?.length || 1
    });

    res.json({
      success: true,
      sent_count: tokens?.length || 1,
      results: pushResults
    });
  } catch (error) {
    logger.error('Error sending push notifications:', error);
    res.status(500).json({ error: 'Failed to send push notifications' });
  }
});

// Get notification history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, type, severity } = req.query;
    
    // Mock notification history (in production, store in database)
    const mockHistory = Array.from({ length: Number(limit) }, (_, i) => ({
      id: generateNotificationId(),
      title: `Emergency Alert ${i + 1}`,
      message: `This is a sample emergency notification ${i + 1}`,
      type: type || 'alert',
      severity: severity || 'medium',
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      status: 'sent',
      recipients_count: Math.floor(Math.random() * 1000) + 100
    }));

    res.json({
      notifications: mockHistory,
      total: mockHistory.length,
      page: 1,
      limit: Number(limit)
    });
  } catch (error) {
    logger.error('Error fetching notification history:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

// Broadcast system-wide alert
router.post('/broadcast', async (req, res) => {
  try {
    const { alert_type, message, severity, affected_areas } = req.body;
    
    if (!alert_type || !message) {
      return res.status(400).json({ error: 'Alert type and message are required' });
    }

    const broadcast = {
      id: generateNotificationId(),
      alert_type,
      message,
      severity: severity || 'high',
      affected_areas: affected_areas || [],
      timestamp: new Date().toISOString(),
      broadcast_channels: ['web', 'mobile', 'sms', 'radio']
    };

    // Emit to all connected clients
    io.emit('system_broadcast', broadcast);
    
    // Log the broadcast
    logger.info('System broadcast sent:', {
      id: broadcast.id,
      alert_type,
      severity,
      affected_areas: affected_areas?.length || 0
    });

    res.status(201).json({
      success: true,
      broadcast_id: broadcast.id,
      message: 'Broadcast sent successfully',
      channels: broadcast.broadcast_channels
    });
  } catch (error) {
    logger.error('Error sending broadcast:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// Helper functions
const generateNotificationId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default router;
