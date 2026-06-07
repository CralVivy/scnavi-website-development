"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BU_CAMPUSES } from "@/lib/buCourses";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CourseSetupModalProps {
  uid: string;
  onComplete: () => void;
}

export function CourseSetupModal({ uid, onComplete }: CourseSetupModalProps) {
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [course, setCourse] = useState("Not Specified");
  const [saving, setSaving] = useState(false);

  const activeCampus = BU_CAMPUSES.find((c) => c.name === selectedCampus);
  const activeCollege = activeCampus?.colleges.find((c) => c.name === selectedCollege);

  const handleSave = async () => {
    if (course === "Not Specified") return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid), { course });
      onComplete();
    } catch (e) {
      console.error("Failed to save course", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 space-y-6 border border-outline-variant/20">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[32px]">school</span>
          </div>
          <h2 className="font-headline font-bold text-xl text-on-surface">Welcome to SCNavi!</h2>
          <p className="text-sm text-outline leading-relaxed">
            Let&apos;s personalize your experience. Please select your course or program so we can tailor your campus navigation.
          </p>
        </div>

        {/* Cascading Course Selection */}
        <div className="space-y-4">
          {/* Step 1: Campus */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block">
              Campus
            </label>
            <select
              value={selectedCampus}
              onChange={(e) => {
                const campusName = e.target.value;
                setSelectedCampus(campusName);
                
                const campusObj = BU_CAMPUSES.find((c) => c.name === campusName);
                const validColleges = campusObj ? campusObj.colleges.filter(c => c.courses.length > 0) : [];
                
                if (validColleges.length === 1) {
                  setSelectedCollege(validColleges[0].name);
                } else {
                  setSelectedCollege("");
                }
                
                setCourse("Not Specified");
              }}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
            >
              <option value="">— Select Campus —</option>
              {BU_CAMPUSES.map((campus) => (
                <option key={campus.name} value={campus.name}>{campus.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: College */}
          {activeCampus && (
            <div className="flex flex-col gap-1.5 animate-fade">
              <label className="text-xs font-bold text-outline uppercase tracking-wider block">
                College / Institute
              </label>
              <select
                value={selectedCollege}
                onChange={(e) => {
                  setSelectedCollege(e.target.value);
                  setCourse("Not Specified");
                }}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
              >
                <option value="">— Select College —</option>
                {activeCampus.colleges
                  .filter((c) => c.courses.length > 0)
                  .map((college) => (
                    <option key={college.name} value={college.name}>{college.name}</option>
                  ))}
              </select>
            </div>
          )}

          {/* Step 3: Course */}
          {activeCollege && activeCollege.courses.length > 0 && (
            <div className="flex flex-col gap-1.5 animate-fade">
              <label className="text-xs font-bold text-outline uppercase tracking-wider block">
                Course / Program
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
              >
                <option value="Not Specified">— Select Course —</option>
                {activeCollege.courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Current selection display */}
          {course && course !== "Not Specified" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
              <span className="text-on-surface font-medium">{course}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSave}
            disabled={saving || course === "Not Specified"}
            className="w-full"
            size="lg"
          >
            {saving ? "Saving…" : "Continue"}
          </Button>
          <button
            onClick={onComplete}
            className="text-sm text-outline hover:text-on-surface-variant transition-colors font-medium"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
