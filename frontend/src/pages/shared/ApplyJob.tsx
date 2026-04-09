import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, apiFetch } from '../../lib/api';
import { useVoice } from '../../context/VoiceContext';

interface HireJob {
  id: string;
  title: string;
  location: string;
  lat?: number;
  lng?: number;
  wage: string;
  workers_needed: number;
  work_date: string;
  description: string;
  farmer: { name: string };
}

export default function ApplyJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<HireJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [candidateLocation, setCandidateLocation] = useState('');
  const [locating, setLocating] = useState(false);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  const showVoiceToast = (msg: string) => {
    setVoiceToast(msg);
    setTimeout(() => setVoiceToast(null), 4000);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data && data.display_name) {
          setCandidateLocation(data.display_name);
        } else {
          setCandidateLocation(`${latitude}, ${longitude}`);
        }
      } catch (err) {
        setCandidateLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
      } finally {
        setLocating(false);
      }
    }, () => {
      alert("Unable to retrieve your location");
      setLocating(false);
    });
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await apiFetch<HireJob>(`/public/hiring/${jobId}`);
        setJob(data);
      } catch (err) {
        console.error('Job not found');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  // ── Voice Control ──
  const voiceContext = `
PAGE_CONTEXT: Apply for a Job
Form State:
- Full Name (Required): ${name || 'Not set'}
- Phone Number (Required): ${phone || 'Not set'}
- Location (Required): ${candidateLocation || 'Not set'}
- Skills/Notes: ${skills || 'Not set'}

Job Details:
- Title: ${job?.title || 'Unknown'}
- Wage: ${job?.wage || 'Unknown'}

Supported actions schema:
{
  "action": "SET_FIELDS" | "SUBMIT_APPLICATION",
  "fields": {
    "name": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "skills": "string or null"
  }
}

IMPORTANT: Do NOT use "SUBMIT_APPLICATION" UNLESS all required fields (name, phone, location) are filled. Otherwise use "SET_FIELDS" and ask the user for missing info.
  `.trim();

  const handleVoiceIntent = React.useCallback((intent: any) => {
    if (!intent) return;
    const applyFields = (f: any) => {
      if (!f) return;
      if (f.name) setName(f.name);
      if (f.phone) setPhone(f.phone);
      if (f.location) setCandidateLocation(f.location);
      if (f.skills) setSkills(f.skills);
    };

    if (intent.action === 'SET_FIELDS') {
      applyFields(intent.fields);
      showVoiceToast('✅ Application updated via voice');
    } else if (intent.action === 'SUBMIT_APPLICATION') {
      applyFields(intent.fields);
      showVoiceToast('⏳ Sending application...');
      setTimeout(() => {
        const f = document.getElementById('apply-form');
        if (f) f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 500);
    }
  }, [setName, setPhone, setCandidateLocation, setSkills]);

  useVoice(voiceContext, handleVoiceIntent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    try {
      await apiFetch('/public/hiring/apply', {
        method: 'POST',
        body: JSON.stringify({
          job_id: job.id,
          name,
          phone,
          skills,
          candidate_location: candidateLocation,
          lat,
          lng
        })
      });
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/20 text-center max-w-md w-full">
          <span className="material-symbols-outlined text-5xl text-outline-variant/60 mb-4 block">search_off</span>
          <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">Job Not Found</h1>
          <p className="text-on-surface-variant mb-6">The link you followed may be expired or invalid.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl font-bold text-on-surface transition-colors">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-outline-variant/20 text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600" />
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-green-600 font-bold">check</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline text-on-surface mb-3">Application Sent!</h1>
          <p className="text-on-surface-variant mb-8 text-sm sm:text-base">
            Your application for <strong>{job.title}</strong> has been received by <strong>{job.farmer.name}</strong>. They will contact you shortly if you're selected.
          </p>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest font-body pb-12">
      {/* Voice Action Toast */}
      {voiceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] bg-gray-900/95 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <span className="material-symbols-outlined text-[18px] text-green-400">mic</span>
          {voiceToast}
        </div>
      )}

      {/* Top Bar Wrapper */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-10 pb-20 px-4 sm:px-6 md:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
             <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
           </div>
           <span className="text-2xl font-bold font-headline tracking-tight">AgroChain</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 -mt-12">
        {/* Job Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md shadow-primary-600/5 mb-6 border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-4">
            <span className="material-symbols-outlined text-[14px]">fiber_new</span>
            Hiring Now
          </span>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline text-on-surface mb-4">{job.title}</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary-600 text-[22px] mt-0.5">location_on</span>
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Location</span>
                <span className="font-medium text-sm text-on-surface">{job.location}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary-600 text-[22px] mt-0.5">event</span>
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Date</span>
                <span className="font-medium text-sm text-on-surface">{new Date(job.work_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-green-600 text-[22px] mt-0.5">payments</span>
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Wage</span>
                <span className="font-medium text-sm text-on-surface">₹{job.wage} / day</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[22px] mt-0.5">groups</span>
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Needed</span>
                <span className="font-medium text-sm text-on-surface">{job.workers_needed} workers</span>
              </div>
            </div>
          </div>
          
          {job.description && (
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2 block">Requirements</span>
              <p className="text-sm text-on-surface leading-relaxed max-w-prose">{job.description}</p>
            </div>
          )}
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/10">
          <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">how_to_reg</span>
            Apply for this Job
          </h2>
          
          <form id="apply-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">person</span>
                <input type="text" required placeholder="e.g. Ramesh Kumar" value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">call</span>
                <input type="tel" required placeholder="e.g. 9876543210" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center justify-between">
                <span>Current Location <span className="text-red-500">*</span></span>
                <button type="button" onClick={getCurrentLocation} disabled={locating} className="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs disabled:opacity-50 transition-colors">
                  {locating ? <span className="w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[14px]">my_location</span>}
                  Use GPS
                </button>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">location_on</span>
                <input type="text" required placeholder="e.g. Nashik, Maharashtra" value={candidateLocation} onChange={e => setCandidateLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">Notes / Experience (Optional)</label>
              <textarea placeholder="Any relevant experience or tools you have..." value={skills} onChange={e => setSkills(e.target.value)} rows={3}
                className="w-full p-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface resize-none" />
            </div>

            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              <span className="material-symbols-outlined">send</span>
              Submit Application
            </button>
            <p className="text-xs text-center text-on-surface-variant mt-3">By applying, the farmer will see your contact details to reach out.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
