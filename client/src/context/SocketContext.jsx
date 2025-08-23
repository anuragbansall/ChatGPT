import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { AuthModalContext } from "./AuthModalContext";

export const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketUserId, setSocketUserId] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { isAuthenticated, user } = useContext(AuthModalContext);

  console.log(socketUserId, isSocketConnected);

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem("token");

    const socket = io("https://chatgpt-pwzr.onrender.com", {
      auth: {
        token: token,
      },
    });

    setSocket(socket);
    setSocketUserId(user?._id);
    setIsSocketConnected(true);
  }, [user?._id]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      connectSocket();
    }
  }, [isAuthenticated, user?._id, connectSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketUserId,
        isSocketConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
