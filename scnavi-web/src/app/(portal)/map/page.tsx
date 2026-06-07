"use client";
import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FloorPlanCanvas, FloorPlanElement } from "@/components/ui/FloorPlanCanvas";

interface Room {
  id: string;
  name: string;
  capacity: number;
  type: string;
  status: "available" | "occupied" | "reserved";
}

interface Building {
  id: string;
  name: string;
  shortName?: string;
  lat: number;
  lng: number;
  type?: string;
  rooms?: Room[]; // Dynamically fetched
  floorPlanElements?: FloorPlanElement[]; // Dynamically fetched
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "bg-room-green/10 text-room-green border-room-green/20", dot: "bg-room-green" },
  occupied:  { label: "Occupied",  color: "bg-room-red/10 text-room-red border-room-red/20",     dot: "bg-room-red" },
  reserved:  { label: "Reserved",  color: "bg-room-yellow/10 text-room-yellow border-room-yellow/20", dot: "bg-room-yellow" },
  maintenance: { label: "Maintenance", color: "bg-slate-500/10 text-slate-500 border-slate-500/20", dot: "bg-slate-500" },
};

export default function MapPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const buCenter = { lat: 13.1415, lng: 123.7317 };
  
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [detailTab, setDetailTab] = useState<"rooms" | "floorplan">("rooms");
  const [floorPlanElements, setFloorPlanElements] = useState<FloorPlanElement[]>([]);

  // 1. Zero-Cost Map Architecture: Fetch all pins in one read
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

  // 2. On-Demand Room Loading: Only fetch rooms when a building is clicked
  const handleSelectBuilding = async (b: Building | null) => {
    setSelectedBuilding(b);
    if (!b) return;
    
    setDetailTab("rooms");
    
    // If already loaded, restore from cache
    if (b.rooms && b.floorPlanElements) {
      setFloorPlanElements(b.floorPlanElements);
      return;
    }

    setFloorPlanElements([]);

    setLoadingRooms(true);
    try {
      // 1. Load floor plan elements
      let floorElements: FloorPlanElement[] = [];
      try {
        const fpDoc = await getDoc(doc(db, "buildings", b.id, "floors", "ground"));
        if (fpDoc.exists() && fpDoc.data().elements) {
          floorElements = fpDoc.data().elements;
          setFloorPlanElements(floorElements);
        }
      } catch { /* no floor plan yet */ }

      // 2. Load room statuses
      let statuses: Record<string, any> = {};
      try {
        const statusDoc = await getDoc(doc(db, "buildings", b.id, "roomStatuses", "ground"));
        if (statusDoc.exists() && statusDoc.data().rooms) {
          statuses = statusDoc.data().rooms;
        }
      } catch { /* no statuses yet */ }

      // 3. Construct rooms list from SVG rects
      const roomsList: Room[] = floorElements
        .filter(el => el.kind === "rect")
        .map(el => ({
          id: el.id,
          name: el.label || `Room ${el.id.slice(-4)}`,
          capacity: 30, // Default assumed capacity
          type: el.roomType || "classroom",
          status: statuses[el.id]?.status || "available"
        }));

      const updated = { ...b, rooms: roomsList, floorPlanElements: floorElements };
      setBuildings(prev => prev.map(pb => pb.id === b.id ? updated : pb));
      setSelectedBuilding(updated);
    } catch (e) {
      console.error("Failed to load rooms", e);
    } finally {
      setLoadingRooms(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-[64px] text-outline-variant">map</span>
        <p className="font-semibold text-on-surface mt-3">Map configuration missing</p>
        <p className="text-sm text-outline mt-1">Please check your Google Maps API Key.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-0 -m-4 md:-m-6 lg:-m-8 animate-fade">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-surface-container-lowest border-b border-outline-variant/20 shrink-0">
        <div>
          <h2 className="font-headline font-semibold text-xl text-on-surface">Campus Map & Rooms</h2>
          <p className="text-xs text-outline">Click a building to view rooms</p>
        </div>
        <div className="flex bg-surface-container rounded-xl p-1 gap-1">
          {(["map", "list"] as const).map((v) => (
            <button key={v} onClick={() => setViewMode(v)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${viewMode === v ? "bg-surface-container-lowest shadow text-on-surface" : "text-outline hover:text-on-surface"}`}>
              <span className="material-symbols-outlined text-[16px]">{v === "map" ? "map" : "view_list"}</span>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map Panel */}
        {viewMode === "map" && (
          <div className="flex-1 relative">
            <APIProvider apiKey={apiKey}>
              <Map
                defaultZoom={17}
                defaultCenter={buCenter}
                mapId="DEMO_MAP_ID"
                className="w-full h-full"
                gestureHandling="greedy"
              >
                {buildings.map((b) => (
                  <AdvancedMarker
                    key={b.id}
                    position={{ lat: b.lat, lng: b.lng }}
                    title={b.name}
                    onClick={() => handleSelectBuilding(b)}
                  >
                    <Pin
                      background={selectedBuilding?.id === b.id ? "#0A84FF" : "#FF9500"}
                      glyphColor="white"
                      borderColor={selectedBuilding?.id === b.id ? "#005db8" : "#cc7800"}
                      scale={selectedBuilding?.id === b.id ? 1.4 : 1.0}
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/20 rounded-xl px-3 py-2 shadow-md flex gap-3">
              <span className="flex items-center gap-1.5 text-xs text-on-surface font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />Building
              </span>
              <span className="flex items-center gap-1.5 text-xs text-on-surface font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />Selected
              </span>
            </div>
          </div>
        )}

        {/* List mode: all buildings side by side */}
        {viewMode === "list" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBuilding(selectedBuilding?.id === b.id ? null as any : b)}
                className={`text-left rounded-2xl border p-4 transition-all hover:shadow-md ${
                  selectedBuilding?.id === b.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined ms-fill text-primary text-[22px]">apartment</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm leading-tight">{b.name}</p>
                    <p className="text-xs text-outline">{b.rooms ? b.rooms.length : '?'} rooms</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Room Detail Panel */}
        {selectedBuilding && (
          <>
            {/* Mobile Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade" 
              onClick={() => setSelectedBuilding(null)}
            />
            <aside className="w-full md:w-80 xl:w-96 bg-surface-container-lowest border-t md:border-t-0 md:border-l border-outline-variant/20 flex flex-col overflow-hidden fixed md:relative bottom-0 left-0 right-0 top-[30%] md:top-auto md:bottom-auto md:left-auto md:right-auto z-50 md:z-10 shadow-2xl md:shadow-none rounded-t-[28px] md:rounded-t-none animate-slide-in md:animate-none">
              <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container">
                <div>
                  <p className="font-bold text-on-surface text-sm">{selectedBuilding.name}</p>
                  <p className="text-xs text-outline">{selectedBuilding.rooms?.length || 0} rooms total</p>
                </div>
                <button onClick={() => setSelectedBuilding(null)} className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-outline">close</span>
                </button>
              </div>

              {/* Tab switcher */}
              <div className="flex border-b border-outline-variant/20">
                {(["rooms", "floorplan"] as const).map((tab) => (
                  <button key={tab} onClick={() => setDetailTab(tab)} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${detailTab === tab ? "text-primary border-b-2 border-primary" : "text-outline hover:text-on-surface"}`}>
                    {tab === "rooms" ? "Rooms" : "Floor Plan"}
                  </button>
                ))}
              </div>

              {loadingRooms ? (
                 <div className="p-10 flex justify-center"><span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span></div>
              ) : detailTab === "rooms" ? (
                <>
                  {/* Status summary */}
                  <div className="grid grid-cols-3 gap-2 p-4 border-b border-outline-variant/20">
                    {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                      const count = (selectedBuilding.rooms || []).filter((r) => r.status === status).length;
                      return (
                        <div key={status} className={`rounded-xl border p-2.5 text-center ${cfg.color}`}>
                          <p className="text-xl font-black">{count}</p>
                          <p className="text-[11px] font-bold">{cfg.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Room list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {(selectedBuilding.rooms || []).length === 0 && (
                       <div className="text-center text-outline text-sm mt-4">No rooms available for this building.</div>
                    )}
                    {(selectedBuilding.rooms || []).map((room) => {
                      const cfg = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
                      return (
                        <div key={room.id} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container/50 transition-all cursor-pointer">
                          <div className="relative w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">meeting_room</span>
                            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-container-lowest ${cfg.dot}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-on-surface">{room.name}</p>
                            <p className="text-xs text-outline">{room.type} · {room.capacity} seats</p>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Floor Plan Tab */
                <div className="flex-1 relative">
                  {floorPlanElements.length > 0 ? (
                    <FloorPlanCanvas
                      elements={floorPlanElements}
                      selectedTool="select"
                      selectedId={null}
                      readOnly={true}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-outline p-4 text-center">
                      <span className="material-symbols-outlined text-[40px] mb-2">floor</span>
                      <p className="text-sm font-medium">No floor plan available</p>
                      <p className="text-xs mt-1">Admin has not drawn a floor plan for this building yet.</p>
                    </div>
                  )}
                </div>
              )}
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
