import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, MapPin, Clock, Target, CheckCircle, PlayCircle } from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  region: string;
  disasterType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  progress: number;
  completed: boolean;
  scenarios: string[];
  videoUrl?: string;
}

const TrainingModules = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedDisaster, setSelectedDisaster] = useState<string>("all");
  const [modules, setModules] = useState<TrainingModule[]>([]);

  // ML-generated region-specific training modules
  const trainingModules: TrainingModule[] = [
    {
      id: "1",
      title: "Cyclone Response - Coastal India",
      description: "Comprehensive training for cyclone preparedness in coastal regions of India",
      region: "coastal",
      disasterType: "cyclone",
      difficulty: "intermediate",
      duration: 45,
      progress: 75,
      completed: false,
      scenarios: ["Pre-landfall preparation", "During cyclone safety", "Post-cyclone recovery"],
      videoUrl: "https://youtu.be/B9qR2e3xyJo"
    },
    {
      id: "2", 
      title: "Earthquake Safety - Himalayan Belt",
      description: "Specialized earthquake response training for Himalayan regions",
      region: "himalayan",
      disasterType: "earthquake",
      difficulty: "advanced",
      duration: 60,
      progress: 100,
      completed: true,
      scenarios: ["Building collapse response", "Mountain rescue", "Aftershock protocols"],
      videoUrl: "https://youtu.be/U4QLsUNPXnU"
    },
    {
      id: "3",
      title: "Flood Management - Gangetic Plains",
      description: "Flood response strategies for North Indian plains",
      region: "gangetic",
      disasterType: "flood",
      difficulty: "beginner",
      duration: 30,
      progress: 20,
      completed: false,
      scenarios: ["Early warning systems", "Evacuation procedures", "Relief distribution"],
      videoUrl: "https://youtu.be/0b0yrwHvCdc"
    },
    {
      id: "4",
      title: "Drought Management - Deccan Plateau",
      description: "Water conservation and drought mitigation for peninsular India",
      region: "deccan",
      disasterType: "drought",
      difficulty: "intermediate",
      duration: 40,
      progress: 0,
      completed: false,
      scenarios: ["Water rationing", "Crop protection", "Community mobilization"],
      videoUrl: "https://youtu.be/2c9cwS55h9U?si=vm4Wz5ZMJv9yKXCU"
    },
    {
      id: "5",
      title: "Landslide Response - Western Ghats",
      description: "Landslide prevention and response in Western Ghats region",
      region: "western_ghats",
      disasterType: "landslide", 
      difficulty: "advanced",
      duration: 50,
      progress: 30,
      completed: false,
      scenarios: ["Slope stability assessment", "Early warning signs", "Rescue operations"],
      videoUrl: "https://youtu.be/xnoheMCY0jc"
    },
    {
      id: "6",
      title: "Heat Wave Preparedness - Central India",
      description: "Heat wave management for hot and dry regions",
      region: "central",
      disasterType: "heat_wave",
      difficulty: "beginner",
      duration: 25,
      progress: 90,
      completed: false,
      scenarios: ["Heat stress prevention", "Cooling center setup", "Vulnerable population care"],
      videoUrl: "https://youtu.be/PndkLH1tTWQ"
    }
  ];

  useEffect(() => {
    let filtered = trainingModules;
    
    if (selectedRegion !== "all") {
      filtered = filtered.filter(module => module.region === selectedRegion);
    }
    
    if (selectedDisaster !== "all") {
      filtered = filtered.filter(module => module.disasterType === selectedDisaster);
    }
    
    setModules(filtered);
  }, [selectedRegion, selectedDisaster]);

  const regions = [
    { value: "all", label: "All Regions" },
    { value: "coastal", label: "Coastal India" },
    { value: "himalayan", label: "Himalayan Belt" },
    { value: "gangetic", label: "Gangetic Plains" },
    { value: "deccan", label: "Deccan Plateau" },
    { value: "western_ghats", label: "Western Ghats" },
    { value: "central", label: "Central India" }
  ];

  const disasters = [
    { value: "all", label: "All Disasters" },
    { value: "cyclone", label: "Cyclone" },
    { value: "earthquake", label: "Earthquake" },
    { value: "flood", label: "Flood" },
    { value: "drought", label: "Drought" },
    { value: "landslide", label: "Landslide" },
    { value: "heat_wave", label: "Heat Wave" }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-alert-safe text-white";
      case "intermediate": return "bg-alert-warning text-white"; 
      case "advanced": return "bg-alert-critical text-white";
      default: return "bg-secondary";
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('/').pop()?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const completedModules = trainingModules.filter(m => m.completed).length;
  const totalModules = trainingModules.length;
  const overallProgress = Math.round((completedModules / totalModules) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Training Modules</h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedDisaster} onValueChange={setSelectedDisaster}>
            <SelectTrigger>
              <SelectValue placeholder="Select Disaster Type" />
            </SelectTrigger>
            <SelectContent>
              {disasters.map(disaster => (
                <SelectItem key={disaster.value} value={disaster.value}>
                  {disaster.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="relative hover:shadow-lg transition-shadow">
            {module.completed && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="h-6 w-6 text-alert-safe" />
              </div>
            )}
            
            <CardHeader>
              <div className="space-y-2">
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
                
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {regions.find(r => r.value === module.region)?.label}
                  </Badge>
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* YouTube Video Player */}
              {module.videoUrl && (
                <div className="aspect-video w-full">
                  <iframe
                    src={getYouTubeEmbedUrl(module.videoUrl)}
                    title={module.title}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{module.duration} minutes</span>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{module.progress}%</span>
                </div>
                <Progress value={module.progress} className="h-2" />
              </div>

              {/* Scenarios */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Training Scenarios:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {module.scenarios.map((scenario, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      {scenario}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                variant={module.completed ? "outline" : "default"}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {module.completed ? "Review Module" : module.progress > 0 ? "Continue Training" : "Start Training"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No training modules found for the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrainingModules;