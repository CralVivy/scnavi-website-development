"use client";
import React, { useState, useEffect } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Building {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

export default function AdminMapEditor() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [newMarker, setNewMarker] = useState<{lat: number, lng: number} | null>(null);
  const [buildingName, setBuildingName] = useState("");
  const [saving, setSaving] = useState(false);
  const buCenter = { lat: 13.1415, lng: 123.7317 };

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const mapDoc = await getDoc(doc(db, "mapData", "campusBuildings"));
        if (mapDoc.exists()) {
          const data = mapDoc.data();
          if (data.buildings) setBuildings(data.buildings);
        }
      } catch (e) {
        console.error("Error loading map coordinates", e);
      }
    };
    fetchBuildings();
  }, []);

  const handleMapClick = (e: any) => {
    if (e.detail.latLng) {
      setNewMarker({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
    }
  };

  const saveBuilding = async () => {
    if (!newMarker || !buildingName.trim()) return;
    setSaving(true);
    
    const newBuilding = {
      id: Date.now().toString(),
      name: buildingName.trim(),
      lat: newMarker.lat,
      lng: newMarker.lng,
      type: "academic"
    };

    try {
      const docRef = doc(db, "mapData", "campusBuildings");
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, { buildings: [newBuilding] });
      } else {
        await updateDoc(docRef, {
          buildings: arrayUnion(newBuilding)
        });
      }
      setBuildings([...buildings, newBuilding]);
      setNewMarker(null);
      setBuildingName("");
    } catch (e) {
      console.error(e);
      alert("Failed to save building");
    } finally {
      setSaving(false);
    }
  };

  if (!apiKey) return <div className="p-6">Map API Key missing.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[500px] bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm animate-fade">
      <div className="p-5 border-b border-outline-variant/30 bg-surface-container/30 flex justify-between items-center">
        <div>
          <h2 className="font-headline font-semibold text-xl text-on-surface">Campus Map Editor</h2>
          <p className="text-sm text-outline">Click anywhere on the map to drop a pin and add a building.</p>
        </div>
        
        {newMarker && (
          <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-outline-variant/30">
            <input 
              type="text" 
              placeholder="Building Name..." 
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-surface-container/50 border-none outline-none focus:ring-1 focus:ring-primary w-48"
            />
            <button 
              onClick={saveBuilding} 
              disabled={saving || !buildingName.trim()}
              className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Pin"}
            </button>
            <button 
              onClick={() => setNewMarker(null)} 
              className="p-1.5 text-outline hover:text-room-red rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultZoom={17}
            defaultCenter={buCenter}
            mapId="ADMIN_MAP_ID"
            disableDefaultUI={true}
            onClick={handleMapClick}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            {buildings.map((b) => (
              <Marker key={b.id} position={{ lat: b.lat, lng: b.lng }} title={b.name} />
            ))}
            {newMarker && (
              <Marker position={newMarker} />
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
