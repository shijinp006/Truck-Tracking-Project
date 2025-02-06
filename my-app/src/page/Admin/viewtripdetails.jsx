import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack'; // Updated import
import Swal from 'sweetalert2'; // Import SweetAlert2
import * as XLSX from 'xlsx';
import { use } from 'react';
import { toast } from 'react-hot-toast';

// Set up the worker for PDF.js
GlobalWorkerOptions.workerSrc =
  '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

const ViewTripDetails = () => {
  const [userDetails, setUserDetails] = useState([]);
  const [tripDetails, setTripDetails] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vehicle, setVehicles] = useState([]);
  const [driverFilter, setDriverFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [tripfromFilter, setTripfrom] = useState('');
  const [triptoFilter, setTripTo] = useState('');
  const [categoryFilter, setCategory] = useState('');
  const [tripModeFilter, setTrimode] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [tripModal, setTripmodel] = useState(true);
  const [showtripModal, setShowtripModal] = useState(false);
  const [editshowmodel, setEditshowmodel] = useState(false);

  const [formData, setFormData] = useState({
    credit: '',
  });

  const [editform, setEditform] = useState({
    name: '',
    tripfrom: '',
    tripto: '',
    meterbefore: '',
    meterafter: '',
    fuel: '',
    vehiclenumber: '',
    tripmode: '',
    category: '',
    credit: '',

    status: '',
    invoicedoc: '',
  });
  const [ViewTrip, setViewTrip] = useState([]);

  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch trip details from the backend when the component mounts

  const fetchFilteredTrips = async () => {
    try {
      const response = await axios.get(`/Admin/filterdetails`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: {
          driverName: driverFilter,
          status: statusFilter,
          date: dateFilter,
          tripfrom: tripfromFilter,
          tripto: triptoFilter,
          tripMode: tripModeFilter,
          category: categoryFilter,
          sortField: sortField, // E.g., 'id' or 'name'
          sortOrder: sortOrder, // Dynamically set to either 'ASC' or 'DESC'
          page: currentPage, // Pass the current page
          limit: 8, // Set the limit per page
        },
      });

      setFilteredTrips(response.data.data);
      setTripDetails(response.data.data);
      setTotalPages(response.data.totalPages); // Set the total pages
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
        // Handle other errors
        // console.error('Error fetching trips:', error);
        // await Swal.fire({
        //   icon: 'error',
        //   title: 'Error',
        //   text: 'An error occurred while fetching the trips. Please try again.',
        // });
      }
    }
  };

  const getcategory = async () => {
    try {
      const response = await axios.get(`/Admin/getcategory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setCategories(response.data.data);
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
      }
    }
  };
  const getvehicles = async () => {
    try {
      const response = await axios.get(`/Admin/getVehicle`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setVehicles(response.data.data);
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
      }
    }
  };
  useEffect(() => {
    // Fetch trip details

    fetchFilteredTrips();
    getcategory();
    getvehicles();

    axios
      .get('/Admin/getuser', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((userResponse) => {
        if (userResponse.data.success) {
          setUserDetails(userResponse.data.data); // Assuming 'setUserDetails' sets the user details state
        } else {
          console.log('No user details found');
        }
      })
      .catch(async (userError) => {
        if (userError.response && userError.response.status === 401) {
          // Token expired or unauthorized
          await Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: '❌ Your session has expired. Please log in again.',
          });

          // Redirect to login page after the alert
          window.location.href = '/'; // Adjust with your login page path
        }
      });
  }, [sortField, sortOrder, currentPage]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target; // Get the id (filter type) and value of the selected filter

    // Update the corresponding filter value based on the filter type (id)
    if (id === 'statusFilter') {
      setStatusFilter(value);
    } else if (id === 'driverFilter') {
      setDriverFilter(value);
    } else if (id === 'dateFilter') {
      setDateFilter(value);
    } else if (id === 'fromFilter') {
      setTripfrom(value);
    } else if (id === 'toFilter') {
      setTripTo(value);
    } else if (id === 'tripModeFilter') {
      setTrimode(value);
    } else if (id === 'categoryFilter') {
      setCategory(value);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportToExcel = async () => {
    try {
      const response = await axios.get('/Admin/getexcel', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('API Response:', response);

      if (response.data.success) {
        const tripDetails = response.data.data;

        if (!tripDetails || tripDetails.length === 0) {
          alert('No data available to export.');
          return;
        }

        const worksheet = XLSX.utils.json_to_sheet(tripDetails);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips');

        XLSX.writeFile(workbook, 'trip_data.xlsx');
      } else {
        alert('Failed to fetch data for export. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error.message);

      if (error.response && error.response.status === 401) {
        // Token expired or unauthorized
        await Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: '❌ Your session has expired. Please log in again.',
        });

        // Redirect to login page after the alert
        window.location.href = '/'; // Adjust with your login page path
      } else {
        alert('An error occurred while exporting to Excel. Please try again.');
      }
    }
  };

  const handleSort = (field) => {
    // Toggle between ascending and descending when the same field is clicked
    const newSortOrder =
      sortField === field && sortOrder === 'DESC' ? 'ASC' : 'DESC';

    setSortField(field); // Update the field you're sorting by
    setSortOrder(newSortOrder); // Set the sort order (either ASC or DESC)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const Viewtrips = async (tripId) => {
    setShowtripModal(true);

    try {
      const response = await axios.get(`/Admin/viewtrips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log(response, 'res');

      if (response.status === 200) {
        // Assuming the trip details are in response.data
        setViewTrip(response.data.data); // Set the current trip data for display in the modal
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);

      if (error.response && error.response.status === 401) {
        // Token expired or unauthorized
        await Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: '❌ Your session has expired. Please log in again.',
        });

        // Redirect to login page after the alert
        window.location.href = '/'; // Adjust with your login page path
      } else {
        // Handle other types of errors
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while fetching trip details. Please try again.',
        });
      }
    }
  };
  console.log(ViewTrip, 'vie');
  console.log(Array.isArray(ViewTrip), 'check');

  const handleClosetripModal = () => setShowtripModal(false);

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will cancel the trip.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.post(
        `/Admin/tripcancel/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Cancelled!',
          text: 'The trip status has been updated to "Cancelled".',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          background: '#ff9800', // Orange background for cancellation
          color: 'white',
        });

        // Update the trip status in the UI
        setFilteredTrips((prev) =>
          prev.map((trip) =>
            trip.id === id ? { ...trip, status: 'cancelled' } : trip
          )
        );

        setShowtripModal(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to cancel trip.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          background: '#dc3545', // Red background for error
          color: 'white',
        });
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
        // Handle other errors
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to cancel trip. Please try again.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          background: '#dc3545', // Red background for error
          color: 'white',
        });
        console.error('Error cancelling trip:', error);
      }
    }
  };
  // const handleDelete = async (id) => {
  //   const result = await Swal.fire({
  //     title: 'Are you sure?',
  //     text: "You won't be able to revert this!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'No, cancel!',
  //   });

  //   if (!result.isConfirmed) return;

  //   try {
  //     const response = await axios.delete(`/Admin/deletetrip/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('token')}`,
  //       },
  //     });
  //     if (response.data.success) {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Deleted!',
  //         text: 'Trip has been deleted.',
  //         toast: true,
  //         position: 'top-end',
  //         showConfirmButton: false,
  //         timer: 3000,
  //         background: '#28a745', // Green background for success
  //         color: 'white',
  //       });
  //       setTripDetails(
  //         (prev) => prev.filter((t) => t.id !== id) // Exclude the deleted trip
  //       );
  //       setFilteredTrips(
  //         (prev) => prev.filter((t) => t.id !== id) // Exclude the deleted trip
  //       );
  //       setShowtripModal(false);
  //     } else {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error!',
  //         text: response.data.message || 'Failed to delete trip.',
  //         toast: true,
  //         position: 'top-end',
  //         showConfirmButton: false,
  //         timer: 3000,
  //         background: '#dc3545', // Red background for error
  //         color: 'white',
  //       });
  //     }
  //   } catch (error) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error!',
  //       text: 'Failed to delete trip.',
  //       toast: true,
  //       position: 'top-end',
  //       showConfirmButton: false,
  //       timer: 3000,
  //       background: '#dc3545', // Red background for error
  //       color: 'white',
  //     });
  //     console.error('Error deleting trip:', error);
  //   }
  // };
  const handleCompleted = async () => {
    setShowModal(true);
    setShowtripModal(false);
  };
  const handleCloseModal = () => setShowModal(false);

  const handleSubmitTrip = async (tripId) => {
    try {
      const updatecredit = { credit: document.getElementById('credit').value };

      // Show a confirmation dialog using SweetAlert2
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to add credit points for this trip?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, add it!',
      });

      // If user cancels, exit the function
      if (!result.isConfirmed) return;

      // Make the API call
      const response = await axios.post(
        `/Admin/addcreditpoint/${tripId}`,
        { credit: updatecredit.credit }, // Ensure you're sending the right data
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      console.log(response, 'res');

      // Handle success response
      if (response.status === 200) {
        // Update trip details in the state
        setTripDetails((prev) =>
          prev.map((trip) =>
            trip.id === tripId
              ? { ...trip, ...updatecredit, status: 'submitted' }
              : trip
          )
        );
        setFilteredTrips((prev) =>
          prev.map((trip) =>
            trip.id === tripId
              ? { ...trip, ...updatecredit, status: 'submitted' }
              : trip
          )
        );

        // Show success notification with updated credit points
        Swal.fire(
          'Success!',
          `Credit points updated successfully! New credit points: ${updatecredit.credit}`,
          'success'
        );

        // Close the modal
        setShowModal(false);
        window.location.reload();
      } else {
        // Show warning if something goes wrong
        Swal.fire(
          'Warning!',
          'Something went wrong. Please try again!',
          'warning'
        );
      }
    } catch (error) {
      console.error(
        'Error adding credit points:',
        error.response?.data || error.message
      );

      // Check for token expiration (401 status code)
      if (error.response?.status === 401) {
        // Handle token expiration
        await Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: '❌ Your session has expired. Please log in again.',
        });

        // Redirect to login page after the alert
        window.location.href = '/'; // Adjust with your login page path
      } else {
        // Check for the specific empty trip mode error
        if (
          error.response?.status === 400 &&
          error.response?.data?.message ===
            'Cannot add credit points for an empty trip mode.'
        ) {
          Swal.fire(
            'Error!',
            'Empty trip mode: Cannot add credit points.',
            'error'
          );
        } else {
          // Show error notification for other errors
          Swal.fire(
            'Error!',
            'Failed to add credit points. Please try again.',
            'error'
          );
        }
      }
    }
  };

  const handleEdit = async (trip) => {
    setEditshowmodel(true);
    setEditform(trip);
    setShowtripModal(false);
    setTripmodel(false);
  };

  const handleCancelEdit = async () => {
    setTripmodel(true);
    setEditshowmodel(false);
  };

  const handleSaveEdit = async (e, tripId) => {
    e.preventDefault(); // Prevent the default form submission
    setEditshowmodel(false);
    setTripmodel(true);

    try {
      Swal.fire({
        title: 'Updating Trip Details...',
        text: 'Please wait while we update the trip details.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formData = new FormData();
      Object.entries(editform).forEach(([key, value]) => {
        if (value) formData.append(key, value); // Only append non-empty values
      });

      const response = await axios.put(`/Admin/edittrip/${tripId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle success
      if (response.data.success) {
        setFilteredTrips((prevTrips) =>
          prevTrips.map((trip) =>
            trip.id === tripId
              ? { ...trip, ...editform, invoicedoc: response.data.invoicedoc }
              : trip
          )
        );

        Swal.fire({
          title: 'Success!',
          text: 'Trip details updated successfully!',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
        });
        window.location.reload();
      } else {
        Swal.fire({
          title: 'Error!',
          text: response.data.message || 'Failed to update trip details.',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'An unexpected error occurred.';

      // Check if token has expired (status 401)
      if (error.response?.status === 401) {
        await Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: '❌ Your session has expired. Please log in again.',
        });

        // Redirect to login page after the alert
        window.location.href = '/'; // Adjust the path to your login page
      } else {
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          timer: 3000,
          showConfirmButton: false,
        });
        console.error('Error updating trip:', error);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, type, value, files } = e.target;

    setEditform((prevForm) => ({
      ...prevForm,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  // Filter by date

  // Navigate to the Edit Trip page when Edit button is clicked

  const PDFRenderer = ({ pdfUrl }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const renderPDF = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const loadingTask = getDocument(pdfUrl);
          const pdf = await loadingTask.promise;

          const page = await pdf.getPage(1);
          const context = canvas.getContext('2d');

          const scale = 0.5;
          const viewport = page.getViewport({ scale });

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
        } catch (error) {
          console.error('Error loading PDF:', error);
        }
      };

      renderPDF();
    }, [pdfUrl]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          marginTop: '10px',
          maxWidth: '100px',
          maxHeight: '100px',
          objectFit: 'contain',
        }}
      ></canvas>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {tripModal && (
        <div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row', // changed to 'row' for horizontal layout
              flexWrap: 'wrap', // ensures the elements wrap when necessary
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            {/* Filter by Status */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="statusFilter"
                style={{
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                Filter by Status:
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleFilterChange}
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">All</option>
                <option value="created">Created</option>
                <option value="waiting for approval">
                  Waiting for Approval
                </option>
                <option value="cancelled">Cancelled</option>
                <option value="assigned">Assigned</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>

            {/* Filter by Driver Name */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="driverFilter"
                style={{
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                Filter by Driver Name:
              </label>
              <select
                id="driverFilter"
                value={driverFilter}
                onChange={handleFilterChange}
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select Driver</option>
                {userDetails.map((user, index) => (
                  <option key={index} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Date */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="dateFilter"
                style={{
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                Filter by Date:
              </label>
              <input
                type="date"
                id="dateFilter"
                value={dateFilter}
                onChange={handleFilterChange}
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            {/* Filter by From */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="fromFilter"
                style={{
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              ></label>
              <input
                type="text"
                id="fromFilter"
                value={tripfromFilter}
                onChange={handleFilterChange}
                placeholder="Enter From Location"
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            {/* Filter by To */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="toFilter"
                style={{
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              ></label>
              <input
                type="text"
                id="toFilter"
                value={triptoFilter}
                onChange={handleFilterChange}
                placeholder="Enter To Location"
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            {/* Filter by Category */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="categoryFilter"
                style={{
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                Filter by Category:
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={handleFilterChange}
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Trip Mode */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="tripModeFilter"
                style={{
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                Filter by Trip Mode:
              </label>
              <select
                id="tripModeFilter"
                value={tripModeFilter}
                onChange={handleFilterChange}
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select Mode</option>
                <option value="empty">Empty</option>
                <option value="load">Load</option>
              </select>
            </div>

            {/* Apply Button */}
            <div>
              <button
                onClick={() => {
                  setCurrentPage(1); // Always reset the page to 1
                  fetchFilteredTrips(); // Fetch the filtered trips after resetting the page
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>
          </div>

          <h2
            style={{
              textAlign: 'center',
              marginBottom: '20px',
              fontWeight: 'bold',
            }}
          >
            Trip Details
          </h2>

          <button
            onClick={handleExportToExcel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              marginBottom: '20px',
              cursor: 'pointer',
            }}
          >
            Export to Excel
          </button>

          {filteredTrips.length > 0 ? (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                  <th
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSort('id')}
                  >
                    Trip Id{' '}
                    {sortField === 'id'
                      ? sortOrder === 'DESC'
                        ? '↑'
                        : '↓'
                      : ''}
                  </th>
                  <th
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSort('name')}
                  >
                    Driver Name{' '}
                    {sortField === 'name'
                      ? sortOrder === 'DESC'
                        ? '↑'
                        : '↓'
                      : ''}
                  </th>

                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    From
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    To
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    Credit
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    Trip Mode
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    Category
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    Status
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{trip.id}</td>
                    <td style={{ padding: '10px' }}>{trip.name}</td>
                    <td style={{ padding: '10px' }}>{trip.tripfrom}</td>
                    <td style={{ padding: '10px' }}>{trip.tripto}</td>
                    <td style={{ padding: '10px' }}>{trip.creditallowed}</td>
                    <td style={{ padding: '10px' }}>{trip.tripmode}</td>
                    <td style={{ padding: '10px' }}>{trip.category}</td>
                    <td
                      style={{
                        padding: '10px',
                        color:
                          trip.status === 'waiting for approval'
                            ? 'red'
                            : trip.status === 'submitted'
                              ? 'green'
                              : 'black',
                      }}
                    >
                      {trip.status}
                    </td>
                    <td
                      style={{ padding: '10px', display: 'flex', gap: '5px' }}
                    >
                      <button
                        className="w-full bg-blue-400 text-white px-3 py-1 rounded"
                        onClick={() => Viewtrips(trip.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No trips available.</p>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '10px',
                margin: '5px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              Previous
            </button>

            {/* Pagination Buttons */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  style={{
                    padding: '10px',
                    margin: '5px',
                    backgroundColor:
                      currentPage === pageNumber ? '#4CAF50' : '#f2f2f2',
                    color: currentPage === pageNumber ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '10px',
                margin: '5px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Complete Trip
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700">Add Credit Point</label>
                <input
                  type="text"
                  name="credit"
                  id="credit"
                  value={formData.credit}
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
                  onClick={() => handleSubmitTrip(ViewTrip.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showtripModal && ViewTrip && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Trip Details
            </h2>
            <p className="text-sm">
              <strong>Trip Id:</strong> {ViewTrip.id || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>Driver Name:</strong> {ViewTrip.name || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>From:</strong> {ViewTrip.tripfrom || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>To:</strong> {ViewTrip.tripto || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>Vehicle Number:</strong> {ViewTrip.vehiclenumber || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>MeterBefore:</strong> {ViewTrip.meterbefore || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>MeterAfter:</strong> {ViewTrip.meterafter || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>KM</strong> {ViewTrip.meterafter - ViewTrip.meterbefore}
            </p>
            <p className="text-sm">
              <strong>Mileage:</strong> {ViewTrip.mileage}
            </p>
            <p className="text-sm">
              <strong>Credit Point:</strong> {ViewTrip.credit || '0'}
            </p>
            <p className="text-sm">
              <strong>Trip Mode:</strong> {ViewTrip.tripmode || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>Category:</strong> {ViewTrip.category || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>Status:</strong> {ViewTrip.status || 'N/A'}
            </p>

            {/* Render Image */}
            {ViewTrip.invoicedoc &&
              ViewTrip.invoicedoc.match(/\.(jpeg|jpg|png|gif)$/) && (
                <div className="mt-3">
                  <strong>Invoice Image:</strong>
                  <br />
                  <a
                    href={`${BackendUrl}/uploads/compressed_${ViewTrip.invoicedoc}`}
                    target="_blank"
                  >
                    <img
                      src={`${BackendUrl}/uploads/compressed_${ViewTrip.invoicedoc}`}
                      alt="Invoice"
                      className="w-40 h-20 mt-2 rounded shadow"
                      onError={() =>
                        console.error('Image not found or invalid format')
                      }
                    />
                  </a>
                  <a
                    target="_blank"
                    href={`${BackendUrl}/uploads/${ViewTrip.invoicedoc}`}
                    className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded shadow"
                  >
                    Download Image
                  </a>
                </div>
              )}
            {console.log(ViewTrip.invoicedoc, 'invoice doc')}

            {ViewTrip.invoicedoc && ViewTrip.invoicedoc.match(/\.pdf$/) && (
              <div className="mt-3">
                <strong>Invoice PDF:</strong>
                <a
                  href={`${BackendUrl}/uploads/${ViewTrip.invoicedoc}`}
                  target="_blank"
                >
                  <PDFRenderer
                    pdfUrl={`${BackendUrl}/uploads/${ViewTrip.invoicedoc}`}
                  />
                </a>
                <a
                  target="_blank"
                  href={`${BackendUrl}/uploads/${ViewTrip.invoicedoc}`}
                  className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded shadow"
                >
                  Download PDF
                </a>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleEdit(ViewTrip)}
                className="w-20 h-10 bg-blue-500 hover:bg-blue-600 text-white text-base rounded shadow"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={handleClosetripModal}
                className="w-20 h-10 bg-gray-500 hover:bg-gray-600 text-white text-base rounded shadow"
              >
                Close
              </button>

              {ViewTrip.status === 'waiting for approval' && (
                <button
                  type="button"
                  onClick={() => handleCompleted(ViewTrip.id)}
                  className="w-20 h-10 bg-red-400 hover:bg-red-500 text-white text-base rounded shadow"
                >
                  Approval
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {editshowmodel && (
        <div className="mt-6 bg-white p-6 shadow rounded-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Edit Trips
          </h3>
          <form onSubmit={(e) => handleSaveEdit(e, editform.id)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <select
                  id="name"
                  name="name"
                  value={editform.name || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a name</option>
                  {userDetails.map((driver) => (
                    <option key={driver.id} value={driver.name}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Trip From */}
              <div className="mb-4">
                <label
                  htmlFor="tripfrom"
                  className="block text-sm font-medium text-gray-700"
                >
                  Trip From
                </label>
                <input
                  type="text"
                  id="tripfrom"
                  name="tripfrom"
                  value={editform.tripfrom || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Trip To */}
              <div className="mb-4">
                <label
                  htmlFor="tripto"
                  className="block text-sm font-medium text-gray-700"
                >
                  Trip To
                </label>
                <input
                  type="text"
                  id="tripto"
                  name="tripto"
                  value={editform.tripto || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Meter Before */}
              <div className="mb-4">
                <label
                  htmlFor="meterbefore"
                  className="block text-sm font-medium text-gray-700"
                >
                  Meter Before
                </label>
                <input
                  type="text"
                  id="meterbefore"
                  name="meterbefore"
                  value={editform.meterbefore || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Meter After */}
              <div className="mb-4">
                <label
                  htmlFor="meterafter"
                  className="block text-sm font-medium text-gray-700"
                >
                  Meter After
                </label>
                <input
                  type="text"
                  id="meterafter"
                  name="meterafter"
                  value={editform.meterafter || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Fuel */}
              <div className="mb-4">
                <label
                  htmlFor="fuel"
                  className="block text-sm font-medium text-gray-700"
                >
                  Fuel
                </label>
                <input
                  type="text"
                  id="fuel"
                  name="fuel"
                  value={editform.fuel || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Vehicle Number */}
              <div className="mb-4">
                <label
                  htmlFor="vehiclenumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vehicle Number
                </label>
                <select
                  id="vehiclenumber"
                  name="vehiclenumber"
                  value={editform.vehiclenumber || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    Select a Vehicle Number
                  </option>
                  {vehicle.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.vehicleNumber}>
                      {vehicle.vehicleNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trip Mode */}
              <div className="mb-4">
                <label
                  htmlFor="tripmode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Trip Mode
                </label>
                <input
                  type="text"
                  id="tripmode"
                  name="tripmode"
                  value={editform.tripmode || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={editform.category || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    Select a Category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}

                  {/* Add more options dynamically if needed */}
                </select>
              </div>
              {/* Credit */}
              <div className="mb-4">
                <label
                  htmlFor="credit"
                  className="block text-sm font-medium text-gray-700"
                >
                  Credit
                </label>
                <input
                  type="text"
                  id="credit"
                  name="credit"
                  value={editform.credit || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={editform.status || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="created">Created</option>
                  <option value="assiagned">Assiagned</option>
                  <option value="submitted">Submitted</option>
                  <option value="inprogress">Inprogress</option>
                  <option value="waiting for approval">
                    Waiting for Approval
                  </option>
                  {/* Add more options dynamically if needed */}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="fileUpload"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload Invoice Document
                </label>
                <input
                  type="file"
                  id="invoicedoc"
                  name="invoicedoc"
                  onChange={handleEditChange} // Use a handler to process the file
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-6">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
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

export default ViewTripDetails;
