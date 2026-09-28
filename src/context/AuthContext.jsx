import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [studentRecord, setStudentRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role and linked student profile from Supabase
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser || !isSupabaseConfigured) {
      setProfile(null);
      setStudentRecord(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (userError) {
        console.warn('Error fetching user profile from public.users:', userError);
      }

      if (userData) {
        setProfile(userData);

        // 2. If student role, fetch linked student row
        if (userData.role === 'STUDENT') {
          // Look up by user_id first, then fallback to email match
          let { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*, house:houses(*)')
            .eq('user_id', authUser.id)
            .maybeSingle();

          if (!studentData && authUser.email) {
            let { data: matchedByEmail } = await supabase
              .from('students')
              .select('*, house:houses(*)')
              .eq('email', authUser.email)
              .maybeSingle();

            // Also check by roll_number if email matches derived format
            if (!matchedByEmail && authUser.email.includes('@student.ecoclub.local')) {
              const roll = authUser.email.split('@')[0];
              const { data: matchedByRoll } = await supabase
                .from('students')
                .select('*, house:houses(*)')
                .ilike('roll_number', roll)
                .maybeSingle();
              matchedByEmail = matchedByRoll;
            }

            if (matchedByEmail) {
              studentData = matchedByEmail;
              // Link user_id in students table
              await supabase
                .from('students')
                .update({ user_id: authUser.id })
                .eq('id', matchedByEmail.id);
            }
          }

          if (studentError) {
            console.warn('Error fetching student record:', studentError);
          }
          setStudentRecord(studentData || null);
        } else {
          setStudentRecord(null);
        }
      } else {
        // Check if student exists in students table by email or roll
        let studentRecordFound = null;
        if (authUser.email) {
          let { data: matchedStudent } = await supabase
            .from('students')
            .select('*, house:houses(*)')
            .eq('email', authUser.email)
            .maybeSingle();

          if (!matchedStudent && authUser.email.includes('@student.ecoclub.local')) {
            const roll = authUser.email.split('@')[0];
            const { data: matchedByRoll } = await supabase
              .from('students')
              .select('*, house:houses(*)')
              .ilike('roll_number', roll)
              .maybeSingle();
            matchedStudent = matchedByRoll;
          }

          if (matchedStudent) {
            studentRecordFound = matchedStudent;
            // Auto-provision public.users record as STUDENT
            try {
              const { data: newUser } = await supabase
                .from('users')
                .insert([
                  {
                    id: authUser.id,
                    name: matchedStudent.name,
                    email: authUser.email,
                    role: 'STUDENT',
                  },
                ])
                .select()
                .single();

              if (newUser) {
                setProfile(newUser);
                // Link student record
                await supabase
                  .from('students')
                  .update({ user_id: authUser.id })
                  .eq('id', matchedStudent.id);
                setStudentRecord(matchedStudent);
                setLoading(false);
                return;
              }
            } catch (pErr) {
              console.warn('Auto-provisioning public.users entry failed:', pErr);
            }
          }
        }

        // Fallback: Check if user exists in auth metadata or needs admin provisioning
        const metaRole = authUser.user_metadata?.role || (studentRecordFound ? 'STUDENT' : null);
        setProfile({
          id: authUser.id,
          name: authUser.user_metadata?.name || studentRecordFound?.name || authUser.email.split('@')[0],
          email: authUser.email,
          role: metaRole,
        });
        setStudentRecord(studentRecordFound || null);
      }
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize session and auth state listener
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. First check if student session exists in localStorage
      const savedStudentSession = localStorage.getItem('ecoclub_student_session');
      if (savedStudentSession) {
        try {
          const parsed = JSON.parse(savedStudentSession);
          if (parsed?.studentRecord?.id) {
            // Refresh latest student record from supabase
            let refreshedStudent = parsed.studentRecord;
            if (isSupabaseConfigured) {
              const { data: st } = await supabase
                .from('students')
                .select('*, house:houses(*)')
                .eq('id', parsed.studentRecord.id)
                .maybeSingle();
              if (st) refreshedStudent = st;
            }

            try {
              const storedContacts = JSON.parse(localStorage.getItem('ecoclub_student_contacts') || '{}');
              if (storedContacts[refreshedStudent.id]) {
                refreshedStudent = {
                  ...refreshedStudent,
                  email: storedContacts[refreshedStudent.id].email ?? refreshedStudent.email,
                  phone: storedContacts[refreshedStudent.id].phone ?? refreshedStudent.phone,
                };
              }
            } catch (e) {}

            if (isMounted) {
              setUser(parsed.user);
              setProfile(parsed.profile);
              setStudentRecord(refreshedStudent);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Failed to parse saved student session:', e);
        }
      }

      if (!isSupabaseConfigured) {
        if (isMounted) setLoading(false);
        return;
      }

      // 2. Check Supabase session (e.g. for Admin)
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && isMounted) {
          setUser(session.user);
          await fetchUserProfile(session.user);
        } else if (isMounted) {
          setUser(null);
          setProfile(null);
          setStudentRecord(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error getting Supabase session:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setStudentRecord(null);
          setLoading(false);
        }
      }
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user);
        } else {
          // If no student session in localStorage, clear
          if (!localStorage.getItem('ecoclub_student_session')) {
            setUser(null);
            setProfile(null);
            setStudentRecord(null);
            setLoading(false);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }
  }, [fetchUserProfile]);

  const login = async (identifier, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }

    const cleanInput = identifier.trim();

    // ================================================================
    // CASE 1: STUDENT LOGIN BY ROLL NUMBER (No '@' in identifier)
    // ================================================================
    if (!cleanInput.includes('@')) {
      const { data: student, error: studentFindErr } = await supabase
        .from('students')
        .select('*, house:houses(*)')
        .ilike('roll_number', cleanInput)
        .maybeSingle();

      if (studentFindErr) {
        console.warn('Error querying student by roll number:', studentFindErr);
      }

      if (!student) {
        throw new Error(`Student with Roll Number "${cleanInput}" not found in Eco Club roster. Please verify your roll number with your administrator.`);
      }

      // Check password: check custom/reset password, or default 'stud@sxcce'
      let validPassword = student.password || 'stud@sxcce';
      try {
        const storedPasswords = JSON.parse(localStorage.getItem('ecoclub_student_passwords') || '{}');
        if (storedPasswords[student.id]) {
          validPassword = storedPasswords[student.id];
        }
      } catch (e) {
        // ignore
      }

      if (password !== validPassword && password !== 'stud@sxcce') {
        throw new Error(`Invalid password for Roll Number "${cleanInput}". If you forgot your password, click "Forgot Password?" below to reset it.`);
      }

      // Successful Student Login!
      const studentUser = {
        id: student.id,
        email: student.email || `${student.roll_number.toLowerCase()}@ecoclub.org`,
        role: 'STUDENT',
      };
      const studentProfile = {
        id: student.id,
        name: student.name,
        email: student.email || `${student.roll_number.toLowerCase()}@ecoclub.org`,
        role: 'STUDENT',
      };

      // Persist student session
      localStorage.setItem(
        'ecoclub_student_session',
        JSON.stringify({ user: studentUser, profile: studentProfile, studentRecord: student })
      );

      setUser(studentUser);
      setProfile(studentProfile);
      setStudentRecord(student);
      setLoading(false);

      return { user: studentUser, profile: studentProfile, studentRecord: student };
    }

    // ================================================================
    // CASE 2: EMAIL LOGIN (Admin or Student using Email)
    // ================================================================
    const cleanEmail = cleanInput.toLowerCase();

    // 1. Try Supabase Auth sign in
    let { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    // 2. If student email with default password stud@sxcce, check students table directly
    if (error && password === 'stud@sxcce') {
      const { data: student } = await supabase
        .from('students')
        .select('*, house:houses(*)')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (student) {
        const studentUser = {
          id: student.id,
          email: student.email,
          role: 'STUDENT',
        };
        const studentProfile = {
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'STUDENT',
        };

        localStorage.setItem(
          'ecoclub_student_session',
          JSON.stringify({ user: studentUser, profile: studentProfile, studentRecord: student })
        );

        setUser(studentUser);
        setProfile(studentProfile);
        setStudentRecord(student);
        setLoading(false);

        return { user: studentUser, profile: studentProfile, studentRecord: student };
      }
    }

    if (error) {
      throw error;
    }

    if (data?.user) {
      localStorage.removeItem('ecoclub_student_session');
      setUser(data.user);
      await fetchUserProfile(data.user);
    }

    return data;
  };

  const logout = async () => {
    localStorage.removeItem('ecoclub_student_session');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setProfile(null);
    setStudentRecord(null);
  };

  const refreshProfile = async () => {
    if (studentRecord?.id) {
      let { data: refreshed } = await supabase
        .from('students')
        .select('*, house:houses(*)')
        .eq('id', studentRecord.id)
        .maybeSingle();

      if (!refreshed) refreshed = { ...studentRecord };

      try {
        const storedContacts = JSON.parse(localStorage.getItem('ecoclub_student_contacts') || '{}');
        if (storedContacts[studentRecord.id]) {
          refreshed = {
            ...refreshed,
            email: storedContacts[studentRecord.id].email ?? refreshed.email,
            phone: storedContacts[studentRecord.id].phone ?? refreshed.phone,
          };
        }
      } catch (e) {}

      setStudentRecord(refreshed);
    } else if (user) {
      await fetchUserProfile(user);
    }
  };

  const role = profile?.role || null;
  const isAdmin = role === 'ADMIN';
  const isStudent = role === 'STUDENT';

  const value = {
    user,
    profile,
    studentRecord,
    role,
    isAdmin,
    isStudent,
    loading,
    login,
    logout,
    refreshProfile,
    isConfigured: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
