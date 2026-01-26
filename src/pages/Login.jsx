// import { useMsal } from "@azure/msal-react";
// import { loginRequest } from "./authConfig";
import logo from "../assets/MARCA_BEMOL.svg";

import { useState } from "react";

const LoginScreen = () => {
  const [email, setEmail] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica de autenticação
    alert(`Email: ${email}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded shadow-md flex flex-col items-center">
        <img src={logo} alt="Logo" className="w-24 h-24 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Bem-vindo ao Rota Segura</h2>
        <p className="text-gray-600 mb-6 text-center">Use seu e-mail corporativo Bemol para acessar o sistema</p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
            <label className="font-bold" htmlFor="email" >E-mail*</label>
          <input
            type="email"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="E-mail do colaborador"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Continuar com SSO
          </button>

        </form>
      </div>
      <footer className="mt-8 text-xs text-gray-400">© Bemolthon RH - 2026</footer>
    </div>
  );
};

export default LoginScreen;