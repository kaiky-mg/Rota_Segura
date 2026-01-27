import React from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import logo from "../assets/MARCA_BEMOL.svg";

const LoginScreen = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
        console.error(e);
    });
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded shadow-md flex flex-col items-center">
        <img src={logo} alt="Logo" className="w-24 h-24 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Bem-vindo ao Rota Segura</h2>
        <p className="text-gray-600 mb-6 text-center">Use seu e-mail corporativo Bemol para acessar o sistema</p>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors"
        >
          Continuar com SSO Microsoft
        </button>
      </div>
      <footer className="mt-8 text-xs text-gray-400">© Bemolthon RH - 2026</footer>
    </div>
  );
};

export default LoginScreen;