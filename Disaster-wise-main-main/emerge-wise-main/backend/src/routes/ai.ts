import express from 'express';
import { calculateAISeverity, predictResourceRequirements } from '../services/aiService';
import { logger } from '../utils/logger';

const router = express.Router();

// Calculate AI severity for incident
router.post('/severity', async (req, res) => {
  try {
    const { type, description, location } = req.body;
    
    if (!type || !description || !location) {
      return res.status(400).json({ 
        error: 'Type, description, and location are required' 
      });
    }

    const severity = await calculateAISeverity({ type, description, location });
    
    res.json({ 
      ai_severity_score: severity,
      severity_level: getSeverityLevel(severity),
      confidence: 0.85 // Mock confidence score
    });
  } catch (error) {
    logger.error('Error calculating AI severity:', error);
    res.status(500).json({ error: 'Failed to calculate severity' });
  }
});

// Predict resource requirements
router.post('/predict-resources', async (req, res) => {
  try {
    const { type, description, location, severity } = req.body;
    
    if (!type || !description || !location || !severity) {
      return res.status(400).json({ 
        error: 'Type, description, location, and severity are required' 
      });
    }

    const requirements = await predictResourceRequirements({
      type,
      description,
      location,
      severity
    });
    
    res.json({
      predicted_requirements: requirements,
      confidence: 0.78,
      factors_considered: [
        'incident_type',
        'severity_level',
        'location_density',
        'historical_data'
      ]
    });
  } catch (error) {
    logger.error('Error predicting resources:', error);
    res.status(500).json({ error: 'Failed to predict resources' });
  }
});

// Risk assessment for area
router.post('/risk-assessment', async (req, res) => {
  try {
    const { location, incident_types } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Mock risk assessment (in production, use real ML models)
    const riskFactors = {
      flood: calculateLocationRisk(location, 'flood'),
      earthquake: calculateLocationRisk(location, 'earthquake'),
      fire: calculateLocationRisk(location, 'fire'),
      weather: calculateLocationRisk(location, 'weather')
    };

    const overallRisk = Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0) / 4;

    res.json({
      location,
      overall_risk_score: Math.round(overallRisk * 10) / 10,
      risk_factors: riskFactors,
      recommendations: generateRiskRecommendations(riskFactors),
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error assessing risk:', error);
    res.status(500).json({ error: 'Failed to assess risk' });
  }
});

// Generate evacuation recommendations
router.post('/evacuation-recommendations', async (req, res) => {
  try {
    const { location, incident_type, severity, population_density } = req.body;
    
    const recommendations = {
      immediate_actions: generateImmediateActions(incident_type, severity),
      evacuation_priority: calculateEvacuationPriority(severity, population_density),
      recommended_routes: await getRecommendedRoutes(location),
      estimated_time: calculateEvacuationTime(population_density, severity),
      resources_needed: await predictResourceRequirements({
        type: incident_type,
        description: `${severity} severity incident`,
        location,
        severity: getSeverityNumber(severity)
      })
    };

    res.json({
      recommendations,
      confidence: 0.82,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating evacuation recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Helper functions
const getSeverityLevel = (score: number): string => {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
};

const getSeverityNumber = (level: string): number => {
  const levels: { [key: string]: number } = {
    'low': 3,
    'medium': 5,
    'high': 7,
    'critical': 9
  };
  return levels[level] || 5;
};

const calculateLocationRisk = (location: string, type: string): number => {
  // Mock risk calculation based on location and incident type
  const locationRisks: { [key: string]: { [key: string]: number } } = {
    'mumbai': { flood: 8.5, earthquake: 4.2, fire: 6.1, weather: 7.3 },
    'delhi': { flood: 5.8, earthquake: 6.7, fire: 7.2, weather: 6.9 },
    'chennai': { flood: 9.1, earthquake: 3.8, fire: 5.9, weather: 8.2 },
    'kolkata': { flood: 8.8, earthquake: 5.1, fire: 6.3, weather: 7.8 },
    'bangalore': { flood: 6.2, earthquake: 4.5, fire: 6.8, weather: 5.9 }
  };

  const cityKey = Object.keys(locationRisks).find(city => 
    location.toLowerCase().includes(city)
  );

  return cityKey ? locationRisks[cityKey][type] || 5.0 : 5.0;
};

const generateRiskRecommendations = (riskFactors: any): string[] => {
  const recommendations = [];
  
  if (riskFactors.flood > 7) {
    recommendations.push('Install flood warning systems');
    recommendations.push('Prepare sandbags and drainage equipment');
  }
  
  if (riskFactors.earthquake > 6) {
    recommendations.push('Conduct earthquake drills regularly');
    recommendations.push('Secure heavy furniture and equipment');
  }
  
  if (riskFactors.fire > 6) {
    recommendations.push('Install fire detection systems');
    recommendations.push('Maintain clear evacuation routes');
  }
  
  return recommendations;
};

const generateImmediateActions = (type: string, severity: string): string[] => {
  const actions: { [key: string]: string[] } = {
    'earthquake': [
      'Drop, Cover, and Hold On',
      'Stay away from windows and heavy objects',
      'If outdoors, move away from buildings'
    ],
    'flood': [
      'Move to higher ground immediately',
      'Avoid walking or driving through flood water',
      'Turn off utilities if safe to do so'
    ],
    'fire': [
      'Evacuate immediately if safe',
      'Stay low to avoid smoke',
      'Call emergency services'
    ]
  };

  return actions[type] || ['Follow local emergency procedures', 'Contact emergency services'];
};

const calculateEvacuationPriority = (severity: string, density: number): string => {
  if (severity === 'critical' || density > 1000) return 'immediate';
  if (severity === 'high' || density > 500) return 'urgent';
  return 'standard';
};

const getRecommendedRoutes = async (location: string) => {
  // Mock route recommendations
  return [
    { name: 'Primary Route A', estimated_time: 15, capacity: 'high' },
    { name: 'Alternative Route B', estimated_time: 22, capacity: 'medium' }
  ];
};

const calculateEvacuationTime = (density: number, severity: string): number => {
  let baseTime = 30; // minutes
  
  if (density > 1000) baseTime += 20;
  if (severity === 'critical') baseTime += 15;
  
  return baseTime;
};

export default router;
