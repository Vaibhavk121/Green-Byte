import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LandForm from "@/components/dashboard/LandForm";
import DashboardData from "@/components/dashboard/DashboardData";
import Chatbot, { PredictionData } from "@/components/dashboard/Chatbot";

export interface LandData {
  area: string;
  latitude: string;
  longitude: string;
  soilType: string;
}

const Dashboard = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [landData, setLandData] = useState<LandData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);

  const handleContinue = (data: LandData) => {
    console.log("LandForm completed with data:", data);
    setLandData(data);
    setShowDashboard(true);
  };

  const handleDataChange = (data: PredictionData | null) => {
    console.log("Dashboard: Prediction data received:", data);
    console.log("Dashboard: Data validation:", {
      exists: !!data,
      hasCrops: !!(data?.crops?.length),
      hasYieldData: !!(data?.yield_data?.length),
      hasClimateData: !!data?.climate_data,
      hasSoilInfo: !!data?.soil_info,
    });
    if (data) {
      setPredictionData(data);
    } else {
      console.warn("Dashboard: Received null data, keeping existing predictionData");
    }
  };

  useEffect(() => {
    console.log("Dashboard: Chatbot predictionData updated:", predictionData);
    console.log("Dashboard: Current predictionData state:", {
      isNull: predictionData === null,
      isUndefined: predictionData === undefined,
      hasData: !!predictionData,
      cropsCount: predictionData?.crops?.length || 0,
      yieldDataCount: predictionData?.yield_data?.length || 0,
    });
  }, [predictionData]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {!showDashboard ? (
          <LandForm onContinue={handleContinue} />
        ) : (
          <DashboardData landData={landData!} onDataChange={handleDataChange} />
        )}
      </main>

      <Chatbot predictionData={predictionData} />
    </div>
  );
};

export default Dashboard;
