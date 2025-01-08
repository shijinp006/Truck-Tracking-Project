import './App.css';
import { createBrowserRouter } from 'react-router-dom';
import AdminDashboard from './page/Admin/Admindashboard';
import UserDasboard from './page/User/Userdashboard';
import AuthTemplate from './page/Admin/AuthTemplete';
import UserLogin from './page/User/Userlogin';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AuthTemplate />,
  },
  {
    path: '/user',
    element: <UserLogin />,
  },

  {
    path: '/admin/*',
    element: <AdminDashboard />,
  },

  {
    path: '/user/*',
    element: <UserDasboard />,
  },
]);

export default appRouter;
