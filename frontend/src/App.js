import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EmailProvider } from "./contexts/EmailContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import SimpleEmailView from "./pages/SimpleEmailView";
import AccountManagement from "./pages/AccountManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <EmailProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/email/:accountId"
                element={
                  <ProtectedRoute>
                    <EmailView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <AccountManagement />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </EmailProvider>
      </AuthProvider>
    </div>
  );
}

export default App;