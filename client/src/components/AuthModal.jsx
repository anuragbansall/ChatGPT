import React, { useContext, useState } from "react";
import { AuthModalContext } from "../context/AuthModalContext";

const AuthModal = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { closeAuthModal } = useContext(AuthModalContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      console.log("Sign Up Data:", {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
    } else {
      console.log("Login Data:", {
        email: formData.email,
        password: formData.password,
      });
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-200 relative w-full max-w-md rounded-2xl border border-neutral-700 p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 cursor-pointer text-neutral-400 transition-colors duration-200 hover:text-white"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-neutral-400">
            {isSignUp
              ? "Join ChatGPT to start your conversation"
              : "Sign in to continue your conversation"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-dark-100 w-full rounded-lg border border-neutral-600 px-4 py-3 text-white placeholder-neutral-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="bg-dark-100 w-full rounded-lg border border-neutral-600 px-4 py-3 text-white placeholder-neutral-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          {/* Confirm Password (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-neutral-300"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="bg-dark-100 w-full rounded-lg border border-neutral-600 px-4 py-3 text-white placeholder-neutral-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="focus:ring-offset-dark-200 w-full transform rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-neutral-600"></div>
          <span className="mx-4 text-sm text-neutral-400">or</span>
          <div className="flex-1 border-t border-neutral-600"></div>
        </div>

        {/* Toggle Mode */}
        <div className="text-center">
          <p className="text-neutral-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        {/* Additional Options (Login Only) */}
        {!isSignUp && (
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-blue-400 transition-colors duration-200 hover:text-blue-300"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
