import React, { useState } from 'react';
import logoBemol from '../assets/MARCA_BEMOL.svg';

const Login = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add login logic here
    console.log('Email:', email, 'Password:', password);
  };

  const handleSSOLogin = () => {
    // Add SSO login logic here
    console.log('SSO Login initiated');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-4 px-6 flex items-center">
        <img src={logoBemol} alt="Bemol Logo" className="h-8 mr-4" />
      </header>
      <div className="flex flex-1 items-center justify-center  ">
        <div className="bg-white p-25 z-10  shadow-2xl w-full max-w-md rounded-lg shadow-">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </form>
          <button
            onClick={handleSSOLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login with SSO
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;