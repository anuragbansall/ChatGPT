import React, { useContext } from "react";
import ChatPage from "./pages/ChatPage";
import AuthModal from "./components/AuthModal";
import { AuthModalContext } from "./context/AuthModalContext";

const App = () => {
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

export default App;
