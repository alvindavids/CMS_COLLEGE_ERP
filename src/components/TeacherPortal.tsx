import React, { useState } from 'react';
import {
  Users,
  CheckSquare,
  ClipboardList,
  BarChart3,
  CalendarDays,
  Clock,
  User,
  LogOut,
  ChevronRight,
  UserCheck,
  Award,
  AlertTriangle,
  Save,
  CheckCircle,
  Building,
  Mail,
  Phone,
  Search,
  BookOpen,
  School,
  PlusCircle
} from 'lucide-react';
import { Student, Teacher, Subject, AttendanceRecord, MarkRecord, TimetableSlot, WorkingHoursEvent, AttendanceStatus } from '../types';

interface TeacherPortalProps {
  currentTeacher: Teacher;
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  timetable: TimetableSlot[];
  collegeWorkingHours: WorkingHoursEvent[];
  onLogout: () => void;
  onUpdateTeacher: (updatedTeacher: Teacher) => void;
  onSaveAttendance: (date: string, subjectId: string, records: { studentId: string; status: AttendanceStatus }[]) => void;
  onSaveMarks: (subjectId: string, examType: 'Internal I' | 'Internal II' | 'Semester End', records: { studentId: string; marksObtained: number; comments: string }[]) => void;
  onAddSubject?: (subject: Subject) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentTeacher,
  students,
  teachers,
  subjects,
  attendance,
  marks,
  timetable,
  collegeWorkingHours,
  onLogout,
  onUpdateTeacher,
  onSaveAttendance,
  onSaveMarks,
  onAddSubject,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'marks' | 'reports' | 'timetable' | 'college' | 'profile'>('dashboard');

  // Attendance Entry States
  const [attClass, setAttClass] = useState('B.Sc. CS - Year III');
  const [attSubject, setAttSubject] = useState(currentTeacher.assignedSubjects[0]?.subjectId || 'sub2');
  const [attDate, setAttDate] = useState('2026-06-30'); // Default to current simulated date
  const [attendanceInputs, setAttendanceInputs] = useState<Record<string, AttendanceStatus>>({});
  const [attSavedMsg, setAttSavedMsg] = useState(false);

