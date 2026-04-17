import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { ForgotPasswordPage } from '../site/pages/user/forgot-password-page';
import { LoginPage } from '../site/pages/user/login-page';
import { Register } from '../site/pages/user/register';
import { ResetPassword } from '../site/pages/user/reset-password';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/activate-account',
    element: <ResetPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
];
