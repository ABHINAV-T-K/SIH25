import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MapPin, Users, Clock, Filter, Search, Building, Shield, Heart, Truck } from "lucide-react";
import resourcesIcon from "@/assets/resources-icon.jpg";
import { useResources } from "@/hooks/useResources";

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { resources, loading, error } = useResources();

  // Indian Emergency Contacts
  const emergencyContacts = [
    { name: "National Emergency Number", number: "112", type: "emergency" },
    { name: "Fire Department", number: "101", type: "fire" },
    { name: "Police Department", number: "100", type: "police" },
    { name: "Ambulance / Medical", number: "102", type: "medical" },
    { name: "Disaster Management", number: "108", type: "management" },
    { name: "Women Helpline", number: "1091", type: "help" },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'shelter': return <Building className="h-5 w-5" />;
      case 'hospital': return <Heart className="h-5 w-5" />;
      case 'fire_station': return <Truck className="h-5 w-5" />;
      case 'police_station': return <Shield className="h-5 w-5" />;
      case 'emergency_contact': return <Phone className="h-5 w-5" />;
      default: return <Building className="h-5 w-5" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'shelter': return 'Emergency Shelter';
      case 'hospital': return 'Medical Facility';
      case 'fire_station': return 'Fire Station';
      case 'police_station': return 'Police Station';
      case 'emergency_contact': return 'Emergency Contact';
      default: return type;
    }
  };

  const getStatusColor = (available: boolean, capacity?: number, currentOccupancy?: number) => {
    if (!available) return "bg-alert-critical text-alert-critical-foreground";
    if (capacity && currentOccupancy) {
      const percentage = (currentOccupancy / capacity) * 100;
      if (percentage >= 90) return "bg-alert-critical text-alert-critical-foreground";
      if (percentage >= 70) return "bg-alert-warning text-alert-warning-foreground";
    }
    return "bg-alert-safe text-alert-safe-foreground";
  };

  // Filtered Resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const resourceStats = {
    total: resources.length,
    available: resources.filter(r => r.available).length,
    shelters: resources.filter(r => r.type === 'shelter').length,
    hospitals: resources.filter(r => r.type === 'hospital').length,
  };

  if (loading) return <div className="text-center py-12">Loading resources...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <img src={resourcesIcon} alt="Emergency Resources" className="h-8 w-8 rounded" />
            Indian Emergency Resources
          </h1>
          <p className="text-muted-foreground">
            Find shelters, hospitals, and emergency contacts across India
          </p>
        </div>
      </div>

      {/* Emergency Contacts */}
      <Card className="bg-alert-critical/10 border-alert-critical/30 dark:bg-alert-critical/20">
        <CardHeader>
          <CardTitle className="text-alert-critical dark:text-alert-critical flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts (India)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <div className="font-semibold text-sm">{contact.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{contact.type}</div>
                </div>
                <Button variant="outline" size="sm" className="font-mono">
                  <Phone className="h-3 w-3 mr-2" />
                  {contact.number}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search resources by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="emergency_contact">Emergency Services</SelectItem>
                <SelectItem value="hospital">Medical Facilities</SelectItem>
                <SelectItem value="shelter">Emergency Shelters</SelectItem>
                <SelectItem value="fire_station">Fire Departments</SelectItem>
                <SelectItem value="police_station">Police Stations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resource Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{resourceStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Resources</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-alert-safe">{resourceStats.available}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-alert-info">{resourceStats.shelters}</div>
            <div className="text-sm text-muted-foreground">Shelters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-alert-warning">{resourceStats.hospitals}</div>
            <div className="text-sm text-muted-foreground">Hospitals</div>
          </CardContent>
        </Card>
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.map((resource, index) => (
          <Card key={resource.id} className="animate-slide-up border-l-4 border-l-primary hover:shadow-lg transition-all duration-200" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{getResourceIcon(resource.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold">{resource.name}</h3>
                        <Badge variant="outline" className="mt-1">{getResourceTypeLabel(resource.type)}</Badge>
                      </div>
                    </div>
                    <Badge className={getStatusColor(resource.available, resource.capacity, resource.current_occupancy)}>
                      {resource.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{resource.address}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Phone:</span>
                      <div className="text-muted-foreground">{resource.phone || 'N/A'}</div>
                    </div>
                    {resource.email && (
                      <div>
                        <span className="font-medium">Email:</span>
                        <div className="text-muted-foreground">{resource.email}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Capacity:</span>
                      {resource.capacity ? (
                        <div className="flex items-center gap-2">
                          <span>{resource.current_occupancy || 0}/{resource.capacity}</span>
                          <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                (resource.current_occupancy || 0) / resource.capacity > 0.8 
                                  ? 'bg-alert-critical' 
                                  : (resource.current_occupancy || 0) / resource.capacity > 0.6 
                                    ? 'bg-alert-warning'
                                    : 'bg-alert-safe'
                              }`}
                              style={{ width: `${((resource.current_occupancy || 0) / resource.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(resource.updated_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Button size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Directions
                  </Button>
                  {resource.phone && (
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Resources;
