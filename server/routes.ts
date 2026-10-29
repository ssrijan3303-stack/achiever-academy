import { Router, Request, Response } from 'express';
import { dataStore } from './dataStore.ts';

export const apiRouter = Router();

// 1. Academy Settings
apiRouter.get('/academy', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.academy
  });
});

apiRouter.put('/academy', (req: Request, res: Response) => {
  const updated = dataStore.updateAcademy(req.body);
  res.json({
    success: true,
    data: updated
  });
});

// 2. Teachers Management
apiRouter.get('/teachers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.teachers,
    activeTeacherId: dataStore.activeTeacherId
  });
});

apiRouter.get('/teachers/active', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.getActiveTeacher()
  });
});

apiRouter.post('/teachers/active', (req: Request, res: Response) => {
  const { teacherId } = req.body;
  if (!teacherId) {
    return res.status(400).json({ success: false, error: 'teacherId required' });
  }
  const teacher = dataStore.teachers.find(t => t.id === teacherId);
  if (!teacher) {
    return res.status(404).json({ success: false, error: 'Teacher not found' });
  }
  dataStore.activeTeacherId = teacherId;
  res.json({
    success: true,
    data: teacher
  });
});

apiRouter.post('/teachers', (req: Request, res: Response) => {
  const { name, qualifications, email, phone, subjectsExpertise, bio, avatarUrl } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, error: 'Name, email, and phone are required' });
  }
  const created = dataStore.addTeacher({
    name,
    qualifications: qualifications || 'B.Ed, CTET',
    email,
    phone,
    subjectsExpertise: Array.isArray(subjectsExpertise) ? subjectsExpertise : ['General'],
    bio: bio || 'Qualified instructor at Anushree Academy.',
    avatarUrl: avatarUrl || '',
    status: 'active'
  });
  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/teachers/:id', (req: Request, res: Response) => {
  const updated = dataStore.updateTeacher(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Teacher not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/teachers/:id', (req: Request, res: Response) => {
  const success = dataStore.deleteTeacher(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Teacher not found' });
  }
  res.json({ success: true, message: 'Teacher deleted successfully' });
});

// 3. Batches
apiRouter.get('/batches', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.batches
  });
});

apiRouter.post('/batches', (req: Request, res: Response) => {
  const { name, grade, subject, scheduleTime, roomCode, nextTopic, teacherId, monthlyFee, thumbnail_url, coverImage, description, duration, fullBatchPrice } = req.body;
  if (!name || !grade || !subject) {
    return res.status(400).json({ success: false, error: 'Missing required batch fields' });
  }
  const teacher = dataStore.teachers.find(t => t.id === teacherId);
  const banner = thumbnail_url || coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80';
  const created = dataStore.addBatch({
    name,
    grade,
    subject,
    scheduleTime: scheduleTime || '10:00 AM - 11:30 AM',
    roomCode: roomCode || `ACHIEVER-${Math.floor(1000 + Math.random() * 9000)}`,
    nextTopic: nextTopic || 'Introduction & Curriculum Overview',
    teacherId: teacherId || dataStore.activeTeacherId,
    teacherName: teacher ? teacher.name : dataStore.getActiveTeacher().name,
    monthlyFee: monthlyFee ? Number(monthlyFee) : 2500,
    thumbnail_url: banner,
    coverImage: banner,
    description: description || 'Achiever Academy comprehensive coaching batch designed by senior educators.',
    duration: duration || '1 Year Academic Program',
    fullBatchPrice: fullBatchPrice ? Number(fullBatchPrice) : 9999,
    subjects: []
  });
  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/batches/:id', (req: Request, res: Response) => {
  const updates = { ...req.body };
  if (updates.teacherId) {
    const teacher = dataStore.teachers.find(t => t.id === updates.teacherId);
    if (teacher) {
      updates.teacherName = teacher.name;
    }
  }
  if (updates.monthlyFee !== undefined) {
    updates.monthlyFee = Number(updates.monthlyFee);
  }
  if (updates.fullBatchPrice !== undefined) {
    updates.fullBatchPrice = Number(updates.fullBatchPrice);
  }
  // Ensure thumbnail_url and coverImage stay synchronized
  if (updates.thumbnail_url && !updates.coverImage) {
    updates.coverImage = updates.thumbnail_url;
  } else if (updates.coverImage && !updates.thumbnail_url) {
    updates.thumbnail_url = updates.coverImage;
  }
  const updated = dataStore.updateBatch(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/batches/:id', (req: Request, res: Response) => {
  const success = dataStore.deleteBatch(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }
  res.json({ success: true, message: 'Batch deleted successfully' });
});

// Subject CRUD Routes
apiRouter.post('/batches/:batchId/subjects', (req: Request, res: Response) => {
  const { name, price, duration, teacherName, description, iconName } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Subject name is required' });
  }
  const created = dataStore.addSubject(req.params.batchId, {
    name,
    price: Number(price) || 2500,
    duration: duration || '1 Year',
    teacherName: teacherName || dataStore.getActiveTeacher().name,
    description: description || 'Subject curriculum module',
    iconName: iconName || 'BookOpen',
    chapters: []
  });
  if (!created) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }
  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/batches/:batchId/subjects/:subjectId', (req: Request, res: Response) => {
  const updated = dataStore.updateSubject(req.params.batchId, req.params.subjectId, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Batch or Subject not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/batches/:batchId/subjects/:subjectId', (req: Request, res: Response) => {
  const success = dataStore.deleteSubject(req.params.batchId, req.params.subjectId);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Batch or Subject not found' });
  }
  res.json({ success: true, message: 'Subject deleted successfully' });
});

