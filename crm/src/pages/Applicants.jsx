import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApplicants } from '../api/applicants';
import { useAuth } from '../context/AuthContext';
import { HiPlus, HiMagnifyingGlass, HiXMark, HiUser, HiArrowRight } from 'react-icons/hi2';

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
const QUOTA_COLOR = {
  KCET: 'bg-blue-100 text-blue-700',
  COMEDK: 'bg-violet-100 text-violet-700',
  MANAGEMENT: 'bg-orange-100 text-orange-700',
};

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '', quota: '' });
  const { user } = useAuth();
  const canCreate = ['ADMIN', 'ADMISSION_OFFICER'].includes(user?.role);

  useEffect(() => {
    getApplicants()
      .then(({ data }) => setApplicants(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load applicants'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = applicants.filter((a) => {
    if (filter.status && a.status !== filter.status) return false;
    if (filter.quota && a.quota !== filter.quota) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
        !(a.programId?.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: applicants.length,
    PENDING: applicants.filter((a) => a.status === 'PENDING').length,
    ALLOCATED: applicants.filter((a) => a.status === 'ALLOCATED').length,
    CONFIRMED: applicants.filter((a) => a.status === 'CONFIRMED').length,
  };

  return (
    <div className="p-8 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Applicants</h2>
          <p className="text-slate-400 text-sm mt-0.5">{applicants.length} total applicants registered</p>
        </div>
        {canCreate && (
          <Link to="/applicants/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <HiPlus className="w-4 h-4" />
            New Applicant
          </Link>
        )}
      </div>

      {/* Status summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Total', value: counts.total, active: !filter.status, onClick: () => setFilter({ ...filter, status: '' }), cls: 'bg-slate-100 text-slate-700' },
          { label: 'Pending', value: counts.PENDING, active: filter.status === 'PENDING', onClick: () => setFilter({ ...filter, status: filter.status === 'PENDING' ? '' : 'PENDING' }), cls: 'bg-amber-100 text-amber-700' },
          { label: 'Allocated', value: counts.ALLOCATED, active: filter.status === 'ALLOCATED', onClick: () => setFilter({ ...filter, status: filter.status === 'ALLOCATED' ? '' : 'ALLOCATED' }), cls: 'bg-blue-100 text-blue-700' },
          { label: 'Confirmed', value: counts.CONFIRMED, active: filter.status === 'CONFIRMED', onClick: () => setFilter({ ...filter, status: filter.status === 'CONFIRMED' ? '' : 'CONFIRMED' }), cls: 'bg-emerald-100 text-emerald-700' },
        ].map((s) => (
          <button key={s.label} onClick={s.onClick}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${s.active ? 'border-current opacity-100 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'} ${s.cls}`}>
            <span>{s.label}</span>
            <span className="font-bold">{s.value}</span>
          </button>
        ))}
      </div>

      {/* Search & quota filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or program…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
        </div>
        <select value={filter.quota} onChange={(e) => setFilter({ ...filter, quota: e.target.value })}
          className="border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
          <option value="">All Quotas</option>
          <option>KCET</option>
          <option>COMEDK</option>
          <option>MANAGEMENT</option>
        </select>
        {(filter.status || filter.quota || search) && (
          <button onClick={() => { setFilter({ status: '', quota: '' }); setSearch(''); }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-400 hover:text-slate-700 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
            <HiXMark className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20">
          <HiUser className="w-10 h-10 text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-400">
            {applicants.length === 0 ? 'No applicants yet.' : 'No applicants match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Applicant</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Program</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Quota</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Documents</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Fee</th>
                <th className="bg-slate-50 px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                        {a.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{a.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{a.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{a.programId?.name ?? '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${QUOTA_COLOR[a.quota]}`}>{a.quota}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOC_BADGE[a.documentsStatus]}`}>{a.documentsStatus}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.feeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500'}`}>{a.feeStatus}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/applicants/${a._id}`}
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-800 transition-opacity">
                      View
                      <HiArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            Showing {filtered.length} of {applicants.length} applicants
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;