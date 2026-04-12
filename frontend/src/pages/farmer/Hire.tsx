import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../../lib/api';
import { usePersistentState } from '../../hooks/usePersistentState';
import { useVoice } from '../../context/VoiceContext';

interface JobApplication {
  id: string;
  job_id: string;
  name: string;
  phone: string;
  skills: string;
  candidate_location?: string;
  lat?: number;
  lng?: number;
  applied_at: string;
}

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
  created_at: string;
  applications: JobApplication[];
}

function calculateDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function FarmerHire() {
  const [jobs, setJobs] = useState<HireJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<HireJob | null>(null);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = usePersistentState('hire_title', '');
  const [location, setLocation] = usePersistentState('hire_location', '');
  const [wage, setWage] = usePersistentState('hire_wage', '');
  const [workersNeeded, setWorkersNeeded] = usePersistentState<number | string>('hire_workers', '');
  const [workDate, setWorkDate] = usePersistentState('hire_date', '');
  const [description, setDescription] = usePersistentState('hire_desc', '');
  const [locating, setLocating] = useState(false);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const farmerId = user.id;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<HireJob[]>(`/farmers/hiring?farmer_id=${farmerId}`);
      setJobs(data);
      if (data.length > 0) {
        if (selectedJob) {
          const updated = data.find(j => j.id === selectedJob.id);
          setSelectedJob(updated || data[0]);
        } else {
          setSelectedJob(data[0]);
        }
      } else {
        setSelectedJob(null);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmerId) fetchJobs();
  }, [farmerId]);

  // ── Refs so voice callback always sees fresh state ──
  const titleRef = useRef(title);
  const locationRef = useRef(location);
  const wageRef = useRef(wage);
  const workersNeededRef = useRef(workersNeeded);
  const dateRef = useRef(workDate);
  const descriptionRef = useRef(description);
  const latRef = useRef(lat);
  const lngRef = useRef(lng);
  const jobsRef = useRef(jobs);

  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { wageRef.current = wage; }, [wage]);
  useEffect(() => { workersNeededRef.current = workersNeeded; }, [workersNeeded]);
  useEffect(() => { dateRef.current = workDate; }, [workDate]);
  useEffect(() => { descriptionRef.current = description; }, [description]);
  useEffect(() => { latRef.current = lat; }, [lat]);
  useEffect(() => { lngRef.current = lng; }, [lng]);
  useEffect(() => { jobsRef.current = jobs; }, [jobs]);

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
          setLocation(data.display_name);
        } else {
          setLocation(`${latitude}, ${longitude}`);
        }
      } catch (err) {
        setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
      } finally {
        setLocating(false);
      }
    }, () => {
      alert("Unable to retrieve your location");
      setLocating(false);
    });
  };

  // ── Voice Control ──
  const HIRE_SCHEMA = `{
    "action": "SET_FIELDS" | "OPEN_CREATE_FORM" | "SUBMIT_JOB" | "USE_GPS" | "DELETE_LATEST" | "SELECT_JOB",
    "fields": {
      "title": "string or null",
      "location": "string or null",
      "wage": "string or null",
      "workersNeeded": "string or null",
      "date": "YYYY-MM-DD string or null",
      "description": "string or null"
    },
    "detectedLanguage": "BCP-47 language code of the user's speech, e.g. hi-IN, en-IN, mr-IN"
  }`;

  const handleVoiceIntent = useCallback((intent: any) => {
    if (!intent) return;
    
    const filledFields: string[] = [];
    const applyFields = (fields: any) => {
      if (!fields) return;
      if (fields.title)         { setTitle(fields.title);                        filledFields.push(`title`); }
      if (fields.location)      { setLocation(fields.location);                  filledFields.push(`location`); }
      if (fields.wage)          { setWage(String(fields.wage));                  filledFields.push(`wage`); }
      if (fields.workersNeeded) { setWorkersNeeded(String(fields.workersNeeded)); filledFields.push(`workers`); }
      if (fields.date)          { setWorkDate(fields.date);                      filledFields.push(`date`); }
      if (fields.description)   { setDescription(fields.description);            filledFields.push(`description`); }
    };

    switch (intent.action) {
      case 'SET_FIELDS':
      case 'OPEN_CREATE_FORM': {
        setShowCreateForm(true);
        applyFields(intent.fields);
        const hasFields = filledFields.length > 0;
        showVoiceToast(hasFields ? `✅ Form filled — ${filledFields.length} fields` : '📋 Form opened');
        break;
      }
      case 'SUBMIT_JOB': {
        applyFields(intent.fields);
        setTimeout(async () => {
          const t = titleRef.current;
          if (!t) { showVoiceToast('⚠️ Please say a job title first!'); return; }
          try {
            const newJob = await apiFetch<HireJob>('/farmers/hiring', {
              method: 'POST',
              body: JSON.stringify({
                farmer_id: farmerId,
                title: t,
                location: locationRef.current,
                lat: latRef.current,
                lng: lngRef.current,
                wage: wageRef.current,
                workers_needed: workersNeededRef.current,
                work_date: dateRef.current,
                description: descriptionRef.current
              })
            });
            setJobs(prev => [newJob, ...prev]);
            setSelectedJob(newJob);
            setShowCreateForm(false);
            setTitle(''); setLocation(''); setWage(''); setWorkersNeeded(''); setWorkDate(''); setDescription('');
            setLat(undefined); setLng(undefined);
            showVoiceToast('✅ Job published successfully!');
          } catch (e: any) {
            showVoiceToast(`❌ Error: ${e.message}`);
          }
        }, 150);
        break;
      }
      case 'USE_GPS':
        showVoiceToast('📍 Getting your GPS location...');
        getCurrentLocation();
        break;
      case 'DELETE_LATEST': {
        const currentJobs = jobsRef.current;
        if (currentJobs.length > 0) {
          // Ideally this should use apiFetch DELETE endpoint (if it exists)
          // For now, let's keep it local or make a delete API call
          showVoiceToast(`🗑️ Deletion currently disabled for safety.`);
        } else {
          showVoiceToast('⚠️ No jobs to delete.');
        }
        break;
      }
      case 'SELECT_JOB': {
        const currentJobs = jobsRef.current;
        if (intent.fields?.title) {
          const found = currentJobs.find((j: HireJob) => j.title.toLowerCase().includes(intent.fields.title.toLowerCase()));
          if (found) { setSelectedJob(found); showVoiceToast(`👆 Selected job "${found.title}"`); }
          else showVoiceToast(`⚠️ No job found matching "${intent.fields.title}"`);
        }
        break;
      }
    }
  }, []);

  useVoice(HIRE_SCHEMA, handleVoiceIntent);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // apiFetch returns parsed JSON directly — treat response as the new job
      const newJob = await apiFetch<HireJob>('/farmers/hiring', {
        method: 'POST',
        body: JSON.stringify({
          farmer_id: farmerId,
          title,
          location,
          lat,
          lng,
          wage,
          workers_needed: workersNeeded,
          work_date: workDate,
          description
        })
      });

      // Clear persistence
      const keys = ['hire_title', 'hire_location', 'hire_wage', 'hire_workers', 'hire_date', 'hire_desc'];
      keys.forEach(k => localStorage.removeItem(k));

      setJobs(prev => [newJob, ...prev]);
      setSelectedJob(newJob);
      setShowCreateForm(false);

      // Reset form
      setTitle('');
      setLocation('');
      setWage('');
      setWorkersNeeded('');
      setWorkDate('');
      setDescription('');
      setLat(undefined);
      setLng(undefined);
    } catch (err) {
      console.error('Failed to create job:', err);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await apiFetch(`/farmers/hiring/${id}`, { method: 'DELETE' });
      const updatedJobs = jobs.filter(j => j.id !== id);
      setJobs(updatedJobs);
      if (selectedJob?.id === id) {
        setSelectedJob(updatedJobs.length > 0 ? updatedJobs[0] : null);
      }
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  // Generate Link
  const applyLink = selectedJob ? `${window.location.origin}/apply/${selectedJob.id}` : '';
  const qrCodeUrl = applyLink ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(applyLink)}` : '';

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

      {/* Voice Action Toast */}
      {voiceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] bg-gray-900/95 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slideUp whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px] text-green-400">mic</span>
          {voiceToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary-600">group_add</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface">Hire Workers</h1>
          </div>
          <p className="text-on-surface-variant text-sm sm:text-base">Generate public links and QR codes to hire field workers, harvesters, and more.</p>
        </div>
        {!showCreateForm && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Job
          </button>
        )}
      </div>

      {showCreateForm ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/20 mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-600">assignment</span>
              Job Details
            </h2>
            <button onClick={() => setShowCreateForm(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-red-50 hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Job Title <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">work</span>
                  <input type="text" required placeholder="e.g. Tomato Harvester" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant flex items-center justify-between">
                  <span>Location / Farm Field <span className="text-red-500">*</span></span>
                  <button type="button" onClick={getCurrentLocation} disabled={locating} className="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs disabled:opacity-50 transition-colors">
                    {locating ? <span className="w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[14px]">my_location</span>}
                    Use GPS
                  </button>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">location_on</span>
                  <input type="text" required placeholder="e.g. Field B, North Farm" value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Wage (₹) / Day <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant/50">₹</span>
                  <input type="number" required placeholder="e.g. 500" value={wage} onChange={e => setWage(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Workers Needed <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">groups</span>
                  <input type="number" required placeholder="e.g. 5" value={workersNeeded} onChange={e => setWorkersNeeded(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Date of Work <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="date" required value={workDate} onChange={e => setWorkDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">Description / Requirements</label>
              <textarea placeholder="e.g. Need experience with tomato harvesting. Bring water. Tools will be provided." value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full p-4 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface resize-none" />
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                Generate & Publish
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* List of Jobs */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-bold font-headline text-on-surface">Active Jobs</h3>
            {jobs.length === 0 ? (
              <div className="bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant/60 mb-2">work_off</span>
                <p className="text-on-surface-variant text-sm font-medium">No active jobs yet.</p>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-primary-600 font-bold text-sm hover:underline"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div 
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      selectedJob?.id === job.id 
                      ? 'border-primary-500 bg-primary-50 shadow-sm' 
                      : 'border-outline-variant/20 bg-white hover:border-primary-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold ${selectedJob?.id === job.id ? 'text-primary-800' : 'text-on-surface'}`}>
                        {job.title}
                      </h4>
                      <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">
                        {new Date(job.work_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm mt-2 text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="truncate max-w-[100px]">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                        <span>₹{job.wage}/day</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Details, QR and Applicants */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <div className="space-y-6">
                
                {/* QR and Share Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row gap-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-primary-600" />
                  
                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold font-headline text-on-surface">{selectedJob.title}</h2>
                        <div className="flex items-center gap-1.5 text-on-surface-variant mt-1.5 font-medium">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          {selectedJob.location}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteJob(selectedJob.id)}
                        className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                        title="Delete Job"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Wage</span>
                        <span className="font-bold text-on-surface">₹{selectedJob.wage} / day</span>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Workers Needed</span>
                        <span className="font-bold text-on-surface">{selectedJob.workers_needed}</span>
                      </div>
                    </div>

                    <div className="bg-surface-container-highest p-4 rounded-xl flex items-center justify-between gap-3 border border-outline-variant/30 group hover:border-primary-300 transition-colors">
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-on-surface-variant block mb-0.5">Application Link</span>
                        <span className="text-sm font-medium text-primary-700 truncate block">{applyLink}</span>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(applyLink);
                          alert('Link copied!');
                        }}
                        className="shrink-0 w-10 h-10 rounded-xl bg-white border border-outline-variant/30 text-on-surface-variant hover:text-primary-600 hover:border-primary-300 flex items-center justify-center transition-all"
                        title="Copy Link"
                      >
                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Image */}
                  <div className="shrink-0 flex flex-col items-center justify-center bg-surface-container-lowest p-4 rounded-2xl border border-dashed border-outline-variant/40">
                    <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 rounded-lg" />
                    <span className="text-xs font-bold text-on-surface-variant mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                      Scan to Apply
                    </span>
                  </div>
                </div>

                {/* Applicants Section */}
                <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant/20 shadow-sm">
                  <h3 className="text-lg font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-600 text-[22px]">how_to_reg</span>
                    Applications ({selectedJob.applications?.length || 0})
                  </h3>

                  {(!selectedJob.applications || selectedJob.applications.length === 0) ? (
                    <div className="text-center py-6 text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                      <p className="text-sm">No applications yet. Share the QR or link!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant/20">
                            <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">Name</th>
                            <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">Phone</th>
                            <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">Skills/Notes</th>
                            <th className="py-3 px-4 font-bold text-on-surface-variant text-sm">Applied At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedJob.applications.map(app => (
                            <tr key={app.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                              <td className="py-3 px-4 text-sm font-bold text-on-surface">
                                {app.name}
                                {app.candidate_location && (
                                  <div className="flex items-center gap-0.5 text-xs font-normal text-on-surface-variant mt-0.5" title={app.candidate_location}>
                                    <span className="material-symbols-outlined text-[12px]">my_location</span>
                                    <span className="truncate max-w-[120px]">{app.candidate_location}</span>
                                    {calculateDistance(selectedJob.lat, selectedJob.lng, app.lat, app.lng) && (
                                      <span className="text-primary-600 font-bold ml-0.5">
                                        ({calculateDistance(selectedJob.lat, selectedJob.lng, app.lat, app.lng)} km)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-primary-700">
                                <a href={`tel:${app.phone}`} className="flex items-center gap-1 hover:underline">
                                  <span className="material-symbols-outlined text-[16px]">call</span>
                                  {app.phone}
                                </a>
                              </td>
                              <td className="py-3 px-4 text-sm text-on-surface-variant">{app.skills || '-'}</td>
                              <td className="py-3 px-4 text-sm text-on-surface-variant">
                                {new Date(app.applied_at).toLocaleDateString()} {new Date(app.applied_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/50 flex flex-col items-center justify-center p-10 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline-variant/50 mb-4">touch_app</span>
                <p className="text-on-surface-variant font-medium text-lg">Select a job to view details and applications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