// Chapter CRUD Routes
apiRouter.post('/batches/:batchId/subjects/:subjectId/chapters', (req: Request, res: Response) => {
  const { title, description, chapterNumber } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Chapter title is required' });
  }
  const created = dataStore.addChapter(req.params.batchId, req.params.subjectId, {
    title,
    description: description || '',
    chapterNumber: Number(chapterNumber) || 1,
    lectures: [],
    notes: [],
    modelPapers: []
  });
  if (!created) {
    return res.status(404).json({ success: false, error: 'Batch or Subject not found' });
  }
  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/batches/:batchId/subjects/:subjectId/chapters/:chapterId', (req: Request, res: Response) => {
  const updated = dataStore.updateChapter(req.params.batchId, req.params.subjectId, req.params.chapterId, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Chapter not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/batches/:batchId/subjects/:subjectId/chapters/:chapterId', (req: Request, res: Response) => {
  const success = dataStore.deleteChapter(req.params.batchId, req.params.subjectId, req.params.chapterId);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Chapter not found' });
  }
  res.json({ success: true, message: 'Chapter deleted successfully' });
});

// 4. Students & Self-Registration Flow
apiRouter.get('/students', (req: Request, res: Response) => {
  const batchId = req.query.batchId as string;
  const status = req.query.status as string;

  let filtered = dataStore.students;
  if (batchId) {
    filtered = filtered.filter(s => s.batchId === batchId);
  }
  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }

  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
    pendingApprovalsCount: dataStore.students.filter(s => s.approvalStatus === 'pending').length
  });
});

// Pending Student Approvals endpoint
apiRouter.get('/students/pending', (_req: Request, res: Response) => {
  const pending = dataStore.students.filter(s => s.approvalStatus === 'pending');
  res.json({
    success: true,
    data: pending,
    count: pending.length
  });
});

// Student Self-Registration
apiRouter.post('/auth/register-student', (req: Request, res: Response) => {
  const { name, email, phone, password, batchId } = req.body;
  if (!name || !email || !batchId) {
    return res.status(400).json({ success: false, error: 'Name, email, and class/batch selection are required' });
  }

  // Check if student with same email already exists
  const existing = dataStore.students.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `An account with email ${email} already exists (Status: ${existing.approvalStatus || existing.status})`
    });
  }

  const created = dataStore.registerStudent({
    name,
    email,
    phone: phone || '+91 98000 00000',
    password: password || 'student123',
    batchId
  });

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully! Your account is pending verification by Anushree Academy Admin.',
    data: created
  });
});

// Student Login Verification
apiRouter.post('/auth/student-login', (req: Request, res: Response) => {
  const { identifier } = req.body; // email or phone
  if (!identifier) {
    return res.status(400).json({ success: false, error: 'Email or phone number is required' });
  }

  const query = identifier.trim().toLowerCase();
  const student = dataStore.students.find(
    s => s.email.toLowerCase() === query || s.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '')
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student record not found. Please register your account.'
    });
  }

  if (student.approvalStatus === 'pending') {
    return res.status(403).json({
      success: false,
      isPending: true,
      error: 'Your registration is currently pending admin approval from Sarla Sharma (Anushree Academy). Please wait or contact didi directly.',
      data: student
    });
  }

  if (student.status === 'rejected') {
    return res.status(403).json({
      success: false,
      isRejected: true,
      error: `Your registration was declined: ${student.rejectionReason || 'Contact Academy administration'}`,
      data: student
    });
  }

  res.json({
    success: true,
    data: student
  });
});

// Unified Multi-Role Login Verification (Admin, Teacher, Student)
apiRouter.post('/auth/unified-login', (req: Request, res: Response) => {
  const { identifier, email, password } = req.body;
  const query = (email || identifier || '').trim().toLowerCase();

  if (!query) {
    return res.status(400).json({ success: false, error: 'Email or identifier is required' });
  }

  // 1. Check Admin credentials
  if (
    query.includes('admin') ||
    query === 'director@achieveracademy.edu' ||
    query === 'admissions@achieveracademy.edu' ||
    query === 'admin@achiever.edu'
  ) {
    return res.json({
      success: true,
      role: 'admin',
      data: {
        id: 'admin-1',
        name: 'Dr. S. K. Sharma (Academic Director)',
        email: query,
        role: 'admin'
      }
    });
  }

  // 2. Check Teacher credentials
  const teacher = dataStore.teachers.find(
    t => t.email.toLowerCase() === query ||
         t.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
         t.name.toLowerCase().includes(query)
  );
  if (teacher || query.includes('teacher') || query.includes('faculty')) {
    const activeTeacher = teacher || dataStore.teachers[0];
    return res.json({
      success: true,
      role: 'teacher',
      data: activeTeacher
    });
  }

  // 3. Check Student credentials
  const student = dataStore.students.find(
    s => s.email.toLowerCase() === query ||
         s.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
         (s.rollNumber && s.rollNumber.toLowerCase() === query)
  );

  if (student) {
    if (student.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        isPending: true,
        error: 'Your student registration is pending verification by Achiever Academy administration.',
        data: student
      });
    }
    if (student.status === 'rejected') {
      return res.status(403).json({
        success: false,
        isRejected: true,
        error: `Your registration was declined: ${student.rejectionReason || 'Contact Academy administration'}`,
        data: student
      });
    }
    return res.json({
      success: true,
      role: 'student',
      data: student
    });
  }

  // Fallback demo matching for student keywords
  if (query.includes('student') || query.includes('rahul')) {
    return res.json({
      success: true,
      role: 'student',
      data: dataStore.students[0]
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials. User not found in profiles database.'
  });
});

