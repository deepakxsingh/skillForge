import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Zap, ChevronRight, CheckCircle2, ShieldAlert, RotateCcw, Star, Clock } from 'lucide-react';
import api from '../api';

const STATUS_CONFIG = {
  open:      { label: 'Open',       color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  assigned:  { label: 'In Progress',color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  submitted: { label: 'Under Review',color:'text-amber-600 bg-amber-50 border-amber-100' },
  revision:  { label: 'Revision',   color: 'text-orange-600 bg-orange-50 border-orange-100' },
  disputed:  { label: 'Disputed',   color: 'text-rose-700 bg-rose-50 border-rose-200' },
  completed: { label: 'Completed',  color: 'text-teal-700 bg-teal-50 border-teal-100' },
  cancelled: { label: 'Cancelled',  color: 'text-slate-500 bg-slate-100 border-slate-200' },
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [disputeModal, setDisputeModal] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects. Ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setActionLoading(id + '-accept');
    try {
      await api.post(`/projects/${id}/assign`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept project.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id) => {
    setRatingModal(id);
  };

  const submitApproval = async () => {
    setActionLoading(ratingModal + '-approve');
    try {
      await api.post(`/projects/${ratingModal}/approve`, { rating });
      setRatingModal(null);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevision = async (id) => {
    setActionLoading(id + '-revision');
    try {
      await api.post(`/projects/${id}/revision`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const submitDispute = async () => {
    setActionLoading(disputeModal + '-dispute');
    try {
      await api.post(`/projects/${disputeModal}/dispute`, { reason: disputeReason });
      setDisputeModal(null);
      setDisputeReason('');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to raise dispute.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="space-y-10 page-transition pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-4 w-full max-w-md">
          <div className="h-6 w-32 shimmer rounded-full"></div>
          <div className="h-10 w-full shimmer rounded-2xl"></div>
          <div className="h-4 w-64 shimmer rounded-lg"></div>
        </div>
        <div className="h-12 w-40 shimmer rounded-2xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-card rounded-[2.5rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-6 w-20 shimmer rounded-lg"></div>
              <div className="h-6 w-12 shimmer rounded-lg"></div>
            </div>
            <div className="h-8 w-full shimmer rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-3 w-full shimmer rounded"></div>
              <div className="h-3 w-2/3 shimmer rounded"></div>
            </div>
            <div className="h-12 w-full shimmer rounded-2xl"></div>
            <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
              <div className="h-10 w-10 shimmer rounded-xl"></div>
              <div className="h-4 w-24 shimmer rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <Zap className="w-3 h-3 fill-current" />
            <span>Ready for Pickup</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Open Opportunities</h1>
          <p className="text-slate-500 font-medium italic">Handpicked projects from your fellow student entrepreneurs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 font-bold text-indigo-700 text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span>Live Updates</span>
          </div>
          {user?.role === 'client' && (
            <Link to="/projects/new" className="premium-btn text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20">
              + Post Project
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-8 bg-rose-50 text-rose-600 rounded-[2rem] border border-rose-100 font-bold text-center flex items-center justify-center space-x-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="glass-card p-24 text-center rounded-[3rem] border-dashed border-2 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 text-4xl shadow-inner">☕</div>
          <p className="text-2xl font-black text-slate-800">No active projects right now.</p>
          <p className="text-slate-500 font-medium mt-3 text-lg">Why not be the first to post a new gig?</p>
          <Link to="/projects/new" className="mt-8 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
            Post Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => {
            const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.open;
            const isDeadlineSoon = p.deadline && new Date(p.deadline) - new Date() < 48 * 60 * 60 * 1000;
            return (
              <div key={p._id} className="glass-card tilt-card flex flex-col rounded-[2.5rem] overflow-hidden group">
                <div className="p-8 pb-4 flex-1">
                  {/* Top Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-lg">{p.category}</span>
                      {p.isVerifiedPortfolioEntry && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-2 py-1.5 rounded-lg border border-teal-100">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100">
                      🟡 {p.rewardParams?.credits}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">{p.title}</h3>
                  <p className="text-slate-500 font-medium line-clamp-2 mb-6 text-sm leading-relaxed">{p.description}</p>

                  {/* Deadline */}
                  {p.deadline && (
                    <div className={`flex items-center gap-2 text-xs font-bold mb-4 ${isDeadlineSoon ? 'text-rose-600' : 'text-slate-400'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Deadline: {new Date(p.deadline).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                      {isDeadlineSoon && <span className="ml-1 bg-rose-100 text-rose-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Urgent</span>}
                    </div>
                  )}

                  {/* Recommended Skill */}
                  <Link to="/skills" className="flex items-center p-3 bg-slate-50 rounded-2xl mb-6 group/link hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                    <div className="p-2 bg-white rounded-xl text-indigo-500 mr-3 shadow-sm"><BookOpen className="w-4 h-4" /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Recommended Skill</p>
                      <p className="text-xs font-bold text-slate-700 group-hover/link:text-indigo-700 transition-colors">{p.category} Essentials</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover/link:text-indigo-500 group-hover/link:translate-x-1 transition-all" />
                  </Link>

                  {/* Creator */}
                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${p.client?.name}&background=6366f1&color=fff&bold=true`}
                        className="w-9 h-9 rounded-xl shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-50"
                        alt="Creator"
                      />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Creator</p>
                        <p className="text-sm font-bold text-slate-800">{p.client?.name}</p>
                      </div>
                    </div>
                    {p.worker && (
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Worker</p>
                        <p className="text-sm font-bold text-indigo-700">{p.worker?.name || 'Assigned'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-8 pb-8 pt-2 flex flex-col gap-3">
                  {/* Worker accepts open project */}
                  {user?.role === 'worker' && p.status === 'open' && (
                    <button
                      onClick={() => handleAccept(p._id)}
                      disabled={actionLoading === p._id + '-accept'}
                      className="w-full premium-btn text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {actionLoading === p._id + '-accept' ? 'Accepting...' : <><span>Accept Project</span><ChevronRight className="w-4 h-4" /></>}
                    </button>
                  )}

                  {/* Client actions on submitted project */}
                  {user?.role === 'client' && p.client?._id === user?._id && p.status === 'submitted' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(p._id)}
                        disabled={actionLoading === p._id + '-approve'}
                        className="flex-1 bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleRevision(p._id)}
                        disabled={actionLoading === p._id + '-revision'}
                        className="flex-1 bg-amber-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Revise
                      </button>
                      <button
                        onClick={() => setDisputeModal(p._id)}
                        className="px-4 bg-rose-50 text-rose-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center"
                        title="Raise Dispute"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Either party can dispute on assigned/revision */}
                  {(['assigned', 'revision'].includes(p.status)) &&
                    (user?._id === p.client?._id || user?._id === p.worker?._id) && (
                    <button
                      onClick={() => setDisputeModal(p._id)}
                      className="w-full bg-rose-50 text-rose-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" /> Raise Dispute
                    </button>
                  )}

                  {/* Fallback disabled state */}
                  {!(user?.role === 'worker' && p.status === 'open') &&
                   !(user?.role === 'client' && p.client?._id === user?._id && p.status === 'submitted') &&
                   !(['assigned', 'revision'].includes(p.status) && (user?._id === p.client?._id || user?._id === p.worker?._id)) && (
                    <button disabled className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed border border-slate-200">
                      {p.status === 'open' ? (user?.role === 'client' ? 'Client Restricted' : 'Login to Accept') : statusCfg.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ────── Rating Modal ────── */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setRatingModal(null)}>
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-slate-900">Approve & Rate</h3>
            <p className="text-slate-500 text-sm">Rate the worker's performance before releasing credits.</p>
            <div className="flex justify-center gap-3">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`p-2 rounded-xl transition-all ${s <= rating ? 'text-amber-400 scale-110' : 'text-slate-200'}`}>
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-bold text-slate-600">{rating} / 5 stars</p>
            <div className="flex gap-3">
              <button onClick={() => setRatingModal(null)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={submitApproval} disabled={!!actionLoading} className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 disabled:opacity-60">
                {actionLoading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────── Dispute Modal ────── */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDisputeModal(null)}>
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 rounded-2xl"><ShieldAlert className="w-6 h-6 text-rose-600" /></div>
              <h3 className="text-2xl font-black text-slate-900">Raise Dispute</h3>
            </div>
            <p className="text-slate-500 text-sm">Describe the issue clearly. This will escalate to Level 1 automated review.</p>
            <textarea
              rows={4}
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="e.g., Work submitted was incomplete and did not match requirements..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all text-sm"
            />
            <div className="flex gap-3">
              <button onClick={() => { setDisputeModal(null); setDisputeReason(''); }} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={submitDispute} disabled={!disputeReason.trim() || !!actionLoading} className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-black text-sm hover:bg-rose-700 disabled:opacity-50">
                {actionLoading ? 'Submitting...' : 'File Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
