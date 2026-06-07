"use client";
import React, { useEffect, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Building {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

export function CampusMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Coordinates for Bicol University Main Campus
  const buCenter = { lat: 13.1415, lng: 123.7317 };

  useEffect(() => {
    setIsMounted(true);
    // Zero-Cost Architecture: Fetch all bundled coordinates in 1 single read!
    const fetchBuildings = async () => {
      try {
        const mapDoc = await getDoc(doc(db, "mapData", "campusBuildings"));
        if (mapDoc.exists()) {
          const data = mapDoc.data();
          if (data.buildings && Array.isArray(data.buildings)) {
            setBuildings(data.buildings);
          }
        }
      } catch (e) {
        console.error("Error loading map coordinates", e);
      }
    };
    fetchBuildings();
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-outline p-6 text-center">
        <span className="material-symbols-outlined animate-spin text-[24px] text-primary">progress_activity</span>
        <p className="text-xs mt-1">Loading Campus Map...</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-outline p-6 text-center">
        <span className="material-symbols-outlined text-[48px] mb-2">map</span>
        <p className="font-semibold text-on-surface">Map configuration missing</p>
        <p className="text-sm">Please check your API Key.</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultZoom={17}
        defaultCenter={buCenter}
        mapId="DEMO_MAP_ID"
        disableDefaultUI={true}
        className="w-full h-full"
      >
        {/* Render bundled markers */}
        {buildings.map((b) => (
          <Marker 
            key={b.id} 
            position={{ lat: b.lat, lng: b.lng }} 
            title={b.name}
            onClick={() => {
               // Detail Sidebar trigger logic goes here (on-demand querying)
               console.log("Clicked building:", b.name);
            }} 
          />
        ))}
        {/* Fallback center marker if empty */}
        {buildings.length === 0 && (
           <Marker position={buCenter} title="Bicol University Center" />
        )}
      </Map>
    </APIProvider>
  );
}
