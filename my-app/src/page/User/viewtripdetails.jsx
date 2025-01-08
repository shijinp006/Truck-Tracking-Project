import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack'; // Updated import
import Swal from 'sweetalert2'; // Import SweetAlert2

// Set up the worker for PDF.js
GlobalWorkerOptions.workerSrc =
  '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

const Alltrips = () => {
  const [tripDetails, setTripDetails] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Fetch trip details from the backend when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');

    axios
      .get(`/User/getalltrips`, {
        headers: { Authorization: `Bearer ${token}` },
      }) // Adjust URL if necessary
      .then((response) => {
        if (response.data.success) {
          setTripDetails(response.data.data);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'No trips found',
            text: 'No trip details available at the moment.',
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching trip details:', error);
      });
  }, []);

  const fetchFilteredTrips = async () => {
    try {
      const response = await axios.get(`/User/filterdetails`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: {
          status: statusFilter,

          sortField: sortField, // E.g., 'id' or 'name'
          sortOrder: sortOrder, // Dynamically set to either 'ASC' or 'DESC'
          page: currentPage, // Pass the current page
          limit: 10, // Set the limit per page
        },
      });
      setFilteredTrips(response.data.data);
      setTotalPages(response.data.totalPages); // Set the total pages
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  useEffect(() => {
    fetchFilteredTrips();
  }, [statusFilter, sortField, sortOrder, currentPage]); // Trigger fetch wh

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // const handleFilterChange = (e) => {
  //   const { id, value } = e.target; // Get the id (filter type) and value of the selected filter

  //   // Reset page to 1 whenever a filter changes
  //   setCurrentPage(1);

  //   // Update the corresponding filter value based on the filter type (id)
  //   if (id === 'statusFilter') {
  //     setStatusFilter(value);
  //   }

  //   // // Call the function to fetch the filtered data
  //   // fetchFilteredData();
  // };

  const handleSort = (field) => {
    // Toggle between ascending and descending when the same field is clicked
    const newSortOrder =
      sortField === field && sortOrder === 'DESC' ? 'ASC' : 'DESC';

    setSortField(field); // Update the field you're sorting by
    setSortOrder(newSortOrder); // Set the sort order (either ASC or DESC)
    fetchTrips(); // Refetch trips with the new sort order
  };

  const handleUpdate = async (trip, tripId) => {
    // Display SweetAlert2 modal with the edit form
    const { isConfirmed, value: formValues } = await Swal.fire({
      title: "<span style='color:#4CAF50;'>Edit Trip</span>", // Green title
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <label for="editName" class="swal-label">Driver Name:</label>
          <input 
            id="editName" 
            type="text" 
            class="swal-input" 
            value="${trip?.name || ''}" 
            placeholder="Enter driver name"
          />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745', // Bright green for save button
      cancelButtonColor: '#dc3545', // Red for cancel button
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('editName').value.trim();

        if (!name) {
          Swal.showValidationMessage('Driver name is required!');
          return null;
        }

        return { name };
      },
      customClass: {
        popup: 'swal-responsive-popup', // Use custom classes for styling
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      },
    });

    if (isConfirmed && formValues) {
      try {
        // Send the updated trip details to the server
        const response = await axios.put(
          `/User/updatedriver/${tripId}`,
          {
            name: formValues.name,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          }
        );

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: "<span style='color:#4CAF50;'>Success</span>",
            text: 'Trip updated successfully!',
            confirmButtonColor: '#28a745',
          });

          // Update the trip details locally
          setTripDetails((prevTrips) =>
            prevTrips.map((t) =>
              t.id === tripId ? { ...t, name: formValues.name } : t
            )
          );
          setFilteredTrips((prevTrips) =>
            prevTrips.map((t) =>
              t.id === tripId ? { ...t, name: formValues.name } : t
            )
          );
        } else {
          Swal.fire({
            icon: 'error',
            title: "<span style='color:#dc3545;'>Error</span>",
            text: 'User not found',
            confirmButtonColor: '#dc3545',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: "<span style='color:#dc3545;'>Error</span>",
          text: 'An error occurred  updating the trip. Please try again.',
          confirmButtonColor: '#dc3545',
        });
        console.error('Error while updating trip:', error);
      }
    }
  };

  // Function to filter trips based on selected status

  // Component to render PDF document as an image (Canvas)
  const PDFRenderer = ({ pdfUrl }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const renderPDF = async () => {
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
      };

      renderPDF();
    }, [pdfUrl]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          width: '200px',
          height: '100px',
          objectFit: 'contain',
          marginTop: '10px',
          borderRadius: '4px',
        }}
      ></canvas>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Status Filter Dropdown */}
      {/* <div style={{ marginBottom: '20px' }}>
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
          <option value="created">pending</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
          <option value="assigned">assigned</option>
          <option value="submitted">submitted</option>
        </select>
      </div> */}

      <h2
        style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontWeight: 'bold',
        }}
      >
        Trip Details
      </h2>

      {filteredTrips.length > 0 ? (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('id')}
              >
                Trip Id{' '}
                {sortField === 'id' ? (sortOrder === 'DESC' ? '↑' : '↓') : ''}
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
                {sortField === 'name' ? (sortOrder === 'DESC' ? '↑' : '↓') : ''}
              </th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                From
              </th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>To</th>

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
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((trip, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {trip.id}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {trip.name}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {trip.tripfrom}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {trip.tripto}
                </td>

                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {trip.tripmode}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {trip.category}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {trip.status}
                </td>

                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {/* Only show "Update" button if status is not "Assigned" or "Completed" */}
                  {trip.status !== 'assigned' &&
                    trip.status !== 'completed' &&
                    trip.status !== 'submitted' && (
                      <button
                        onClick={() => handleUpdate(trip, trip.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50', // Green button for update action
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        Update
                      </button>
                    )}
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
  );
};

export default Alltrips;
