import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const EmailContext = createContext();

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within EmailProvider');
  }
  return context;
};

const API_URL = process.env.REACT_APP_EMAIL_API_URL || 'http://localhost:8002';

export const EmailProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [emails, setEmails] = useState({
    inbox: [],
    sent: [],
    drafts: [],
    trash: [],
    spam: []
  });
  const [stats, setStats] = useState({
    inbox: 0,
    sent: 0,
    drafts: 0,
    trash: 0,
    spam: 0,
    unread: 0,
    storage_used: 0,
    storage_quota: 1000
  });
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [loading, setLoading] = useState(false);

  const fetchEmails = async (folder = 'inbox') => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/emails/${folder}`);
      setEmails(prev => ({
        ...prev,
        [folder]: response.data.emails
      }));
    } catch (error) {
      console.error(`Error fetching ${folder} emails:`, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/account/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendEmail = async (emailData) => {
    try {
      const response = await axios.post(`${API_URL}/api/emails/send`, emailData);
      
      // Refresh sent folder and stats
      await fetchEmails('sent');
      await fetchStats();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to send email' 
      };
    }
  };

  const getEmail = async (emailId) => {
    try {
      const response = await axios.get(`${API_URL}/api/emails/${emailId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching email:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch email' 
      };
    }
  };

  const moveEmail = async (emailId, folder) => {
    try {
      await axios.put(`${API_URL}/api/emails/${emailId}/move?folder=${folder}`);
      
      // Refresh current folder and stats
      await fetchEmails(currentFolder);
      await fetchStats();
      
      return { success: true };
    } catch (error) {
      console.error('Error moving email:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to move email' 
      };
    }
  };

  const deleteEmail = async (emailId) => {
    try {
      await axios.delete(`${API_URL}/api/emails/${emailId}`);
      
      // Refresh current folder and stats
      await fetchEmails(currentFolder);
      await fetchStats();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting email:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to delete email' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${API_URL}/api/account/password`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to change password' 
      };
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchEmails(currentFolder);
    }
  }, [isAuthenticated, currentFolder]);

  const value = {
    emails,
    stats,
    currentFolder,
    loading,
    setCurrentFolder,
    fetchEmails,
    fetchStats,
    sendEmail,
    getEmail,
    moveEmail,
    deleteEmail,
    changePassword,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};