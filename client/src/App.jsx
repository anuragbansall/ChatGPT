import React, { useContext } from "react";
import ChatPage from "./pages/ChatPage";
import AuthModal from "./components/AuthModal";
import { AuthModalContext } from "./context/AuthModalContext";
import { AiOutlineLoading } from "react-icons/ai";

const App = () => {
  const { isAuthModalOpen } = useContext(AuthModalContext);

  // TODO: Show loading screen until user is fetched
  if (false) {
    return (
      <div className="bg-dark-300 flex h-screen w-screen items-center justify-center text-white">
        <AiOutlineLoading className="animate-spin text-4xl" />
      </div>
    );
  }

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

export default App;
