import { createContext, useEffect, useState } from "react";
import API from "../api/axios.js";

export const AuthModalContext = createContext({});

export const AuthModalProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [conversationsHistory, setConversationsHistory] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  const login = async (userData) => {
    try {
      const response = await API.post("/users/login", userData);

      setUser(response.data.user);
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await API.post("/users/register", userData);

      setUser(response.data.user);
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const logout = async () => {
    try {
      await API.post("/users/logout");

      setUser(null);
      setIsAuthenticated(false);
      setIsAuthModalOpen(true);
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const getUserProfile = async () => {
    setIsUserLoading(true);

    try {
      const response = await API.get("/users/profile");

      setUser(response.data.user);
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
    } catch (error) {
      setUserError(error.response.data.message);
      setIsAuthenticated(false);
      setUser(null);
      setIsAuthModalOpen(true);
    } finally {
      setIsUserLoading(false);
    }
  };

  const getConversationsHistory = async () => {
    try {
      const response = await API.get("/conversations");
      setConversationsHistory(response.data);
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const getConversationsById = async (id) => {
    try {
      const response = await API.get(`/conversations/${id}`);
      setCurrentConversation(response.data);

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const getCurrentMessages = async (id) => {
    try {
      const response = await API.get(`/conversations/${id}/messages`);
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getConversationsHistory();
    }
  }, [isAuthenticated]);

  return (
    <AuthModalContext.Provider
      value={{
        isAuthModalOpen,
        closeAuthModal,
        openAuthModal,
        register,
        login,
        logout,
        getUserProfile,
        user,
        isUserLoading,
        userError,
        isAuthenticated,
        conversationsHistory,
        currentConversation,
        getConversationsHistory,
        getConversationsById,
        getCurrentMessages,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};
