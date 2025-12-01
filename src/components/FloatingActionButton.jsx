import React from 'react';

function FloatingActionButton({ onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-80 right-5 z-[1000] bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition"
    >
      {icon && <span className="mr-2">{icon}</span>}
    </button>
  );
}40

export default FloatingActionButton;