import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  FileSpreadsheet,
  Clock,
  User,
  LogOut,
  Mail,
  Phone,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
  GraduationCap,
  CalendarRange,
  Edit2,
  Building,
  Bookmark,
  Ticket,
  Download,
  Printer,
  School,
  Award,
  ShieldCheck,
  Info,
  FileText
} from 'lucide-react';
import { Student, Teacher, Subject, AttendanceRecord, MarkRecord, TimetableSlot, WorkingHoursEvent } from '../types';

interface StudentPortalProps {
  currentStudent: Student;
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  timetable: TimetableSlot[];
  collegeWorkingHours: WorkingHoursEvent[];
  releasedSemesters: Record<string, boolean>;
  onLogout: () => void;
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentStudent,
  students,
  teachers,
  subjects,
  attendance,
  marks,
  timetable,
  collegeWorkingHours,
  releasedSemesters,
  onLogout,
  onUpdateStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'marks' | 'timetable' | 'college' | 'profile' | 'hallticket'>('dashboard');
  
  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(currentStudent.phone);
  const [editEmail, setEditEmail] = useState(currentStudent.email);
  const [editSuccess, setEditSuccess] = useState(false);
  const [condonationApproved, setCondonationApproved] = useState(false);

  // Filter attendance for current student
  const studentAttendance = attendance.filter(r => r.studentId === currentStudent.id);
  const studentMarks = marks.filter(r => r.studentId === currentStudent.id);

  // Helper: Get subject details
  const getSubject = (subId: string) => subjects.find(s => s.id === subId) || { name: 'Unknown Subject', code: 'N/A' };

  // Helper: Get teacher details
  const getTeacher = (teacherId: string) => teachers.find(t => t.id === teacherId) || { name: 'Faculty Member' };

  // Calculations: Attendance percentages
  const subjectsWithAttendance = subjects.map(subject => {
    const records = studentAttendance.filter(r => r.subjectId === subject.id);
    const total = records.length;
    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length; // 'late' counts as attended
    const percent = total > 0 ? Math.round((presentCount / total) * 100) : 100;
    return {
      subject,
      total,
      present: presentCount,
      absent: total - presentCount,
      percent
    };
  });

  const overallAttendanceTotal = studentAttendance.length;
  const overallAttendancePresent = studentAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
  const overallAttendancePercent = overallAttendanceTotal > 0 
    ? Math.round((overallAttendancePresent / overallAttendanceTotal) * 100) 
    : 85; // Fallback to realistic standard if no records

  const isShortageOfAttendance = overallAttendancePercent < 75 && !condonationApproved;

  const examSubjectsList = [
    { code: 'CS311', name: 'Python Programming', date: '2026-07-13', session: 'FN (09:30 AM - 12:30 PM)', room: 'Room 301' },
    { code: 'CS312', name: 'Software Engineering', date: '2026-07-15', session: 'FN (09:30 AM - 12:30 PM)', room: 'Room 301' },
    { code: 'CS313', name: 'Database Management Systems', date: '2026-07-17', session: 'FN (09:30 AM - 12:30 PM)', room: 'Room 301' },
    { code: 'MAT211', name: 'Mathematics', date: '2026-07-20', session: 'FN (09:30 AM - 12:30 PM)', room: 'Room 301' },
    { code: 'LAN111', name: 'Tamil', date: '2026-07-22', session: 'FN (09:30 AM - 12:30 PM)', room: 'Room 301' },
    { code: 'LAN112', name: 'English', date: '2026-07-24', session: 'FN (09:30 AM - 12:30 PM)', room: 'Room 301' }
  ];

