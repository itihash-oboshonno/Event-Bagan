import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import { toast } from "sonner";

axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/me`);
        setCurrentUser(res.data.user);
      } catch (err) {
        console.error("Auth check failed:", err.response?.data || err.message);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {
        withCredentials: true,
      });
      setCurrentUser(null);
      toast.warning("User Signed Out");
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
      toast.error("Logout failed:", err.response?.data || err.message);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      setCurrentUser(res.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      return { success: false, message };
    }
  };

  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, loading, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
