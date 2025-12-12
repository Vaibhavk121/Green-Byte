import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LandForm from "@/components/dashboard/LandForm";
import DashboardData from "@/components/dashboard/DashboardData";
import Chatbot from "@/components/dashboard/Chatbot";

export interface LandData {
  area: string;
  latitude: string;
  longitude: string;
  soilType: string;
}

const Dashboard = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [landData, setLandData] = useState<LandData | null>(null);

  const handleContinue = (data: LandData) => {
    setLandData(data);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {!showDashboard ? (
          <LandForm onContinue={handleContinue} />
        ) : (
          <DashboardData landData={landData!} />
        )}
      </main>

      <Chatbot />
    </div>
  );
};

export default Dashboard;
