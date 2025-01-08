import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Components for each page
import Alltrips from './viewtripdetails';
import UserTripView from './viewUsertrip';
import UserProfile from './myprofile';

const UserDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Sidebar open by default on large screens
  const location = useLocation(); // Get current location to highlight active link

  const handleLinkClick = () => {
    setSidebarOpen(false); // Close the sidebar on link click
  };

  // Function to render page content based on the current path using switch-case
  const renderContent = () => {
    switch (location.pathname) {
      case '/user/all-trips':
        return <Alltrips />;
      case '/user/your-trip':
        return <UserTripView />;
      case '/user/my-profile':
        return <UserProfile />;
      case '/user/dashboard':
        return <UserTripView />;
      default:
        return (
          <div>
            <p>Select an option from the sidebar to view the content.</p>
          </div>
        );
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
        } fixed top-0 left-0 w-64 bg-gray-800 text-white h-full transition-transform duration-300 z-10 md:static md:translate-x-0`}
      >
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-center">Dashboard</h1>
        </div>
        <nav className="space-y-4 px-4">
          <Link
            to="/user/all-trips"
            className={`block py-3 px-4 rounded-lg ${
              location.pathname === '/user/all-trips'
                ? 'bg-gray-700'
                : 'hover:bg-gray-700'
            }`}
            onClick={handleLinkClick}
          >
            🚌 New Trips
          </Link>
          <Link
            to="/user/your-trip"
            className={`block py-3 px-4 rounded-lg ${
              location.pathname === '/user/your-trip'
                ? 'bg-gray-700'
                : 'hover:bg-gray-700'
            }`}
            onClick={handleLinkClick}
          >
            🚗 My Trips
          </Link>
          <Link
            to="/user/my-profile"
            className={`block py-3 px-4 rounded-lg ${
              location.pathname === '/user/my-profile'
                ? 'bg-gray-700'
                : 'hover:bg-gray-700'
            }`}
            onClick={handleLinkClick}
          >
            👤 My Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile Menu Bar */}
        <header className="flex justify-between items-center bg-gray-800 text-white p-4 md:hidden">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-2xl focus:outline-none"
          >
            ☰
          </button>
        </header>

        {/* Main Section */}
        <main className="flex-1 p-4 sm:p-6 bg-white shadow-lg rounded-lg overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">
            Welcome
          </h2>

          {/* Render content based on the route */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
