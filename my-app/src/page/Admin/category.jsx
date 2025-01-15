import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categorymodel, setCategorymodel] = useState(true);
  const [isEditFormVisible, setEditFormVisible] = useState(false);
  const [editform, setEditform] = useState({
    name: '',
  });

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true); // Ensure the loading state is set properly
      try {
        const { data } = await axios.get('/Admin/getcategory', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Handle token expiration
          toast.error('❌ Session expired. Please log in again.', {
            duration: 3000,
          });

          // Redirect to login page
          setTimeout(() => {
            window.location.href = '/';
          }, 3000); // Delay to allow the toast message to be visible
        } else {
          console.error('Error fetching categories:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      toast.error('Please enter a valid category name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        '/Admin/addCategory',
        {
          name: newCategoryName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (data.success) {
        toast.success('Category added successfully.');
        setCategories((prev) => [...prev, { name: newCategoryName }]);
        setNewCategoryName('');
        window.location.reload();
      } else {
        toast.error(data.message || 'Failed to add category.');
      }
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
        }, 3000); // Delay to show the toast message
      } else {
        toast.error('An error occurred while adding the category.');
        console.error('Error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async (category) => {
    setEditform(category);
    setEditFormVisible(true);
    setNewCategory(category);
    setCategorymodel(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditform({ ...editform, [name]: value });
  };

  const handleCancel = async () => {
    setEditFormVisible(false);
    setCategorymodel(true);
  };

  const handelSavecategory = async (e, id) => {
    e.preventDefault();
    setEditFormVisible(false);
    setCategorymodel(true);

    try {
      const response = await axios.put(
        `/Admin/editcategory/${id}`,
        {
          name: editform.name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Category updated successfully',
          showConfirmButton: false,
          timer: 1500,
        });

        // Immediately update the category in the state
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.id === id ? { ...category, name: editform.name } : category
          )
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to update category',
          text: 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);

      if (error.response && error.response.status === 401) {
        // Token expired or unauthorized
        Swal.fire({
          icon: 'error',
          title: 'Session expired',
          text: 'Your session has expired. Please log in again.',
          showConfirmButton: false,
          timer: 3000,
        });
        localStorage.removeItem('token'); // Clear the invalid token
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/';
        }, 3000); // Delay to show the message before redirecting
      } else {
        Swal.fire({
          icon: 'error',
          title: 'An error occurred',
          text: 'There was an issue updating the category. Please try again.',
        });
      }
    }
  };

  // Handle deleting a category
  // const handleDeleteCategory = async (id) => {
  //   const confirm = await Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'This action cannot be undone.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Yes, delete it!',
  //   });

  //   if (confirm.isConfirmed) {
  //     try {
  //       const { data } = await axios.delete(`/Admin/deletecategory/${id}`, {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       });
  //       if (data.success) {
  //         toast.success('Category deleted successfully.');
  //         setCategories((prev) =>
  //           prev.filter((category) => category.id !== id)
  //         );
  //       } else {
  //         toast.error(data.message || 'Failed to delete category.');
  //       }
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   }
  // };

  return (
    <div className="flex flex-col items-center p-6">
      <Toaster position="top-right" reverseOrder={false} />
      {categorymodel && (
        <div className="bg-white bg-opacity-90 shadow-lg rounded-lg w-full max-w-4xl p-6">
          <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
            Manage Categories
          </h1>

          {/* Add Category Form */}
          <form
            onSubmit={handleAddCategory}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-grow border p-2 rounded shadow-sm focus:outline-none focus:ring focus:ring-gray-700"
              placeholder="Enter new category name"
              aria-label="New category name"
            />
            <button
              type="submit"
              className={`bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 transition duration-200 ${
                isSubmitting && 'opacity-50 cursor-not-allowed'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </button>
          </form>

          {/* Display Categories */}
          {loading ? (
            <div className="text-center py-4">
              <div className="loader border-t-4 border-gray-700 border-solid rounded-full w-8 h-8 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading categories...</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="py-3 px-4 text-left">Category Name</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b hover:bg-gray-100"
                    >
                      <td className="py-3 px-4">{category.name}</td>
                      <td className="py-3 px-4 flex gap-2">
                        {/* <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 transition duration-200"
                        aria-label={`Delete category ${category.name}`}
                      >
                        Delete
                      </button> */}

                        <button
                          onClick={() => handleEditCategory(category)}
                          className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-200"
                          aria-label={`Edit category ${category.name}`}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600">
              No categories available.
            </p>
          )}
        </div>
      )}
      {isEditFormVisible && (
        <div className="mt-6 bg-white p-6 shadow rounded-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Edit Category
          </h3>
          <form onSubmit={(e) => handelSavecategory(e, newCategory.id)}>
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

export default Category;
