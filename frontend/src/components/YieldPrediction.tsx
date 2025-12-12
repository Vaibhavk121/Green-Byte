import { TrendingUp, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface YieldData {
  month: string;
  predicted: number;
  historical: number;
}

interface YieldPredictionProps {
  cropName: string;
  predictedYield: number;
  yieldUnit: string;
  confidence: number;
  historicalData: YieldData[];
  factors: { name: string; impact: number; positive: boolean }[];
}

const YieldPrediction = ({
  cropName,
  predictedYield,
  yieldUnit,
  confidence,
  historicalData,
  factors,
}: YieldPredictionProps) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Yield Prediction for {cropName}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered yield forecast based on satellite imagery, IoT sensor data, and historical patterns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Main Prediction Card */}
          <div className="lg:col-span-2 bg-card rounded-2xl shadow-card border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Predicted vs Historical Yield</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Predicted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/40" />
                  <span className="text-muted-foreground">Historical</span>
                </div>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="historical"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorHistorical)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--accent))"
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            {/* Predicted Yield */}
            <div className="bg-gradient-hero rounded-2xl p-6 text-primary-foreground">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Predicted Yield</span>
              </div>
              <div className="text-4xl font-bold mb-1">
                {predictedYield.toFixed(1)} <span className="text-xl font-normal opacity-80">{yieldUnit}</span>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <ArrowUpRight className="w-4 h-4" />
                <span>12% above regional average</span>
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-card rounded-2xl shadow-card border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-foreground">Prediction Confidence</span>
                <span className="text-2xl font-bold text-accent">{confidence}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-1000"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Based on 5 years of historical data
              </p>
            </div>

            {/* Impact Factors */}
            <div className="bg-card rounded-2xl shadow-card border border-border p-6">
              <h4 className="font-medium text-foreground mb-4">Key Impact Factors</h4>
              <div className="space-y-3">
                {factors.map((factor) => (
                  <div key={factor.name} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{factor.name}</span>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      factor.positive ? "text-success" : "text-destructive"
                    }`}>
                      {factor.positive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {factor.impact}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YieldPrediction;
