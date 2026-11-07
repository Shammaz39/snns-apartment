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
  Shield,
  ShieldCheck,
  UserCheck,
  PhoneCall
} from 'lucide-react';

export default function Sidebar() {
  const { isAdmin, isSecurity, isResident } = useAuth();

  const adminLinks = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/floors', label: 'Floors Matrix', icon: Layers },
    { to: '/rooms', label: 'Apartment Rooms', icon: DoorClosed },
    { to: '/tenants', label: 'Tenants & KYC', icon: Users },
    { to: '/staff', label: 'Staff & Security', icon: ShieldCheck },
    { to: '/gate', label: 'Gatekeeper Terminal', icon: UserCheck },
    { to: '/bills', label: 'Billing & Receipts', icon: Receipt },
    { to: '/events', label: 'Events & Notices', icon: CalendarDays },
    { to: '/complaints', label: 'Complaints', icon: Wrench },
    { to: '/emergency-contacts', label: 'Emergency Contacts', icon: PhoneCall },
    { to: '/settings', label: 'Settings & QR Code', icon: Settings },
  ];

  const securityLinks = [
    { to: '/gate', label: 'Gatekeeper Terminal', icon: UserCheck },
    { to: '/events', label: 'Notices & Circulars', icon: CalendarDays },
  ];

  const residentLinks = [
    { to: '/', label: 'My Flat & Bills', icon: Home },
    { to: '/gate', label: 'Visitors & Passes', icon: UserCheck },
    { to: '/complaints', label: 'Service Requests', icon: Wrench },
    { to: '/events', label: 'Community Events', icon: CalendarDays },
  ];

  const links = isAdmin ? adminLinks : isSecurity ? securityLinks : residentLinks;

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
