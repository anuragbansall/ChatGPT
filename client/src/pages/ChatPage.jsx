import React from "react";
import SideChatHistory from "../components/SideChatHistory";
import ChatApp from "../components/ChatApp";

const ChatPage = () => {
  return (
    <main className="flex h-screen w-full">
      <div className="w-1/4 shrink-0">
        <SideChatHistory />
      </div>
      <div className="w-full grow">
        <ChatApp />
      </div>
    </main>
  );
};

export default ChatPage;
