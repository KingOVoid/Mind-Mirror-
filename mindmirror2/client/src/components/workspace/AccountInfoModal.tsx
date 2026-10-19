import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  User as UserIcon,
  Mail,
  Shield,
  School,
  Calendar,
  LogOut,
  X,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface AccountInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountInfoModal: React.FC<AccountInfoModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, logout } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4 select-none">
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-[#E6E1D8] shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden text-[#242725] animate-page-flip-forward"
        style={{ transformOrigin: 'center center' }}
      >
        {/* Modal Top Header */}
        <div className="p-6 bg-[#FAF8F5] border-b border-[#E6E1D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5B8266]/15 border border-[#5B8266]/30 text-[#43634D] flex items-center justify-center font-bold text-lg font-mono shadow-xs">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#242725]">{user.fullName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-bold">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-[#6D736E]">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EFEBE3] text-[#6D736E] hover:text-[#242725] transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Standard User Details Grid */}
        <div className="p-6 space-y-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6D736E] font-semibold">
            Standard Account Information
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {/* User ID */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] flex items-center justify-between">
              <span className="text-[#6D736E] flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#5B8266]" />
                <span>Account ID / UUID</span>
              </span>
              <span className="font-mono font-medium text-[#242725] text-[11px]">
                {user.id}
              </span>
            </div>

            {/* Email Address */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] flex items-center justify-between">
              <span className="text-[#6D736E] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#5B8266]" />
                <span>Email Address</span>
              </span>
              <span className="font-medium text-[#242725]">{user.email}</span>
            </div>

            {/* Primary Track */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] flex items-center justify-between">
              <span className="text-[#6D736E] flex items-center gap-2">
                <School className="w-3.5 h-3.5 text-[#5B8266]" />
                <span>Primary Academic Track</span>
              </span>
              <span className="font-medium text-[#242725]">
                {profile?.course || 'Applied Engineering Curriculum'}
              </span>
            </div>

            {/* Account Status */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] flex items-center justify-between">
              <span className="text-[#6D736E] flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#5B8266]" />
                <span>Access Status</span>
              </span>
              <span className="font-semibold text-[#43634D] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5B8266]" />
                <span>Verified Academic Scholar</span>
              </span>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3 rounded-xl bg-[#EDF3EE] border border-[#C8D7CB] text-[11px] text-[#43634D] leading-relaxed">
            All notes, derivations, and Nexus AI Copilot interactions are automatically synchronized with this profile.
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 pt-0 flex items-center gap-2.5">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-[#FDF2F2] border border-[#E6E1D8] hover:border-[#FCA5A5] text-[#DC2626] text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
