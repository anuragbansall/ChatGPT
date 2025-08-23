import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthModalContext } from "../context/AuthModalContext";
import { useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import MarkdownRenderer from "./MarkdownRenderer";

const ChatApp = () => {
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [pendingUserMessage, setPendingUserMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const { id } = useParams();
  const {
    openAuthModal,
    isAuthenticated,
    getCurrentMessages,
    createConversation,
  } = useContext(AuthModalContext);

  const { socket, isSocketConnected } = useContext(SocketContext);

  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const isNearBottom = () => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    setShowScrollButton(!isNearBottom());
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return openAuthModal();
    if (isStreaming || isTyping || pendingUserMessage || isBusy) return;
    if (!inputValue.trim()) return;

    if (isSocketConnected && socket) {
      setIsBusy(true);
      const userMessage = inputValue.trim();
      setPendingUserMessage(userMessage);
      setInputValue("");

      let conversationId = id;

      if (!conversationId) {
        // Generate a title from the first user message (e.g., first 6 words or 40 chars)
        const generateTitle = (text) => {
          const words = text.trim().split(/\s+/).slice(0, 6).join(" ");
          return words.length > 40 ? words.slice(0, 40) + "..." : words;
        };
        const newConversation = await createConversation({
          title: generateTitle(userMessage),
        });
        conversationId = newConversation._id;
        navigate(`/c/${conversationId}`);
      }

      socket.emit("message", {
        conversationId,
        prompt: userMessage,
      });

      setTimeout(scrollToBottom, 100);
    }
  };

  const lastMessage =
    conversations.length > 0 ? conversations[conversations.length - 1] : null;

  const shouldRenderPending =
    pendingUserMessage &&
    id &&
    !(
      lastMessage &&
      lastMessage.sender === "user" &&
      lastMessage.content.trim() === pendingUserMessage.trim()
    );

  // Memoized event handlers to avoid re-registering on every render
  const handleMessageSaved = React.useCallback(
    (data) => {
      setConversations((prev) => {
        const exists = prev.some((msg) => msg._id === data._id);
        return exists ? prev : [...prev, data];
      });
      if (
        data.sender === "user" &&
        data.content.trim() === pendingUserMessage.trim()
      ) {
        setPendingUserMessage("");
      }
    },
    [pendingUserMessage],
  );

  const handleStreamStart = React.useCallback(() => {
    setIsStreaming(true);
    setStreamingMessage("");
    setTimeout(scrollToBottom, 100);
  }, []);

  const handleStreamChunk = React.useCallback((data) => {
    setStreamingMessage((prev) => prev + data.chunk);
    setTimeout(scrollToBottom, 50);
  }, []);

  const handleStreamEnd = React.useCallback(() => {
    setIsStreaming(false);
    setStreamingMessage("");
    setIsTyping(true);
  }, []);

  const handleResponse = React.useCallback((data) => {
    setConversations((prev) => {
      const exists = prev.some((msg) => msg._id === data.message._id);
      return exists ? prev : [...prev, data.message];
    });
    setIsStreaming(false);
    setStreamingMessage("");
    setIsTyping(false);
    setIsBusy(false);
    setTimeout(scrollToBottom, 100);
  }, []);

  const handleError = React.useCallback((error) => {
    console.error("Socket error:", error);
    setIsStreaming(false);
    setStreamingMessage("");
    setIsTyping(false);
    setIsBusy(false);
  }, []);

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    socket.on("message_saved", handleMessageSaved);
    socket.on("stream_start", handleStreamStart);
    socket.on("stream_chunk", handleStreamChunk);
    socket.on("stream_end", handleStreamEnd);
    socket.on("response", handleResponse);
    socket.on("error", handleError);

    return () => {
      socket.off("message_saved", handleMessageSaved);
      socket.off("stream_start", handleStreamStart);
      socket.off("stream_chunk", handleStreamChunk);
      socket.off("stream_end", handleStreamEnd);
      socket.off("response", handleResponse);
      socket.off("error", handleError);
    };
  }, [
    socket,
    isSocketConnected,
    handleMessageSaved,
    handleStreamStart,
    handleStreamChunk,
    handleStreamEnd,
    handleResponse,
    handleError,
  ]);

  useEffect(() => {
    if (!id) {
      setConversations([]);
      setPendingUserMessage("");
      return;
    }

    const fetchConversations = async () => {
      const data = await getCurrentMessages(id);
      setConversations((prev) => {
        const map = new Map();
        // Add previous messages
        prev.forEach((msg) => map.set(msg._id, msg));
        // Add new messages
        data.forEach((msg) => map.set(msg._id, msg));
        return Array.from(map.values());
      });
      setPendingUserMessage("");
      setIsTyping(false);
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

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="relative flex h-full w-full flex-col gap-4 overflow-y-auto scroll-smooth px-12 py-4"
      >
        {conversations.length > 0 ||
        isStreaming ||
        pendingUserMessage ||
        isTyping ? (
          <>
            {conversations.map((item) => (
              <div
                key={item._id}
                className={`${
                  item.sender === "user"
                    ? "self-end rounded-tr-[0]"
                    : "self-start rounded-tl-[0]"
                } bg-dark-100/50 max-w-prose rounded-xl px-5 py-3 leading-relaxed`}
              >
                {item.sender === "user" ? (
                  <p>{item.content}</p>
                ) : (
                  <MarkdownRenderer markdownText={item.content} />
                )}
              </div>
            ))}

            {shouldRenderPending && (
              <p className="bg-dark-100/50 animate-pulse self-end rounded-xl rounded-tr-[0] px-5 py-3 opacity-70">
                {pendingUserMessage}
              </p>
            )}

            {isStreaming && streamingMessage && (
              <p className="bg-dark-100/50 animate-pulse self-start rounded-xl rounded-tl-[0] px-5 py-3 opacity-70">
                {streamingMessage}
              </p>
            )}

            {isTyping && !isStreaming && (
              <p className="bg-dark-100/50 animate-pulse self-start rounded-xl rounded-tl-[0] px-5 py-3 opacity-70">
                Thinking...
              </p>
            )}

            <div ref={messagesEndRef} />
          </>
        ) : (
          <h2 className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] text-4xl text-white/80">
            What&apos;s on your mind?
          </h2>
        )}

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="bg-dark-100 hover:bg-dark-200 fixed right-8 bottom-24 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Scroll to bottom"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        )}
      </div>

      <form
        className={`group mx-auto my-4 flex max-w-full items-center gap-2 rounded-full p-3 transition-all duration-300 ${
          isStreaming || isTyping || pendingUserMessage || isBusy
            ? "glowing-bg"
            : "bg-dark-100 border border-neutral-500"
        }`}
        onSubmit={handleSend}
      >
        <div
          className={`flex w-full items-center gap-2 rounded-full ${
            isStreaming || isTyping || pendingUserMessage || isBusy
              ? "bg-dark-100 p-3"
              : ""
          }`}
        >
          <input
            type="text"
            placeholder="Enter your text here"
            className="w-full border-none bg-transparent px-4 text-lg text-white outline-0 transition-all duration-200 focus:w-xl"
            value={inputValue}
            onChange={handleInputChange}
            disabled={isStreaming || isTyping || pendingUserMessage || isBusy}
          />
          <button
            type="submit"
            disabled={
              isStreaming ||
              isTyping ||
              pendingUserMessage ||
              isBusy ||
              !inputValue.trim()
            }
            className={`cursor-pointer rounded-full px-6 py-2 text-white transition-colors duration-200 ${
              isStreaming ||
              isTyping ||
              pendingUserMessage ||
              !inputValue.trim()
                ? "bg-dark-200/50 cursor-not-allowed"
                : "bg-dark-200 hover:bg-dark-300"
            }`}
          >
            {isStreaming || isTyping || pendingUserMessage || isBusy
              ? "Processing..."
              : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatApp;
