import { ArrowRight, Satellite, Cpu, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8 animate-fade-in">
            <Satellite className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Powered by Satellite & IoT Data</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-foreground">Grow the </span>
            <span className="text-gradient-hero">Right Crop</span>
            <br />
            <span className="text-foreground">at the </span>
            <span className="text-gradient-hero">Right Time</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            AI-powered crop recommendation and yield prediction system. 
            Get personalized insights for your land based on real-time satellite imagery and IoT sensor data.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl">
              Analyze Your Land
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl">
              View Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card shadow-soft border border-border">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Satellite className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Satellite Data</p>
                <p className="text-sm text-muted-foreground">NDVI & vegetation indices</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card shadow-soft border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">IoT Sensors</p>
                <p className="text-sm text-muted-foreground">Real-time soil analysis</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card shadow-soft border border-border">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">AI Predictions</p>
                <p className="text-sm text-muted-foreground">95%+ accuracy rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
