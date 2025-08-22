import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { AuthModalContext } from "./context/AuthModalContext";
import { AiOutlineLoading } from "react-icons/ai";

const App = () => {
  const { isAuthModalOpen, isUserLoading } = useContext(AuthModalContext);

  if (isUserLoading) {
    return (
      <div className="bg-dark-300 flex h-screen w-screen items-center justify-center text-white">
        <AiOutlineLoading className="animate-spin text-4xl" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/c/:id" element={<HomePage />} />
      </Routes>
    </>
  );
};

export default App;
