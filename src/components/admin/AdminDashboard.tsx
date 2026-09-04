import React, { useState } from 'react';
import {
  Users,
  Shield,
  TrendingUp,
  DollarSign,
  HardDrive,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Settings,
  Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  class: string;
  status: 'Active' | 'Suspended';
  joinedDate: string;
}

export const AdminDashboard: React.FC = () => {
  const { subjects, addSubject, announcements, triggerCelebration } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'curriculum' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample managed users
  const [usersList, setUsersList] = useState<ManagedUser[]>([
    {
      id: 'u1',
      name: 'Priya Sharma',
      email: 'priya@student.easialearn.in',
      role: 'student',
      class: 'Class 10 (SSLC)',
      status: 'Active',
      joinedDate: 'Jan 2026',
    },
    {
      id: 'u2',
      name: 'Dr. Ramesh Kumar',
      email: 'ramesh.k@faculty.easialearn.in',
      role: 'teacher',
      class: 'Senior Faculty',
      status: 'Active',
      joinedDate: 'Nov 2025',
    },
    {
      id: 'u3',
      name: 'Mohammed Zaid',
      email: 'zaid@student.easialearn.in',
      role: 'student',
      class: 'PUC II (Science)',
      status: 'Active',
      joinedDate: 'Feb 2026',
    },
    {
      id: 'u4',
      name: 'Sneha Patil',
      email: 'sneha@student.easialearn.in',
      role: 'student',
      class: 'Class 10 (SSLC)',
      status: 'Active',
      joinedDate: 'Jan 2026',
    },
    {
      id: 'u5',
      name: 'Ananya Hegde',
      email: 'ananya@faculty.easialearn.in',
      role: 'teacher',
      class: 'Mathematics Mentor',
      status: 'Active',
      joinedDate: 'Dec 2025',
    },
  ]);

  // New subject state
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubClass, setNewSubClass] = useState('Class 10 (SSLC)');
  const [newSubMedium, setNewSubMedium] = useState<'English' | 'Kannada' | 'Urdu'>('English');
  const [newSubTeacher, setNewSubTeacher] = useState('Dr. Ramesh Kumar');
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);

  const toggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
      )
    );
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTitle.trim()) return;

    addSubject({
      title: newSubTitle,
      class: newSubClass,
      medium: newSubMedium,
      totalChapters: 8,
      completedChapters: 0,
      progressPercent: 0,
      difficulty: 'Medium',
      assignedTeacher: newSubTeacher,
      description: `Official Karnataka curriculum syllabus for ${newSubTitle}.`,
      color: '#2952CC',
      bgLight: '#EAF2FF',
    });

    setNewSubTitle('');
    setIsAddSubOpen(false);
    triggerCelebration();
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5" /> Super Admin & Platform Infrastructure
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              EasiaLearn Management Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Karnataka SSLC & PUC EdTech SaaS Enterprise Operations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Firebase v11 & Gemini 3.8 Systems Nominal
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'border-[#2952CC] text-[#2952CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Platform Overview & Revenue
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'border-[#2952CC] text-[#2952CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'curriculum'
                ? 'border-[#2952CC] text-[#2952CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Curriculum & Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'border-[#2952CC] text-[#2952CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Platform Settings & Firestore Rules
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="pt-6 space-y-8 animate-in fade-in">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-400 font-semibold">Total Registered Students</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-heading">
                  14,820
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +18% this month</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-400 font-semibold">Active Teachers & Mentors</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#2952CC] mt-1 font-heading">
                  142
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Across 32 districts</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-400 font-semibold">Monthly SaaS Revenue</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 font-heading">
                  ₹8,45,000
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">₹499/mo standard plan</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-400 font-semibold">Cloud Storage & Video CDN</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-1 font-heading">
                  1.2 TB
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Firebase Storage CDN</div>
              </div>
            </div>

            {/* Growth & Subject distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-heading">District-wise Enrollment</h3>
                <div className="space-y-3">
                  {[
                    { district: 'Bengaluru Urban & Rural', count: 5400, pct: 85 },
                    { district: 'Mysuru & Mandya', count: 3200, pct: 60 },
                    { district: 'Hubballi-Dharwad & Belagavi', count: 2800, pct: 52 },
                    { district: 'Kalaburagi & Bidar', count: 1900, pct: 40 },
                    { district: 'Dakshina Kannada & Udupi', count: 1520, pct: 32 },
                  ].map((d, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{d.district}</span>
                        <span className="text-slate-900 font-bold">{d.count} candidates</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-[#2952CC] rounded-full" style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-heading">System Health & API Tokens</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Gemini 3.8 Flash API Status</div>
                      <div className="text-slate-400">Average response latency: 420ms</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Healthy
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Cloud Firestore Read/Writes</div>
                      <div className="text-slate-400">Active rules validation: Strict RBAC</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Synchronized
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Firebase Storage CDN</div>
                      <div className="text-slate-400">PDFs, lecture notes, certificates</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Optimal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-[#2952CC] focus:outline-none"
                />
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Showing {filteredUsers.length} accounts
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Class / Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'teacher'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{u.class}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs">{u.joinedDate}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className="text-xs font-bold text-[#2952CC] hover:underline"
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CURRICULUM */}
        {activeTab === 'curriculum' && (
          <div className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">Subjects & Chapters</h2>
                <p className="text-xs text-slate-500">Add, reorder, or update state board subject syllabi.</p>
              </div>

              <button
                onClick={() => setIsAddSubOpen(true)}
                className="px-4 py-2 bg-[#2952CC] text-white text-xs font-bold rounded-xl hover:bg-blue-800 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Subject
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2952CC]">
                      {sub.class}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{sub.medium} Medium</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{sub.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{sub.description}</p>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Faculty: {sub.assignedTeacher}</span>
                    <span>{sub.totalChapters} Chapters</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Subject Modal */}
            {isAddSubOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 font-heading">Add Subject to Curriculum</h3>

                  <form onSubmit={handleCreateSubject} className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subject Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Physics (PUC I)"
                        value={newSubTitle}
                        onChange={(e) => setNewSubTitle(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                      <select
                        value={newSubClass}
                        onChange={(e) => setNewSubClass(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      >
                        <option>Class 10 (SSLC)</option>
                        <option>PUC I (Science)</option>
                        <option>PUC II (Science)</option>
                        <option>PUC II (Commerce)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Medium</label>
                      <select
                        value={newSubMedium}
                        onChange={(e) => setNewSubMedium(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      >
                        <option value="English">English</option>
                        <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                        <option value="Urdu">Urdu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                      <input
                        type="text"
                        value={newSubTeacher}
                        onChange={(e) => setNewSubTeacher(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddSubOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold bg-[#2952CC] text-white hover:bg-blue-800 rounded-xl"
                      >
                        Create Subject
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="pt-6 max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 font-heading">Security & Cloud Rules</h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Firestore Security Rules Status</div>
                <p className="text-xs text-slate-500">
                  Role-based access controls for student private test scores, faculty review answers, and admin super-user operations are deployed in <code>firestore.rules</code>.
                </p>
                <div className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Security Rules Active
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Gemini 3.8 Flash Multilingual Engine</div>
                <p className="text-xs text-slate-500">
                  Server-side proxy running via <code>/api/ai-tutor</code> using the latest <code>@google/genai</code> SDK.
                </p>
                <div className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> API Configured
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
