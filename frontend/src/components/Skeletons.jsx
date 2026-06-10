import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card p-6 flex flex-col justify-between h-36 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-3.5 bg-slate-800 rounded-lg w-28" />
      <div className="w-8 h-8 bg-slate-800 rounded-xl" />
    </div>
    <div className="space-y-2.5">
      <div className="h-8 bg-slate-800 rounded-lg w-20" />
      <div className="h-3 bg-slate-800/60 rounded-md w-32" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="glass-card overflow-hidden animate-pulse">
    <div className="p-4 bg-slate-900/30 border-b border-white/5 flex gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-800 rounded-md flex-1" />
      ))}
    </div>
    <div className="p-4 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
          <div className="h-4 bg-slate-800/80 rounded-md flex-1" />
          <div className="h-4 bg-slate-800/60 rounded-md flex-1" />
          <div className="h-4 bg-slate-800/60 rounded-md flex-1" />
          <div className="h-4 bg-slate-800/40 rounded-md flex-1" />
          <div className="h-4 bg-slate-800/80 rounded-md flex-1" />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6 h-[380px] flex flex-col justify-between animate-pulse">
    <div className="space-y-2">
      <div className="h-4.5 bg-slate-800 rounded-lg w-48" />
      <div className="h-3 bg-slate-800/60 rounded-md w-72" />
    </div>
    <div className="flex-1 flex items-end gap-3 px-2 py-6 border-b border-l border-white/5 mt-4">
      {Array.from({ length: 12 }).map((_, i) => {
        const heights = ['h-20', 'h-24', 'h-32', 'h-28', 'h-36', 'h-40', 'h-36', 'h-44', 'h-48', 'h-52', 'h-48', 'h-56'];
        return (
          <div key={i} className={`flex-1 bg-slate-800/30 rounded-t-lg border-t border-white/5 ${heights[i % heights.length]}`} />
        );
      })}
    </div>
    <div className="flex justify-between pt-3 text-[10px] text-slate-600">
      <div className="h-3 bg-slate-800/40 rounded-md w-10" />
      <div className="h-3 bg-slate-800/40 rounded-md w-10" />
      <div className="h-3 bg-slate-800/40 rounded-md w-10" />
      <div className="h-3 bg-slate-800/40 rounded-md w-10" />
    </div>
  </div>
);
