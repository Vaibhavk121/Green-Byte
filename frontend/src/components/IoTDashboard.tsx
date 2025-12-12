import { Thermometer, Droplets, Wind, Sun, Gauge, Leaf, Signal, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  status: "optimal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

const IoTDashboard = () => {
  const sensors: SensorData[] = [
    {
      id: "temp",
      name: "Soil Temperature",
      value: 28.5,
      unit: "°C",
      icon: <Thermometer className="w-5 h-5" />,
      status: "optimal",
      trend: "stable",
      lastUpdated: "2 min ago",
    },
    {
      id: "moisture",
      name: "Soil Moisture",
      value: 62,
      unit: "%",
      icon: <Droplets className="w-5 h-5" />,
      status: "optimal",
      trend: "down",
      lastUpdated: "2 min ago",
    },
    {
      id: "humidity",
      name: "Air Humidity",
      value: 75,
      unit: "%",
      icon: <Wind className="w-5 h-5" />,
      status: "warning",
      trend: "up",
      lastUpdated: "2 min ago",
    },
    {
      id: "light",
      name: "Light Intensity",
      value: 850,
      unit: "lux",
      icon: <Sun className="w-5 h-5" />,
      status: "optimal",
      trend: "up",
      lastUpdated: "2 min ago",
    },
    {
      id: "ph",
      name: "Soil pH",
      value: 6.8,
      unit: "",
      icon: <Gauge className="w-5 h-5" />,
      status: "optimal",
      trend: "stable",
      lastUpdated: "5 min ago",
    },
    {
      id: "ndvi",
      name: "NDVI Index",
      value: 0.72,
      unit: "",
      icon: <Leaf className="w-5 h-5" />,
      status: "optimal",
      trend: "up",
      lastUpdated: "1 hour ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "text-success bg-success/10 border-success/20";
      case "warning":
        return "text-warning bg-warning/10 border-warning/20";
      case "critical":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      default:
        return "→";
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Live IoT Sensor Data
            </h2>
            <p className="text-muted-foreground">
              Real-time monitoring from field sensors and satellite feeds
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-success">
              <Signal className="w-4 h-4" />
              <span>6 sensors online</span>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors.map((sensor, index) => (
            <div
              key={sensor.id}
              className="bg-card rounded-2xl shadow-card border border-border p-6 hover:shadow-elevated transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(sensor.status)}`}>
                  {sensor.icon}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(sensor.status)}`}>
                  {sensor.status}
                </div>
              </div>

              <h3 className="text-sm font-medium text-muted-foreground mb-2">{sensor.name}</h3>
              
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-foreground">{sensor.value}</span>
                <span className="text-lg text-muted-foreground mb-1">{sensor.unit}</span>
                <span className={`text-sm mb-1 ${
                  sensor.trend === "up" ? "text-success" : sensor.trend === "down" ? "text-warning" : "text-muted-foreground"
                }`}>
                  {getTrendIcon(sensor.trend)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated: {sensor.lastUpdated}</span>
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Satellite Data Section */}
        <div className="mt-12 bg-card rounded-2xl shadow-card border border-border p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Satellite Imagery Analysis</h3>
              <p className="text-sm text-muted-foreground">Last capture: Sentinel-2 • 4 hours ago</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">NDVI Score</p>
              <p className="text-2xl font-bold text-success">0.72</p>
              <p className="text-xs text-muted-foreground">Healthy vegetation</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Water Index</p>
              <p className="text-2xl font-bold text-info">0.45</p>
              <p className="text-xs text-muted-foreground">Adequate moisture</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Crop Health</p>
              <p className="text-2xl font-bold text-accent">Good</p>
              <p className="text-xs text-muted-foreground">No stress detected</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Growth Stage</p>
              <p className="text-2xl font-bold text-foreground">V6</p>
              <p className="text-xs text-muted-foreground">Vegetative phase</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IoTDashboard;
