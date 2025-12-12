import { useState } from "react";
import { MapPin, Droplets, Thermometer, Leaf, FlaskConical, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";

interface LandData {
  location: string;
  district: string;
  landSize: number;
  month: string;
  soilPH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  temperature: number;
}

interface LandAnalysisFormProps {
  onAnalyze: (data: LandData) => void;
}

const LandAnalysisForm = ({ onAnalyze }: LandAnalysisFormProps) => {
  const [formData, setFormData] = useState<LandData>({
    location: "",
    district: "",
    landSize: 5,
    month: "",
    soilPH: 6.5,
    nitrogen: 50,
    phosphorus: 40,
    potassium: 45,
    moisture: 60,
    temperature: 28,
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const districts = [
    "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Chennai",
    "Coimbatore", "Dharwad", "Hassan", "Hyderabad", "Kolar", "Mandya",
    "Mysore", "Raichur", "Salem", "Shimoga", "Tumkur", "Vizag"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  return (
    <section id="analysis" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Analyze Your Land
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter your land details and soil parameters to get personalized crop recommendations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-card border border-border p-8">
            {/* Location Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Village/Town</Label>
                  <Input
                    id="location"
                    placeholder="Enter village name"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select value={formData.district} onValueChange={(value) => setFormData({ ...formData, district: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landSize">Land Size (acres)</Label>
                  <Input
                    id="landSize"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.landSize}
                    onChange={(e) => setFormData({ ...formData, landSize: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Planting Month */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-accent" />
                Planting Period
              </h3>
              <div className="space-y-2">
                <Label htmlFor="month">Select Month for Planting</Label>
                <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Soil Parameters */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-accent" />
                Soil Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Soil pH</Label>
                      <span className="text-sm font-medium text-accent">{formData.soilPH}</span>
                    </div>
                    <Slider
                      value={[formData.soilPH]}
                      onValueChange={(value) => setFormData({ ...formData, soilPH: value[0] })}
                      min={4}
                      max={9}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Acidic (4)</span>
                      <span>Neutral (7)</span>
                      <span>Alkaline (9)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Nitrogen (N) kg/ha</Label>
                      <span className="text-sm font-medium text-accent">{formData.nitrogen}</span>
                    </div>
                    <Slider
                      value={[formData.nitrogen]}
                      onValueChange={(value) => setFormData({ ...formData, nitrogen: value[0] })}
                      min={0}
                      max={150}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Phosphorus (P) kg/ha</Label>
                      <span className="text-sm font-medium text-accent">{formData.phosphorus}</span>
                    </div>
                    <Slider
                      value={[formData.phosphorus]}
                      onValueChange={(value) => setFormData({ ...formData, phosphorus: value[0] })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Potassium (K) kg/ha</Label>
                      <span className="text-sm font-medium text-accent">{formData.potassium}</span>
                    </div>
                    <Slider
                      value={[formData.potassium]}
                      onValueChange={(value) => setFormData({ ...formData, potassium: value[0] })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        Soil Moisture (%)
                      </Label>
                      <span className="text-sm font-medium text-accent">{formData.moisture}%</span>
                    </div>
                    <Slider
                      value={[formData.moisture]}
                      onValueChange={(value) => setFormData({ ...formData, moisture: value[0] })}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4" />
                        Temperature (°C)
                      </Label>
                      <span className="text-sm font-medium text-accent">{formData.temperature}°C</span>
                    </div>
                    <Slider
                      value={[formData.temperature]}
                      onValueChange={(value) => setFormData({ ...formData, temperature: value[0] })}
                      min={10}
                      max={45}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* IoT Data Info */}
            <div className="bg-accent/5 rounded-xl p-4 mb-8 border border-accent/20">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                IoT sensors connected. Soil parameters auto-updated every 30 minutes.
              </p>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full">
              <Search className="w-5 h-5" />
              Analyze & Get Recommendations
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default LandAnalysisForm;
