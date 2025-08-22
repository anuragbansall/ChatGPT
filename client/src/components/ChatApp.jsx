import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthModalContext } from "../context/AuthModalContext";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";

const ChatApp = () => {
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [pendingUserMessage, setPendingUserMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const { id } = useParams();
  const { openAuthModal, isAuthenticated, getCurrentMessages } =
    useContext(AuthModalContext);

  const { socket, isSocketConnected } = useContext(SocketContext);

  // Simple scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Check if user is near bottom of chat
  const isNearBottom = () => {
    if (!chatContainerRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const nearBottom = isNearBottom();
    setShowScrollButton(!nearBottom);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    // Prevent sending if already processing a message (streaming, typing, or has pending message)
    if (isStreaming || isTyping || pendingUserMessage) {
      return;
    }

    if (!inputValue.trim()) {
      return;
    }

    if (isSocketConnected && socket) {
      // Set pending user message
      setPendingUserMessage(inputValue.trim());

      // Emit message event according to API docs
      socket.emit("message", {
        conversationId: id,
        prompt: inputValue,
      });

      setInputValue(""); // Clear input after sending

      // Scroll to bottom when user sends a message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 100);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    // Handle message_saved event
    const handleMessageSaved = (data) => {
      setConversations((prev) => [...prev, data]);
      setPendingUserMessage(""); // Clear pending user message when saved
    };

    // Handle stream_start event
    const handleStreamStart = () => {
      setIsStreaming(true);
      setStreamingMessage("");
      // Scroll to bottom when streaming starts
      setTimeout(scrollToBottom, 100);
    };

    // Handle stream_chunk event
    const handleStreamChunk = (data) => {
      setStreamingMessage((prev) => prev + data.chunk);
      // Scroll to bottom as content streams in
      setTimeout(scrollToBottom, 50);
    };

    // Handle stream_end event
    const handleStreamEnd = () => {
      setIsStreaming(false);
      setStreamingMessage("");
      setIsTyping(true); // Show typing indicator after stream ends
    };

    // Handle complete response
    const handleResponse = (data) => {
      setConversations((prev) => [...prev, data.message]);
      setIsStreaming(false);
      setStreamingMessage("");
      setIsTyping(false); // Hide typing indicator when response received

      // Scroll to bottom when AI sends a response
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 100);
    };

    // Handle errors
    const handleError = (error) => {
      console.error("Socket error:", error);
      setIsStreaming(false);
      setStreamingMessage("");
      setIsTyping(false); // Hide typing indicator on error
    };

    // Register event listeners
    socket.on("message_saved", handleMessageSaved);
    socket.on("stream_start", handleStreamStart);
    socket.on("stream_chunk", handleStreamChunk);
    socket.on("stream_end", handleStreamEnd);
    socket.on("response", handleResponse);
    socket.on("error", handleError);

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off("message_saved", handleMessageSaved);
      socket.off("stream_start", handleStreamStart);
      socket.off("stream_chunk", handleStreamChunk);
      socket.off("stream_end", handleStreamEnd);
      socket.off("response", handleResponse);
      socket.off("error", handleError);
    };
  }, [socket, isSocketConnected]);

  useEffect(() => {
    if (!id) {
      setConversations([]);
      setPendingUserMessage(""); // Clear pending message when no conversation
      setIsTyping(false); // Clear typing indicator when no conversation
      return;
    }
    const fetchConversations = async () => {
      const data = await getCurrentMessages(id);
      setConversations(data);
      setPendingUserMessage(""); // Clear pending message when switching conversations
      setIsTyping(false); // Clear typing indicator when switching conversations
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
        {conversations?.length > 0 ||
        isStreaming ||
        pendingUserMessage ||
        isTyping ? (
          <>
            {conversations.map((item) => (
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
            ))}
            {pendingUserMessage && (
              <p className="bg-dark-100/50 animate-pulse self-end rounded-xl rounded-tr-[0] px-5 py-3 opacity-70">
                {pendingUserMessage}
                <span className="animate-pulse">|</span>
              </p>
            )}
            {isStreaming && streamingMessage && (
              <p className="bg-dark-100/50 animate-pulse self-start rounded-xl rounded-tl-[0] px-5 py-3 opacity-70">
                {streamingMessage}
                <span className="animate-pulse">|</span>
              </p>
            )}
            {isTyping && !isStreaming && (
              <p className="bg-dark-100/50 animate-pulse self-start rounded-xl rounded-tl-[0] px-5 py-3 opacity-70">
                Thinking...
              </p>
            )}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <h2 className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] text-4xl text-white/80">
            What's on your mind?
          </h2>
        )}

        {/* Scroll to bottom button */}
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
          isStreaming || isTyping || pendingUserMessage
            ? "glowing-bg"
            : "bg-dark-100 border border-neutral-500"
        }`}
        onSubmit={handleSend}
      >
        <div
          className={`flex w-full items-center gap-2 rounded-full ${
            isStreaming || isTyping || pendingUserMessage
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
            disabled={isStreaming || isTyping || pendingUserMessage}
          />
          <button
            type="submit"
            disabled={
              isStreaming ||
              isTyping ||
              pendingUserMessage ||
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
            {isStreaming || isTyping || pendingUserMessage
              ? "Processing..."
              : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatApp;
