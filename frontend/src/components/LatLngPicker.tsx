import React, { useState, useCallback } from "react";import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet's default icon paths (webpack / CRA / Vite friendly)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Props = {
  initialLat?: number;
  initialLng?: number;
  zoom?: number;
  onChange?: (lat: number, lng: number) => void;
};

export default function LatLngPicker({
  initialLat = 13.1172,
  initialLng = 77.6347,
  zoom = 13,
  onChange,
}: Props) {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);

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
    onChange?.(position.lat, position.lng);
  };

  const updateFromInputs = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    onChange?.(newLat, newLng);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col text-sm">
          <span className="mb-1">Latitude</span>
          <input
            value={lat}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!Number.isNaN(v)) updateFromInputs(v, lng);
              else setLat(Number.NaN);
            }}
            className="px-3 py-2 rounded border"
            type="number"
            step="any"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1">Longitude</span>
          <input
            value={lng}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!Number.isNaN(v)) updateFromInputs(lat, v);
              else setLng(Number.NaN);
            }}
            className="px-3 py-2 rounded border"
            type="number"
            step="any"
          />
        </label>
      </div>

      <div
        style={{ height: 400, width: "100%" }}
        className="rounded overflow-hidden border"
      >
        <MapContainer
          center={[lat, lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />

          {/* Update map center if inputs changed by user */}
          <Marker
            position={[lat, lng]}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />

          {/* Clicking on the map moves the marker */}
          <MapClickHandler
            onMapClick={(lat, lng) => {
              setLat(lat);
              setLng(lng);
              onChange?.(lat, lng);
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
