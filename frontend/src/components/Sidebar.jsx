import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  DoorClosed,
  Users,
  Receipt,
  CalendarDays,
  Wrench,
  Settings,
  Home,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  X,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const { isAdmin, isSecurity, isResident } = useAuth();

  const adminNavGroups = [
    {
      group: 'OVERVIEW',
      links: [
        { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      group: 'PROPERTY & UNITS',
      links: [
        { to: '/floors', label: 'Floors Matrix', icon: Layers },
        { to: '/rooms', label: 'Apartment Rooms', icon: DoorClosed },
        { to: '/tenants', label: 'Tenants & KYC', icon: Users },
      ]
    },
    {
      group: 'GATE & BILLING',
      links: [
        { to: '/gate', label: 'Gatekeeper Terminal', icon: UserCheck },
        { to: '/bills', label: 'Billing & Receipts', icon: Receipt },
        { to: '/staff', label: 'Staff & Security', icon: ShieldCheck },
      ]
    },
    {
      group: 'COMMUNITY & SYSTEM',
      links: [
        { to: '/events', label: 'Events & Notices', icon: CalendarDays },
        { to: '/complaints', label: 'Complaints', icon: Wrench },
        { to: '/emergency-contacts', label: 'Emergency Contacts', icon: PhoneCall },
        { to: '/settings', label: 'Settings & QR Code', icon: Settings },
      ]
    }
  ];

  const securityNavGroups = [
    {
      group: 'SECURITY OPERATIONS',
      links: [
        { to: '/gate', label: 'Gatekeeper Terminal', icon: UserCheck },
        { to: '/events', label: 'Notices & Circulars', icon: CalendarDays },
      ]
    }
  ];

  const residentNavGroups = [
    {
      group: 'RESIDENTIAL PORTAL',
      links: [
        { to: '/', label: 'My Flat & Bills', icon: Home },
        { to: '/gate', label: 'Visitor Pre-Approvals', icon: UserCheck },
        { to: '/complaints', label: 'Maintenance Requests', icon: Wrench },
        { to: '/events', label: 'Community Events', icon: CalendarDays },
      ]
    }
  ];

  const navGroups = isAdmin ? adminNavGroups : isSecurity ? securityNavGroups : residentNavGroups;

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between">
      <div className="p-4 space-y-6 overflow-y-auto">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-content-muted block mb-1.5">
              {group.group}
            </span>
            {group.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={isMobile ? onMobileClose : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-ocean-deep text-white shadow-md shadow-ocean-deep/20 dark:bg-ocean-cyan/20 dark:text-cyan-300 dark:border dark:border-ocean-cyan/40'
                        : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-ocean-cyan dark:text-cyan-300'
                              : 'text-content-muted group-hover:text-ocean-cyan'
                          }`}
                        />
                        <span className="truncate">{link.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-ocean-cyan shrink-0 animate-pulse"></span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer info card */}
      <div className="p-4 border-t border-line-subtle/60 m-2 rounded-2xl bg-surface-secondary/40">
        <div className="flex items-center space-x-2 text-content-primary">
          <Sparkles className="w-4 h-4 text-ocean-cyan" />
          <span className="text-xs font-bold">Ocean Modern UI</span>
        </div>
        <p className="text-[11px] text-content-secondary mt-1">
          Designed for high-density community operations.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-surface-main border-r border-line-subtle flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] transition-colors duration-200">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer (Slide-out) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-surface-main text-content-primary h-full shadow-2xl flex flex-col z-10 animate-slide-up border-r border-line-subtle">
            <div className="p-4 border-b border-line-subtle flex items-center justify-between bg-surface-secondary/50">
              <span className="text-xs font-bold uppercase tracking-wider text-ocean-cyan">Navigation Menu</span>
              <button
                onClick={onMobileClose}
                className="p-1 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-secondary transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