  const handleDownloadSVG = () => {
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#ffffff; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">
  <rect x="15" y="15" width="770" height="1070" fill="#ffffff" stroke="#1e293b" stroke-width="4" rx="8"/>
  <rect x="25" y="25" width="750" height="1050" fill="transparent" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="8 4" rx="6"/>
  <path d="M400,200 L550,300 L550,600 C550,750 400,850 400,850 C400,850 250,750 250,600 L250,300 Z" fill="#f8fafc" opacity="0.3" stroke="#cbd5e1" stroke-width="2"/>
  <text x="400" y="80" text-anchor="middle" font-size="18" font-weight="bold" fill="#0f172a">CMS COLLEGE OF SCIENCE AND COMMERCE</text>
  <text x="400" y="105" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569" letter-spacing="1">CHINNAVEDAMPATTY, COIMBATORE</text>
  <text x="400" y="125" text-anchor="middle" font-size="11" fill="#64748b">Affiliated to Bharathiar University, Coimbatore | Re-accredited by NAAC with 'A' Grade</text>
  <line x1="50" y1="145" x2="750" y2="145" stroke="#334155" stroke-width="1.5"/>
  <text x="400" y="180" text-anchor="middle" font-size="16" font-weight="extrabold" fill="#1e3a8a" letter-spacing="1">END SEMESTER EXAMINATION HALL TICKET - JULY 2026</text>
  <rect x="610" y="210" width="130" height="150" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" rx="4"/>
  <text x="675" y="275" text-anchor="middle" font-size="32" font-weight="bold" fill="#94a3b8">${currentStudent.name.charAt(0)}</text>
  <text x="675" y="310" text-anchor="middle" font-size="10" font-weight="bold" fill="#64748b">PHOTO ID</text>
  <text x="60" y="230" font-size="12" font-weight="bold" fill="#475569">Candidate Name:</text>
  <text x="210" y="230" font-size="13" font-weight="bold" fill="#0f172a">${currentStudent.name}</text>
  <text x="60" y="260" font-size="12" font-weight="bold" fill="#475569">Register Number:</text>
  <text x="210" y="260" font-size="13" font-weight="bold" fill="#1e3a8a" font-family="monospace">${currentStudent.registerNumber}</text>
  <text x="60" y="290" font-size="12" font-weight="bold" fill="#475569">Roll Number:</text>
  <text x="210" y="290" font-size="13" fill="#0f172a" font-family="monospace">${currentStudent.rollNumber}</text>
  <text x="60" y="320" font-size="12" font-weight="bold" fill="#475569">Branch / Course:</text>
  <text x="210" y="320" font-size="13" fill="#0f172a">${currentStudent.course}</text>
  <text x="60" y="350" font-size="12" font-weight="bold" fill="#475569">Semester:</text>
  <text x="210" y="350" font-size="13" fill="#0f172a">${currentStudent.semester} (Regular)</text>
  <text x="60" y="380" font-size="12" font-weight="bold" fill="#475569">Examination Center:</text>
  <text x="210" y="380" font-size="13" fill="#0f172a">CMS College Campus, Chinnavedampatty, Coimbatore</text>
  <g transform="translate(60, 410)">
    <rect x="0" y="0" width="300" height="35" fill="none" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="10" y="5" width="2" height="25" fill="#000000"/>
    <rect x="14" y="5" width="4" height="25" fill="#000000"/>
    <rect x="22" y="5" width="1" height="25" fill="#000000"/>
    <rect x="26" y="5" width="3" height="25" fill="#000000"/>
    <rect x="34" y="5" width="2" height="25" fill="#000000"/>
    <rect x="40" y="5" width="5" height="25" fill="#000000"/>
    <rect x="48" y="5" width="1" height="25" fill="#000000"/>
    <rect x="52" y="5" width="3" height="25" fill="#000000"/>
    <rect x="60" y="5" width="2" height="25" fill="#000000"/>
    <rect x="66" y="5" width="4" height="25" fill="#000000"/>
    <rect x="74" y="5" width="1" height="25" fill="#000000"/>
    <rect x="78" y="5" width="3" height="25" fill="#000000"/>
    <rect x="86" y="5" width="5" height="25" fill="#000000"/>
    <rect x="94" y="5" width="2" height="25" fill="#000000"/>
    <rect x="100" y="5" width="1" height="25" fill="#000000"/>
    <rect x="104" y="5" width="4" height="25" fill="#000000"/>
    <rect x="112" y="5" width="3" height="25" fill="#000000"/>
    <rect x="120" y="5" width="2" height="25" fill="#000000"/>
    <rect x="126" y="5" width="5" height="25" fill="#000000"/>
    <rect x="134" y="5" width="1" height="25" fill="#000000"/>
    <rect x="138" y="5" width="4" height="25" fill="#000000"/>
    <rect x="146" y="5" width="2" height="25" fill="#000000"/>
    <rect x="152" y="5" width="3" height="25" fill="#000000"/>
    <rect x="160" y="5" width="1" height="25" fill="#000000"/>
    <rect x="164" y="5" width="5" height="25" fill="#000000"/>
    <rect x="172" y="5" width="2" height="25" fill="#000000"/>
    <rect x="178" y="5" width="4" height="25" fill="#000000"/>
    <rect x="186" y="5" width="1" height="25" fill="#000000"/>
    <rect x="190" y="5" width="3" height="25" fill="#000000"/>
    <rect x="198" y="5" width="2" height="25" fill="#000000"/>
    <rect x="204" y="5" width="5" height="25" fill="#000000"/>
    <rect x="212" y="5" width="1" height="25" fill="#000000"/>
    <rect x="216" y="5" width="3" height="25" fill="#000000"/>
    <rect x="224" y="5" width="2" height="25" fill="#000000"/>
    <rect x="230" y="5" width="4" height="25" fill="#000000"/>
    <rect x="238" y="5" width="1" height="25" fill="#000000"/>
    <rect x="242" y="5" width="3" height="25" fill="#000000"/>
    <rect x="250" y="5" width="5" height="25" fill="#000000"/>
    <rect x="258" y="5" width="2" height="25" fill="#000000"/>
    <rect x="264" y="5" width="1" height="25" fill="#000000"/>
    <rect x="268" y="5" width="4" height="25" fill="#000000"/>
    <rect x="276" y="5" width="3" height="25" fill="#000000"/>
    <rect x="284" y="5" width="2" height="25" fill="#000000"/>
    <text x="150" y="43" text-anchor="middle" font-size="9" font-family="monospace" letter-spacing="4" fill="#475569">${currentStudent.registerNumber}SEMESTERV</text>
  </g>
  <line x1="50" y1="480" x2="750" y2="480" stroke="#cbd5e1" stroke-width="1"/>
  <rect x="50" y="490" width="700" height="30" fill="#f1f5f9" rx="4"/>
  <text x="65" y="510" font-size="11" font-weight="bold" fill="#334155">COURSE CODE</text>
  <text x="180" y="510" font-size="11" font-weight="bold" fill="#334155">EXAMINATION SUBJECT TITLE</text>
  <text x="490" y="510" font-size="11" font-weight="bold" fill="#334155">DATE</text>
  <text x="590" y="510" font-size="11" font-weight="bold" fill="#334155">SESSION</text>
  <text x="680" y="510" font-size="11" font-weight="bold" fill="#334155">INVIGILATOR</text>
  
  <line x1="50" y1="530" x2="750" y2="530" stroke="#f1f5f9" stroke-width="1"/>
  <text x="65" y="550" font-size="11" font-family="monospace" font-weight="bold" fill="#0f172a">CS311</text>
  <text x="180" y="550" font-size="11" font-weight="bold" fill="#0f172a">Python Programming</text>
  <text x="490" y="550" font-size="11" fill="#334155">13-07-2026</text>
  <text x="590" y="550" font-size="10" fill="#334155">FN (09:30 AM)</text>
  <line x1="680" y1="552" x2="740" y2="552" stroke="#cbd5e1" stroke-width="1"/>

  <line x1="50" y1="565" x2="750" y2="565" stroke="#f1f5f9" stroke-width="1"/>
  <text x="65" y="585" font-size="11" font-family="monospace" font-weight="bold" fill="#0f172a">CS312</text>
  <text x="180" y="585" font-size="11" font-weight="bold" fill="#0f172a">Software Engineering</text>
  <text x="490" y="585" font-size="11" fill="#334155">15-07-2026</text>
  <text x="590" y="585" font-size="10" fill="#334155">FN (09:30 AM)</text>
  <line x1="680" y1="587" x2="740" y2="587" stroke="#cbd5e1" stroke-width="1"/>

  <line x1="50" y1="600" x2="750" y2="600" stroke="#f1f5f9" stroke-width="1"/>
  <text x="65" y="620" font-size="11" font-family="monospace" font-weight="bold" fill="#0f172a">CS313</text>
  <text x="180" y="620" font-size="11" font-weight="bold" fill="#0f172a">Database Management Systems</text>
  <text x="490" y="620" font-size="11" fill="#334155">17-07-2026</text>
  <text x="590" y="620" font-size="10" fill="#334155">FN (09:30 AM)</text>
  <line x1="680" y1="622" x2="740" y2="622" stroke="#cbd5e1" stroke-width="1"/>

  <line x1="50" y1="635" x2="750" y2="635" stroke="#f1f5f9" stroke-width="1"/>
  <text x="65" y="655" font-size="11" font-family="monospace" font-weight="bold" fill="#0f172a">MAT211</text>
  <text x="180" y="655" font-size="11" font-weight="bold" fill="#0f172a">Mathematics</text>
  <text x="490" y="655" font-size="11" fill="#334155">20-07-2026</text>
  <text x="590" y="655" font-size="10" fill="#334155">FN (09:30 AM)</text>
  <line x1="680" y1="657" x2="740" y2="657" stroke="#cbd5e1" stroke-width="1"/>

  <line x1="50" y1="670" x2="750" y2="670" stroke="#f1f5f9" stroke-width="1"/>
  <text x="65" y="690" font-size="11" font-family="monospace" font-weight="bold" fill="#0f172a">LAN111</text>
  <text x="180" y="690" font-size="11" font-weight="bold" fill="#0f172a">Tamil</text>
  <text x="490" y="690" font-size="11" fill="#334155">22-07-2026</text>
  <text x="590" y="690" font-size="10" fill="#334155">FN (09:30 AM)</text>
  <line x1="680" y1="692" x2="740" y2="692" stroke="#cbd5e1" stroke-width="1"/>

  <line x1="50" y1="705" x2="750" y2="705" stroke="#f1f5f9" stroke-width="1"/>
  <text x="65" y="725" font-size="11" font-family="monospace" font-weight="bold" fill="#0f172a">LAN112</text>
  <text x="180" y="725" font-size="11" font-weight="bold" fill="#0f172a">English</text>
  <text x="490" y="725" font-size="11" fill="#334155">24-07-2026</text>
  <text x="590" y="725" font-size="10" fill="#334155">FN (09:30 AM)</text>
  <line x1="680" y1="727" x2="740" y2="727" stroke="#cbd5e1" stroke-width="1"/>

  <line x1="50" y1="745" x2="750" y2="745" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="50" y="765" width="700" height="150" fill="#fafbfb" stroke="#e2e8f0" stroke-width="1" rx="4"/>
  <text x="65" y="785" font-size="10" font-weight="bold" fill="#0f172a">INSTRUCTIONS TO THE CANDIDATE:</text>
  <text x="65" y="805" font-size="9" fill="#475569">1. Candidates must produce their Hall Ticket and valid College Identity Card for admission to the Examination Hall.</text>
  <text x="65" y="823" font-size="9" fill="#475569">2. Occupying seats 15 minutes before exam commencement is mandatory. Latecomers will not be admitted past 30 minutes.</text>
  <text x="65" y="841" font-size="9" fill="#475569">3. Programmable calculators, smartwatches, smartphones, and any electronic gadgets are strictly banned in the hall.</text>
  <text x="65" y="859" font-size="9" fill="#475569">4. Candidates must write their Register Number exactly as printed above. Any discrepancy must be reported to the Principal.</text>
  <text x="65" y="877" font-size="9" fill="#475569">5. Malpractice of any form, including possession of slips, whispering, or copying, will result in immediate suspension.</text>
  <text x="65" y="895" font-size="9" fill="#1e3b8a" font-weight="bold">Note: This is an officially generated digital autonomous admit card. No manual countersign required for regular entry.</text>

  <g transform="translate(0, 940)">
    <text x="150" y="45" text-anchor="middle" font-size="10" font-family="'Courier New', monospace" font-style="italic" fill="#0f172a" font-weight="bold">SD/-</text>
    <text x="150" y="55" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">Dr. Roy Sam Mathew</text>
    <line x1="80" y1="35" x2="220" y2="35" stroke="#94a3b8" stroke-dasharray="2 2"/>
    <text x="150" y="70" text-anchor="middle" font-size="10" font-weight="bold" fill="#64748b" letter-spacing="1">CONTROLLER OF EXAMINATIONS</text>
    <text x="650" y="45" text-anchor="middle" font-size="10" font-family="'Courier New', monospace" font-style="italic" fill="#0f172a" font-weight="bold">SD/-</text>
    <text x="650" y="55" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">Dr. Varghese C. Joshua</text>
    <line x1="580" y1="35" x2="720" y2="35" stroke="#94a3b8" stroke-dasharray="2 2"/>
    <text x="650" y="70" text-anchor="middle" font-size="10" font-weight="bold" fill="#64748b" letter-spacing="1">PRINCIPAL &amp; PRESIDENT</text>
    <circle cx="400" cy="40" r="30" fill="none" stroke="#1e3a8a" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.6"/>
    <text x="400" y="38" text-anchor="middle" font-size="7" fill="#1e3a8a" opacity="0.6" font-weight="bold">CMS COLLEGE</text>
    <text x="400" y="48" text-anchor="middle" font-size="5" fill="#1e3a8a" opacity="0.6">COIMBATORE</text>
  </g>
</svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CMS_College_HallTicket_${currentStudent.registerNumber}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculations: Academic grades
  const internalIMarks = studentMarks.filter(m => m.examType === 'Internal I');
  const internalIIMarks = studentMarks.filter(m => m.examType === 'Internal II');

  const calculateAveragePercentage = (marksList: MarkRecord[]) => {
    if (marksList.length === 0) return 0;
    const totalObtained = marksList.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMax = marksList.reduce((sum, m) => sum + m.maxMarks, 0);
    return Math.round((totalObtained / totalMax) * 100);
  };

  const getGPAFromPercent = (percent: number) => {
    if (percent >= 90) return { gpa: '9.5 / 10 (Outstanding)', grade: 'O' };
    if (percent >= 80) return { gpa: '8.8 / 10 (Excellent)', grade: 'A+' };
    if (percent >= 70) return { gpa: '7.9 / 10 (Very Good)', grade: 'A' };
    if (percent >= 60) return { gpa: '6.8 / 10 (Good)', grade: 'B' };
    if (percent >= 50) return { gpa: '5.5 / 10 (Average)', grade: 'C' };
    return { gpa: 'Fail', grade: 'F' };
  };

  const internal1Avg = calculateAveragePercentage(internalIMarks);
  const internal2Avg = calculateAveragePercentage(internalIIMarks);
  const overallAvg = internal2Avg > 0 ? internal2Avg : (internal1Avg > 0 ? internal1Avg : 82);
  const { gpa, grade } = getGPAFromPercent(overallAvg);

  // Group timetable by Day
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

  // Handle profile update
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudent({
      ...currentStudent,
      phone: editPhone,
      email: editEmail
    });
    setEditSuccess(true);
    setIsEditingProfile(false);
    setTimeout(() => setEditSuccess(false), 3000);
  };

