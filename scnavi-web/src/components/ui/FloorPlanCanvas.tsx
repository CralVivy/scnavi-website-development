"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────
export type RoomType = "classroom" | "lab" | "office" | "hallway" | "stairway" | "facility";
export type ShapeKind = "rect" | "line" | "arc";
export type BuilderTool = "select" | "draw_room" | "draw_wall" | "draw_door" | "erase";

export interface FloorPlanElement {
  id: string;
  kind: ShapeKind;
  label: string;
  roomType: RoomType;
  // Normalized 0.0 – 1.0 coordinates
  x: number;
  y: number;
  w: number;
  h: number;
  // Line-specific (normalized)
  x2?: number;
  y2?: number;
  // Arc-specific
  startAngle?: number;
  endAngle?: number;
  radius?: number;
}

// ── Color mapping matching the Android guide ────────────
const ROOM_COLORS: Record<RoomType, string> = {
  classroom: "#4CAF50",
  lab:       "#2196F3",
  office:    "#FF9800",
  hallway:   "#9E9E9E",
  stairway:  "#795548",
  facility:  "#E91E63",
};

// ── Props ──────────────────────────────────────────────────
interface FloorPlanCanvasProps {
  elements: FloorPlanElement[];
  selectedTool: BuilderTool;
  selectedId: string | null;
  readOnly?: boolean;
  onElementAdded?: (el: FloorPlanElement) => void;
  onElementSelected?: (id: string | null) => void;
  onElementMoved?: (id: string, x: number, y: number) => void;
  onElementDeleted?: (id: string) => void;
}

