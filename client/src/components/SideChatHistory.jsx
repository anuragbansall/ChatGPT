import React from "react";
import { RiChatNewLine } from "react-icons/ri";
import { MdOutlineLogout } from "react-icons/md";

const SideChatHistory = () => {
  const history = [
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
    {
      label: "What is computer",
    },
  ];

  const options = [
    {
      label: "New Chat",
      icon: <RiChatNewLine />,
    },
  ];

  return (
    <aside className="bg-dark-300 flex h-full w-full flex-col gap-2 px-6 py-4 text-white">
      <div className="flex items-center">
        <h1 className="py-4 text-2xl font-semibold">ChatGPT</h1>
      </div>

      <div className="flex w-full flex-col">
        {options.map((item, idx) => (
          <a
            key={idx}
            className="hover:bg-dark-100/30 flex w-full cursor-pointer items-center gap-2 rounded-md px-4 py-3 text-lg font-semibold text-white transition-colors duration-200"
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex h-full flex-col overflow-y-auto">
        {history.length > 0 ? (
          history.map((item, idx) => (
            <a
              key={idx}
              className="hover:bg-dark-100/30 w-full cursor-pointer rounded-md px-4 py-3 text-white/80 transition-colors duration-200"
            >
              {item.label}
            </a>
          ))
        ) : (
          <p className="w-full px-4 py-3 text-white/80">
            No chat history available
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-neutral-800 pt-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
          AB
        </div>
        <p className="text-white/80">Anurag Bansal</p>

        <MdOutlineLogout className="ml-auto cursor-pointer text-xl text-white/80 hover:text-white" />
      </div>
    </aside>
  );
};

export default SideChatHistory;
