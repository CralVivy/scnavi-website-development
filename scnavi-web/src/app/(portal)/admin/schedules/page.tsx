"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  collection, getDocs, doc, getDoc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getColorForSubject } from "@/lib/scheduleColors";
import { BU_COURSES } from "@/lib/buCourses";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ScheduleEntry {
  subject: string;
  code: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
}

interface EnrolledStudent {
  uid: string;
  name: string;
  course: string;
  year: string;
}

interface UniqueScheduleGroup {
  key: string;
  subject: string;
  code: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
  students: EnrolledStudent[];
}

// Course Sequence types
interface YearGroup {
  year: string;
  subjects: UniqueScheduleGroup[];
}

interface CourseGroup {
  course: string;
  years: YearGroup[];
}

type ViewTab = "subjects" | "sequence";
type ViewMode = "grid" | "list";

// ─────────────────────────────────────────────
// Year inference: guess year level from course field
// (students may store "1st Year", "2nd Year", etc.)
// ─────────────────────────────────────────────
const YEAR_PATTERNS: [RegExp, string][] = [
  [/1st|first|year\s*1\b/i, "1st Year"],
  [/2nd|second|year\s*2\b/i, "2nd Year"],
  [/3rd|third|year\s*3\b/i, "3rd Year"],
  [/4th|fourth|year\s*4\b/i, "4th Year"],
  [/5th|fifth|year\s*5\b/i, "5th Year"],
];

function inferYear(raw: string): string {
  if (!raw) return "Unspecified Year";
  for (const [pattern, label] of YEAR_PATTERNS) {
    if (pattern.test(raw)) return label;
  }
  return "Unspecified Year";
}

