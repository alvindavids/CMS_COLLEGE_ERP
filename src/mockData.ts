import { Student, Teacher, Subject, AttendanceRecord, MarkRecord, TimetableSlot, WorkingHoursEvent } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'John Doe',
    registerNumber: 'CMS23CS101',
    rollNumber: 'CS01',
    department: 'Computer Science',
    course: 'B.Sc. Computer Science',
    batch: '2023 - 2026',
    email: 'john.doe@cmscollege.edu',
    phone: '+91 98765 43210',
    semester: 'Semester V',
    avatarColor: '#4f46e5', // Indigo
  },
  {
    id: 's2',
    name: 'Emily Watson',
    registerNumber: 'CMS23CS102',
    rollNumber: 'CS02',
    department: 'Computer Science',
    course: 'B.Sc. Computer Science',
    batch: '2023 - 2026',
    email: 'emily.watson@cmscollege.edu',
    phone: '+91 98765 43211',
    semester: 'Semester V',
    avatarColor: '#ec4899', // Pink
  },
  {
    id: 's3',
    name: 'Rahul Kumar',
    registerNumber: 'CMS23CS103',
    rollNumber: 'CS03',
    department: 'Computer Science',
    course: 'B.Sc. Computer Science',
    batch: '2023 - 2026',
    email: 'rahul.kumar@cmscollege.edu',
    phone: '+91 98765 43212',
    semester: 'Semester V',
    avatarColor: '#10b981', // Emerald
  },
  {
    id: 's4',
    name: 'Priya Nair',
    registerNumber: 'CMS23CS104',
    rollNumber: 'CS04',
    department: 'Computer Science',
    course: 'B.Sc. Computer Science',
    batch: '2023 - 2026',
    email: 'priya.nair@cmscollege.edu',
    phone: '+91 98765 43213',
    semester: 'Semester V',
    avatarColor: '#f59e0b', // Amber
  },
  {
    id: 's5',
    name: 'Michael Chang',
    registerNumber: 'CMS23CS105',
    rollNumber: 'CS05',
    department: 'Computer Science',
    course: 'B.Sc. Computer Science',
    batch: '2023 - 2026',
    email: 'michael.chang@cmscollege.edu',
    phone: '+91 98765 43214',
    semester: 'Semester V',
    avatarColor: '#3b82f6', // Blue
  },
  {
    id: 's6',
    name: 'Sophia Martinez',
    registerNumber: 'CMS23CS106',
    rollNumber: 'CS06',
    department: 'Computer Science',
    course: 'B.Sc. Computer Science',
    batch: '2023 - 2026',
    email: 'sophia.m@cmscollege.edu',
    phone: '+91 98765 43215',
    semester: 'Semester V',
    avatarColor: '#8b5cf6', // Violet
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't1',
    name: 'Dr. Thomas Kurian',
    employeeId: 'CMS_T201',
    department: 'Computer Science',
    email: 'thomas.kurian@cmscollege.edu',
    phone: '+91 94471 23456',
    assignedClasses: ['B.Sc. CS - Year III', 'M.Sc. CS - Year I'],
    assignedSubjects: [
      { subjectId: 'sub_python', subjectName: 'Python Programming' },
      { subjectId: 'sub_se', subjectName: 'Software Engineering' },
      { subjectId: 'sub_dbms', subjectName: 'Database Management Systems' }
    ],
    avatarColor: '#0f766e', // Teal
  },
  {
    id: 't2',
    name: 'Prof. Susan Abraham',
    employeeId: 'CMS_T202',
    department: 'Computer Science',
    email: 'susan.abraham@cmscollege.edu',
    phone: '+91 94472 87654',
    assignedClasses: ['B.Sc. CS - Year III', 'M.Sc. CS - Year II'],
    assignedSubjects: [
      { subjectId: 'sub_tamil', subjectName: 'Tamil' },
      { subjectId: 'sub_english', subjectName: 'English' },
      { subjectId: 'sub_maths', subjectName: 'Mathematics' }
    ],
    avatarColor: '#b45309', // Amber-Dark
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub_python', name: 'Python Programming', code: 'CS311', credits: 4 },
  { id: 'sub_se', name: 'Software Engineering', code: 'CS312', credits: 4 },
  { id: 'sub_tamil', name: 'Tamil', code: 'LAN111', credits: 3 },
  { id: 'sub_english', name: 'English', code: 'LAN112', credits: 3 },
  { id: 'sub_maths', name: 'Mathematics', code: 'MAT211', credits: 4 },
  { id: 'sub_dbms', name: 'Database Management Systems', code: 'CS313', credits: 4 }
];

