import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [licenseDoc, setLicenseDoc] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request using Axios
      await axios.post(
        '/Admin/adduser',
        {
          phoneNumber,
          name,
          password,
          licenseDoc,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Show success notification
      toast.success(`User ${name} has been created successfully!`);

      // Reset the form fields after success
      setName('');
      setPhoneNumber('');
      setLicenseDoc('');
    } catch (error) {
      if (error.response?.status === 401) {
        // Handle token expiration
        toast.error('Session expired. Redirecting to login page...');
        localStorage.removeItem('token'); // Clear the invalid token

        // Redirect to login and reload the page
        setTimeout(() => {
          window.location.href = '/'; // Replace with your login page route
        }, 3000); // Allow time for the message to display
      } else {
        // Show error notification for other errors
        toast.error(
          `Failed to create user: ${
            error.response ? error.response.data.message : error.message
          }`
        );

        // Redirect to the create-user page on error
        navigate('/admin/create-user'); // Adjust the route if necessary
      }
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center"
      style={{
        backgroundImage:
          "url('https://source.unsplash.com/1600x900/?truck,logistics')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />{' '}
      {/* Add Toaster component */}
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full bg-opacity-75">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          Create User
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">License Document</label>
            <input
              type="text"
              value={licenseDoc}
              onChange={(e) => setLicenseDoc(e.target.value)}
              className="w-full p-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-400 text-white px-3 py-1 rounded hover:bg-red-500 transition-colors duration-200"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