// Admin Approve Student
apiRouter.post('/students/:id/approve', (req: Request, res: Response) => {
  const approved = dataStore.approveStudent(req.params.id);
  if (!approved) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  res.json({
    success: true,
    message: `Student ${approved.name} successfully approved and enrolled into ${approved.batchName}!`,
    data: approved
  });
});

// Admin Reject Student
apiRouter.post('/students/:id/reject', (req: Request, res: Response) => {
  const { reason } = req.body;
  const rejected = dataStore.rejectStudent(req.params.id, reason);
  if (!rejected) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  res.json({
    success: true,
    message: `Student application for ${rejected.name} has been rejected.`,
    data: rejected
  });
});

apiRouter.post('/students', (req: Request, res: Response) => {
  const { name, batchId, batchName, email, phone, rollNumber } = req.body;
  if (!name || !batchId || !email) {
    return res.status(400).json({ success: false, error: 'Missing required student fields' });
  }
  const created = dataStore.addStudent({
    name,
    batchId,
    batchName: batchName || 'Class 10 Mathematics',
    email,
    phone: phone || '+91 98000 00000',
    rollNumber: rollNumber || `R-${Math.floor(100 + Math.random() * 900)}`
  });
  res.status(201).json({ success: true, data: created });
});

apiRouter.post('/students/:id/pay-fee', (req: Request, res: Response) => {
  const { amount, paymentMode, transactionRef } = req.body;
  const success = dataStore.payStudentFee(
    req.params.id,
    Number(amount) || 2500,
    paymentMode || 'UPI',
    transactionRef
  );
  if (!success) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  res.json({ success: true, message: 'Fee payment marked successfully' });
});

apiRouter.patch('/students/:id/toggle-hand', (req: Request, res: Response) => {
  const isHandRaised = dataStore.toggleStudentHand(req.params.id);
  res.json({ success: true, isHandRaised });
});

apiRouter.patch('/students/:id/toggle-mute', (req: Request, res: Response) => {
  const isMuted = dataStore.toggleStudentMute(req.params.id);
  res.json({ success: true, isMuted });
});

apiRouter.post('/students/mute-all', (_req: Request, res: Response) => {
  dataStore.muteAllStudents();
  res.json({ success: true, message: 'All students muted' });
});

// 5. Content Library & Storage System
apiRouter.get('/content', (req: Request, res: Response) => {
  const folder = req.query.folder as string;
  const filtered = folder
    ? dataStore.contentLibrary.filter(c => c.folderName === folder)
    : dataStore.contentLibrary;
  res.json({
    success: true,
    data: filtered
  });
});

apiRouter.post('/content/upload', (req: Request, res: Response) => {
  const { title, folderName, subfolderName, fileType, fileSize, details, fileName, fileUrl } = req.body;
  if (!title || !folderName || !fileType) {
    return res.status(400).json({ success: false, error: 'Title, folder, and file type required' });
  }
  const created = dataStore.addContent({
    title,
    folderName,
    subfolderName: subfolderName || 'General',
    fileType,
    fileSize: fileSize || '2.5 MB',
    details: details || 'Study material uploaded by teacher.',
    fileName: fileName || `${title.replace(/\s+/g, '_')}.${fileType === 'pdf' ? 'pdf' : 'doc'}`,
    fileUrl: fileUrl || ''
  });
  res.status(201).json({ success: true, data: created });
});

apiRouter.delete('/content/:id', (req: Request, res: Response) => {
  const deleted = dataStore.deleteContent(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Content item not found' });
  }
  res.json({ success: true, message: 'File deleted from library' });
});

// Storage File Upload & Serving
apiRouter.post('/storage/upload', (req: Request, res: Response) => {
  const { fileName, fileType, fileSize, base64Data, folder } = req.body;
  if (!fileName || !base64Data) {
    return res.status(400).json({ success: false, error: 'fileName and base64Data required' });
  }

  const fileId = `file-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  dataStore.storageFiles.set(fileId, {
    buffer: base64Data,
    mimeType: fileType || 'application/octet-stream',
    fileName,
    size: fileSize || 'Unknown'
  });

  const fileUrl = `/api/storage/file/${fileId}`;
  res.status(201).json({
    success: true,
    fileId,
    fileUrl,
    fileName,
    folder: folder || 'study-materials'
  });
});

apiRouter.get('/storage/file/:fileId', (req: Request, res: Response) => {
  const { fileId } = req.params;
  const file = dataStore.storageFiles.get(fileId);
  if (!file) {
    // Generate a fallback PDF / text stream preview if mock file requested
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileId} - Anushree Academy</title>
          <style>body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f7f7; }</style>
        </head>
        <body>
          <div style="background: white; padding: 40px; border-radius: 16px; border: 1px solid #14b8a6; text-align: center; max-width: 500px;">
            <h2 style="color: #0f766e;">Anushree Academy Study Document</h2>
            <p style="color: #475569;">Resource file: <strong>${fileId}</strong></p>
            <p style="color: #64748b;">This document is stored securely in the Anushree Academy cloud storage.</p>
            <a href="javascript:window.close()" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #0f766e; color: white; border-radius: 8px; text-decoration: none;">Close Preview</a>
          </div>
        </body>
      </html>
    `);
  }

  try {
    // If it's a data URL, strip data:*;base64,
    const matches = file.buffer.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
      return res.send(buffer);
    }

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    res.send(Buffer.from(file.buffer, 'base64'));
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not render file buffer' });
  }
});

