import { logger } from '../utils/logger';

interface IncidentData {
  type: string;
  description: string;
  location: string;
}

// AI-based severity calculation (simplified version)
export const calculateAISeverity = async (incident: IncidentData): Promise<number> => {
  try {
    let score = 5; // Base score

    // Type-based scoring
    const typeScores: { [key: string]: number } = {
      'earthquake': 8,
      'flood': 7,
      'fire': 6,
      'weather': 5,
      'accident': 4,
      'hazmat': 7,
      'medical': 3,
      'other': 3
    };

    score = typeScores[incident.type] || 5;

    // Description-based keywords analysis
    const highSeverityKeywords = [
      'multiple casualties', 'building collapse', 'major damage', 'widespread',
      'critical', 'emergency', 'immediate', 'severe', 'massive', 'extensive'
    ];

    const mediumSeverityKeywords = [
      'injury', 'damage', 'blocked', 'minor', 'moderate', 'some'
    ];

    const description = incident.description.toLowerCase();
    
    let keywordScore = 0;
    highSeverityKeywords.forEach(keyword => {
      if (description.includes(keyword)) keywordScore += 2;
    });
    
    mediumSeverityKeywords.forEach(keyword => {
      if (description.includes(keyword)) keywordScore += 1;
    });

    // Location-based scoring (high-density areas)
    const highDensityAreas = [
      'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad',
      'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur'
    ];

    const locationScore = highDensityAreas.some(area => 
      incident.location.toLowerCase().includes(area)
    ) ? 1 : 0;

    // Calculate final score
    const finalScore = Math.min(10, Math.max(1, score + keywordScore + locationScore));
    
    logger.info('AI Severity calculated:', {
      incident_type: incident.type,
      base_score: score,
      keyword_score: keywordScore,
      location_score: locationScore,
      final_score: finalScore
    });

    return finalScore;
  } catch (error) {
    logger.error('Error calculating AI severity:', error);
    return 5; // Default score
  }
};

// Predict resource requirements based on incident
export const predictResourceRequirements = async (incident: IncidentData & { severity: number }) => {
  try {
    const requirements: any = {
      medical_teams: 0,
      fire_teams: 0,
      police_units: 0,
      shelters: 0,
      estimated_affected: 0
    };

    // Base requirements by type
    switch (incident.type) {
      case 'earthquake':
        requirements.medical_teams = Math.ceil(incident.severity * 2);
        requirements.fire_teams = Math.ceil(incident.severity * 1.5);
        requirements.police_units = Math.ceil(incident.severity * 1);
        requirements.shelters = Math.ceil(incident.severity * 3);
        requirements.estimated_affected = incident.severity * 100;
        break;
      
      case 'flood':
        requirements.medical_teams = Math.ceil(incident.severity * 1.5);
        requirements.fire_teams = Math.ceil(incident.severity * 1);
        requirements.police_units = Math.ceil(incident.severity * 1);
        requirements.shelters = Math.ceil(incident.severity * 4);
        requirements.estimated_affected = incident.severity * 150;
        break;
      
      case 'fire':
        requirements.medical_teams = Math.ceil(incident.severity * 1);
        requirements.fire_teams = Math.ceil(incident.severity * 3);
        requirements.police_units = Math.ceil(incident.severity * 0.5);
        requirements.shelters = Math.ceil(incident.severity * 1);
        requirements.estimated_affected = incident.severity * 50;
        break;
      
      default:
        requirements.medical_teams = Math.ceil(incident.severity * 1);
        requirements.fire_teams = Math.ceil(incident.severity * 0.5);
        requirements.police_units = Math.ceil(incident.severity * 1);
        requirements.shelters = Math.ceil(incident.severity * 1);
        requirements.estimated_affected = incident.severity * 25;
    }

    return requirements;
  } catch (error) {
    logger.error('Error predicting resource requirements:', error);
    return null;
  }
};
