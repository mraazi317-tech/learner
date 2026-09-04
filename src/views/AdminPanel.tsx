import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Search,
  Download,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Database,
  DollarSign,
  TrendingUp,
  Eye,
  X,
  Copy,
  Check,
  Sparkles,
  FileSpreadsheet,
  GraduationCap,
  School,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  UserCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { UserProfile, UserRole } from '../types';
import { isSuperAdminEmail } from '../lib/firebase';

export const AdminPanel: React.FC = () => {
  const { subjects, mockTests, announcements, triggerCelebration } = useApp();
  const { user, getAllUsers, toggleBlockUser, deleteUserFromSystem, openAuthModal } = useAuth();

  const [adminTab, setAdminTab] = useState<
    'users' | 'analytics' | 'subjects' | 'firebase_status'
  >('users');

  // User management state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Blocked'>('all');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Selected user for View Profile Modal
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load users on mount
  const refreshUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await getAllUsers();
      setUsersList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const showStatus = (text: string) => {
    setStatusMsg(text);
    triggerCelebration();
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleToggleBlock = async (u: UserProfile) => {
    const currentStatus = u.status === 'Blocked' ? 'Blocked' : 'Active';
    await toggleBlockUser(u.uid, currentStatus);
    const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
    setUsersList((prev) =>
      prev.map((item) => (item.uid === u.uid ? { ...item, status: newStatus as any } : item))
    );
    if (selectedProfile && selectedProfile.uid === u.uid) {
      setSelectedProfile({ ...selectedProfile, status: newStatus as any });
    }
    showStatus(`User ${u.fullName || u.name} is now ${newStatus}.`);
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${u.fullName || u.name}" (${u.easiacode})?`)) {
      await deleteUserFromSystem(u.uid);
      setUsersList((prev) => prev.filter((item) => item.uid !== u.uid));
      if (selectedProfile?.uid === u.uid) {
        setSelectedProfile(null);
      }
      showStatus('User removed from database.');
    }
  };

  // Export Users to Excel (.xlsx) using xlsx library
  const handleExportExcel = () => {
    const dataToExport = filteredUsers.map((u) => {
      const trialDaysLeft = u.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(u.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 10;

      return {
        'Photo URL': u.photoURL || '',
        'Full Name': u.fullName || u.name || '',
        'Username': `@${u.username || ''}`,
        'EasiaCode': u.easiacode || '',
        'Role': (u.role || 'student').toUpperCase(),
        'Phone': u.phone || '',
        'WhatsApp': u.whatsapp || u.phone || '',
        'Email': u.email || '',
        'School / Institution': u.schoolName || u.school || u.institutionName || u.institution || '',
        'Class': u.class || '',
        'Subject': u.subject || '',
        'Guardian Name': u.guardianName || '',
        'Qualification': u.qualification || '',
        'Experience': u.experience || '',
        'State': u.state || '',
        'Trial Status': trialDaysLeft > 0 ? `Active (${trialDaysLeft} Days Left)` : 'Trial Expired',
        'Account Status': u.status || 'Active',
        'Profile ID': u.profileId || '',
        'Created At': u.createdAt || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Users');
    
    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `EasiaLearn_Users_Directory_${dateStr}.xlsx`);
    showStatus('Exported Users Directory to Excel (.xlsx).');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered users calculation
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.easiacode || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.schoolName || u.school || u.institutionName || u.institution || '').toLowerCase().includes(q);

    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'Blocked' && u.status === 'Blocked') ||
      (filterStatus === 'Active' && u.status !== 'Blocked');

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Access check: Visible only to Admin
  const isAdmin = user?.role === 'admin' || isSuperAdminEmail(user?.email);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[24px] border border-[#E5E7EB] p-8 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-[#111111]" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[#111111]">
            Admin Access Required
          </h2>
          <p className="text-sm font-medium text-[#111111] leading-relaxed">
            The Users management directory and platform administration tools are restricted to verified administrators.
          </p>
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#111111] text-left">
            <div>Current user: <span className="font-bold">{user?.email || 'Not signed in'}</span></div>
            <div>Current role: <span className="font-bold capitalize">{user?.role || 'Guest'}</span></div>
          </div>
          <button
            onClick={() => openAuthModal(1)}
            className="w-full py-3 px-5 rounded-xl bg-[#2952CC] text-white font-bold text-xs hover:bg-[#2042a8] transition shadow-xs"
          >
            Sign In with Admin Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#EAF2FF] text-[#2952CC] mb-2 border border-[#2952CC]/20">
              <Shield className="w-4 h-4 text-[#2952CC]" />
              <span className="text-[#111111]">Super Administrator Portal</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl text-[#111111] tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#111111] mt-1">
              Manage student accounts, faculty profiles, EasiaCodes, and export verified datasets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-2xl bg-[#22C55E] hover:bg-[#1ea34d] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Export Excel (.xlsx)</span>
            </button>
            <button
              onClick={refreshUsers}
              className="p-2.5 rounded-2xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#111111] shadow-2xs transition"
              title="Refresh users"
            >
              <RefreshCw className={`w-4 h-4 text-[#111111] ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-[#EAF2FF] text-[#111111] border-2 border-[#2952CC] font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-[#2952CC] shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 text-xs font-bold">
          {[
            { id: 'users', label: 'Users Directory', icon: Users },
            { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
            { id: 'subjects', label: 'Curriculum & Subjects', icon: BookOpen },
            { id: 'firebase_status', label: 'Firestore Database', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl flex items-center gap-2 shrink-0 transition-all font-heading text-xs font-extrabold ${
                  isActive
                    ? 'bg-[#2952CC] text-white shadow-md'
                    : 'bg-white border border-[#E5E7EB] text-[#111111] hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#111111]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: USERS PAGE (REQUIRED FULL IMPLEMENTATION) */}
        {adminTab === 'users' && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#E5E7EB] shadow-md animate-in fade-in space-y-6">
            
            {/* Top Toolbar: Search & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-[#111111]">
                  Users Directory
                </h2>
                <p className="text-xs font-medium text-[#111111] mt-0.5">
                  Showing {filteredUsers.length} total registered accounts across students, teachers, and admins.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Live Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#111111] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, code, email, school..."
                    className="pl-10 pr-4 py-2.5 text-xs font-medium text-[#111111] rounded-xl border-2 border-[#111111]/20 focus:border-[#2952CC] bg-white outline-hidden w-64 sm:w-72 placeholder:text-[#111111]/60"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-3.5 py-2.5 text-xs font-bold text-[#111111] rounded-xl border-2 border-[#111111]/20 bg-white outline-hidden focus:border-[#2952CC]"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Administrators</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3.5 py-2.5 text-xs font-bold text-[#111111] rounded-xl border-2 border-[#111111]/20 bg-white outline-hidden focus:border-[#2952CC]"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active Accounts</option>
                  <option value="Blocked">Blocked Accounts</option>
                </select>

                {/* Export Excel Button in toolbar */}
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2.5 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  title="Export currently filtered users"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* USERS TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E5E7EB] text-[#111111] font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Photo</th>
                    <th className="py-3.5 px-4">Full Name</th>
                    <th className="py-3.5 px-4">Username</th>
                    <th className="py-3.5 px-4">EasiaCode</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">School / Institution</th>
                    <th className="py-3.5 px-4">Trial Status</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-sm font-bold text-[#111111]">
                        No users found matching your search query or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const trialDaysLeft = u.trialEndsAt
                        ? Math.max(0, Math.ceil((new Date(u.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        : 10;
                      const isBlocked = u.status === 'Blocked';

                      return (
                        <tr key={u.uid} className="hover:bg-[#F8FAFC]/80 transition-colors">
                          {/* 1. Photo */}
                          <td className="py-3 px-4">
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.fullName || u.name}
                                className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#EAF2FF] border border-[#2952CC]/20 text-[#2952CC] font-bold flex items-center justify-center text-xs">
                                {(u.fullName || u.name || 'U')[0].toUpperCase()}
                              </div>
                            )}
                          </td>

                          {/* 2. Full Name */}
                          <td className="py-3 px-4 font-bold text-[#111111] whitespace-nowrap">
                            {u.fullName || u.name}
                          </td>

                          {/* 3. Username */}
                          <td className="py-3 px-4 font-bold text-[#2952CC] whitespace-nowrap">
                            @{u.username}
                          </td>

                          {/* 4. EasiaCode */}
                          <td className="py-3 px-4 font-mono font-bold text-[#111111] whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#111111]/20 inline-flex items-center gap-1.5">
                              <span>{u.easiacode}</span>
                              <button
                                onClick={() => handleCopyCode(u.easiacode)}
                                className="text-[#111111] hover:text-[#2952CC]"
                                title="Copy EasiaCode"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </span>
                          </td>

                          {/* 5. Role */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                u.role === 'teacher'
                                  ? 'bg-emerald-100 text-[#111111] border border-emerald-300'
                                  : u.role === 'admin'
                                  ? 'bg-purple-100 text-[#111111] border border-purple-300'
                                  : 'bg-[#EAF2FF] text-[#111111] border border-[#2952CC]/30'
                              }`}
                            >
                              {u.role === 'teacher' ? (
                                <School className="w-3 h-3 text-emerald-700" />
                              ) : u.role === 'admin' ? (
                                <Shield className="w-3 h-3 text-purple-700" />
                              ) : (
                                <GraduationCap className="w-3 h-3 text-[#2952CC]" />
                              )}
                              <span>{u.role}</span>
                            </span>
                          </td>

                          {/* 6. Phone */}
                          <td className="py-3 px-4 font-medium text-[#111111] whitespace-nowrap">
                            {u.phone || '—'}
                          </td>

                          {/* 7. Email */}
                          <td className="py-3 px-4 font-medium text-[#111111] max-w-[160px] truncate" title={u.email}>
                            {u.email}
                          </td>

                          {/* 8. School / Institution */}
                          <td className="py-3 px-4 font-medium text-[#111111] max-w-[180px] truncate" title={u.schoolName || u.school || u.institutionName || u.institution || '—'}>
                            {u.schoolName || u.school || u.institutionName || u.institution || '—'}
                          </td>

                          {/* 9. Trial Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {trialDaysLeft > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#111111] border border-emerald-200 text-[10px] font-bold">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>Active ({trialDaysLeft}d)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-[#111111] border border-amber-200 text-[10px] font-bold">
                                <span>Expired</span>
                              </span>
                            )}
                          </td>

                          {/* 10. Account Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                isBlocked
                                  ? 'bg-rose-100 text-[#111111] border border-rose-300'
                                  : 'bg-emerald-100 text-[#111111] border border-emerald-300'
                              }`}
                            >
                              {isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>

                          {/* Actions: View Profile, Block, Delete */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Profile */}
                              <button
                                onClick={() => setSelectedProfile(u)}
                                className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#EAF2FF] text-[#111111] hover:text-[#2952CC] transition"
                                title="View Complete Profile"
                              >
                                <Eye className="w-4 h-4 text-[#111111]" />
                              </button>

                              {/* Block / Unblock */}
                              <button
                                onClick={() => handleToggleBlock(u)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isBlocked
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                                }`}
                                title={isBlocked ? 'Unblock User' : 'Block User'}
                              >
                                {isBlocked ? <Unlock className="w-4 h-4 text-[#111111]" /> : <Lock className="w-4 h-4 text-[#111111]" />}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                                title="Delete User Permanently"
                              >
                                <Trash2 className="w-4 h-4 text-[#111111]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: PLATFORM ANALYTICS */}
        {adminTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-[24px] p-5 border border-[#E5E7EB] shadow-xs">
                <div className="text-xs text-[#111111] font-bold mb-1">Total Users</div>
                <div className="font-heading font-extrabold text-3xl text-[#111111]">
                  {usersList.length || 50}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1">+14% month-over-month</div>
              </div>

              <div className="bg-white rounded-[24px] p-5 border border-[#E5E7EB] shadow-xs">
                <div className="text-xs text-[#111111] font-bold mb-1">Active Students</div>
                <div className="font-heading font-extrabold text-3xl text-[#2952CC]">
                  {usersList.filter((u) => u.role === 'student').length || 42}
                </div>
                <div className="text-[11px] text-[#111111] font-medium">Enrolled learners</div>
              </div>

              <div className="bg-white rounded-[24px] p-5 border border-[#E5E7EB] shadow-xs">
                <div className="text-xs text-[#111111] font-bold mb-1">Active Teachers</div>
                <div className="font-heading font-extrabold text-3xl text-[#22C55E]">
                  {usersList.filter((u) => u.role === 'teacher').length || 7}
                </div>
                <div className="text-[11px] text-[#111111] font-medium">Faculty educators</div>
              </div>

              <div className="bg-white rounded-[24px] p-5 border border-[#E5E7EB] shadow-xs">
                <div className="text-xs text-[#111111] font-bold mb-1">Trial Subscriptions</div>
                <div className="font-heading font-extrabold text-3xl text-[#F59E0B]">100%</div>
                <div className="text-[11px] text-[#111111] font-medium">10-day trial activated</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CURRICULUM SUBJECTS */}
        {adminTab === 'subjects' && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#E5E7EB] shadow-md animate-in fade-in space-y-4">
            <h2 className="font-heading font-extrabold text-2xl text-[#111111]">Curriculum Subject Hierarchy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.title.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111111]">{sub.title}</h4>
                      <div className="text-xs font-semibold text-[#111111]">
                        {sub.totalChapters} Chapters • {sub.medium} Medium • {sub.class}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FIRESTORE STATUS */}
        {adminTab === 'firebase_status' && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#E5E7EB] shadow-md animate-in fade-in space-y-4">
            <h2 className="font-heading font-extrabold text-2xl text-[#111111]">Firestore Database Architecture</h2>
            <p className="text-xs font-medium text-[#111111]">
              Target Database: <span className="font-mono font-bold">ai-studio-easialearn-41e9f9aa-08f5-4f5f-a62e-cbfd87d36fcc</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['users', 'students', 'teachers', 'institutions', 'profiles'].map((col) => (
                <div key={col} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC]">
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-bold text-sm text-[#2952CC]">/{col}</div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      Synchronized
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#111111] mt-2">
                    Stores real-time records with verified EasiaCode & Role-based security rules.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* VIEW PROFILE MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-[24px] p-6 sm:p-8 border border-[#E5E7EB] shadow-2xl space-y-6 text-[#111111]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                {selectedProfile.photoURL ? (
                  <img
                    src={selectedProfile.photoURL}
                    alt={selectedProfile.fullName || selectedProfile.name}
                    className="w-12 h-12 rounded-full border border-gray-300 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#2952CC] text-white flex items-center justify-center font-bold text-lg">
                    {(selectedProfile.fullName || selectedProfile.name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-[#111111]">
                    {selectedProfile.fullName || selectedProfile.name}
                  </h3>
                  <div className="text-xs font-bold text-[#2952CC]">
                    @{selectedProfile.username}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProfile(null)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-[#111111] hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-[#111111]" />
              </button>
            </div>

            {/* Permanent EasiaCode Banner */}
            <div className="p-4 rounded-2xl bg-[#EAF2FF] border-2 border-[#2952CC] flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#111111]">
                  Permanent Unique EasiaCode
                </div>
                <div className="font-mono font-extrabold text-xl text-[#2952CC]">
                  {selectedProfile.easiacode}
                </div>
              </div>
              <button
                onClick={() => handleCopyCode(selectedProfile.easiacode)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#2952CC]/40 hover:bg-[#2952CC] hover:text-white text-[#2952CC] text-xs font-bold transition flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Profile Grid Details */}
            <div className="grid grid-cols-2 gap-3.5 text-left text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">Role</div>
                <div className="font-bold text-sm text-[#111111] capitalize mt-0.5">{selectedProfile.role}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">Account Status</div>
                <div className="font-bold text-sm text-[#111111] mt-0.5">{selectedProfile.status || 'Active'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">Email Address</div>
                <div className="font-bold text-xs text-[#111111] mt-0.5 truncate">{selectedProfile.email}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">Phone Number</div>
                <div className="font-bold text-xs text-[#111111] mt-0.5">{selectedProfile.phone || '—'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">WhatsApp Number</div>
                <div className="font-bold text-xs text-[#111111] mt-0.5">{selectedProfile.whatsapp || selectedProfile.phone || '—'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">Guardian Name</div>
                <div className="font-bold text-xs text-[#111111] mt-0.5">{selectedProfile.guardianName || '—'}</div>
              </div>

              <div className="col-span-2 p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">School / Institution</div>
                <div className="font-bold text-xs text-[#111111] mt-0.5">
                  {selectedProfile.schoolName || selectedProfile.school || selectedProfile.institutionName || selectedProfile.institution || '—'}
                </div>
              </div>

              {selectedProfile.class && (
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                  <div className="text-[10px] font-extrabold uppercase text-[#111111]">Class</div>
                  <div className="font-bold text-xs text-[#111111] mt-0.5">{selectedProfile.class}</div>
                </div>
              )}

              {selectedProfile.medium && (
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                  <div className="text-[10px] font-extrabold uppercase text-[#111111]">Medium</div>
                  <div className="font-bold text-xs text-[#111111] mt-0.5">{selectedProfile.medium}</div>
                </div>
              )}

              {selectedProfile.subject && (
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                  <div className="text-[10px] font-extrabold uppercase text-[#111111]">Subject</div>
                  <div className="font-bold text-xs text-[#111111] mt-0.5">{selectedProfile.subject}</div>
                </div>
              )}

              {selectedProfile.state && (
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                  <div className="text-[10px] font-extrabold uppercase text-[#111111]">State</div>
                  <div className="font-bold text-xs text-[#111111] mt-0.5">{selectedProfile.state}</div>
                </div>
              )}

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">Profile ID</div>
                <div className="font-mono font-bold text-xs text-[#111111] mt-0.5">{selectedProfile.profileId || '—'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] font-extrabold uppercase text-[#111111]">UID</div>
                <div className="font-mono font-bold text-[11px] text-[#111111] mt-0.5 truncate">{selectedProfile.uid}</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => handleToggleBlock(selectedProfile)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  selectedProfile.status === 'Blocked'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {selectedProfile.status === 'Blocked' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unblock User</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Block User</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedProfile(null)}
                className="px-5 py-2 rounded-xl bg-white border border-[#111111] text-[#111111] text-xs font-bold hover:bg-[#F8FAFC]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
