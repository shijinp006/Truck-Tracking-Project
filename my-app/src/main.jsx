import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import appRouter from './App.jsx';
import { RouterProvider } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const BackendUrl = import.meta.env.VITE_BACKEND_URL;

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<RouterProvider router={appRouter} />);
