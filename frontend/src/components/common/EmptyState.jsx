import React from 'react';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  action,
}) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center animate-fade-in">
      {Icon && (
        <div className="p-4 rounded-2xl bg-surface-secondary text-ocean-cyan border border-line-subtle shadow-xs mb-3">
          <Icon className="w-8 h-8 opacity-80" />
        </div>
      )}
      <h3 className="text-base font-bold text-content-primary mb-1">
        {title}
      </h3>
      <p className="text-xs text-content-secondary max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
