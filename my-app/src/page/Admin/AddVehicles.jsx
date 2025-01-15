import React, { useState } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const AddVehicle = () => {
  const [vehicleData, setVehicleData] = useState({
    vehicleNumber: '',
    vehicleName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setVehicleData({ ...vehicleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/Admin/addvehicle', vehicleData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      toast.success('🚛 Vehicle added successfully!', { duration: 3000 });
      setVehicleData({ vehicleNumber: '', vehicleName: '' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle token expiration
        toast.error('❌ Session expired. Please log in again.', {
          duration: 3000,
        });
        localStorage.removeItem('token'); // Clear the invalid token
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/';
        }, 3000); // Wait for the toast to finish before redirecting
      } else {
        toast.error(
          '❌ Error adding vehicle! Please check if the vehicle already exists.',
          {
            duration: 3000,
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://source.unsplash.com/1600x900/?truck,logistics')",
      }}
    >
      <div className="bg-black bg-opacity-75 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md md:max-w-lg lg:max-w-xl">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white text-center">
          Add Vehicle
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm md:text-base font-bold mb-2">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={vehicleData.vehicleNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder="Enter vehicle number"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm md:text-base font-bold mb-2">
              Vehicle Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vehicleName"
              value={vehicleData.vehicleName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder="Enter vehicle name"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-700 text-sm sm:text-base ${
              loading ? 'bg-gray-500' : 'bg-gray-700 hover:bg-gray-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
          </button>
        </form>
      </div>

      {/* Toaster component for notifications */}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default AddVehicle;
