import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { use } from 'react';
import Swal from 'sweetalert2';

const ViewVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [newVhicle, setNewVehicle] = useState([]);
  const [isEditFormVisible, setEditformVisible] = useState(false);
  const [vehiclemodel, setVehiclemodel] = useState(true);
  const [editform, setEditform] = useState({
    vehicleNumber: '',
    vehicleName: '',
  });

  // Fetch vehicles from the server
  useEffect(() => {
    axios
      .get('/Admin/getVehicle', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => setVehicles(response.data.data))
      .catch(async (error) => {
        // Handle token expiration (401 status)
        if (error.response?.status === 401) {
          await Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: '❌ Your session has expired. Please log in again.',
          });

          // Redirect to login page after the alert
          window.location.href = '/'; // Adjust the path to your login page
        } else {
          // Log other errors
          console.error('Error fetching vehicles:', error);
        }
      });
  }, []);

  const handleEdit = (vehicle) => {
    setEditform(vehicle);
    setEditformVisible(true);
    setNewVehicle(vehicle);
    setVehiclemodel(false);
    // Implement edit functionality
  };

  const handelSaveVehicle = async (e, id) => {
    e.preventDefault();
    setEditformVisible(false);
    setVehiclemodel(true);

    try {
      const response = await axios.put(`/Admin/editVehicle/${id}`, editform, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Update the vehicles state if the response is successful
      if (response.data.success) {
        setVehicles((prevVehicle) =>
          prevVehicle.map((vehicle) =>
            vehicle.id === id ? { ...vehicle, ...editform } : vehicle
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Vehicle updated successfully!',
          text: 'The vehicle details have been updated successfully.',
          confirmButtonText: 'OK',
          timer: 3000,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Something went wrong!',
          confirmButtonText: 'Try Again',
          timer: 3000,
        });
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);

      // Check if the error is due to token expiration (401 Unauthorized)
      if (error.response?.status === 401) {
        await Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: '❌ Your session has expired. Please log in again.',
        });

        // Redirect to login page after the alert
        window.location.href = '/'; // Adjust the path to your login page
      } else {
        // Show error notification for other errors
        Swal.fire({
          icon: 'error',
          title: 'Error updating vehicle',
          text: 'An error occurred while updating the vehicle. Please try again later.',
          confirmButtonText: 'OK',
          timer: 3000,
        });
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target; // Destructure `name` instead of `number`
    setEditform({ ...editform, [name]: value }); // Dynamically update the state
  };

  const handleCancel = async () => {
    setEditformVisible(false);
    setVehiclemodel(true);
  };

  // const handleDelete = async (id) => {
  //   // Show a confirmation dialog before proceeding with deletion
  //   const result = await Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'This action cannot be undone.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'No, cancel',
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       // Proceed with the deletion if the user confirms
  //       const response = await axios.delete(`/Admin/deleteVehicle/${id}`, {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       });

  //       // Optimistically update the vehicle list
  //       setVehicles((prevVehicle) =>
  //         prevVehicle.filter((vehicle) => vehicle.id !== id)
  //       );

  //       // Show success alert after deletion
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Vehicle deleted!',
  //         text: 'The vehicle has been deleted successfully.',
  //         confirmButtonText: 'OK',
  //         timer: 3000,
  //       });
  //     } catch (error) {
  //       console.error(error);

  //       // Show error alert if the deletion fails
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error',
  //         text: 'An error occurred while deleting the vehicle. Please try again later.',
  //         confirmButtonText: 'OK',
  //       });
  //     }
  //   }
  // };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">View Vehicles</h1>
      {vehiclemodel && (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">
                  Vehicle Number
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Vehicle Name
                </th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle, index) => (
                  <tr key={vehicle.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {vehicle.vehicleNumber}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {vehicle.vehicleName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                        >
                          Edit
                        </button>
                        {/* <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {isEditFormVisible && (
        <div className="mt-6 bg-white p-6 shadow rounded-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Edit Vehicles
          </h3>
          <form onSubmit={(e) => handelSaveVehicle(e, newVhicle.id)}>
            <div className="mb-4">
              <label
                htmlFor="vehicleNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Vehicle Number
              </label>
              <input
                type="text"
                id="vehicleNumber" // Set a meaningful id
                name="vehicleNumber" // Match the property in `editform`
                value={editform.vehicleNumber} // Use `editform.vehicleNumber` correctly
                onChange={handleEditChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Vehicle Name
              </label>
              <input
                type="text"
                id="vehicleName"
                name="vehicleName"
                value={editform.vehicleName}
                onChange={handleEditChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ViewVehicles;
