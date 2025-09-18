import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  MapPin, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Bell,
  CheckCircle,
  XCircle
} from "lucide-react";

const AdminDashboard = () => {
  const systemMetrics = [
    { label: "Total Users", value: "12,543", change: "+2.4%", trend: "up", icon: Users },
    { label: "Active Alerts", value: "8", change: "-15.7%", trend: "down", icon: AlertTriangle },
    { label: "Response Time", value: "4.2m", change: "+0.8m", trend: "up", icon: Clock },
    { label: "System Uptime", value: "99.8%", change: "+0.1%", trend: "up", icon: Activity },
  ];

  const recentAlerts = [
    {
      id: 1,
      title: "Flash Flood Warning",
      severity: "Critical",
      status: "Verified",
      reporter: "Public Safety Officer",
      location: "Riverside District",
      time: "15 minutes ago",
      verified: true,
    },
    {
      id: 2,
      title: "Power Outage Report",
      severity: "Medium",
      status: "Pending Review",
      reporter: "Anonymous Citizen",
      location: "Downtown Area",
      time: "32 minutes ago",
      verified: false,
    },
    {
      id: 3,
      title: "Vehicle Accident",
      severity: "High",
      status: "Resolved",
      reporter: "Emergency Responder",
      location: "Highway 15",
      time: "1 hour ago",
      verified: true,
    },
  ];

  const systemStatus = [
    { name: "Alert System", status: "Operational", uptime: 99.9, issues: 0 },
    { name: "Communication Network", status: "Operational", uptime: 98.7, issues: 1 },
    { name: "GPS Tracking", status: "Operational", uptime: 99.5, issues: 0 },
    { name: "Database Servers", status: "Operational", uptime: 100, issues: 0 },
    { name: "Mobile App", status: "Degraded", uptime: 95.2, issues: 3 },
    { name: "Web Portal", status: "Operational", uptime: 99.8, issues: 0 },
  ];

  const resourceAllocation = [
    { resource: "Emergency Personnel", allocated: 85, available: 15, total: 250 },
    { resource: "Rescue Vehicles", allocated: 60, available: 40, total: 45 },
    { resource: "Medical Supplies", allocated: 75, available: 25, total: 100 },
    { resource: "Shelter Capacity", allocated: 42, available: 58, total: 1800 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-alert-critical text-alert-critical-foreground";
      case "high": return "bg-alert-warning text-alert-warning-foreground";
      case "medium": return "bg-alert-info text-alert-info-foreground";
      default: return "bg-alert-safe text-alert-safe-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "operational": return "text-alert-safe";
      case "degraded": return "text-alert-warning";
      case "down": return "text-alert-critical";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "operational":
        return <CheckCircle className="h-4 w-4 text-alert-safe" />;
      case "down":
      case "failed":
        return <XCircle className="h-4 w-4 text-alert-critical" />;
      default:
        return <Clock className="h-4 w-4 text-alert-warning" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System management and emergency response coordination
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            System Alerts
          </Button>
          <Button className="bg-alert-critical hover:bg-alert-critical/90 text-alert-critical-foreground">
            Broadcast Emergency
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === "up" && metric.label !== "Response Time";
          
          return (
            <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-alert-safe" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-alert-critical" />
                      )}
                      <span className={isPositive ? "text-alert-safe" : "text-alert-critical"}>
                        {metric.change}
                      </span>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Alert Management</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Alert Management Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Alert Reports</CardTitle>
                  <CardDescription>Citizen reports requiring verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {getStatusIcon(alert.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>Reported by: {alert.reporter}</span> • 
                          <span className="ml-1">{alert.location}</span> • 
                          <span className="ml-1">{alert.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!alert.verified && (
                          <>
                            <Button variant="outline" size="sm" className="text-alert-safe border-alert-safe">
                              Verify
                            </Button>
                            <Button variant="outline" size="sm" className="text-alert-critical border-alert-critical">
                              Dismiss
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">Details</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-alert-critical hover:bg-alert-critical/90 text-alert-critical-foreground">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Create Emergency Alert
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Evacuation Routes
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Activate Response Team
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Verified Alerts</span>
                      <Badge className="bg-alert-safe text-alert-safe-foreground">24</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Review</span>
                      <Badge className="bg-alert-warning text-alert-warning-foreground">5</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dismissed</span>
                      <Badge variant="outline">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Auto-Generated</span>
                      <Badge className="bg-alert-info text-alert-info-foreground">18</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemStatus.map((system, index) => (
              <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(system.status)}
                      <div>
                        <h4 className="font-semibold">{system.name}</h4>
                        <p className={`text-sm ${getStatusColor(system.status)}`}>
                          {system.status}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{system.uptime}% uptime</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Health</span>
                      <span>{system.uptime}%</span>
                    </div>
                    <Progress value={system.uptime} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {system.issues} active issues
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resourceAllocation.map((resource, index) => {
              const allocatedPercentage = (resource.allocated / resource.total) * 100;
              
              return (
                <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{resource.resource}</h4>
                        <Badge variant="outline">
                          {resource.allocated}/{resource.total}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Allocated</span>
                          <span>{Math.round(allocatedPercentage)}%</span>
                        </div>
                        <Progress value={allocatedPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Available: {resource.available}</span>
                          <span>Total: {resource.total}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Reallocate
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Analytics</CardTitle>
                <CardDescription>Average response times by incident type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Response Time Chart
                      <br />
                      (Chart.js/Recharts Integration)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Distribution</CardTitle>
                <CardDescription>Types and frequency of reported incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Incident Distribution Chart
                      <br />
                      (Interactive Pie Chart)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-16 w-16 text-primary mx-auto" />
                  <p className="text-lg font-semibold">Performance Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time system performance metrics
                    <br />
                    Response times • Alert accuracy • Resource utilization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;