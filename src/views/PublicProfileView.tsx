import React from 'react';
import { Award, GraduationCap, Flame, ShieldCheck, ArrowLeft } from 'lucide-react';

export const PublicProfileView: React.FC<{ username: string }> = ({ username }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div className="text-left">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#2952CC] bg-white border border-[#E5E7EB] px-4 py-2 rounded-full shadow-xs hover:bg-blue-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to EasiaLearn Home
        </a>
      </div>

      <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2952CC] to-[#4F7DF3] text-white font-bold text-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          {username.charAt(0).toUpperCase()}
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2952CC] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified EasiaLearn Learner
          </div>
          <h1 className="text-2xl font-bold text-[#111111]">@{username}</h1>
          <p className="text-sm text-[#475569] mt-1">EasiaCode: EA-STU-{username.slice(0, 5).toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-6">
          <div>
            <p className="text-xs text-[#475569]">Board Predicted</p>
            <p className="text-xl font-bold text-[#2952CC] mt-1">92%</p>
          </div>
          <div>
            <p className="text-xs text-[#475569]">Study Streak</p>
            <p className="text-xl font-bold text-amber-500 mt-1">18 Days</p>
          </div>
          <div>
            <p className="text-xs text-[#475569]">Certificates</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">4</p>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <h3 className="font-bold text-sm text-[#111111]">Verified Certificates & Badges</h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-[#2952CC]" />
              <div>
                <p className="font-bold text-xs text-[#111111]">State Mathematics CBT Mock</p>
                <p className="text-[11px] text-[#475569]">Scored 94% • Grade A+ • Issued Feb 2026</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
