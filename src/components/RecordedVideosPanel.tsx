import React, { useState } from 'react';
import { RecordedVideo, Batch, UserRole } from '../types.ts';
import {
  Video as VideoIcon,
  Play,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Search,
  ExternalLink,
  FileText,
  Eye,
  CheckCircle2,
  X,
  Youtube,
  Film
} from 'lucide-react';
import { uploadAcademyFile, formatBytes } from '../lib/supabase.ts';

interface RecordedVideosPanelProps {
  videos: RecordedVideo[];
  batches: Batch[];
  currentRole: UserRole;
  availableSubjects?: string[];
  onAddCustomSubject?: (subject: string) => void;
  onAddVideo: (video: Omit<RecordedVideo, 'id' | 'recordedDate' | 'viewsCount'>) => void;
  onDeleteVideo: (id: string) => void;
  onVideoWatched?: (id: string) => void;
}

export const RecordedVideosPanel: React.FC<RecordedVideosPanelProps> = ({
  videos,
  batches,
  currentRole,
  availableSubjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science'],
  onAddCustomSubject,
  onAddVideo,
  onDeleteVideo,
  onVideoWatched
}) => {
  const isAdmin = currentRole === 'admin' || currentRole === 'teacher';

  // Filters
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activePlayerVideo, setActivePlayerVideo] = useState<RecordedVideo | null>(null);

  // Video Quality & Low-Data Mode State
  const [videoQuality, setVideoQuality] = useState<'360p' | '480p' | '720p' | '1080p'>('720p');
  const [isLowDataMode, setIsLowDataMode] = useState<boolean>(false);

  // Add Video Form State
  const [title, setTitle] = useState('');
  const [batchId, setBatchId] = useState(batches[0]?.id || '');
  const [subject, setSubject] = useState(batches[0]?.subject || 'Mathematics');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [sourceType, setSourceType] = useState<'youtube' | 'drive' | 'file'>('youtube');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [description, setDescription] = useState('');
  const [notesLink, setNotesLink] = useState('');

  // File upload state for direct video files
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper to extract clean embeddable link
  const getEmbedUrl = (url: string, source: 'youtube' | 'drive' | 'file') => {
    if (source === 'youtube') {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      if (url.includes('/embed/')) return url;
      return url;
    }
    if (source === 'drive') {
      if (url.includes('/view')) {
        return url.replace('/view', '/preview');
      }
      return url;
    }
    return url;
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !batchId) return;

    let finalVideoUrl = videoUrlInput.trim();

    if (sourceType === 'file') {
      if (!selectedFile && !finalVideoUrl) {
        alert('Please select a video file or provide a video link.');
        return;
      }

      if (selectedFile) {
        setIsUploading(true);
        setUploadProgress(40);
        try {
          const uploadRes = await uploadAcademyFile(selectedFile, 'recorded-lectures');
          setUploadProgress(100);
          finalVideoUrl = uploadRes.fileUrl;
        } catch (err) {
          console.error('File upload failed:', err);
          finalVideoUrl = URL.createObjectURL(selectedFile);
        } finally {
          setIsUploading(false);
        }
      }
    }

    const selectedBatch = batches.find((b) => b.id === batchId) || batches[0];
    const finalSubject = isCustomSubject && customSubjectInput.trim() ? customSubjectInput.trim() : (subject || selectedBatch.subject);

    if (isCustomSubject && customSubjectInput.trim() && onAddCustomSubject) {
      onAddCustomSubject(customSubjectInput.trim());
    }

    onAddVideo({
      title: title.trim(),
      batchId: selectedBatch.id,
      batchName: selectedBatch.name,
      subject: finalSubject,
      chapterName: chapterName.trim() || selectedBatch.nextTopic || 'Chapter Lecture',
      videoUrl: finalVideoUrl,
      videoSource: sourceType,
      duration: duration.trim() || '45 mins',
      teacherName: selectedBatch.teacherName || 'Sarla Sharma',
      description: description.trim() || 'Recorded class lecture for student revision.',
      notesAttachmentUrl: notesLink.trim()
    });

    // Reset Form
    setTitle('');
    setChapterName('');
    setIsCustomSubject(false);
    setCustomSubjectInput('');
    setVideoUrlInput('');
    setDescription('');
    setSelectedFile(null);
    setIsAddOpen(false);
  };

  const filteredVideos = videos.filter((v) => {
    const matchesBatch = selectedBatchFilter === 'all' || v.batchId === selectedBatchFilter;
    const matchesSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.chapterName && v.chapterName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      v.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <span>Recorded Lectures & Masterclasses</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
              {videos.length} Lectures
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Catch up on missed live classes anytime with chapter-mapped high-definition video recordings and notes
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-800 hover:bg-teal-900 text-white shadow-md shadow-teal-900/15 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Recorded Lecture</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by chapter, lecture topic, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-teal-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Batch:</span>
          <button
            onClick={() => setSelectedBatchFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedBatchFilter === 'all'
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700'
            }`}
          >
            All Batches
          </button>
          {batches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBatchFilter(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedBatchFilter === b.id
                  ? 'bg-teal-800 text-white shadow-2xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-teal-100 dark:border-slate-800 shadow-sm space-y-3">
          <VideoIcon className="w-12 h-12 text-teal-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No recorded lectures found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchTerm || selectedBatchFilter !== 'all'
              ? 'Try selecting a different batch filter or search term.'
              : 'Lectures will appear here once uploaded by the teacher.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-teal-100/80 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all flex flex-col group"
            >
              {/* Thumbnail Container */}
              <div
                onClick={() => {
                  setActivePlayerVideo(video);
                  if (onVideoWatched) onVideoWatched(video.id);
                }}
                className="relative aspect-video bg-gradient-to-tr from-teal-950 via-teal-900 to-[#133E43] cursor-pointer flex items-center justify-center overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Play Button Icon Overlay */}
                <div className="w-14 h-14 rounded-full bg-amber-400 text-teal-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform z-10">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-[11px] font-bold text-white flex items-center gap-1 z-10">
                  <Clock className="w-3 h-3 text-amber-300" />
                  <span>{video.duration}</span>
                </div>

                {/* Video Source Indicator */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-teal-950/80 backdrop-blur-xs text-[10px] font-bold text-teal-200 border border-teal-700/50 flex items-center gap-1 z-10">
                  {video.videoSource === 'youtube' ? (
                    <>
                      <Youtube className="w-3 h-3 text-red-400" />
                      <span>YouTube</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-3 h-3 text-teal-300" />
                      <span>HD Video</span>
                    </>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-100 dark:border-teal-800">
                      {video.batchName}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {video.recordedDate}
                    </span>
                  </div>

                  <h3
                    onClick={() => {
                      setActivePlayerVideo(video);
                      if (onVideoWatched) onVideoWatched(video.id);
                    }}
                    className="font-black text-slate-800 dark:text-white text-sm hover:text-teal-800 dark:hover:text-teal-300 cursor-pointer line-clamp-2 leading-snug"
                  >
                    {video.title}
                  </h3>

                  <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold line-clamp-1">
                    {video.chapterName}
                  </p>

                  {video.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{video.viewsCount} views</span>
                    <span className="mx-1">•</span>
                    <span>By {video.teacherName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {video.notesAttachmentUrl && (
                      <a
                        href={video.notesAttachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                        title="Download Chapter Notes"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => onDeleteVideo(video.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActivePlayerVideo(video);
                        if (onVideoWatched) onVideoWatched(video.id);
                      }}
                      className="px-3 py-1 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal (Theater Mode) */}
      {activePlayerVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base line-clamp-1">{activePlayerVideo.title}</h3>
                  <p className="text-xs text-slate-400">{activePlayerVideo.batchName} • {activePlayerVideo.chapterName}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePlayerVideo(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Quality & Low-Data Mode Bar */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextVal = !isLowDataMode;
                    setIsLowDataMode(nextVal);
                    if (nextVal) setVideoQuality('360p');
                    else setVideoQuality('720p');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isLowDataMode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isLowDataMode ? 'bg-white' : 'bg-slate-400'}`} />
                  <span>{isLowDataMode ? 'Low-Data Mode ON (360p)' : 'Low-Data Mode'}</span>
                </button>

                {isLowDataMode && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                    Saves ~65% mobile bandwidth
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400 font-semibold mr-1">Quality:</span>
                {(['360p', '480p', '720p', '1080p'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setVideoQuality(q);
                      if (q !== '360p') setIsLowDataMode(false);
                    }}
                    className={`px-2 py-0.5 rounded font-extrabold cursor-pointer ${
                      videoQuality === q
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player Viewport */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {activePlayerVideo.videoSource === 'youtube' || activePlayerVideo.videoSource === 'drive' ? (
                <iframe
                  src={getEmbedUrl(activePlayerVideo.videoUrl, activePlayerVideo.videoSource)}
                  title={activePlayerVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activePlayerVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Video Information Bar */}
            <div className="p-4 bg-slate-900 text-slate-200 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-slate-400 leading-relaxed">
                  {activePlayerVideo.description || 'Watch this recorded lecture to revise key concepts, solve exemplar problems, and strengthen fundamentals.'}
                </p>
                <p className="text-teal-400 font-semibold">
                  Taught by: {activePlayerVideo.teacherName} • Duration: {activePlayerVideo.duration}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activePlayerVideo.notesAttachmentUrl && (
                  <a
                    href={activePlayerVideo.notesAttachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Notes</span>
                  </a>
                )}
                <button
                  onClick={() => setActivePlayerVideo(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  Done Watching
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Admin Upload Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-teal-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-6 relative">
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-teal-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black tracking-tight">Upload Recorded Masterclass</h3>
              <p className="text-xs text-teal-200 mt-0.5">Map video lecture with specific batch, chapter, and notes</p>
            </div>

            <form onSubmit={handleCreateVideo} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lecture Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 8 Trigonometry - Height & Distance Solved Examples"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={batchId}
                    onChange={(e) => {
                      setBatchId(e.target.value);
                      const b = batches.find((item) => item.id === e.target.value);
                      if (b) setSubject(b.subject);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id} className="dark:bg-slate-800 dark:text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 45 mins"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Subject
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomSubject(!isCustomSubject)}
                      className="text-[10px] text-teal-700 dark:text-teal-400 font-extrabold hover:underline cursor-pointer"
                    >
                      {isCustomSubject ? '← List' : '+ Custom'}
                    </button>
                  </div>
                  {isCustomSubject ? (
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={customSubjectInput}
                      onChange={(e) => setCustomSubjectInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-teal-50/50 dark:bg-slate-800 dark:text-white text-xs font-semibold"
                    />
                  ) : (
                    <select
                      value={subject}
                      onChange={(e) => {
                        if (e.target.value === '__add_custom__') {
                          setIsCustomSubject(true);
                        } else {
                          setSubject(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium text-xs"
                    >
                      {availableSubjects.map((s) => (
                        <option key={s} value={s} className="dark:bg-slate-800 dark:text-white">{s}</option>
                      ))}
                      <option value="__add_custom__" className="dark:bg-slate-800 dark:text-teal-300">+ Add Custom Subject...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chapter / Unit Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 8: Trigonometry"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Video Source Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceType('youtube')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      sourceType === 'youtube'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-teal-900 dark:text-teal-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    YouTube Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('drive')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      sourceType === 'drive'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-teal-900 dark:text-teal-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Google Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('file')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      sourceType === 'file'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-teal-900 dark:text-teal-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Device Video
                  </button>
                </div>
              </div>

              {sourceType === 'file' ? (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Video File (.mp4, .webm)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        setDuration(`${formatBytes(e.target.files[0].size)} video`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-300"
                  />
                  {selectedFile && (
                    <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-1 font-semibold">
                      Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {sourceType === 'youtube' ? 'YouTube URL / Share Link' : 'Google Drive Share Link'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder={
                      sourceType === 'youtube'
                        ? 'https://www.youtube.com/watch?v=... or https://youtu.be/...'
                        : 'https://drive.google.com/file/d/.../view'
                    }
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Lecture Notes Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /api/storage/file/c-1 or PDF link"
                  value={notesLink}
                  onChange={(e) => setNotesLink(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Concepts & Topics Covered
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of formulas, derivations, and questions solved in this session..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading Video...' : 'Publish Lecture'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
