import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateTrip = () => {
  const [drivers, setDrivers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]); // Added state for vehicles
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tripfrom: '',
    tripto: '',
    status: 'created',
    tripmode: '',
    category: '',
    remark: '',
    mileage: '',
    driverid: '',
    count: 1, // Default count
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authorization token is missing');
        return;
      }

      try {
        // Perform all API calls concurrently
        const [driversRes, categoriesRes, vehiclesRes] = await Promise.all([
          axios.get('/Admin/getuser', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/Admin/getcategory', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/Admin/getVehicle', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Check responses and update state
        if (driversRes.data.success) setDrivers(driversRes.data.data);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
        if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Token expired or unauthorized
          Swal.fire({
            icon: 'error',
            title: 'Session expired',
            text: 'Your session has expired. Please log in again.',
            showConfirmButton: false,
            timer: 3000,
          });

          // Redirect to login page
          setTimeout(() => {
            window.location.href = '/';
          }, 3000); // Delay for the alert
        } else {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();

    // Clean-up function (optional)
    return () => {
      setDrivers([]);
      setCategories([]);
      setVehicles([]);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    try {
      const response = await axios.post('/Admin/createtrip', form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Trip created successfully',
        });
        navigate('/admin/*'); // Adjust the navigation path as needed
      } else if (response.status === 400) {
        Swal.fire({
          icon: 'error',
          title: 'Vehicle Number Error',
          text: response.data.message,
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or unauthorized
        Swal.fire({
          icon: 'error',
          title: 'Session expired',
          text: 'Your session has expired. Please log in again.',
          showConfirmButton: false,
          timer: 3000,
        });
        localStorage.removeItem('token'); // Clear the invalid token
        window.location
          // Redirect to login page
          .setTimeout(() => {
            window.location.href = '/'; // Adjust the login path as needed
          }, 3000); // Delay to display the message before redirecting
      } else {
        console.error(
          'Error creating trip:',
          error.response?.data || error.message
        );
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text:
            error.response?.data?.message ||
            'There was an error creating the trip.',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Light gray background color */}
      <form
        onSubmit={handleSubmit}
        className="p-6 max-w-3xl mx-auto bg-gray-400 shadow-lg rounded-lg"
      >
        <h1 className="text-xl font-bold mb-6 text-gray-800">Create Trip</h1>

        {/* First row: From, To, Count */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'tripfrom', label: 'Trip From' },
            { name: 'tripto', label: 'Trip To' },
            { name: 'count', label: 'Number of Trips' },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="block mb-2 text-gray-700">{field.label}</label>
              {field.name === 'count' ? (
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="border p-2 rounded-lg w-full"
                  min="1"
                  placeholder="Enter number of trips"
                  required
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="border p-2 rounded-lg w-full"
                  required
                />
              )}
            </div>
          ))}
        </div>

        {/* Second row: Status, Trip Mode */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="block mb-2 text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
              required
            >
              <option value="created">Created</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-gray-700">Trip Mode</label>
            <select
              name="tripmode"
              value={formData.tripmode}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            >
              <option value="">Select</option>
              <option value="empty">Empty</option>
              <option value="load">Load</option>
            </select>
          </div>
        </div>

        {/* Third row: Category, Remark, Assign Driver */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="block mb-2 text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            >
              <option value="">Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-gray-700">Remark</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-gray-700">Assign Driver</label>
            <select
              name="driverid"
              value={formData.driverid}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
              required
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.name}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="bg-red-400 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition-colors"
        >
          Create Trip
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;
