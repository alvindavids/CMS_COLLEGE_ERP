declare module 'react' {
  function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
  function useEffect(effect: () => void | (() => void | undefined), deps?: any[]): void;
  export { useState, useEffect };
}
import { useState, useEffect } from 'react';
import { Student, Teacher, Subject, AttendanceRecord, MarkRecord, TimetableSlot, WorkingHoursEvent, AttendanceStatus } from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  COLLEGE_WORKING_HOURS,
  generateInitialAttendance,
  generateInitialMarks
} from './mockData';
import { LoginScreen } from './components/LoginScreen';
import { StudentPortal } from './components/StudentPortal';
import { TeacherPortal } from './components/TeacherPortal';
import { AdminPortal } from './components/AdminPortal';

export default function App() {
  // Global Academic States
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [collegeWorkingHours, setCollegeWorkingHours] = useState<WorkingHoursEvent[]>([]);
  const [releasedSemesters, setReleasedSemesters] = useState<Record<string, boolean>>({
    'Semester I': false,
    'Semester II': false,
    'Semester III': false,
    'Semester IV': false,
    'Semester V': true,
    'Semester VI': false
  });

  // User Session States
  const [userRole, setUserRole] = useState<'guest' | 'student' | 'teacher' | 'admin'>('guest');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load and Seed Database on Mount
  useEffect(() => {
    // 1. Students
    const cachedStudents = localStorage.getItem('cms_students');
    if (cachedStudents) {
      setStudents(JSON.parse(cachedStudents));
    } else {
      localStorage.setItem('cms_students', JSON.stringify(INITIAL_STUDENTS));
      setStudents(INITIAL_STUDENTS);
    }

    // 2. Teachers
    const cachedTeachers = localStorage.getItem('cms_teachers');
    if (cachedTeachers) {
      setTeachers(JSON.parse(cachedTeachers));
    } else {
      localStorage.setItem('cms_teachers', JSON.stringify(INITIAL_TEACHERS));
      setTeachers(INITIAL_TEACHERS);
    }

    // 3. Subjects
    const cachedSubjects = localStorage.getItem('cms_subjects');
    if (cachedSubjects) {
      setSubjects(JSON.parse(cachedSubjects));
    } else {
      localStorage.setItem('cms_subjects', JSON.stringify(INITIAL_SUBJECTS));
      setSubjects(INITIAL_SUBJECTS);
    }

    // 4. Timetable
    const cachedTimetable = localStorage.getItem('cms_timetable');
    if (cachedTimetable) {
      setTimetable(JSON.parse(cachedTimetable));
    } else {
      localStorage.setItem('cms_timetable', JSON.stringify(INITIAL_TIMETABLE));
      setTimetable(INITIAL_TIMETABLE);
    }

    // 5. College Working Hours
    const cachedHours = localStorage.getItem('cms_college_hours');
    if (cachedHours) {
      setCollegeWorkingHours(JSON.parse(cachedHours));
    } else {
      localStorage.setItem('cms_college_hours', JSON.stringify(COLLEGE_WORKING_HOURS));
      setCollegeWorkingHours(COLLEGE_WORKING_HOURS);
    }

    // 6. Attendance (Generated Seed)
    const cachedAttendance = localStorage.getItem('cms_attendance');
    if (cachedAttendance) {
      setAttendance(JSON.parse(cachedAttendance));
    } else {
      const freshAttendance = generateInitialAttendance();
      localStorage.setItem('cms_attendance', JSON.stringify(freshAttendance));
      setAttendance(freshAttendance);
    }

    // 7. Marks (Generated Seed)
    const cachedMarks = localStorage.getItem('cms_marks');
    if (cachedMarks) {
      setMarks(JSON.parse(cachedMarks));
    } else {
      const freshMarks = generateInitialMarks();
      localStorage.setItem('cms_marks', JSON.stringify(freshMarks));
      setMarks(freshMarks);
    }

    // 8. Hall Ticket Releases
    const cachedReleases = localStorage.getItem('cms_released_semesters');
    if (cachedReleases) {
      setReleasedSemesters(JSON.parse(cachedReleases));
    } else {
      localStorage.setItem('cms_released_semesters', JSON.stringify({
        'Semester I': false,
        'Semester II': false,
        'Semester III': false,
        'Semester IV': false,
        'Semester V': true,
        'Semester VI': false
      }));
    }

    // Restore login session if available
    const savedRole = localStorage.getItem('cms_session_role');
    const savedUserId = localStorage.getItem('cms_session_userid');
    if (savedRole && savedUserId) {
      setUserRole(savedRole as any);
      setCurrentUserId(savedUserId);
    }
  }, []);

  // Action: Handle User Login Session
  const handleLogin = (role: 'student' | 'teacher' | 'admin', userId: string) => {
    setUserRole(role);
    setCurrentUserId(userId);
    localStorage.setItem('cms_session_role', role);
    localStorage.setItem('cms_session_userid', userId);
  };

  // Action: Handle User Logout Session
  const handleLogout = () => {
    setUserRole('guest');
    setCurrentUserId(null);
    localStorage.removeItem('cms_session_role');
    localStorage.removeItem('cms_session_userid');
  };

  // Action: Add/Register Student
  const handleRegisterStudent = (newStudent: Student) => {
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('cms_students', JSON.stringify(updated));
  };

  // Action: Delete Student
  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem('cms_students', JSON.stringify(updated));
  };

  // Action: Add/Register Teacher
  const handleRegisterTeacher = (newTeacher: Teacher) => {
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem('cms_teachers', JSON.stringify(updated));
  };

  // Action: Delete Teacher
  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    localStorage.setItem('cms_teachers', JSON.stringify(updated));
  };

  // Action: Edit/Update Student Profile Details
  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updatedList);
    localStorage.setItem('cms_students', JSON.stringify(updatedList));
  };

  // Action: Edit/Update Teacher Profile Details
  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    const updatedList = teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t);
    setTeachers(updatedList);
    localStorage.setItem('cms_teachers', JSON.stringify(updatedList));
  };

  // Action: Add/Update/Delete Subjects
  const handleAddSubject = (newSubject: Subject) => {
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    localStorage.setItem('cms_subjects', JSON.stringify(updated));
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    const updatedList = subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s);
    setSubjects(updatedList);
    localStorage.setItem('cms_subjects', JSON.stringify(updatedList));
  };

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    localStorage.setItem('cms_subjects', JSON.stringify(updated));
  };

  // Action: Toggle Hall Ticket Semesters
  const handleToggleHallTicket = (semester: string) => {
    const updated = {
      ...releasedSemesters,
      [semester]: !releasedSemesters[semester]
    };
    setReleasedSemesters(updated);
    localStorage.setItem('cms_released_semesters', JSON.stringify(updated));
  };

  // Action: Add/Update/Delete Timetable Slots
  const handleAddTimetableSlot = (newSlot: TimetableSlot) => {
    const updated = [...timetable, newSlot];
    setTimetable(updated);
    localStorage.setItem('cms_timetable', JSON.stringify(updated));
  };

  const handleUpdateTimetableSlot = (updatedSlot: TimetableSlot) => {
    const updatedList = timetable.map(t => t.id === updatedSlot.id ? updatedSlot : t);
    setTimetable(updatedList);
    localStorage.setItem('cms_timetable', JSON.stringify(updatedList));
  };

  const handleDeleteTimetableSlot = (id: string) => {
    const updated = timetable.filter(t => t.id !== id);
    setTimetable(updated);
    localStorage.setItem('cms_timetable', JSON.stringify(updated));
  };

  // Action: Commit/Save Attendance Roster Day-by-Day
  const handleSaveAttendance = (
    date: string,
    subjectId: string,
    records: { studentId: string; status: AttendanceStatus }[]
  ) => {
    let updatedAttendance = [...attendance];

    records.forEach(({ studentId, status }) => {
      const index = updatedAttendance.findIndex(
        r => r.date === date && r.studentId === studentId && r.subjectId === subjectId
      );

      if (index !== -1) {
        // Record exists, update status
        updatedAttendance[index].status = status;
      } else {
        // Create brand new entry
        updatedAttendance.push({
          id: `att_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          date,
          studentId,
          subjectId,
          status
        });
      }
    });

    setAttendance(updatedAttendance);
    localStorage.setItem('cms_attendance', JSON.stringify(updatedAttendance));
  };

  // Action: Commit/Save Marks Sheet per subject & series
  const handleSaveMarks = (
    subjectId: string,
    examType: 'Internal I' | 'Internal II' | 'Semester End',
    records: { studentId: string; marksObtained: number; comments: string }[]
  ) => {
    let updatedMarks = [...marks];

    records.forEach(({ studentId, marksObtained, comments }) => {
      const index = updatedMarks.findIndex(
        m => m.studentId === studentId && m.subjectId === subjectId && m.examType === examType
      );

      if (index !== -1) {
        // Update score
        updatedMarks[index].marksObtained = marksObtained;
        updatedMarks[index].comments = comments;
      } else {
        // Insert new
        updatedMarks.push({
          id: `mk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          studentId,
          subjectId,
          examType,
          marksObtained,
          comments
        });
      }
    });

    setMarks(updatedMarks);
    localStorage.setItem('cms_marks', JSON.stringify(updatedMarks));
  };

  // --- CONTROLLER DYNAMIC RENDERING ---
  if (userRole === 'student' && currentUserId) {
    const currentStudent = students.find(s => s.id === currentUserId);
    if (currentStudent) {
      return (
        <StudentPortal
          currentStudent={currentStudent}
          students={students}
          teachers={teachers}
          subjects={subjects}
          attendance={attendance}
          marks={marks}
          timetable={timetable}
          collegeWorkingHours={collegeWorkingHours}
          releasedSemesters={releasedSemesters}
          onLogout={handleLogout}
          onUpdateStudent={handleUpdateStudent}
        />
      );
    }
  }

  if (userRole === 'teacher' && currentUserId) {
    const currentTeacher = teachers.find(t => t.id === currentUserId);
    if (currentTeacher) {
      return (
        <TeacherPortal
          currentTeacher={currentTeacher}
          students={students}
          teachers={teachers}
          subjects={subjects}
          attendance={attendance}
          marks={marks}
          timetable={timetable}
          collegeWorkingHours={collegeWorkingHours}
          onLogout={handleLogout}
          onUpdateTeacher={handleUpdateTeacher}
          onSaveAttendance={handleSaveAttendance}
          onSaveMarks={handleSaveMarks}
          onAddSubject={handleAddSubject}
        />
      );
    }
  }

  if (userRole === 'admin' && currentUserId) {
    return (
      <AdminPortal
        students={students}
        teachers={teachers}
        subjects={subjects}
        timetable={timetable}
        attendance={attendance}
        marks={marks}
        collegeWorkingHours={collegeWorkingHours}
        releasedSemesters={releasedSemesters}
        onLogout={handleLogout}
        onAddStudent={handleRegisterStudent}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
        onAddTeacher={handleRegisterTeacher}
        onUpdateTeacher={handleUpdateTeacher}
        onDeleteTeacher={handleDeleteTeacher}
        onAddSubject={handleAddSubject}
        onUpdateSubject={handleUpdateSubject}
        onDeleteSubject={handleDeleteSubject}
        onToggleHallTicket={handleToggleHallTicket}
        onAddTimetableSlot={handleAddTimetableSlot}
        onUpdateTimetableSlot={handleUpdateTimetableSlot}
        onDeleteTimetableSlot={handleDeleteTimetableSlot}
      />
    );
  }

  // Fallback default: Render the authentication launcher
  return (
    <LoginScreen
      students={students}
      teachers={teachers}
      onLogin={handleLogin}
      onRegisterStudent={handleRegisterStudent}
      onRegisterTeacher={handleRegisterTeacher}
    />
  );
}
