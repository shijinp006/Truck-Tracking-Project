import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('User is not authenticated');

        const response = await axios.get('/User/getprofile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data.data[0]); // Assuming you only have one user
        setLoading(false);
      } catch (err) {
        setError(
          err.response ? err.response.data.message : 'An error occurred'
        );
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/user';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-500 to-pink-500">
        <div className="text-lg font-semibold text-white animate-pulse">
          Loading Profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-500 to-pink-500">
        <div className="text-sm font-medium text-red-100 bg-red-700 px-6 py-2 rounded-lg shadow-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md flex flex-col items-center space-y-6">
        {/* Profile Image */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500">
          <img
            src="https://via.placeholder.com/200"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Details */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-gray-800">
            {profile.name}
          </h1>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-indigo-500">Phone:</span>{' '}
            {profile.phoneNumber}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-indigo-500">
              Received Credit:
            </span>{' '}
            {profile.creditpoint}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-indigo-500">
              Rdeemed Credit:
            </span>{' '}
            {profile.creditpointreceived}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-indigo-500">
              Balance Credit:
            </span>{' '}
            {profile.creditpoint - profile.creditpointreceived}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center w-full">
          <button
            className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transform hover:scale-105 transition-all duration-200"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