  return (
    <div id="student-portal-root" className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800 print:bg-white print:block print:p-0 print:m-0">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside id="student-sidebar" className="w-full md:w-64 bg-indigo-950 text-white shrink-0 border-r border-indigo-900 flex flex-col justify-between print:hidden">
        <div className="p-5">
          {/* Header/College Logo */}
          <div className="flex items-center space-x-2.5 mb-8 border-b border-indigo-900 pb-5">
            <div className="bg-amber-500 p-1.5 rounded-lg text-indigo-950">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider leading-tight uppercase text-amber-400">CMS College of Science and Commerce</h2>
              <span className="text-[10px] text-slate-300 uppercase tracking-widest font-mono">Chinnavedampatty, Coimbatore</span>
            </div>
          </div>

          {/* Student mini-card */}
          <div className="mb-6 bg-indigo-900/40 border border-indigo-800/50 p-4 rounded-xl flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm"
              style={{ backgroundColor: currentStudent.avatarColor }}
            >
              {currentStudent.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate text-white">{currentStudent.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono truncate">{currentStudent.registerNumber}</p>
              <span className="inline-block mt-1 bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-md font-mono border border-amber-500/30">
                {currentStudent.semester}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              id="student-nav-dash"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-indigo-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-indigo-900/50'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Academic Dashboard</span>
            </button>

            <button
              id="student-nav-attendance"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'attendance'
                  ? 'bg-amber-500 text-indigo-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-indigo-900/50'
              }`}
              onClick={() => setActiveTab('attendance')}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>View Attendance</span>
            </button>

            <button
              id="student-nav-marks"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'marks'
                  ? 'bg-amber-500 text-indigo-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-indigo-900/50'
              }`}
              onClick={() => setActiveTab('marks')}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Exam Report Cards</span>
            </button>

