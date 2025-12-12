import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Leaf, BarChart3, Satellite, Cloud, Cpu, TrendingUp } from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Satellite,
      title: "Satellite Analysis",
      description: "Real-time NDVI and vegetation health monitoring from satellite imagery",
    },
    {
      icon: Cpu,
      title: "IoT Integration",
      description: "Connect your soil sensors for accurate moisture, pH, and nutrient readings",
    },
    {
      icon: BarChart3,
      title: "Yield Prediction",
      description: "ML-powered yield forecasting with 92% accuracy based on historical data",
    },
    {
      icon: Leaf,
      title: "Crop Recommendations",
      description: "Get personalized crop suggestions based on your land and climate conditions",
    },
    {
      icon: Cloud,
      title: "Weather Integration",
      description: "Real-time weather data and forecasts for optimal planting decisions",
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Current market prices and demand trends for profitable crop selection",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Link to="/auth">
            <Button variant="default">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Satellite className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Smart Farming</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Grow the Right Crop at the{" "}
            <span className="text-primary">Right Time</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Leverage satellite imagery, IoT sensors, and machine learning to maximize 
            your farm's yield. Get personalized crop recommendations based on your 
            land's unique characteristics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Start Free Analysis
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Farmers Trust Us</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">92%</div>
              <div className="text-muted-foreground">Prediction Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">30%</div>
              <div className="text-muted-foreground">Yield Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-muted-foreground">Crop Varieties</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Smart Farming
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with agricultural expertise
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of farmers who are already using GreenBytes to optimize their harvests
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-muted-foreground text-sm">
            © 2025 GreenBytes. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
