import React, { useState } from 'react';
import { School, Users, User, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Student, Teacher } from '../types';

export const ADMIN_PROFILES = [
  { id: 'admin1', name: 'Dr. Joseph Philip', role: 'Controller of Examinations', email: 'coe@cmscollege.edu' },
  { id: 'admin2', name: 'Prof. Mary Antony', role: 'Principal Office', email: 'principal@cmscollege.edu' }
];

interface LoginScreenProps {
  students: Student[];
  teachers: Teacher[];
  onLogin: (role: 'student' | 'teacher' | 'admin', userId: string) => void;
  onRegisterStudent: (newStudent: Student) => void;
  onRegisterTeacher: (newTeacher: Teacher) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  students,
  teachers,
  onLogin,
  onRegisterStudent,
  onRegisterTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'admin'>('student');
  const [isRegistering, setIsRegistering] = useState(false);

  // Login credentials state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDetail1, setRegDetail1] = useState(''); // Reg No for Student, Emp Id for Teacher
  const [regDetail2, setRegDetail2] = useState(''); // Roll No for Student, Department for Teacher
  const [regPassword, setRegPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clear errors and fields when activeTab changes
  React.useEffect(() => {
    setErrorMsg('');
    setUsername('');
    setPassword('');
  }, [activeTab, isRegistering]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    if (activeTab === 'student') {
      // Find student by email or registerNumber
      const student = students.find(
        (s) =>
          s.email.toLowerCase() === username.trim().toLowerCase() ||
          s.registerNumber.toLowerCase() === username.trim().toLowerCase()
      );

      if (!student) {
        setErrorMsg('No student found with that email or register number.');
        return;
      }

      const expectedPassword = student.password || 'password123';
      if (password !== expectedPassword) {
        setErrorMsg('Incorrect password. (Try password123)');
        return;
      }

      onLogin('student', student.id);
    } else if (activeTab === 'teacher') {
      // Find teacher by email or employeeId
      const teacher = teachers.find(
        (t) =>
          t.email.toLowerCase() === username.trim().toLowerCase() ||
          t.employeeId.toLowerCase() === username.trim().toLowerCase()
      );

      if (!teacher) {
        setErrorMsg('No faculty member found with that email or employee ID.');
        return;
      }

      const expectedPassword = teacher.password || 'password123';
      if (password !== expectedPassword) {
        setErrorMsg('Incorrect password. (Try password123)');
        return;
      }

      onLogin('teacher', teacher.id);
    } else if (activeTab === 'admin') {
      // Find admin by email or id
      const admin = ADMIN_PROFILES.find(
        (a) =>
          a.email.toLowerCase() === username.trim().toLowerCase() ||
          a.id.toLowerCase() === username.trim().toLowerCase()
      );

      if (!admin) {
        setErrorMsg('No admin profile found with that email or ID.');
        return;
      }

      if (password !== 'password123') {
        setErrorMsg('Incorrect password. (Try password123)');
        return;
      }

      onLogin('admin', admin.id);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      alert('Please fill in all required fields (Name, Email, and Password).');
      return;
    }

    if (activeTab === 'student') {
      const newStudent: Student = {
        id: 's_' + Date.now(),
        name: regName,
        registerNumber: regDetail1 || 'CMS' + (23000 + Math.floor(Math.random() * 999)),
        rollNumber: regDetail2 || 'CS' + (10 + students.length),
        department: 'Computer Science',
        course: 'B.Sc. Computer Science',
        batch: '2023 - 2026',
        email: regEmail,
        phone: regPhone || '+91 99999 99999',
        semester: 'Semester V',
        avatarColor: ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#d946ef'][Math.floor(Math.random() * 5)],
        password: regPassword,
      };
      onRegisterStudent(newStudent);
      setSuccessMsg(`Successfully registered Student: ${newStudent.name}`);
      setTimeout(() => {
        setSuccessMsg('');
        setIsRegistering(false);
        onLogin('student', newStudent.id);
      }, 1500);
    } else {
      const newTeacher: Teacher = {
        id: 't_' + Date.now(),
        name: regName,
        employeeId: regDetail1 || 'CMS_T' + (200 + teachers.length + 1),
        department: regDetail2 || 'Computer Science',
        email: regEmail,
        phone: regPhone || '+91 99999 88888',
        assignedClasses: ['B.Sc. CS - Year III'],
        assignedSubjects: [
          { subjectId: 'sub2', subjectName: 'Web Development' }
        ],
        avatarColor: ['#0f766e', '#1e3a8a', '#4c1d95', '#030712', '#7c2d12'][Math.floor(Math.random() * 5)],
        password: regPassword,
      };
      onRegisterTeacher(newTeacher);
      setSuccessMsg(`Successfully registered Faculty: ${newTeacher.name}`);
      setTimeout(() => {
        setSuccessMsg('');
        setIsRegistering(false);
        onLogin('teacher', newTeacher.id);
      }, 1500);
    }

    // Reset registration form
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegDetail1('');
    setRegDetail2('');
    setRegPassword('');
  };

  return (
    <div id="login-screen-root" className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Upper Brand bar */}
      <header id="login-header" className="bg-indigo-950 text-white py-4 px-6 shadow-md border-b-4 border-amber-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2 rounded-lg text-indigo-950">
              <School className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CMS COLLEGE OF SCIENCE AND COMMERCE</h1>
              <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">Chinnavedampatty, Coimbatore</p>
            </div>
          </div>
          <span className="hidden sm:inline-block bg-indigo-900 border border-indigo-800 text-xs px-3 py-1.5 rounded-full text-indigo-200 font-mono">
            ERP Portal v2.4.0
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-4 py-12 md:p-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 grid md:grid-cols-12">
          
          {/* Left Hero Panel */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 opacity-5 blur-2xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500 opacity-5 blur-3xl rounded-full"></div>
            
            <div className="space-y-6 relative z-10">
              <div className="inline-block bg-indigo-800/60 border border-indigo-700 text-xs text-amber-300 font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                Academic Management
              </div>
              <h2 className="text-3xl font-bold tracking-tight leading-tight">
                CMS College of <br />
                <span className="text-amber-400">Science & Commerce</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Welcome to the unified portal for students, faculty, and admins of CMS College of Science and Commerce, Chinnavedampatty, Coimbatore. Log in to enter and view daily attendance, marks, timetables, and academic reports.
              </p>
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t border-indigo-800/60 relative z-10">
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></div>
                <span><strong>Faculty Role:</strong> Take attendance, upload exam marks, view academic performance charts.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></div>
                <span><strong>Student Role:</strong> Track your attendance percentages, view report cards, and inspect schedules.</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono mt-8">
              System is powered by client-side persistence (Local Storage). All edits will be preserved locally in your browser.
            </p>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center bg-white">
            
            {/* Tabs for Student / Teacher / Admin */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
              <button
                id="tab-select-student"
                type="button"
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'student' && !isRegistering
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => {
                  setActiveTab('student');
                  setIsRegistering(false);
                }}
              >
                <User className="w-4 h-4" />
                <span>Student Portal</span>
              </button>
              <button
                id="tab-select-teacher"
                type="button"
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'teacher' && !isRegistering
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => {
                  setActiveTab('teacher');
                  setIsRegistering(false);
                }}
              >
                <Users className="w-4 h-4" />
                <span>Faculty Portal</span>
              </button>
              <button
                id="tab-select-admin"
                type="button"
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'admin' && !isRegistering
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => {
                  setActiveTab('admin');
                  setIsRegistering(false);
                }}
              >
                <School className="w-4 h-4" />
                <span>Admin Portal</span>
              </button>
            </div>

            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {!isRegistering ? (
              /* LOGIN FLOW */
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label htmlFor="login-username" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    {activeTab === 'student' ? 'Email or Register Number' : activeTab === 'teacher' ? 'Email or Employee ID' : 'Email Address / ID'}
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    required
                    placeholder={
                      activeTab === 'student'
                        ? 'e.g. john.doe@cmscollege.edu'
                        : activeTab === 'teacher'
                        ? 'e.g. thomas.kurian@cmscollege.edu'
                        : 'e.g. coe@cmscollege.edu'
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
                    >
                      {showPassword ? 'Hide Password' : 'Show Password'}
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm animate-fadeIn">
                    <span className="font-semibold">Error:</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <button
                    id="btn-login-submit"
                    type="submit"
                    className="w-full bg-indigo-950 hover:bg-indigo-900 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-indigo-950/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Enter {activeTab === 'student' ? 'Student Dashboard' : activeTab === 'teacher' ? 'Faculty Panel' : 'Admin Console'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {activeTab !== 'admin' && (
                    <button
                      id="btn-toggle-register"
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs border border-slate-200 transition-all text-center"
                    >
                      Register New {activeTab === 'student' ? 'Student' : 'Faculty Member'}
                    </button>
                  )}
                </div>

                {/* Demo accounts credentials helper */}
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">💡 Demo Accounts Quick-Fill</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTab === 'student' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername('john.doe@cmscollege.edu');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] px-2 py-1 rounded-lg text-slate-600 transition-all"
                        >
                          John Doe (john.doe@cmscollege.edu)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername('emily.watson@cmscollege.edu');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] px-2 py-1 rounded-lg text-slate-600 transition-all"
                        >
                          Emily Watson (emily.watson@cmscollege.edu)
                        </button>
                      </>
                    )}
                    {activeTab === 'teacher' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername('thomas.kurian@cmscollege.edu');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] px-2 py-1 rounded-lg text-slate-600 transition-all"
                        >
                          Dr. Thomas Kurian (thomas.kurian@cmscollege.edu)
                        </button>
                      </>
                    )}
                    {activeTab === 'admin' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername('coe@cmscollege.edu');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] px-2 py-1 rounded-lg text-slate-600 transition-all"
                        >
                          Dr. Joseph Philip (coe@cmscollege.edu)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername('principal@cmscollege.edu');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] px-2 py-1 rounded-lg text-slate-600 transition-all"
                        >
                          Prof. Mary Antony (principal@cmscollege.edu)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              /* REGISTRATION FLOW */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-md">
                    Register New {activeTab === 'student' ? 'Student Profile' : 'Faculty Profile'}
                  </h3>
                  <button
                    id="btn-cancel-register"
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    Back to Selection
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="e.g. Sandra Bullock"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="sandra@cmscollege.edu"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                      <input
                        id="reg-phone"
                        type="text"
                        placeholder="+91 94455 11223"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-detail-1" className="block text-xs font-semibold text-slate-600 mb-1">
                        {activeTab === 'student' ? 'Register Number (leave empty for auto)' : 'Employee ID (leave empty for auto)'}
                      </label>
                      <input
                        id="reg-detail-1"
                        type="text"
                        placeholder={activeTab === 'student' ? 'e.g. CMS23CS110' : 'e.g. CMS_T215'}
                        value={regDetail1}
                        onChange={(e) => setRegDetail1(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-detail-2" className="block text-xs font-semibold text-slate-600 mb-1">
                        {activeTab === 'student' ? 'Roll Number (optional)' : 'Department'}
                      </label>
                      <input
                        id="reg-detail-2"
                        type="text"
                        placeholder={activeTab === 'student' ? 'e.g. CS10' : 'e.g. Computer Science'}
                        value={regDetail2}
                        onChange={(e) => setRegDetail2(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-600 mb-1">Create Password *</label>
                    <input
                      id="reg-password"
                      type="password"
                      required
                      placeholder="Choose a password for login"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  id="btn-register-submit"
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Complete Registration & Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Shield warning about simulated context */}
            <div className="mt-8 flex items-start space-x-2 text-slate-400 text-[11px] leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
              <span>
                Demonstration Instance: CMS College of Science and Commerce ERP connects to custom local database representations. In a production deployment, this ties directly to academic backends and authentication servers.
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer bar */}
      <footer id="login-footer" className="bg-slate-100 py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200 font-mono">
        © 2026 CMS College of Science and Commerce, Chinnavedampatty, Coimbatore. All Rights Reserved. Powered by AI Studio.
      </footer>
    </div>
  );
};
