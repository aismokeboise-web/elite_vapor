import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLoginPage } from "./AdminLoginPage";
import { AdminLayout } from "./AdminLayout";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminModelsPage } from "./pages/AdminModelsPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminBrandsPage } from "./pages/AdminBrandsPage";
import { AdminNewsletterPage } from "./pages/AdminNewsletterPage";
import { AdminMessagesPage } from "./pages/AdminMessagesPage";
import { AdminNotFoundPage } from "./pages/AdminNotFoundPage";
import { AdminForgotPasswordPage } from "./AdminForgotPasswordPage";
import { AdminResetPasswordPage } from "./AdminResetPasswordPage";
import { AdminAccountPage } from "./pages/AdminAccountPage";
import { getAdminAuth } from "./auth";

function AdminIndex() {
  const auth = getAdminAuth();
  if (auth) {
    return <Navigate to="/admin/products" replace />;
  }
  return <AdminLoginPage />;
}

export function AdminApp() {
  return (
    <Routes>
      <Route index element={<AdminIndex />} />
      <Route path="forgot-password" element={<AdminForgotPasswordPage />} />
      <Route path="reset-password" element={<AdminResetPasswordPage />} />
      <Route element={<AdminLayout />}>
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="models" element={<AdminModelsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="newsletter-subscriptions" element={<AdminNewsletterPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="account" element={<AdminAccountPage />} />
        <Route path="dashboard" element={<Navigate to="/admin/products" replace />} />
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="*" element={<AdminNotFoundPage />} />
      </Route>
    </Routes>
  );
}

