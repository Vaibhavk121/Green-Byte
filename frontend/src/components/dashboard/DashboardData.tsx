import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LandData } from "@/pages/Dashboard";
import {
  Droplets,
  TrendingUp,
  Calendar,
  MapPin,
  Earth,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { PredictionData } from "./Chatbot";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type ApiResponse = PredictionData;


const COLORS = ["#60A5FA", "#34D399", "#F59E0B", "#F87171", "#A78BFA"];


interface DashboardDataProps {
  landData: LandData;
  onDataChange?: (data: ApiResponse | null) => void;
}

const soilLabels: Record<string, string> = {
  Loamy: "Alluvial Soil",
  black: "Black Cotton Soil",
  Silty: "Silty Soil",
  laterite: "Laterite Soil",
  sandy: "Sandy Soil",
  Clayey: "Clayey Soil",
};
const soilData = [
  {
    name: "Loamy",
    value: {
      waterRetention: "High",
      nutrientContent: "Rich",
      pH: 6.0,
      nitrogen: 45,
      phosphorus: 28,
      potassium: 180,
      organicMatter: 3.5,
      density: 1.35,
      drainage: "Well Drained",
      cec: 25,
      temperatureRange: "15-28",
      soilDepth: 75,
      conductivity: 0.45,
      bulkDensity: 1.3,
    },
    unit: "",
    icon: Droplets,
    status: "optimal",
  },
  {
    name: "Sandy",
    value: {
      waterRetention: "Low",
      nutrientContent: "Poor",
      pH: 7.5,
      nitrogen: 15,
      phosphorus: 8,
      potassium: 60,
      organicMatter: 1.2,
      density: 1.55,
      drainage: "Excessively Drained",
      cec: 8,
      temperatureRange: "16-32",
      soilDepth: 45,
      conductivity: 0.28,
      bulkDensity: 1.6,
    },
    unit: "",
    icon: Droplets,
    status: "poor",
  },
  {
    name: "Clayey",
    value: {
      waterRetention: "Very High",
      nutrientContent: "Moderate",
      pH: 5.5,
      nitrogen: 38,
      phosphorus: 15,
      potassium: 120,
      organicMatter: 2.8,
      density: 1.25,
      drainage: "Poorly Drained",
      cec: 35,
      temperatureRange: "12-26",
      soilDepth: 90,
      conductivity: 0.65,
      bulkDensity: 1.2,
    },
    unit: "",
    icon: Droplets,
    status: "moderate",
  },
  {
    name: "Silty",
    value: {
      waterRetention: "Moderate",
      nutrientContent: "Rich",
      pH: 6.5,
      nitrogen: 52,
      phosphorus: 32,
      potassium: 200,
      organicMatter: 4.2,
      density: 1.4,
      drainage: "Moderately Well Drained",
      cec: 28,
      temperatureRange: "14-29",
      soilDepth: 80,
      conductivity: 0.52,
      bulkDensity: 1.35,
    },
    unit: "",
    icon: Droplets,
    status: "optimal",
  },
] as const;

type Soil = (typeof soilData)[number];
const SAMPLE_DATA: ApiResponse = {
  crops: [
  { name: "Okra (Lady's Finger)", water_required_liters: 150000 },
  { name: "Bush Beans", water_required_liters: 175000 },
  { name: "Chilli Pepper", water_required_liters: 250000 },
  { name: "Tomato", water_required_liters: 300000 },
  { name: "Brinjal (Eggplant)", water_required_liters: 250000 },
  ],
  yield_data: [
  { crop_name: "Okra (Lady's Finger)", yield_amount: 700, market_rate_per_unit: 45, cost_of_selling: 31500, cost_of_growing: 4500, roi: 600.0 },
  { crop_name: "Bush Beans", yield_amount: 350, market_rate_per_unit: 60, cost_of_selling: 21000, cost_of_growing: 4000, roi: 425.0 },
  { crop_name: "Chilli Pepper", yield_amount: 500, market_rate_per_unit: 75, cost_of_selling: 37500, cost_of_growing: 6000, roi: 525.0 },
  { crop_name: "Tomato", yield_amount: 1500, market_rate_per_unit: 35, cost_of_selling: 52500, cost_of_growing: 7000, roi: 650.0 },
  { crop_name: "Brinjal (Eggplant)", yield_amount: 2000, market_rate_per_unit: 30, cost_of_selling: 60000, cost_of_growing: 6500, roi: 823.08 },
  ],
  crop_timeline: [
  { crop: "Okra (Lady's Finger)", season: "Year Round", suitable_months: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
  { crop: "Bush Beans", season: "Year Round", suitable_months: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
  { crop: "Chilli Pepper", season: "Year Round", suitable_months: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
  { crop: "Tomato", season: "Year Round", suitable_months: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
  { crop: "Brinjal (Eggplant)", season: "Year Round", suitable_months: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
  ],
  best_sowing_time: "Year-round, with consistent and adequate irrigation. Any month is suitable provided a reliable water supply is maintained to counter the zero rainfall and low soil moisture.",
  climate_data: { avg_temp: 28.53, avg_soil_moisture: 0.0457, avg_surface_temp: 29.3, total_rainfall: 0.0 },
  soil_info: { type: "Silty Soil", water_retention: "Unknown", nutrient_content: "Unknown", pH_level: 0 },
  };

const DashboardData = ({ landData, onDataChange }: DashboardDataProps) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const soil = useMemo(
    () => soilData.find((s) => s.name === landData.soilType) ?? soilData[0],
    [landData.soilType]
  ) as Soil;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Convert acres to square feet (1 acre = 43,560 sq ft)
        const areaInSqFt = parseFloat(landData.area) * 43560;
        
        const response = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            land_area: Math.round(areaInSqFt),
            latitude: parseFloat(landData.latitude),
            longitude: parseFloat(landData.longitude),
            soil_type: landData.soilType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch prediction data");
        }

        const result = await response.json();
        
        setData(result);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [landData]);

  // Notify parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(data);
    }
  }, [data, onDataChange]);

  const displayData = data;

  // transform yield data for charts
  const yieldChartData = useMemo(
    () =>
      (displayData?.yield_data ?? []).map((y) => ({
        name: y.crop_name,
        Yield: y.yield_amount,
      })),
    [displayData]
  );
  
  const waterChartData = useMemo(
    () =>
      (displayData?.crops ?? []).map((c) => ({
        name: c.name,
        Water: Math.round(c.water_required_liters / 1000),
      })),
    [displayData]
  );

  // pie breakdown of ROI (normalized)
  const roiPie = useMemo(
    () =>
      (displayData?.yield_data ?? []).map((y, i) => ({
        name: y.crop_name,
        value: Math.abs(y.roi),
        color: COLORS[i % COLORS.length],
      })),
    [displayData]
  );



  return (
    <div className="space-y-8" id="dashboard">
      {!loading && <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Your Land Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Area</p>
              <p className="text-xl font-semibold">{landData.area} acres</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Latitude</p>
              <p className="text-xl font-semibold">{landData.latitude}°</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longitude</p>
              <p className="text-xl font-semibold">{landData.longitude}°</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Soil Type</p>
              <p className="text-xl font-semibold">
                {soilLabels[landData.soilType]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Soil Properties and ROI Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Soil Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Earth className="w-6 h-6 text-primary" />
              Soil Properties
            </CardTitle>
            <CardDescription>Detailed soil analysis and nutrient composition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border p-4 shadow-sm bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {typeof soil.icon === "string" ? (
                    <div className="text-3xl">{soil.icon}</div>
                  ) : (
                    <soil.icon className="w-8 h-8 text-primary" />
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {soil.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {soil.value.nutrientContent} soil
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    soil.status === "optimal"
                      ? "default"
                      : soil.status === "moderate"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {soil.status}
                </Badge>
              </div>

              {/* Prominent metric: pH */}
              <div className="mb-4 pb-4 border-b border-border">
                <div className="text-3xl font-bold text-foreground">
                  {soil.value.pH}
                  <span className="text-base font-normal text-muted-foreground ml-2">
                    pH
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Water retention: {soil.value.waterRetention}
                </p>
              </div>

              {/* Other properties */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Nitrogen</div>
                  <div className="font-medium text-foreground">
                    {soil.value.nitrogen} mg/kg
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Phosphorus</div>
                  <div className="font-medium text-foreground">
                    {soil.value.phosphorus} mg/kg
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Potassium</div>
                  <div className="font-medium text-foreground">
                    {soil.value.potassium} mg/kg
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    Organic Matter
                  </div>
                  <div className="font-medium text-foreground">
                    {soil.value.organicMatter} %
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">CEC</div>
                  <div className="font-medium text-foreground">
                    {soil.value.cec} meq/100g
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Soil Depth</div>
                  <div className="font-medium text-foreground">
                    {soil.value.soilDepth} cm
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Distribution</CardTitle>
            <CardDescription>Return on investment by crop</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roiPie}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {roiPie.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Yield Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Expected Yield
            </CardTitle>
            <CardDescription>Predicted yield per crop (in kg)</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Yield" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Water Requirements Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" />
              Water Requirements
            </CardTitle>
            <CardDescription>Water needed per crop (in kiloliters)</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Water" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yield & Economics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Yield & Economics</CardTitle>
          <CardDescription>Detailed crop yield and financial analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase border-b">
                <tr>
                  <th className="p-3 font-medium">Crop</th>
                  <th className="p-3 font-medium">Yield (kg)</th>
                  <th className="p-3 font-medium">Market Rate (₹/kg)</th>
                  <th className="p-3 font-medium">Sell Value (₹)</th>
                  <th className="p-3 font-medium">Cost (₹)</th>
                  <th className="p-3 font-medium">ROI (%)</th>
                </tr>
              </thead>
              <tbody>
                {displayData.yield_data?.map((y) => (
                  <tr key={y.crop_name} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{y.crop_name}</td>
                    <td className="p-3">{y.yield_amount.toLocaleString()}</td>
                    <td className="p-3">₹{y.market_rate_per_unit}</td>
                    <td className="p-3">₹{y.cost_of_selling.toLocaleString()}</td>
                    <td className="p-3">₹{y.cost_of_growing.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge
                        variant={y.roi > 0 ? "default" : "destructive"}
                      >
                        {y.roi.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Water Requirements Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Water Requirements by Crop</CardTitle>
          <CardDescription>Total water needed for cultivation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayData.crops.map((c) => (
              <div
                key={c.name}
                className="p-4 rounded-lg bg-card border border-border text-center hover:shadow-md transition-shadow"
              >
                <div className="text-sm text-muted-foreground mb-2">{c.name}</div>
                <div className="mt-2 font-semibold text-xl text-primary">
                  {(c.water_required_liters / 1000).toLocaleString()} kL
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Water needed
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </>}

      {loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading prediction data...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Error: {error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Showing sample data instead
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardData;