// Seed last 6 academic days of attendance for each student and subject
export const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const dates = ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-29'];
  let idCounter = 1;

  INITIAL_STUDENTS.forEach((student) => {
    dates.forEach((date) => {
      INITIAL_SUBJECTS.forEach((subject) => {
        // Create realistic random-ish attendance patterns
        let status: 'present' | 'absent' | 'late' = 'present';
        
        // John Doe is highly regular
        if (student.id === 's1' && Math.random() < 0.05) status = 'late';
        // Emily Watson missed 1 day
        else if (student.id === 's2' && date === '2026-06-24' && subject.id === 'sub_se') status = 'absent';
        // Rahul has medium attendance
        else if (student.id === 's3' && (date === '2026-06-23' || date === '2026-06-26') && Math.random() < 0.6) status = 'absent';
        // Priya is often late
        else if (student.id === 's4' && Math.random() < 0.2) status = 'late';
        // Michael Chang missed some sessions
        else if (student.id === 's5' && date === '2026-06-25') status = 'absent';
        // Sophia is perfectly regular but late on Monday
        else if (student.id === 's6' && date === '2026-06-22') status = 'late';

        records.push({
          id: `att_${idCounter++}`,
          date,
          studentId: student.id,
          subjectId: subject.id,
          status
        });
      });
    });
  });

  return records;
};

