import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LandData } from "@/pages/Dashboard";

import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "../../../public/placeholder.svg";
import markerIcon from "../../../public/pin.jpg";
import markerShadow from "../../../public/placeholder.svg";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import locationsData from "/data.json";

// Fix leaflet's default icon paths (webpack / CRA / Vite friendly)
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
});

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to find matching location from data.json
function findMatchingLocation(latitude: number, longitude: number) {
  let closestLocation = null;
  let minDistance = Infinity;

  locationsData.forEach((location: any) => {
    // Parse latitude and longitude from data.json format (e.g., "13.1362 N", "78.1251 E")
    const latStr = location.latitude.replace(/[^\d.-]/g, "");
    const lngStr = location.longitude.replace(/[^\d.-]/g, "");

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const distance = calculateDistance(latitude, longitude, lat, lng);

    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = { location, distance };
    }
  });

  return closestLocation;
}

interface LandFormProps {
  onContinue: (data: LandData) => void;
}

const soilTypes = [
  { value: "Loamy", label: "Loamy Soil" },
  { value: "Sandy", label: "Sandy Soil" },
  { value: "Clayey", label: "Clayey Soil" },
  { value: "laterite", label: "Laterite Soil" },
  { value: "Silty", label: "Silty Soil" },
];

const LandForm = ({ onContinue }: LandFormProps) => {
  const [formData, setFormData] = useState<LandData>({
    area: "",
    latitude: "",
    longitude: "",
    soilType: "",
  });
  const [lat, setLat] = useState<number>(13.1172);
  const [lng, setLng] = useState<number>(77.6347);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationMode, setLocationMode] = useState<"map" | "manual">("map");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const { toast } = useToast();

  function MapClickHandler({
    onMapClick,
  }: {
    onMapClick: (lat: number, lng: number) => void;
  }) {
    useMapEvents({
      click(e) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleMarkerDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setLat(position.lat);
    setLng(position.lng);
  };

  const updateFromInputs = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  };

  const handleGetLocation = () => {
    setIsGettingLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setIsGettingLocation(false);
          toast({
            title: "Location obtained!",
            description: "Your coordinates have been captured.",
          });
        },
        (error) => {
          setIsGettingLocation(false);
          // Fallback to dummy coordinates
          setFormData({
            ...formData,
            latitude: "17.385044",
            longitude: "78.486671",
          });
          toast({
            title: "Using demo location",
            description:
              "Could not get your location, using Hyderabad coordinates.",
            variant: "destructive",
          });
        },
        { timeout: 10000 }
      );
    } else {
      setIsGettingLocation(false);
      // Fallback to dummy coordinates
      setFormData({
        ...formData,
        latitude: "17.385044",
        longitude: "78.486671",
      });
      toast({
        title: "Using demo location",
        description: "Geolocation not supported, using Hyderabad coordinates.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.area || !formData.soilType) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate coordinates based on mode
    let finalLat: number;
    let finalLng: number;

    if (locationMode === "manual") {
      if (!manualLat || !manualLng) {
        toast({
          title: "Missing coordinates",
          description: "Please enter both latitude and longitude.",
          variant: "destructive",
        });
        return;
      }
      finalLat = parseFloat(manualLat);
      finalLng = parseFloat(manualLng);

      if (isNaN(finalLat) || isNaN(finalLng)) {
        toast({
          title: "Invalid coordinates",
          description: "Please enter valid latitude and longitude numbers.",
          variant: "destructive",
        });
        return;
      }
    } else {
      finalLat = lat;
      finalLng = lng;
    }

    setIsLoading(true);

    // Simulate API call with 5-10 seconds loading time
    const loadingTime = Math.random() * 5000 + 5000; // 5-10 seconds

    setTimeout(() => {
      try {
        // Match coordinates with data.json
        const match = findMatchingLocation(finalLat, finalLng);

        if (match && match.distance < 100) {
          // Match found within 100km
          const data = {
            area: formData.area,
            latitude: finalLat.toFixed(4),
            longitude: finalLng.toFixed(4),
            soilType: formData.soilType,
            locationName: match.location.name,
            zone: match.location.zone,
            crops: match.location.crops,
            distance: match.distance.toFixed(2),
          };
          toast({
            title: "Location Matched!",
            description: `Found matching location: ${match.location.name} (${match.distance.toFixed(2)} km away)`,
          });
          onContinue(data);
        } else {
          // No match found within reasonable distance
          toast({
            title: "No matching location",
            description:
              "Could not find a matching location in our database. Using default data.",
            variant: "destructive",
          });
          const data = {
            area: formData.area,
            latitude: finalLat.toFixed(4),
            longitude: finalLng.toFixed(4),
            soilType: formData.soilType,
          };
          onContinue(data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process location data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, loadingTime);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Analyze Your Land
        </h1>
        <p className="text-muted-foreground">
          Enter your land details to get personalized crop recommendations
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Land Information</CardTitle>
          <CardDescription>
            Provide details about your agricultural land
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Area Input */}
            <div className="space-y-2">
              <Label htmlFor="area">Area of Yard (in acres)</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                placeholder="e.g., 2.5"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                required
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4 pb-10">
              <div className="flex items-center justify-between">
                <Label>Location Entry Method</Label>
              </div>
              
              {/* Location Mode Selector */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={locationMode === "map" ? "default" : "outline"}
                  onClick={() => setLocationMode("map")}
                  className="w-full"
                >
                  📍 Load from Map
                </Button>
                <Button
                  type="button"
                  variant={locationMode === "manual" ? "default" : "outline"}
                  onClick={() => setLocationMode("manual")}
                  className="w-full"
                >
                  ✏️ Enter Manually
                </Button>
              </div>

              {/* Map Mode */}
              {locationMode === "map" && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Location Coordinates (Map)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Get My Location
                        </>
                      )}
                    </Button>
                  </div>
                  <div
                    style={{ height: 300, width: "100%" }}
                    className="rounded overflow-hidden border"
                  >
                    <MapContainer
                      center={[lat, lng]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                      />

                      <Marker
                        position={[lat, lng]}
                        eventHandlers={{
                          dragend: handleMarkerDragEnd,
                        }}
                        draggable={true}
                      />

                      <MapClickHandler
                        onMapClick={(lat, lng) => {
                          setLat(lat);
                          setLng(lng);
                        }}
                      />
                    </MapContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude (Map)</Label>
                      <Input
                        id="latitude"
                        placeholder="e.g., 13.1362"
                        value={lat}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!Number.isNaN(v)) setLat(v);
                        }}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude (Map)</Label>
                      <Input
                        id="longitude"
                        placeholder="e.g., 78.1251"
                        value={lng}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!Number.isNaN(v)) setLng(v);
                        }}
                        disabled
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Manual Entry Mode */}
              {locationMode === "manual" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your coordinates manually. They will be matched with our database.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-latitude">Latitude</Label>
                      <Input
                        id="manual-latitude"
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 13.1362"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-longitude">Longitude</Label>
                      <Input
                        id="manual-longitude"
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 78.1251"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Soil Type */}
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type</Label>
              <Select
                value={formData.soilType}
                onValueChange={(value) =>
                  setFormData({ ...formData, soilType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent side="bottom" position="popper">
                  {soilTypes.map((soil) => (
                    <SelectItem key={soil.value} value={soil.value}>
                      {soil.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Location...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandForm;
