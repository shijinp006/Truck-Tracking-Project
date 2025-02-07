import './App.css';
import { createBrowserRouter } from 'react-router-dom';
import AdminDashboard from './page/Admin/Admindashboard';
import UserDasboard from './page/User/Userdashboard';
import AuthTemplate from './page/Admin/AuthTemplete';
import FinanceAuthTemplate from './page/Admin/FinanceloginTemplete';
import FinanceDashboard from './page/Admin/Financedashboard ';
import UserLogin from './page/User/Userlogin';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AuthTemplate />,
  },
  {
    path: '/financelogin',
    element: <FinanceAuthTemplate />,
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
    path: '/finance/*',
    element: <FinanceDashboard />,
  },

  {
    path: '/user/*',
    element: <UserDasboard />,
  },
]);

export default appRouter;
