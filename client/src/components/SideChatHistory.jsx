import React, { useContext } from "react";
import { RiChatNewLine } from "react-icons/ri";
import { MdOutlineLogout } from "react-icons/md";
import { AuthModalContext } from "../context/AuthModalContext";
import { Link, useNavigate } from "react-router-dom";

const SideChatHistory = () => {
  const navigate = useNavigate();
  const {
    logout,
    user,
    isAuthenticated,
    openAuthModal,
    conversationsHistory,
    createConversation,
  } = useContext(AuthModalContext);

  const handleNewChat = async () => {
    try {
      const newConversation = await createConversation({ title: "New Chat" });
      // Navigate to the new conversation
      navigate(`/c/${newConversation._id}`);
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  const options = [
    {
      label: "New Chat",
      icon: <RiChatNewLine />,
      onClick: handleNewChat,
    },
  ];

  return (
    <aside className="bg-dark-300 flex h-full w-full flex-col gap-2 px-6 py-4 text-white">
      <div className="flex items-center">
        <h1 className="py-4 text-2xl font-semibold">ChatGPT</h1>
      </div>

      <div className="flex w-full flex-col">
        {options.map((item, idx) => (
          <p
            key={idx}
            className="hover:bg-dark-100/30 flex w-full cursor-pointer items-center gap-2 rounded-md px-4 py-3 text-lg font-semibold text-white transition-colors duration-200"
            onClick={item.onClick}
          >
            {item.icon}
            {item.label}
          </p>
        ))}
      </div>

      <div className="flex h-full flex-col overflow-y-auto">
        {conversationsHistory.length > 0 ? (
          conversationsHistory.map((item) => (
            <Link
              key={item._id}
              to={`/c/${item._id}`}
              className="hover:bg-dark-100/30 w-full shrink-0 cursor-pointer overflow-hidden rounded-md px-4 py-3 text-nowrap text-ellipsis text-white/80 capitalize transition-colors duration-200"
            >
              {item.title}
            </Link>
          ))
        ) : (
          <p className="w-full px-4 py-3 text-white/80">
            No chat history available
          </p>
        )}
      </div>

      {isAuthenticated ? (
        <div className="flex shrink-0 items-center gap-2 border-t border-neutral-800 pt-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
            AB
          </div>
          <p className="text-white/80">{user?.name || "Guest"}</p>

          <MdOutlineLogout
            className="ml-auto cursor-pointer text-xl text-white/80 hover:text-white"
            onClick={logout}
          />
        </div>
      ) : (
        <button
          className="cursor-pointer rounded-full bg-white/80 px-4 py-2 text-black transition-colors duration-200 hover:bg-white/100"
          onClick={openAuthModal}
        >
          Login
        </button>
      )}
    </aside>
  );
};

export default SideChatHistory;
