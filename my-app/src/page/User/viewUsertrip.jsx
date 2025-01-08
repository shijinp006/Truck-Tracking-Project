import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const UserTripView = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [vehicle, setVehicles] = useState([]);
  const [showstarttripModel, setshowstarttripModel] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [savetrip, setsavetrip] = useState({
    meterbefore: '',
    vehiclenumber: '',
    meterbeforefile: '',
  });
  const [formData, setFormData] = useState({
    meterafter: '',
    fuel: ' ',
    invoicedoc: '',
    meterafterfile: '',
  });

  const fetchTrips = async () => {
    try {
      setLoading(true); // Show loading state
      setError(null); // Clear any previous errors

      const token = localStorage.getItem('jwtToken');
      if (!token) throw new Error('User is not authenticated');

      const response = await axios.get('/User/getusertrip', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        const trips = response.data.data;

        if (trips.length === 0) {
          setError('No trips available'); // Set error to show "No trips" message
        } else {
          setTrips(trips); // Update the state with fetched trips
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      setError();
      // err.response?.data?.message || err.message || 'Failed to fetch trips'
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  useEffect(() => {
    fetchTrips();
    getVehicleData();
  }, []);

  const fetchFilteredTrips = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('User is not authenticated');

    try {
      const response = await axios.get(`/User/filterdusertrip`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter },
      });

      if (response.data && response.data.data) {
        setFilteredTrips(response.data.data);
      }

      // Log the response data here, since it's inside the try block
      console.log(response.data, 'sd');
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  useEffect(() => {
    fetchFilteredTrips();
  }, [statusFilter]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target; // Get the id (filter type) and value of the selected filter

    // Reset page to 1 whenever a filter changes

    // Update the corresponding filter value based on the filter type (id)
    if (id === 'statusFilter') {
      setStatusFilter(value);
    }

    // // Call the function to fetch the filtered data
    // fetchFilteredData();
  };

  const getVehicleData = async () => {
    try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem('token');

      // Check if the token exists
      if (!token) {
        throw new Error('Authorization token is missing. Please log in again.');
      }

      // Make the API call to fetch vehicle data
      const response = await axios.get('/User/getvehicle', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response, 'res');

      // Handle successful response
      if (response.data && response.data.data) {
        setVehicles(response.data.data);
      }
      if (response.status === 200) {
        console.log(setVehicles, 'setveh');
        console.log('Vehicle data fetched successfully:', response.data);
        return response.data; // Return the data if needed
      } else {
        // Handle other status codes if needed
        throw new Error('Failed to fetch vehicle data.');
      }
    } catch (error) {
      // Handle errors with the API call or token issues
      console.error(
        'Error fetching vehicle data:',
        error.response?.data || error.message
      );

      // Display an error message to the user (SweetAlert or other UI alert method)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred.',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // If the input is a file, we handle it differently
    if (name === 'meterafterfile' || name === 'invoicedoc') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0], // Store the first file from the file input
      }));
    } else {
      // For other fields, we update the value normally
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleTripChange = (e) => {
    const { name, value, files } = e.target;
    setsavetrip((prevState) => ({
      ...prevState,
      [name]: name === 'meterbeforefile' ? files[0] : value,
    }));
  };

  const handleTakeTrip = async (trip) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('Token not found');
    setCurrentTrip(trip);
    setshowstarttripModel(true);
    // setshowstarttripModel(true);
  };

  const handleCancelTrip = async (trip) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) throw new Error('Token not found');

      // Cancel the trip
      await axios.post(
        `/User/usertripcancel/${trip.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the trips state to remove the canceled trip
      setFilteredTrips((prev) =>
        prev.map((trip) =>
          trip.id === trip.id ? { ...trip, status: ' pending' } : trip
        )
      );

      // Show success alert
    } catch (err) {
      Swal.fire(
        'Error',
        err.response?.data?.message || err.message || 'Failed to cancel trip',
        'error'
      );
    }
  };

  const handleCompleteTrip = (trip) => {
    setCurrentTrip(trip);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);
  const handleCloseModal2 = () => setshowstarttripModel(false);

  const handleSavetrips = async (tripId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Authorization Error',
          text: 'Authorization token not found. Please log in.',
        });
        throw new Error('Authorization token not found. Please log in.');
      }

      const formData = new FormData();
      for (const [key, value] of Object.entries(savetrip)) {
        formData.append(key, value);
      }

      await axios.post(`/User/tripassigned/${tripId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Close the modal
      setshowstarttripModel(false);

      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Trip Saved',
        text: 'The trip has been saved successfully!',
      });

      setFilteredTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId ? { ...trip, status: 'inprogress' } : trip
        )
      );
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.message === 'meterbeforefile is missing'
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please add the required image.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error Saving Trip',
          text:
            error.response?.data?.message ||
            error.message ||
            'An error occurred.',
        });
      }

      console.error('Error saving trip:', error.message || error);
      throw error;
    }
  };

  const handleUpdateTrip = async (currentTrip) => {
    if (
      !formData.meterafter ||
      !formData.fuel ||
      !formData.invoicedoc ||
      !formData.meterafterfile
    ) {
      Swal.fire('Error', 'All fields must be filled out!', 'error');
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => form.append(key, formData[key]));

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) throw new Error('Token not found');

      await axios.post(`/User/completeTrip/${currentTrip.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
        'Content-Type': 'multipart/form-data',
      });

      await Swal.fire('Success', 'Trip marked as completed!', 'success');
      window.location.reload();
    } catch (err) {
      Swal.fire(
        'Error',
        err.response?.data?.message || err.message || 'Failed to complete trip',
        'error'
      );
    }
  };

  const viewTripDetails = (trip) => {
    Swal.fire({
      title: 'Trip Details',
      html: `
        <div>
          <p><strong>From:</strong> ${trip.tripfrom || ''}</p>
          <p><strong>To:</strong> ${trip.tripto || ''}</p>
          <p><strong>Meterbefor:</strong> ${trip.meterbefore || '0'}</p>
          <p><strong>Meterafter:</strong> ${trip.meterafter || '0'}</p>
          <p><strong>Category:</strong> ${trip.category || ''}</p>
          <p><strong>CreditPoint:</strong> ${trip.credit || ''}</p>
       <p><strong>Date:</strong> ${new Date(trip.created_at).toLocaleDateString() || 'N/A'}</p>


        </div>
      `,
      confirmButtonText: 'Close',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
        <h1 className="text-3xl font-bold text-center py-6 text-gray-800">
          My Trips
        </h1>
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="statusFilter"
            style={{ marginRight: '10px', fontWeight: 'bold' }}
          >
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleFilterChange}
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          >
            <option value="">All</option>
            <option value="created">Created</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
            <option value="assigned">assigned</option>
            <option value="submitted">submitted</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-6">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
            <p className="text-gray-600 mt-3">Loading trips...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
            <strong className="font-bold">Error:</strong>{' '}
            <span className="block sm:inline">{error}</span>
          </div>
        ) : filteredTrips.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
                    <th className="py-4 px-6">Trip Details</th>
                    <th className="py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map((trip, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="py-4 px-6">
                        <p>
                          <strong>From:</strong> {trip.tripfrom || 'N/A'}
                        </p>
                        <p>
                          <strong>To:</strong> {trip.tripto || 'N/A'}
                        </p>
                        <p>
                          <strong>TripId:</strong> {trip.id || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-6 flex items-center space-x-2">
                        <button
                          onClick={() => viewTripDetails(trip)}
                          className="bg-yellow-500 text-white text-sm px-4 py-2 rounded hover:bg-yellow-600"
                        >
                          ViewTrip
                        </button>

                        {trip.status === 'inprogress' && (
                          <>
                            <button
                              onClick={() => handleCancelTrip(trip)}
                              className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCompleteTrip(trip)}
                              className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600"
                            >
                              CompleteTrip
                            </button>
                          </>
                        )}

                        {trip.status !== 'completed' &&
                          trip.status !== 'inprogress' &&
                          trip.status !== 'submitted' && (
                            <button
                              onClick={() => handleTakeTrip(trip)}
                              className="bg-green-500 text-white text-sm px-4 py-2 rounded hover:bg-green-600"
                            >
                              StartTrip
                            </button>
                          )}

                        {trip.status === 'completed' && (
                          <span className="text-green-600 text-sm">
                            Trip Completed
                          </span>
                        )}
                        {trip.status === 'inprogress' && (
                          <span className="text-blue-600 text-sm">
                            Trip inprogress
                          </span>
                        )}
                        {trip.status === 'submitted' && (
                          <span className="text-blue-600 text-sm">
                            Trip Submitted
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600 py-6">No trips found.</div>
        )}
      </div>

      {/* Modal for completing trip */}
      {showModal && currentTrip && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Complete Trip
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700">MeterAfter</label>
                <input
                  type="text"
                  name="meterafter"
                  value={formData.meterafter}
                  onChange={handleChange}
                  className="mt-2 p-2 border rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Fuel</label>
                <input
                  type="text"
                  name="fuel"
                  value={formData.value}
                  onChange={handleChange}
                  className="mt-2 p-2 border rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Invoice</label>
                <input
                  type="file"
                  name="invoicedoc"
                  onChange={handleChange}
                  className="mt-2 p-2 border rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Meter After</label>
                <input
                  type="file"
                  name="meterafterfile"
                  onChange={handleChange}
                  className="mt-2 p-2 border rounded-md w-full"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateTrip(currentTrip)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showstarttripModel && currentTrip && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Start Trip
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700">MeterBefore</label>
                <input
                  type="text"
                  name="meterbefore"
                  value={savetrip.meterbefore}
                  onChange={handleTripChange}
                  className="mt-2 p-2 border rounded-md w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700" htmlFor="vehiclenumber">
                  Vehicle Number
                </label>
                <select
                  id="vehiclenumber"
                  name="vehiclenumber"
                  value={savetrip.vehiclenumber}
                  onChange={handleTripChange}
                  className="mt-2 p-2 border rounded-md w-full"
                >
                  <option value="">Select a vehicle</option>
                  <option value="Other">Other</option>
                  {vehicle && vehicle.length > 0 ? (
                    vehicle.map((vehicleItem) => (
                      <option
                        key={vehicleItem.id || vehicleItem.name}
                        value={vehicleItem.name}
                      >
                        {vehicleItem.vehicleNumber ||
                          `Vehicle ${vehicleItem.id}`}{' '}
                        {/* Fallback text */}
                      </option>
                    ))
                  ) : (
                    <option value="">No vehicles available</option>
                  )}
                </select>
              </div>

              <label className="block text-gray-700">MeterBefore</label>
              <input
                type="file"
                name="meterbeforefile"
                onChange={handleTripChange}
                className="mt-2 p-2 border rounded-md w-full"
                required
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCloseModal2}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSavetrips(currentTrip.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTripView;
