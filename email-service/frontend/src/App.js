import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmailProvider } from './contexts/EmailContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmailView from './pages/EmailView';
import Settings from './pages/Settings';
import { Toaster } from './components/ui/sonner';
import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <EmailProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/email/:emailId" element={
                <ProtectedRoute>
                  <EmailView />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
          <Toaster />
        </EmailProvider>
      </AuthProvider>
    </div>
  );
}

export default App;