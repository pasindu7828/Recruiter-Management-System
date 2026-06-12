import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Briefcase, User, ArrowUpRight } from 'lucide-react';

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'hired': return 'bg-emerald-100/50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    case 'rejected': return 'bg-rose-100/50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
    case 'interview': return 'bg-amber-100/50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    default: return 'bg-indigo-100/50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20';
  }
};

const CandidateList = ({ candidates, resetFilters }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("--- Detailed Candidate List ---");
    console.table(candidates.map(c => ({
      Name: c.name,
      Email: c.email,
      Phone: c.phone || 'N/A',
      Position: c.appliedJob || 'Software Engineer',
      Status: c.status || 'Applied'
    })));
  }, [candidates]);

  return (
    <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="overflow-hidden bg-white/80 backdrop-blur-md rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-8 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
              <th className="px-6 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest">Email Address</th>
              <th className="px-6 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</th>
              <th className="px-6 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest">Applied Position</th>
              <th className="px-6 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {candidates.map((c) => (
              <tr 
                key={c._id} 
                onClick={() => navigate(`/profile/${c._id}`)}
                className="group cursor-pointer hover:bg-indigo-50/30 transition-all duration-300"
              >
                {/* 1. Candidate Column */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform duration-300">
                        <User size={20} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-[15px] group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                        {c.name}
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">ID: {c._id?.slice(-8).toUpperCase()}</div>
                    </div>
                  </div>
                </td>

                {/* 2. Email Address */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5 text-slate-600 text-sm font-medium">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors">
                      <Mail size={14} />
                    </div>
                    {c.email}
                  </div>
                </td>

                {/* 3. Phone Number */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5 text-slate-600 text-sm font-medium">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors">
                      <Phone size={14} />
                    </div>
                    {c.phone || '+94 7X XXX XXXX'}
                  </div>
                </td>

                {/* 4. Applied Position */}
                <td className="px-6 py-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold group-hover:border-indigo-100 group-hover:bg-indigo-50/50 transition-all">
                    <Briefcase size={14} className="text-indigo-500" />
                    {c.appliedJob || 'Software Engineer'}
                  </div>
                </td>

                {/* 5. Status */}
                <td className="px-6 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.1em] ${getStatusStyles(c.status)}`}>
                    {c.status || 'Applied'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {candidates.length === 0 && (
        <div className="p-24 text-center bg-white/50 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-slate-200 mt-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
             <User size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Candidates Found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">We couldn't find any candidates matching your criteria at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default CandidateList;