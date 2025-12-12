import { Leaf, Satellite } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28,
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} relative bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft`}
      >
        <Leaf className="text-primary-foreground" size={iconSizes[size]} />
        <Satellite
          className="text-primary-foreground/80 absolute -top-1 -right-1"
          size={iconSizes[size] * 0.5}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold text-foreground leading-tight`}>
            AgriYield
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Smart Crop Advisor
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
