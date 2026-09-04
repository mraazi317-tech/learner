import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LiveClass, ClassParticipant, ClassAttendanceRecord } from '../../types';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ScreenShare,
  StopCircle,
  Hand,
  MessageSquare,
  Users,
  ClipboardList,
  PenTool,
  Eraser,
  RotateCcw,
  Maximize2,
  Minimize2,
  PhoneOff,
  VolumeX,
  Radio,
  CheckCircle2,
  Download,
  Send,
  Sparkles,
  Shield,
  Clock,
  Circle,
  X,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  liveClass: LiveClass;
  onClose: () => void;
}

export const LiveClassroomModal: React.FC<Props> = ({ liveClass, onClose }) => {
  const { user } = useAuth();
  const { userPlan, setIsProModalOpen, triggerCelebration } = useApp();

  const isTeacher = user?.role === 'teacher' || liveClass.teacherId === user?.uid;
  const isStudent = !isTeacher;

  // Media States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active view mode: 'video' | 'screenshare' | 'whiteboard'
  const [mainView, setMainView] = useState<'video' | 'screenshare' | 'whiteboard'>('video');

  // Sidebars: 'none' | 'chat' | 'participants' | 'attendance'
  const [activeSidebar, setActiveSidebar] = useState<'none' | 'chat' | 'participants' | 'attendance'>('none');

  // Video element ref for real webcam if available
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const classroomContainerRef = useRef<HTMLDivElement>(null);

  // Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#2952CC');
  const [penWidth, setPenWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ id: string; senderName: string; senderRole: string; text: string; time: string }[]>([
    {
      id: 'msg_1',
      senderName: liveClass.teacherName,
      senderRole: 'teacher',
      text: `Welcome everyone to "${liveClass.title}". Please keep your microphones muted unless asking a doubt.`,
      time: '10:00 AM'
    },
    {
      id: 'msg_2',
      senderName: 'Amina Sheikh',
      senderRole: 'student',
      text: 'Good morning Sir! Screen is crystal clear.',
      time: '10:01 AM'
    },
    {
      id: 'msg_3',
      senderName: 'Rohan Varma',
      senderRole: 'student',
      text: 'Good morning Sir, ready for the derivations.',
      time: '10:02 AM'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Participants State
  const [participants, setParticipants] = useState<ClassParticipant[]>([
    {
      id: 'p_teacher',
      classId: liveClass.classId,
      userId: liveClass.teacherId,
      userName: liveClass.teacherName,
      userRole: 'teacher',
      photoURL: liveClass.teacherPhoto,
      joinedAt: '10:00 AM',
      isAudioMuted: false,
      isVideoMuted: false,
      isHandRaised: false
    },
    {
      id: 'p_stu_1',
      classId: liveClass.classId,
      userId: 'student_1',
      userName: 'Amina Sheikh',
      easiacode: 'EA-STU-8K29Q',
      userRole: 'student',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedAt: '10:01 AM',
      isAudioMuted: true,
      isVideoMuted: false,
      isHandRaised: false
    },
    {
      id: 'p_stu_2',
      classId: liveClass.classId,
      userId: 'student_2',
      userName: 'Rohan Varma',
      easiacode: 'EA-STU-4M77P',
      userRole: 'student',
      photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      joinedAt: '10:02 AM',
      isAudioMuted: true,
      isVideoMuted: false,
      isHandRaised: true
    },
    {
      id: 'p_stu_3',
      classId: liveClass.classId,
      userId: 'student_3',
      userName: 'Priya Patil',
      easiacode: 'EA-STU-9W33B',
      userRole: 'student',
      photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      joinedAt: '10:03 AM',
      isAudioMuted: true,
      isVideoMuted: false,
      isHandRaised: false
    },
    {
      id: 'p_stu_4',
      classId: liveClass.classId,
      userId: 'student_4',
      userName: 'Karthik Gowda',
      easiacode: 'EA-STU-2X88K',
      userRole: 'student',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      joinedAt: '10:05 AM',
      isAudioMuted: true,
      isVideoMuted: true,
      isHandRaised: false
    }
  ]);

  // Attendance Log
  const [attendanceRecords, setAttendanceRecords] = useState<ClassAttendanceRecord[]>([
    {
      id: 'att_1',
      classId: liveClass.classId,
      classTitle: liveClass.title,
      studentId: 'student_1',
      studentName: 'Amina Sheikh',
      studentEasiaCode: 'EA-STU-8K29Q',
      date: liveClass.date,
      durationAttendedMinutes: 45,
      status: 'Present',
      markedAt: '10:01 AM'
    },
    {
      id: 'att_2',
      classId: liveClass.classId,
      classTitle: liveClass.title,
      studentId: 'student_2',
      studentName: 'Rohan Varma',
      studentEasiaCode: 'EA-STU-4M77P',
      date: liveClass.date,
      durationAttendedMinutes: 44,
      status: 'Present',
      markedAt: '10:02 AM'
    },
    {
      id: 'att_3',
      classId: liveClass.classId,
      classTitle: liveClass.title,
      studentId: 'student_3',
      studentName: 'Priya Patil',
      studentEasiaCode: 'EA-STU-9W33B',
      date: liveClass.date,
      durationAttendedMinutes: 43,
      status: 'Present',
      markedAt: '10:03 AM'
    },
    {
      id: 'att_4',
      classId: liveClass.classId,
      classTitle: liveClass.title,
      studentId: 'student_4',
      studentName: 'Karthik Gowda',
      studentEasiaCode: 'EA-STU-2X88K',
      date: liveClass.date,
      durationAttendedMinutes: 41,
      status: 'Late',
      markedAt: '10:05 AM'
    }
  ]);

  // Handle Recording Timer
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // WebCam setup
  useEffect(() => {
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          setMediaStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (e) {
        console.log('Camera access unavailable or declined, using simulated HD video stream:', e);
      }
    }
    startCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Sync mic track
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
    }
  }, [isMicOn, mediaStream]);

  // Sync video track
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOn;
      });
    }
  }, [isVideoOn, mediaStream]);

  // Toggle Screen Sharing
  const handleToggleScreenShare = async () => {
    if (isStudent) {
      alert('Students are not permitted to share their screen in this classroom.');
      return;
    }

    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      setMainView('video');
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenStream(stream);
          if (screenShareVideoRef.current) {
            screenShareVideoRef.current.srcObject = stream;
          }
          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setMainView('video');
          };
          setIsScreenSharing(true);
          setMainView('screenshare');
        } else {
          setIsScreenSharing(true);
          setMainView('screenshare');
        }
      } catch (err) {
        // User cancelled picker, fallback to presentation demo mode
        setIsScreenSharing(true);
        setMainView('screenshare');
      }
    }
  };

  // Toggle Whiteboard
  const handleToggleWhiteboard = () => {
    if (isStudent) {
      // Students can view whiteboard if open
      setMainView((prev) => (prev === 'whiteboard' ? 'video' : 'whiteboard'));
      return;
    }
    if (mainView === 'whiteboard') {
      setIsWhiteboardActive(false);
      setMainView('video');
    } else {
      setIsWhiteboardActive(true);
      setMainView('whiteboard');
    }
  };

  // Whiteboard drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isStudent) return; // students view only
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isStudent) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = isEraser ? 20 : penWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : penColor;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Mute All (Teacher Only)
  const handleMuteAll = () => {
    if (!isTeacher) return;
    setParticipants((prev) =>
      prev.map((p) => (p.userRole === 'student' ? { ...p, isAudioMuted: true } : p))
    );
    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        senderName: 'Classroom Host',
        senderRole: 'system',
        text: 'Teacher muted all student microphones.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Toggle Hand Raise (Student)
  const handleToggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    setParticipants((prev) =>
      prev.map((p) => (p.userId === user?.uid || p.id === 'p_stu_1' ? { ...p, isHandRaised: nextState } : p))
    );
    if (nextState) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `hand_${Date.now()}`,
          senderName: user?.name || 'Student',
          senderRole: 'student',
          text: '✋ Raised hand to ask a question.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Record Session (Ultra Feature Gate)
  const handleToggleRecord = () => {
    if (!isTeacher) return;
    // Check Ultra or Annual plan
    if (userPlan !== 'ultra' && userPlan !== 'annual') {
      setIsProModalOpen(true);
      return;
    }
    setIsRecording((prev) => !prev);
    if (!isRecording) {
      triggerCelebration();
    }
  };

  // Send In-Class Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `chat_${Date.now()}`,
      senderName: user?.name || (isTeacher ? liveClass.teacherName : 'Student'),
      senderRole: isTeacher ? 'teacher' : 'student',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setTimeout(() => {
      if (chatBottomRef.current) {
        chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!classroomContainerRef.current) return;
    if (!document.fullscreenElement) {
      classroomContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Download Attendance CSV
  const handleDownloadAttendance = () => {
    const headers = 'Student Name,EasiaCode,Date,Class Title,Duration (Min),Status,Marked At\n';
    const rows = attendanceRecords
      .map(
        (r) =>
          `"${r.studentName}","${r.studentEasiaCode}","${r.date}","${r.classTitle}",${r.durationAttendedMinutes},"${r.status}","${r.markedAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${liveClass.classId}_${liveClass.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerCelebration();
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={classroomContainerRef}
      className="fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col overflow-hidden font-sans select-none"
    >
      {/* 1. TOP STATUS BAR */}
      <header className="h-16 px-4 sm:px-6 bg-[#1E293B]/90 border-b border-slate-700/60 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE</span>
          </div>

          <div className="hidden sm:block">
            <h1 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
              {liveClass.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{liveClass.subject}</span>
              <span>•</span>
              <span className="font-mono text-[#4F7DF3] font-semibold">{liveClass.classId}</span>
              <span>•</span>
              <span>Host: {liveClass.teacherName}</span>
            </div>
          </div>
        </div>

        {/* Recording Status & Top Actions */}
        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/50 text-xs font-semibold">
              <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-ping" />
              <span>REC {formatTimer(recordTime)}</span>
            </div>
          )}

          {/* View Mode Switchers for Teacher */}
          <div className="hidden md:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setMainView('video')}
              className={`px-3 py-1.5 rounded-lg transition ${
                mainView === 'video' ? 'bg-[#2952CC] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gallery Grid
            </button>
            <button
              onClick={handleToggleScreenShare}
              className={`px-3 py-1.5 rounded-lg transition ${
                mainView === 'screenshare' ? 'bg-[#2952CC] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Screen Share
            </button>
            <button
              onClick={handleToggleWhiteboard}
              className={`px-3 py-1.5 rounded-lg transition ${
                mainView === 'whiteboard' ? 'bg-[#2952CC] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Whiteboard
            </button>
          </div>

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>{isTeacher ? 'End Class' : 'Leave'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN STAGE + SIDEBAR AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Stage */}
        <main className="flex-1 flex flex-col p-4 overflow-y-auto relative bg-[#0B0F19]">
          {/* A. SCREEN SHARE VIEW */}
          {mainView === 'screenshare' && (
            <div className="flex-1 bg-black rounded-2xl overflow-hidden border border-slate-800 flex flex-col relative">
              <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ScreenShare className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">
                    {liveClass.teacherName}'s Live Presentation Screen
                  </span>
                </div>
                {isTeacher && (
                  <button
                    onClick={handleToggleScreenShare}
                    className="text-red-400 hover:text-red-300 font-bold"
                  >
                    Stop Sharing
                  </button>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center p-6 bg-radial from-slate-900 to-black relative">
                {screenStream ? (
                  <video
                    ref={screenShareVideoRef}
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                  />
                ) : (
                  <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-8 shadow-2xl space-y-6">
                    <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#2952CC] uppercase tracking-wider">
                          EasiaLearn Live Class Deck
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">
                          {liveClass.title}
                        </h2>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        Slide 1 of 8
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <h4 className="font-bold text-[#2952CC] text-sm">Key Learning Objective:</h4>
                        <p className="text-sm text-slate-700 mt-1">
                          Understand the standard form of quadratic equations ax² + bx + c = 0, discriminant analysis (D = b² - 4ac), and nature of real versus complex roots.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <h5 className="font-bold text-xs text-slate-500 uppercase">Case 1: D &gt; 0</h5>
                          <p className="text-sm font-semibold text-slate-800 mt-1">Two distinct real roots.</p>
                          <code className="text-xs font-mono bg-white p-1.5 block mt-2 rounded border border-slate-200 text-blue-600">
                            x = (-b ± √D) / 2a
                          </code>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <h5 className="font-bold text-xs text-slate-500 uppercase">Case 2: D = 0</h5>
                          <p className="text-sm font-semibold text-slate-800 mt-1">Two equal real roots.</p>
                          <code className="text-xs font-mono bg-white p-1.5 block mt-2 rounded border border-slate-200 text-blue-600">
                            x = -b / 2a
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* B. WHITEBOARD VIEW */}
          {mainView === 'whiteboard' && (
            <div className="flex-1 bg-white text-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex flex-col relative shadow-2xl">
              {/* Whiteboard Toolbar */}
              <div className="h-12 px-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2952CC] text-white flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    Interactive Collaborative Whiteboard
                  </span>
                </div>

                {isTeacher ? (
                  <div className="flex items-center gap-3">
                    {/* Color Palette */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                      {['#2952CC', '#EF4444', '#10B981', '#111827', '#F59E0B'].map((col) => (
                        <button
                          key={col}
                          onClick={() => {
                            setPenColor(col);
                            setIsEraser(false);
                          }}
                          style={{ backgroundColor: col }}
                          className={`w-5 h-5 rounded-full transition-transform ${
                            penColor === col && !isEraser ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setIsEraser(!isEraser)}
                      className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                        isEraser ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                      title="Eraser"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Eraser</span>
                    </button>

                    <button
                      onClick={clearWhiteboard}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                      title="Clear Board"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-medium italic">
                    Viewing teacher whiteboard in real-time
                  </span>
                )}
              </div>

              {/* Canvas Area */}
              <div className="flex-1 relative bg-white overflow-hidden cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={800}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-full block touch-none"
                />
              </div>
            </div>
          )}

          {/* C. GALLERY GRID VIEW */}
          {mainView === 'video' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
              {/* 1. Teacher Spotlight Card (Takes 2x2 grid in desktop) */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-[#1E293B] rounded-2xl border-2 border-[#2952CC]/50 overflow-hidden relative group shadow-2xl flex flex-col justify-between">
                {/* Video / Stream */}
                <div className="absolute inset-0 flex items-center justify-center bg-radial from-slate-800 to-slate-950">
                  {isVideoOn && isTeacher ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2952CC] to-[#4F7DF3] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl ring-4 ring-[#2952CC]/30">
                        {liveClass.teacherName.charAt(0)}
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-white text-lg">{liveClass.teacherName}</h3>
                        <p className="text-xs text-slate-400">Classroom Host & Educator</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Badges Overlay */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-white border border-white/10">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>Teacher Spotlight</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#2952CC] text-white text-[11px] font-bold">
                      HD 1080p
                    </span>
                  </div>
                </div>

                <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{liveClass.teacherName}</span>
                    <span className="text-xs text-slate-300">(Teacher)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMicOn ? (
                      <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Mic className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        <MicOff className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Student Video Tiles */}
              {participants
                .filter((p) => p.userRole === 'student')
                .map((student) => {
                  return (
                    <div
                      key={student.id}
                      className="bg-[#1E293B] rounded-2xl border border-slate-800 overflow-hidden relative group shadow-md flex flex-col justify-between min-h-[160px]"
                    >
                      {/* Video Stream or Avatar */}
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        {student.photoURL && !student.isVideoMuted ? (
                          <img
                            src={student.photoURL}
                            alt={student.userName}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-slate-700 text-white flex items-center justify-center text-lg font-bold border border-slate-600">
                            {student.userName.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Top status badges */}
                      <div className="relative z-10 p-2.5 flex items-center justify-between">
                        {student.isHandRaised ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-lg animate-bounce">
                            <Hand className="w-3 h-3 fill-slate-950" />
                            <span>Hand Raised</span>
                          </span>
                        ) : (
                          <div />
                        )}

                        <div className="p-1 rounded-full bg-black/60 text-slate-300">
                          {student.isAudioMuted ? (
                            <MicOff className="w-3 h-3 text-red-400" />
                          ) : (
                            <Mic className="w-3 h-3 text-emerald-400" />
                          )}
                        </div>
                      </div>

                      {/* Bottom Name bar */}
                      <div className="relative z-10 p-2.5 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate max-w-[120px]">
                          {student.userName}
                        </span>
                        {student.easiacode && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {student.easiacode}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </main>

        {/* B. SLIDE-OUT SIDEBARS (Chat, Participants, Attendance) */}
        <AnimatePresence>
          {activeSidebar !== 'none' && (
            <motion.aside
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-80 sm:w-96 bg-[#1E293B] border-l border-slate-700 flex flex-col shrink-0 z-30 shadow-2xl"
            >
              {/* Sidebar Header */}
              <div className="h-14 px-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-sm text-white capitalize flex items-center gap-2">
                  {activeSidebar === 'chat' && (
                    <>
                      <MessageSquare className="w-4 h-4 text-[#4F7DF3]" />
                      <span>Classroom Live Chat</span>
                    </>
                  )}
                  {activeSidebar === 'participants' && (
                    <>
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Participants ({participants.length})</span>
                    </>
                  )}
                  {activeSidebar === 'attendance' && (
                    <>
                      <ClipboardList className="w-4 h-4 text-amber-400" />
                      <span>Live Attendance Log</span>
                    </>
                  )}
                </h3>

                <button
                  onClick={() => setActiveSidebar('none')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. CHAT CONTENT */}
              {activeSidebar === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          msg.senderRole === 'teacher'
                            ? 'bg-[#2952CC]/20 border border-[#2952CC]/40 text-slate-100'
                            : msg.senderRole === 'system'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200 text-center italic'
                            : 'bg-slate-800 border border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold ${
                              msg.senderRole === 'teacher' ? 'text-[#4F7DF3]' : 'text-white'
                            }`}
                          >
                            {msg.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                        <p className="leading-relaxed break-words">{msg.text}</p>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type a message or question..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2952CC]"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="p-2 rounded-xl bg-[#2952CC] hover:bg-[#1f40a6] text-white disabled:opacity-40 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* 2. PARTICIPANTS CONTENT */}
              {activeSidebar === 'participants' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {isTeacher && (
                    <div className="p-3 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">Host Controls</span>
                      <button
                        onClick={handleMuteAll}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 border border-red-500/40 text-xs font-bold hover:bg-red-600/30 transition flex items-center gap-1.5"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Mute All</span>
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                            {p.photoURL ? (
                              <img src={p.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              p.userName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-white truncate max-w-[130px]">
                                {p.userName}
                              </span>
                              {p.userRole === 'teacher' && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                                  Host
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Joined {p.joinedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {p.isHandRaised && (
                            <Hand className="w-4 h-4 text-amber-400 fill-amber-400" />
                          )}
                          {p.isAudioMuted ? (
                            <MicOff className="w-4 h-4 text-red-400" />
                          ) : (
                            <Mic className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. ATTENDANCE CONTENT */}
              {activeSidebar === 'attendance' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Verified Attendance
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {attendanceRecords.length} Students Logged
                      </span>
                    </div>

                    <button
                      onClick={handleDownloadAttendance}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {attendanceRecords.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{att.studentName}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                att.status === 'Present'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {att.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
                            <span>{att.studentEasiaCode}</span>
                            <span>•</span>
                            <span>Marked {att.markedAt}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-[#4F7DF3]">
                            {att.durationAttendedMinutes} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* 3. BOTTOM FLOATING CONTROL DOCK */}
      <footer className="h-20 px-4 sm:px-8 bg-[#1E293B] border-t border-slate-700 flex items-center justify-between shrink-0 z-20">
        {/* Left Side: Audio & Video controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 rounded-2xl transition flex items-center gap-2 text-xs font-bold ${
              isMicOn
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{isMicOn ? 'Mute' : 'Unmuted'}</span>
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-2xl transition flex items-center gap-2 text-xs font-bold ${
              isVideoOn
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoOn ? 'Stop Video' : 'Start Video'}
          >
            {isVideoOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>
        </div>

        {/* Center: Collaboration Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Screen Share (Teacher only) */}
          {isTeacher ? (
            <button
              onClick={handleToggleScreenShare}
              className={`p-3 rounded-2xl transition flex items-center gap-2 text-xs font-bold ${
                isScreenSharing
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
              title="Share Screen"
            >
              <ScreenShare className="w-5 h-5" />
              <span className="hidden md:inline">
                {isScreenSharing ? 'Sharing' : 'Share Screen'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => alert('Students cannot share screen in this classroom.')}
              className="p-3 rounded-2xl bg-slate-800/50 text-slate-500 cursor-not-allowed hidden sm:flex items-center gap-2 text-xs font-medium"
              title="Screen Share disabled for students"
            >
              <ScreenShare className="w-5 h-5 opacity-40" />
              <span className="hidden md:inline">Screen Share (Host Only)</span>
            </button>
          )}

          {/* Whiteboard */}
          <button
            onClick={handleToggleWhiteboard}
            className={`p-3 rounded-2xl transition flex items-center gap-2 text-xs font-bold ${
              mainView === 'whiteboard'
                ? 'bg-[#2952CC] text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
            title="Interactive Whiteboard"
          >
            <PenTool className="w-5 h-5" />
            <span className="hidden md:inline">Whiteboard</span>
          </button>

          {/* Raise Hand */}
          <button
            onClick={handleToggleHandRaise}
            className={`p-3 rounded-2xl transition flex items-center gap-2 text-xs font-bold ${
              isHandRaised
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
            <span className="hidden md:inline">
              {isHandRaised ? 'Hand Raised' : 'Raise Hand'}
            </span>
          </button>

          {/* Teacher Mute All Button */}
          {isTeacher && (
            <button
              onClick={handleMuteAll}
              className="p-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition flex items-center gap-2 text-xs font-bold"
              title="Mute All Students"
            >
              <VolumeX className="w-5 h-5" />
              <span className="hidden lg:inline">Mute All</span>
            </button>
          )}

          {/* Recording Button (Ultra gate) */}
          {isTeacher && (
            <button
              onClick={handleToggleRecord}
              className={`p-3 rounded-2xl transition flex items-center gap-2 text-xs font-bold ${
                isRecording
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
              title="Record Session (Ultra Plan)"
            >
              <Circle className={`w-5 h-5 ${isRecording ? 'fill-white' : 'text-red-400'}`} />
              <span className="hidden lg:inline">
                {isRecording ? 'Recording...' : 'Record'}
              </span>
              {userPlan !== 'ultra' && userPlan !== 'annual' && (
                <span className="text-[10px] px-1 rounded bg-amber-400/20 text-amber-300 font-bold">
                  Ultra
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Side: Sidebars Toggles (Chat, Participants, Attendance) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() =>
              setActiveSidebar((prev) => (prev === 'chat' ? 'none' : 'chat'))
            }
            className={`p-3 rounded-2xl transition relative ${
              activeSidebar === 'chat'
                ? 'bg-[#2952CC] text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#4F7DF3] text-[10px] font-bold flex items-center justify-center text-white">
              {chatMessages.length}
            </span>
          </button>

          <button
            onClick={() =>
              setActiveSidebar((prev) => (prev === 'participants' ? 'none' : 'participants'))
            }
            className={`p-3 rounded-2xl transition relative ${
              activeSidebar === 'participants'
                ? 'bg-[#2952CC] text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
            title="Participants"
          >
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold flex items-center justify-center text-slate-950">
              {participants.length}
            </span>
          </button>

          <button
            onClick={() =>
              setActiveSidebar((prev) => (prev === 'attendance' ? 'none' : 'attendance'))
            }
            className={`p-3 rounded-2xl transition ${
              activeSidebar === 'attendance'
                ? 'bg-[#2952CC] text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
            title="Attendance"
          >
            <ClipboardList className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
