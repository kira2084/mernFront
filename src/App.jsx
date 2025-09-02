import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import InvoicePage from "./pages/InvoicePage";
import StatisticsPage from "./pages/StatisticsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage.jsx";
import NewPage from "./pages/NewPage.jsx";
import OtpPage from "./pages/OTPpage.jsx";
import SignupPage from "./pages/Signup.jsx";
import ForgotPage from "./pages/Forgetpage.jsx";
import "./App.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forget" element={<ForgotPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/reset-password" element={<NewPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="invoice" element={<InvoicePage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
