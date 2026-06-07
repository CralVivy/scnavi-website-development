"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import {
  FloorPlanCanvas,
  FloorPlanElement,
} from "@/components/ui/FloorPlanCanvas";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BuildingOption {
  id: string;
  name: string;
}

interface RoomStatus {
  status: "available" | "occupied" | "maintenance";
  note?: string;
  updatedAt?: string;
}

export default function AdminRoomManagementPage() {
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [floorId, setFloorId] = useState("ground");
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [floorName, setFloorName] = useState("Ground Floor");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomStatuses, setRoomStatuses] = useState<Record<string, RoomStatus>>({});
  const [saving, setSaving] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [statusValue, setStatusValue] = useState<RoomStatus["status"]>("available");

  // Load buildings
  useEffect(() => {
    const load = async () => {
      try {
        const mapDoc = await getDoc(doc(db, "mapData", "campusBuildings"));
        if (mapDoc.exists()) {
          const data = mapDoc.data();
          if (data.buildings) {
            setBuildings(data.buildings.map((b: any) => ({ id: b.id, name: b.name })));
            if (data.buildings.length > 0) setSelectedBuilding(data.buildings[0].id);
          }
        }
      } catch (e) {
        console.error("Error loading buildings", e);
      }
    };
    load();
  }, []);

  // Load floor plan elements when building/floor changes
  useEffect(() => {
    if (!selectedBuilding) return;
    const loadFloorPlan = async () => {
      try {
        const floorDoc = await getDoc(
          doc(db, "buildings", selectedBuilding, "floors", floorId)
        );
        if (floorDoc.exists()) {
          const data = floorDoc.data();
          if (data.elements) setElements(data.elements);
          if (data.floorName) setFloorName(data.floorName);
        } else {
          setElements([]);
          setFloorName("Ground Floor");
        }
      } catch (e) {
        console.error("Error loading floor plan", e);
        setElements([]);
      }
    };
    loadFloorPlan();
  }, [selectedBuilding, floorId]);

  // Load room statuses for the current building/floor
  useEffect(() => {
    if (!selectedBuilding) return;
    const statusDocRef = doc(db, "buildings", selectedBuilding, "roomStatuses", floorId);
    const unsub = onSnapshot(statusDocRef, (snap) => {
      if (snap.exists()) {
        setRoomStatuses(snap.data()?.rooms || {});
      } else {
        setRoomStatuses({});
      }
    });
    return () => unsub();
  }, [selectedBuilding, floorId]);

  // When a room is selected, pre-fill the status form
  useEffect(() => {
    if (selectedRoomId && roomStatuses[selectedRoomId]) {
      setStatusValue(roomStatuses[selectedRoomId].status);
      setStatusNote(roomStatuses[selectedRoomId].note || "");
    } else {
      setStatusValue("available");
      setStatusNote("");
    }
  }, [selectedRoomId, roomStatuses]);

  const selectedRoom = elements.find((el) => el.id === selectedRoomId);

  const handleSaveStatus = async () => {
    if (!selectedRoomId || !selectedBuilding) return;
    setSaving(true);
    try {
      const statusDocRef = doc(db, "buildings", selectedBuilding, "roomStatuses", floorId);
      const snap = await getDoc(statusDocRef);
      const updated: RoomStatus = {
        status: statusValue,
        note: statusNote,
        updatedAt: new Date().toISOString(),
      };
      if (snap.exists()) {
        await updateDoc(statusDocRef, { [`rooms.${selectedRoomId}`]: updated });
      } else {
        await setDoc(statusDocRef, { rooms: { [selectedRoomId]: updated } });
      }
    } catch (e) {
      console.error("Failed to save room status", e);
      alert("Failed to save. Check permissions.");
    } finally {
      setSaving(false);
    }
  };

  const rooms = elements.filter((el) => el.kind === "rect");
  const statusCounts = {
    available: rooms.filter((r) => (roomStatuses[r.id]?.status || "available") === "available").length,
    occupied: rooms.filter((r) => roomStatuses[r.id]?.status === "occupied").length,
    maintenance: rooms.filter((r) => roomStatuses[r.id]?.status === "maintenance").length,
  };

  const statusColors: Record<string, string> = {
    available: "text-room-green bg-room-green/10 border-room-green/20",
    occupied: "text-room-red bg-room-red/10 border-room-red/20",
    maintenance: "text-room-yellow bg-room-yellow/10 border-room-yellow/20",
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline font-semibold text-2xl text-on-surface">Room Management</h2>
          <p className="text-sm text-outline mt-0.5">View floor plans and manage room availability status.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedBuilding}
            onChange={(e) => { setSelectedBuilding(e.target.value); setSelectedRoomId(null); }}
            className="px-3 py-2 rounded-xl text-sm bg-surface-container border border-outline-variant/30 font-semibold"
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={floorId}
            onChange={(e) => { setFloorId(e.target.value); setSelectedRoomId(null); }}
            placeholder="Floor ID"
            className="px-3 py-2 rounded-xl text-sm bg-surface-container border border-outline-variant/30 w-28"
          />
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex items-center justify-between border border-room-green/20 bg-room-green/5">
          <div>
            <p className="text-xs text-room-green font-bold uppercase tracking-wider">Available</p>
            <p className="text-2xl font-bold text-room-green mt-1">{statusCounts.available}</p>
          </div>
          <span className="material-symbols-outlined text-room-green text-[28px]">check_circle</span>
        </Card>
        <Card className="flex items-center justify-between border border-room-red/20 bg-room-red/5">
          <div>
            <p className="text-xs text-room-red font-bold uppercase tracking-wider">Occupied</p>
            <p className="text-2xl font-bold text-room-red mt-1">{statusCounts.occupied}</p>
          </div>
          <span className="material-symbols-outlined text-room-red text-[28px]">meeting_room</span>
        </Card>
        <Card className="flex items-center justify-between border border-room-yellow/20 bg-room-yellow/5">
          <div>
            <p className="text-xs text-room-yellow font-bold uppercase tracking-wider">Maintenance</p>
            <p className="text-2xl font-bold text-room-yellow mt-1">{statusCounts.maintenance}</p>
          </div>
          <span className="material-symbols-outlined text-room-yellow text-[28px]">construction</span>
        </Card>
      </div>

      {/* Floor Plan + Room Panel */}
      <div className="flex gap-6">
        {/* Floor Plan Viewer */}
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden" style={{ height: "500px" }}>
          {selectedBuilding && elements.length > 0 ? (
            <FloorPlanCanvas
              elements={elements}
              selectedTool="select"
              selectedId={selectedRoomId}
              readOnly
              onElementSelected={(id) => setSelectedRoomId(id)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-outline gap-2">
              <span className="material-symbols-outlined text-[48px]">architecture</span>
              <p className="font-semibold text-on-surface">
                {selectedBuilding ? "No floor plan found" : "Select a building"}
              </p>
              <p className="text-sm text-outline max-w-xs text-center">
                {selectedBuilding
                  ? "Draw a floor plan in the Floor Plan Builder first."
                  : "Choose a building and floor from the dropdowns above."}
              </p>
            </div>
          )}
        </div>

        {/* Room Detail Panel */}
        <aside className="w-80 shrink-0">
          {selectedRoom ? (
            <Card className="border border-primary/20 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-on-surface text-base">
                  {selectedRoom.label || `Room ${selectedRoom.id.slice(-4)}`}
                </h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${statusColors[roomStatuses[selectedRoom.id]?.status || "available"]}`}>
                  {roomStatuses[selectedRoom.id]?.status || "available"}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-outline">Type</span>
                  <span className="text-on-surface font-medium capitalize">{selectedRoom.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Floor</span>
                  <span className="text-on-surface font-medium">{floorName}</span>
                </div>
              </div>

              <hr className="border-outline-variant/20" />

              {/* Status Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-outline uppercase tracking-wider block">Set Status</label>
                <div className="flex gap-2">
                  {(["available", "occupied", "maintenance"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusValue(s)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all capitalize ${
                        statusValue === s
                          ? statusColors[s] + " border-current"
                          : "bg-surface-container border-outline-variant/30 text-on-surface-variant"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-1">Note (optional)</label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Under renovation until July"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-surface-container/50 border border-outline-variant/30 focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving…" : "Save Status"}
                </button>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-outline-variant/40">
              <span className="material-symbols-outlined text-[40px] text-outline-variant">touch_app</span>
              <p className="text-sm font-medium text-on-surface">Select a room</p>
              <p className="text-xs text-outline max-w-[200px]">
                Click on a room in the floor plan to view details and manage its status.
              </p>
            </Card>
          )}

          {/* Room List */}
          {rooms.length > 0 && (
            <Card className="mt-4">
              <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3">
                All Rooms ({rooms.length})
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {rooms.map((el) => {
                  const st = roomStatuses[el.id]?.status || "available";
                  return (
                    <button
                      key={el.id}
                      onClick={() => setSelectedRoomId(el.id)}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                        selectedRoomId === el.id
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <span className="truncate">{el.label || `Room ${el.id.slice(-4)}`}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        st === "available" ? "bg-room-green" : st === "occupied" ? "bg-room-red" : "bg-room-yellow"
                      }`} />
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
