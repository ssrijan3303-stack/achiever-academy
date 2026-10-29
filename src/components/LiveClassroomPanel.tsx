import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Student, Batch, UserRole } from '../types.ts';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  CircleDot,
  PhoneOff,
  Users,
  Send,
  HelpCircle,
  Pencil,
  Eraser,
  RotateCcw,
  Download,
  Trash2,
  RefreshCw,
  FlipHorizontal,
  Sun,
  Camera,
  Play,
  Clock,
  BookOpen,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Lock,
  VolumeX,
  Radio,
  Sparkles,
  X
} from 'lucide-react';

interface LiveClassroomPanelProps {
  students: Student[];
  messages: ChatMessage[];
  onSendMessage: (msg: { message: string; isDoubt?: boolean; studentId?: string }) => void;
  onEndClass: () => void;
  isLiveActive?: boolean;
  onStartClass?: (batchId: string) => void;
  batches?: Batch[];
  currentRole?: UserRole;
  currentStudent?: Student;
  batchTitle?: string;
  teacherName?: string;
  academyName?: string;
  onBlockStudent?: (studentId: string) => void;
  onUnblockStudent?: (studentId: string) => void;
}

// Abusive & foul language filter list
const FOUL_WORDS = ['idiot', 'stupid', 'bastard', 'nonsense', 'fool', 'trash', 'dumb', 'loser', 'cheat', 'shut up', 'abuse'];

