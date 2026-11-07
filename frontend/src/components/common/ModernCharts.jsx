import React, { useState } from 'react';

/**
 * Modern Area Chart for Revenue / Trends
 */
export function ModernAreaChart({
  data = [], // [{ label: 'May', value: 8700 }, ...]
  height = 220,
  valuePrefix = '₹',
  color = 'cyan', // 'cyan' | 'violet'
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-content-muted text-xs">
        No trend data available
      </div>
    );
  }

  const values = data.map((d) => Number(d.value) || 0);
  const maxVal = Math.max(...values, 100);
  const minVal = 0;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = 500;
  const chartHeight = height;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((d.value - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  // Generate SVG smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  const strokeColor = color === 'violet' ? '#8B5CF6' : '#06B6D4';
  const gradId = `area-grad-${color}`;

  return (
    <div className="w-full relative select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Guide Lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
          const val = Math.round(minVal + ratio * (maxVal - minVal));
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-line-subtle opacity-60"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-current text-content-muted font-mono"
              >
                {valuePrefix}{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Gradient Area Fill */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Curve Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <g
            key={idx}
            className="cursor-pointer transition-transform"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 6 : 4}
              fill="#FFFFFF"
              stroke={strokeColor}
              strokeWidth="2.5"
              className="transition-all duration-150 drop-shadow-sm"
            />
            {/* X-axis label */}
            <text
              x={p.x}
              y={chartHeight - 6}
              textAnchor="middle"
              className="text-[10px] fill-current text-content-secondary font-medium"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Hover Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-surface-main text-content-primary px-3 py-1.5 rounded-xl border border-line-subtle shadow-saas-dropdown dark:shadow-saas-dropdown-dark text-xs font-semibold z-10 animate-fade-in"
          style={{
            left: `${(points[hoveredIdx].x / chartWidth) * 100}%`,
            top: `${(points[hoveredIdx].y / chartHeight) * 100}%`,
            marginTop: '-10px',
          }}
        >
          <span className="text-[10px] block text-content-muted font-normal">{points[hoveredIdx].label}</span>
          <span className="text-ocean-cyan font-bold">{valuePrefix}{Number(points[hoveredIdx].value).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Modern Donut Chart for Occupancy & Status Breakdown
 */
export function ModernDonutChart({
  data = [], // [{ label: 'Occupied', value: 12, color: '#06B6D4' }, ...]
  centerLabel = 'Units',
  size = 180,
  strokeWidth = 24,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  if (total === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-content-muted text-xs">
        No units configured yet
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* SVG Ring */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-surface-secondary"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {data.map((item, idx) => {
            const val = Number(item.value) || 0;
            if (val === 0) return null;
            const sliceRatio = val / total;
            const strokeDasharray = `${sliceRatio * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle * circumference;
            accumulatedAngle += sliceRatio;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Centered Total / Hover value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-content-primary tracking-tight">
            {hoveredIdx !== null ? data[hoveredIdx].value : total}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-content-secondary">
            {hoveredIdx !== null ? data[hoveredIdx].label : centerLabel}
          </span>
        </div>
      </div>

      {/* Legends */}
      <div className="space-y-2 w-full sm:w-auto">
        {data.map((item, idx) => {
          const val = Number(item.value) || 0;
          const percentage = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between sm:justify-start space-x-3 px-3 py-1.5 rounded-xl cursor-pointer transition ${
                hoveredIdx === idx ? 'bg-surface-secondary shadow-xs' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs font-medium text-content-secondary">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-content-primary">{val}</span>
                <span className="text-[11px] text-content-muted font-mono">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
