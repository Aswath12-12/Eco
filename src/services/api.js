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
    .select('id, house_id');
  if (studentErr) throw studentErr;

  // 3. Fetch all weekly marks with student_id, activity_id, week_number
  const { data: marks, error: marksErr } = await supabase
    .from('weekly_marks')
    .select('id, marks, student_id, activity_id, week_number');
  if (marksErr) throw marksErr;

  // Map students to house
  const studentToHouseMap = {};
  (students || []).forEach((s) => {
    if (s.house_id) {
      studentToHouseMap[s.id] = s.house_id;
    }
  });

  // Aggregate marks per house by activity & week
  const houseActivityMarks = {};
  (houses || []).forEach((h) => {
    houseActivityMarks[h.id] = {};
  });

  (marks || []).forEach((m) => {
    const houseId = studentToHouseMap[m.student_id];
    if (houseId && houseActivityMarks[houseId] !== undefined) {
      const key = `${m.activity_id}_${m.week_number}`;
      const markVal = Number(m.marks) || 0;
      if (houseActivityMarks[houseId][key] === undefined || markVal > houseActivityMarks[houseId][key]) {
        houseActivityMarks[houseId][key] = markVal;
      }
    }
  });

  // Calculate detailed team ranking based purely on points
  const ranked = (houses || []).map((h) => {
    const actMarks = Object.values(houseActivityMarks[h.id] || {});
    const totalMarks = actMarks.reduce((sum, val) => sum + val, 0);
    const avgMarks = actMarks.length > 0 ? Number((totalMarks / actMarks.length).toFixed(1)) : 0;

    return {
      ...h,
      totalMarks,
      averageMarks: avgMarks,
      activitiesCount: actMarks.length,
    };
  });

  // Sort descending purely by totalMarks, then by averageMarks, then by activitiesCount
  ranked.sort(
    (a, b) =>
      b.totalMarks - a.totalMarks ||
      b.averageMarks - a.averageMarks ||
      b.activitiesCount - a.activitiesCount
  );

  // Assign dynamic ranks with standard sports tie-handling (equal points = same rank / joint winners)
  let currentRank = 1;
  return ranked.map((house, index, arr) => {
    if (index > 0 && house.totalMarks < arr[index - 1].totalMarks) {
      currentRank = index + 1;
    }
    const isTie = arr.some((other, oIdx) => oIdx !== index && other.totalMarks === house.totalMarks && house.totalMarks > 0);
    return {
      ...house,
      rank: currentRank,
      isTie,
      isWinner: currentRank === 1 && house.totalMarks > 0,
      isJointWinner: currentRank === 1 && isTie && house.totalMarks > 0,
    };
  });
}

// ====================================================================
// WEEKLY WINNERS & TIE ANNOUNCEMENTS
// ====================================================================
export async function getWeeklyWinners() {
  const houseMarks = await getHouseWeeklyMarks();
  const weeksMap = {};

  houseMarks.forEach((m) => {
    const w = m.week_number;
    if (!weeksMap[w]) {
      weeksMap[w] = { weekNumber: w, maxMarks: 0, entries: [] };
    }
    const marksVal = Number(m.marks) || 0;
    if (marksVal > weeksMap[w].maxMarks) {
      weeksMap[w].maxMarks = marksVal;
    }
    weeksMap[w].entries.push(m);
  });

  return Object.values(weeksMap)
    .filter((wInfo) => wInfo.maxMarks > 0)
    .map((wInfo) => {
      // Find all houses with max marks in this week
      const topEntries = wInfo.entries.filter((m) => Number(m.marks) === wInfo.maxMarks);
      // Deduplicate by house_id
      const uniqueWinners = [];
      const seenHouse = new Set();
      topEntries.forEach((entry) => {
        if (entry.house_id && !seenHouse.has(entry.house_id)) {
          seenHouse.add(entry.house_id);
          uniqueWinners.push(entry);
        }
      });

      const isTie = uniqueWinners.length > 1;
      return {
        weekNumber: wInfo.weekNumber,
        maxMarks: wInfo.maxMarks,
        isTie,
        winners: uniqueWinners,
        winnerHouses: uniqueWinners.map((w) => w.house),
      };
    })
    .sort((a, b) => b.weekNumber - a.weekNumber);
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
    .select('id, marks, remarks, week_number, created_at, student_id, activity_id, student:students(id, name, roll_number, house_id, house:houses(id, name, code, color)), activity:activities(id, name, maximum_mark, activity_date)')
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
  const allMarks = await getWeeklyMarks({ weekNumber, activityId, houseId });

  // Group by composite key: house_id + activity_id + week_number
  const groups = new Map();

  allMarks.forEach((m) => {
    const hId = m.student?.house_id;
    if (!hId) return;
    const groupKey = `${hId}_${m.activity_id}_${m.week_number}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        id: groupKey,
        house_id: hId,
        house: m.student?.house,
        activity_id: m.activity_id,
        activity: m.activity,
        week_number: m.week_number,
        marks: m.marks,
        remarks: m.remarks,
        markIds: [],
        created_at: m.created_at,
      });
    }

    const group = groups.get(groupKey);
    group.markIds.push(m.id);
  });

  return Array.from(groups.values());
}

export async function upsertHouseWeeklyMarks({ houseId, activityId, weekNumber, marks, remarks }) {
  if (!houseId) throw new Error('Please select a House');
  if (!activityId) throw new Error('Please select an Activity');
  if (!weekNumber) throw new Error('Please select a Week Number');

  // Fetch one representative student in this house to anchor the points
  const { data: students, error: sErr } = await supabase
    .from('students')
    .select('id')
    .eq('house_id', houseId)
    .limit(1);

  if (sErr) throw sErr;
  if (!students || students.length === 0) {
    throw new Error('This house does not have any registered students yet. Please assign at least one student to this house first.');
  }

  const studentId = students[0].id;

  // Single-row upsert into weekly_marks - ultra fast (~30-50ms)
  const { data, error } = await supabase
    .from('weekly_marks')
    .upsert(
      {
        student_id: studentId,
        activity_id: activityId,
        week_number: Number(weekNumber),
        marks: Number(marks),
        remarks: remarks?.trim() || null,
      },
      { onConflict: 'student_id, activity_id, week_number' }
    );

  if (error) throw error;
  return { success: true, data };
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

