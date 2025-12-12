import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LandAnalysisForm from "@/components/LandAnalysisForm";
import CropRecommendations from "@/components/CropRecommendations";
import CropCalendar from "@/components/CropCalendar";
import YieldPrediction from "@/components/YieldPrediction";
import IoTDashboard from "@/components/IoTDashboard";
import Footer from "@/components/Footer";

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("June");

  const mockRecommendations = [
    {
      name: "Rice (Paddy)",
      score: 94,
      expectedYield: "4.2 t/ha",
      waterRequirement: "High",
      sowingWindow: "Jun - Jul",
      harvestWindow: "Oct - Nov",
      reasons: [
        "Optimal soil moisture (62%) for paddy cultivation",
        "pH level (6.8) ideal for rice growth",
        "High NDVI indicates good land fertility",
      ],
      image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop",
    },
    {
      name: "Maize",
      score: 87,
      expectedYield: "5.8 t/ha",
      waterRequirement: "Medium",
      sowingWindow: "Jun - Jul",
      harvestWindow: "Sep - Oct",
      reasons: [
        "Good nitrogen levels support maize growth",
        "Temperature range suitable for corn",
        "Moderate water requirement matches current moisture",
      ],
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop",
    },
    {
      name: "Soybean",
      score: 82,
      expectedYield: "2.4 t/ha",
      waterRequirement: "Medium",
      sowingWindow: "Jun - Jul",
      harvestWindow: "Sep - Oct",
      reasons: [
        "Legume crop improves soil nitrogen",
        "Suitable pH for soybean cultivation",
        "Good drainage conditions observed",
      ],
      image: "https://images.unsplash.com/photo-1599709822939-d5c6ea4ff8a8?w=400&h=300&fit=crop",
    },
  ];

  const mockYieldData = [
    { month: "2020", predicted: 3.8, historical: 3.5 },
    { month: "2021", predicted: 4.0, historical: 3.9 },
    { month: "2022", predicted: 4.1, historical: 4.0 },
    { month: "2023", predicted: 4.3, historical: 4.1 },
    { month: "2024", predicted: 4.5, historical: 4.2 },
    { month: "2025", predicted: 4.8, historical: 0 },
  ];

  const yieldFactors = [
    { name: "Soil Quality", impact: 15, positive: true },
    { name: "Water Availability", impact: 12, positive: true },
    { name: "NDVI Score", impact: 8, positive: true },
    { name: "Pest Risk", impact: 5, positive: false },
    { name: "Weather Variability", impact: 3, positive: false },
  ];

  const handleAnalyze = (data: any) => {
    setSelectedMonth(data.month || "June");
    setShowResults(true);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <LandAnalysisForm onAnalyze={handleAnalyze} />
      
      {showResults && (
        <>
          <CropRecommendations 
            recommendations={mockRecommendations} 
            selectedMonth={selectedMonth}
          />
          <YieldPrediction
            cropName="Rice (Paddy)"
            predictedYield={4.2}
            yieldUnit="t/ha"
            confidence={92}
            historicalData={mockYieldData}
            factors={yieldFactors}
          />
        </>
      )}
      
      <IoTDashboard />
      <CropCalendar />
      <Footer />
    </div>
  );
};

export default Index;
