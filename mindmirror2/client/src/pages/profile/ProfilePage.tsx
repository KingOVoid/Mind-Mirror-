import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-white">Student Profile</h2>
      <LevitatingCard className="p-6">
        <div className="space-y-2 font-mono text-xs">
          <p className="text-white font-bold">{user?.fullName}</p>
          <p className="text-slate-400">{user?.email}</p>
          <p className="text-cyan-400">{user?.role} ACCESS</p>
        </div>
      </LevitatingCard>
    </div>
  );
}
