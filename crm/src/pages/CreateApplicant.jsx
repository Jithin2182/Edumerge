import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApplicant } from '../api/applicants';
import { getPrograms } from '../api/programs';
import { HiArrowLeft, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi2';

const QUOTA_INFO = {
  KCET:       { color: 'bg-blue-100 text-blue-700',    Icon: HiCheckCircle,       label: 'Seat auto-allocated on creation' },
  COMEDK:     { color: 'bg-violet-100 text-violet-700', Icon: HiCheckCircle,       label: 'Seat auto-allocated on creation' },
  MANAGEMENT: { color: 'bg-amber-100 text-amber-700',  Icon: HiExclamationCircle, label: 'Starts as PENDING — manual allocation required' },
};

const CreateApplicant = () => {
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', programId: '', quota: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPrograms().then(({ data }) => setPrograms(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createApplicant(form);
      navigate('/applicants');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create applicant');
    } finally {
      setSaving(false);
    }
  };

  const quotaInfo = form.quota ? QUOTA_INFO[form.quota] : null;

  const fieldCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 transition';

  return (
    <div className="p-8 min-h-full">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6">
        <HiArrowLeft className="w-4 h-4" />
        Back to Applicants
      </button>

      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">New Applicant</h2>
          <p className="text-slate-400 text-sm mt-0.5">Register a new admission applicant</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name + Category side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={fieldCls}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={fieldCls}
                >
                  <option value="">Select category</option>
                  <option>General</option>
                  <option>OBC</option>
                  <option>Scheduled</option>
                </select>
              </div>
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Program</label>
              <select
                required
                value={form.programId}
                onChange={(e) => setForm({ ...form, programId: e.target.value })}
                className={fieldCls}
              >
                <option value="">Select a program</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Quota — visual toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quota</label>
              <div className="grid grid-cols-3 gap-3">
                {['KCET', 'COMEDK', 'MANAGEMENT'].map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setForm({ ...form, quota: q })}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      form.quota === q
                        ? q === 'KCET'       ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : q === 'COMEDK'     ? 'border-violet-500 bg-violet-50 text-violet-700'
                        :                      'border-orange-400 bg-orange-50 text-orange-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {/* Hidden required input to trigger native validation */}
              <input type="text" required value={form.quota} onChange={() => {}}
                className="sr-only" tabIndex={-1} aria-hidden="true" />
            </div>

            {/* Quota hint */}
            {quotaInfo && (
              <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs font-medium border ${quotaInfo.color} border-current/20`}>
                <quotaInfo.Icon className="w-4 h-4 mt-0.5 shrink-0" />
                {quotaInfo.label}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shadow-blue-200"
              >
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Creating…' : 'Create Applicant'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateApplicant;
