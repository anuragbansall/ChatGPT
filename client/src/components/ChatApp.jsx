import React, { useContext, useState } from "react";
import { AuthModalContext } from "../context/AuthModalContext";

const ChatApp = () => {
  const conversations = [
    {
      message: "Hey how can i help you?",
      role: "model",
    },
    {
      message: "Hey",
      role: "user",
    },
    {
      message: "Hey how can i help you?",
      role: "model",
    },
    {
      message: "Hey",
      role: "user",
    },
    {
      message: "Hey how can i help you?",
      role: "model",
    },
    {
      message: "Hey",
      role: "user",
    },
    {
      message: "Hey how can i help you?",
      role: "model",
    },
    {
      message: "Hey",
      role: "user",
    },
    {
      message: "Hey how can i help you?",
      role: "model",
    },
    {
      message: "Hey",
      role: "user",
    },
    {
      message: "Hey how can i help you?",
      role: "model",
    },
    {
      message: "Hey",
      role: "user",
    },
  ];

  const [inputValue, setInputValue] = useState("");

  const { openAuthModal } = useContext(AuthModalContext);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = (e) => {
    e.preventDefault();

    // TODO: if not login
    if (true) {
      openAuthModal();
      return;
    }

    console.log("Send message:", inputValue);
    setInputValue("");
  };

  return (
    <section className="bg-dark-200 flex h-full w-full flex-col text-white">
      <div className="flex items-center border-b border-neutral-700 px-6 py-4">
        <h1 className="text-2xl font-semibold">ChatGPT</h1>
      </div>

      <div className="relative flex h-full w-full flex-col gap-2 overflow-y-auto px-12 py-4">
        {conversations.length > 0 ? (
          conversations.map((item, idx) => (
            <p
              key={idx}
              className={`${
                item.role === "user"
                  ? "self-end rounded-tr-[0]"
                  : "self-start rounded-tl-[0]"
              } bg-dark-100/50 rounded-xl px-5 py-3`}
            >
              {item.message}
            </p>
          ))
        ) : (
          <h2 className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] text-4xl text-white/80">
            What's on your mind?
          </h2>
        )}
      </div>

      <form
        className="bg-dark-100 group mx-auto my-4 flex max-w-full items-center gap-2 rounded-full border border-neutral-500 p-3"
        onSubmit={handleSend}
      >
        <input
          type="text"
          placeholder="Enter your text here"
          className="w-full border-none px-4 text-lg outline-0 transition-all duration-200 focus:w-xl"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button className="bg-dark-200 hover:bg-dark-300 cursor-pointer rounded-full px-6 py-2 text-white transition-colors duration-200">
          Send
        </button>
      </form>
    </section>
  );
};

export default ChatApp;
