import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react'; 

const TableHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Candidates</h1>
        <p className="text-slate-500 mt-1">Efficiently manage your global recruitment pipeline.</p>
      </div>
    </div>
  );
};

export default TableHeader;