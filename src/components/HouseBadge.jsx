import React from 'react';
import { Shield } from 'lucide-react';

export const HOUSE_COLORS = {
  GREEN: {
    name: 'Green House',
    code: 'GREEN',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-500/20',
    hex: '#16a34a',
  },
  BLUE: {
    name: 'Blue House',
    code: 'BLUE',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-600 text-white',
    ring: 'ring-blue-500/20',
    hex: '#2563eb',
  },
  RED: {
    name: 'Red House',
    code: 'RED',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-600 text-white',
    ring: 'ring-rose-500/20',
    hex: '#dc2626',
  },
  YELLOW: {
    name: 'Yellow House',
    code: 'YELLOW',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-500 text-white',
    ring: 'ring-amber-500/20',
    hex: '#ca8a04',
  },
};

export default function HouseBadge({ code, showIcon = true, size = 'md' }) {
  const normalizedCode = (code || '').toUpperCase();
  const config = HOUSE_COLORS[normalizedCode] || {
    name: code || 'Unassigned',
    code: normalizedCode || 'NONE',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-500 text-white',
    hex: '#64748b',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.hex }}
        />
      )}
      <span>{config.code}</span>
    </span>
  );
}
