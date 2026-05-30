"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
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

  // ── Render ──────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = dims;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = "#F5F5F5";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let gx = 0; gx < w; gx += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Render each element
    elements.forEach((el) => {
      const px = el.x * w;
      const py = el.y * h;
      const color = ROOM_COLORS[el.roomType] || "#999";

      if (el.kind === "rect") {
        const pw = el.w * w;
        const ph = el.h * h;
        ctx.fillStyle = color + "B3"; // ~70% opacity
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = color;
        ctx.lineWidth = selectedId === el.id ? 3 : 2;
        ctx.strokeRect(px, py, pw, ph);

        // Label
        if (el.label) {
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(el.label, px + pw / 2, py + ph / 2, pw - 4);
        }
      } else if (el.kind === "line" && el.x2 !== undefined && el.y2 !== undefined) {
        ctx.strokeStyle = color;
        ctx.lineWidth = selectedId === el.id ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(el.x2 * w, el.y2 * h);
        ctx.stroke();
      } else if (el.kind === "arc" && el.radius !== undefined) {
        const r = el.radius * Math.min(w, h);
        const startA = (el.startAngle ?? 0) * (Math.PI / 180);
        const endA = (el.endAngle ?? 90) * (Math.PI / 180);
        ctx.strokeStyle = color;
        ctx.lineWidth = selectedId === el.id ? 4 : 2;
        ctx.beginPath();
        ctx.arc(px, py, r, startA, endA);
        ctx.stroke();
      }

      // Selection highlight
      if (selectedId === el.id) {
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = "#0A84FF";
        ctx.lineWidth = 1;
        if (el.kind === "rect") {
          ctx.strokeRect(el.x * w - 2, el.y * h - 2, el.w * w + 4, el.h * h + 4);
        }
        ctx.setLineDash([]);
      }
    });

    // Live drawing preview (ghost shape)
    if (drawStart && drawCurrent && !readOnly) {
      const sx = drawStart.x;
      const sy = drawStart.y;
      const cx = drawCurrent.x;
      const cy = drawCurrent.y;

      if (selectedTool === "draw_room") {
        ctx.fillStyle = "#4CAF5040";
        ctx.strokeStyle = "#4CAF50";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.fillRect(sx, sy, cx - sx, cy - sy);
        ctx.strokeRect(sx, sy, cx - sx, cy - sy);
        ctx.setLineDash([]);
      } else if (selectedTool === "draw_wall") {
        ctx.strokeStyle = "#9E9E9E";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (selectedTool === "draw_door") {
        const r = Math.sqrt((cx - sx) ** 2 + (cy - sy) ** 2);
        ctx.strokeStyle = "#795548";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [elements, dims, selectedId, drawStart, drawCurrent, selectedTool, readOnly]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ── Helpers ────────────────────────────────────────────
  const compress = (v: number) => parseFloat(v.toFixed(4));

  const hitTest = (px: number, py: number): string | null => {
    const { w, h } = dims;
    const nx = px / w;
    const ny = py / h;
    // Iterate in reverse for top-most hit
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.kind === "rect") {
        if (nx >= el.x && nx <= el.x + el.w && ny >= el.y && ny <= el.y + el.h) {
          return el.id;
        }
      }
    }
    return null;
  };

  // ── Mouse handlers ─────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (selectedTool === "select") {
      const hit = hitTest(px, py);
      onElementSelected?.(hit);
      if (hit) {
        isDragging.current = true;
        dragId.current = hit;
      }
    } else if (selectedTool === "erase") {
      const hit = hitTest(px, py);
      if (hit) onElementDeleted?.(hit);
    } else {
      // Drawing tools
      setDrawStart({ x: px, y: py });
      setDrawCurrent({ x: px, y: py });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (readOnly) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (isDragging.current && dragId.current) {
      const nx = compress(px / dims.w);
      const ny = compress(py / dims.h);
      onElementMoved?.(dragId.current, nx, ny);
    } else if (drawStart) {
      setDrawCurrent({ x: px, y: py });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (readOnly) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (isDragging.current) {
      isDragging.current = false;
      dragId.current = null;
      return;
    }

    if (drawStart && drawCurrent) {
      const { w, h } = dims;
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);

      if (selectedTool === "draw_room") {
        const sx = Math.min(drawStart.x, px) / w;
        const sy = Math.min(drawStart.y, py) / h;
        const ew = Math.abs(px - drawStart.x) / w;
        const eh = Math.abs(py - drawStart.y) / h;
        if (ew > 0.01 && eh > 0.01) {
          onElementAdded?.({
            id,
            kind: "rect",
            label: "",
            roomType: "classroom",
            x: compress(sx),
            y: compress(sy),
            w: compress(ew),
            h: compress(eh),
          });
        }
      } else if (selectedTool === "draw_wall") {
        onElementAdded?.({
          id,
          kind: "line",
          label: "",
          roomType: "hallway",
          x: compress(drawStart.x / w),
          y: compress(drawStart.y / h),
          w: 0,
          h: 0,
          x2: compress(px / w),
          y2: compress(py / h),
        });
      } else if (selectedTool === "draw_door") {
        const r = Math.sqrt((px - drawStart.x) ** 2 + (py - drawStart.y) ** 2);
        onElementAdded?.({
          id,
          kind: "arc",
          label: "",
          roomType: "facility",
          x: compress(drawStart.x / w),
          y: compress(drawStart.y / h),
          w: 0,
          h: 0,
          radius: compress(r / Math.min(w, h)),
          startAngle: 0,
          endAngle: 90,
        });
      }
    }
    setDrawStart(null);
    setDrawCurrent(null);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isDragging.current = false;
          dragId.current = null;
          setDrawStart(null);
          setDrawCurrent(null);
        }}
      />
    </div>
  );
}
