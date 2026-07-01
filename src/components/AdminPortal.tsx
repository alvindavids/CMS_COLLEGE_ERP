import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Ticket,
  LogOut,
  Building,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  ShieldAlert,
  Search,
  Check,
  Save,
  FileSpreadsheet,
  Award,
  Database,
  Download
} from 'lucide-react';
import { Student, Teacher, Subject, AttendanceRecord, MarkRecord, TimetableSlot, WorkingHoursEvent } from '../types';

interface AdminPortalProps {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  timetable: TimetableSlot[];
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  collegeWorkingHours: WorkingHoursEvent[];
  releasedSemesters: Record<string, boolean>;
  onLogout: () => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onToggleHallTicket: (semester: string) => void;
  onAddTimetableSlot: (slot: TimetableSlot) => void;
  onUpdateTimetableSlot: (slot: TimetableSlot) => void;
  onDeleteTimetableSlot: (id: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  students,
  teachers,
  subjects,
  timetable,
  attendance,
  marks,
  collegeWorkingHours,
  releasedSemesters,
  onLogout,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onToggleHallTicket,
  onAddTimetableSlot,
  onUpdateTimetableSlot,
  onDeleteTimetableSlot,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'teachers' | 'subjects' | 'timetable' | 'halltickets' | 'backup'>('dashboard');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modal / Add / Edit states for Student
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    registerNumber: '',
    rollNumber: '',
    department: 'Computer Science',
    course: 'B.Sc. Computer Science',
    batch: '2023 - 2026',
    email: '',
    phone: '',
    semester: 'Semester V',
    password: '',
  });

  // Modal / Add / Edit states for Teacher
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    employeeId: '',
    department: 'Computer Science',
    email: '',
    phone: '',
    password: '',
    assignedClasses: [] as string[],
    assignedSubjects: [] as { subjectId: string; subjectName: string }[],
  });

  // Modal / Add / Edit states for Subject
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    name: '',
    code: '',
    credits: 4,
  });

  // Modal / Add / Edit states for Timetable
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [editingTimetableSlot, setEditingTimetableSlot] = useState<TimetableSlot | null>(null);
  const [timetableForm, setTimetableForm] = useState({
    day: 'Monday' as TimetableSlot['day'],
    timeSlot: '09:30 AM - 10:30 AM',
    subjectId: subjects[0]?.id || '',
    className: 'B.Sc. CS - Year III',
    room: 'Room 301',
    teacherId: teachers[0]?.id || '',
  });

  // Notification Banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const triggerNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 3000);
  };

  // Helper: Calculate attendance percentage for a student
  const getStudentAttendancePercent = (studentId: string) => {
    const studentRecords = attendance.filter(r => r.studentId === studentId);
    if (studentRecords.length === 0) return 85; // default fallback
    const presentCount = studentRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    return Math.round((presentCount / studentRecords.length) * 100);
  };

  // Helper: Check if student has >= 75% attendance (eligible for hall ticket)
  const isStudentEligible = (studentId: string) => {
    return getStudentAttendancePercent(studentId) >= 75;
  };

  // Student list filtered
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = semesterFilter === 'All' || student.semester === semesterFilter;
    const matchesDept = deptFilter === 'All' || student.department === deptFilter;
    return matchesSearch && matchesSemester && matchesDept;
  });

  // Teacher list filtered
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          teacher.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || teacher.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Subject list filtered
  const filteredSubjects = subjects.filter(subject => {
    return subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           subject.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Reset student form
  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      registerNumber: '',
      rollNumber: '',
      department: 'Computer Science',
      course: 'B.Sc. Computer Science',
      batch: '2023 - 2026',
      email: '',
      phone: '',
      semester: 'Semester V',
      password: '',
    });
    setEditingStudent(null);
  };

  // Helper: Download files for Data Export & Backups
  const downloadJSON = (data: any, fileName: string) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${fileName}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerNotice('success', `Exported ${fileName}.json successfully.`);
    } catch (err) {
      triggerNotice('error', 'Failed to generate JSON export.');
    }
  };

  const downloadCSV = (headers: string[], rows: any[][], fileName: string) => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.map(val => {
            const strVal = val === null || val === undefined ? "" : String(val);
            return `"${strVal.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
          }).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerNotice('success', `Exported ${fileName}.csv successfully.`);
    } catch (err) {
      triggerNotice('error', 'Failed to generate CSV export.');
    }
  };

  const handleExportAllData = () => {
    const backupObj = {
      students,
      teachers,
      subjects,
      attendance,
      marks,
      timetable,
      collegeWorkingHours
    };
    downloadJSON(backupObj, 'CMS_ERP_Full_Backup');
  };

  const handleExportStudents = (format: 'json' | 'csv') => {
    if (format === 'json') {
      downloadJSON(students, 'CMS_Students_Registry');
    } else {
      const headers = ['ID', 'Name', 'Register Number', 'Roll Number', 'Department', 'Course', 'Batch', 'Email', 'Phone', 'Semester'];
      const rows = students.map(s => [
        s.id, s.name, s.registerNumber, s.rollNumber, s.department, s.course, s.batch, s.email, s.phone, s.semester
      ]);
      downloadCSV(headers, rows, 'CMS_Students_Registry');
    }
  };

  const handleExportTeachers = (format: 'json' | 'csv') => {
    if (format === 'json') {
      downloadJSON(teachers, 'CMS_Faculty_Directory');
    } else {
      const headers = ['ID', 'Name', 'Employee ID', 'Department', 'Email', 'Phone', 'Assigned Classes', 'Assigned Subjects'];
      const rows = teachers.map(t => [
        t.id, t.name, t.employeeId, t.department, t.email, t.phone, 
        t.assignedClasses.join(" | "), 
        t.assignedSubjects.map(sub => `${sub.subjectName} (${sub.subjectId})`).join(" | ")
      ]);
      downloadCSV(headers, rows, 'CMS_Faculty_Directory');
    }
  };

  const handleExportSubjects = (format: 'json' | 'csv') => {
    if (format === 'json') {
      downloadJSON(subjects, 'CMS_Curriculum_Subjects');
    } else {
      const headers = ['ID', 'Subject Name', 'Subject Code', 'Credits'];
      const rows = subjects.map(s => [
        s.id, s.name, s.code, s.credits
      ]);
      downloadCSV(headers, rows, 'CMS_Curriculum_Subjects');
    }
  };

  const handleExportAttendance = (format: 'json' | 'csv') => {
    if (format === 'json') {
      downloadJSON(attendance, 'CMS_Attendance_Logs');
    } else {
      const headers = ['Record ID', 'Date', 'Student Name', 'Register Number', 'Subject Code', 'Subject Name', 'Status'];
      const rows = attendance.map(a => {
        const student = students.find(s => s.id === a.studentId);
        const subject = subjects.find(sub => sub.id === a.subjectId);
        return [
          a.id,
          a.date,
          student ? student.name : 'Unknown Student',
          student ? student.registerNumber : a.studentId,
          subject ? subject.code : a.subjectId,
          subject ? subject.name : 'Unknown Subject',
          a.status
        ];
      });
      downloadCSV(headers, rows, 'CMS_Attendance_Logs');
    }
  };

  const handleExportMarks = (format: 'json' | 'csv') => {
    if (format === 'json') {
      downloadJSON(marks, 'CMS_Gradebook_Marks');
    } else {
      const headers = ['Record ID', 'Student Name', 'Register Number', 'Subject Code', 'Subject Name', 'Exam Type', 'Marks Obtained', 'Max Marks', 'Comments'];
      const rows = marks.map(m => {
        const student = students.find(s => s.id === m.studentId);
        const subject = subjects.find(sub => sub.id === m.subjectId);
        return [
          m.id,
          student ? student.name : 'Unknown Student',
          student ? student.registerNumber : m.studentId,
          subject ? subject.code : m.subjectId,
          subject ? subject.name : 'Unknown Subject',
          m.examType,
          m.marksObtained,
          m.maxMarks,
          m.comments || ''
        ];
      });
      downloadCSV(headers, rows, 'CMS_Gradebook_Marks');
    }
  };

  const handleExportTimetable = (format: 'json' | 'csv') => {
    if (format === 'json') {
      downloadJSON(timetable, 'CMS_Academic_Timetable');
    } else {
      const headers = ['Slot ID', 'Day', 'Time Slot', 'Class Name', 'Subject Name', 'Room', 'Faculty ID'];
      const rows = timetable.map(t => {
        const subject = subjects.find(sub => sub.id === t.subjectId);
        return [
          t.id, t.day, t.timeSlot, t.className, 
          subject ? `${subject.name} (${subject.code})` : t.subjectId, 
          t.room, t.teacherId
        ];
      });
      downloadCSV(headers, rows, 'CMS_Academic_Timetable');
    }
  };

  // Submit Student Form
  const handleStudentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email) {
      triggerNotice('error', 'Name and Email are required.');
      return;
    }

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        ...studentForm,
        password: studentForm.password || editingStudent.password || 'password123',
      });
      triggerNotice('success', `Student profile updated: ${studentForm.name}`);
    } else {
      const regNum = studentForm.registerNumber || 'CMS' + (23000 + Math.floor(Math.random() * 999));
      const rollNum = studentForm.rollNumber || 'CS' + (10 + students.length);
      const newStudent: Student = {
        id: 's_' + Date.now(),
        ...studentForm,
        registerNumber: regNum,
        rollNumber: rollNum,
        password: studentForm.password || 'password123',
        avatarColor: ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#d946ef'][Math.floor(Math.random() * 5)],
      };
      onAddStudent(newStudent);
      triggerNotice('success', `New student registered: ${newStudent.name}`);
    }
    setIsStudentModalOpen(false);
    resetStudentForm();
  };

  // Reset teacher form
  const resetTeacherForm = () => {
    setTeacherForm({
      name: '',
      employeeId: '',
      department: 'Computer Science',
      email: '',
      phone: '',
      password: '',
      assignedClasses: [] as string[],
      assignedSubjects: [] as { subjectId: string; subjectName: string }[],
    });
    setEditingTeacher(null);
  };

  // Submit Teacher Form
  const handleTeacherFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.email) {
      triggerNotice('error', 'Name and Email are required.');
      return;
    }

    if (editingTeacher) {
      onUpdateTeacher({
        ...editingTeacher,
        ...teacherForm,
        password: teacherForm.password || editingTeacher.password || 'password123',
      });
      triggerNotice('success', `Faculty profile updated: ${teacherForm.name}`);
    } else {
      const empId = teacherForm.employeeId || 'CMS_T' + (200 + teachers.length + 1);
      const newTeacher: Teacher = {
        id: 't_' + Date.now(),
        ...teacherForm,
        employeeId: empId,
        password: teacherForm.password || 'password123',
        assignedClasses: teacherForm.assignedClasses.length > 0 
          ? teacherForm.assignedClasses 
          : ['B.Sc. CS - Year III'],
        assignedSubjects: teacherForm.assignedSubjects.length > 0 
          ? teacherForm.assignedSubjects 
          : [{ subjectId: subjects[0]?.id || 'sub_python', subjectName: subjects[0]?.name || 'Python Programming' }],
        avatarColor: ['#0f766e', '#1e3a8a', '#4c1d95', '#030712', '#7c2d12'][Math.floor(Math.random() * 5)],
      };
      onAddTeacher(newTeacher);
      triggerNotice('success', `New faculty member registered: ${newTeacher.name}`);
    }
    setIsTeacherModalOpen(false);
    resetTeacherForm();
  };

  // Reset subject form
  const resetSubjectForm = () => {
    setSubjectForm({
      id: '',
      name: '',
      code: '',
      credits: 4,
    });
    setEditingSubject(null);
  };

  // Submit Subject Form
  const handleSubjectFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) {
      triggerNotice('error', 'Name and Code are required.');
      return;
    }

    if (editingSubject) {
      onUpdateSubject({
        ...editingSubject,
        name: subjectForm.name,
        code: subjectForm.code,
        credits: Number(subjectForm.credits),
      });
      triggerNotice('success', `Subject details updated: ${subjectForm.name}`);
    } else {
      const newSubject: Subject = {
        id: 'sub_' + subjectForm.code.toLowerCase().replace(/\s+/g, '_'),
        name: subjectForm.name,
        code: subjectForm.code,
        credits: Number(subjectForm.credits),
      };
      onAddSubject(newSubject);
      triggerNotice('success', `New subject added: ${newSubject.name}`);
    }
    setIsSubjectModalOpen(false);
    resetSubjectForm();
  };

  // Reset timetable form
  const resetTimetableForm = () => {
    setTimetableForm({
      day: 'Monday',
      timeSlot: '09:30 AM - 10:30 AM',
      subjectId: subjects[0]?.id || '',
      className: 'B.Sc. CS - Year III',
      room: 'Room 301',
      teacherId: teachers[0]?.id || '',
    });
    setEditingTimetableSlot(null);
  };

  // Submit Timetable Form
  const handleTimetableFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timetableForm.subjectId || !timetableForm.teacherId) {
      triggerNotice('error', 'Subject and Lecturer are required.');
      return;
    }

    if (editingTimetableSlot) {
      onUpdateTimetableSlot({
        ...editingTimetableSlot,
        ...timetableForm,
      });
      triggerNotice('success', `Lecture grid slot updated`);
    } else {
      const newSlot: TimetableSlot = {
        id: 'tt_' + Date.now(),
        ...timetableForm,
      };
      onAddTimetableSlot(newSlot);
      triggerNotice('success', `New lecture slot scheduled on ${timetableForm.day}`);
    }
    setIsTimetableModalOpen(false);
    resetTimetableForm();
  };

  // Calculations for Dashboard Stats
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalSubjects = subjects.length;

  const lowAttendanceStudents = students.filter(s => getStudentAttendancePercent(s.id) < 75);
  const highAttendanceStudentsCount = students.length - lowAttendanceStudents.length;
  const averageAttendance = Math.round(
    students.reduce((acc, s) => acc + getStudentAttendancePercent(s.id), 0) / (students.length || 1)
  );

  return (
    <div id="admin-portal-root" className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside id="admin-sidebar" className="w-full md:w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800 flex flex-col justify-between">
        <div className="p-5">
          {/* Header/College Logo */}
          <div className="flex items-center space-x-2.5 mb-8 border-b border-slate-800 pb-5">
            <div className="bg-amber-600 p-1.5 rounded-lg text-white">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider leading-tight uppercase text-amber-500">CMS College of Science and Commerce</h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Chinnavedampatty, Coimbatore</span>
            </div>
          </div>

          {/* Mini profile card */}
          <div className="mb-6 bg-slate-800/50 border border-slate-800 p-4 rounded-xl flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              A
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate text-white">System Admin</h4>
              <p className="text-[10px] text-slate-400 font-mono">COE Office</p>
              <span className="inline-block mt-1 bg-amber-600/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded-md font-mono border border-amber-600/30">
                Registrar Core
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              id="admin-nav-dash"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Admin Dashboard</span>
            </button>

            <button
              id="admin-nav-students"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'students'
                  ? 'bg-amber-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              onClick={() => { setActiveTab('students'); setSearchQuery(''); }}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Manage Students</span>
            </button>

            <button
              id="admin-nav-teachers"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'teachers'
                  ? 'bg-amber-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              onClick={() => { setActiveTab('teachers'); setSearchQuery(''); }}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Manage Faculty</span>
            </button>

            <button
              id="admin-nav-subjects"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'subjects'
                  ? 'bg-amber-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              onClick={() => { setActiveTab('subjects'); setSearchQuery(''); }}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Manage Subjects</span>
            </button>

            <button
              id="admin-nav-timetable"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'timetable'
                  ? 'bg-amber-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              onClick={() => { setActiveTab('timetable'); setSearchQuery(''); }}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>Academic Timetable</span>
            </button>

            <button
              id="admin-nav-halltickets"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'halltickets'
                  ? 'bg-amber-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              onClick={() => { setActiveTab('halltickets'); setSearchQuery(''); }}
            >
              <Ticket className="w-4 h-4 shrink-0" />
              <span>Release Hall Tickets</span>
            </button>

            <button
              id="admin-nav-backup"
              type="button"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'backup'
                  ? 'bg-amber-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              onClick={() => { setActiveTab('backup'); setSearchQuery(''); }}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Data Export & Backup</span>
            </button>
          </nav>
        </div>

        {/* Bottom Logout */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/40">
          <button
            id="admin-btn-logout"
            type="button"
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-white py-2 px-3 rounded-lg text-xs font-bold transition-all border border-slate-700 hover:border-red-900"
            onClick={onLogout}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Console</span>
          </button>
        </div>
      </aside>

      {/* MOBILE NAV FOR ADMIN */}
      <div id="admin-mobile-nav" className="md:hidden bg-slate-900 text-white p-4 flex flex-col space-y-3 shadow-md border-b-2 border-amber-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-600 p-1 rounded text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold leading-none text-amber-500">CMS COLLEGE OF SCIENCE AND COMMERCE</h2>
              <span className="text-[9px] font-mono text-slate-400">ADMIN PANEL • COIMBATORE</span>
            </div>
          </div>
          <button
            id="admin-mobile-btn-logout"
            type="button"
            onClick={onLogout}
            className="text-[10px] text-slate-300 flex items-center space-x-1.5 bg-slate-800 py-1 px-2.5 rounded-md border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Out</span>
          </button>
        </div>

        <div className="flex space-x-1.5 overflow-x-auto pb-1">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'students', label: 'Students' },
            { id: 'teachers', label: 'Faculty' },
            { id: 'subjects', label: 'Subjects' },
            { id: 'timetable', label: 'Timetable' },
            { id: 'halltickets', label: 'Hall Tickets' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`shrink-0 text-[10px] font-semibold py-1.5 px-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
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
        <header id="admin-main-header" className="hidden md:flex bg-white h-16 border-b border-slate-200 px-8 items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="w-6 h-6 text-slate-800" />
            <h3 className="font-bold text-slate-800 text-md">
              {activeTab === 'dashboard' && 'CMS Central Management Control'}
              {activeTab === 'students' && 'Student Profile Registry'}
              {activeTab === 'teachers' && 'Faculty Member Directory'}
              {activeTab === 'subjects' && 'Course Curriculum Setup'}
              {activeTab === 'timetable' && 'Administrative Timetable Planner'}
              {activeTab === 'halltickets' && 'Semester Examination Hall Ticket Controller'}
              {activeTab === 'backup' && 'System Data Export & Backups'}
            </h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 font-mono">ERP Admin Session</span>
              <span className="text-xs font-bold text-slate-700">Level: Super Administrator</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">DB Sync Active</span>
            </div>
          </div>
        </header>

        {/* VIEW PORT */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          
          {notice && (
            <div className={`border text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-sm ${
              notice.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {notice.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              <span>{notice.message}</span>
            </div>
          )}

          {/* ==================== DASHBOARD VIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border-l-8 border-amber-500">
                <h3 className="text-lg md:text-xl font-bold">CMS College of Science and Commerce ERP Command Center</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  As an Administrator, you can enroll/terminate student rosters, manage faculty profiles, edit subjects, update working schedules, and authorize Semester Examination Hall Tickets.
                </p>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Students</span>
                    <span className="text-xl font-extrabold text-slate-800">{totalStudents}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Faculty Staff</span>
                    <span className="text-xl font-extrabold text-slate-800">{totalTeachers}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Active Courses</span>
                    <span className="text-xl font-extrabold text-slate-800">{totalSubjects}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Avg Attendance</span>
                    <span className="text-xl font-extrabold text-slate-800">{averageAttendance}%</span>
                  </div>
                </div>
              </div>

              {/* RE-APPEAR / ELIGIBILITY AUDIT CARDS */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Low Attendance Alert Panel */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <AlertTriangle className="text-red-500 w-4 h-4" />
                      <span>Attendance Shortage Alert (&lt;75%)</span>
                    </h4>
                    <span className="bg-red-100 text-red-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      {lowAttendanceStudents.length} Students Detained
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {lowAttendanceStudents.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400">All students satisfy the 75% threshold!</p>
                    ) : (
                      lowAttendanceStudents.map(student => {
                        const percent = getStudentAttendancePercent(student.id);
                        return (
                          <div key={student.id} className="flex justify-between items-center p-2.5 rounded-lg border border-red-100 bg-red-50/20 text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{student.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{student.registerNumber} • {student.semester}</p>
                            </div>
                            <span className="font-mono font-extrabold text-red-600 bg-white border border-red-200 px-2 py-0.5 rounded">
                              {percent}%
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Course Credit and Subjects Quick Panel */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <FileSpreadsheet className="text-indigo-600 w-4 h-4" />
                      <span>Subjects Curriculum Codes</span>
                    </h4>
                    <button 
                      id="dash-btn-curric"
                      type="button"
                      onClick={() => setActiveTab('subjects')} 
                      className="text-xs text-amber-600 font-bold hover:underline"
                    >
                      Configure
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {subjects.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="bg-slate-200 text-slate-700 font-mono text-[9px] px-2 py-0.5 rounded font-extrabold">
                            {sub.code}
                          </span>
                          <span className="font-bold text-slate-800">{sub.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{sub.credits} Credits</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== STUDENTS MANAGEMENT ==================== */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              
              {/* Header and Add button */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    id="search-student"
                    type="text"
                    placeholder="Search name, roll or reg no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-xs"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    id="filter-semester"
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="All">All Semesters</option>
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V</option>
                    <option value="Semester VI">Semester VI</option>
                  </select>

                  <button
                    id="btn-export-students"
                    type="button"
                    onClick={() => handleExportStudents('csv')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center space-x-1.5 border border-slate-300 transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    id="btn-add-student"
                    type="button"
                    onClick={() => { resetStudentForm(); setIsStudentModalOpen(true); }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition-all shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Enroll Student</span>
                  </button>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-slate-50">
                        <th className="py-3 px-4 font-bold">Roster Name</th>
                        <th className="py-3 px-4 font-bold">Register No</th>
                        <th className="py-3 px-4 font-bold">Roll No</th>
                        <th className="py-3 px-4 font-bold">Semester</th>
                        <th className="py-3 px-4 font-bold">Attendance %</th>
                        <th className="py-3 px-4 font-bold">Hall Ticket</th>
                        <th className="py-3 px-4 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                            No students match current search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => {
                          const attendancePct = getStudentAttendancePercent(student.id);
                          const eligible = isStudentEligible(student.id);
                          return (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-xs"
                                    style={{ backgroundColor: student.avatarColor }}
                                  >
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800">{student.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono truncate">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{student.registerNumber}</td>
                              <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{student.rollNumber}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-700">{student.semester}</td>
                              <td className="py-3.5 px-4 font-bold">
                                <span className={`font-mono ${attendancePct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {attendancePct}%
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                  eligible 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {eligible ? 'ELIGIBLE' : 'DETAINED'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex justify-center space-x-2">
                                  <button
                                    id={`btn-edit-student-${student.id}`}
                                    type="button"
                                    onClick={() => {
                                      setEditingStudent(student);
                                      setStudentForm({
                                        name: student.name,
                                        registerNumber: student.registerNumber,
                                        rollNumber: student.rollNumber,
                                        department: student.department,
                                        course: student.course,
                                        batch: student.batch,
                                        email: student.email,
                                        phone: student.phone,
                                        semester: student.semester,
                                        password: student.password || 'password123',
                                      });
                                      setIsStudentModalOpen(true);
                                    }}
                                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-900 rounded-lg transition-all"
                                    title="Edit Student"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`btn-delete-student-${student.id}`}
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to terminate enrollment for student: ${student.name}?`)) {
                                        onDeleteStudent(student.id);
                                        triggerNotice('success', `Student removed: ${student.name}`);
                                      }
                                    }}
                                    className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-all"
                                    title="Delete Student"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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
            </div>
          )}

          {/* ==================== TEACHERS MANAGEMENT ==================== */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    id="search-teacher"
                    type="text"
                    placeholder="Search name, code or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-xs"
                  />
                </div>

                <button
                  id="btn-export-teachers"
                  type="button"
                  onClick={() => handleExportTeachers('csv')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center space-x-1.5 border border-slate-300 transition-all shrink-0 w-full sm:w-auto justify-center"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  id="btn-add-teacher"
                  type="button"
                  onClick={() => { resetTeacherForm(); setIsTeacherModalOpen(true); }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition-all shrink-0 w-full sm:w-auto justify-center"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Appoint Faculty</span>
                </button>
              </div>

              {/* Faculty Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-slate-50">
                        <th className="py-3 px-4 font-bold">Faculty Name</th>
                        <th className="py-3 px-4 font-bold">Employee ID</th>
                        <th className="py-3 px-4 font-bold">Department</th>
                        <th className="py-3 px-4 font-bold">Assigned Subject Load</th>
                        <th className="py-3 px-4 font-bold">Official Email</th>
                        <th className="py-3 px-4 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                            No faculty members match the query.
                          </td>
                        </tr>
                      ) : (
                        filteredTeachers.map(teacher => (
                          <tr key={teacher.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-xs"
                                  style={{ backgroundColor: teacher.avatarColor }}
                                >
                                  {teacher.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800">{teacher.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{teacher.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{teacher.employeeId}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-600">{teacher.department}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1">
                                {teacher.assignedSubjects.map((sub, idx) => (
                                  <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                                    {sub.subjectName}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">{teacher.email}</td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  id={`btn-edit-teacher-${teacher.id}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingTeacher(teacher);
                                    setTeacherForm({
                                      name: teacher.name,
                                      employeeId: teacher.employeeId,
                                      department: teacher.department,
                                      email: teacher.email,
                                      phone: teacher.phone,
                                      password: teacher.password || 'password123',
                                      assignedClasses: teacher.assignedClasses || [],
                                      assignedSubjects: teacher.assignedSubjects || [],
                                    });
                                    setIsTeacherModalOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-900 rounded-lg transition-all"
                                  title="Edit Faculty"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`btn-delete-teacher-${teacher.id}`}
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to terminate employment record for faculty: ${teacher.name}?`)) {
                                      onDeleteTeacher(teacher.id);
                                      triggerNotice('success', `Faculty member terminated: ${teacher.name}`);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-all"
                                  title="Delete Faculty"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUBJECTS MANAGEMENT ==================== */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    id="search-subject"
                    type="text"
                    placeholder="Search subject code or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-xs"
                  />
                </div>

                <button
                  id="btn-export-subjects"
                  type="button"
                  onClick={() => handleExportSubjects('csv')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center space-x-1.5 border border-slate-300 transition-all shrink-0 w-full sm:w-auto justify-center"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  id="btn-add-subject"
                  type="button"
                  onClick={() => { resetSubjectForm(); setIsSubjectModalOpen(true); }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition-all shrink-0 w-full sm:w-auto justify-center"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Subject Course</span>
                </button>
              </div>

              {/* Subjects Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-slate-50">
                        <th className="py-3 px-4 font-bold">Course Code</th>
                        <th className="py-3 px-4 font-bold">Subject Title</th>
                        <th className="py-3 px-4 font-bold">Credits Weight</th>
                        <th className="py-3 px-4 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredSubjects.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 font-mono">
                            No subjects registered in curriculum.
                          </td>
                        </tr>
                      ) : (
                        filteredSubjects.map(sub => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="py-3.5 px-4 font-mono font-extrabold text-slate-700">{sub.code}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">{sub.name}</td>
                            <td className="py-3.5 px-4 font-bold text-indigo-700 font-mono">{sub.credits}</td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  id={`btn-edit-subject-${sub.id}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingSubject(sub);
                                    setSubjectForm({
                                      id: sub.id,
                                      name: sub.name,
                                      code: sub.code,
                                      credits: sub.credits,
                                    });
                                    setIsSubjectModalOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-900 rounded-lg transition-all"
                                  title="Edit Subject"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`btn-delete-subject-${sub.id}`}
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete subject course: ${sub.name}?`)) {
                                      onDeleteSubject(sub.id);
                                      triggerNotice('success', `Subject course deleted: ${sub.name}`);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-all"
                                  title="Delete Subject"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TIMETABLE MANAGER ==================== */}
          {activeTab === 'timetable' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <p className="text-xs text-slate-500">Grouped by Day of Week. Schedule and modify class lecture hours.</p>
                <div className="flex items-center space-x-2">
                  <button
                    id="btn-export-timetable"
                    type="button"
                    onClick={() => handleExportTimetable('csv')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center space-x-1.5 border border-slate-300 transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    id="btn-add-timetable-slot"
                    type="button"
                    onClick={() => { resetTimetableForm(); setIsTimetableModalOpen(true); }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Assign Lecture Slot</span>
                  </button>
                </div>
              </div>

              {/* Day-wise groupings */}
              <div className="space-y-6">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map(day => {
                  const slots = timetable.filter(s => s.day === day);
                  return (
                    <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
                      <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span>{day}</span>
                      </h4>

                      {slots.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No lecture hours scheduled for {day}.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {slots.map(slot => {
                            const sub = subjects.find(s => s.id === slot.subjectId);
                            const teach = teachers.find(t => t.id === slot.teacherId);
                            return (
                              <div key={slot.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start text-xs">
                                <div className="space-y-1">
                                  <span className="font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    {slot.timeSlot}
                                  </span>
                                  <h5 className="font-bold text-slate-800">{sub?.name || 'Unknown Subject'}</h5>
                                  <p className="text-[10px] text-slate-500">Room: {slot.room} • Class: {slot.className}</p>
                                  <p className="text-[10px] text-indigo-950 font-semibold font-mono">Prof: {teach?.name || 'Faculty Member'}</p>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <button
                                    id={`btn-edit-slot-${slot.id}`}
                                    type="button"
                                    onClick={() => {
                                      setEditingTimetableSlot(slot);
                                      setTimetableForm({
                                        day: slot.day,
                                        timeSlot: slot.timeSlot,
                                        subjectId: slot.subjectId,
                                        className: slot.className,
                                        room: slot.room,
                                        teacherId: slot.teacherId,
                                      });
                                      setIsTimetableModalOpen(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-950 hover:bg-slate-200 rounded"
                                    title="Edit Slot"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`btn-delete-slot-${slot.id}`}
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to remove this lecture hour?`)) {
                                        onDeleteTimetableSlot(slot.id);
                                        triggerNotice('success', `Lecture slot deleted`);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Delete Slot"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ==================== HALL TICKETS MANAGER ==================== */}
          {activeTab === 'halltickets' && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-5 border-l-4 border-amber-500 flex items-start space-x-4">
                <Ticket className="w-10 h-10 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Controller of Examinations Authorization Board</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    By default, hall tickets require Controller release before students can view and print them. Toggle the release switch below to instantly enable or disable downloads for specific classes/semesters. 
                    Note: Detained students (&lt;75% attendance) will NOT be allowed to print hall tickets even if released!
                  </p>
                </div>
              </div>

              {/* Semesters list with toggles and stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI'] as const).map(sem => {
                  const semStudents = students.filter(s => s.semester === sem);
                  const totalSem = semStudents.length;
                  const eligibleSem = semStudents.filter(s => isStudentEligible(s.id)).length;
                  const isReleased = releasedSemesters[sem] || false;

                  return (
                    <div key={sem} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-slate-800">{sem}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                            isReleased 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {isReleased ? 'RELEASED' : 'HOLD'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">B.Sc. Computer Science Curriculum</p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                        <div className="flex justify-between">
                          <span>Enrolled Students:</span>
                          <span className="font-bold font-mono text-slate-800">{totalSem}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Exam Eligible (Attendance &gt;=75%):</span>
                          <span className="font-bold font-mono text-emerald-600">{eligibleSem}</span>
                        </div>
                        {totalSem > eligibleSem && (
                          <div className="flex justify-between text-red-500 font-semibold text-[10px] pt-1">
                            <span>Detained from Exams:</span>
                            <span className="font-mono">{totalSem - eligibleSem}</span>
                          </div>
                        )}
                      </div>

                      <button
                        id={`btn-toggle-hallticket-${sem.replace(/\s+/g, '')}`}
                        type="button"
                        onClick={() => {
                          onToggleHallTicket(sem);
                          triggerNotice('success', `Hall tickets for ${sem} ${!isReleased ? 'RELEASED' : 'REVOKED'}`);
                        }}
                        className={`w-full font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-all border text-center flex items-center justify-center space-x-2 ${
                          isReleased
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                        }`}
                      >
                        {isReleased ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        <span>{isReleased ? 'Revoke Hall Tickets' : 'Authorize & Release'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ==================== DATA EXPORT & BACKUPS ==================== */}
          {activeTab === 'backup' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Informational Header Band */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border-l-8 border-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                  <h4 className="text-lg md:text-xl font-extrabold text-white flex items-center space-x-2">
                    <Database className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>System Data Registry Export Desk</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Download and back up active registry indexes, logs, grades, and rosters from the ERP local database state. Available formats include lightweight standard JSON and Microsoft Excel-compatible CSV matrices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportAllData}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-3 px-5 rounded-xl flex items-center justify-center space-x-2 shrink-0 shadow-lg hover:shadow-amber-500/15 transition-all hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full System Backup</span>
                </button>
              </div>

              {/* Dataset Export Cards Grid */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Card 1: Students */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-indigo-50 text-indigo-900 p-2.5 rounded-xl border border-indigo-100">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {students.length} Records
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Student Profile Registry</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Active student database containing enrolment details, courses, batches, registers, semesters, and contact metrics.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportStudents('csv')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportStudents('json')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Faculty */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-100">
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {teachers.length} Records
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Faculty Member Directory</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Staff dossier file containing official employee IDs, departments, emails, phones, and class-subject link logs.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportTeachers('csv')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportTeachers('json')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Card 3: Curriculum Subjects */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-rose-50 text-rose-900 p-2.5 rounded-xl border border-rose-100">
                        <BookOpen className="w-5 h-5 text-rose-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {subjects.length} Records
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Course Curriculum Setup</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Approved syllabus load registry detailing course names, numeric codes, weightage points, and academic credits.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportSubjects('csv')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSubjects('json')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Card 4: Attendance Log */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-100">
                        <Clock className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {attendance.length} Records
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Attendance Logs Matrix</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Daily roll-call schedules. Maps student registrations against dates, subject categories, and presence flags.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportAttendance('csv')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportAttendance('json')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Card 5: Grade Book Marks */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-violet-50 text-violet-900 p-2.5 rounded-xl border border-violet-100">
                        <Award className="w-5 h-5 text-violet-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {marks.length} Records
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Grade Book Marks Registry</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Consolidated exam ledger including Internal evaluations, Semester End results, total weightages, and comments.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportMarks('csv')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportMarks('json')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Card 6: Academic Timetable */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-teal-50 text-teal-900 p-2.5 rounded-xl border border-teal-100">
                        <CalendarDays className="w-5 h-5 text-teal-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {timetable.length} Slots
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Academic Timetable Grids</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Structured week-hour layout maps for divisions, room assignments, lecturing staff, and subject slots.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportTimetable('csv')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportTimetable('json')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* ==================== MODALS ==================== */}
      
      {/* 1. Student Enrollment Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn">
            <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-amber-500" />
                <span>{editingStudent ? 'Edit Student Profile' : 'Enroll New Student'}</span>
              </h4>
              <button
                id="btn-close-student-modal"
                type="button"
                onClick={() => { setIsStudentModalOpen(false); resetStudentForm(); }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleStudentFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="form-student-name" className="block font-semibold text-slate-700">Full Name *</label>
                <input
                  id="form-student-name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="form-student-email" className="block font-semibold text-slate-700">Email Address *</label>
                  <input
                    id="form-student-email"
                    type="email"
                    required
                    placeholder="john@cmscollege.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="form-student-phone" className="block font-semibold text-slate-700">Phone Number</label>
                  <input
                    id="form-student-phone"
                    type="text"
                    placeholder="+91 94455 11223"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="form-student-semester" className="block font-semibold text-slate-700">Semester Term</label>
                  <select
                    id="form-student-semester"
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V</option>
                    <option value="Semester VI">Semester VI</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="form-student-batch" className="block font-semibold text-slate-700">Admission Batch</label>
                  <input
                    id="form-student-batch"
                    type="text"
                    value={studentForm.batch}
                    onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label htmlFor="form-student-reg" className="block font-semibold text-slate-700">Register Number (Optional)</label>
                  <input
                    id="form-student-reg"
                    type="text"
                    placeholder="e.g. CMS23CS112"
                    value={studentForm.registerNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, registerNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="form-student-roll" className="block font-semibold text-slate-700">Roll Number (Optional)</label>
                  <input
                    id="form-student-roll"
                    type="text"
                    placeholder="e.g. CS12"
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="form-student-password" className="block font-semibold text-slate-700">Portal Login Password</label>
                <input
                  id="form-student-password"
                  type="text"
                  placeholder="Default is password123"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <footer className="pt-4 flex justify-end space-x-2.5">
                <button
                  id="btn-cancel-student-form"
                  type="button"
                  onClick={() => { setIsStudentModalOpen(false); resetStudentForm(); }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-student-form"
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  {editingStudent ? 'Save Profile' : 'Complete Enrollment'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* 2. Teacher Appointing Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn">
            <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>{editingTeacher ? 'Edit Faculty Member' : 'Appoint New Faculty Member'}</span>
              </h4>
              <button
                id="btn-close-teacher-modal"
                type="button"
                onClick={() => { setIsTeacherModalOpen(false); resetTeacherForm(); }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleTeacherFormSubmit} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div className="space-y-1">
                <label htmlFor="form-teacher-name" className="block font-semibold text-slate-700">Full Name *</label>
                <input
                  id="form-teacher-name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Susan Abraham"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="form-teacher-email" className="block font-semibold text-slate-700">Official Email *</label>
                  <input
                    id="form-teacher-email"
                    type="email"
                    required
                    placeholder="susan@cmscollege.edu"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="form-teacher-phone" className="block font-semibold text-slate-700">Phone Number</label>
                  <input
                    id="form-teacher-phone"
                    type="text"
                    placeholder="+91 94460 22334"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="form-teacher-dept" className="block font-semibold text-slate-700">Faculty Department</label>
                  <input
                    id="form-teacher-dept"
                    type="text"
                    value={teacherForm.department}
                    onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="form-teacher-emp" className="block font-semibold text-slate-700">Employee ID Code</label>
                  <input
                    id="form-teacher-emp"
                    type="text"
                    placeholder="e.g. CMS_T215"
                    value={teacherForm.employeeId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, employeeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="form-teacher-password" className="block font-semibold text-slate-700">Portal Login Password</label>
                <input
                  id="form-teacher-password"
                  type="text"
                  placeholder="Default is password123"
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ASSIGNED SUBJECTS LIST WITH CHECKBOXES */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">📚 Assigned Subjects (Syllabus Course Portfolio)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto">
                  {subjects.map((sub) => {
                    const isChecked = teacherForm.assignedSubjects.some((as) => as.subjectId === sub.id);
                    return (
                      <label key={sub.id} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition-all text-slate-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            let updated = [...teacherForm.assignedSubjects];
                            if (isChecked) {
                              updated = updated.filter((as) => as.subjectId !== sub.id);
                            } else {
                              updated.push({ subjectId: sub.id, subjectName: sub.name });
                            }
                            setTeacherForm({ ...teacherForm, assignedSubjects: updated });
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                        />
                        <span className="truncate select-none text-[11px] font-medium leading-none">
                          {sub.name} <span className="text-slate-400">({sub.code})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ASSIGNED CLASSES WITH STANDARD CHECKBOXES AND CUSTOM TAG ADDING */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">🏫 Target Division / Classes Assigned</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto">
                  {['B.Sc. CS - Year I', 'B.Sc. CS - Year II', 'B.Sc. CS - Year III', 'M.Sc. CS - Year I', 'M.Sc. CS - Year II'].map((cls) => {
                    const isChecked = teacherForm.assignedClasses.includes(cls);
                    return (
                      <label key={cls} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition-all text-slate-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            let updated = [...teacherForm.assignedClasses];
                            if (isChecked) {
                              updated = updated.filter((c) => c !== cls);
                            } else {
                              updated.push(cls);
                            }
                            setTeacherForm({ ...teacherForm, assignedClasses: updated });
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                        />
                        <span className="truncate select-none text-[11px] font-medium leading-none">{cls}</span>
                      </label>
                    );
                  })}
                </div>
                
                <div className="flex space-x-2 mt-2">
                  <input
                    id="new-class-input"
                    type="text"
                    placeholder="Type custom class: e.g. B.Com - Year I"
                    className="flex-grow bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !teacherForm.assignedClasses.includes(val)) {
                          setTeacherForm({
                            ...teacherForm,
                            assignedClasses: [...teacherForm.assignedClasses, val]
                          });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('new-class-input') as HTMLInputElement;
                      if (input) {
                        const val = input.value.trim();
                        if (val && !teacherForm.assignedClasses.includes(val)) {
                          setTeacherForm({
                            ...teacherForm,
                            assignedClasses: [...teacherForm.assignedClasses, val]
                          });
                          input.value = '';
                        }
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all"
                  >
                    Add Class
                  </button>
                </div>

                {/* Show custom-added classes as tags */}
                {teacherForm.assignedClasses.filter(c => !['B.Sc. CS - Year I', 'B.Sc. CS - Year II', 'B.Sc. CS - Year III', 'M.Sc. CS - Year I', 'M.Sc. CS - Year II'].includes(c)).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {teacherForm.assignedClasses.filter(c => !['B.Sc. CS - Year I', 'B.Sc. CS - Year II', 'B.Sc. CS - Year III', 'M.Sc. CS - Year I', 'M.Sc. CS - Year II'].includes(c)).map(cls => (
                      <span key={cls} className="inline-flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        <span>{cls}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTeacherForm({
                              ...teacherForm,
                              assignedClasses: teacherForm.assignedClasses.filter(c => c !== cls)
                            });
                          }}
                          className="text-amber-600 hover:text-amber-900 font-bold ml-1 text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <footer className="pt-4 flex justify-end space-x-2.5">
                <button
                  id="btn-cancel-teacher-form"
                  type="button"
                  onClick={() => { setIsTeacherModalOpen(false); resetTeacherForm(); }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-teacher-form"
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  {editingTeacher ? 'Save Changes' : 'Confirm Appointment'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* 3. Subject Add/Edit Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-fadeIn">
            <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>{editingSubject ? 'Edit Subject Details' : 'Add Subject Course'}</span>
              </h4>
              <button
                id="btn-close-subject-modal"
                type="button"
                onClick={() => { setIsSubjectModalOpen(false); resetSubjectForm(); }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSubjectFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="form-subject-name" className="block font-semibold text-slate-700">Subject Title *</label>
                <input
                  id="form-subject-name"
                  type="text"
                  required
                  placeholder="e.g. Software Engineering"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="form-subject-code" className="block font-semibold text-slate-700">Course Code *</label>
                  <input
                    id="form-subject-code"
                    type="text"
                    required
                    placeholder="e.g. CS312"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="form-subject-credits" className="block font-semibold text-slate-700">Credits Weight</label>
                  <input
                    id="form-subject-credits"
                    type="number"
                    min="1"
                    max="6"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <footer className="pt-4 flex justify-end space-x-2.5">
                <button
                  id="btn-cancel-subject-form"
                  type="button"
                  onClick={() => { setIsSubjectModalOpen(false); resetSubjectForm(); }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-subject-form"
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  {editingSubject ? 'Save Details' : 'Add Subject'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* 4. Timetable Lecture Slot Assign Modal */}
      {isTimetableModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-fadeIn">
            <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-amber-500" />
                <span>{editingTimetableSlot ? 'Edit Scheduled Lecture' : 'Assign Scheduled Lecture'}</span>
              </h4>
              <button
                id="btn-close-timetable-modal"
                type="button"
                onClick={() => { setIsTimetableModalOpen(false); resetTimetableForm(); }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleTimetableFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="form-tt-day" className="block font-semibold text-slate-700">Day of Week</label>
                  <select
                    id="form-tt-day"
                    value={timetableForm.day}
                    onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="form-tt-slot" className="block font-semibold text-slate-700">Time Slot Grid</label>
                  <select
                    id="form-tt-slot"
                    value={timetableForm.timeSlot}
                    onChange={(e) => setTimetableForm({ ...timetableForm, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="09:30 AM - 10:30 AM">09:30 AM - 10:30 AM</option>
                    <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                    <option value="11:45 AM - 12:45 PM">11:45 AM - 12:45 PM</option>
                    <option value="01:45 PM - 02:45 PM">01:45 PM - 02:45 PM</option>
                    <option value="02:45 PM - 03:45 PM">02:45 PM - 03:45 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="form-tt-subject" className="block font-semibold text-slate-700">Subject Course *</label>
                <select
                  id="form-tt-subject"
                  value={timetableForm.subjectId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, subjectId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="form-tt-teacher" className="block font-semibold text-slate-700">Assigned Faculty Prof *</label>
                <select
                  id="form-tt-teacher"
                  value={timetableForm.teacherId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, teacherId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="form-tt-class" className="block font-semibold text-slate-700">Roster Class Section</label>
                  <input
                    id="form-tt-class"
                    type="text"
                    value={timetableForm.className}
                    onChange={(e) => setTimetableForm({ ...timetableForm, className: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="form-tt-room" className="block font-semibold text-slate-700">Classroom Location</label>
                  <input
                    id="form-tt-room"
                    type="text"
                    value={timetableForm.room}
                    onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <footer className="pt-4 flex justify-end space-x-2.5">
                <button
                  id="btn-cancel-tt-form"
                  type="button"
                  onClick={() => { setIsTimetableModalOpen(false); resetTimetableForm(); }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-tt-form"
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  {editingTimetableSlot ? 'Save Grid' : 'Schedule Lecture'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
