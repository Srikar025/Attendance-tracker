import React from 'react';

export const SkeletonBlock: React.FC<{ className?: string }> = ({
  className = 'h-5 w-full',
}) => (
  <div className={`bg-slate-800/80 rounded-lg animate-pulse ${className}`} />
);

export const DashboardSkeleton: React.FC = () => (
  <div className="p-5 flex flex-col gap-4">
    {/* Hero */}
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-[180px] h-[180px] bg-slate-800/80 rounded-full animate-pulse" />
      <SkeletonBlock className="h-6 w-36" />
    </div>
    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#141927] border border-white/5 rounded-2xl p-4 flex flex-col gap-3.5">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-7 w-24" />
          <SkeletonBlock className="h-3.5 w-12" />
        </div>
      ))}
    </div>
    {/* Form card */}
    <div className="bg-[#141927] border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="h-11 w-full" />
      <SkeletonBlock className="h-11 w-full" />
      <SkeletonBlock className="h-11 w-full" />
    </div>
  </div>
);

export const RecordListSkeleton: React.FC = () => (
  <div className="flex flex-col gap-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-[#141927] border border-white/5 rounded-2xl p-4.5 flex items-center gap-4">
        <SkeletonBlock className="h-3.5 w-20" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBlock className="h-4.5 w-1/2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
        <SkeletonBlock className="h-8 w-12" />
      </div>
    ))}
  </div>
);