// 6. Recorded Videos Module
apiRouter.get('/recorded-videos', (req: Request, res: Response) => {
  const batchId = req.query.batchId as string;
  const filtered = batchId
    ? dataStore.recordedVideos.filter(v => v.batchId === batchId)
    : dataStore.recordedVideos;
  res.json({
    success: true,
    data: filtered,
    total: filtered.length
  });
});

apiRouter.post('/recorded-videos', (req: Request, res: Response) => {
  const { title, batchId, subject, chapterName, videoUrl, videoSource, duration, description, notesAttachmentUrl } = req.body;
  if (!title || !batchId || !videoUrl) {
    return res.status(400).json({ success: false, error: 'Title, batch selection, and video URL are required' });
  }

  const batch = dataStore.batches.find(b => b.id === batchId) || dataStore.batches[0];
  const teacher = dataStore.getActiveTeacher();

  const created = dataStore.addRecordedVideo({
    title,
    batchId: batch.id,
    batchName: batch.name,
    subject: subject || batch.subject,
    chapterName: chapterName || batch.nextTopic || 'Chapter Lecture',
    videoUrl,
    videoSource: videoSource || (videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? 'youtube' : videoUrl.includes('drive.google') ? 'drive' : 'file'),
    duration: duration || '45 mins',
    teacherName: teacher.name,
    description: description || 'Recorded masterclass session for students who missed the live classroom.',
    notesAttachmentUrl: notesAttachmentUrl || ''
  });

  res.status(201).json({ success: true, data: created });
});

apiRouter.delete('/recorded-videos/:id', (req: Request, res: Response) => {
  const success = dataStore.deleteRecordedVideo(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Recorded video not found' });
  }
  res.json({ success: true, message: 'Recorded lecture deleted successfully' });
});

apiRouter.post('/recorded-videos/:id/view', (req: Request, res: Response) => {
  const views = dataStore.incrementVideoViews(req.params.id);
  res.json({ success: true, views });
});

// 7. Live Sessions & Chat
apiRouter.get('/live-session/active', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.liveSession
  });
});

apiRouter.post('/live-session/start', (req: Request, res: Response) => {
  const { batchId } = req.body;
  const session = dataStore.startLiveClass(batchId);
  res.json({
    success: true,
    data: session
  });
});

apiRouter.post('/live-session/end', (_req: Request, res: Response) => {
  const session = dataStore.endLiveClass();
  res.json({
    success: true,
    data: session
  });
});

apiRouter.patch('/live-session/controls', (req: Request, res: Response) => {
  const { isTeacherMuted, isTeacherVideoOn, isScreenSharing, isRecording, isActive } = req.body;
  if (typeof isTeacherMuted === 'boolean') dataStore.liveSession.isTeacherMuted = isTeacherMuted;
  if (typeof isTeacherVideoOn === 'boolean') dataStore.liveSession.isTeacherVideoOn = isTeacherVideoOn;
  if (typeof isScreenSharing === 'boolean') dataStore.liveSession.isScreenSharing = isScreenSharing;
  if (typeof isRecording === 'boolean') dataStore.liveSession.isRecording = isRecording;
  if (typeof isActive === 'boolean') dataStore.liveSession.isActive = isActive;
  
  res.json({
    success: true,
    data: dataStore.liveSession
  });
});

apiRouter.get('/live-session/messages', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.chatMessages
  });
});

apiRouter.post('/live-session/messages', (req: Request, res: Response) => {
  const { senderName, senderRole, message, isDoubt } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message cannot be empty' });
  }
  const activeTeacher = dataStore.getActiveTeacher();
  const created = dataStore.addChatMessage({
    sessionId: dataStore.liveSession.id,
    senderName: senderName || activeTeacher.name,
    senderRole: senderRole || 'teacher',
    message,
    isDoubt: Boolean(isDoubt)
  });
  res.status(201).json({ success: true, data: created });
});

// 8. Schedule & Activities
apiRouter.get('/schedule', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.schedule
  });
});

apiRouter.get('/activities', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.recentActivities
  });
});

// 9. Announcements
apiRouter.get('/announcements', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.announcements
  });
});

apiRouter.post('/announcements', (req: Request, res: Response) => {
  const { title, content, targetBatch, priority } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Title and content required' });
  }
  const newAnn = {
    id: `ann-${Date.now()}`,
    title,
    content,
    targetBatch: targetBatch || 'All Batches',
    priority: priority || 'normal',
    createdAt: 'Just now'
  };
  dataStore.announcements.unshift(newAnn);
  res.status(201).json({ success: true, data: newAnn });
});

// 10. Overview Stats & Fee Summary
apiRouter.get('/stats', (_req: Request, res: Response) => {
  const totalStudents = dataStore.students.filter(s => s.approvalStatus !== 'pending').length;
  const pendingApprovals = dataStore.students.filter(s => s.approvalStatus === 'pending').length;
  const paidCount = dataStore.students.filter(s => s.feeStatus === 'paid').length;
  const pendingCount = dataStore.students.filter(s => s.feeStatus !== 'paid' && s.approvalStatus !== 'pending').length;
  const totalFeesPending = dataStore.students.reduce((sum, s) => sum + (s.feeDueAmount || 0), 0);

  res.json({
    success: true,
    data: {
      activeBatches: dataStore.batches.length,
      totalStudents,
      pendingApprovals,
      paidCount,
      pendingCount,
      totalFeesPending,
      totalRecordedVideos: dataStore.recordedVideos.length,
      totalTeachingHours: dataStore.getActiveTeacher().totalTeachingHours,
      averageAttendanceRate: 95.4,
      ongoingClass: dataStore.liveSession.isActive ? dataStore.liveSession.title : null
    }
  });
});

