import React, { useContext } from "react";
import { AuthModalContext } from "../context/AuthModalContext";
import AuthModal from "../components/AuthModal";
import ChatPage from "./ChatPage";

const HomePage = () => {
  const { isAuthModalOpen } = useContext(AuthModalContext);

  return (
    <main className="relative">
      {isAuthModalOpen ? (
        <div className="absolute top-0 left-0 h-screen w-screen">
          <AuthModal />
        </div>
      ) : null}
      <ChatPage />
    </main>
  );
};

export default HomePage;
