import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  FileCheck,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Download,
  School,
  Sparkles,
} from 'lucide-react';

export const InstitutionPortal: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers' | 'exams'>('overview');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center">
            <Building className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111111]">
                {user?.institutionName || 'Karnataka Model PU College'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF2FF] text-[#2952CC]">
                Institution Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#475569]">
              EasiaCode: <span className="font-mono font-semibold text-[#111111]">{user?.easiacode || 'EA-INS-94812'}</span> • Campus Portal & Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#111111] bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-[#E5E7EB] shadow-xs">
          <p className="text-xs text-[#475569] font-medium">Enrolled Students</p>
          <p className="text-2xl font-bold text-[#111111] mt-1">1,240</p>
          <span className="text-xs text-emerald-600 font-semibold">+18 this month</span>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-[#E5E7EB] shadow-xs">
          <p className="text-xs text-[#475569] font-medium">Certified Faculty</p>
          <p className="text-2xl font-bold text-[#111111] mt-1">42</p>
          <span className="text-xs text-[#2952CC] font-semibold">6 Departments</span>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-[#E5E7EB] shadow-xs">
          <p className="text-xs text-[#475569] font-medium">Average Board Score</p>
          <p className="text-2xl font-bold text-[#111111] mt-1">87.4%</p>
          <span className="text-xs text-emerald-600 font-semibold">+6.2% vs last year</span>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-[#E5E7EB] shadow-xs">
          <p className="text-xs text-[#475569] font-medium">State Ranks Predicted</p>
          <p className="text-2xl font-bold text-[#111111] mt-1">14</p>
          <span className="text-xs text-purple-600 font-semibold">Top 1% State Tier</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 shadow-sm">
        <div className="flex border-b border-slate-100 gap-6 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-sm font-semibold pb-2 transition-all ${
              activeTab === 'overview'
                ? 'text-[#2952CC] border-b-2 border-[#2952CC]'
                : 'text-[#475569] hover:text-[#111111]'
            }`}
          >
            Batches & Performance
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`text-sm font-semibold pb-2 transition-all ${
              activeTab === 'students'
                ? 'text-[#2952CC] border-b-2 border-[#2952CC]'
                : 'text-[#475569] hover:text-[#111111]'
            }`}
          >
            Registered Students
          </button>
        </div>

        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[#475569] text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Batch / Class</th>
                  <th className="pb-3 font-semibold">Teacher Lead</th>
                  <th className="pb-3 font-semibold">Students</th>
                  <th className="pb-3 font-semibold">CBT Mock Completion</th>
                  <th className="pb-3 font-semibold">Avg. Accuracy</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3.5 font-bold text-[#111111]">10th Standard — Section A (English Medium)</td>
                  <td className="py-3.5 text-[#475569]">Dr. Ramesh Kumar</td>
                  <td className="py-3.5 text-[#111111]">48</td>
                  <td className="py-3.5">
                    <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#2952CC] h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-emerald-600">89.4%</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 font-bold text-[#111111]">10th Standard — Section B (Kannada Medium)</td>
                  <td className="py-3.5 text-[#475569]">Sri Chandrashekar</td>
                  <td className="py-3.5 text-[#111111]">52</td>
                  <td className="py-3.5">
                    <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#2952CC] h-full rounded-full" style={{ width: '84%' }} />
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-emerald-600">86.1%</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 font-bold text-[#111111]">PUC 1st Year — PCMB Batch</td>
                  <td className="py-3.5 text-[#475569]">Prof. Ananya Sen</td>
                  <td className="py-3.5 text-[#111111]">64</td>
                  <td className="py-3.5">
                    <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#2952CC] h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-emerald-600">82.8%</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