// 11. Automated WhatsApp & SMS Notification System
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const phone = req.query.phone as string;
  const role = req.query.role as string;
  const list = dataStore.getNotifications({ phone, role });
  res.json({
    success: true,
    data: list,
    total: list.length
  });
});

apiRouter.post('/notifications/send', (req: Request, res: Response) => {
  const { recipientName, recipientPhone, recipientRole, channel, type, title, message, batchName } = req.body;
  if (!recipientName || !recipientPhone || !title || !message) {
    return res.status(400).json({ success: false, error: 'recipientName, recipientPhone, title, and message are required' });
  }
  const notif = dataStore.sendNotification({
    recipientName,
    recipientPhone,
    recipientRole: recipientRole || 'student',
    channel: channel || 'whatsapp',
    type: type || 'announcement',
    title,
    message,
    status: 'delivered',
    batchName
  });
  res.status(201).json({ success: true, data: notif });
});

// 12. Online Quiz & Assessment Module
apiRouter.get('/quizzes', (req: Request, res: Response) => {
  const batchId = req.query.batchId as string;
  let list = dataStore.quizzes;
  if (batchId) {
    list = list.filter(q => q.batchId === batchId);
  }
  res.json({ success: true, data: list });
});

apiRouter.get('/quizzes/:id', (req: Request, res: Response) => {
  const quiz = dataStore.quizzes.find(q => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, error: 'Quiz not found' });
  }
  res.json({ success: true, data: quiz });
});

apiRouter.post('/quizzes', (req: Request, res: Response) => {
  const { title, batchId, batchName, subject, chapterName, timeLimitMinutes, totalMarks, passMarks, questions } = req.body;
  if (!title || !batchId || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, error: 'Title, batchId, and questions array are required' });
  }
  const teacher = dataStore.getActiveTeacher();
  const created = dataStore.addQuiz({
    title,
    batchId,
    batchName: batchName || 'Class Batch',
    subject: subject || 'General',
    chapterName: chapterName || 'General Chapter',
    timeLimitMinutes: Number(timeLimitMinutes) || 15,
    totalMarks: Number(totalMarks) || 20,
    passMarks: Number(passMarks) || 10,
    createdByTeacherName: teacher.name,
    isPublished: true,
    questions
  });
  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/quizzes/:id', (req: Request, res: Response) => {
  const updated = dataStore.updateQuiz(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Quiz not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.post('/quizzes/:id/toggle-live', (req: Request, res: Response) => {
  const { isLive } = req.body;
  const updated = dataStore.toggleQuizLive(req.params.id, isLive);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Quiz not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/quizzes/:id', (req: Request, res: Response) => {
  const success = dataStore.deleteQuiz(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Quiz not found' });
  }
  res.json({ success: true, message: 'Quiz deleted successfully' });
});

apiRouter.post('/quizzes/:id/submit', (req: Request, res: Response) => {
  const { studentId, studentName, studentRollNumber, batchId, selectedAnswers, timeTakenSeconds } = req.body;
  const quiz = dataStore.quizzes.find(q => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, error: 'Quiz not found' });
  }
  const submission = dataStore.submitQuiz({
    quizId: quiz.id,
    quizTitle: quiz.title,
    studentId: studentId || 's-1',
    studentName: studentName || 'Rahul Verma',
    studentRollNumber: studentRollNumber || '10M-01',
    batchId: batchId || quiz.batchId,
    selectedAnswers: selectedAnswers || {},
    timeTakenSeconds: timeTakenSeconds || 300
  });
  res.json({ success: true, data: submission });
});

apiRouter.get('/quizzes/:id/submissions', (req: Request, res: Response) => {
  const subs = dataStore.quizSubmissions.filter(s => s.quizId === req.params.id);
  res.json({ success: true, data: subs });
});

// 13. Student Performance & Report Cards
apiRouter.get('/students/:id/report-card', (req: Request, res: Response) => {
  const report = dataStore.getStudentReportCard(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  res.json({ success: true, data: report });
});

apiRouter.put('/students/:id/report-card-remarks', (req: Request, res: Response) => {
  const { remarks } = req.body;
  if (!remarks) {
    return res.status(400).json({ success: false, error: 'Remarks required' });
  }
  dataStore.updateReportCardRemarks(req.params.id, remarks);
  const updatedReport = dataStore.getStudentReportCard(req.params.id);
  res.json({ success: true, data: updatedReport });
});

// 14. Doubt Counter / Discussion Forum
apiRouter.get('/doubts', (req: Request, res: Response) => {
  const batchId = req.query.batchId as string;
  const subject = req.query.subject as string;
  let list = dataStore.doubts;
  if (batchId) {
    list = list.filter(d => d.batchId === batchId);
  }
  if (subject) {
    list = list.filter(d => d.subject.toLowerCase() === subject.toLowerCase());
  }
  res.json({ success: true, data: list });
});

apiRouter.post('/doubts', (req: Request, res: Response) => {
  const { studentId, studentName, studentRollNumber, batchId, batchName, subject, chapter, title, description, photoUrl } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Title and description are required' });
  }
  const created = dataStore.addDoubt({
    studentId: studentId || 's-1',
    studentName: studentName || 'Rahul Verma',
    studentRollNumber: studentRollNumber || '10M-01',
    batchId: batchId || 'b-10-math',
    batchName: batchName || 'Class 10 Mathematics',
    subject: subject || 'Mathematics',
    chapter: chapter || 'General Chapter',
    title,
    description,
    photoUrl
  });
  res.status(201).json({ success: true, data: created });
});

