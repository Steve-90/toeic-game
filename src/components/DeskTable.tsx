/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DeskTableProps {
  children: React.ReactNode;
  heartCount: number;
  onDrinkCoffee: () => void;
  xpPoints: number;
  completedQuizzCount: number;
}

export default function DeskTable({
  children,
  heartCount,
  onDrinkCoffee,
  xpPoints,
  completedQuizzCount
}: DeskTableProps) {
  return (
    <div className="min-h-screen bg-slate-50 md:bg-slate-100 flex flex-col items-center justify-center font-sans tracking-tight">
      {/* 
        Sleek full-screen container on mobile.
        On desktop viewports, it fits as a centered, high-fidelity app frame with zero tacky mockups.
      */}
      <div className="w-full max-w-md min-h-screen md:min-h-[820px] md:max-h-[90vh] bg-slate-50 md:rounded-3xl flex flex-col md:shadow-2xl md:border md:border-slate-205/65 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
