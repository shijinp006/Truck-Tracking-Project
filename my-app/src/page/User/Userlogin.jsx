import React, { useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios

const UserLogin = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if userId is provided
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
        password: password.trim(),
      });

      toast.dismiss('login'); // Dismiss loading toast

      if (response.status === 200) {
        const { token } = response.data; // Extract token from response

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
            background: '#F0F4C3',
          });

          // Redirect to user dashboard
          navigate('/user/dashboard');
        }
      }
    } catch (error) {
      toast.dismiss('login'); // Dismiss loading toast
      console.error('Login error:', error);

      // Handle specific errors using a reusable function
      handleError(error);
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  // Reusable error handling function
  const handleError = (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Invalid password
        showAlert('Invalid Password', 'Please try again.', 'error');
      } else if (status === 404) {
        // Invalid UserID
        showAlert('Invalid UserID', 'Please try again.', 'error');
      } else {
        // Generic server error
        showAlert(
          'Server Error',
          'Something went wrong. Please try again later.',
          'error'
        );
      }
    } else {
      // Network or other errors
      showAlert(
        'Network Error',
        'Unable to reach the server. Please check your connection.',
        'error'
      );
    }
  };

  // Reusable SweetAlert2 alert function
  const showAlert = (title, message, icon) => {
    Swal.fire({
      title: `<strong>${title}</strong>`,
      html: `<p>${message}</p>`,
      icon: icon,
      iconColor: icon === 'error' ? '#F44336' : '#4CAF50',
      confirmButtonText: 'Retry',
      confirmButtonColor: '#EF5350',
    });
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
          <div className="mb-4">
            <label
              htmlFor="userId"
              className="block text-gray-600 font-medium mb-2"
            >
              Enter your password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
