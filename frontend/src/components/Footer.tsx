import Logo from "./Logo";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold">AgriYield</span>
                <p className="text-xs text-background/60">Smart Crop Advisor</p>
              </div>
            </div>
            <p className="text-background/70 max-w-md mb-6">
              Empowering farmers with AI-driven insights for better crop decisions. 
              Leveraging satellite imagery and IoT data for precise yield predictions.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-accent transition-colors">Crop Recommendation</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Yield Prediction</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Crop Calendar</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">IoT Dashboard</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Satellite Analysis</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-background/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@agriyield.com" className="hover:text-accent transition-colors">
                  contact@agriyield.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Agricultural Research Center,<br />Bangalore, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © 2024 AgriYield. All rights reserved. Developed by Sairam V
          </p>
          <div className="flex items-center gap-6 text-sm text-background/50">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">API Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