// Seed Marks for Internal I and Internal II for all students and subjects
export const generateInitialMarks = (): MarkRecord[] => {
  const records: MarkRecord[] = [];
  let idCounter = 1;

  const getMarksForStudent = (studentId: string, subjectId: string, exam: string) => {
    const isInternalI = exam === 'Internal I';
    switch (studentId) {
      case 's1': // John Doe (Top student)
        return isInternalI ? 47 : 48; // Out of 50
      case 's2': // Emily Watson (Excellent)
        return isInternalI ? 44 : 45;
      case 's3': // Rahul Kumar (Average/Struggling)
        return isInternalI ? 24 : 26;
      case 's4': // Priya Nair (Good)
        return isInternalI ? 38 : 41;
      case 's5': // Michael Chang (Solid)
        return isInternalI ? 35 : 37;
      case 's6': // Sophia Martinez (Excellent)
        return isInternalI ? 46 : 48;
      default:
        return 35;
    }
  };

  INITIAL_STUDENTS.forEach((student) => {
    INITIAL_SUBJECTS.forEach((subject) => {
      // Internal I
      records.push({
        id: `mk_${idCounter++}`,
        studentId: student.id,
        subjectId: subject.id,
        examType: 'Internal I',
        marksObtained: getMarksForStudent(student.id, subject.id, 'Internal I'),
        maxMarks: 50,
        comments: 'Good effort.'
      });

      // Internal II
      records.push({
        id: `mk_${idCounter++}`,
        studentId: student.id,
        subjectId: subject.id,
        examType: 'Internal II',
        marksObtained: getMarksForStudent(student.id, subject.id, 'Internal II'),
        maxMarks: 50,
        comments: 'Demonstrated progressive improvement.'
      });
    });
  });

  return records;
};

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Monday
  { id: 'tt1', day: 'Monday', timeSlot: '09:30 AM - 10:30 AM', subjectId: 'sub_python', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt2', day: 'Monday', timeSlot: '10:30 AM - 11:30 AM', subjectId: 'sub_tamil', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't2' },
  { id: 'tt3', day: 'Monday', timeSlot: '11:45 AM - 12:45 PM', subjectId: 'sub_se', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt4', day: 'Monday', timeSlot: '01:45 PM - 02:45 PM', subjectId: 'sub_english', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't2' },
  { id: 'tt5', day: 'Monday', timeSlot: '02:45 PM - 03:45 PM', subjectId: 'sub_maths', className: 'B.Sc. CS - Year III', room: 'Lab A', teacherId: 't2' },

  // Tuesday
  { id: 'tt6', day: 'Tuesday', timeSlot: '09:30 AM - 10:30 AM', subjectId: 'sub_se', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt7', day: 'Tuesday', timeSlot: '10:30 AM - 11:30 AM', subjectId: 'sub_english', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't2' },
  { id: 'tt8', day: 'Tuesday', timeSlot: '11:45 AM - 12:45 PM', subjectId: 'sub_python', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt9', day: 'Tuesday', timeSlot: '01:45 PM - 03:45 PM', subjectId: 'sub_dbms', className: 'B.Sc. CS - Year III', room: 'Lab B', teacherId: 't1' },

  // Wednesday
  { id: 'tt10', day: 'Wednesday', timeSlot: '09:30 AM - 10:30 AM', subjectId: 'sub_se', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt11', day: 'Wednesday', timeSlot: '10:30 AM - 11:30 AM', subjectId: 'sub_python', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt12', day: 'Wednesday', timeSlot: '11:45 AM - 12:45 PM', subjectId: 'sub_tamil', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't2' },
  { id: 'tt13', day: 'Wednesday', timeSlot: '01:45 PM - 02:45 PM', subjectId: 'sub_maths', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't2' },
  { id: 'tt14', day: 'Wednesday', timeSlot: '02:45 PM - 03:45 PM', subjectId: 'sub_dbms', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },

  // Thursday
  { id: 'tt15', day: 'Thursday', timeSlot: '09:30 AM - 10:30 AM', subjectId: 'sub_maths', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't2' },
  { id: 'tt16', day: 'Thursday', timeSlot: '10:30 AM - 11:30 AM', subjectId: 'sub_se', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt17', day: 'Thursday', timeSlot: '11:45 AM - 12:45 PM', subjectId: 'sub_python', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt18', day: 'Thursday', timeSlot: '01:45 PM - 03:45 PM', subjectId: 'sub_tamil', className: 'B.Sc. CS - Year III', room: 'Lab A', teacherId: 't2' },

  // Friday
  { id: 'tt19', day: 'Friday', timeSlot: '09:30 AM - 10:30 AM', subjectId: 'sub_tamil', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't2' },
  { id: 'tt20', day: 'Friday', timeSlot: '10:30 AM - 11:30 AM', subjectId: 'sub_python', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt21', day: 'Friday', timeSlot: '11:45 AM - 12:45 PM', subjectId: 'sub_maths', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't2' },
  { id: 'tt22', day: 'Friday', timeSlot: '01:45 PM - 02:45 PM', subjectId: 'sub_se', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' },
  { id: 'tt23', day: 'Friday', timeSlot: '02:45 PM - 03:45 PM', subjectId: 'sub_dbms', className: 'B.Sc. CS - Year III', room: 'Room 301', teacherId: 't1' }
];

export const COLLEGE_WORKING_HOURS: WorkingHoursEvent[] = [
  {
    id: 'wh1',
    title: 'General Instruction Hours',
    timing: '09:30 AM - 03:45 PM',
    facility: 'Main Academic Blocks',
    description: 'Core lecturing and structured classroom instructions for all departments.'
  },
  {
    id: 'wh2',
    title: 'Central Library Hours',
    timing: '08:00 AM - 06:00 PM',
    facility: 'Central Library Building',
    description: 'Access to physical journals, text references, digital book reserves, and silent study zones.'
  },
  {
    id: 'wh3',
    title: 'Computer Lab Access',
    timing: '08:30 AM - 05:00 PM',
    facility: 'Margaret Harris IT Block',
    description: 'Open access lab for software engineering practice, DBMS sandbox, and research projects.'
  },
  {
    id: 'wh4',
    title: 'Office & Administrative Hours',
    timing: '09:00 AM - 04:30 PM',
    facility: 'George Sudarshan Block (Admin)',
    description: 'Enquiries, admissions, course registrations, fee payments, and hall-ticket collections.'
  },
  {
    id: 'wh5',
    title: 'Sports & Athletics Practice',
    timing: '04:00 PM - 06:00 PM',
    facility: 'College Playground & Indoor Court',
    description: 'Track events, basketball, football coaching, and open physical fitness hours.'
  }
];