apiRouter.post('/doubts/:id/replies', (req: Request, res: Response) => {
  const { authorName, authorRole, authorAvatar, content, isTeacherVerified } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, error: 'Content is required' });
  }
  const reply = dataStore.addDoubtReply(req.params.id, {
    authorName: authorName || 'Teacher',
    authorRole: authorRole || 'teacher',
    authorAvatar,
    content,
    isTeacherVerified: isTeacherVerified || authorRole === 'teacher'
  });
  if (!reply) {
    return res.status(404).json({ success: false, error: 'Doubt not found' });
  }
  res.status(201).json({ success: true, data: reply });
});

apiRouter.put('/doubts/:id/replies/:replyId/verify', (req: Request, res: Response) => {
  const ok = dataStore.verifyDoubtReply(req.params.id, req.params.replyId);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Doubt or reply not found' });
  }
  res.json({ success: true, message: 'Reply marked as verified' });
});

apiRouter.post('/doubts/:id/upvote', (req: Request, res: Response) => {
  const upvotes = dataStore.upvoteDoubt(req.params.id);
  res.json({ success: true, upvotes });
});

apiRouter.put('/doubts/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || !['open', 'answered', 'resolved', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Valid status required (open, answered, resolved, pending)' });
  }
  const ok = dataStore.updateDoubtStatus(req.params.id, status);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Doubt not found' });
  }
  res.json({ success: true, message: `Doubt status updated to ${status}` });
});

apiRouter.post('/doubts/:id/solve-ai', (req: Request, res: Response) => {
  const doubt = dataStore.doubts.find(d => d.id === req.params.id);
  if (!doubt) {
    return res.status(404).json({ success: false, error: 'Doubt not found' });
  }

  const aiReply = dataStore.addDoubtReply(doubt.id, {
    authorName: 'Anushree AI Doubt Bot',
    authorRole: 'ai_bot',
    content: `⚡ AI Instant Solution Breakdown:\n\n1. Topic: ${doubt.subject} (${doubt.chapter})\n2. Formula / Core Rule: Identify key definitions and board exam standard theorems.\n3. Detailed Guidance: ${doubt.description}\n\n✓ Tip: Review the related recorded lecture and NCERT example questions. Our faculty will verify this solution shortly.`,
    isTeacherVerified: false,
    videoSolutionUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  });

  res.json({ success: true, data: aiReply });
});

// 15. Timetable & Smart Calendar
apiRouter.get('/timetable', (req: Request, res: Response) => {
  const batchId = req.query.batchId as string;
  const slots = dataStore.getTimetable(batchId);
  res.json({ success: true, data: slots });
});

apiRouter.post('/timetable', (req: Request, res: Response) => {
  const { dayOfWeek, batchId, batchName, subject, startTime, endTime, roomCode, topic, teacherName, color } = req.body;
  if (!dayOfWeek || !batchName || !startTime || !topic) {
    return res.status(400).json({ success: false, error: 'Day, batch, start time and topic are required' });
  }
  const created = dataStore.addTimetableSlot({
    dayOfWeek,
    batchId: batchId || 'b-10-math',
    batchName,
    subject: subject || 'Mathematics',
    startTime,
    endTime: endTime || '11:00 AM',
    roomCode: roomCode || 'ROOM-101',
    topic,
    teacherName: teacherName || dataStore.getActiveTeacher().name,
    color: color || 'teal'
  });
  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/timetable/:id', (req: Request, res: Response) => {
  const updated = dataStore.updateTimetableSlot(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Slot not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/timetable/:id', (req: Request, res: Response) => {
  const ok = dataStore.deleteTimetableSlot(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Slot not found' });
  }
  res.json({ success: true, message: 'Slot deleted' });
});

// 16. Digital Certificates & Customization Settings
apiRouter.get('/certificate-settings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.getCertificateSettings()
  });
});

apiRouter.put('/certificate-settings', (req: Request, res: Response) => {
  const updated = dataStore.updateCertificateSettings(req.body);
  res.json({
    success: true,
    data: updated
  });
});

apiRouter.get('/certificates', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string;
  let list = dataStore.certificates;
  if (studentId) {
    list = list.filter(c => c.studentId === studentId);
  }
  res.json({ success: true, data: list });
});

apiRouter.get('/certificates/verify/:code', (req: Request, res: Response) => {
  const cert = dataStore.verifyCertificate(req.params.code);
  if (!cert) {
    return res.status(404).json({ success: false, error: 'Certificate not found or verification code invalid' });
  }
  res.json({ success: true, data: cert });
});

apiRouter.post('/certificates/issue', (req: Request, res: Response) => {
  const { studentId, batchId, courseTitle } = req.body;
  if (!studentId || !batchId) {
    return res.status(400).json({ success: false, error: 'studentId and batchId are required' });
  }
  const cert = dataStore.issueCertificate({ studentId, batchId, courseTitle });
  res.status(201).json({ success: true, data: cert });
});

apiRouter.get('/certificates/:id', (req: Request, res: Response) => {
  const cert = dataStore.certificates.find(c => c.id === req.params.id || c.certificateNumber === req.params.id || c.verificationCode === req.params.id);
  if (!cert) {
    return res.status(404).json({ success: false, error: 'Certificate not found' });
  }
  res.json({ success: true, data: cert });
});

