import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Layout from '../../components/layout/Layout'; 
import StatusStepper from './components/StatusStepper';
import { STEPS, STATUS_DETAILS } from './statusData';

const ApplicationStatus = () => {
  const { jobPostId } = useParams();
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- TOGGLE THIS FOR LIVE TESTING ---
  const [isTestMode, setIsTestMode] = useState(false); 
  const [testStatus, setTestStatus] = useState("Applied");

  useEffect(() => {
    const fetchApplication = async () => {
      if (isTestMode) {
        // MOCK DATA WITH DYNAMIC STATUS FOR TESTING
        setTimeout(() => {
          setAppData({
            status: testStatus,
            updatedAt: new Date().toISOString(),
            userId: { name: "Sarah" },
            jobPostId: { jobTitle: "Software Engineer" },
            interview: {
              scheduled_date: "Saturday, March 21, 2026",
              scheduled_time: "2:00 PM",
              interviewType: "Online",
              meetingLink: "https://meet.google.com/abc-defg-hij"
            }
          });
          setLoading(false);
        }, 500);
      } else {
        try {
          setLoading(true);
          const baseUrl = import.meta.env.VITE_API_BASE_URL;
          const version = import.meta.env.VITE_API_VERSION;
          
          // Matches backend route: GET /api/v1/applications/getMyOne/:jobPostId
          const response = await axios.get(`${baseUrl}${version}/applications/getMyOne/${jobPostId}`, {
            withCredentials: true 
          });
          
          setAppData(response.data);
          setError(null);
        } catch (err) {
          console.error("Connection Error:", err);
          setError(err.response?.data?.message || "Could not find application.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (jobPostId) fetchApplication();
  }, [jobPostId, isTestMode, testStatus]);

  if (loading) return <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">Connecting to HireHub Server...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
  if (!appData) return <div className="p-10 text-center text-gray-500">No application data found.</div>;

  const currentContent = STATUS_DETAILS[appData.status] || STATUS_DETAILS["Applied"];
  const isRejected = appData.status === "Rejected";

  return (
    <Layout role="Candidate" active="Dashboard">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 bg-gray-50 min-h-screen pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 text-indigo-900">
              Hello, {appData.userId?.name || 'Candidate'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Status for: <span className="font-bold">{appData.jobPostId?.jobTitle}</span>
            </p>
          </div>
          <div className={`${currentContent.badgeColor} px-6 py-2 rounded-full font-bold shadow-sm text-sm uppercase tracking-wider`}>
             {appData.status}
          </div>
        </div>

        {/* Stepper Section (Hidden if Rejected to show a clean 'Sorry' message instead) */}
        {!isRejected ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Application Progress</h3>
            <StatusStepper currentStatus={appData.status} steps={STEPS.filter(s => s !== "Rejected")} />
          </div>
        ) : (
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-8 mb-8 text-center">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </div>
             <h2 className="text-2xl font-bold text-red-900">Application Unsuccessful</h2>
             <p className="text-red-700 mt-2 max-w-lg mx-auto">We appreciate your interest in the {appData.jobPostId?.jobTitle} position. Unfortunately, we will not be moving forward with your application at this time.</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Your Next Step</h3>
              <div className={`p-5 border-l-4 rounded-r-xl ${isRejected ? 'bg-gray-50 border-gray-300' : 'bg-indigo-50 border-indigo-500'}`}>
                <h4 className={`font-bold ${isRejected ? 'text-gray-700' : 'text-indigo-900'}`}>{currentContent.nextStepTitle}</h4>
                <p className={`text-sm mt-1 ${isRejected ? 'text-gray-600' : 'text-indigo-800'}`}>{currentContent.nextStepDesc}</p>
              </div>
              
              {/* Interview Component (Only shows if Scheduled and NOT rejected) */}
              {appData.status === "Interview Scheduled" && appData.interview && !isRejected && (
                <div className="mt-6 p-6 border rounded-xl bg-gray-50 border-indigo-100 animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm text-indigo-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 uppercase font-bold tracking-widest">Technical Interview</p>
                        <p className="text-lg font-bold text-gray-800">{appData.interview.scheduled_date}</p>
                        <p className="text-sm text-gray-600">{appData.interview.scheduled_time} ({appData.interview.interviewType})</p>
                      </div>
                   </div>
                   <a href={appData.interview.meetingLink} target="_blank" rel="noreferrer" className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md">
                      Join Meeting
                   </a>
                </div>
              )}
            </section>
          </div>

          <aside className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-800 mb-6 border-b pb-2">Timeline</h3>
             <div className="relative border-l-2 border-gray-100 ml-3 space-y-10 pb-4">
                <div className="relative pl-8">
                  <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-md ${isRejected ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <p className="text-sm font-bold text-gray-800">{currentContent.activity}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(appData.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
             </div>
          </aside>
        </div>
      </div>

      {/* --- UI TESTER (Floating at bottom for demo) --- */}
      {isTestMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border-2 border-indigo-600 p-2 rounded-xl shadow-2xl flex gap-2 z-[9999]">
          {STEPS.map(s => (
            <button 
              key={s} 
              onClick={() => setTestStatus(s)}
              className={`text-[10px] px-3 py-1 rounded-lg font-bold transition-all ${testStatus === s ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default ApplicationStatus;