import React, { useState } from "react";
import SideChatHistory from "../components/SideChatHistory";
import ChatApp from "../components/ChatApp";

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <main className="relative flex h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden w-1/4 shrink-0 lg:block">
        <SideChatHistory />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          />
          {/* Sidebar */}
          <div className="fixed top-0 left-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out sm:w-80 lg:hidden">
            <SideChatHistory onClose={closeSidebar} />
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="w-full lg:grow">
        <ChatApp
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </main>
  );
};

export default ChatPage;
