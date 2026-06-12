import React from 'react';

const StatusStepper = ({ currentStatus, steps }) => {
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between w-full relative px-10">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step} className="flex flex-col items-center relative z-10 flex-1">
            
            {/* --- LEFT CONNECTOR LINE --- */}
            {index !== 0 && (
              <div className={`absolute left-0 right-1/2 h-[3px] top-5 -translate-y-1/2 -z-10 transition-colors duration-500
                ${index <= currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} 
              />
            )}

            {/* --- RIGHT CONNECTOR LINE --- */}
            {index !== steps.length - 1 && (
              <div className={`absolute left-1/2 right-0 h-[3px] top-5 -translate-y-1/2 -z-10 transition-colors duration-500
                ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} 
              />
            )}
            
            {/* Step Circle Visuals */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
              ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                isActive ? 'bg-white border-blue-600 ring-4 ring-blue-50' : 
                'bg-white border-gray-200'}`}>
              
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`} />
              )}
            </div>

            {/* Stage Label */}
            <span className={`mt-3 text-[10px] uppercase tracking-tighter font-black text-center leading-tight transition-colors duration-300
              ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StatusStepper;