// 16b. Batch Purchase Requests & Automated WhatsApp Notification Workflow
apiRouter.get('/purchase-requests', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.getPurchaseRequests()
  });
});

apiRouter.post('/purchase-requests', (req: Request, res: Response) => {
  const { studentId, studentName, studentEmail, studentPhone, batchId, subjectId, amount, paymentMode, transactionRef, proofUrl } = req.body;
  if (!studentName || !studentEmail || !studentPhone || !batchId || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required purchase request fields' });
  }
  const created = dataStore.createPurchaseRequest({
    studentId,
    studentName,
    studentEmail,
    studentPhone,
    batchId,
    subjectId,
    amount: Number(amount),
    paymentMode,
    transactionRef: transactionRef || `UPI-UTR-${Date.now()}`,
    proofUrl
  });
  res.status(201).json({
    success: true,
    message: 'Purchase request submitted successfully. Awaiting Admin Payment Verification.',
    data: created
  });
});

apiRouter.post('/purchase-requests/:id/approve', (req: Request, res: Response) => {
  const result = dataStore.approvePurchaseRequest(req.params.id);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Purchase request not found' });
  }
  res.json({
    success: true,
    message: `Batch activated for ${result.student.name} and automated WhatsApp alert dispatched!`,
    data: result.request,
    student: result.student,
    notification: result.notification
  });
});

apiRouter.post('/purchase-requests/:id/reject', (req: Request, res: Response) => {
  const { reason } = req.body;
  const result = dataStore.rejectPurchaseRequest(req.params.id, reason);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Purchase request not found' });
  }
  res.json({
    success: true,
    message: 'Purchase request marked as rejected.',
    data: result
  });
});

// 16c. Comprehensive Student Signup Flow
apiRouter.post('/auth/student-signup', (req: Request, res: Response) => {
  const { fullName, email, password, phoneWhatsapp, classTarget, parentPhone, batchId } = req.body;
  if (!fullName || !email || !phoneWhatsapp) {
    return res.status(400).json({ success: false, error: 'Full name, email, and WhatsApp number are required' });
  }

  const existing = dataStore.students.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, error: `Account with email ${email} already exists` });
  }

  const batch = dataStore.batches.find(b => b.id === batchId) || dataStore.batches[0];
  const newStudent = dataStore.registerStudent({
    name: fullName.trim(),
    email: email.trim(),
    phone: phoneWhatsapp.trim(),
    password: password || 'student123',
    batchId: batch ? batch.id : 'b-prarambh'
  });

  res.status(201).json({
    success: true,
    message: 'Student account created successfully! Welcome to Achiever Academy.',
    data: newStudent
  });
});

// 16d. Autonomous Teacher Academic Scope
apiRouter.get('/teachers/:id/academic-data', (req: Request, res: Response) => {
  const teacher = dataStore.teachers.find(t => t.id === req.params.id);
  if (!teacher) {
    return res.status(404).json({ success: false, error: 'Teacher not found' });
  }

  const teacherBatches = dataStore.batches.filter(b => 
    b.teacherId === teacher.id || 
    teacher.assignedBatches.includes(b.id) ||
    teacher.subjectsExpertise.some(sub => b.subject.toLowerCase().includes(sub.toLowerCase()))
  );

  const teacherBatchIds = new Set(teacherBatches.map(b => b.id));
  const teacherStudents = dataStore.students.filter(s => teacherBatchIds.has(s.batchId));
  const teacherDoubts = dataStore.doubts.filter(d => 
    teacherBatchIds.has(d.batchId) ||
    teacher.subjectsExpertise.some(sub => d.subject.toLowerCase().includes(sub.toLowerCase()))
  );
  const teacherTimetable = dataStore.timetable.filter(t => 
    t.teacherName.toLowerCase().includes(teacher.name.toLowerCase()) ||
    teacherBatchIds.has(t.batchId)
  );

  res.json({
    success: true,
    teacher: {
      id: teacher.id,
      name: teacher.name,
      subjectsExpertise: teacher.subjectsExpertise,
      qualifications: teacher.qualifications
    },
    batches: teacherBatches,
    students: teacherStudents,
    doubts: teacherDoubts,
    timetable: teacherTimetable
    // STRICT FINANCIAL/ADMIN CONTROLS HIDDEN
  });
});

// 17. Dynamic Custom Academic Options (Grades, Subjects, Folders - No Hardcoding)
apiRouter.get('/academic/options', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      grades: dataStore.customGrades,
      subjects: dataStore.customSubjects,
      folders: dataStore.customFolders
    }
  });
});

apiRouter.post('/academic/options', (req: Request, res: Response) => {
  const { type, value } = req.body;
  if (!type || !value) {
    return res.status(400).json({ success: false, error: 'Type (grade | subject | folder) and value are required' });
  }

  if (type === 'grade') {
    dataStore.addCustomGrade(value);
  } else if (type === 'subject') {
    dataStore.addCustomSubject(value);
  } else if (type === 'folder') {
    dataStore.addCustomFolder(value);
  }

  res.status(201).json({
    success: true,
    data: {
      grades: dataStore.customGrades,
      subjects: dataStore.customSubjects,
      folders: dataStore.customFolders
    }
  });
});

apiRouter.delete('/academic/options', (req: Request, res: Response) => {
  const { type, value } = req.body;
  if (!type || !value) {
    return res.status(400).json({ success: false, error: 'Type and value are required' });
  }

  if (type === 'grade') {
    dataStore.customGrades = dataStore.customGrades.filter(g => g !== value);
  } else if (type === 'subject') {
    dataStore.customSubjects = dataStore.customSubjects.filter(s => s !== value);
  } else if (type === 'folder') {
    dataStore.customFolders = dataStore.customFolders.filter(f => f !== value);
  }

  res.json({
    success: true,
    data: {
      grades: dataStore.customGrades,
      subjects: dataStore.customSubjects,
      folders: dataStore.customFolders
    }
  });
});

