import React from 'react';

function FloatingActionButton({ onClick, icon, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`z-[1000] bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
    </button>
  );
}

export default FloatingActionButton;