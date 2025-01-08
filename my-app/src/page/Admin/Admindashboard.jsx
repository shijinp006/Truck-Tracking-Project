import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import CreateUser from '../../page/Admin/CreateUsers';
import CreateTrip from '../../page/Admin/CreateTrips';
import AddVehicle from '../../page/Admin/AddVehicles';
import ViewTripDetails from '../../page/Admin/viewtripdetails';
import Category from '../../page/Admin/category';
import ViewDrivers from '../../page/Admin/viewDrivers';
import ViewVehicles from '../../page/Admin/viewVehicle';

const AdminDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set mobile size to <=768px
    };
    handleResize(); // Check on component mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const location = useLocation(); // Get the current path

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleLinkClick = () => {
    setSidebarOpen(false); // Close the sidebar
  };

  const renderSection = () => {
    switch (location.pathname) {
      case '/admin/*':
        return <ViewTripDetails />;
      case '/admin/create-user':
        return <CreateUser />;
      case '/admin/addvehicle':
        return <AddVehicle />;
      case '/admin/create-trip':
        return <CreateTrip />;
      case '/admin/viewtrip':
        return <ViewTripDetails />;
      case '/admin/createcategory':
        return <Category />;
      case '/admin/viewusers':
        return <ViewDrivers />;
      case '/admin/viewvehicles':
        return <ViewVehicles />;

      default:
    }
  };
  return (
    <div
      className="flex flex-col md:flex-row h-screen"
      style={{
        backgroundColor: '#f0f0f0',
        filter: 'brightness(0.9)',
      }}
    >
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 w-64 bg-gray-800 text-white h-full transition-transform duration-300 ease-in-out z-20 md:static md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-center">Dashboard</h1>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1">
          <ul className="space-y-2 px-4">
            {[
              { to: '/admin/create-user', icon: '👤', label: 'Create User' },
              { to: '/admin/viewusers', icon: '👥', label: 'View Users' },
              { to: '/admin/addvehicle', icon: '🚗', label: 'Add Vehicle' },
              { to: '/admin/viewvehicles', icon: '🚙', label: 'View Vehicles' },
              { to: '/admin/create-trip', icon: '✈️', label: 'Create Trip' },
              { to: '/admin/viewtrip', icon: '📋', label: 'View Trips' },
              {
                to: '/admin/createcategory',
                icon: '📂',
                label: 'Create Category',
              },
            ].map((link, index) => (
              <li key={index}>
                <Link
                  to={link.to}
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-700 w-full text-left"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 text-white flex justify-between items-center p-4 md:hidden">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-2xl focus:outline-none"
          >
            ☰
          </button>
        </header>

        {/* Main Section */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div
            className={`${
              isMobile
                ? 'bg-transparent p-0' // Remove background and padding for mobile
                : 'bg-black bg-opacity-70 p-4 sm:p-6' // Keep the dark background and padding for desktop
            } rounded-lg flex justify-center items-center`}
            style={{
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Content Styling Based on Mobile or Desktop */}
            <div
              className={`bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full ${
                isMobile ? 'max-w-full' : 'max-w-4xl'
              }`}
            >
              <h2 className="text-center text-2xl font-bold mb-4">
                {isMobile ? 'Mobile Dashboard' : 'Desktop Dashboard'}
              </h2>
              {renderSection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
