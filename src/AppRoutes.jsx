import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PaginaPrincipal from './pages/PaginaPrincipal';
import EscolherTrajeto from './pages/EscolherTrajeto';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EscolherTrajeto />} />
        <Route path="/rota" element={<PaginaPrincipal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
