import React, { useContext, useEffect, useState } from "react";
import { AuthModalContext } from "../context/AuthModalContext";
import { useParams } from "react-router-dom";

const ChatApp = () => {
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState([]);

  const { id } = useParams();
  console.log("Current conversation ID:", id);
  const { openAuthModal, isAuthenticated, getCurrentMessages } =
    useContext(AuthModalContext);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    console.log("Send message:", inputValue);
    setInputValue("");
  };

  useEffect(() => {
    if (!id) {
      setConversations([]);
      return;
    }
    const fetchConversations = async () => {
      const data = await getCurrentMessages(id);
      setConversations(data);
    };

    fetchConversations();
  }, [id, getCurrentMessages]);
  return (
    <section className="bg-dark-200 flex h-full w-full flex-col text-white">
      <div className="flex items-center justify-between border-b border-neutral-700 px-6 py-4">
        <h1 className="text-2xl font-semibold">ChatGPT</h1>
        {!isAuthenticated && (
          <button
            className="cursor-pointer rounded-full bg-white/80 px-4 py-2 text-black transition-colors duration-200 hover:bg-white/100"
            onClick={openAuthModal}
          >
            Login
          </button>
        )}
      </div>

      <div className="relative flex h-full w-full flex-col gap-2 overflow-y-auto px-12 py-4">
        {conversations?.length > 0 ? (
          conversations.map((item) => (
            <p
              key={item._id}
              className={`${
                item.sender === "user"
                  ? "self-end rounded-tr-[0]"
                  : "self-start rounded-tl-[0]"
              } bg-dark-100/50 rounded-xl px-5 py-3`}
            >
              {item.content}
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