const YEAR_ORDER = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Unspecified Year"];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AdminSchedulesPage() {
  const [allGroups, setAllGroups] = useState<UniqueScheduleGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ViewTab>("subjects");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Accordion open state (subject groups or sequence nodes)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Edit modal
  const [editingGroup, setEditingGroup] = useState<UniqueScheduleGroup | null>(null);
  const [formSubject, setFormSubject] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDays, setFormDays] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [saving, setSaving] = useState(false);
  // Track which student UIDs are currently having their course updated
  const [updatingCourse, setUpdatingCourse] = useState<Record<string, boolean>>({});

  // Track course group renaming
  const [editingCourseName, setEditingCourseName] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  // ─── Course Update Handler ───────────────────
  const handleCourseChange = useCallback(async (uid: string, newCourse: string) => {
    setUpdatingCourse((prev) => ({ ...prev, [uid]: true }));
    try {
      await updateDoc(doc(db, "users", uid), { course: newCourse });
      // Refresh so Course Sequence re-groups correctly
      await fetchData();
    } catch (err: any) {
      alert("Failed to update course: " + err.message);
    } finally {
      setUpdatingCourse((prev) => ({ ...prev, [uid]: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Data Fetching ──────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const userMap = new Map<string, { course: string; name: string; year: string }>();
      usersSnap.forEach((d) => {
        const data = d.data();
        const rawCourse = data.course || "";
        userMap.set(d.id, {
          course: rawCourse || "Unassigned",
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown Student",
          year: inferYear(rawCourse),
        });
      });

      const schedulesSnap = await getDocs(collection(db, "schedules"));
      const groupsMap: Record<string, UniqueScheduleGroup> = {};

      schedulesSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const entries = (data.entries || []) as ScheduleEntry[];
        const info = userMap.get(docSnap.id) || { course: "Unassigned", name: "Unknown", year: "Unspecified Year" };

        entries.forEach((entry) => {
          if (!entry.subject) return;
          const subject = entry.subject.trim();
          const code = (entry.code || "").trim();
          const days = (entry.days || "").trim();
          const time = (entry.time || "").trim();
          const room = (entry.room || "").trim();
          const instructor = (entry.instructor || "").trim();
          const key = `${subject}|${code}|${days}|${time}|${room}|${instructor}`.toLowerCase();

          if (!groupsMap[key]) {
            groupsMap[key] = { key, subject, code, days, time, room, instructor, students: [] };
          }

          if (!groupsMap[key].students.some((s) => s.uid === docSnap.id)) {
            groupsMap[key].students.push({
              uid: docSnap.id,
              name: info.name,
              course: info.course,
              year: info.year,
            });
          }
        });
      });

      const sorted = Object.values(groupsMap).sort((a, b) => a.subject.localeCompare(b.subject));
      setAllGroups(sorted);
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Edit Handlers ───────────────────────────
  const openEdit = (group: UniqueScheduleGroup) => {
    setEditingGroup(group);
    setFormSubject(group.subject);
    setFormCode(group.code);
    setFormDays(group.days);
    setFormTime(group.time);
    setFormRoom(group.room);
    setFormInstructor(group.instructor);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setSaving(true);
    try {
      const original: ScheduleEntry = {
        subject: editingGroup.subject, code: editingGroup.code,
        days: editingGroup.days, time: editingGroup.time,
        room: editingGroup.room, instructor: editingGroup.instructor,
      };
      const updated: ScheduleEntry = {
        subject: formSubject.trim(), code: formCode.trim(),
        days: formDays.trim(), time: formTime.trim(),
        room: formRoom.trim(), instructor: formInstructor.trim(),
      };

      await Promise.all(
        editingGroup.students.map(async ({ uid }) => {
          const ref = doc(db, "schedules", uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) return;
          const entries = (snap.data().entries || []) as ScheduleEntry[];
          const newEntries = entries.map((e) => {
            const match =
              e.subject.trim().toLowerCase() === original.subject.toLowerCase() &&
              (e.code || "").trim().toLowerCase() === original.code.toLowerCase() &&
              (e.days || "").trim().toLowerCase() === original.days.toLowerCase() &&
              (e.time || "").trim().toLowerCase() === original.time.toLowerCase() &&
              (e.room || "").trim().toLowerCase() === original.room.toLowerCase() &&
              (e.instructor || "").trim().toLowerCase() === original.instructor.toLowerCase();
            return match ? { ...e, ...updated } : e;
          });
          await updateDoc(ref, { entries: newEntries, updatedAt: new Date() });
        })
      );

      setEditingGroup(null);
      await fetchData();
    } catch (err: any) {
      alert("Error updating: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleCourseRenameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseName || !newCourseName.trim()) return;
    setSavingCourse(true);
    try {
      const uidsToUpdate = new Set<string>();
      allGroups.forEach((g) => {
        g.students.forEach((s) => {
          if ((s.course || "Unassigned") === editingCourseName) {
            uidsToUpdate.add(s.uid);
          }
        });
      });

      await Promise.all(
        Array.from(uidsToUpdate).map((uid) => updateDoc(doc(db, "users", uid), { course: newCourseName.trim() }))
      );

      setEditingCourseName(null);
      await fetchData();
    } catch (err: any) {
      alert("Error updating course: " + err.message);
    } finally {
      setSavingCourse(false);
    }
  };

  // ─── Derived Data ───────────────────────────
  const filtered = allGroups.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      g.subject.toLowerCase().includes(q) ||
      (g.code || "").toLowerCase().includes(q) ||
      g.instructor.toLowerCase().includes(q) ||
      g.room.toLowerCase().includes(q)
    );
  });

  // Build Course Sequence structure from filtered (applying search query)
  const courseSequence: CourseGroup[] = (() => {
    const courseMap: Record<string, Record<string, UniqueScheduleGroup[]>> = {};

    filtered.forEach((group) => {
      group.students.forEach((student) => {
        const course = student.course || "Unassigned";
        const year = student.year || "Unspecified Year";
        if (!courseMap[course]) courseMap[course] = {};
        if (!courseMap[course][year]) courseMap[course][year] = [];
        if (!courseMap[course][year].some((g) => g.key === group.key)) {
          courseMap[course][year].push(group);
        }
      });
    });

    return Object.entries(courseMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([course, yearMap]) => ({
        course,
        years: Object.entries(yearMap)
          .sort(([a], [b]) => YEAR_ORDER.indexOf(a) - YEAR_ORDER.indexOf(b))
          .map(([year, subjects]) => ({ year, subjects })),
      }));
  })();

  // ─── StudentCourseRow ────────────────────────
  // Reusable row showing student name + editable course dropdown
  const StudentCourseRow = ({ student }: { student: EnrolledStudent }) => (
    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-outline-variant/20 text-xs shadow-sm gap-3">
      <span className="font-bold text-on-surface truncate flex-shrink-0 max-w-[45%]">{student.name}</span>
      <div className="relative flex-1 min-w-0">
        <select
          value={student.course}
          disabled={!!updatingCourse[student.uid]}
          onChange={(e) => handleCourseChange(student.uid, e.target.value)}
          className="w-full appearance-none text-xs text-on-surface bg-surface-container-low border border-outline-variant/30 rounded-lg px-2.5 py-1.5 pr-6 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50 cursor-pointer"
        >
          <option value="Not Specified">— Not Specified —</option>
          <option value="Unassigned">— Unassigned —</option>
          {BU_COURSES.filter((c) => c !== "Not Specified").map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-outline">
          {updatingCourse[student.uid]
            ? <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
            : <span className="material-symbols-outlined text-[13px]">expand_more</span>}
        </span>
      </div>
    </div>
  );

  // ─── Sub-components ─────────────────────────
  const SubjectCard = ({ group, compact = false }: { group: UniqueScheduleGroup; compact?: boolean }) => {
    const color = getColorForSubject(group.subject);
    const isExpanded = !!expanded[group.key];
    if (compact) {
      // List view row
      return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/40 transition-colors group">
          <div className={`w-2 h-8 rounded-full flex-shrink-0 ${color.bgAccent}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-on-surface truncate">{group.subject}</span>
              {group.code && (
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${color.bg} ${color.text} flex-shrink-0`}>
                  {group.code}
                </span>
              )}
            </div>
            <p className="text-xs text-outline mt-0.5 truncate">
              {group.instructor} · {group.days} {group.time} · {group.room}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-outline font-medium">{group.students.length} student{group.students.length !== 1 ? "s" : ""}</span>
            <button
              onClick={() => toggleExpand(group.key)}
              className="text-outline hover:text-on-surface transition-colors"
              title="Show enrolled students"
            >
              <span className={`material-symbols-outlined text-[18px] transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
            </button>
            <button
              onClick={() => openEdit(group)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary"
              title="Edit schedule"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
        </div>
      );
    }

    // Grid view card
    return (
      <Card className={`p-0 overflow-hidden border-2 ${color.border} bg-surface-container-lowest flex flex-col`}>
        <div className={`p-4 ${color.bg} flex justify-between items-start gap-3 border-b ${color.border}`}>
          <div className="min-w-0">
            {group.code && (
              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${color.bgAccent} text-white`}>
                {group.code}
              </span>
            )}
            <h3 className={`font-bold text-base mt-1 leading-snug ${color.text}`}>{group.subject}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => openEdit(group)}
            className="flex-shrink-0 flex items-center gap-1 bg-white hover:bg-surface-container-low text-xs">
            <span className="material-symbols-outlined text-[14px]">edit</span> Edit
          </Button>
        </div>

        <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-outline-variant/10 text-xs text-on-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-[17px]">schedule</span>
            <div>
              <p className="text-[9px] text-outline uppercase font-bold tracking-wider">Days & Time</p>
              <p className="font-semibold">{group.days} · {group.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-[17px]">meeting_room</span>
            <div>
              <p className="text-[9px] text-outline uppercase font-bold tracking-wider">Room</p>
              <p className="font-semibold">{group.room}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-[17px]">person</span>
            <div>
              <p className="text-[9px] text-outline uppercase font-bold tracking-wider">Instructor</p>
              <p className="font-semibold truncate max-w-[130px]">{group.instructor}</p>
            </div>
          </div>
        </div>

        <button onClick={() => toggleExpand(group.key)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-container-low transition-colors text-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">groups</span>
            <span className="font-semibold text-on-surface">Enrolled Students ({group.students.length})</span>
          </div>
          <span className={`material-symbols-outlined text-outline text-[18px] transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
        </button>

        {isExpanded && (
          <div className="px-4 pb-3 pt-1 space-y-1.5 bg-surface-container-low/20 max-h-56 overflow-y-auto">
            {group.students.length === 0 ? (
              <p className="text-xs text-outline italic">No students enrolled.</p>
            ) : (
              group.students.map((s) => (
                <StudentCourseRow key={s.uid} student={s} />
              ))
            )}
          </div>
        )}
      </Card>
    );
  };

  // ─── Render ─────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-[48px] text-outline-variant animate-pulse">calendar_month</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="font-headline font-semibold text-2xl text-on-surface">Class Schedules</h2>
          <p className="text-sm text-outline mt-0.5">Manage and monitor student schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 md:w-72">
            <Input placeholder="Search subject, code, instructor…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          {/* Grid / List toggle */}
          <div className="flex items-center border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-outline hover:text-on-surface"}`}
              title="Grid view"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-primary text-white" : "text-outline hover:text-on-surface"}`}
              title="List view"
            >
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-outline-variant/30">
        {(["subjects", "sequence"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface hover:border-outline-variant/50"
            }`}
          >
            {t === "subjects" ? "All Subjects" : "Course Sequence"}
          </button>
        ))}
      </div>

      {/* ── All Subjects Tab ── */}
      {tab === "subjects" && (
        <>
          {filtered.length === 0 ? (
            <Card className="flex flex-col items-center py-16 text-center border border-dashed border-outline-variant/40">
              <span className="material-symbols-outlined text-[56px] text-outline-variant">event_busy</span>
              <p className="font-semibold text-on-surface mt-3">No matching schedules</p>
              <p className="text-sm text-outline mt-1">Try adjusting your search query.</p>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filtered.map((g) => <SubjectCard key={g.key} group={g} />)}
            </div>
          ) : (
            <Card className="p-0 overflow-hidden">
              {filtered.map((g) => (
                <div key={g.key} className="border-b border-outline-variant/10 last:border-0">
                  <SubjectCard group={g} compact />
                  {expanded[g.key] && (
                    <div className="px-8 py-3 bg-surface-container-low/30 space-y-1.5 border-t border-outline-variant/10">
                      {g.students.map((s) => (
                        <StudentCourseRow key={s.uid} student={s} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      {/* ── Course Sequence Tab ── */}
      {tab === "sequence" && (
        <div className="space-y-6">
          {courseSequence.length === 0 ? (
            <Card className="flex flex-col items-center py-16 text-center border border-dashed border-outline-variant/40">
              <span className="material-symbols-outlined text-[56px] text-outline-variant">
                {searchQuery ? "event_busy" : "school"}
              </span>
              <p className="font-semibold text-on-surface mt-3">
                {searchQuery ? "No matching course sequence" : "No course data available"}
              </p>
              {searchQuery && (
                <p className="text-sm text-outline mt-1">Try adjusting your search query.</p>
              )}
            </Card>
          ) : (
            courseSequence.map((courseGroup) => {
              const courseKey = `course::${courseGroup.course}`;
              const isCourseOpen = expanded[courseKey] !== false; // default open
              return (
                <Card key={courseKey} className="p-0 overflow-hidden border border-outline-variant/30">
                  {/* Course header */}
                  <div className="group flex items-center justify-between px-5 py-3 bg-primary/5 hover:bg-primary/10 transition-colors border-b border-outline-variant/20">
                    <button
                      onClick={() => toggleExpand(courseKey)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <span className="material-symbols-outlined text-primary text-[22px]">school</span>
                      <span className="font-bold text-base text-on-surface">{courseGroup.course}</span>
                      <span className="text-xs text-outline font-medium">
                        ({courseGroup.years.reduce((sum, y) => sum + y.subjects.length, 0)} subjects)
                      </span>
                      <span className={`material-symbols-outlined text-outline transition-transform ${isCourseOpen ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingCourseName(courseGroup.course);
                        setNewCourseName(courseGroup.course === "Unassigned" ? "Not Specified" : courseGroup.course);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-primary hover:bg-primary/20 rounded-full transition-all ml-2 flex-shrink-0"
                      title="Edit Course Name"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </div>

                  {isCourseOpen && (
                    <div className="divide-y divide-outline-variant/10">
                      {courseGroup.years.map((yearGroup) => {
                        const yearKey = `year::${courseGroup.course}::${yearGroup.year}`;
                        const isYearOpen = expanded[yearKey] !== false; // default open
                        return (
                          <div key={yearKey}>
                            {/* Year sub-header */}
                            <button
                              onClick={() => toggleExpand(yearKey)}
                              className="w-full flex items-center justify-between px-5 py-3 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-accent text-[18px]">calendar_today</span>
                                <span className="font-semibold text-sm text-on-surface">{yearGroup.year}</span>
                                <span className="text-xs text-outline">· {yearGroup.subjects.length} subject{yearGroup.subjects.length !== 1 ? "s" : ""}</span>
                              </div>
                              <span className={`material-symbols-outlined text-outline text-[18px] transition-transform ${isYearOpen ? "rotate-180" : ""}`}>expand_more</span>
                            </button>

                            {/* Subjects grid or list */}
                            {isYearOpen && (
                              viewMode === "grid" ? (
                                <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4 bg-surface-container-lowest">
                                  {yearGroup.subjects.map((g) => <SubjectCard key={g.key} group={g} />)}
                                </div>
                              ) : (
                                <div className="bg-surface-container-lowest divide-y divide-outline-variant/10 border-t border-outline-variant/10">
                                  {yearGroup.subjects.map((g) => (
                                    <div key={g.key}>
                                      <SubjectCard group={g} compact />
                                      {expanded[g.key] && (
                                        <div className="px-8 py-3 bg-surface-container-low/30 space-y-1.5 border-t border-outline-variant/10">
                                          {g.students.map((s) => (
                                            <StudentCourseRow key={s.uid} student={s} />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-surface shadow-2xl animate-fade flex flex-col gap-4 border border-outline-variant/30">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl text-on-surface">Edit Class Schedule</h3>
                <p className="text-xs text-outline mt-0.5">Changes apply to all {editingGroup.students.length} enrolled student{editingGroup.students.length !== 1 ? "s" : ""}.</p>
              </div>
              <button onClick={() => setEditingGroup(null)} className="text-outline hover:text-on-surface transition-colors mt-0.5">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Subject Name" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} required />
              <Input label="Subject Code" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Days" value={formDays} onChange={(e) => setFormDays(e.target.value)} required />
                <Input label="Time Slot" value={formTime} onChange={(e) => setFormTime(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Room" value={formRoom} onChange={(e) => setFormRoom(e.target.value)} required />
                <Input label="Instructor" value={formInstructor} onChange={(e) => setFormInstructor(e.target.value)} required />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/20">
                <Button type="button" variant="outline" onClick={() => setEditingGroup(null)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="min-w-[100px]">
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* ── Edit Course Modal ── */}
      {editingCourseName && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-surface shadow-2xl animate-fade flex flex-col gap-4 border border-outline-variant/30">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl text-on-surface">Rename Course Group</h3>
                <p className="text-xs text-outline mt-0.5">This updates the course for all students currently in <span className="font-semibold text-on-surface">"{editingCourseName}"</span>.</p>
              </div>
              <button onClick={() => setEditingCourseName(null)} className="text-outline hover:text-on-surface transition-colors mt-0.5">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCourseRenameSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-on-surface">New Course Name</label>
                <select
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full appearance-none text-sm text-on-surface bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
                  required
                >
                  <option value="Not Specified">— Not Specified —</option>
                  <option value="Unassigned">— Unassigned —</option>
                  {BU_COURSES.filter((c) => c !== "Not Specified").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/20">
                <Button type="button" variant="outline" onClick={() => setEditingCourseName(null)} disabled={savingCourse}>Cancel</Button>
                <Button type="submit" disabled={savingCourse} className="min-w-[100px]">
                  {savingCourse ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
