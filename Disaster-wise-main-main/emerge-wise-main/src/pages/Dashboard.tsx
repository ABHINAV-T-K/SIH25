import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, MapPin, Users, Clock, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-emergency-center.jpg";
import { useAlerts } from "@/hooks/useAlerts";
import { useResources } from "@/hooks/useResources";
import { useEvacuationRoutes } from "@/hooks/useEvacuationRoutes";
import { useIncidentReports } from "@/hooks/useIncidentReports";

const Dashboard = () => {
  const { alerts, loading: alertsLoading } = useAlerts();
  const { resources, loading: resourcesLoading } = useResources();
  const { routes, loading: routesLoading } = useEvacuationRoutes();
  const { reports, loading: reportsLoading } = useIncidentReports();

  // Calculate real-time statistics
  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const availableResources = resources.filter(resource => resource.available);
  const shelters = resources.filter(resource => resource.type === 'shelter');
  const totalCapacity = shelters.reduce((sum, shelter) => sum + (shelter.capacity || 0), 0);
  const totalOccupancy = shelters.reduce((sum, shelter) => sum + shelter.current_occupancy, 0);

  const stats = [
    { 
      label: "Active Alerts", 
      value: alertsLoading ? "..." : activeAlerts.length.toString(), 
      change: `+${criticalAlerts.length}`, 
      icon: AlertTriangle 
    },
    { 
      label: "Available Resources", 
      value: resourcesLoading ? "..." : availableResources.length.toString(), 
      change: "+3", 
      icon: Shield 
    },
    { 
      label: "Evacuation Routes", 
      value: routesLoading ? "..." : routes.length.toString(), 
      change: "0", 
      icon: MapPin 
    },
    { 
      label: "Shelter Occupancy", 
      value: resourcesLoading ? "..." : `${Math.round((totalOccupancy / totalCapacity) * 100)}%`, 
      change: `+${totalOccupancy}`, 
      icon: Users 
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "text-alert-critical";
      case "high": return "text-alert-warning";
      case "medium": return "text-alert-info";
      default: return "text-alert-safe";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-alert-critical";
      case "high": return "bg-alert-warning";
      case "medium": return "bg-alert-info";
      default: return "bg-alert-safe";
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          className="h-80 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60" />
          <div className="relative z-10 flex items-center h-full px-8">
            <div className="text-white space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold">
                Emergency Response
                <br />
                <span className="text-yellow-300">Command Center</span>
              </h1>
              <p className="text-xl opacity-90 max-w-2xl">
                Real-time disaster monitoring and response coordination for community safety and emergency management.
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg" className="bg-alert-critical hover:bg-alert-critical/90 text-alert-critical-foreground animate-alert-pulse">
                  View Critical Alerts
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary font-semibold">
                  Emergency Contacts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-alert-safe" />
                      <span className="text-alert-safe">{stat.change}</span>
                      <span className="text-muted-foreground">from last hour</span>
                    </div>
                  </div>
                  <Icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-alert-warning" />
                    Active Alerts
                  </CardTitle>
                  <CardDescription>Real-time emergency notifications</CardDescription>
                </div>
                <Button variant="outline">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertsLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading alerts...</div>
              ) : activeAlerts.length > 0 ? (
                activeAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge 
                          className={`${getSeverityBg(alert.severity)} text-white`}
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.location}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No active alerts</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Emergency response readiness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Emergency Services</span>
                  <span className="text-alert-safe">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Communication Network</span>
                  <span className="text-alert-warning">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Shelter Capacity</span>
                  <span className="text-alert-safe">82%</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Resource Availability</span>
                  <span className="text-alert-critical">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Broadcast Alert
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Update Evacuation Routes
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Check Safe Zones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;