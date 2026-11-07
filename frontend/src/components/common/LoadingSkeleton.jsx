import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-surface-main p-5 rounded-2xl border border-line-subtle shadow-saas-card animate-pulse space-y-3"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-2/3">
              <div className="h-2.5 bg-surface-secondary rounded-md w-1/2"></div>
              <div className="h-6 bg-surface-secondary rounded-lg w-3/4"></div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-secondary shrink-0"></div>
          </div>
          <div className="h-2 bg-surface-secondary rounded-md w-1/3"></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-surface-main rounded-2xl border border-line-subtle overflow-hidden shadow-saas-card animate-pulse">
      <div className="p-4 border-b border-line-subtle flex justify-between items-center">
        <div className="h-4 bg-surface-secondary rounded-md w-1/4"></div>
        <div className="h-8 bg-surface-secondary rounded-xl w-32"></div>
      </div>
      <div className="divide-y divide-line-subtle">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-3 bg-surface-secondary rounded-md"
                style={{ width: `${80 / cols}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
