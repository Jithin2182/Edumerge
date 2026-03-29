import { useEffect, useState } from 'react';
import { getPrograms, createProgram } from '../api/programs';
import { useAuth } from '../context/AuthContext';
import { HiPlus, HiXMark, HiAcademicCap } from 'react-icons/hi2';

const INITIAL_FORM = { name: '', intake: '', quotas: { KCET: '', COMEDK: '', MANAGEMENT: '' } };

const QUOTA_STYLE = {
  KCET: { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  COMEDK: { bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700' },
  MANAGEMENT: { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN';

  const load = () => {
    setLoading(true);
    getPrograms()
      .then(({ data }) => setPrograms(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load programs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleQuotaChange = (key, value) =>
    setForm((f) => ({ ...f, quotas: { ...f.quotas, [key]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await createProgram({
        name: form.name.trim(),
        intake: Number(form.intake),
        quotas: { KCET: Number(form.quotas.KCET), COMEDK: Number(form.quotas.COMEDK), MANAGEMENT: Number(form.quotas.MANAGEMENT) },
      });
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create program');
    } finally {
      setSaving(false);
    }
  };

  const fillPct = (filled, total) => (total ? Math.min(100, Math.round((filled / total) * 100)) : 0);
  const quotaSum = Number(form.quotas.KCET || 0) + Number(form.quotas.COMEDK || 0) + Number(form.quotas.MANAGEMENT || 0);
  const quotaMatch = form.intake && quotaSum === Number(form.intake);

  return (
    <div className="p-8 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Programs</h2>
          <p className="text-slate-400 text-sm mt-0.5">{programs.length} program{programs.length !== 1 ? 's' : ''} configured</p>
        </div>
        {canCreate && (
          <button onClick={() => { setShowForm((v) => !v); setFormError(''); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            {showForm ? <HiXMark className="w-4 h-4" /> : <HiPlus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'New Program'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-5">Create New Program</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Program Name</label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. B.Tech Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Intake</label>
                <input type="number" required min="1" value={form.intake}
                  onChange={(e) => setForm({ ...form, intake: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 60" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quota Allocation</label>
              <p className="text-xs text-slate-400 mb-3">Must sum to total intake</p>
              <div className="grid grid-cols-3 gap-3">
                {['KCET', 'COMEDK', 'MANAGEMENT'].map((q) => (
                  <div key={q}>
                    <label className={`block text-xs font-semibold mb-1.5 ${QUOTA_STYLE[q].badge.split(' ')[1]}`}>{q}</label>
                    <input type="number" required min="0" value={form.quotas[q]}
                      onChange={(e) => handleQuotaChange(q, e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0" />
                  </div>
                ))}
              </div>
              {form.intake && (
                <p className={`text-xs mt-2 font-medium ${quotaMatch ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {quotaMatch ? '✓ Quota allocation matches intake' : `Sum ${quotaSum} — must equal ${form.intake}`}
                </p>
              )}
            </div>

            {formError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{formError}</div>}

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Creating…' : 'Create Program'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setFormError(''); setForm(INITIAL_FORM); }}
                className="border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Programs grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">{error}</div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
          <HiAcademicCap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No programs yet.{canCreate ? ' Create one to get started.' : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {programs.map((p) => {
            const totalFilled = p.filledSeats.KCET + p.filledSeats.COMEDK + p.filledSeats.MANAGEMENT;
            const overallPct = fillPct(totalFilled, p.intake);
            return (
              <div key={p._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                {/* Program header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Total intake: {p.intake} seats</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{totalFilled}<span className="text-sm font-normal text-slate-400"> / {p.intake}</span></p>
                    <p className="text-xs text-slate-400">seats filled</p>
                  </div>
                </div>

                {/* Overall progress bar */}
                <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
                  <span>Overall fill rate</span>
                  <span className={`font-semibold ${overallPct >= 90 ? 'text-red-500' : overallPct >= 70 ? 'text-amber-500' : 'text-emerald-500'}`}>{overallPct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${overallPct >= 90 ? 'bg-red-500' : overallPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${overallPct}%` }} />
                </div>

                {/* Per-quota breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  {['KCET', 'COMEDK', 'MANAGEMENT'].map((q) => {
                    const pct = fillPct(p.filledSeats[q], p.quotas[q]);
                    return (
                      <div key={q} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${QUOTA_STYLE[q].badge}`}>{q}</span>
                          <span className="text-xs text-slate-400">{pct}%</span>
                        </div>
                        <p className="text-lg font-bold text-slate-800 leading-tight">
                          {p.filledSeats[q]}
                          <span className="text-xs font-normal text-slate-400"> / {p.quotas[q]}</span>
                        </p>
                        <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${QUOTA_STYLE[q].bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Programs;