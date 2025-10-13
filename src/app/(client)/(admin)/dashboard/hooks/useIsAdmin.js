// hooks/useIsAdmin.js
import { useState, useEffect } from 'react';

const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setLoading] = useState(true);
  const [adminError, setError] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Make API call to check user profile
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        
        // Check if user has admin role/permission
        setIsAdmin(userData.isAdmin || userData.role === 'admin' || false);
        
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError(err.message);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Function to manually refresh admin status
  const refreshAdminStatus = async () => {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setIsAdmin(userData.isAdmin || userData.role === 'admin' || false);
      }
    } catch (err) {
      console.error('Error refreshing admin status:', err);
    }
  };

  return {
    isAdmin,
    adminLoading,
    adminError,
    refreshAdminStatus
  };
};

export default useIsAdmin;