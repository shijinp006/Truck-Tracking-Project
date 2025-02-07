import React, { useState } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import truck from '../../page/public/vecteezy_a-delivery-van-with-many-different-cardboard-boxes-side_49138426.jpg';

const FinanceAuthTemplate = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/Admin/financelogin', {
        loginEmail,
        loginPassword,
      });

      toast.success('Login Successful!');
      localStorage.setItem('token', response.data.token); // Store JWT token
      navigate('/finance/*');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#FEFEFE',
      }}
    >
      <Toaster position="top-center" />
      <div className="flex flex-col lg:flex-row w-full max-w-screen-xl relative">
        {/* Left Side */}
        <div className="hidden lg:flex w-full lg:w-1/2 justify-center items-center p-4">
          <img
            src={truck}
            alt="truck"
            className="w-3/4 h-auto object-contain" // Ensures image scales correctly
          />
        </div>

        {/* Right Side: Transparent Form */}
        <div className="w-full lg:w-1/3 flex justify-center items-center p-6 sm:p-4 relative">
          <div
            className="relative backdrop-blur-lg shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md"
            style={{
              backgroundImage: `linear-gradient(#E6E4D8, #BC8753)`,
              opacity: 0.95,
            }}
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center text-black mb-6">
              Login
            </h2>

            <form onSubmit={handleLoginSubmit} className="w-full">
              <div className="mb-4">
                <label className="block text-black text-sm sm:text-base font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-600 transition duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-black text-sm sm:text-base font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-600 transition duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-orange-600 text-white py-3 sm:py-4 px-5 rounded-xl shadow-lg transition-all duration-300"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceAuthTemplate;