// 18. Course Checkout & 1-Year Automated Access Enrollment
apiRouter.post('/courses/checkout', (req: Request, res: Response) => {
  const { studentId, studentName, studentEmail, studentPhone, password, batchId, subjectId, pricePaid, paymentMode, transactionRef } = req.body;
  if (!studentName || !studentEmail || !studentPhone || !batchId || !pricePaid) {
    return res.status(400).json({ success: false, error: 'Student details, batchId, and pricePaid are required' });
  }

  const result = dataStore.checkoutCourse({
    studentId,
    studentName,
    studentEmail,
    studentPhone,
    password,
    batchId,
    subjectId,
    pricePaid: Number(pricePaid),
    paymentMode,
    transactionRef
  });

  res.status(201).json({
    success: true,
    data: result
  });
});

// 19. Financial Metrics & Billing System
apiRouter.get('/financials', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.getFinancialMetrics()
  });
});

apiRouter.post('/financials/payout', (req: Request, res: Response) => {
  const { teacherId, amount, paymentMode, transactionRef, notes } = req.body;
  if (!teacherId || !amount) {
    return res.status(400).json({ success: false, error: 'teacherId and amount are required' });
  }

  const payout = dataStore.recordTeacherPayout({
    teacherId,
    amount: Number(amount),
    paymentMode,
    transactionRef,
    notes
  });

  if (!payout) {
    return res.status(404).json({ success: false, error: 'Teacher contract not found' });
  }

  res.status(201).json({
    success: true,
    data: payout
  });
});

// 20. Teacher Contract Management
apiRouter.put('/teachers/:id/contract', (req: Request, res: Response) => {
  const updated = dataStore.updateTeacherContract(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Teacher contract not found' });
  }
  res.json({
    success: true,
    data: updated
  });
});

// 21. Dynamic Course & Subject Pricing / Duration Management
apiRouter.put('/courses/pricing', (req: Request, res: Response) => {
  const { batchId, updates } = req.body;
  if (!batchId || !updates) {
    return res.status(400).json({ success: false, error: 'batchId and updates are required' });
  }

  const updated = dataStore.updateCoursePricing(batchId, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }

  res.json({
    success: true,
    data: updated
  });
});

// 22. Live Class Chat Moderation: Block & Unblock Students
apiRouter.post('/live/chat-block', (req: Request, res: Response) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ success: false, error: 'studentId required' });
  }
  dataStore.blockStudentChat(studentId);
  res.json({ success: true, message: 'Student has been blocked from chat' });
});

apiRouter.post('/live/chat-unblock', (req: Request, res: Response) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ success: false, error: 'studentId required' });
  }
  dataStore.unblockStudentChat(studentId);
  res.json({ success: true, message: 'Student has been unblocked from chat' });
});

// 23. Smart Study Progress & Analytics Tracker
apiRouter.get('/students/:id/progress', (req: Request, res: Response) => {
  const progress = dataStore.getStudentProgress(req.params.id);
  res.json({ success: true, data: progress });
});

apiRouter.post('/students/:id/progress/toggle', (req: Request, res: Response) => {
  const { itemId, itemType } = req.body;
  if (!itemId || !itemType || !['lecture', 'note', 'chapter'].includes(itemType)) {
    return res.status(400).json({ success: false, error: 'itemId and valid itemType (lecture, note, chapter) required' });
  }
  const updated = dataStore.toggleProgressItem(req.params.id, itemId, itemType);
  res.json({ success: true, data: updated });
});

// 24. Smart Bookmarking & Quick Revision Notes
apiRouter.get('/students/:id/bookmarks', (req: Request, res: Response) => {
  const bookmarks = dataStore.getBookmarks(req.params.id);
  res.json({ success: true, data: bookmarks });
});

apiRouter.post('/students/:id/bookmarks', (req: Request, res: Response) => {
  const { type, title, batchName, subjectName, chapterTitle, targetId, timestamp, pageNumber, noteText } = req.body;
  if (!type || !title || !targetId) {
    return res.status(400).json({ success: false, error: 'type, title, and targetId are required' });
  }
  const created = dataStore.addBookmark({
    studentId: req.params.id,
    type,
    title,
    batchName: batchName || 'Class 10 Batch',
    subjectName: subjectName || 'Mathematics',
    chapterTitle: chapterTitle || 'General',
    targetId,
    timestamp,
    pageNumber: pageNumber ? Number(pageNumber) : undefined,
    noteText: noteText || ''
  });
  res.status(201).json({ success: true, data: created });
});

apiRouter.delete('/students/:id/bookmarks/:bookmarkId', (req: Request, res: Response) => {
  const ok = dataStore.deleteBookmark(req.params.bookmarkId);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Bookmark not found' });
  }
  res.json({ success: true, message: 'Bookmark removed successfully' });
});

// 25. Digital Payment Receipts
apiRouter.get('/receipts', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string;
  const list = dataStore.getReceipts(studentId);
  res.json({ success: true, data: list });
});

apiRouter.get('/receipts/:id', (req: Request, res: Response) => {
  const receipt = dataStore.getReceiptById(req.params.id);
  if (!receipt) {
    return res.status(404).json({ success: false, error: 'Receipt not found' });
  }
  res.json({ success: true, data: receipt });
});


