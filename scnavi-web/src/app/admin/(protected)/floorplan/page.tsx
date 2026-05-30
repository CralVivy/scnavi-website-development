"use client";
import React, { useState, useEffect } from "react";
import {
  FloorPlanCanvas,
  FloorPlanElement,
  BuilderTool,
  RoomType,
} from "@/components/ui/FloorPlanCanvas";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const TOOLS: { id: BuilderTool; label: string; icon: string }[] = [
  { id: "select", label: "Select", icon: "arrow_selector_tool" },
  { id: "draw_room", label: "Room", icon: "rectangle" },
  { id: "draw_wall", label: "Wall", icon: "pen_size_3" },
  { id: "draw_door", label: "Door Arc", icon: "door_open" },
  { id: "erase", label: "Erase", icon: "delete" },
];

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "classroom", label: "Classroom" },
  { value: "lab", label: "Laboratory" },
  { value: "office", label: "Office" },
  { value: "hallway", label: "Hallway" },
  { value: "stairway", label: "Stairway" },
  { value: "facility", label: "Facility" },
];

interface BuildingOption {
  id: string;
  name: string;
}

export default function FloorPlanBuilderPage() {
  // ── State ────────────────────────────────────────────
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<BuilderTool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Building / floor selection
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [floorId, setFloorId] = useState("ground");
  const [floorName, setFloorName] = useState("Ground Floor");

  // Load available buildings from mapData
  useEffect(() => {
    const load = async () => {
      try {
        const mapDoc = await getDoc(doc(db, "mapData", "campusBuildings"));
        if (mapDoc.exists()) {
          const data = mapDoc.data();
          if (data.buildings) {
            setBuildings(
              data.buildings.map((b: any) => ({ id: b.id, name: b.name }))
            );
            if (data.buildings.length > 0) {
              setSelectedBuilding(data.buildings[0].id);
            }
          }
        }
      } catch (e) {
        console.error("Error loading buildings", e);
      }
    };
    load();
  }, []);

  // Load existing floor plan when building or floor changes
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
        }
      } catch (e) {
        console.error("Error loading floor plan", e);
        setElements([]);
      }
    };
    loadFloorPlan();
  }, [selectedBuilding, floorId]);

  // ── Handlers ─────────────────────────────────────────
  const handleAddElement = (el: FloorPlanElement) => {
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const handleMoveElement = (id: string, x: number, y: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    if (!selectedBuilding) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Save compressed elements to Firestore
      const compressed = elements.map((el) => ({
        ...el,
        x: parseFloat(el.x.toFixed(4)),
        y: parseFloat(el.y.toFixed(4)),
        w: parseFloat(el.w.toFixed(4)),
        h: parseFloat(el.h.toFixed(4)),
        ...(el.x2 !== undefined ? { x2: parseFloat(el.x2.toFixed(4)) } : {}),
        ...(el.y2 !== undefined ? { y2: parseFloat(el.y2.toFixed(4)) } : {}),
        ...(el.radius !== undefined
          ? { radius: parseFloat(el.radius.toFixed(4)) }
          : {}),
      }));

      await setDoc(
        doc(db, "buildings", selectedBuilding, "floors", floorId),
        {
          floorName,
          elements: compressed,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save floor plan", e);
      alert("Failed to save floor plan. Check your permissions.");
    } finally {
      setSaving(false);
    }
  };

  // Get selected element for properties panel
  const selectedElement = elements.find((el) => el.id === selectedId);

  const updateElementProp = (
    id: string,
    updates: Partial<FloorPlanElement>
  ) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] animate-fade">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/30 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-headline font-semibold text-xl text-on-surface">
              Floor Plan Builder
            </h2>
            <p className="text-xs text-outline">
              Draw rooms, walls, and doors on normalized coordinates
            </p>
          </div>

          {/* Building selector */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-outline-variant/30 font-semibold"
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Floor selector */}
          <input
            type="text"
            value={floorId}
            onChange={(e) => setFloorId(e.target.value)}
            placeholder="Floor ID (e.g. ground, 2f)"
            className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-outline-variant/30 w-36"
          />
          <input
            type="text"
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
            placeholder="Floor Name"
            className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-outline-variant/30 w-40"
          />
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-sm text-room-green font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                check_circle
              </span>
              Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !selectedBuilding}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                Save Floor Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 py-2 border-b border-outline-variant/30 bg-surface-container/50 shrink-0">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTool === tool.id
                ? "bg-primary text-white shadow-md"
                : "bg-white text-on-surface-variant border border-outline-variant/30 hover:border-primary/40"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {tool.icon}
            </span>
            {tool.label}
          </button>
        ))}

        <div className="ml-auto text-xs text-outline font-medium">
          {elements.length} elements · ~
          {(JSON.stringify(elements).length / 1024).toFixed(1)} KB
        </div>
      </div>

      {/* ── Main Canvas + Properties ──────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 bg-surface-container-low">
          {selectedBuilding ? (
            <FloorPlanCanvas
              elements={elements}
              selectedTool={selectedTool}
              selectedId={selectedId}
              onElementAdded={handleAddElement}
              onElementSelected={setSelectedId}
              onElementMoved={handleMoveElement}
              onElementDeleted={handleDeleteElement}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-outline">
              <span className="material-symbols-outlined text-[48px] mb-2">
                domain
              </span>
              <p className="font-semibold text-on-surface">
                Select a building to start
              </p>
              <p className="text-sm">
                First add buildings in the Map & Rooms editor.
              </p>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        <aside className="w-72 bg-white border-l border-outline-variant/30 flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b border-outline-variant/30 bg-surface-container/30">
            <p className="font-bold text-sm text-on-surface">Properties</p>
          </div>

          {selectedElement ? (
            <div className="p-4 space-y-4">
              {/* Label */}
              <div>
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedElement.label}
                  onChange={(e) =>
                    updateElementProp(selectedElement.id, {
                      label: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-sm bg-surface-container/50 border border-outline-variant/30 focus:ring-1 focus:ring-primary outline-none"
                  placeholder="e.g. ECB 18"
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
                  Type
                </label>
                <select
                  value={selectedElement.roomType}
                  onChange={(e) =>
                    updateElementProp(selectedElement.id, {
                      roomType: e.target.value as RoomType,
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-sm bg-surface-container/50 border border-outline-variant/30"
                >
                  {ROOM_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>
                      {rt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shape type */}
              <div>
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
                  Shape
                </label>
                <span className="text-sm text-on-surface font-medium capitalize">
                  {selectedElement.kind}
                </span>
              </div>

              {/* Coordinates (read-only display) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block">
                    X
                  </label>
                  <span className="text-xs font-mono text-on-surface">
                    {selectedElement.x.toFixed(4)}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block">
                    Y
                  </label>
                  <span className="text-xs font-mono text-on-surface">
                    {selectedElement.y.toFixed(4)}
                  </span>
                </div>
                {selectedElement.kind === "rect" && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-outline uppercase block">
                        W
                      </label>
                      <span className="text-xs font-mono text-on-surface">
                        {selectedElement.w.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-outline uppercase block">
                        H
                      </label>
                      <span className="text-xs font-mono text-on-surface">
                        {selectedElement.h.toFixed(4)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDeleteElement(selectedElement.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  delete
                </span>
                Delete Element
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-outline p-4 text-center">
              <span className="material-symbols-outlined text-[32px] mb-2">
                touch_app
              </span>
              <p className="text-sm font-medium">No element selected</p>
              <p className="text-xs mt-1">
                Draw a shape or click one to edit its properties.
              </p>
            </div>
          )}

          {/* Elements list */}
          <div className="border-t border-outline-variant/30 p-4">
            <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
              All Elements ({elements.length})
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {elements.map((el) => (
                <button
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedId === el.id
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {el.kind === "rect"
                      ? "rectangle"
                      : el.kind === "line"
                      ? "pen_size_3"
                      : "door_open"}
                  </span>
                  {el.label || `${el.kind}-${el.id.slice(-4)}`}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