            <button
              id="student-nav-timetable"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'timetable'
                  ? 'bg-amber-500 text-indigo-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-indigo-900/50'
              }`}
              onClick={() => setActiveTab('timetable')}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>My Lecture Timetable</span>
            </button>

            <button
              id="student-nav-college"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'college'
                  ? 'bg-amber-500 text-indigo-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-indigo-900/50'
              }`}
              onClick={() => setActiveTab('college')}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>College Working Hours</span>
            </button>

            <button
              id="student-nav-hallticket"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'hallticket'
                  ? 'bg-amber-500 text-indigo-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-indigo-900/50'
              }`}
              onClick={() => setActiveTab('hallticket')}
            >
              <Ticket className="w-4 h-4 shrink-0" />
              <span>Download Hall Ticket</span>
            </button>

            <button
              id="student-nav-profile"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-indigo-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-indigo-900/50'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Student Profile</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-indigo-900/80 bg-indigo-950/40">
          <button
            id="student-btn-logout"
            type="button"
            className="w-full flex items-center justify-center space-x-2 bg-indigo-900 hover:bg-red-950 text-slate-300 hover:text-white py-2 px-3 rounded-lg text-xs font-bold transition-all border border-indigo-800 hover:border-red-900"
            onClick={onLogout}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Portal</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER NAVIGATION */}
      <div id="student-mobile-nav" className="md:hidden bg-indigo-950 text-white p-4 flex flex-col space-y-3 shadow-md border-b-2 border-amber-500 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500 p-1 rounded text-indigo-950">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold leading-none text-amber-400">CMS COLLEGE OF SCIENCE AND COMMERCE</h2>
              <span className="text-[9px] font-mono text-slate-300">STUDENT DESK • COIMBATORE</span>
            </div>
          </div>
          <button
            id="student-mobile-btn-logout"
            type="button"
            onClick={onLogout}
            className="text-[10px] text-slate-300 flex items-center space-x-1.5 bg-indigo-900 py-1 px-2.5 rounded-md border border-indigo-800"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Out</span>
          </button>
        </div>

        {/* Scrollable Horizontal Menu */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-indigo-800">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'marks', label: 'Marks' },
            { id: 'timetable', label: 'Timetable' },
            { id: 'college', label: 'Working Hours' },
            { id: 'hallticket', label: 'Hall Ticket' },
            { id: 'profile', label: 'Profile' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`shrink-0 text-[10px] font-semibold py-1.5 px-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-amber-500 text-indigo-950 font-bold'
                  : 'bg-indigo-900/50 text-slate-200 hover:bg-indigo-900'
              }`}
              onClick={() => setActiveTab(item.id as any)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP STATUS BAR */}
        <header id="student-main-header" className="hidden md:flex bg-white h-16 border-b border-slate-200 px-8 items-center justify-between shadow-sm shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-6 h-6 text-indigo-950" />
            <h3 className="font-bold text-slate-800 text-md">
              {activeTab === 'dashboard' && 'Academic Student Dashboard'}
              {activeTab === 'attendance' && 'Live Attendance Audit'}
              {activeTab === 'marks' && 'Consolidated Report Cards'}
              {activeTab === 'timetable' && 'Personal Lecture Grid'}
              {activeTab === 'college' && 'CMS College Working Timetable'}
              {activeTab === 'hallticket' && 'Semester Examination Hall Ticket'}
              {activeTab === 'profile' && 'Official Student Dossier'}
            </h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 font-mono">Today's Session Date</span>
              <span className="text-xs font-bold text-slate-700">2026-06-30 (Tuesday)</span>
            </div>
          </div>
        </header>

        {/* VIEW PORT CLIPPED */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6 print:p-0 print:m-0 print:max-w-full">
          
          {editSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Your profile contact details have been successfully saved and updated.</span>
            </div>
          )}

          {/* ==================== DASHBOARD VIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* CMS College Welcome Banner */}
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md border-l-8 border-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-extrabold text-white">Welcome back, {currentStudent.name}!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You are currently in <strong className="text-amber-400">{currentStudent.semester}</strong>, majoring in <strong className="text-amber-400">{currentStudent.course}</strong>. Keep an eye on your attendance threshold!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    id="dash-btn-quick-attendance"
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold text-[11px] px-3.5 py-2 rounded-lg transition-all"
                  >
                    Audits Attendance
                  </button>
                  <button
                    id="dash-btn-quick-marks"
                    type="button"
                    onClick={() => setActiveTab('marks')}
                    className="bg-indigo-800 hover:bg-indigo-700 text-white font-semibold text-[11px] px-3.5 py-2 rounded-lg transition-all border border-indigo-700"
                  >
                    View Grades
                  </button>
                </div>
              </div>

              {/* KPI CARDS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Gauge: Overall Attendance */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Attendance</span>
                  <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
                    {/* SVG Circular Ring Gauge */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="34" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        stroke={overallAttendancePercent >= 75 ? "#10b981" : "#ef4444"} 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - overallAttendancePercent / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-slate-800">{overallAttendancePercent}%</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    overallAttendancePercent >= 75 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                  }`}>
                    {overallAttendancePercent >= 75 ? 'ELIGIBLE' : 'SHORTAGE ALERT'}
                  </span>
                </div>

                {/* KPI: CGPA Indicator */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">GPA Grade Level</span>
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-2 border border-indigo-100 text-indigo-950">
                    <GraduationCap className="w-7 h-7 text-indigo-900" />
                  </div>
                  <span className="text-md font-extrabold text-slate-800 leading-none">{gpa.split(' ')[0]} GPA</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold">Grade: <strong className="text-indigo-600 font-extrabold">{grade}</strong></span>
                </div>

                {/* KPI: Registered Subjects */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Load</span>
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-2 border border-amber-100 text-amber-800">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-md font-extrabold text-slate-800 leading-none">{subjects.length} Subjects</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                    {subjects.reduce((sum, s) => sum + s.credits, 0)} Total Credits
                  </span>
                </div>

                {/* KPI: Class Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Roster Details</span>
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-2 border border-emerald-100 text-emerald-800">
                    <Bookmark className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 leading-none">{currentStudent.rollNumber} / {currentStudent.registerNumber}</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold truncate max-w-full">
                    {currentStudent.department}
                  </span>
                </div>

              </div>

              {/* TIMETABLE PREVIEW & CRITICAL ALERTS */}
              <div className="grid md:grid-cols-12 gap-6">
                
                {/* Today's Lectures Preview */}
                <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <CalendarRange className="w-4 h-4 text-indigo-900" />
                      <span>Tuesday Classes (Current)</span>
                    </h4>
                    <button
                      id="dash-link-timetable"
                      type="button"
                      onClick={() => setActiveTab('timetable')}
                      className="text-indigo-600 hover:underline text-[10px] font-bold"
                    >
                      Entire Grid
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {timetable.filter(t => t.day === 'Tuesday').map((slot) => {
                      const sub = getSubject(slot.subjectId);
                      const teach = getTeacher(slot.teacherId);
                      return (
                        <div key={slot.id} className="flex items-center space-x-3.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 transition-all">
                          <div className="bg-indigo-100 border border-indigo-200 text-indigo-950 p-2 rounded-lg font-bold text-[10px] text-center min-w-[70px] shrink-0 font-mono">
                            {slot.timeSlot.split(' ')[0]} {slot.timeSlot.split(' ')[1]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-slate-800 truncate">{sub.name}</h5>
                            <p className="text-[10px] text-slate-500 font-medium truncate">Prof: {teach.name} • Room: {slot.room}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Important Board / Alerts */}
                <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
                    ERP Bulletin Board
                  </h4>
                  
                  <div className="space-y-3.5">
                    {overallAttendancePercent < 75 && (
                      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3.5 text-xs flex items-start space-x-2.5 animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h6 className="font-bold text-red-900 mb-0.5">ATTENDANCE SHORTAGE ALERT!</h6>
                          <p className="text-[10px] text-red-700 leading-relaxed">
                            Your overall percentage is currently <strong className="font-bold">{overallAttendancePercent}%</strong>, which is below the mandatory university threshold of 75%. Submit medical letters or attend makeup slots immediately.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-950 text-[11px]">Internal I Results Release</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">Published</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Dr. Thomas Kurian has uploaded the Internal I & II grades. Check the Consolidated Report Cards module.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-950 text-[11px]">Semester Exams Timetable</span>
                        <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">Tentative</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        CMS College autonomous exams for third year will tentatively commence from July 22, 2026. Hall tickets release requires clearance of all department dues.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== ATTENDANCE VIEW ==================== */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Alert Warning if overall attendance is less than 75 */}
              {overallAttendancePercent < 75 && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs flex items-center space-x-3.5">
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-red-950">SHORTAGE WARNING FOR UNIVERSITY EXAMINATION ELIGIBILITY</h4>
                    <p className="text-[10px] text-red-700 leading-relaxed mt-0.5">
                      Your current overall standing is <strong className="font-extrabold">{overallAttendancePercent}%</strong>. University regulations dictate that students with less than 75% attendance will be detained from taking the semester examinations. Please immediately consult with Dr. Thomas Kurian.
                    </p>
                  </div>
                </div>
              )}

              {/* Subject-Wise Summary Rings */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjectsWithAttendance.map(({ subject, total, present, absent, percent }) => (
                  <div key={subject.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1 min-w-0 pr-2">
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-mono font-bold px-1.5 py-0.5 rounded">
                        {subject.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate" title={subject.name}>
                        {subject.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Conduct: {total} | Pres: {present} | Abs: {absent}
                      </p>
                    </div>

                    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="23" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                        <circle 
                          cx="28" 
                          cy="28" 
                          r="23" 
                          stroke={percent >= 75 ? "#10b981" : "#ef4444"} 
                          strokeWidth="4" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 23}
                          strokeDashoffset={2 * Math.PI * 23 * (1 - percent / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-extrabold text-slate-800">{percent}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* DETAILED DAILY LOGS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
                  Day-by-Day Historical Attendance Logs
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        <th className="py-3 px-4 font-bold">Session Date</th>
                        <th className="py-3 px-4 font-bold">Subject Code</th>
                        <th className="py-3 px-4 font-bold">Subject Title</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {studentAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 font-mono">
                            No attendance logs loaded. Start taking attendance as a Teacher to populate this section.
                          </td>
                        </tr>
                      ) : (
                        // Sort by date descending
                        [...studentAttendance].sort((a, b) => b.date.localeCompare(a.date)).map((rec) => {
                          const sub = getSubject(rec.subjectId);
                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 font-mono font-bold text-slate-600">{rec.date}</td>
                              <td className="py-3 px-4 font-mono font-medium text-slate-500">{sub.code}</td>
                              <td className="py-3 px-4 font-bold text-slate-800">{sub.name}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center space-x-1 py-1 px-2.5 rounded-full text-[10px] font-bold border ${
                                  rec.status === 'present'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : rec.status === 'late'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {rec.status === 'present' && <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-500" />}
                                  {rec.status === 'late' && <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
                                  {rec.status === 'absent' && <XCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />}
                                  <span className="uppercase">{rec.status}</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== MARKS VIEW ==================== */}
          {activeTab === 'marks' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Internal Exams Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Internal Assessment I */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Internal Assessment I
                    </h4>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-extrabold font-mono">
                      Average: {internal1Avg}%
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {internalIMarks.map((mk) => {
                      const sub = getSubject(mk.subjectId);
                      const percent = Math.round((mk.marksObtained / mk.maxMarks) * 100);
                      return (
                        <div key={mk.id} className="space-y-1.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>{sub.name}</span>
                            <span className="font-mono">{mk.marksObtained} / {mk.maxMarks}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${percent >= 75 ? 'bg-indigo-600' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          {mk.comments && <p className="text-[10px] italic text-slate-400">"{mk.comments}"</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Internal Assessment II */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Internal Assessment II
                    </h4>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-extrabold font-mono">
                      Average: {internal2Avg}%
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {internalIIMarks.length === 0 ? (
                      <p className="text-center py-12 text-xs text-slate-400 font-mono">No records loaded for Internal II.</p>
                    ) : (
                      internalIIMarks.map((mk) => {
                        const sub = getSubject(mk.subjectId);
                        const percent = Math.round((mk.marksObtained / mk.maxMarks) * 100);
                        return (
                          <div key={mk.id} className="space-y-1.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                            <div className="flex justify-between text-xs font-bold text-slate-800">
                              <span>{sub.name}</span>
                              <span className="font-mono">{mk.marksObtained} / {mk.maxMarks}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${percent >= 75 ? 'bg-indigo-600' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            {mk.comments && <p className="text-[10px] italic text-slate-400">"{mk.comments}"</p>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* CONSOLIDATED GRADE SHEET */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Consolidated Grade & Performance Matrix
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">CMS College of Science and Commerce</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        <th className="py-3 px-4 font-bold">Code</th>
                        <th className="py-3 px-4 font-bold">Subject</th>
                        <th className="py-3 px-4 font-bold text-center">Internal I (50)</th>
                        <th className="py-3 px-4 font-bold text-center">Internal II (50)</th>
                        <th className="py-3 px-4 font-bold text-center">Consolidated (100)</th>
                        <th className="py-3 px-4 font-bold text-center">Estimated Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {subjects.map((sub) => {
                        const m1 = internalIMarks.find(m => m.subjectId === sub.id)?.marksObtained ?? '-';
                        const m2 = internalIIMarks.find(m => m.subjectId === sub.id)?.marksObtained ?? '-';
                        
                        let total: number | '-' = '-';
                        if (typeof m1 === 'number' && typeof m2 === 'number') {
                          total = m1 + m2;
                        } else if (typeof m1 === 'number') {
                          total = m1 * 2; // Simulated Consolidated if only 1 internal is uploaded
                        }

                        let itemGrade = 'N/A';
                        if (typeof total === 'number') {
                          if (total >= 90) itemGrade = 'O (Outstanding)';
                          else if (total >= 80) itemGrade = 'A+ (Excellent)';
                          else if (total >= 70) itemGrade = 'A (Very Good)';
                          else if (total >= 60) itemGrade = 'B (Good)';
                          else if (total >= 50) itemGrade = 'C (Pass)';
                          else itemGrade = 'F (Re-appear)';
                        }

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="py-3.5 px-4 font-mono text-slate-500 font-bold">{sub.code}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">{sub.name}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">{m1}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">{m2}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-extrabold text-indigo-700">
                              {total !== '-' ? `${total} / 100` : '-'}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold">
                              <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase ${
                                itemGrade.startsWith('O') || itemGrade.startsWith('A')
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : itemGrade.startsWith('B') || itemGrade.startsWith('C')
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : itemGrade === 'N/A'
                                  ? 'bg-slate-50 text-slate-400 border border-slate-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {itemGrade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== MY TIMETABLE VIEW ==================== */}
          {activeTab === 'timetable' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Weekly Academic Lecture Grid
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">Course Room Location: <strong className="text-slate-600">Room 301 (Computer Science Dept)</strong></p>
                  </div>
                  <span className="bg-indigo-900 text-white font-bold text-[10px] px-2.5 py-1 rounded font-mono">
                    Year III - Sem V
                  </span>
                </div>

                <div className="space-y-6">
                  {daysOfWeek.map((day) => {
                    const slotsForDay = timetable.filter(t => t.day === day);
                    return (
                      <div key={day} className="space-y-2">
                        <h5 className="font-bold text-xs text-indigo-950 flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>{day}</span>
                        </h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          {slotsForDay.map((slot) => {
                            const sub = getSubject(slot.subjectId);
                            const teach = getTeacher(slot.teacherId);
                            return (
                              <div key={slot.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between">
                                <span className="block text-[9px] font-mono font-bold text-indigo-700 mb-2 border-b border-slate-200/60 pb-1">
                                  {slot.timeSlot}
                                </span>
                                <div>
                                  <h6 className="text-[11px] font-bold text-slate-800 leading-tight truncate-2-lines">{sub.name}</h6>
                                  <p className="text-[10px] text-slate-500 mt-1 truncate">{teach.name}</p>
                                </div>
                                <div className="mt-2.5 flex items-center justify-between">
                                  <span className="bg-slate-200/70 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                                    {sub.code}
                                  </span>
                                  <span className="text-slate-400 text-[10px] font-mono">{slot.room}</span>
                                </div>
                              </div>
                            );
                          })}
                          {slotsForDay.length === 0 && (
                            <p className="text-slate-400 text-xs italic py-2 col-span-5">No classes scheduled.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ==================== COLLEGE TIMETABLE VIEW ==================== */}
          {activeTab === 'college' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      CMS College Facility Working Timetable
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">General schedules for common facilities, blocks, and office hours.</p>
                  </div>
                  <School className="w-5 h-5 text-indigo-950" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {collegeWorkingHours.map((event) => (
                    <div key={event.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition-all flex items-start space-x-3.5">
                      <div className="bg-indigo-950 text-amber-400 p-2.5 rounded-lg shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-xs font-bold text-slate-800 truncate">{event.title}</h5>
                          <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] px-2 py-0.5 rounded font-extrabold font-mono shrink-0">
                            {event.timing}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-indigo-950 font-mono">Location: {event.facility}</p>
                        <p className="text-[10.5px] text-slate-500 leading-relaxed pt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== HALL TICKET VIEW ==================== */}
          {activeTab === 'hallticket' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Check Release Status */}
              {!(releasedSemesters && releasedSemesters[currentStudent.semester]) ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-xl mx-auto space-y-5">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                    <Info className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="inline-block bg-slate-100 border border-slate-200 text-slate-500 text-[10px] px-2.5 py-1 rounded-full font-bold font-mono uppercase">
                      STATUS: HOLD / NOT RELEASED
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-800">Semester Examination Admit Cards</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      The Controller of Examinations of CMS College of Science and Commerce has not officially released hall tickets for **{currentStudent.semester}** yet. 
                      Admit cards will be available for download here once authorized.
                    </p>
                  </div>
                  
                  {/* Subject registration verification list */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-200 pb-1.5">
                      Your Registered Subjects Course Load
                    </h4>
                    <div className="space-y-2">
                      {examSubjectsList.map(sub => (
                        <div key={sub.code} className="flex justify-between text-xs">
                          <span className="font-mono font-bold text-indigo-950">{sub.code}</span>
                          <span className="text-slate-600 truncate max-w-[250px]">{sub.name}</span>
                          <span className="text-slate-400 text-[10px]">Regular</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isShortageOfAttendance ? (
                // Shortage of Attendance (Detained) block
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-xl mx-auto space-y-6">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-inner">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="inline-block bg-red-100 border border-red-200 text-red-800 text-[10px] px-2.5 py-1 rounded-full font-bold font-mono uppercase">
                      STATUS: DETAINED (SHORTAGE)
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-800">Hall Ticket Issuance Blocked</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your cumulative academic attendance is **{overallAttendancePercent}%**, which falls below the mandatory **75%** threshold required by the CMS Board of Studies.
                    </p>
                  </div>

                  {/* Attendance breakdown summary */}
                  <div className="bg-red-50/35 border border-red-100 rounded-xl p-4 text-xs text-left space-y-3">
                    <div className="flex justify-between items-center border-b border-red-100 pb-2">
                      <span className="font-bold text-red-900">Your Attendance Audit</span>
                      <span className="font-mono font-extrabold text-red-600 bg-white border border-red-100 px-2 py-0.5 rounded">
                        {overallAttendancePercent}% / 75% Required
                      </span>
                    </div>
                    <p className="text-[11px] text-red-800/80 leading-relaxed">
                      To lift this detention, you can apply for a formal Condonation of Attendance shortage by submitting genuine medical credentials or certificates representing on-duty academic participation.
                    </p>
                  </div>

                  {/* Submit Condonation Action */}
                  <div className="pt-2">
                    <button
                      id="btn-apply-condonation"
                      type="button"
                      onClick={() => {
                        setCondonationApproved(true);
                        alert("Condonation application approved by Head of Department & Principal! Your admit card is now unlocked.");
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 mx-auto"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Mock Condonation Form & Unlock</span>
                    </button>
                    <p className="text-[9px] text-slate-400 font-mono mt-2">
                      (Simulates administrative HOD waiver to test candidate eligibility)
                    </p>
                  </div>
                </div>
              ) : (
                // Unlocked / Released Roster: Beautiful admit card sheet!
                <div className="space-y-6">
                  {/* Control Bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm print:hidden">
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Examination Hall Ticket Verified</p>
                        <p className="text-slate-400 text-[10px]">Regular candidate eligibility satisfies all requirements.</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2.5 w-full sm:w-auto">
                      <button
                        id="btn-print-hallticket"
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Admit Card</span>
                      </button>

                      <button
                        id="btn-download-hallticket"
                        type="button"
                        onClick={handleDownloadSVG}
                        className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download SVG Admit Card</span>
                      </button>
                    </div>
                  </div>

                  {/* VISUAL HALL TICKET SHEET (HIGH-FIDELITY PRINT FORMAT) */}
                  <div 
                    id="printable-hallticket-document" 
                    className="bg-white rounded-2xl border-4 border-slate-800 p-8 shadow-md relative overflow-hidden print:border-0 print:p-0 print:shadow-none"
                  >
                    {/* Background Seal watermark overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                      <School className="w-[450px] h-[450px] text-indigo-950" />
                    </div>

                    {/* Outer dotted border inside sheet */}
                    <div className="border border-dashed border-amber-500/50 p-6 space-y-6 rounded-xl">
                      
                      {/* Header block */}
                      <header className="text-center pb-5 border-b-2 border-slate-800 space-y-1 relative">
                        <h2 className="text-lg md:text-xl font-extrabold text-slate-950 tracking-wider">CMS COLLEGE OF SCIENCE AND COMMERCE</h2>
                        <h3 className="text-xs font-bold text-slate-600 tracking-widest font-mono uppercase">CHINNAVEDAMPATTY, COIMBATORE</h3>
                        <p className="text-[10px] text-slate-400 leading-normal max-w-md mx-auto">
                          Affiliated to Bharathiar University, Coimbatore | Re-accredited by NAAC with 'A' Grade
                        </p>
                        <span className="block pt-2 text-xs font-extrabold text-indigo-900 tracking-wide font-serif">
                          END SEMESTER REGULAR EXAMINATION HALL TICKET - JULY 2026
                        </span>
                      </header>

                      {/* Profile details & barcode card */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                        {/* Information table */}
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Candidate Name</span>
                            <span className="font-extrabold text-slate-950">{currentStudent.name}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Register Number</span>
                            <span className="font-bold text-indigo-900 font-mono text-sm">{currentStudent.registerNumber}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Course & Branch</span>
                            <span className="font-bold text-slate-800">{currentStudent.course}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Roll Number / Identity</span>
                            <span className="font-mono text-slate-700 font-bold">{currentStudent.rollNumber}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Semester Term</span>
                            <span className="font-bold text-slate-800">{currentStudent.semester} (Regular)</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Examination Center</span>
                            <span className="font-bold text-slate-800">CMS College Campus, Chinnavedampatty, Coimbatore</span>
                          </div>
                        </div>

                        {/* Photo placeholder / barcode column */}
                        <div className="flex flex-col items-center justify-center space-y-3 md:col-span-1 shrink-0">
                          {/* Framed Photo placeholder */}
                          <div className="w-28 h-32 bg-slate-50 border border-slate-300 rounded flex flex-col items-center justify-center text-center p-2 shadow-inner relative overflow-hidden">
                            <span className="font-extrabold text-2xl text-slate-300 leading-none">{currentStudent.name.charAt(0)}</span>
                            <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-1">AFFIX PHOTO</span>
                            <div className="absolute inset-x-0 bottom-0 bg-slate-800/40 py-0.5 text-center">
                              <span className="text-[7px] text-white font-bold uppercase font-mono">Verified ID</span>
                            </div>
                          </div>

                          {/* Mock Barcode */}
                          <div className="space-y-1 text-center w-full max-w-[120px]">
                            <div className="flex h-6 justify-center items-stretch bg-white border border-slate-200 p-0.5 overflow-hidden">
                              {[2, 4, 1, 3, 2, 5, 1, 3, 2, 4, 1, 3, 2, 5, 1, 3, 2, 4, 1, 3, 2, 5, 2, 3, 1].map((val, idx) => (
                                <div key={idx} className="bg-black" style={{ width: `${val}px`, marginLeft: '1px' }}></div>
                              ))}
                            </div>
                            <span className="block text-[8px] font-mono font-bold tracking-widest text-slate-400">
                              {currentStudent.registerNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Exams Table schedule */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                              <th className="py-2.5 px-4">Subject Code</th>
                              <th className="py-2.5 px-4">Registered Course Subject Title</th>
                              <th className="py-2.5 px-4">Exam Date</th>
                              <th className="py-2.5 px-4">Session Grid</th>
                              <th className="py-2.5 px-4 text-center">Invigilator Sign</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-800">
                            {examSubjectsList.map(item => (
                              <tr key={item.code} className="hover:bg-slate-50/20">
                                <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.code}</td>
                                <td className="py-3 px-4 font-bold">{item.name}</td>
                                <td className="py-3 px-4 font-medium text-slate-600">{item.date}</td>
                                <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{item.session}</td>
                                <td className="py-3 px-4 text-center">
                                  <div className="w-16 h-4 border-b border-slate-200 mx-auto"></div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Instructions panel */}
                      <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl text-[10px] text-slate-500 space-y-2.5 leading-relaxed">
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-xs">INSTRUCTIONS TO THE CANDIDATE:</h4>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Candidates must produce this Hall Ticket and their valid College Identity Card for admission to the Examination Hall.</li>
                          <li>Occupying seats 15 minutes before exam commencement is mandatory. Latecomers will not be admitted past 30 minutes.</li>
                          <li>Programmable calculators, smartwatches, smartphones, and any electronic gadgets are strictly banned.</li>
                          <li>Candidates must write their Register Number exactly as printed above. Any discrepancy must be reported to the Principal.</li>
                          <li>Malpractice of any form, including possession of paper slips or copying, will result in immediate suspension.</li>
                        </ol>
                        <p className="text-[10px] font-bold text-indigo-900 border-t border-slate-200 pt-2 font-serif italic text-center">
                          * This is an officially generated digital autonomous admit card. No manual countersign required for regular entry.
                        </p>
                      </div>

                      {/* Signatures block */}
                      <footer className="grid grid-cols-2 gap-12 pt-8 text-center text-[10px] text-slate-600">
                        <div className="space-y-4">
                          <div className="h-6 flex items-end justify-center">
                            <span className="font-serif italic text-xs font-bold text-slate-700 select-none">SD/-</span>
                          </div>
                          <div className="space-y-0.5 border-t border-slate-300 pt-1">
                            <p className="font-bold text-slate-800">Dr. Roy Sam Mathew</p>
                            <p className="uppercase tracking-widest text-[8px] font-bold text-slate-400 font-mono">Controller of Examinations</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="h-6 flex items-end justify-center">
                            <span className="font-serif italic text-xs font-bold text-slate-700 select-none">SD/-</span>
                          </div>
                          <div className="space-y-0.5 border-t border-slate-300 pt-1">
                            <p className="font-bold text-slate-800">Dr. Varghese C. Joshua</p>
                            <p className="uppercase tracking-widest text-[8px] font-bold text-slate-400 font-mono">Principal & President</p>
                          </div>
                        </div>
                      </footer>

                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== PROFILE VIEW ==================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Profile Header Band */}
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-6 md:p-8 text-white flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shrink-0 border-4 border-amber-500/80 shadow-md"
                    style={{ backgroundColor: currentStudent.avatarColor }}
                  >
                    {currentStudent.name.charAt(0)}
                  </div>
                  <div className="text-center md:text-left space-y-1 min-w-0 flex-1">
                    <h3 className="text-xl font-bold leading-tight text-white">{currentStudent.name}</h3>
                    <p className="text-xs text-slate-300 font-mono">{currentStudent.course} • {currentStudent.semester}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1.5">
                      <span className="bg-indigo-900 border border-indigo-800 text-slate-300 text-[9px] px-2 py-0.5 rounded font-mono">
                        Reg: {currentStudent.registerNumber}
                      </span>
                      <span className="bg-indigo-900 border border-indigo-800 text-slate-300 text-[9px] px-2 py-0.5 rounded font-mono">
                        Roll: {currentStudent.rollNumber}
                      </span>
                    </div>
                  </div>
                  
                  {!isEditingProfile && (
                    <button
                      id="profile-btn-edit-toggle"
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 shrink-0 shadow-md"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Contacts</span>
                    </button>
                  )}
                </div>

                <div className="p-6 md:p-8">
                  {!isEditingProfile ? (
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left: Academic Profile Details */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                          Academic Affiliation
                        </h4>
                        
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Department:</span>
                            <span className="font-bold text-slate-700">{currentStudent.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Enrolled Course:</span>
                            <span className="font-bold text-slate-700">{currentStudent.course}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Admitted Batch:</span>
                            <span className="font-bold text-slate-700">{currentStudent.batch}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Current Semester:</span>
                            <span className="font-bold text-slate-700">{currentStudent.semester}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Contact Information */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                          Contact Dossier
                        </h4>
                        
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center space-x-3 py-1">
                            <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-slate-400 font-mono">Institutional Email</span>
                              <span className="font-bold text-slate-700">{currentStudent.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 py-1">
                            <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-slate-400 font-mono">Mobile Contact</span>
                              <span className="font-bold text-slate-700">{currentStudent.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 py-1">
                            <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-slate-400 font-mono">Permanent Home Address</span>
                              <span className="font-bold text-slate-700">CMS College Hostels, Chinnavedampatty, Coimbatore, Tamil Nadu 641049</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* PROFILE EDIT FORM */
                    <form onSubmit={handleProfileSave} className="max-w-xl space-y-4">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                        Update Contact Information
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label htmlFor="edit-email" className="block text-xs font-semibold text-slate-600 mb-1">Institutional Email</label>
                          <input
                            id="edit-email"
                            type="email"
                            required
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-phone" className="block text-xs font-semibold text-slate-600 mb-1">Mobile Contact</label>
                          <input
                            id="edit-phone"
                            type="text"
                            required
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-3.5 pt-4">
                        <button
                          id="edit-btn-save"
                          type="submit"
                          className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-md"
                        >
                          Save Changes
                        </button>
                        <button
                          id="edit-btn-cancel"
                          type="button"
                          onClick={() => {
                            setEditPhone(currentStudent.phone);
                            setEditEmail(currentStudent.email);
                            setIsEditingProfile(false);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg border border-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ==================== HALL TICKET VIEW ==================== */}
          {activeTab === 'hallticket' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Shortage Checklist or Approval Banner (interactive demo) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-900" />
                      <span>Hall Ticket Eligibility Status</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Minimum required attendance for End-Semester examinations is <strong className="text-indigo-900">75%</strong>.
                    </p>
                  </div>
                  
                  {/* Demo Condonation Override Toggle */}
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center space-x-3.5">
                    <span className="text-[11px] font-bold text-slate-600">Shortage Override (Demo):</span>
                    <button
                      id="hallticket-btn-override"
                      type="button"
                      onClick={() => setCondonationApproved(!condonationApproved)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        condonationApproved ? 'bg-indigo-900' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          condonationApproved ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-extrabold text-indigo-950 font-mono">
                      {condonationApproved ? 'APPROVED' : 'NONE'}
                    </span>
                  </div>
                </div>

                {isShortageOfAttendance ? (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-xs flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-extrabold text-red-950">ADMIT CARD BLOCKED — ATTENDANCE CRITERIA SHORTAGE</h5>
                      <p className="leading-relaxed text-[10.5px]">
                        Your current cumulative attendance is <strong className="font-bold">{overallAttendancePercent}%</strong>, which falls short of the mandatory 75% autonomous college threshold.
                      </p>
                      <p className="leading-relaxed text-[10.5px] text-red-700">
                        Please toggle the <strong className="font-bold">Shortage Override</strong> control above or contact the Principal to grant a Condonation Certificate.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 text-xs flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h5 className="font-extrabold text-emerald-950">ELIGIBILITY CLEARANCE GRANTED</h5>
                      <p className="text-[10.5px] text-emerald-700 leading-relaxed">
                        {condonationApproved ? 'Shortage cleared via Principal Condonation approval override.' : `Your overall attendance of ${overallAttendancePercent}% successfully satisfies university clearance. Admit card active.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION TOOLBAR */}
              {!isShortageOfAttendance && (
                <div className="flex flex-wrap gap-3.5 print:hidden">
                  <button
                    id="hallticket-btn-download-svg"
                    type="button"
                    onClick={handleDownloadSVG}
                    className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition-all border border-indigo-900"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Vector Admit Card (SVG)</span>
                  </button>
                  <button
                    id="hallticket-btn-print"
                    type="button"
                    onClick={() => window.print()}
                    className="bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              )}

              {/* THE HALL TICKET DOCUMENT PREVIEW */}
              {!isShortageOfAttendance ? (
                <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-md max-w-3xl mx-auto space-y-6 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full print:text-black">
                  
                  {/* Subtle Background Watermark Shield Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                    <Building className="w-96 h-96 text-indigo-900" />
                  </div>

                  {/* Header / Crest and Title */}
                  <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800 relative">
                    <div className="absolute top-0 left-0 hidden sm:block print:hidden">
                      <School className="w-12 h-12 text-indigo-950 opacity-80" />
                    </div>
                    <div className="absolute top-0 right-0 hidden sm:block print:hidden">
                      <Award className="w-12 h-12 text-amber-600 opacity-80" />
                    </div>
                    
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-wide">CMS COLLEGE OF SCIENCE AND COMMERCE</h2>
                    <p className="text-[10px] md:text-xs font-bold text-indigo-900 tracking-widest uppercase">CHINNAVEDAMPATTY, COIMBATORE</p>
                    <p className="text-[9px] md:text-[10.5px] text-slate-500">
                      Affiliated to Bharathiar University, Coimbatore | Re-accredited by NAAC with 'A' Grade
                    </p>
                    <p className="text-[12px] font-extrabold text-indigo-950 border border-indigo-950 inline-block px-3 py-0.5 rounded-md mt-2">
                      OFFICIAL ADMIT CARD / HALL TICKET
                    </p>
                  </div>

                  <h3 className="text-center text-xs md:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    End-Semester Theory Examinations, July 2026
                  </h3>

                  {/* Student Details and Photo Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                    
                    {/* Passport Photo */}
                    <div className="md:col-span-3 flex justify-center md:justify-start">
                      <div className="w-32 h-36 border-2 border-slate-300 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-center p-2 relative shrink-0">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mb-2"
                          style={{ backgroundColor: currentStudent.avatarColor }}
                        >
                          {currentStudent.name.charAt(0)}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CANDIDATE</span>
                        <span className="text-[8px] font-mono text-slate-500 truncate max-w-full">{currentStudent.registerNumber}</span>
                      </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Candidate Name</span>
                        <span className="font-extrabold text-slate-900 text-sm">{currentStudent.name}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Register Number</span>
                        <span className="font-mono font-extrabold text-indigo-900 text-sm">{currentStudent.registerNumber}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Roll Number / Dept</span>
                        <span className="font-bold text-slate-800">{currentStudent.rollNumber} / {currentStudent.department}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Program / Course</span>
                        <span className="font-bold text-slate-800">{currentStudent.course}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Current Semester</span>
                        <span className="font-bold text-slate-800">{currentStudent.semester} (Regular Admissions)</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Examination Center</span>
                        <span className="font-bold text-slate-800">CMS College Campus, Chinnavedampatty, Coimbatore</span>
                      </div>
                    </div>

                  </div>

                  {/* Simulated Digital Barcode */}
                  <div className="border border-slate-200 bg-slate-50/50 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
                    <div className="flex h-7 items-stretch space-x-[2.5px] max-w-xs w-full">
                      {[1,3,2,1,4,1,2,3,1,4,2,1,3,1,2,4,1,2,1,3,1,4,1,2,3,1,4,2,1,3,1,2,4,1,2,1,3,1,4,1].map((w, idx) => (
                        <div key={idx} className="bg-slate-950 flex-grow" style={{ opacity: idx % 3 === 0 ? 0.3 : 1 }}></div>
                      ))}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 tracking-widest">{currentStudent.registerNumber}SEMESTERV</span>
                  </div>

                  {/* Exam Schedule Table */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-indigo-950" />
                      <span>End Semester Theory Examination Schedule</span>
                    </h4>
                    
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-600 uppercase tracking-wider font-mono">
                            <th className="py-2.5 px-3 font-bold">Course Code</th>
                            <th className="py-2.5 px-3 font-bold">Subject / Course Title</th>
                            <th className="py-2.5 px-3 font-bold text-center">Exam Date</th>
                            <th className="py-2.5 px-3 font-bold text-center">Session & Time</th>
                            <th className="py-2.5 px-3 font-bold text-center">Invigilator Sign</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
                          {examSubjectsList.map((exam) => (
                            <tr key={exam.code} className="hover:bg-slate-50/50">
                              <td className="py-3 px-3 font-mono font-bold text-slate-700">{exam.code}</td>
                              <td className="py-3 px-3 font-extrabold text-slate-900">{exam.name}</td>
                              <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">{exam.date}</td>
                              <td className="py-3 px-3 text-center text-slate-500 font-medium">{exam.session}</td>
                              <td className="py-3 px-3 text-center">
                                <div className="w-20 border-b border-slate-300 mx-auto h-4"></div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Candidate Instructions on Hall Ticket Card */}
                  <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 text-[10px] space-y-1 text-slate-500 leading-relaxed">
                    <h5 className="font-extrabold text-slate-800 text-[10.5px] uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5 text-indigo-900" />
                      <span>Candidate Rules & Guidelines:</span>
                    </h5>
                    <p>1. Present this original Hall Ticket and valid Institutional Photo ID to gain entry to the exam hall.</p>
                    <p>2. Entering past 30 minutes of commencement is strictly barred; leaving within 45 minutes is not permitted.</p>
                    <p>3. High-precision smartwatches, programmable calculators, and communicative devices are totally prohibited.</p>
                    <p>4. Secure clearance of all department fee payments and autonomous library dues prior to seating.</p>
                  </div>

                  {/* Signatures Footer Row */}
                  <div className="grid grid-cols-2 pt-12 text-center text-xs">
                    <div className="space-y-4">
                      <div className="font-mono italic text-slate-900 font-bold text-md tracking-wider">SD/-</div>
                      <div className="h-[1px] w-28 bg-slate-400 mx-auto border-dashed"></div>
                      <div>
                        <span className="block font-bold text-slate-700">Dr. Roy Sam Mathew</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Controller of Examinations</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="font-mono italic text-slate-900 font-bold text-md tracking-wider">SD/-</div>
                      <div className="h-[1px] w-28 bg-slate-400 mx-auto border-dashed"></div>
                      <div>
                        <span className="block font-bold text-slate-700">Dr. Varghese C. Joshua</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Principal & President</span>
                      </div>
                    </div>
                  </div>

                  {/* Stamp Seal circle */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-20">
                    <div className="w-24 h-24 border-2 border-indigo-900 rounded-full flex flex-col items-center justify-center text-[6px] font-extrabold text-indigo-900 border-dashed">
                      <span>CMS COLLEGE OF</span>
                      <span>SCIENCE & COMMERCE</span>
                      <span>COIMBATORE</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-md font-extrabold text-slate-800 uppercase">Admit Card Locked</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    University regulations forbid generating the semester hall ticket for candidates with an active attendance shortage. Please satisfy the attendance requirement or apply for Principal Condonation using the override toggle above.
                  </p>
                </div>
              )}

            </div>
          )}

        </main>

      </div>

    </div>
  );
};
