import axios from "axios";

const API = axios.create({
  baseURL: "https://chatgpt-pwzr.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default API;
