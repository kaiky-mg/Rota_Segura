import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';

import PaginaPrincipal from './pages/PaginaPrincipal';
import EscolherTrajeto from './pages/EscolherTrajeto';
import LoginScreen from './pages/Login';
import AuthenticatedLayout from './components/AuthenticatedLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthenticatedTemplate>
        <Routes>
          <Route element={<AuthenticatedLayout />}>
            <Route index element={<EscolherTrajeto />} />
            <Route path="/rota" element={<PaginaPrincipal />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </UnauthenticatedTemplate>
    </BrowserRouter>
  );
}

export default App;