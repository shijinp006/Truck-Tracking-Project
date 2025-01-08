import React, { useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios

const UserLogin = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId.trim()) {
      toast.error('UserID is required!');
      return;
    }

    try {
      setLoading(true); // Show loading state
      toast.loading('Logging in...', { id: 'login' }); // Show loading toast

      // Axios POST request
      const response = await axios.post('/User/userlogin', {
        userId: userId.trim(),
      });

      toast.dismiss('login'); // Dismiss loading toast

      if (response.status === 200) {
        const { token } = response.data; // Assuming response includes the token

        if (token) {
          // Save token to localStorage
          localStorage.setItem('jwtToken', token);

          // Show success alert with SweetAlert2
          await Swal.fire({
            title: '<strong>Login Successful!</strong>',
            html: '<p>Welcome to your dashboard!</p>',
            icon: 'success',
            iconColor: '#4CAF50',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            willClose: () => navigate('/user/dashboard'), // Redirect to user dashboard after success
            background: '#F0F4C3',
          });
        }
      }
    } catch (error) {
      toast.dismiss('login'); // Dismiss loading toast
      console.error('Login error:', error);

      // Handle 404 or other errors specifically
      if (error.response) {
        if (error.response.status === 404) {
          Swal.fire({
            title: '<strong>Error!</strong>',
            html: '<p>Invalid UserID. Please try again.</p>',
            icon: 'error',
            iconColor: '#F44336',
            confirmButtonText: 'Retry',
            confirmButtonColor: '#EF5350',
          });
        } else {
          // Handle other server errors
          Swal.fire({
            title: '<strong>Server Error!</strong>',
            html: '<p>Something went wrong. Please try again later.</p>',
            icon: 'error',
            iconColor: '#F44336',
            confirmButtonText: 'Retry',
            confirmButtonColor: '#EF5350',
          });
        }
      } else {
        // In case of network or other issues
        Swal.fire({
          title: '<strong>Error!</strong>',
          html: '<p>Unable to reach the server. Please try again later.</p>',
          icon: 'error',
          iconColor: '#F44336',
          confirmButtonText: 'Retry',
          confirmButtonColor: '#EF5350',
        });
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-500">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="userId"
              className="block text-gray-600 font-medium mb-2"
            >
              Enter your UserID
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UserID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} transition-colors duration-200`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <Toaster />
      </div>
    </div>
  );
};

export default UserLogin;
