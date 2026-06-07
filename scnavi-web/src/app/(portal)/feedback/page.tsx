"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthSession } from "@/lib/useAuthSession";

export default function StudentFeedbackPage() {
  const { user, profile } = useAuthSession();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0 || !message.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        uid: user.uid,
        name: profile ? `${profile.firstName} ${profile.lastName}` : user.displayName || "Anonymous",
        email: user.email,
        rating,
        message,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setMessage("");
      setRating(0);
    } catch (e) {
      console.error("Failed to submit feedback", e);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade">
      <div>
        <h2 className="font-headline font-semibold text-2xl text-on-surface">Feedback & Support</h2>
        <p className="text-sm text-outline mt-0.5">Let us know how we can improve SCNavi.</p>
      </div>

      {/* Android App Banner */}
      <Card className="bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">android</span>
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm">Download the SCNavi Android App</p>
            <p className="text-xs text-outline mt-0.5">Test the dedicated Android app for a native campus navigation experience.</p>
          </div>
        </div>
        <a 
          href="https://drive.google.com/file/d/15rATrP0RjtZfeDqKBtqrkXmITVgSc3nz/view?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 shadow-sm shadow-primary/20"
        >
          Download APK
        </a>
      </Card>

      {/* Feedback Form */}
      <Card className="border border-outline-variant/30">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-room-green/10 rounded-full flex items-center justify-center text-room-green mb-4">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">Thank you!</h3>
            <p className="text-outline text-sm max-w-sm">Your feedback has been submitted successfully and will be reviewed by the administration.</p>
            <Button className="mt-6" onClick={() => setSubmitted(false)}>Submit Another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Rate your experience</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <span 
                      className={`material-symbols-outlined text-[32px] transition-colors ${
                        star <= (hoveredRating || rating) 
                          ? "text-accent ms-fill" 
                          : "text-outline-variant"
                      }`}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
              {rating === 0 && <p className="text-xs text-room-red mt-2">* Please select a rating</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-semibold text-on-surface">Your thoughts or suggestions</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you love or what could be better..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none"
                required
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-outline-variant/20">
              <Button 
                type="submit" 
                disabled={submitting || rating === 0 || !message.trim()}
                className="px-8"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