export function FloorPlanCanvas({
  elements,
  selectedTool,
  selectedId,
  readOnly = false,
  onElementAdded,
  onElementSelected,
  onElementMoved,
  onElementDeleted,
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragId = useRef<string | null>(null);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Pan / Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomSensitivity = 0.002;
      const zoomDelta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.1, transform.scale * (1 + zoomDelta)), 10);
      
      const rect = containerRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom towards mouse pointer
      const dx = (mouseX - transform.x) * (newScale / transform.scale - 1);
      const dy = (mouseY - transform.y) * (newScale / transform.scale - 1);

      setTransform(t => ({
        scale: newScale,
        x: t.x - dx,
        y: t.y - dy
      }));
    } else {
      setTransform(t => ({
        ...t,
        x: t.x - e.deltaX,
        y: t.y - e.deltaY
      }));
    }
  }, [transform]);

  const compress = (v: number) => parseFloat(v.toFixed(4));

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top - transform.y) / transform.scale
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // If middle click or spacebar+drag or alt+drag, pan
    if (("button" in e && e.button === 1) || ("altKey" in e && e.altKey)) {
      setIsPanning(true);
      let cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      let cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      setPanStart({ x: cx - transform.x, y: cy - transform.y });
      return;
    }

    if (readOnly) return;
    const pos = getPointerPos(e);

    if (selectedTool === "select") {
      const target = e.target as SVGElement;
      if (target.tagName === "svg" || (target.tagName === "rect" && target.id === "bgRect")) {
        onElementSelected?.(null);
      }
    } else if (selectedTool === "erase") {
      // Handled by elements directly
    } else {
      setDrawStart(pos);
      setDrawCurrent(pos);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      let cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      let cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      setTransform(t => ({ ...t, x: cx - panStart.x, y: cy - panStart.y }));
      return;
    }

    if (readOnly) return;
    const pos = getPointerPos(e);

    if (isDragging.current && dragId.current) {
      const nx = compress(pos.x / dims.w);
      const ny = compress(pos.y / dims.h);
      onElementMoved?.(dragId.current, nx, ny);
    } else if (drawStart) {
      setDrawCurrent(pos);
    }
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (readOnly) return;
    const pos = getPointerPos(e);

    if (isDragging.current) {
      isDragging.current = false;
      dragId.current = null;
      return;
    }

    if (drawStart && drawCurrent) {
      const { w, h } = dims;
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);

      if (selectedTool === "draw_room") {
        const sx = Math.min(drawStart.x, pos.x) / w;
        const sy = Math.min(drawStart.y, pos.y) / h;
        const ew = Math.abs(pos.x - drawStart.x) / w;
        const eh = Math.abs(pos.y - drawStart.y) / h;
        if (ew > 0.01 && eh > 0.01) {
          onElementAdded?.({
            id, kind: "rect", label: "", roomType: "classroom",
            x: compress(sx), y: compress(sy), w: compress(ew), h: compress(eh),
          });
        }
      } else if (selectedTool === "draw_wall") {
        onElementAdded?.({
          id, kind: "line", label: "", roomType: "hallway",
          x: compress(drawStart.x / w), y: compress(drawStart.y / h), w: 0, h: 0,
          x2: compress(pos.x / w), y2: compress(pos.y / h),
        });
      } else if (selectedTool === "draw_door") {
        const r = Math.sqrt((pos.x - drawStart.x) ** 2 + (pos.y - drawStart.y) ** 2);
        onElementAdded?.({
          id, kind: "arc", label: "", roomType: "facility",
          x: compress(drawStart.x / w), y: compress(drawStart.y / h), w: 0, h: 0,
          radius: compress(r / Math.min(w, h)), startAngle: 0, endAngle: 90,
        });
      }
    }
    setDrawStart(null);
    setDrawCurrent(null);
  };

  const handleElementDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (selectedTool === "select") {
      onElementSelected?.(id);
      if (!readOnly) {
        isDragging.current = true;
        dragId.current = id;
      }
    } else if (selectedTool === "erase") {
      onElementDeleted?.(id);
    }
  };

  // Prevent default scroll when zooming/panning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const preventDefault = (e: WheelEvent) => e.preventDefault();
    container.addEventListener("wheel", preventDefault, { passive: false });
    return () => container.removeEventListener("wheel", preventDefault);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative select-none overflow-hidden bg-[#F5F5F5]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        setIsPanning(false);
        isDragging.current = false;
        dragId.current = null;
        setDrawStart(null);
        setDrawCurrent(null);
      }}
      style={{ touchAction: "none" }}
    >
      <div className="absolute top-4 left-4 z-10 flex gap-2">
         <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-sm px-3 py-1.5 text-xs text-on-surface-variant font-medium">
            Pan: Middle-click or Alt+Drag
         </div>
         <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-sm px-3 py-1.5 text-xs text-on-surface-variant font-medium">
            Zoom: Ctrl+Wheel
         </div>
      </div>
      <svg
        width={dims.w}
        height={dims.h}
        className={selectedTool === "select" ? "cursor-default" : isPanning ? "cursor-grabbing" : "cursor-crosshair"}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E0E0E0" strokeWidth="1" />
          </pattern>
          <rect id="bgRect" width={dims.w} height={dims.h} fill="url(#grid)" />

          {elements.map((el) => {
            const px = el.x * dims.w;
            const py = el.y * dims.h;
            const color = ROOM_COLORS[el.roomType] || "#999";
            const isSelected = selectedId === el.id;

            if (el.kind === "rect") {
              const pw = el.w * dims.w;
              const ph = el.h * dims.h;
              return (
                <g key={el.id} onPointerDown={(e) => handleElementDown(e, el.id)} style={{ cursor: selectedTool === "select" ? "pointer" : "inherit" }}>
                  <rect
                    x={px} y={py} width={pw} height={ph}
                    fill={color + "B3"} stroke={isSelected ? "#0A84FF" : color} strokeWidth={isSelected ? 3 : 2}
                    strokeDasharray={isSelected ? "5,3" : "none"}
                  />
                  {el.label && (
                    <text x={px + pw / 2} y={py + ph / 2} fill="#FFFFFF" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                      {el.label}
                    </text>
                  )}
                </g>
              );
            } else if (el.kind === "line" && el.x2 !== undefined && el.y2 !== undefined) {
              return (
                <line
                  key={el.id}
                  x1={px} y1={py} x2={el.x2 * dims.w} y2={el.y2 * dims.h}
                  stroke={isSelected ? "#0A84FF" : color} strokeWidth={isSelected ? 4 : 2}
                  strokeDasharray={isSelected ? "5,3" : "none"}
                  onPointerDown={(e) => handleElementDown(e, el.id)}
                  style={{ cursor: selectedTool === "select" ? "pointer" : "inherit" }}
                />
              );
            } else if (el.kind === "arc" && el.radius !== undefined) {
              const r = el.radius * Math.min(dims.w, dims.h);
              const startA = (el.startAngle ?? 0) * (Math.PI / 180);
              const endA = (el.endAngle ?? 90) * (Math.PI / 180);
              const x1 = px + r * Math.cos(startA);
              const y1 = py + r * Math.sin(startA);
              const x2 = px + r * Math.cos(endA);
              const y2 = py + r * Math.sin(endA);
              const largeArc = endA - startA <= Math.PI ? "0" : "1";
              
              return (
                <path
                  key={el.id}
                  d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={isSelected ? "#0A84FF" : color} strokeWidth={isSelected ? 4 : 2}
                  strokeDasharray={isSelected ? "5,3" : "none"}
                  onPointerDown={(e) => handleElementDown(e, el.id)}
                  style={{ cursor: selectedTool === "select" ? "pointer" : "inherit" }}
                />
              );
            }
            return null;
          })}

          {drawStart && drawCurrent && !readOnly && (
            <g>
              {selectedTool === "draw_room" && (
                <rect
                  x={Math.min(drawStart.x, drawCurrent.x)}
                  y={Math.min(drawStart.y, drawCurrent.y)}
                  width={Math.abs(drawCurrent.x - drawStart.x)}
                  height={Math.abs(drawCurrent.y - drawStart.y)}
                  fill="#4CAF5040" stroke="#4CAF50" strokeWidth="2" strokeDasharray="6,3"
                />
              )}
              {selectedTool === "draw_wall" && (
                <line x1={drawStart.x} y1={drawStart.y} x2={drawCurrent.x} y2={drawCurrent.y} stroke="#9E9E9E" strokeWidth="2" strokeDasharray="6,3" />
              )}
              {selectedTool === "draw_door" && (
                <path
                  d={`M ${drawStart.x + Math.sqrt((drawCurrent.x - drawStart.x) ** 2 + (drawCurrent.y - drawStart.y) ** 2)} ${drawStart.y} A ${Math.sqrt((drawCurrent.x - drawStart.x) ** 2 + (drawCurrent.y - drawStart.y) ** 2)} ${Math.sqrt((drawCurrent.x - drawStart.x) ** 2 + (drawCurrent.y - drawStart.y) ** 2)} 0 0 1 ${drawStart.x} ${drawStart.y + Math.sqrt((drawCurrent.x - drawStart.x) ** 2 + (drawCurrent.y - drawStart.y) ** 2)}`}
                  fill="none" stroke="#795548" strokeWidth="2" strokeDasharray="6,3"
                />
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
