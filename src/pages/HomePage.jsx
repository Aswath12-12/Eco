import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Trophy,
  Users,
  Calendar,
  Award,
  ChevronRight,
  Droplets,
  Sun,
  Sprout,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TreePine,
  Recycle,
} from 'lucide-react';
import { getHouseRankings, getActivities } from '../services/api';
import HouseBadge from '../components/HouseBadge';

export default function HomePage() {
  const [rankings, setRankings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rankRes, actRes] = await Promise.all([
          getHouseRankings().catch(() => []),
          getActivities().catch(() => []),
        ]);
        setRankings(rankRes);
        setActivities(actRes);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalStudents = rankings.reduce((acc, h) => acc + (h.totalStudents || 0), 0);
  const totalMarks = rankings.reduce((acc, h) => acc + (h.totalMarks || 0), 0);

  const houseIcons = {
    GREEN: <TreePine className="w-8 h-8 text-emerald-600" />,
    BLUE: <Droplets className="w-8 h-8 text-blue-600" />,
    RED: <Sun className="w-8 h-8 text-rose-600" />,
    YELLOW: <Sprout className="w-8 h-8 text-amber-600" />,
  };

  const houseBgs = {
    GREEN: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400',
    BLUE: 'border-blue-200 bg-blue-50/50 hover:border-blue-400',
    RED: 'border-rose-200 bg-rose-50/50 hover:border-rose-400',
    YELLOW: 'border-amber-200 bg-amber-50/50 hover:border-amber-400',
  };

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-eco-50 via-white to-slate-50 pt-16 sm:pt-24 pb-20 border-b border-slate-200/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-eco-200/30 to-emerald-400/20 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eco-100 border border-eco-200 text-eco-800 text-xs sm:text-sm font-bold mb-6 shadow-xs animate-pulse">
            <Sparkles className="w-4 h-4 text-eco-600" />
            Official College Environmental Stewardship Portal
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            ECO CLUB <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-800 via-eco-600 to-emerald-500">
              House Management System
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            "Building a greener campus through participation, teamwork and sustainability."
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-bold text-white bg-eco-600 hover:bg-eco-700 rounded-2xl shadow-lg shadow-eco-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Access Member Portal
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/leaderboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-2xl border border-slate-200 shadow-sm transition cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              View House Leaderboard
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Active Students
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-eco-600">4 Houses</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Competing Houses
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{activities.length}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Green Activities
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-600">{totalMarks} pts</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Awarded Points
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 4 HOUSES SECTION */}
      <section id="houses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-eco-100 text-eco-800 mb-2">
            The 4 Pillars of Eco Club
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Our Four Eco Houses
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Every student belongs to one of four environmental houses, fostering collaborative leadership and healthy campus competition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rankings.length > 0 ? (
            rankings.map((house) => {
              const bgClass = houseBgs[house.code] || 'border-slate-200 bg-white';
              const icon = houseIcons[house.code] || <Leaf className="w-8 h-8 text-eco-600" />;

              return (
                <div
                  key={house.id}
                  className={`rounded-2xl p-6 border transition-all duration-300 transform hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between ${bgClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white shadow-xs border border-slate-100">
                        {icon}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-800 shadow-2xs">
                          Rank #{house.rank}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{house.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 line-clamp-3">
                      {house.description || 'Dedicated to green campus impact and environmental awareness.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-center bg-white/70 rounded-xl p-3">
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {house.totalMarks || 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Marks</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {house.totalStudents || 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Members</div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Default 4 cards if database is freshly initializing
            [
              { code: 'GREEN', name: 'Green House', desc: 'Champions of afforestation and zero waste.' },
              { code: 'BLUE', name: 'Blue House', desc: 'Guardians of water conservation and lake cleanliness.' },
              { code: 'RED', name: 'Red House', desc: 'Pioneers of renewable energy and clean mobility.' },
              { code: 'YELLOW', name: 'Yellow House', desc: 'Keepers of biodiversity and pollinator ecology.' },
            ].map((h) => (
              <div
                key={h.code}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <HouseBadge code={h.code} size="lg" />
                  <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">{h.name}</h3>
                  <p className="text-xs text-slate-600">{h.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-semibold">
                  House Code: {h.code}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ACTIVITIES SHOWCASE */}
      <section id="activities" className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-eco-500/20 text-eco-400 border border-eco-500/30 mb-2">
                Action-Oriented Initiatives
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Eco Club Activities & Drives
              </h2>
            </div>
            <Link
              to="/login"
              className="text-eco-400 hover:text-eco-300 font-semibold text-sm flex items-center gap-1.5 transition"
            >
              Sign in to earn marks <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.length > 0 ? (
              activities.slice(0, 6).map((activity) => (
                <div
                  key={activity.id}
                  className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 hover:border-eco-500/50 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-eco-400" />
                        {new Date(activity.activity_date).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-eco-500/20 text-eco-300 font-semibold text-[11px]">
                        Max: {activity.maximum_mark} Marks
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{activity.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {activity.description || 'Hands-on environmental initiative.'}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span className="text-eco-400 font-bold">House Points Active</span>
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              ))
            ) : (
              [
                { title: 'Tree Plantation Drive', desc: 'Planting native trees on campus to enhance green cover and biodiversity.', mark: 10 },
                { title: 'Waste Segregation Audit', desc: 'Implementing color-coded bins and auditing college plastic disposal.', mark: 10 },
                { title: 'Environmental Quiz Bowl', desc: 'Inter-house intellectual showdown on climate science and policy.', mark: 15 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80"
                >
                  <div className="text-xs text-eco-400 font-semibold mb-2">Max {item.mark} Marks</div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-eco-100 text-eco-800 mb-2">
            Process & Progression
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How The Eco Club Works
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Simple 4-step framework empowering students to transform campus ecology and earn individual & house accolades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {[
            {
              step: '01',
              title: 'House Allocation',
              desc: 'Enrolled students are assigned to Green, Blue, Red, or Yellow house upon joining.',
              icon: Users,
            },
            {
              step: '02',
              title: 'Weekly Activities',
              desc: 'Participate in campus tree planting, cleanliness drives, energy audits, and workshops.',
              icon: Calendar,
            },
            {
              step: '03',
              title: 'Weekly Marks',
              desc: 'Club coordinators evaluate student contributions and award weekly performance points.',
              icon: Award,
            },
            {
              step: '04',
              title: 'Leaderboard & Trophy',
              desc: 'Dynamic rankings update automatically. The leading house wins the Annual Eco Shield!',
              icon: Trophy,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-eco-50 border border-eco-200 flex items-center justify-center text-eco-700">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-200">{item.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-eco-800 via-eco-700 to-emerald-600 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Ready to make an impact?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Join Your House in Campus Green Action Today
            </h2>
            <p className="mt-3 text-eco-100 text-sm sm:text-base leading-relaxed">
              Login to view your assigned house, verify your marks, and track your house in the inter-house championship race.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-white text-eco-900 hover:bg-eco-50 font-bold text-sm text-center shadow-md transition cursor-pointer"
            >
              Sign In to Portal
            </Link>
            <Link
              to="/leaderboard"
              className="px-6 py-3.5 rounded-xl bg-eco-900/60 hover:bg-eco-900/80 text-white border border-white/20 font-bold text-sm text-center transition cursor-pointer"
            >
              View House Standings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
