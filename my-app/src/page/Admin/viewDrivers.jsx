import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ViewDrivers = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentuser] = useState(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [isEditFormVisible, setEditFormVisible] = useState(false);
  const [drivermodel, setDrivermodel] = useState(true);
  const [formData, setFormData] = useState({
    credit: '',
  });
  const [driverFilter, setDriverFilter] = useState(''); // State to manage the filter

  const [editform, setEditform] = useState({
    name: '',
    phoneNumber: '',
    creditpoint: 0,
    creditpointreceived: 0,
  });
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authorization token is missing');
        return;
      }

      try {
        const response = await axios.get('/Admin/getuser', {
          headers: { Authorization: `Bearer ${token}` },
          params: { driverName: driverFilter },
        });

        // Ensure the data is successfully received
        if (response.data.success) {
          setUsers(response.data.data);
        } else {
          console.error('Error fetching users: Data is not valid');
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Handle token expiration
          await Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: '❌ Your session has expired. Please log in again.',
          });

          // Redirect to login page after the alert
          window.location.href = '/'; // Adjust with your login page path
        } else {
          // Handle network or unknown errors
          console.error('Unknown error:', error.message);
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unknown error. Please check your connection.',
          });
        }
      }
    };

    fetchUsers();
  }, [driverFilter]);
  const handleClime = (user) => {
    setCurrentuser(user);
    setFormVisible(true);
    setEditFormVisible(false);
    setDrivermodel(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handlesave = async (e, id) => {
    e.preventDefault(); // Prevent form from submitting the default way

    const token = localStorage.getItem('token');
    if (!token) {
      // Show error message if token is missing
      await Swal.fire({
        icon: 'error',
        title: 'Authorization Failed',
        text: 'Authorization token is missing. Please log in again.',
      });
      return;
    }

    // Ensure formData is not empty or invalid before making the request
    if (!formData || Object.keys(formData).length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Invalid Data',
        text: 'No data to save. Please check your form inputs.',
      });
      return;
    }

    try {
      // Disable the save button to prevent multiple requests
      const saveButton = document.getElementById('saveButton');
      if (saveButton) saveButton.disabled = true;

      // Prepare the request headers and body
      const response = await axios.post(`/Admin/creditclime/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response.data);

      // Update the user data in the state immediately
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                creditpointreceived: formData.credit, // Update specific field
                creditpoint: response.data.updatedCreditPoint, // Example from API response
              }
            : user
        )
      );

      // Optionally show a success message
      await Swal.fire({
        icon: 'success',
        title: 'Saved Successfully',
        text: 'Your data has been saved.',
      });

      // Reload the page after success
      window.location.reload();
    } catch (error) {
      console.error(
        'Error in handlesave:',
        error.response?.data || error.message
      );

      // Handle token expiration error (401 Unauthorized)
      if (error.response && error.response.status === 401) {
        await Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
        });

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          window.location.href = '/'; // Adjust with your login page path
        }, 3000); // Wait 3 seconds to show the message
      } else {
        // Show error message if request fails
        await Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text:
            error.response?.data?.message ||
            'An error occurred while saving. Please try again.',
        });
      }
    } finally {
      // Re-enable the save button after the request is complete
      const saveButton = document.getElementById('saveButton');
      if (saveButton) saveButton.disabled = false;
    }
  };

  const handleCancel = () => {
    setFormVisible(false);
    setDrivermodel(true);
  };

  const handleEdit = async (user) => {
    setEditform(user);
    setCurrentuser(user);
    setEditFormVisible(true);
    setFormVisible(false);
    setDrivermodel(false);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditform({ ...editform, [name]: value });
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault(); // Correct event handling
    setEditFormVisible(false);
    setDrivermodel(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        await Swal.fire({
          icon: 'error',
          title: 'Authorization Failed',
          text: 'Authorization token is missing. Please log in again.',
        });
        return;
      }

      // Validate phone number (exactly 10 digits)
      const { phoneNumber } = editform;
      if (!/^\d{10}$/.test(phoneNumber)) {
        await Swal.fire({
          icon: 'error',
          title: 'Invalid Phone Number',
          text: 'Please enter a valid 10-digit phone number.',
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to save the changes?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, save it!',
      });

      if (!result.isConfirmed) return;

      const response = await axios.put(`/Admin/edituser/${id}`, editform, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id ? { ...user, ...editform } : user
          )
        );

        await Swal.fire({
          title: 'Success!',
          text: 'User updated successfully.',
          icon: 'success',
        });

        CancelEdit(); // Close the form
      } else {
        Swal.fire({
          title: 'Unexpected Response',
          text: `Received status: ${response.status}. Please try again.`,
          icon: 'warning',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            await Swal.fire({
              icon: 'error',
              title: 'Unauthorized',
              text: 'Your session has expired. Please log in again.',
            });
            // Redirect to login page after 3 seconds
            setTimeout(() => {
              window.location.href = '/'; // Adjust with your login page path
            }, 3000);
            break;
          case 500:
            Swal.fire({
              icon: 'error',
              title: 'Server Error',
              text: 'An internal server error occurred. Please try again later.',
            });
            break;
          default:
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.message || 'An unknown error occurred.',
            });
        }
      } else if (error.request) {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: 'No response from the server. Please check your connection.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `An error occurred: ${error.message}`,
        });
      }
    }
  };

  const CancelEdit = async () => {
    setEditFormVisible(false);
    setDrivermodel(true);
  };

  // const handleDelete = async (id) => {
  //   setEditFormVisible(false);
  //   setFormVisible(false);
  //   try {
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       await Swal.fire({
  //         icon: 'error',
  //         title: 'Authorization Failed',
  //         text: 'Authorization token is missing. Please log in again.',
  //       });
  //       return;
  //     }

  //     // Show confirmation dialog before deletion
  //     const result = await Swal.fire({
  //       title: 'Are you sure?',
  //       text: "You won't be able to revert this!",
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes, delete it!',
  //       cancelButtonText: 'No, cancel!',
  //     });

  //     if (!result.isConfirmed) {
  //       return; // If the user cancels, don't proceed
  //     }

  //     // Proceed with deletion if confirmed
  //     const response = await axios.delete(`/Admin/deleteuser/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     // Handle successful deletion
  //     if (response.status === 200) {
  //       await Swal.fire({
  //         icon: 'success',
  //         title: 'User Deleted',
  //         text: response.data.message,
  //       });

  //       // Remove the deleted user from the state
  //       setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  //     }
  //   } catch (error) {
  //     console.error('Error deleting user:', error);

  //     // Enhanced error handling to capture specific messages
  //     const errorMessage =
  //       error.response?.data?.message ||
  //       'Failed to delete user. Please try again.';

  //     // Displaying the error message
  //     await Swal.fire({
  //       icon: 'error',
  //       title: 'Deletion Failed',
  //       text: errorMessage,
  //     });
  //   }
  // };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-700">Users List</h2>

      {/* Filter by Driver Name */}

      <div className="mt-4">
        <label
          htmlFor="driverFilter"
          className="mr-2 text-sm font-medium text-gray-700"
        >
          Filter by Driver Name:
        </label>
        <input
          type="text"
          id="driverFilter"
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
          placeholder="Search by name"
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {users.length > 0 ? (
        <div className="mt-4">
          {drivermodel && (
            <table className="table-auto w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Phone</th>
                  <th className="border px-4 py-2">Received Credit</th>
                  <th className="border px-4 py-2">Redeemed Credit</th>
                  <th className="border px-4 py-2">Credit Balance</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border px-4 py-2">{user.name}</td>
                    <td className="border px-4 py-2">{user.phoneNumber}</td>
                    <td className="border px-4 py-2">{user.creditpoint}</td>
                    <td className="border px-4 py-2">
                      {user.creditpointreceived}
                    </td>
                    <td className="border px-4 py-2">
                      {user.creditpoint - user.creditpointreceived < 0
                        ? 0
                        : user.creditpoint - user.creditpointreceived}
                    </td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-500"
                        onClick={() => handleClime(user)}
                      >
                        Redeem
                      </button>
                      {/* Additional Edit Button */}
                      <button
                        className="bg-blue-400 text-white px-3 py-1 rounded hover:bg-blue-500"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      {/* Additional Delete Button */}
                      {/* <button
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <p>No users found.</p>
      )}

      {isFormVisible && (
        <div className="mt-6 bg-white p-4 shadow rounded">
          <h3 className="text-xl font-semibold text-gray-700">Credit Clime</h3>
          <form
            className="mt-4"
            onSubmit={(e) => handlesave(e, currentUser.id)} // Handle form submission here
          >
            <div className="mb-4">
              <label
                htmlFor="creditpointrecieved"
                className="block text-sm font-medium text-gray-700"
              >
                Received Credit Points
              </label>
              <input
                type="text"
                id="credit"
                name="credit"
                value={formData.credit}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                type="submit"
                id="saveButton"
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

      {isEditFormVisible && (
        <div className="mt-6 bg-white p-6 shadow rounded-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Edit User
          </h3>
          <form onSubmit={(e) => handleEditSubmit(e, currentUser.id)}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editform.name}
                onChange={handleEditChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={editform.phoneNumber}
                onChange={handleEditChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* <div className="mb-4">
              <label
                htmlFor="creditpointreceived"
                className="block text-sm font-medium text-gray-700"
              >
                Received Credit Points
              </label>
              <input
                type="number"
                id="creditpointreceived"
                name="creditpointreceived"
                value={editform.creditpointreceived}
                onChange={handleEditChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div> */}

            <div className="flex items-center justify-end gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={CancelEdit}
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

export default ViewDrivers;
