import { supabase } from '../lib/supabase';

// ====================================================================
// HOUSES
// ====================================================================
export async function getHouses() {
  const { data, error } = await supabase
    .from('houses')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function updateHouse(id, updates) {
  const { data, error } = await supabase
    .from('houses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ====================================================================
// DYNAMIC HOUSE RANKINGS & STATS
// ====================================================================
export async function getHouseRankings() {
  // 1. Fetch all houses
  const { data: houses, error: houseErr } = await supabase
    .from('houses')
    .select('*');
  if (houseErr) throw houseErr;

  // 2. Fetch all students with their house_id
  const { data: students, error: studentErr } = await supabase
    .from('students')
    .select('id, house_id, status');
  if (studentErr) throw studentErr;

  // 3. Fetch all weekly marks with student_id, activity_id, week_number
  const { data: marks, error: marksErr } = await supabase
    .from('weekly_marks')
    .select('id, marks, student_id, activity_id, week_number');
  if (marksErr) throw marksErr;

  // Map students to house
  const studentToHouseMap = {};
  const houseStudentCounts = {};
  const houseActiveStudentCounts = {};

  (houses || []).forEach((h) => {
    houseStudentCounts[h.id] = 0;
    houseActiveStudentCounts[h.id] = 0;
  });

  (students || []).forEach((s) => {
    if (s.house_id) {
      studentToHouseMap[s.id] = s.house_id;
      houseStudentCounts[s.house_id] = (houseStudentCounts[s.house_id] || 0) + 1;
      if (s.status === 'ACTIVE') {
        houseActiveStudentCounts[s.house_id] = (houseActiveStudentCounts[s.house_id] || 0) + 1;
      }
    }
  });

  // Aggregate marks and attendance turnout per house by activity & week
  const houseActivityMarks = {};
  const houseActivityPresentCounts = {};
  const houseStudentParticipations = {};

  (houses || []).forEach((h) => {
    houseActivityMarks[h.id] = {};
    houseActivityPresentCounts[h.id] = {};
    houseStudentParticipations[h.id] = new Set();
  });

  (marks || []).forEach((m) => {
    const houseId = studentToHouseMap[m.student_id];
    if (houseId && houseActivityMarks[houseId] !== undefined) {
      const key = `${m.activity_id}_${m.week_number}`;
      const markVal = Number(m.marks) || 0;
      if (houseActivityMarks[houseId][key] === undefined || markVal > houseActivityMarks[houseId][key]) {
        houseActivityMarks[houseId][key] = markVal;
      }
      houseActivityPresentCounts[houseId][key] = (houseActivityPresentCounts[houseId][key] || 0) + 1;
      houseStudentParticipations[houseId].add(m.student_id);
    }
  });

  // Calculate detailed house ranking list factoring in members present & turnout
  const ranked = (houses || []).map((h) => {
    const totalStudents = houseStudentCounts[h.id] || 0;
    const actMarks = Object.values(houseActivityMarks[h.id] || {});
    const totalMarks = actMarks.reduce((sum, val) => sum + val, 0);
    const avgMarks = actMarks.length > 0 ? Number((totalMarks / actMarks.length).toFixed(1)) : 0;
    const uniqueParticipants = houseStudentParticipations[h.id]?.size || 0;

    // Average attendance turnout / members present per evaluated activity
    const presentPerAct = Object.values(houseActivityPresentCounts[h.id] || {});
    const avgMembersPresent = presentPerAct.length > 0
      ? Math.round(presentPerAct.reduce((sum, val) => sum + val, 0) / presentPerAct.length)
      : uniqueParticipants;

    const participationRate = totalStudents > 0
      ? Math.min(100, Math.round(((avgMembersPresent || uniqueParticipants) / totalStudents) * 100))
      : 0;

    return {
      ...h,
      totalStudents,
      activeStudents: houseActiveStudentCounts[h.id] || 0,
      totalMarks,
      averageMarks: avgMarks,
      membersPresent: avgMembersPresent || uniqueParticipants,
      uniqueMembersPresent: uniqueParticipants,
      participationRate,
      activitiesCount: actMarks.length,
    };
  });

  // Sort descending by totalMarks, then by participationRate (attendance turnout), then by membersPresent, then by averageMarks
  ranked.sort(
    (a, b) =>
      b.totalMarks - a.totalMarks ||
      b.participationRate - a.participationRate ||
      b.membersPresent - a.membersPresent ||
      b.averageMarks - a.averageMarks
  );

  // Assign dynamic ranks (1st, 2nd, 3rd, 4th)
  return ranked.map((house, index) => ({
    ...house,
    rank: index + 1,
  }));
}

// ====================================================================
// STUDENTS
// ====================================================================
export async function getStudents({ search = '', houseId = '', department = '', year = '', status = '' } = {}) {
  let query = supabase
    .from('students')
    .select('*, house:houses(*)')
    .order('name');

  if (houseId) query = query.eq('house_id', houseId);
  if (department) query = query.eq('department', department);
  if (year) query = query.eq('year', year);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;

  let results = data || [];
  if (search.trim()) {
    const s = search.toLowerCase();
    results = results.filter(
      (st) =>
        st.name?.toLowerCase().includes(s) ||
        st.roll_number?.toLowerCase().includes(s) ||
        st.email?.toLowerCase().includes(s)
    );
  }
  return results;
}

export async function createStudent(studentData) {
  const { data, error } = await supabase
    .from('students')
    .insert([studentData])
    .select('*, house:houses(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id, updates) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select('*, house:houses(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateStudentContact(studentId, { email, phone }) {
  if (!studentId) throw new Error('Student ID is required');

  const cleanEmail = email ? email.trim() : null;
  const cleanPhone = phone ? phone.trim() : null;

  let updatedStudent = null;

  // 1. Try to update in Supabase students table
  try {
    const { data, error } = await supabase
      .from('students')
      .update({
        email: cleanEmail,
        phone: cleanPhone,
      })
      .eq('id', studentId)
      .select('*, house:houses(*)')
      .maybeSingle();

    if (!error && data) {
      updatedStudent = data;
    }
  } catch (err) {
    console.warn('Could not update contact in Supabase:', err);
  }

  // 2. Persist in local student contacts override store
  try {
    const storedContacts = JSON.parse(localStorage.getItem('ecoclub_student_contacts') || '{}');
    storedContacts[studentId] = { email: cleanEmail, phone: cleanPhone };
    localStorage.setItem('ecoclub_student_contacts', JSON.stringify(storedContacts));
  } catch (e) {
    console.warn('Failed to update local contacts store:', e);
  }

  // 3. Update active session in localStorage if active
  try {
    const sessionStr = localStorage.getItem('ecoclub_student_session');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      if (parsed?.studentRecord?.id === studentId) {
        if (cleanEmail !== undefined) parsed.studentRecord.email = cleanEmail;
        if (cleanPhone !== undefined) parsed.studentRecord.phone = cleanPhone;
        if (cleanEmail) {
          if (parsed.profile) parsed.profile.email = cleanEmail;
          if (parsed.user) parsed.user.email = cleanEmail;
        }
        localStorage.setItem('ecoclub_student_session', JSON.stringify(parsed));
      }
    }
  } catch (e) {
    console.warn('Failed to update active session:', e);
  }

  return updatedStudent || { id: studentId, email: cleanEmail, phone: cleanPhone };
}

export async function deleteStudent(id) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function bulkUpdateStudentHouse(studentIds, newHouseId) {
  if (!studentIds || studentIds.length === 0) return [];
  const { data, error } = await supabase
    .from('students')
    .update({ house_id: newHouseId || null })
    .in('id', studentIds)
    .select('*, house:houses(*)');
  if (error) throw error;
  return data;
}

export async function bulkDeleteStudents(studentIds) {
  if (!studentIds || studentIds.length === 0) return true;
  const { error } = await supabase
    .from('students')
    .delete()
    .in('id', studentIds);
  if (error) throw error;
  return true;
}

// ====================================================================
// BULK IMPORT STUDENTS
// ====================================================================
export async function bulkInsertStudents(studentsToInsert) {
  const { data, error } = await supabase
    .from('students')
    .insert(studentsToInsert)
    .select();
  if (error) throw error;
  return data;
}

// ====================================================================
// ACTIVITIES
// ====================================================================
export async function getActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('activity_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createActivity(activityData) {
  const { data, error } = await supabase
    .from('activities')
    .insert([activityData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateActivity(id, updates) {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteActivity(id) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

// ====================================================================
// WEEKLY MARKS
// ====================================================================
export async function getWeeklyMarks({ weekNumber, activityId, studentId, houseId } = {}) {
  let query = supabase
    .from('weekly_marks')
    .select('*, student:students(*, house:houses(*)), activity:activities(*)')
    .order('created_at', { ascending: false });

  if (weekNumber) query = query.eq('week_number', weekNumber);
  if (activityId) query = query.eq('activity_id', activityId);
  if (studentId) query = query.eq('student_id', studentId);

  const { data, error } = await query;
  if (error) throw error;

  let results = data || [];
  if (houseId) {
    results = results.filter((m) => m.student?.house_id === houseId);
  }
  return results;
}

export async function upsertWeeklyMark(markData) {
  const { data, error } = await supabase
    .from('weekly_marks')
    .upsert(markData, { onConflict: 'student_id, activity_id, week_number' })
    .select('*, student:students(*), activity:activities(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateWeeklyMark(id, updates) {
  const { data, error } = await supabase
    .from('weekly_marks')
    .update(updates)
    .eq('id', id)
    .select('*, student:students(*), activity:activities(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWeeklyMark(id) {
  const { error } = await supabase
    .from('weekly_marks')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

// ====================================================================
// HOUSE WEEKLY MARKS (SINGLE HOUSE LEVEL MARKS)
// ====================================================================
export async function getHouseWeeklyMarks({ weekNumber, activityId, houseId } = {}) {
  const [allMarks, studentsRes] = await Promise.all([
    getWeeklyMarks({ weekNumber, activityId, houseId }),
    supabase.from('students').select('id, house_id'),
  ]);

  const houseStudentCounts = {};
  (studentsRes.data || []).forEach((s) => {
    if (s.house_id) {
      houseStudentCounts[s.house_id] = (houseStudentCounts[s.house_id] || 0) + 1;
    }
  });

  // Group by composite key: house_id + activity_id + week_number
  const groups = new Map();

  allMarks.forEach((m) => {
    const hId = m.student?.house_id;
    if (!hId) return;
    const groupKey = `${hId}_${m.activity_id}_${m.week_number}`;

    if (!groups.has(groupKey)) {
      const totalInHouse = houseStudentCounts[hId] || 0;
      groups.set(groupKey, {
        id: groupKey,
        house_id: hId,
        house: m.student?.house,
        activity_id: m.activity_id,
        activity: m.activity,
        week_number: m.week_number,
        marks: m.marks,
        remarks: m.remarks,
        studentCount: 0,
        totalHouseStudents: totalInHouse,
        turnoutRate: 0,
        studentIds: [],
        markIds: [],
        created_at: m.created_at,
      });
    }

    const group = groups.get(groupKey);
    group.studentCount += 1;
    group.studentIds.push(m.student_id);
    group.markIds.push(m.id);
    if (group.totalHouseStudents > 0) {
      group.turnoutRate = Math.round((group.studentCount / group.totalHouseStudents) * 100);
    }
  });

  return Array.from(groups.values());
}

export async function upsertHouseWeeklyMarks({ houseId, activityId, weekNumber, marks, remarks, presentCount }) {
  if (!houseId) throw new Error('Please select a House');
  if (!activityId) throw new Error('Please select an Activity');
  if (!weekNumber) throw new Error('Please select a Week Number');

  // 1. Fetch active students in this house (fallback to all if no active)
  let { data: students, error: sErr } = await supabase
    .from('students')
    .select('id, name')
    .eq('house_id', houseId)
    .eq('status', 'ACTIVE')
    .order('name');

  if (sErr) throw sErr;
  if (!students || students.length === 0) {
    const { data: allSt, error: allErr } = await supabase
      .from('students')
      .select('id, name')
      .eq('house_id', houseId)
      .order('name');
    if (allErr) throw allErr;
    students = allSt || [];
  }

  if (!students || students.length === 0) {
    throw new Error('This house does not have any registered students yet. Please assign students to this house first.');
  }

  // Determine how many students are present
  const targetCount = presentCount !== undefined && Number(presentCount) > 0
    ? Math.min(Number(presentCount), students.length)
    : students.length;

  const presentStudents = students.slice(0, targetCount);
  const presentStudentIds = new Set(presentStudents.map((s) => s.id));

  // If editing: remove marks for students from this house who were NOT present
  const allStudentIds = students.map((s) => s.id);
  const absentStudentIds = allStudentIds.filter((id) => !presentStudentIds.has(id));
  if (absentStudentIds.length > 0) {
    await supabase
      .from('weekly_marks')
      .delete()
      .eq('activity_id', activityId)
      .eq('week_number', Number(weekNumber))
      .in('student_id', absentStudentIds);
  }

  // 2. Prepare bulk rows for weekly_marks
  const rows = presentStudents.map((st) => ({
    student_id: st.id,
    activity_id: activityId,
    week_number: Number(weekNumber),
    marks: Number(marks),
    remarks: remarks?.trim() || null,
  }));

  // 3. Upsert into weekly_marks
  const { data, error } = await supabase
    .from('weekly_marks')
    .upsert(rows, { onConflict: 'student_id, activity_id, week_number' })
    .select();

  if (error) throw error;
  return { success: true, count: rows.length, totalHouseStudents: students.length, data };
}

export async function deleteHouseWeeklyMarks({ houseId, activityId, weekNumber }) {
  if (!houseId || !activityId || !weekNumber) {
    throw new Error('Missing parameters to delete house marks');
  }

  // Fetch students of this house
  const { data: students, error: sErr } = await supabase
    .from('students')
    .select('id')
    .eq('house_id', houseId);

  if (sErr) throw sErr;
  const studentIds = (students || []).map((s) => s.id);
  if (studentIds.length === 0) return true;

  const { error } = await supabase
    .from('weekly_marks')
    .delete()
    .eq('activity_id', activityId)
    .eq('week_number', Number(weekNumber))
    .in('student_id', studentIds);

  if (error) throw error;
  return true;
}

// ====================================================================
// ADMIN DASHBOARD AGGREGATED STATS
// ====================================================================
export async function getAdminDashboardStats() {
  const [housesRanked, studentsRes, activitiesRes, marksRes] = await Promise.all([
    getHouseRankings(),
    supabase.from('students').select('id, status, department'),
    supabase.from('activities').select('id, name, activity_date'),
    supabase.from('weekly_marks').select('id, marks, week_number, student_id, activity_id, created_at'),
  ]);

  if (studentsRes.error) throw studentsRes.error;
  if (activitiesRes.error) throw activitiesRes.error;
  if (marksRes.error) throw marksRes.error;

  const students = studentsRes.data || [];
  const activities = activitiesRes.data || [];
  const marks = marksRes.data || [];

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'ACTIVE').length;
  const totalActivities = activities.length;
  const totalHouses = housesRanked.length;

  // Unique participating students
  const participatingStudentIds = new Set(marks.map((m) => m.student_id));
  const overallParticipationRate = totalStudents > 0
    ? Math.round((participatingStudentIds.size / totalStudents) * 100)
    : 0;

  const topHouse = housesRanked[0] || null;

  // Chart 1: House Marks Bar Chart
  const houseMarksChart = housesRanked.map((h) => ({
    name: h.name.split(' ')[0] || h.code,
    fullName: h.name,
    code: h.code,
    totalMarks: h.totalMarks,
    avgMarks: h.averageMarks,
    students: h.totalStudents,
    color: h.color || '#16a34a',
  }));

  // Chart 2: Weekly Participation Trend
  const weeklyMap = {};
  marks.forEach((m) => {
    const w = `Week ${m.week_number}`;
    if (!weeklyMap[w]) {
      weeklyMap[w] = { week: w, marks: 0, entries: 0, weekNumber: m.week_number };
    }
    weeklyMap[w].marks += Number(m.marks) || 0;
    weeklyMap[w].entries += 1;
  });

  const weeklyTrendChart = Object.values(weeklyMap).sort((a, b) => a.weekNumber - b.weekNumber);

  // Chart 3: Department Distribution
  const deptMap = {};
  students.forEach((s) => {
    const dept = s.department || 'Other';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const departmentChart = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  return {
    totalStudents,
    activeStudents,
    totalActivities,
    totalHouses,
    overallParticipationRate,
    topHouse,
    housesRanked,
    houseMarksChart,
    weeklyTrendChart,
    departmentChart,
  };
}

// ====================================================================
// LEADERBOARD (STUDENT-CENTRIC)
// ====================================================================
export async function getLeaderboardData({ houseId = '', department = '', year = '', weekNumber = null } = {}) {
  // Fetch students with house
  let studentQuery = supabase
    .from('students')
    .select('*, house:houses(*)');

  if (houseId) studentQuery = studentQuery.eq('house_id', houseId);
  if (department) studentQuery = studentQuery.eq('department', department);
  if (year) studentQuery = studentQuery.eq('year', year);

  const { data: students, error: sErr } = await studentQuery;
  if (sErr) throw sErr;

  // Fetch marks
  let marksQuery = supabase
    .from('weekly_marks')
    .select('student_id, marks, week_number');

  if (weekNumber) marksQuery = marksQuery.eq('week_number', weekNumber);

  const { data: marks, error: mErr } = await marksQuery;
  if (mErr) throw mErr;

  // Aggregate marks by student
  const studentStats = {};
  (marks || []).forEach((m) => {
    if (!studentStats[m.student_id]) {
      studentStats[m.student_id] = { totalMarks: 0, count: 0 };
    }
    studentStats[m.student_id].totalMarks += Number(m.marks) || 0;
    studentStats[m.student_id].count += 1;
  });

  const leaderboard = (students || []).map((st) => {
    const stat = studentStats[st.id] || { totalMarks: 0, count: 0 };
    const avg = stat.count > 0 ? Number((stat.totalMarks / stat.count).toFixed(1)) : 0;
    return {
      ...st,
      totalMarks: stat.totalMarks,
      activitiesCount: stat.count,
      averageMarks: avg,
    };
  });

  leaderboard.sort((a, b) => b.totalMarks - a.totalMarks || b.averageMarks - a.averageMarks);

  return leaderboard.map((st, idx) => ({
    ...st,
    rank: idx + 1,
  }));
}

// ====================================================================
// STUDENT INDIVIDUAL DASHBOARD DATA
// ====================================================================
export async function getStudentDashboardData(studentId) {
  if (!studentId) return null;

  const [studentRes, marksRes, activitiesRes, rankings] = await Promise.all([
    supabase.from('students').select('*, house:houses(*)').eq('id', studentId).single(),
    supabase.from('weekly_marks').select('*, activity:activities(*)').eq('student_id', studentId).order('week_number', { ascending: true }),
    supabase.from('activities').select('*').order('activity_date', { ascending: false }),
    getHouseRankings(),
  ]);

  if (studentRes.error) throw studentRes.error;
  if (marksRes.error) throw marksRes.error;
  if (activitiesRes.error) throw activitiesRes.error;

  const student = studentRes.data;
  const marks = marksRes.data || [];
  const activities = activitiesRes.data || [];

  const totalActivities = activities.length;
  const activitiesParticipated = marks.length;
  const totalMarks = marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
  const averageMarks = activitiesParticipated > 0 ? Number((totalMarks / activitiesParticipated).toFixed(1)) : 0;

  // Weekly performance chart
  const weeklyPerformance = marks.map((m) => ({
    week: `Week ${m.week_number}`,
    weekNumber: m.week_number,
    marks: m.marks,
    maxMarks: m.activity?.maximum_mark || 10,
    activityName: m.activity?.name || 'Activity',
  }));

  // Activity performance chart
  const activityPerformance = marks.map((m) => ({
    activity: m.activity?.name?.substring(0, 16) || `Act ${m.week_number}`,
    fullActivity: m.activity?.name || '',
    marks: m.marks,
    maxMarks: m.activity?.maximum_mark || 10,
  }));

  // Student's house ranking
  const myHouseRank = rankings.find((h) => h.id === student?.house_id) || null;

  return {
    student,
    totalActivities,
    activitiesParticipated,
    totalMarks,
    averageMarks,
    weeklyPerformance,
    activityPerformance,
    myHouseRank,
    overallHouseScores: rankings,
    recentMarks: marks.slice(-5).reverse(),
  };
}

// ====================================================================
// STUDENT PASSWORD MANAGEMENT (RESET & CHANGE)
// ====================================================================
export async function changeStudentPassword(studentId, newPassword) {
  if (!studentId || !newPassword) {
    throw new Error('Student ID and new password are required');
  }

  // 1. Try to update password column in Supabase database
  try {
    await supabase
      .from('students')
      .update({ password: newPassword })
      .eq('id', studentId);
  } catch (err) {
    console.warn('Could not update password column directly in students table:', err);
  }

  // 2. Persist in local student registry for instant offline/online compatibility
  try {
    const stored = JSON.parse(localStorage.getItem('ecoclub_student_passwords') || '{}');
    stored[studentId] = newPassword;
    localStorage.setItem('ecoclub_student_passwords', JSON.stringify(stored));
  } catch (e) {
    console.warn('Failed to update local password store:', e);
  }

  // 3. Update active student session in localStorage if active
  try {
    const sessionStr = localStorage.getItem('ecoclub_student_session');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      if (parsed?.studentRecord?.id === studentId) {
        parsed.studentRecord.password = newPassword;
        localStorage.setItem('ecoclub_student_session', JSON.stringify(parsed));
      }
    }
  } catch (e) {
    console.warn('Failed to update active session:', e);
  }

  return true;
}

export async function resetStudentPassword(rollNumber, newPassword = 'stud@sxcce') {
  const cleanRoll = rollNumber.trim();
  const { data: student, error } = await supabase
    .from('students')
    .select('*, house:houses(*)')
    .ilike('roll_number', cleanRoll)
    .maybeSingle();

  if (error || !student) {
    throw new Error(`Student with Roll Number "${cleanRoll}" not found in Eco Club database.`);
  }

  await changeStudentPassword(student.id, newPassword);
  return student;
}

