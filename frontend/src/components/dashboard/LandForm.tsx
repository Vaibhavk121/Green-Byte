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

// Fix leaflet's default icon paths (webpack / CRA / Vite friendly)
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
});

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
    const data = {
      area: formData.area,
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      soilType: formData.soilType,
    };
    onContinue(data);
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
                <Label>Location Coordinates</Label>
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
                className="rounded overflow-hidden  border "
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
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    placeholder="e.g., 17.385044"
                    value={lat}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) updateFromInputs(v, lng);
                      else setLat(Number.NaN);
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    placeholder="e.g., 78.486671"
                    value={lng}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) updateFromInputs(lat, v);
                      else setLng(Number.NaN);
                    }}
                    required
                  />
                </div>
              </div>
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

            <Button type="submit" className="w-full" size="lg">
              Continue to Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandForm;
