import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Root from './Root';
import ErrorPage from '../pages/ErrorPage/ErrorPage';
import Home from '../pages/Home/Home';
import PrivateRoute from './PrivateRoute';
import Login from '../pages/AuthPages/Login';
import Signup from '../pages/AuthPages/Signup';
import Events from '../pages/PrivatePages/Events';
import AddEvent from '../pages/PrivatePages/AddEvent';
import MyEvents from '../pages/PrivatePages/MyEvents';
import UpdateEvent from '../pages/PrivatePages/UpdateEvent';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/events",
        element: <PrivateRoute><Events></Events></PrivateRoute>,
      },
      {
        path: "/add-event",
        element: <PrivateRoute><AddEvent></AddEvent></PrivateRoute>,
      },
      {
        path: "/my-events",
        element: <PrivateRoute><MyEvents></MyEvents></PrivateRoute>,
      },
      {
        path: `/updateEvent/:id`,
        element: <PrivateRoute><UpdateEvent></UpdateEvent></PrivateRoute>,
        // loader: ({ params }) => fetch(`https://theguidebb.vercel.app/blog/${params.id}`),
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
      {
        path: "/signup",
        element: <Signup></Signup>,
      },
    ],
  },
]);

export default router;