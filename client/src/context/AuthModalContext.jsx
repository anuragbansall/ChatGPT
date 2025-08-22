import { createContext, useState } from "react";

export const AuthModalContext = createContext({});

export const AuthModalProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <AuthModalContext.Provider
      value={{ isAuthModalOpen, closeAuthModal, openAuthModal }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};
