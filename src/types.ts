export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Student {
  id: string;
  name: string;
  registerNumber: string;
  rollNumber: string;
  department: string;
  course: string;
  batch: string;
  email: string;
  phone: string;
  semester: string;
  avatarColor: string;
  password?: string;
}

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  email: string;
  phone: string;
  assignedClasses: string[];
  assignedSubjects: { subjectId: string; subjectName: string }[];
  avatarColor: string;
  password?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  subjectId: string;
  status: AttendanceStatus;
}

export interface MarkRecord {
  id: string;
  studentId: string;
  subjectId: string;
  examType: 'Internal I' | 'Internal II' | 'Semester End';
  marksObtained: number;
  maxMarks: number;
  comments?: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: string; // e.g. "09:30 AM - 10:30 AM"
  subjectId: string;
  className: string;
  room: string;
  teacherId: string;
}

export interface WorkingHoursEvent {
  id: string;
  title: string;
  timing: string;
  facility: string;
  description: string;
}