  // Marks Entry States
  const [mksClass, setMksClass] = useState('B.Sc. CS - Year III');
  const [mksSubject, setMksSubject] = useState(currentTeacher.assignedSubjects[0]?.subjectId || 'sub1');
  const [mksExamType, setMksExamType] = useState<'Internal I' | 'Internal II' | 'Semester End'>('Internal II');
  const [marksInputs, setMarksInputs] = useState<Record<string, number>>({});
  const [commentsInputs, setCommentsInputs] = useState<Record<string, string>>({});
  const [marksValidationErrors, setMarksValidationErrors] = useState<Record<string, string>>({});
  const [marksSavedMsg, setMarksSavedMsg] = useState(false);

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(currentTeacher.phone);
  const [editEmail, setEditEmail] = useState(currentTeacher.email);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Self-Assign and Add Subject States
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubCredits, setNewSubCredits] = useState('');
  const [subjectSuccessMsg, setSubjectSuccessMsg] = useState(false);

  // Report States
  const [reportSubject, setReportSubject] = useState('sub1');

  // Trigger loads on entry selection
  React.useEffect(() => {
    // Load attendance records if they exist for this date + subject
    const existingRecords = attendance.filter(r => r.date === attDate && r.subjectId === attSubject);
    const initialInputs: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      const match = existingRecords.find(r => r.studentId === s.id);
      initialInputs[s.id] = match ? match.status : 'present'; // Default to present
    });
    setAttendanceInputs(initialInputs);
  }, [attDate, attSubject, attendance, students]);

  React.useEffect(() => {
    // Load marks if they exist for this subject + exam
    const existingMarks = marks.filter(r => r.subjectId === mksSubject && r.examType === mksExamType);
    const initialMarks: Record<string, number> = {};
    const initialComments: Record<string, string> = {};
    students.forEach(s => {
      const match = existingMarks.find(m => m.studentId === s.id);
      initialMarks[s.id] = match ? match.marksObtained : 35; // Default middle-of-the-road mark
      initialComments[s.id] = match ? match.comments || '' : '';
    });
    setMarksInputs(initialMarks);
    setCommentsInputs(initialComments);
    setMarksValidationErrors({});
  }, [mksSubject, mksExamType, marks, students]);

  // Helper getters
  const getSubject = (subId: string) => subjects.find(s => s.id === subId) || { name: 'Unknown Subject', code: 'N/A' };
  const getStudent = (stuId: string) => students.find(s => s.id === stuId) || { name: 'Unknown Student', registerNumber: 'N/A' };

  // Calculations for dashboard KPIs
  const totalMyStudentsCount = students.length;
  const myAssignedSubjectsCount = currentTeacher.assignedSubjects.length;
  
  // Calculate general avg attendance for our classes
  const mySubjectsListIds = currentTeacher.assignedSubjects.map(s => s.subjectId);
  const myClassAttendanceRecords = attendance.filter(r => mySubjectsListIds.includes(r.subjectId));
  const attendanceTotal = myClassAttendanceRecords.length;
  const attendancePresent = myClassAttendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const classAttendanceAverage = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 83;

  // Grade compilation completeness
  const totalPossibleGrades = students.length * myAssignedSubjectsCount * 2; // Internals I & II
  const totalRecordedGrades = marks.filter(m => mySubjectsListIds.includes(m.subjectId) && (m.examType === 'Internal I' || m.examType === 'Internal II')).length;
  const gradeCompletionRate = totalPossibleGrades > 0 ? Math.round((totalRecordedGrades / totalPossibleGrades) * 100) : 100;

  // Attendance save handler
  const handleAttendanceSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recordsToSave = Object.keys(attendanceInputs).map(studentId => ({
      studentId,
      status: attendanceInputs[studentId]
    }));
    onSaveAttendance(attDate, attSubject, recordsToSave);
    setAttSavedMsg(true);
    setTimeout(() => setAttSavedMsg(false), 3000);
  };

  // Marks save handler
  const handleMarksSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate marks before committing
    const maxLimit = mksExamType === 'Semester End' ? 100 : 50;
    const errors: Record<string, string> = {};
    let hasError = false;

    students.forEach(student => {
      const score = marksInputs[student.id];
      if (score === undefined || isNaN(score)) {
        errors[student.id] = 'Must be a valid number';
        hasError = true;
      } else if (score < 0 || score > maxLimit) {
        errors[student.id] = `Must be between 0 and ${maxLimit}`;
        hasError = true;
      }
    });

    if (hasError) {
      setMarksValidationErrors(errors);
      alert('There are validation errors in the score sheet. Please check the highlighted inputs.');
      return;
    }

    const recordsToSave = Object.keys(marksInputs).map(studentId => ({
      studentId,
      marksObtained: Number(marksInputs[studentId]),
      comments: commentsInputs[studentId] || ''
    }));

    onSaveMarks(mksSubject, mksExamType, recordsToSave);
    setMarksValidationErrors({});
    setMarksSavedMsg(true);
    setTimeout(() => setMarksSavedMsg(false), 3000);
  };

  // Profile save handler
  const handleProfileSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeacher({
      ...currentTeacher,
      email: editEmail,
      phone: editPhone
    });
    setProfileSuccessMsg(true);
    setIsEditingProfile(false);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  // Self-assign subject handler
  const handleSelfAssignSubject = () => {
    if (!selectedSubjectId) {
      alert('Please select an existing subject course.');
      return;
    }
    const targetSub = subjects.find(s => s.id === selectedSubjectId);
    if (!targetSub) return;

    // Check if already assigned
    if (currentTeacher.assignedSubjects.some(as => as.subjectId === selectedSubjectId)) {
      alert('Subject is already assigned to you.');
      return;
    }

    const updatedTeacher: Teacher = {
      ...currentTeacher,
      assignedSubjects: [
        ...currentTeacher.assignedSubjects,
        { subjectId: targetSub.id, subjectName: targetSub.name }
      ]
    };
    onUpdateTeacher(updatedTeacher);
    setSelectedSubjectId('');
    setSubjectSuccessMsg(true);
    setTimeout(() => setSubjectSuccessMsg(false), 3000);
  };

  // Create brand new subject and self-assign it
  const handleCreateAndAssignSubject = () => {
    if (!newSubName || !newSubCode || !newSubCredits) {
      alert('Please fill in all course creation details.');
      return;
    }

    // Check if already exists in global pool (by code or name)
    const existingGlobalSub = subjects.find(s => s.code.toLowerCase() === newSubCode.toLowerCase() || s.name.toLowerCase() === newSubName.toLowerCase());
    
    let finalSubId = '';
    let finalSubName = '';

    if (existingGlobalSub) {
      // If it exists in the global pool, we'll reuse it!
      finalSubId = existingGlobalSub.id;
      finalSubName = existingGlobalSub.name;
    } else {
      // Create new
      finalSubId = `sub_${Date.now()}`;
      finalSubName = newSubName;
      const newSub: Subject = {
        id: finalSubId,
        name: newSubName,
        code: newSubCode,
        credits: Number(newSubCredits) || 4
      };

      if (onAddSubject) {
        onAddSubject(newSub);
      }
    }

    // Check if already assigned
    if (currentTeacher.assignedSubjects.some(as => as.subjectId === finalSubId)) {
      alert('Subject is already assigned to your faculty profile.');
      return;
    }

    const updatedTeacher: Teacher = {
      ...currentTeacher,
      assignedSubjects: [
        ...currentTeacher.assignedSubjects,
        { subjectId: finalSubId, subjectName: finalSubName }
      ]
    };

    onUpdateTeacher(updatedTeacher);
    setNewSubName('');
    setNewSubCode('');
    setNewSubCredits('');
    setSubjectSuccessMsg(true);
    setTimeout(() => setSubjectSuccessMsg(false), 3000);
  };

  // Analytics logic for selected subject in Reports tab
  const getSubjectAnalytics = (subId: string) => {
    const subjectMarks = marks.filter(m => m.subjectId === subId);
    
    // Calculate Attendance Shortages specifically for this subject
    const subjectAttendance = attendance.filter(r => r.subjectId === subId);
    const studentShorthands = students.map(student => {
      const studentRecs = subjectAttendance.filter(r => r.studentId === student.id);
      const totalConducted = studentRecs.length;
      const totalAttended = studentRecs.filter(r => r.status === 'present' || r.status === 'late').length;
      const pct = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 100;
      return {
        student,
        total: totalConducted,
        attended: totalAttended,
        percent: pct
      };
    });

    const lowAttendanceList = studentShorthands.filter(item => item.percent < 75);

    // Calculate marks ranges for Internal I and Internal II
    const calculateStats = (examType: 'Internal I' | 'Internal II' | 'Semester End') => {
      const examMarks = subjectMarks.filter(m => m.examType === examType);
      if (examMarks.length === 0) return { high: 0, low: 0, avg: 0, passRate: 100 };

      const scores = examMarks.map(m => m.marksObtained);
      const maxScore = examMarks[0].maxMarks;
      const high = Math.max(...scores);
      const low = Math.min(...scores);
      const sum = scores.reduce((total, sc) => total + sc, 0);
      const avg = Math.round((sum / examMarks.length) * 10) / 10;
      
      // Pass rate: standard threshold is 50%
      const passThreshold = maxScore * 0.5;
      const passedCount = scores.filter(sc => sc >= passThreshold).length;
      const passRate = Math.round((passedCount / examMarks.length) * 100);

      return { high, low, avg, passRate, count: examMarks.length };
    };

    const internal1Stats = calculateStats('Internal I');
    const internal2Stats = calculateStats('Internal II');

    return {
      allStudentStandings: studentShorthands,
      shortages: lowAttendanceList,
      internal1Stats,
      internal2Stats
    };
  };

  const currentAnalytics = getSubjectAnalytics(reportSubject);

  return (
    <div id="teacher-portal-root" className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside id="teacher-sidebar" className="w-full md:w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800 flex flex-col justify-between">
        <div className="p-5">
          {/* Header/College Logo */}
          <div className="flex items-center space-x-2.5 mb-8 border-b border-slate-800 pb-5">
            <div className="bg-amber-500 p-1.5 rounded-lg text-slate-950">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider leading-none uppercase text-amber-400">CMS College of Science and Commerce</h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Chinnavedampatty, Coimbatore</span>
            </div>
          </div>

          {/* Teacher Info Card */}
          <div className="mb-6 bg-slate-800/40 border border-slate-800 p-4 rounded-xl flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: currentTeacher.avatarColor }}
            >
              {currentTeacher.name.split(' ')[0]}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate text-white">{currentTeacher.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono truncate">{currentTeacher.employeeId}</p>
              <span className="inline-block mt-1 bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-md font-mono border border-amber-500/30">
                {currentTeacher.department}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              id="teacher-nav-dash"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Faculty Dashboard</span>
            </button>

            <button
              id="teacher-nav-attendance"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'attendance'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('attendance')}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>Record Attendance</span>
            </button>

            <button
              id="teacher-nav-marks"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'marks'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('marks')}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Enter Exam Marks</span>
            </button>

            <button
              id="teacher-nav-reports"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Academic Reports</span>
            </button>

            <button
              id="teacher-nav-timetable"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'timetable'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('timetable')}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>My Lecture Schedule</span>
            </button>

            <button
              id="teacher-nav-college"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'college'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('college')}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>College Working Hours</span>
            </button>

            <button
              id="teacher-nav-profile"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Faculty Dossier</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40">
          <button
            id="teacher-btn-logout"
            type="button"
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-white py-2 px-3 rounded-lg text-xs font-bold transition-all border border-slate-700 hover:border-red-900"
            onClick={onLogout}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Portal</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER NAVIGATION */}
      <div id="teacher-mobile-nav" className="md:hidden bg-slate-900 text-white p-4 flex flex-col space-y-3 shadow-md border-b-2 border-amber-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500 p-1 rounded text-slate-950">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold leading-none text-amber-400">CMS COLLEGE OF SCIENCE AND COMMERCE</h2>
              <span className="text-[9px] font-mono text-slate-300">FACULTY DESK • COIMBATORE</span>
            </div>
          </div>
          <button
            id="teacher-mobile-btn-logout"
            type="button"
            onClick={onLogout}
            className="text-[10px] text-slate-300 flex items-center space-x-1.5 bg-slate-800 py-1 px-2.5 rounded-md border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Out</span>
          </button>
        </div>

        {/* Scrollable Horizontal Menu */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'marks', label: 'Marks' },
            { id: 'reports', label: 'Reports' },
            { id: 'timetable', label: 'Schedule' },
            { id: 'college', label: 'Working Hours' },
            { id: 'profile', label: 'Dossier' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`shrink-0 text-[10px] font-semibold py-1.5 px-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-850 text-slate-200 hover:bg-slate-800 border border-slate-800'
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
        <header id="teacher-main-header" className="hidden md:flex bg-white h-16 border-b border-slate-200 px-8 items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <ClipboardList className="w-6 h-6 text-indigo-950" />
            <h3 className="font-bold text-slate-800 text-md">
              {activeTab === 'dashboard' && 'Faculty Management Console'}
              {activeTab === 'attendance' && 'Student Attendance Logger'}
              {activeTab === 'marks' && 'Consolidated Grade Book Entry'}
              {activeTab === 'reports' && 'Subject Reports & Analytical Logs'}
              {activeTab === 'timetable' && 'Personal Teaching Grid'}
              {activeTab === 'college' && 'CMS College Working Timetable'}
              {activeTab === 'profile' && 'Faculty Dossier File'}
            </h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 font-mono">Operational Date</span>
              <span className="text-xs font-bold text-slate-700">2026-06-30 (Tuesday)</span>
            </div>
          </div>
        </header>

        {/* CONTAINER VIEWPORT */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">

          {profileSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-sm animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-500 animate-bounce" />
              <span>Your profile contact details have been successfully saved to the server.</span>
            </div>
          )}

          {subjectSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-sm animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-500 animate-bounce" />
              <span>Academic Portfolio Updated: Your assigned subjects have been successfully updated!</span>
            </div>
          )}

          {/* ==================== DASHBOARD VIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* CMS College Faculty Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border-l-8 border-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-extrabold text-white">Greetings, {currentTeacher.name}!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You have <strong className="text-amber-400">{myAssignedSubjectsCount} assigned subjects</strong> for B.Sc. and M.Sc. departments this semester. Ensure all daily attendance marks are committed by 04:30 PM.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    id="dash-btn-att-entry"
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] px-3.5 py-2 rounded-lg transition-all shadow"
                  >
                    Take Attendance
                  </button>
                  <button
                    id="dash-btn-grades-entry"
                    type="button"
                    onClick={() => setActiveTab('marks')}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] px-3.5 py-2 rounded-lg transition-all border border-slate-700"
                  >
                    Grade Exams
                  </button>
                </div>
              </div>

              {/* KPI CARDS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI: Assigned Classes */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Classes</span>
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-2 text-indigo-900 border border-indigo-100">
                    <Building className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-md font-extrabold text-slate-800">{currentTeacher.assignedClasses.length} Divisions</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold truncate max-w-full">
                    {currentTeacher.assignedClasses[0]} etc.
                  </span>
                </div>

                {/* KPI: Faculty Subjects */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">My Syllabus Load</span>
                  <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-2 text-amber-800 border border-amber-100">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-md font-extrabold text-slate-800">{myAssignedSubjectsCount} Subjects</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold truncate max-w-full">
                    {currentTeacher.assignedSubjects[0]?.subjectName.substring(0, 18)}...
                  </span>
                </div>

                {/* KPI: Roster Count */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Students Managed</span>
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-2 text-emerald-800 border border-emerald-100">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-md font-extrabold text-slate-800">{totalMyStudentsCount} Students</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold font-mono">
                    CMS batch 2023CS
                  </span>
                </div>

                {/* KPI: Grading Completion Rate */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Grading Completion</span>
                  <div className="relative w-14 h-14 mb-2 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="23" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                      <circle 
                        cx="28" 
                        cy="28" 
                        r="23" 
                        stroke="#0f766e" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 23}
                        strokeDashoffset={2 * Math.PI * 23 * (1 - gradeCompletionRate / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-slate-800">{gradeCompletionRate}%</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-bold uppercase">
                    Compiled
                  </span>
                </div>

              </div>

              {/* QUICK LINKS & ACTIVE SHORTAGES */}
              <div className="grid md:grid-cols-12 gap-6">
                
                {/* Active short attendance candidates summary */}
                <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Low Attendance Threshold Alerts ({"<"} 75%)</span>
                    </h4>
                    <button
                      id="dash-link-reports"
                      type="button"
                      onClick={() => {
                        setReportSubject(mySubjectsListIds[0] || 'sub2');
                        setActiveTab('reports');
                      }}
                      className="text-indigo-600 hover:underline text-[10px] font-bold"
                    >
                      Audit Reports
                    </button>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {/* Let\'s calculate shortages across Web Dev subject */}
                    {students.map(student => {
                      const subjectId = 'sub2'; // Web Dev
                      const subRecs = attendance.filter(r => r.studentId === student.id && r.subjectId === subjectId);
                      const total = subRecs.length;
                      const attended = subRecs.filter(r => r.status === 'present' || r.status === 'late').length;
                      const pct = total > 0 ? Math.round((attended / total) * 100) : 100;
                      return { student, pct, total, attended };
                    })
                    .filter(item => item.pct < 75)
                    .map(item => (
                      <div key={item.student.id} className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50">
                        <div className="min-w-0 flex-1 pr-3">
                          <h5 className="text-xs font-bold text-slate-800 truncate">{item.student.name}</h5>
                          <p className="text-[10px] text-slate-500 font-mono">Reg: {item.student.registerNumber} • Attended: {item.attended}/{item.total} classes</p>
                        </div>
                        <span className="bg-red-100 border border-red-200 text-red-800 font-mono text-[10.5px] font-extrabold px-2.5 py-1 rounded-md">
                          {item.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Syllabus Checklist / Quick Notes */}
                <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
                      Syllabus & Task Manager
                    </h4>

                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="flex items-start space-x-2.5">
                        <input type="checkbox" defaultChecked className="mt-0.5" />
                        <span>Syllabus Unit III for Web Development completed.</span>
                      </div>
                      <div className="flex items-start space-x-2.5">
                        <input type="checkbox" defaultChecked className="mt-0.5" />
                        <span>Internal Exam I papers audited and uploaded.</span>
                      </div>
                      <div className="flex items-start space-x-2.5">
                        <input type="checkbox" className="mt-0.5" />
                        <span className="font-semibold text-slate-800">Finalize Internal Exam II marks (Due July 5, 2026).</span>
                      </div>
                      <div className="flex items-start space-x-2.5">
                        <input type="checkbox" className="mt-0.5" />
                        <span>Draft autonomous question paper for semester end.</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-3.5 mt-4">
                    Teacher instance is running on safe SQL/Durable sandbox mode. Changes commit in real-time.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ==================== ENTER ATTENDANCE VIEW ==================== */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Filter / Selector controls */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleAttendanceSaveSubmit} className="space-y-6">
                  
                  {/* Selectors Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="att-class" className="block text-xs font-semibold text-slate-500 mb-1.5">Target Division Class</label>
                      <select
                        id="att-class"
                        value={attClass}
                        onChange={(e) => setAttClass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        {currentTeacher.assignedClasses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="att-subject" className="block text-xs font-semibold text-slate-500 mb-1.5">Subject Syllabus</label>
                      <select
                        id="att-subject"
                        value={attSubject}
                        onChange={(e) => setAttSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        {currentTeacher.assignedSubjects.map(sub => (
                          <option key={sub.subjectId} value={sub.subjectId}>{sub.subjectName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="att-date" className="block text-xs font-semibold text-slate-500 mb-1.5">Academic Session Date</label>
                      <input
                        id="att-date"
                        type="date"
                        required
                        value={attDate}
                        onChange={(e) => setAttDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        id="att-btn-all-present"
                        type="button"
                        onClick={() => {
                          const inputs: Record<string, AttendanceStatus> = {};
                          students.forEach(s => { inputs[s.id] = 'present'; });
                          setAttendanceInputs(inputs);
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-all text-center"
                      >
                        Bypass: All Present
                      </button>
                    </div>
                  </div>

                  {attSavedMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-lg flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Attendance logs successfully published! Students can view these in real-time.</span>
                    </div>
                  )}

                  {/* Student Roll Call Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <div className="bg-indigo-950 text-white p-3.5 px-4 flex items-center justify-between text-xs font-bold">
                      <span>Division Attendance Ledger</span>
                      <span className="text-[10px] text-amber-400 font-mono uppercase">
                        {getSubject(attSubject).code} • {attDate}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200">
                      {students.map((student) => {
                        const currentStatus = attendanceInputs[student.id] || 'present';
                        return (
                          <div key={student.id} className="p-4 px-5 bg-white hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-4 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                                {student.rollNumber}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-800 truncate">{student.name}</h5>
                                <p className="text-[10px] text-slate-400 font-mono">Reg No: {student.registerNumber}</p>
                              </div>
                            </div>

                            {/* Attendance toggles */}
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-fit shrink-0">
                              <button
                                type="button"
                                onClick={() => setAttendanceInputs(prev => ({ ...prev, [student.id]: 'present' }))}
                                className={`text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                                }`}
                              >
                                PRESENT
                              </button>
                              <button
                                type="button"
                                onClick={() => setAttendanceInputs(prev => ({ ...prev, [student.id]: 'late' }))}
                                className={`text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                                }`}
                              >
                                LATE
                              </button>
                              <button
                                type="button"
                                onClick={() => setAttendanceInputs(prev => ({ ...prev, [student.id]: 'absent' }))}
                                className={`text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all ${
                                  currentStatus === 'absent'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                                }`}
                              >
                                ABSENT
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save submit bar */}
                  <div className="flex justify-end pt-2">
                    <button
                      id="att-btn-submit"
                      type="submit"
                      className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center space-x-2 shadow-lg hover:shadow-indigo-900/10 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Commit Attendance Roster</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* ==================== ENTER EXAM MARKS VIEW ==================== */}
          {activeTab === 'marks' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleMarksSaveSubmit} className="space-y-6">
                  
                  {/* Selectors Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="mks-class" className="block text-xs font-semibold text-slate-500 mb-1.5">Select Class</label>
                      <select
                        id="mks-class"
                        value={mksClass}
                        onChange={(e) => setMksClass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        {currentTeacher.assignedClasses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="mks-subject" className="block text-xs font-semibold text-slate-500 mb-1.5">Select Subject</label>
                      <select
                        id="mks-subject"
                        value={mksSubject}
                        onChange={(e) => setMksSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        {currentTeacher.assignedSubjects.map(sub => (
                          <option key={sub.subjectId} value={sub.subjectId}>{sub.subjectName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="mks-exam-type" className="block text-xs font-semibold text-slate-500 mb-1.5">Exam Series</label>
                      <select
                        id="mks-exam-type"
                        value={mksExamType}
                        onChange={(e) => setMksExamType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        <option value="Internal I">Internal Assessment I (Max: 50)</option>
                        <option value="Internal II">Internal Assessment II (Max: 50)</option>
                        <option value="Semester End">Semester End Examination (Max: 100)</option>
                      </select>
                    </div>

                    <div className="flex items-end bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg text-xs font-semibold text-indigo-950 font-mono text-center justify-center">
                      Maximum Marks Limit: {mksExamType === 'Semester End' ? '100' : '50'}
                    </div>
                  </div>

                  {marksSavedMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-lg flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Exam grades successfully saved and published! Students can immediately inspect their marks.</span>
                    </div>
                  )}

                  {/* Marks Input Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <div className="bg-indigo-950 text-white p-3.5 px-4 flex items-center justify-between text-xs font-bold">
                      <span>Subject Grade Sheet Roster</span>
                      <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">
                        {mksExamType} • {getSubject(mksSubject).code}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200 bg-white">
                      {students.map((student) => {
                        const marksValue = marksInputs[student.id] ?? '';
                        const commentValue = commentsInputs[student.id] ?? '';
                        const err = marksValidationErrors[student.id];

                        return (
                          <div key={student.id} className="p-4 px-5 hover:bg-slate-50/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center space-x-4 min-w-0 md:w-1/3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                                {student.rollNumber}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-800 truncate">{student.name}</h5>
                                <p className="text-[10px] text-slate-400 font-mono">Reg: {student.registerNumber}</p>
                              </div>
                            </div>

                            {/* Marks Entry and Comments Input */}
                            <div className="flex-grow flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                              {/* Marks Score Input */}
                              <div className="w-full sm:w-44 shrink-0">
                                <div className="flex items-center space-x-2.5">
                                  <input
                                    id={`mks-input-${student.id}`}
                                    type="number"
                                    min="0"
                                    max={mksExamType === 'Semester End' ? '100' : '50'}
                                    value={marksValue}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                                      setMarksInputs(prev => ({ ...prev, [student.id]: val }));
                                    }}
                                    className={`w-20 bg-slate-50 border rounded-lg px-2.5 py-1.5 text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white ${
                                      err ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-slate-300'
                                    }`}
                                  />
                                  <span className="text-xs text-slate-400">/ {mksExamType === 'Semester End' ? '100' : '50'} Marks</span>
                                </div>
                                {err && <p className="text-[10px] text-red-500 font-semibold mt-1">{err}</p>}
                              </div>

                              {/* Comments Input */}
                              <div className="flex-1">
                                <input
                                  id={`comment-input-${student.id}`}
                                  type="text"
                                  placeholder="Feedback comment (e.g. Excellent)"
                                  value={commentValue}
                                  onChange={(e) => setCommentsInputs(prev => ({ ...prev, [student.id]: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save submit bar */}
                  <div className="flex justify-end pt-2">
                    <button
                      id="mks-btn-submit"
                      type="submit"
                      className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center space-x-2 shadow-lg hover:shadow-indigo-900/10 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Commit Marks Sheet</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* ==================== ACADEMIC REPORTS VIEW ==================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Report subject selector */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Academic Roster Analytical Reports</h4>
                  <p className="text-[10px] text-slate-400">Filter stats, averages, and extreme grade distributions by subject.</p>
                </div>

                <div className="flex items-center space-x-3.5">
                  <label htmlFor="report-subject-select" className="text-xs font-semibold text-slate-500">Select Subject</label>
                  <select
                    id="report-subject-select"
                    value={reportSubject}
                    onChange={(e) => setReportSubject(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STAT CARDS ON SELECTED SUBJECT */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Stats card: Internal I Avg */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal I Class Avg</span>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-xl font-extrabold text-slate-800">{currentAnalytics.internal1Stats.avg}</span>
                    <span className="text-[11px] text-slate-400">/ 50 Marks</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 mt-2 font-bold flex items-center space-x-0.5">
                    <span>Pass Rate: {currentAnalytics.internal1Stats.passRate}%</span>
                  </span>
                </div>

                {/* Stats card: Internal II Avg */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal II Class Avg</span>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-xl font-extrabold text-slate-800">{currentAnalytics.internal2Stats.avg}</span>
                    <span className="text-[11px] text-slate-400">/ 50 Marks</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 mt-2 font-bold flex items-center space-x-0.5">
                    <span>Pass Rate: {currentAnalytics.internal2Stats.passRate}%</span>
                  </span>
                </div>

                {/* Stats card: Subject High Score */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject High Score</span>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-xl font-extrabold text-indigo-700">
                      {Math.max(currentAnalytics.internal1Stats.high, currentAnalytics.internal2Stats.high)}
                    </span>
                    <span className="text-[11px] text-slate-400">/ 50 Max</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Recorded in Internals</span>
                </div>

                {/* Stats card: Total Shortages */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Shortages</span>
                  <div className="flex items-baseline mt-2">
                    <span className={`text-xl font-extrabold ${currentAnalytics.shortages.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {currentAnalytics.shortages.length}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5">Students</span>
                  </div>
                  <span className={`text-[10px] mt-2 font-bold ${currentAnalytics.shortages.length > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`}>
                    {currentAnalytics.shortages.length > 0 ? 'Urgent Action Required' : 'All Students Cleared'}
                  </span>
                </div>

              </div>

              {/* REPORT DETAILS TABS SPLIT */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Shortage Audit Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>Low Attendance Audit ({"<"} 75%)</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[9px] text-slate-400 uppercase tracking-wider font-mono">
                          <th className="py-2.5">Roll</th>
                          <th className="py-2.5">Student</th>
                          <th className="py-2.5 text-center">Classes</th>
                          <th className="py-2.5 text-right">Percent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {currentAnalytics.shortages.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-400 font-mono text-[11px]">
                              Excellent! All students satisfy the 75% attendance criteria.
                            </td>
                          </tr>
                        ) : (
                          currentAnalytics.shortages.map((item) => (
                            <tr key={item.student.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-mono font-bold text-slate-400">{item.student.rollNumber}</td>
                              <td className="py-2.5 font-bold text-slate-800">{item.student.name}</td>
                              <td className="py-2.5 text-center font-mono text-slate-500">{item.attended} / {item.total}</td>
                              <td className="py-2.5 text-right font-mono font-extrabold text-red-600">{item.percent}%</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Grade Distribution Bar Chart Simulation */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-indigo-900" />
                    <span>Class Grades Comparison Ledger</span>
                  </h4>

                  <div className="space-y-3.5 pt-2">
                    {currentAnalytics.allStudentStandings.map((item) => {
                      // Get student's compiled mark for this subject
                      const subMarksList = marks.filter(m => m.subjectId === reportSubject && m.studentId === item.student.id);
                      const m1 = subMarksList.find(m => m.examType === 'Internal I')?.marksObtained ?? 0;
                      const m2 = subMarksList.find(m => m.examType === 'Internal II')?.marksObtained ?? 0;
                      const totalScore = m1 + m2;
                      const percentage = Math.round((totalScore / 100) * 100);

                      return (
                        <div key={item.student.id} className="space-y-1 text-xs">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{item.student.name}</span>
                            <span className="font-mono text-indigo-700">{totalScore} / 100</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full ${percentage >= 85 ? 'bg-indigo-600' : percentage >= 70 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== MY SCHEDULE VIEW ==================== */}
          {activeTab === 'timetable' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Faculty Lecturing Schedule Grid
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">Weekly instruction calendar of classes assigned specifically to you.</p>
                  </div>
                  <CalendarDays className="w-5 h-5 text-indigo-950" />
                </div>

                <div className="space-y-6">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                    const mySlots = timetable.filter(t => t.day === day && t.teacherId === currentTeacher.id);
                    return (
                      <div key={day} className="space-y-2">
                        <h5 className="font-bold text-xs text-indigo-950 flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>{day}</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {mySlots.map((slot) => {
                            const sub = getSubject(slot.subjectId);
                            return (
                              <div key={slot.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                                <span className="block text-[9px] font-mono font-bold text-indigo-700 mb-2 border-b border-slate-200/60 pb-1">
                                  {slot.timeSlot}
                                </span>
                                <div>
                                  <h6 className="text-[11px] font-bold text-slate-800 leading-tight truncate-2-lines">{sub.name}</h6>
                                  <p className="text-[10px] text-slate-500 mt-1">{slot.className}</p>
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
                          {mySlots.length === 0 && (
                            <p className="text-slate-400 text-xs italic py-2">No lecture hours scheduled today.</p>
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
                      CMS College Operating Working Hours
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">General schedules for common facilities, blocks, and administration.</p>
                  </div>
                  <School className="w-5 h-5 text-indigo-950" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {collegeWorkingHours.map((event) => (
                    <div key={event.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition-all flex items-start space-x-3.5">
                      <div className="bg-slate-900 text-amber-400 p-2.5 rounded-lg shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-xs font-bold text-slate-800 truncate">{event.title}</h5>
                          <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] px-2 py-0.5 rounded font-extrabold font-mono shrink-0">
                            {event.timing}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-900 font-mono">Location: {event.facility}</p>
                        <p className="text-[10.5px] text-slate-500 leading-relaxed pt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== PROFILE VIEW ==================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Profile Header Band */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 md:p-8 text-white flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shrink-0 border-4 border-amber-500 shadow-md animate-pulse"
                    style={{ backgroundColor: currentTeacher.avatarColor }}
                  >
                    {currentTeacher.name.charAt(0)}
                  </div>
                  <div className="text-center md:text-left space-y-1 min-w-0 flex-1">
                    <h3 className="text-xl font-bold leading-tight text-white">{currentTeacher.name}</h3>
                    <p className="text-xs text-slate-300 font-mono">{currentTeacher.department} Department</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1.5">
                      <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                        Emp ID: {currentTeacher.employeeId}
                      </span>
                    </div>
                  </div>
                  
                  {!isEditingProfile && (
                    <button
                      id="profile-btn-edit-toggle"
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 shrink-0 shadow-md"
                    >
                      <UserCheck className="w-3.5 h-3.5 animate-bounce" />
                      <span>Edit Contacts</span>
                    </button>
                  )}
                </div>

                <div className="p-6 md:p-8">
                  {!isEditingProfile ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-8">
                      {/* Left Side: Department Details */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                          Academic Portfolio
                        </h4>
                        
                        <div className="space-y-3.5 text-xs">
                          <div>
                            <span className="block text-[10px] text-slate-400 font-mono uppercase">Assigned Classes</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {currentTeacher.assignedClasses.map(cls => (
                                <span key={cls} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200">
                                  {cls}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="block text-[10px] text-slate-400 font-mono uppercase">Assigned Subjects</span>
                            <div className="flex flex-col gap-1.5 mt-1.5">
                              {currentTeacher.assignedSubjects.map(sub => (
                                <span key={sub.subjectId} className="bg-indigo-50 text-indigo-950 text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg border border-indigo-100">
                                  {sub.subjectName}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Faculty Contacts */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                          Contact Portfolio
                        </h4>
                        
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center space-x-3 py-1">
                            <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-slate-400 font-mono">Institutional Email</span>
                              <span className="font-bold text-slate-700">{currentTeacher.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 py-1">
                            <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-slate-400 font-mono">Mobile Contact</span>
                              <span className="font-bold text-slate-700">{currentTeacher.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 py-1">
                            <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-slate-400 font-mono">Faculty Staff Room Location</span>
                              <span className="font-bold text-slate-700">First Floor, Margaret Harris IT Block, CMS College of Science and Commerce</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ADD SUBJECTS SECTION FOR FACULTY PAGES */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center space-x-2">
                          <PlusCircle className="w-4.5 h-4.5 text-indigo-600 animate-spin-slow" />
                          <span>📚 Self-Assign or Register Additional Subjects</span>
                        </h4>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Option A: Choose from Curriculum Registry */}
                          <div className="space-y-3">
                            <span className="block text-[10px] text-indigo-950 font-extrabold uppercase tracking-widest font-mono">
                              Option A: Choose from College Curriculum Registry
                            </span>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Add an existing subject already registered in the CMS College of Science and Commerce syllabus list.
                            </p>
                            <div className="flex space-x-2">
                              <select
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="">-- Select Existing Course --</option>
                                {subjects
                                  .filter(sub => !currentTeacher.assignedSubjects.some(as => as.subjectId === sub.id))
                                  .map(sub => (
                                    <option key={sub.id} value={sub.id}>
                                      {sub.name} ({sub.code})
                                    </option>
                                  ))
                                }
                              </select>
                              <button
                                type="button"
                                onClick={handleSelfAssignSubject}
                                className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0"
                              >
                                Assign Subject
                              </button>
                            </div>
                          </div>

                          {/* Option B: Create and Add a Brand-New Subject */}
                          <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                            <span className="block text-[10px] text-amber-800 font-extrabold uppercase tracking-widest font-mono">
                              Option B: Register & Assign a Brand-New Subject
                            </span>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              If your specialized syllabus course is missing, create it dynamically to register and auto-assign it.
                            </p>
                            
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. Python Programming"
                                  value={newSubName}
                                  onChange={(e) => setNewSubName(e.target.value)}
                                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <input
                                  type="text"
                                  placeholder="Code: e.g. PY311"
                                  value={newSubCode}
                                  onChange={(e) => setNewSubCode(e.target.value)}
                                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <input
                                  type="number"
                                  placeholder="Credits (e.g. 4)"
                                  value={newSubCredits}
                                  onChange={(e) => setNewSubCredits(e.target.value)}
                                  className="w-28 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  min="1"
                                  max="10"
                                />
                                <button
                                  type="button"
                                  onClick={handleCreateAndAssignSubject}
                                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow"
                                >
                                  Create & Assign
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </>
                ) : (
                    /* PROFILE EDIT FORM */
                    <form onSubmit={handleProfileSaveSubmit} className="max-w-xl space-y-4">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                        Update Faculty Contact Information
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

                      <div className="flex space-x-3 pt-4">
                        <button
                          id="edit-btn-save"
                          type="submit"
                          className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-md cursor-pointer"
                        >
                          Save Changes
                        </button>
                        <button
                          id="edit-btn-cancel"
                          type="button"
                          onClick={() => {
                            setEditPhone(currentTeacher.phone);
                            setEditEmail(currentTeacher.email);
                            setIsEditingProfile(false);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg border border-slate-200 cursor-pointer"
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

        </main>

      </div>

    </div>
  );
};
