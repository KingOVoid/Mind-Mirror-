import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-rose-400 font-mono text-xs">
        <Shield className="w-4 h-4" />
        <span>ADMIN TELEMETRY & COMMAND SECTOR</span>
      </div>
      <Outlet />
    </div>
  );
}