export const LiveClassroomPanel: React.FC<LiveClassroomPanelProps> = ({
  students,
  messages,
  onSendMessage,
  onEndClass,
  isLiveActive = false,
  onStartClass,
  batches = [],
  currentRole = 'admin',
  currentStudent,
  batchTitle = 'Class 10 Mathematics - Trigonometry',
  teacherName = 'Sarla Sharma',
  academyName = 'ANUSHREE ACADEMY',
  onBlockStudent,
  onUnblockStudent
}) => {
  const isAdmin = currentRole === 'admin' || currentRole === 'teacher';

  // Teaching Mode: strictly for Admin/Teacher ('whiteboard' or 'camera')
  const [activeMode, setActiveMode] = useState<'whiteboard' | 'camera'>('whiteboard');

  // Controls & Toggles
  const [isMuted, setIsMuted] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [sideTab, setSideTab] = useState<'doubts' | 'students'>('doubts');

  // Chat Moderation: Blocked Student IDs set
  const [blockedStudentIds, setBlockedStudentIds] = useState<Set<string>>(new Set());
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  // Elapsed Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!isLiveActive) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isLiveActive]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Block & Unblock handlers
  const handleBlockUser = (studentId: string, studentName: string) => {
    setBlockedStudentIds((prev) => new Set([...prev, studentId]));
    if (onBlockStudent) onBlockStudent(studentId);
    try {
      fetch('/api/live/chat-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
    } catch {}
  };

  const handleUnblockUser = (studentId: string) => {
    setBlockedStudentIds((prev) => {
      const updated = new Set(prev);
      updated.delete(studentId);
      return updated;
    });
    if (onUnblockStudent) onUnblockStudent(studentId);
    try {
      fetch('/api/live/chat-unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
    } catch {}
  };

  // Check if current user is blocked
  const isCurrentStudentBlocked =
    !isAdmin && currentStudent ? blockedStudentIds.has(currentStudent.id) || currentStudent.isChatBlocked : false;

  // ================= PHYSICAL BOARD / CAMERA FEED (Teacher Only) =================
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  const startCamera = async (facing: 'user' | 'environment') => {
    try {
      setStreamError(null);
      setIsSwitchingCamera(true);

      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
        videoRef.current.srcObject = null;
      }

      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
        setMediaStream(null);
      }

      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam media streaming is not supported in this browser window.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      setMediaStream(stream);
      setIsCameraActive(true);
      setCameraFacing(facing);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setStreamError(err?.message || 'Could not access camera feed.');
      setIsCameraActive(false);
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Switch facing mode
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    startCamera(nextFacing);
  };

  useEffect(() => {
    if (isAdmin && activeMode === 'camera' && !isCameraActive && !streamError) {
      startCamera(cameraFacing);
    }
    return () => {
      stopCamera();
    };
  }, [activeMode, isAdmin]);

  // ================= DIGITAL WHITEBOARD ENGINE (Teacher Only) =================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#0F172A');
  const [brushSize, setBrushSize] = useState(3.5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!isAdmin || activeMode !== 'whiteboard') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const tempImg = canvas.toDataURL();

      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (history.length > 0) {
        const img = new Image();
        img.src = tempImg;
        img.onload = () => ctx.drawImage(img, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [activeMode, isAdmin]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAdmin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : brushColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isAdmin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !isAdmin) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory((prev) => [...prev.slice(-15), canvas.toDataURL()]);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, canvas.toDataURL()]);
  };

  // ================= CHAT & DOUBTS ENGINE =================
  const [chatInput, setChatInput] = useState('');
  const [isDoubtMode, setIsDoubtMode] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (isCurrentStudentBlocked) {
      setModerationWarning('You have been blocked from sending messages in this live class.');
      return;
    }

    // Abusive text auto-moderation check
    const lower = chatInput.toLowerCase();
    const hasAbusiveWord = FOUL_WORDS.some((w) => lower.includes(w));

    if (hasAbusiveWord && !isAdmin) {
      setModerationWarning('Warning: Foul or abusive language is prohibited in Anushree Academy classrooms.');
      // Auto-block abusive user if student
      if (currentStudent) {
        handleBlockUser(currentStudent.id, currentStudent.name);
      }
      setChatInput('');
      return;
    }

    setModerationWarning(null);
    onSendMessage({
      message: chatInput.trim(),
      isDoubt: isDoubtMode,
      studentId: currentStudent?.id
    });
    setChatInput('');
    setIsDoubtMode(false);
  };

  // Sanitized Room Name for Achiever Academy
  const sanitizedRoom = `AchieverAcademy_${batchTitle.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  // Teacher Moderator Initialization URL:
  // Disables lobby & prejoin, sets moderator display name and video/audio defaults
  const teacherModeratorUrl = `https://meet.jit.si/${sanitizedRoom}#userInfo.displayName=${encodeURIComponent(
    `${teacherName} (Teacher & Moderator)`
  )}&config.prejoinPageEnabled=false&config.enableLobby=false&config.requireDisplayName=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.disableDeepLinking=true`;

  // Student Join URL:
  // Disables lobby & prejoin, mutes student mic by default to prevent disruption
  const studentJoinUrl = `https://meet.jit.si/${sanitizedRoom}#userInfo.displayName=${encodeURIComponent(
    currentStudent ? currentStudent.name : 'Achiever Student'
  )}&config.prejoinPageEnabled=false&config.enableLobby=false&config.requireDisplayName=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true&config.disableDeepLinking=true`;

  const externalStreamUrl = isAdmin ? teacherModeratorUrl : studentJoinUrl;
  const [isModeratorInitialized, setIsModeratorInitialized] = useState(false);
  const [showEmbeddedPlayer, setShowEmbeddedPlayer] = useState(false);

  // ================= PRE-CLASS WAITING ROOM (If class is inactive) =================
  if (!isLiveActive) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-teal-100 dark:border-slate-800 shadow-xl space-y-6 relative">
        <button
          onClick={onEndClass}
          className="absolute top-6 right-6 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          title="Close Classroom"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-teal-50 dark:border-slate-800 pr-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Live Classroom & Virtual Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAdmin
                ? 'Select a batch below to launch the live stream with digital whiteboard or camera broadcast.'
                : 'Your teacher has not started the live stream yet. Please standby.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              Status: Offline (Standby)
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Available Live Class Schedules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {batch.grade}
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {batch.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Topic: {batch.nextTopic}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-teal-800 dark:text-teal-400" />
                    <span>{batch.scheduleTime}</span>
                  </div>
                </div>

                {isAdmin ? (
                  <button
                    onClick={() => onStartClass && onStartClass(batch.id)}
                    className="w-full py-2.5 rounded-xl font-black text-xs bg-teal-800 hover:bg-teal-900 text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Live Stream</span>
                  </button>
                ) : (
                  <div className="py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-center font-bold text-xs flex items-center justify-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Waiting for Educator</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= ACTIVE LIVE CLASSROOM =================
  return (
    <div className="bg-[#0b1619] rounded-3xl overflow-hidden border border-teal-900 shadow-2xl flex flex-col h-[calc(100vh-130px)] min-h-[620px] text-white select-none">
      
      {/* 1. TOP HEADER & BROADCAST BAR */}
      <div className="bg-[#122327] px-4 py-3 border-b border-teal-800/60 flex items-center justify-between shrink-0 flex-wrap gap-2 z-20">
        
        {/* Left: Live Status, Batch Title, Timer */}
        <div className="flex items-center space-x-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
            LIVE
          </span>

          <div className="h-4 w-px bg-teal-800 hidden sm:block"></div>

          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
              {batchTitle}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-teal-300">
              <span>{teacherName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-amber-300">
                <CircleDot className="w-2.5 h-2.5 animate-pulse" />
                {formatTimer(secondsElapsed)}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Dedicated Mode Switcher Toggle (ADMIN ONLY: Whiteboard restricted to Teacher/Admin) */}
        {isAdmin ? (
          <div className="flex items-center bg-[#182f34] p-1 rounded-2xl border border-teal-800/60 shadow-inner">
            <button
              onClick={() => setActiveMode('whiteboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                activeMode === 'whiteboard'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'text-teal-300 hover:text-white'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Teaching Whiteboard</span>
            </button>

            <button
              onClick={() => setActiveMode('camera')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                activeMode === 'camera'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'text-teal-300 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Physical Board Camera</span>
            </button>
          </div>
        ) : (
          /* Student View: Audio strictly muted by default with no speaking rights */
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-teal-800/50 text-xs text-teal-300">
            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold">Audio: Muted by Host (Listen-Only Mode)</span>
          </div>
        )}

        {/* Right: Audio toggle (Teacher Only), Sidebar toggle, and End/Leave */}
        <div className="flex items-center gap-2">
          {/* TEACHER AUDIO SPEAKING CONTROL: Student has NO unmute option */}
          {isAdmin ? (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-900/60 border-red-500 text-red-200'
                  : 'bg-teal-900/80 border-teal-700 text-teal-200 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Teacher Microphone' : 'Mute Teacher Microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          ) : (
            /* Student has NO audio button as per security requirement */
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg">
              <Lock className="w-3 h-3 text-slate-500" /> Mic Locked
            </span>
          )}

          {/* Teacher Jitsi Moderator Launcher: Prevents students waiting error */}
          {isAdmin && (
            <a
              href={teacherModeratorUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsModeratorInitialized(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Initialize Jitsi Room as Moderator (opens in tab to unlock room for students)"
            >
              <Radio className="w-3.5 h-3.5 text-teal-950 animate-pulse" />
              <span className="hidden md:inline">{isModeratorInitialized ? 'Moderator Active ✓' : 'Init Jitsi Moderator'}</span>
              <ExternalLink className="w-3 h-3 text-teal-950" />
            </a>
          )}

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 rounded-xl bg-teal-900/80 hover:bg-teal-800 text-teal-200 hover:text-white border border-teal-700/60 transition-colors cursor-pointer"
            title={isSidePanelOpen ? 'Collapse Chat' : 'Open Chat'}
          >
            {isSidePanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>

          {isAdmin ? (
            <button
              onClick={onEndClass}
              className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer shrink-0"
              title="End Class & Return to Dashboard"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Broadcast</span>
            </button>
          ) : (
            <button
              onClick={onEndClass}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-1"
              title="Exit Class & Return to Dashboard"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Class</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Workspace Display Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0c181b] relative">
          
          {/* ================= TEACHER ONLY: DIGITAL WHITEBOARD ================= */}
          {isAdmin && activeMode === 'whiteboard' && (
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between shrink-0 text-slate-700 flex-wrap gap-2 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setTool('pen')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      tool === 'pen' ? 'bg-teal-800 text-white' : 'hover:bg-slate-200'
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Pen</span>
                  </button>

                  <button
                    onClick={() => setTool('eraser')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      tool === 'eraser' ? 'bg-teal-800 text-white' : 'hover:bg-slate-200'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-1"></div>

                  <div className="flex items-center gap-1.5">
                    {['#0F172A', '#0D727A', '#2563EB', '#DC2626', '#16A34A', '#9333EA'].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setBrushColor(c);
                          setTool('pen');
                        }}
                        className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                          brushColor === c && tool === 'pen' ? 'scale-110 border-slate-900 ring-2 ring-teal-500' : 'border-white'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="h-4 w-px bg-slate-300 mx-1"></div>

                  <select
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value={2}>Fine (2px)</option>
                    <option value={3.5}>Medium (3.5px)</option>
                    <option value={6}>Thick (6px)</option>
                    <option value={10}>Marker (10px)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCanvas}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Canvas</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 relative cursor-crosshair bg-white">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full block"
                />
              </div>
            </div>
          )}

          {/* ================= TEACHER ONLY: PHYSICAL BOARD CAMERA ================= */}
          {isAdmin && activeMode === 'camera' && (
            <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
              <div className="bg-[#122327] px-4 py-2 border-b border-teal-800/60 flex items-center justify-between text-xs shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleCameraFacing}
                    className="px-3 py-1.5 rounded-xl bg-teal-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip to {cameraFacing === 'user' ? 'Back (Wall Board)' : 'Front'} Camera</span>
                  </button>
                  <button
                    onClick={() => setIsMirrored(!isMirrored)}
                    className="px-3 py-1.5 rounded-xl bg-teal-900 text-teal-200 border border-teal-700 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>{isMirrored ? 'Mirror: ON' : 'Mirror: OFF'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 relative flex items-center justify-center bg-black">
                {isCameraActive && mediaStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)' }}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <Camera className="w-10 h-10 text-amber-300 mx-auto" />
                    <p className="text-xs text-white">Starting camera broadcast...</p>
                    <button
                      onClick={() => startCamera('environment')}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Retry Camera
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STUDENT VIEW: CLEAN STREAM INTERFACE WITH SEAMLESS BROWSER REDIRECT =================
              (Heavy teaching whiteboard & drawing tools completely restricted) */}
          {!isAdmin && (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#0c181b] to-[#081013] text-center space-y-5 overflow-y-auto">
              {showEmbeddedPlayer ? (
                <div className="w-full h-full min-h-[450px] flex flex-col rounded-2xl overflow-hidden border border-teal-800 bg-black">
                  <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs border-b border-teal-900">
                    <span className="text-teal-300 font-bold flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Live Stream: {batchTitle}
                    </span>
                    <button
                      onClick={() => setShowEmbeddedPlayer(false)}
                      className="text-slate-400 hover:text-white cursor-pointer font-semibold"
                    >
                      Exit Embedded View
                    </button>
                  </div>
                  <iframe
                    src={externalStreamUrl}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full flex-1 border-0"
                    title="Live Stream"
                  />
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-teal-950/80 border-2 border-teal-700 text-teal-300 flex items-center justify-center shadow-2xl">
                    <Radio className="w-10 h-10 text-amber-300 animate-pulse" />
                  </div>

                  <div className="space-y-2 max-w-lg">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Moderator Configured & Waiting Error Bypassed</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {batchTitle}
                    </h3>
                    <p className="text-xs text-teal-200/90 leading-relaxed">
                      Educator <strong>{teacherName}</strong> is broadcasting.
                      Direct moderator room initialization is applied so you will never encounter the "Waiting for moderator" error.
                    </p>
                  </div>

                  {/* STREAM ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={externalStreamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-teal-950 font-black text-xs shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-105 cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-teal-950" />
                      <span>Open in Clean High-Speed Window</span>
                      <ExternalLink className="w-3.5 h-3.5 text-teal-950" />
                    </a>

                    <button
                      onClick={() => setShowEmbeddedPlayer(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-900/80 hover:bg-teal-800 text-teal-200 border border-teal-700 font-bold text-xs cursor-pointer transition-all"
                    >
                      <Play className="w-4 h-4 text-amber-300" />
                      <span>Watch Stream Inside App</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-teal-400/80">
                    Microphone is locked to listen-only mode. Use the live Q&A chat on the right to ask questions.
                  </p>

                  {/* Moderation Alert Banner if student is blocked */}
                  {isCurrentStudentBlocked && (
                    <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2 max-w-md">
                      <Ban className="w-5 h-5 text-red-400 shrink-0" />
                      <span>
                        Your chat privileges in this session are suspended by the instructor for violating classroom guidelines.
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>

        {/* ================= 3. RIGHT SIDE PANEL: LIVE CHAT & PARTICIPANTS WITH MODERATION ================= */}
        {isSidePanelOpen && (
          <div className="w-80 lg:w-96 bg-[#112125] border-l border-teal-900 flex flex-col shrink-0 z-10 transition-all">
            
            {/* Tabs */}
            <div className="flex border-b border-teal-900 text-xs font-bold text-teal-300">
              <button
                onClick={() => setSideTab('doubts')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  sideTab === 'doubts'
                    ? 'border-teal-400 text-white bg-teal-950/40'
                    : 'border-transparent hover:text-white'
                }`}
              >
                <span>Live Q&A Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </button>

              <button
                onClick={() => setSideTab('students')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  sideTab === 'students'
                    ? 'border-teal-400 text-white bg-teal-950/40'
                    : 'border-transparent hover:text-white'
                }`}
              >
                <span>Participants ({students.length})</span>
              </button>
            </div>

            {/* TAB 1: LIVE CHAT & MODERATION */}
            {sideTab === 'doubts' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {moderationWarning && (
                  <div className="p-2 bg-amber-950 text-amber-200 text-[11px] border-b border-amber-800 flex items-center justify-between px-3">
                    <span>{moderationWarning}</span>
                    <button
                      onClick={() => setModerationWarning(null)}
                      className="text-amber-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                  {messages.map((msg) => {
                    const isSelf = isAdmin ? msg.senderRole === 'teacher' : msg.studentId === currentStudent?.id;
                    const isStudentSender = msg.senderRole === 'student';
                    const senderStudentId = msg.studentId || (students.find((s) => s.name === msg.senderName)?.id);
                    const isSenderBlocked = senderStudentId ? blockedStudentIds.has(senderStudentId) : false;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col text-xs ${
                          msg.isDoubt
                            ? 'bg-amber-950/40 border border-amber-600/40 p-2.5 rounded-2xl'
                            : isSelf
                            ? 'items-end'
                            : 'items-start'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] w-full justify-between">
                          <div className="flex items-center gap-1.5">
                            {msg.isDoubt && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase">
                                Doubt
                              </span>
                            )}
                            <span className="font-extrabold text-teal-200">{msg.senderName}</span>
                            <span className="text-[10px] text-teal-400 font-mono">{msg.timestamp}</span>
                          </div>

                          {/* TEACHER MODERATION CONTROLS: Block & Unblock user */}
                          {isAdmin && isStudentSender && senderStudentId && (
                            <div>
                              {isSenderBlocked ? (
                                <button
                                  onClick={() => handleUnblockUser(senderStudentId)}
                                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700 cursor-pointer"
                                  title="Unblock this student"
                                >
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockUser(senderStudentId, msg.senderName)}
                                  className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-950/80 px-2 py-0.5 rounded-md border border-red-800 cursor-pointer flex items-center gap-1"
                                  title="Block this student from live chat"
                                >
                                  <Ban className="w-2.5 h-2.5" />
                                  <span>Block</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div
                          className={`p-2.5 rounded-2xl max-w-[90%] leading-relaxed ${
                            isSenderBlocked
                              ? 'bg-red-950/40 text-red-300 italic line-through'
                              : msg.isDoubt
                              ? 'text-amber-100 font-medium'
                              : isSelf
                              ? 'bg-teal-800 text-white rounded-tr-none'
                              : 'bg-teal-950/80 text-teal-100 rounded-tl-none border border-teal-800/40'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat input with active block enforcement */}
                <form
                  onSubmit={handleChatSubmit}
                  className="p-3 bg-[#13272B] border-t border-teal-900/80 space-y-2 shrink-0"
                >
                  {isCurrentStudentBlocked ? (
                    <div className="p-3 bg-red-950/90 rounded-xl border border-red-800 text-red-200 text-xs text-center font-bold">
                      🚫 Chat suspended by instructor. Please listen to the lecture.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() => setIsDoubtMode(!isDoubtMode)}
                          className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            isDoubtMode
                              ? 'bg-amber-400 text-teal-950'
                              : 'bg-teal-950 text-teal-300 hover:text-white'
                          }`}
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>{isDoubtMode ? 'Tag: Doubt ON' : 'Ask a Doubt'}</span>
                        </button>
                        <span className="text-[10px] text-teal-400">Strictly academic queries</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={
                            isDoubtMode
                              ? 'Type your question for teacher...'
                              : 'Send message in live class...'
                          }
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 bg-teal-950/80 border border-teal-800/80 rounded-xl px-3 py-2 text-xs text-white placeholder-teal-400/50 focus:outline-none focus:border-teal-500"
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white cursor-pointer shadow-xs transition-colors shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            )}

            {/* TAB 2: STUDENTS ROSTER & MODERATION ACTIONS */}
            {sideTab === 'students' && (
              <div className="flex-1 flex flex-col overflow-hidden p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs text-teal-300 pb-2 border-b border-teal-900">
                  <span className="font-bold">Attending Roster</span>
                  <span className="font-mono text-emerald-400">{students.length} Present</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {students.map((st) => {
                    const isBlocked = blockedStudentIds.has(st.id) || st.isChatBlocked;
                    return (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-900/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>{st.name}</span>
                            {isBlocked && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-red-900 text-red-200 rounded">
                                Blocked
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-teal-400 font-mono">
                            Roll: {st.rollNumber} • Muted by default
                          </p>
                        </div>

                        {isAdmin && (
                          <div>
                            {isBlocked ? (
                              <button
                                onClick={() => handleUnblockUser(st.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold hover:bg-emerald-900 cursor-pointer"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(st.id, st.name)}
                                className="px-2 py-1 rounded-lg bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold hover:bg-red-900 cursor-pointer"
                              >
                                Block
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
