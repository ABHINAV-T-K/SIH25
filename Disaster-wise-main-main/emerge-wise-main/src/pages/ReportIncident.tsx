import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Camera, MapPin, Clock, Send, AlertTriangle, Info } from "lucide-react";
import { useIncidentReports } from "@/hooks/useIncidentReports";
import { useToast } from "@/hooks/use-toast";

const ReportIncident = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { createReport } = useIncidentReports();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "",
    severity: "",
    location: "",
    description: "",
    contact: "",
    anonymous: false,
    images: [] as File[],
  });

  const incidentTypes = [
    { value: "flood", label: "Flood / Water Emergency" },
    { value: "fire", label: "Fire / Explosion" },
    { value: "earthquake", label: "Earthquake / Structural Damage" },
    { value: "weather", label: "Severe Weather" },
    { value: "accident", label: "Vehicle / Industrial Accident" },
    { value: "hazmat", label: "Chemical / Hazmat Spill" },
    { value: "medical", label: "Medical Emergency" },
    { value: "other", label: "Other Emergency" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles].slice(0, 5) // Max 5 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const progress = (step / 3) * 100;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="incident-type" className="text-base font-medium">
          What type of incident are you reporting? *
        </Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select incident type" />
          </SelectTrigger>
          <SelectContent>
            {incidentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="severity" className="text-base font-medium">
          How severe is this incident? *
        </Label>
        <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select severity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - No immediate danger</SelectItem>
            <SelectItem value="medium">Medium - Potential risk</SelectItem>
            <SelectItem value="high">High - Significant danger</SelectItem>
            <SelectItem value="critical">Critical - Life threatening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location" className="text-base font-medium">
          Where is this incident occurring? *
        </Label>
        <div className="mt-2 space-y-2">
          <Input
            id="location"
            placeholder="Enter address, landmark, or description"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
          <Button variant="outline" size="sm" className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            Use Current Location
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="description" className="text-base font-medium">
          Describe the incident in detail *
        </Label>
        <Textarea
          id="description"
          className="mt-2 min-h-32"
          placeholder="Please provide as much detail as possible about what happened, current conditions, and any immediate dangers..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Include: What happened, when it started, number of people affected, immediate dangers
        </p>
      </div>

      <div>
        <Label className="text-base font-medium">Upload Images (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Photos can help emergency responders assess the situation. Max 5 images, 10MB each.
        </p>
        
        <div className="border-2 border-dashed border-border rounded-lg p-6">
          <div className="text-center">
            <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-sm">
              <label htmlFor="image-upload" className="cursor-pointer text-primary hover:underline">
                Click to upload images
              </label>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <span className="text-muted-foreground"> or drag and drop</span>
            </div>
          </div>
        </div>

        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="contact" className="text-base font-medium">
          Contact Information
        </Label>
        <Input
          id="contact"
          className="mt-2"
          placeholder="Phone number or email (for follow-up)"
          value={formData.contact}
          onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="anonymous"
          checked={formData.anonymous}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anonymous: !!checked }))}
        />
        <Label htmlFor="anonymous" className="text-sm">
          Submit this report anonymously
        </Label>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Before submitting:</p>
              <ul className="text-blue-800 space-y-1">
                <li>• Ensure you are in a safe location</li>
                <li>• Call emergency services (911) for immediate life-threatening situations</li>
                <li>• Your report will be reviewed and verified by emergency personnel</li>
                <li>• You may be contacted for additional information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-secondary rounded-lg p-4 space-y-3">
        <h4 className="font-semibold">Report Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className="ml-2">
              {incidentTypes.find(t => t.value === formData.type)?.label || "Not selected"}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Severity:</span>
            <Badge variant="outline" className="ml-2 capitalize">
              {formData.severity || "Not selected"}
            </Badge>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Location:</span>
            <span className="ml-2">{formData.location || "Not specified"}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Images:</span>
            <span className="ml-2">{formData.images.length} uploaded</span>
          </div>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    if (step === 1) return formData.type && formData.severity && formData.location;
    if (step === 2) return formData.description.length >= 10;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const reportData = {
        type: formData.type as any,
        severity: formData.severity as any,
        location: formData.location,
        description: formData.description,
        contact_info: formData.anonymous ? null : formData.contact,
        is_anonymous: formData.anonymous,
        images: [], // TODO: Implement image upload to Supabase Storage
      };

      const { data, error } = await createReport(reportData);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Report Submitted",
          description: "Your incident report has been submitted successfully and is being reviewed.",
        });
        
        // Reset form
        setFormData({
          type: "",
          severity: "",
          location: "",
          description: "",
          contact: "",
          anonymous: false,
          images: [],
        });
        setStep(1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Report Emergency Incident
        </h1>
        <p className="text-muted-foreground">
          Help emergency services respond quickly by providing detailed information
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 3</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Basic Info</span>
            <span>Details & Images</span>
            <span>Contact & Submit</span>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Notice */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Emergency Situations</p>
              <p className="text-sm text-red-800">
                If this is a life-threatening emergency, call <strong>911</strong> immediately. 
                This form is for reporting incidents that need documentation and response coordination.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Incident Information"}
            {step === 2 && "Incident Details"}
            {step === 3 && "Contact & Submission"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Tell us about the type and severity of the incident"}
            {step === 2 && "Provide detailed description and supporting images"}
            {step === 3 && "Review your report and provide contact information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Previous
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            className="bg-alert-critical hover:bg-alert-critical/90 text-alert-critical-foreground"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReportIncident;