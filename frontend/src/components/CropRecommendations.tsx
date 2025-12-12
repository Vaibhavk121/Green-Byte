import { Check, Droplets, Sun, Calendar, TrendingUp, Star } from "lucide-react";
import { Progress } from "./ui/progress";

interface CropRecommendation {
  name: string;
  score: number;
  expectedYield: string;
  waterRequirement: string;
  sowingWindow: string;
  harvestWindow: string;
  reasons: string[];
  image: string;
}

interface CropRecommendationsProps {
  recommendations: CropRecommendation[];
  selectedMonth: string;
}

const CropRecommendations = ({ recommendations, selectedMonth }: CropRecommendationsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-accent";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-success/10 border-success/30";
    if (score >= 75) return "bg-accent/10 border-accent/30";
    if (score >= 60) return "bg-warning/10 border-warning/30";
    return "bg-muted border-border";
  };

  return (
    <section id="dashboard" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
            <Check className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Analysis Complete</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recommended Crops for Your Land
          </h2>
          <p className="text-muted-foreground">
            Based on your soil parameters, location, and selected month: <span className="font-semibold text-foreground">{selectedMonth}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {recommendations.map((crop, index) => (
            <div
              key={crop.name}
              className={`bg-card rounded-2xl shadow-card border overflow-hidden animate-scale-in ${
                index === 0 ? "ring-2 ring-success/30" : "border-border"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Crop Image */}
              <div className="h-40 bg-gradient-to-br from-accent/20 to-primary/20 relative overflow-hidden">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-success text-success-foreground rounded-full text-xs font-medium">
                    <Star className="w-3 h-3" />
                    Best Match
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full border text-sm font-bold ${getScoreBg(crop.score)} ${getScoreColor(crop.score)}`}>
                  {crop.score}%
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-foreground mb-2">{crop.name}</h3>
                
                {/* Suitability Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Suitability Score</span>
                    <span className={`font-medium ${getScoreColor(crop.score)}`}>{crop.score}%</span>
                  </div>
                  <Progress value={crop.score} className="h-2" />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Yield:</span>
                    <span className="font-medium text-foreground">{crop.expectedYield}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Droplets className="w-4 h-4 text-info" />
                    <span className="text-muted-foreground">Water:</span>
                    <span className="font-medium text-foreground">{crop.waterRequirement}</span>
                  </div>
                </div>

                {/* Growing Period */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Growing Period</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sowing: </span>
                      <span className="font-medium text-foreground">{crop.sowingWindow}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Harvest: </span>
                      <span className="font-medium text-foreground">{crop.harvestWindow}</span>
                    </div>
                  </div>
                </div>

                {/* Reasons */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Why this crop?</p>
                  <ul className="space-y-1">
                    {crop.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CropRecommendations;
