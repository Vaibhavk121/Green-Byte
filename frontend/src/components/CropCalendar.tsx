import { useState } from "react";
import { ChevronLeft, ChevronRight, Sprout, Sun, Droplets, Scissors } from "lucide-react";
import { Button } from "./ui/button";

interface CropSeason {
  crop: string;
  sowStart: number;
  sowEnd: number;
  harvestStart: number;
  harvestEnd: number;
  color: string;
  season: string;
}

const CropCalendar = () => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const cropSeasons: CropSeason[] = [
    { crop: "Rice (Paddy)", sowStart: 5, sowEnd: 6, harvestStart: 10, harvestEnd: 11, color: "bg-accent", season: "Kharif" },
    { crop: "Wheat", sowStart: 10, sowEnd: 11, harvestStart: 2, harvestEnd: 3, color: "bg-warning", season: "Rabi" },
    { crop: "Maize", sowStart: 5, sowEnd: 6, harvestStart: 8, harvestEnd: 9, color: "bg-success", season: "Kharif" },
    { crop: "Cotton", sowStart: 4, sowEnd: 5, harvestStart: 10, harvestEnd: 11, color: "bg-primary", season: "Kharif" },
    { crop: "Groundnut", sowStart: 5, sowEnd: 6, harvestStart: 9, harvestEnd: 10, color: "bg-secondary-foreground", season: "Kharif" },
    { crop: "Soybean", sowStart: 5, sowEnd: 6, harvestStart: 9, harvestEnd: 10, color: "bg-info", season: "Kharif" },
    { crop: "Mustard", sowStart: 9, sowEnd: 10, harvestStart: 1, harvestEnd: 2, color: "bg-warning", season: "Rabi" },
    { crop: "Sugarcane", sowStart: 1, sowEnd: 2, harvestStart: 11, harvestEnd: 0, color: "bg-accent", season: "Annual" },
  ];

  const isInRange = (month: number, start: number, end: number) => {
    if (start <= end) {
      return month >= start && month <= end;
    }
    return month >= start || month <= end;
  };

  const getMonthStatus = (crop: CropSeason, monthIndex: number) => {
    const isSowing = isInRange(monthIndex, crop.sowStart, crop.sowEnd);
    const isHarvest = isInRange(monthIndex, crop.harvestStart, crop.harvestEnd);
    
    if (isSowing) return "sowing";
    if (isHarvest) return "harvest";
    
    // Check if it's growing period (between sow end and harvest start)
    if (crop.sowEnd < crop.harvestStart) {
      if (monthIndex > crop.sowEnd && monthIndex < crop.harvestStart) return "growing";
    }
    
    return null;
  };

  return (
    <section id="calendar" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Indian Crop Calendar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plan your farming activities with our comprehensive crop calendar. 
            Know the best time to sow and harvest each crop in your region.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent/60" />
            <span className="text-sm text-muted-foreground">Sowing Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/60" />
            <span className="text-sm text-muted-foreground">Growing Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/60" />
            <span className="text-sm text-muted-foreground">Harvest Period</span>
          </div>
        </div>

        {/* Season Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Button variant={selectedCrop === null ? "hero" : "outline"} size="sm" onClick={() => setSelectedCrop(null)}>
            All Crops
          </Button>
          <Button variant="outline" size="sm">
            <Sun className="w-4 h-4 mr-1" />
            Kharif (Jun-Oct)
          </Button>
          <Button variant="outline" size="sm">
            <Droplets className="w-4 h-4 mr-1" />
            Rabi (Oct-Mar)
          </Button>
          <Button variant="outline" size="sm">
            <Sprout className="w-4 h-4 mr-1" />
            Zaid (Mar-Jun)
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-13 gap-px bg-muted">
            <div className="p-4 bg-card font-semibold text-foreground">Crop</div>
            {months.map((month) => (
              <div key={month} className="p-4 bg-card text-center font-medium text-muted-foreground text-sm">
                {month}
              </div>
            ))}
          </div>

          {/* Rows */}
          {cropSeasons.map((crop) => (
            <div
              key={crop.crop}
              className="grid grid-cols-13 gap-px bg-muted hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => setSelectedCrop(crop.crop === selectedCrop ? null : crop.crop)}
            >
              <div className="p-4 bg-card flex items-center gap-2">
                <Sprout className={`w-4 h-4 ${crop.color.replace("bg-", "text-")}`} />
                <span className="font-medium text-foreground text-sm">{crop.crop}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {crop.season}
                </span>
              </div>
              {months.map((_, monthIndex) => {
                const status = getMonthStatus(crop, monthIndex);
                return (
                  <div
                    key={monthIndex}
                    className={`p-4 bg-card flex items-center justify-center ${
                      status === "sowing"
                        ? "bg-accent/20"
                        : status === "harvest"
                        ? "bg-warning/20"
                        : status === "growing"
                        ? "bg-success/10"
                        : ""
                    }`}
                  >
                    {status === "sowing" && <Sprout className="w-4 h-4 text-accent" />}
                    {status === "harvest" && <Scissors className="w-4 h-4 text-warning" />}
                    {status === "growing" && <div className="w-2 h-2 rounded-full bg-success/40" />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Selected Crop Details */}
        {selectedCrop && (
          <div className="mt-8 bg-card rounded-xl shadow-soft border border-border p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-foreground mb-4">
              {selectedCrop} - Detailed Growing Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Sprout className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Sowing Tips</p>
                  <p className="text-sm text-muted-foreground">
                    Plant seeds 2-3 inches deep. Maintain consistent moisture during germination.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Water Requirements</p>
                  <p className="text-sm text-muted-foreground">
                    Regular irrigation needed. Reduce watering 2 weeks before harvest.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <Scissors className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Harvest Indicators</p>
                  <p className="text-sm text-muted-foreground">
                    Leaves turn yellow, moisture content drops to 14-16%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CropCalendar;
