import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, DoorClosed, UserCheck, Shield } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm', showIcon = true }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const config = {
    // Billing / Payment statuses
    PAID: {
      label: 'Paid & Verified',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2
    },
    PENDING: {
      label: 'Pending',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: Clock
    },
    PENDING_VERIFICATION: {
      label: 'Verification Queued',
      bg: 'bg-ocean-cyan/10 dark:bg-ocean-cyan/20 text-ocean-cyan dark:text-ocean-cyan border-ocean-cyan/30',
      icon: Clock
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
      icon: XCircle
    },

    // Room statuses
    OCCUPIED: {
      label: 'Occupied',
      bg: 'bg-ocean-cyan/10 dark:bg-ocean-cyan/20 text-ocean-deep dark:text-ocean-cyan border-ocean-cyan/30',
      icon: UserCheck
    },
    VACANT: {
      label: 'Vacant',
      bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
      icon: DoorClosed
    },
    MAINTENANCE: {
      label: 'Maintenance',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: AlertTriangle
    },

    // Visitor statuses
    CHECKED_IN: {
      label: 'Checked In',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck
    },
    CHECKED_OUT: {
      label: 'Checked Out',
      bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30',
      icon: Clock
    },
    APPROVED: {
      label: 'Pre-Approved',
      bg: 'bg-ocean-violet/10 dark:bg-ocean-violet/20 text-ocean-violet dark:text-ocean-violet border-ocean-violet/30',
      icon: CheckCircle2
    },

    // Complaint statuses
    OPEN: {
      label: 'Open',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: AlertTriangle
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-ocean-cyan/10 dark:bg-ocean-cyan/20 text-ocean-cyan dark:text-ocean-cyan border-ocean-cyan/30',
      icon: Clock
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2
    },

    // Role tags
    ROLE_ADMIN: {
      label: 'Admin',
      bg: 'bg-ocean-deep/10 dark:bg-ocean-deep/40 text-ocean-deep dark:text-cyan-300 border-ocean-deep/30',
      icon: Shield
    },
    ROLE_SECURITY: {
      label: 'Security Guard',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: Shield
    },
    ROLE_RESIDENT: {
      label: 'Resident',
      bg: 'bg-ocean-violet/10 dark:bg-ocean-violet/20 text-ocean-violet dark:text-ocean-violet border-ocean-violet/30',
      icon: UserCheck
    }
  };

  const current = config[normalized] || {
    label: status,
    bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
    icon: null
  };

  const Icon = current.icon;
  const sizeClasses = size === 'xs'
    ? 'px-2 py-0.5 text-[10px]'
    : size === 'md'
    ? 'px-3 py-1.5 text-xs'
    : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full font-semibold border ${current.bg} ${sizeClasses} whitespace-nowrap tracking-wide`}>
      {showIcon && Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{current.label}</span>
    </span>
  );
}
