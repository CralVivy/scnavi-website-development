import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="flex flex-col border-t-4 border-room-red">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-outline uppercase font-bold tracking-wider">Conflicts</span>
            <span className="material-symbols-outlined text-room-red text-[22px]">warning</span>
          </div>
          <p className="text-[32px] font-bold text-room-red">3</p>
          <p className="text-xs text-outline mt-1">Unresolved today</p>
        </Card>
        
        <Card className="flex flex-col border-t-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-outline uppercase font-bold tracking-wider">Rooms</span>
            <span className="material-symbols-outlined text-primary text-[22px]">meeting_room</span>
          </div>
          <p className="text-[32px] font-bold text-on-surface">24</p>
          <p className="text-xs text-outline mt-1">Active classrooms</p>
        </Card>

        <Card className="flex flex-col border-t-4 border-pink-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-outline uppercase font-bold tracking-wider">Feedback</span>
            <span className="material-symbols-outlined text-pink-500 text-[22px]">rate_review</span>
          </div>
          <p className="text-[32px] font-bold text-on-surface">18</p>
          <p className="text-xs text-outline mt-1">Pending reviews</p>
        </Card>

        <Card className="flex flex-col border-t-4 border-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-outline uppercase font-bold tracking-wider">Events</span>
            <span className="material-symbols-outlined text-accent text-[22px]">event</span>
          </div>
          <p className="text-[32px] font-bold text-on-surface">5</p>
          <p className="text-xs text-outline mt-1">Upcoming this week</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conflicts */}
        <Card className="col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base text-on-surface">Recent Schedule Conflicts</h3>
            <Button variant="ghost" size="sm">View All →</Button>
          </div>
          <div className="space-y-3">
            <div className="border-l-4 border-room-red bg-room-red/5 rounded-r-xl p-4">
              <p className="font-semibold text-sm text-on-surface">ECB 18 — Double Booking</p>
              <p className="text-xs text-outline mt-1">Software Design + IT301 · Mon 10:30 AM</p>
            </div>
            <div className="border-l-4 border-room-red bg-room-red/5 rounded-r-xl p-4">
              <p className="font-semibold text-sm text-on-surface">Prof. Reyes — Overlap</p>
              <p className="text-xs text-outline mt-1">2 classes same time · Tue 1:00 PM</p>
            </div>
            <div className="border-l-4 border-room-green bg-room-green/5 rounded-r-xl p-4">
              <p className="font-semibold text-sm text-on-surface">ECB 16 — Resolved</p>
              <p className="text-xs text-outline mt-1">Room reassigned to ECB 20 · Wed</p>
            </div>
          </div>
        </Card>

        {/* Room Status Overview */}
        <Card className="col-span-1">
          <h3 className="font-semibold text-base text-on-surface mb-4">Room Occupancy</h3>
          <p className="text-sm text-outline mb-4">CES Building Now</p>
          
          <div className="space-y-4">
            <div className="bg-room-red/10 border border-room-red/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-room-red font-bold uppercase tracking-wider">Occupied</p>
              </div>
              <p className="text-2xl font-bold text-room-red">8</p>
            </div>
            <div className="bg-room-green/10 border border-room-green/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-room-green font-bold uppercase tracking-wider">Free</p>
              </div>
              <p className="text-2xl font-bold text-room-green">12</p>
            </div>
            <div className="bg-room-yellow/10 border border-room-yellow/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-room-yellow font-bold uppercase tracking-wider">Reserved</p>
              </div>
              <p className="text-2xl font-bold text-room-yellow">4</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
