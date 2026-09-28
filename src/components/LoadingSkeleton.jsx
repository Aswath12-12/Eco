import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
            <div className="w-16 h-4 rounded-full bg-slate-100"></div>
          </div>
          <div className="w-24 h-8 bg-slate-200 rounded-lg mb-2"></div>
          <div className="w-32 h-4 bg-slate-100 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="w-48 h-6 bg-slate-200 rounded"></div>
        <div className="w-32 h-8 bg-slate-100 rounded-xl"></div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-slate-100 rounded"
                style={{ width: `${Math.floor(100 / cols) - 4}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default { CardSkeleton, TableSkeleton };
