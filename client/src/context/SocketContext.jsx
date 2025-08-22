import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthModalContext } from "./AuthModalContext";

export const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketUserId, setSocketUserId] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { isAuthenticated, user } = useContext(AuthModalContext);

  console.log(socketUserId, isSocketConnected);

  const connectSocket = () => {
    const token = localStorage.getItem("token");

    const socket = io("http://localhost:3000", {
      auth: {
        token: token,
      },
    });

    setSocket(socket);
    setSocketUserId(user._id);
    setIsSocketConnected(true);
  };

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    }
  }, [isAuthenticated]);

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
