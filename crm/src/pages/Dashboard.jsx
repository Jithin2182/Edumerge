import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getDashboard } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import {
  HiPlus, HiBuildingOffice2, HiCheckBadge, HiBuildingLibrary, HiUsers,
  HiChartBar, HiChartPie, HiCheckCircle, HiArrowRight,
} from 'react-icons/hi2';

const PIE_COLORS = ['#3b82f6', '#6366f1', '#f97316'];

const STATUS_BADGE = {
  PENDING: 'bg-amber-100 text-amber-700',
  ALLOCATED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
};
const DOC_BADGE = {
  PENDING: 'bg-red-100 text-red-600',
  SUBMITTED: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
};

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide leading-none">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1 leading-none">
        {value}
        {sub && <span className="text-sm font-normal text-slate-400 ml-1.5">{sub}</span>}
      </p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }} className="text-xs">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }
  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">{error}</div>
    </div>
  );

  const totalIntake = data.seatsGraph.reduce((s, p) => s + p.intake, 0);
  const totalFilled = data.seatsGraph.reduce((s, p) => s + p.filled.total, 0);
  const fillPct = totalIntake ? Math.round((totalFilled / totalIntake) * 100) : 0;

  const barData = data.seatsGraph.map((p) => ({
    name: p.program.length > 12 ? p.program.slice(0, 12) + '…' : p.program,
    fullName: p.program,
    KCET: p.filled.KCET,
    COMEDK: p.filled.COMEDK,
    Management: p.filled.MANAGEMENT,
    Available: p.available.total,
  }));

  const pieData = [
    { name: 'KCET', value: data.admissionPie.government.KCET },
    { name: 'COMEDK', value: data.admissionPie.government.COMEDK },
    { name: 'Management', value: data.admissionPie.management },
  ].filter((d) => d.value > 0);

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="p-8 space-y-7 min-h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Good morning, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-slate-400 text-sm mt-0.5">Here's what's happening with admissions today.</p>
        </div>
        <Link to="/applicants/new" className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <HiPlus className="w-4 h-4" />
          New Applicant
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Intake"     value={totalIntake}                          color="bg-blue-50"   icon={<HiBuildingOffice2 className="w-5 h-5 text-blue-600" />} />
        <StatCard label="Seats Filled"      value={totalFilled} sub={`/ ${totalIntake} (${fillPct}%)`} color="bg-violet-50" icon={<HiCheckBadge     className="w-5 h-5 text-violet-600" />} />
        <StatCard label="Govt Admissions"   value={data.admissionPie.government.total} sub="KCET + COMEDK" color="bg-sky-50"    icon={<HiBuildingLibrary className="w-5 h-5 text-sky-600" />} />
        <StatCard label="Mgmt Admissions"   value={data.admissionPie.management}        color="bg-orange-50" icon={<HiUsers           className="w-5 h-5 text-orange-600" />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Bar chart */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Seats by Program</h3>
              <p className="text-xs text-slate-400 mt-0.5">Filled breakdown per quota type</p>
            </div>
          </div>
          {barData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-300">
              <HiChartBar className="w-10 h-10 mb-3" />
              <p className="text-sm">No program data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                <Bar dataKey="KCET" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="COMEDK" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Management" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-800">Quota Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Allocations by admission type</p>
          </div>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-300">
              <HiChartPie className="w-10 h-10 mb-3" />
              <p className="text-sm">No allocations yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3} labelLine={false} label={renderLabel}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pending action list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Action Required</h3>
            <p className="text-xs text-slate-400 mt-0.5">Allocated applicants with pending fees or unverified documents</p>
          </div>
          {data.pendingApplicants.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {data.pendingApplicants.length}
            </span>
          )}
        </div>

        {data.pendingApplicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <HiCheckCircle className="w-10 h-10 mb-3" />
            <p className="text-sm text-slate-400 font-medium">All applicants are up to date</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.pendingApplicants.map((a) => (
              <div key={a._id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-semibold shrink-0">
                  {a.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{a.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {a.programId?.name} &middot; {a.quota} &middot; {a.category}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOC_BADGE[a.documentsStatus]}`}>Docs: {a.documentsStatus}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.feeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    Fee: {a.feeStatus}
                  </span>
                </div>
                <Link to={`/applicants/${a._id}`} className="shrink-0 flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-800">
                  View
                  <HiArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;