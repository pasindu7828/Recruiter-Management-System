import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableHeader from './../../components/candidates/TableHeader';
import TableControls from './../../components/candidates/TableControls';
import CandidateList from './../../components/candidates/CandidateList';
import Layout from '../../components/layout/Layout';

export default function CandidateListPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiVersion = import.meta.env.VITE_API_VERSION;

  useEffect(() => {
    const fetchAndFilterData = async () => {
      try {
        setLoading(true);
        
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const recruiterId = storedUser?.id || storedUser?._id;

        if (!recruiterId) {
          setLoading(false);
          return;
        }

        const [jobsRes, appsRes, usersRes] = await Promise.all([
          axios.get(`${baseUrl}${apiVersion}/jobs`, { withCredentials: true }),
          axios.get(`${baseUrl}${apiVersion}/applications`, { withCredentials: true }),
          axios.get(`${baseUrl}${apiVersion}/users/candidates`, { withCredentials: true })
        ]);

        const jobsArray = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data.jobs || []);
        const appsArray = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data.applications || []);
        const allCandidatesArray = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.candidates || []);

        const myJobIds = jobsArray
          .filter(job => (job.postedBy?._id || job.postedBy) === recruiterId)
          .map(job => job._id);

        const myCandidateIds = appsArray
          .filter(app => {
             const appId = app.jobPostId?._id || app.jobPostId || app.job;
             return myJobIds.includes(appId);
          })
          .map(app => app.userId?._id || app.userId || app.candidate);

        const finalFilteredList = allCandidatesArray.filter(user => 
          myCandidateIds.includes(user._id)
        );

        setCandidates(finalFilteredList);

      } catch (error) {
        console.error("Filtering Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterData();
  }, [baseUrl, apiVersion]);

const filteredCandidates = candidates.filter((c) => {
  const cStatus = c.status ? c.status.toLowerCase() : 'applied'; 
  const sStatus = selectedStatus.toLowerCase();

  const matchesStatus = 
    selectedStatus === 'All Status' || 
    cStatus === sStatus;

  const matchesSearch = 
    !searchQuery || 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase());

  return matchesStatus && matchesSearch;
});

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
       <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-slate-500 font-bold font-sans">Finding candidates for your jobs...</p>
    </div>
  );

  return (
    <Layout>
      <div className="p-12 bg-slate-50 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          <TableHeader 
             title="My Candidates" 
             showAddButton={false}
          />
          
          <TableControls 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
            showCreateButton={false}
          />
          
          <CandidateList 
            candidates={filteredCandidates} 
            resetFilters={() => {setSearchQuery(''); setSelectedStatus('All Status');}} 
          />
        </div>
      </div>
    </Layout>
  );
}