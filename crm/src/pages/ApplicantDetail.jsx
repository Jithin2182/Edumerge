import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getApplicantById,
  updateApplicant,
  updateFeeStatus,
  deleteApplicant,
} from '../api/applicants';
import { useAuth } from '../context/AuthContext';
import { HiArrowLeft, HiTrash, HiPencilSquare, HiCheckCircle } from 'react-icons/hi2';

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

const InfoRow = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
    <div className="text-sm font-semibold text-slate-800">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</p>
    {children}
  </div>
);

const ApplicantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = ['ADMIN', 'ADMISSION_OFFICER'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const load = () => {
    setLoading(true);
    getApplicantById(id)
      .then(({ data }) => {
        setApplicant(data);
        setForm({ name: data.name, category: data.category, documentsStatus: data.documentsStatus });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load applicant'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setFormError('');
    setSaving(true);
    try {
      await updateApplicant(id, form);
      setEditing(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusAction = async (status) => {
    setActionLoading(status);
    setError('');
    try {
      await updateApplicant(id, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleFeeToggle = async () => {
    const next = applicant.feeStatus === 'PENDING' ? 'PAID' : 'PENDING';
    setActionLoading('fee');
    try {
      await updateFeeStatus(id, { feeStatus: next });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update fee status');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this applicant? This cannot be undone.')) return;
    try {
      await deleteApplicant(id);
      navigate('/applicants');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete applicant');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-full text-slate-400">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
      Loading…
    </div>
  );
  if (error && !applicant) return (
    <div className="p-8"><div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">{error}</div></div>
  );
  if (!applicant) return null;

  const canAllocate = applicant.status === 'PENDING' && applicant.quota === 'MANAGEMENT';
  const canConfirm = applicant.status === 'ALLOCATED' && applicant.documentsStatus === 'VERIFIED';
  const initials = applicant.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="p-8 min-h-full">
      {/* Back + Delete row */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
          <HiArrowLeft className="w-4 h-4" />
          Back to Applicants
        </button>
        {canDelete && (
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            <HiTrash className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">{error}</div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT — 2/3 wide */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="text-2xl font-bold text-slate-900 border-b-2 border-blue-400 focus:outline-none bg-transparent w-full mb-1" />
                ) : (
                  <h2 className="text-2xl font-bold text-slate-900">{applicant.name}</h2>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${QUOTA_COLOR[applicant.quota]}`}>{applicant.quota}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[applicant.status]}`}>{applicant.status}</span>
                </div>
              </div>
              {canEdit && !editing && (
                <button onClick={() => { setEditing(true); setFormError(''); }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shrink-0">
                  <HiPencilSquare className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <InfoRow label="Program">{applicant.programId?.name ?? '—'}</InfoRow>
              <InfoRow label="Category">
                {editing ? (
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                    <option>General</option><option>OBC</option><option>Scheduled</option>
                  </select>
                ) : applicant.category}
              </InfoRow>
              <InfoRow label="Quota">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${QUOTA_COLOR[applicant.quota]}`}>{applicant.quota}</span>
              </InfoRow>
            </div>

            {editing && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                {formError && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{formError}</div>}
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button onClick={() => { setEditing(false); setFormError(''); }}
                    className="border border-slate-200 text-slate-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admission number (if exists) */}
          {applicant.admissionNumber && (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-sm shadow-emerald-100">
              <div className="flex items-center gap-2 mb-2 opacity-80 text-sm font-medium">
                <HiCheckCircle className="w-4 h-4" />
                Admission Confirmed
              </div>
              <p className="text-2xl font-bold font-mono tracking-wide">{applicant.admissionNumber}</p>
              <p className="text-xs opacity-70 mt-1">Admission Number</p>
            </div>
          )}

          {/* Documents & Status row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Document Status</h3>
              {editing && applicant.documentsStatus !== 'VERIFIED' ? (
                <select value={form.documentsStatus} onChange={(e) => setForm({ ...form, documentsStatus: e.target.value })}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                  <option value="PENDING">PENDING</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`text-sm px-3 py-1 rounded-full font-semibold ${DOC_BADGE[applicant.documentsStatus]}`}>{applicant.documentsStatus}</span>
                  {applicant.documentsStatus === 'VERIFIED' && <span className="text-xs text-slate-400">Locked</span>}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Fee Payment</h3>
              <div className="flex items-center justify-between">
                <span className={`text-sm px-3 py-1 rounded-full font-semibold ${applicant.feeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500'}`}>
                  {applicant.feeStatus}
                </span>
                {canEdit && (
                  <button onClick={handleFeeToggle} disabled={actionLoading === 'fee'}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors disabled:opacity-50 ${applicant.feeStatus === 'PENDING' ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
                    {actionLoading === 'fee' ? '…' : applicant.feeStatus === 'PENDING' ? 'Mark Paid' : 'Mark Pending'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-slate-400 flex gap-6">
            <span>Created {new Date(applicant.createdAt).toLocaleString()}</span>
            <span>Updated {new Date(applicant.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* RIGHT — 1/3 — Actions panel */}
        <div className="space-y-4">
          {/* Admission workflow */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Admission Workflow</h3>

            {/* Status timeline */}
            <div className="space-y-2 mb-5">
              {['PENDING', 'ALLOCATED', 'CONFIRMED'].map((s, i) => {
                const steps = ['PENDING', 'ALLOCATED', 'CONFIRMED'];
                const currentIdx = steps.indexOf(applicant.status);
                const past = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      past ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {past ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-slate-900' : past ? 'text-slate-400 line-through' : 'text-slate-400'}`}>{s}</span>
                  </div>
                );
              })}
            </div>

            {canEdit && (canAllocate || canConfirm) && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                {canAllocate && (
                  <button onClick={() => handleStatusAction('ALLOCATED')} disabled={actionLoading === 'ALLOCATED'}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {actionLoading === 'ALLOCATED' ? 'Allocating…' : 'Allocate Seat'}
                  </button>
                )}
                {canConfirm && (
                  <button onClick={() => handleStatusAction('CONFIRMED')} disabled={actionLoading === 'CONFIRMED'}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {actionLoading === 'CONFIRMED' ? 'Confirming…' : 'Confirm Admission'}
                  </button>
                )}
                {canConfirm && (
                  <p className="text-xs text-emerald-600 text-center">Docs verified — admission number will be generated</p>
                )}
                {canAllocate && (
                  <p className="text-xs text-blue-500 text-center">Will lock one Management seat</p>
                )}
              </div>
            )}

            {!canEdit && <p className="text-xs text-slate-400 text-center">No workflow actions available</p>}
          </div>

          {/* Summary card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[applicant.status]}`}>{applicant.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Documents</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOC_BADGE[applicant.documentsStatus]}`}>{applicant.documentsStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${applicant.feeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500'}`}>{applicant.feeStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
