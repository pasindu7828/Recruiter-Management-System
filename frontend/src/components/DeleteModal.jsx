import React from 'react';

const DeleteModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[1.25rem] shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-300">
        <h3 className="text-[1.15rem] font-bold text-gray-800 mb-2 leading-tight">
          Are you sure you want to delete this interview?
        </h3>
        <p className="text-gray-400 text-sm font-medium mb-10">
          This action cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-4 px-2">
          <button 
            onClick={onCancel} 
            className="px-6 py-3 bg-[#ebedf1] text-gray-900 rounded-xl hover:bg-gray-200 font-bold transition-all text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-6 py-3 bg-[#e11d48] text-white rounded-xl hover:bg-red-700 font-bold transition-all text-sm shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
