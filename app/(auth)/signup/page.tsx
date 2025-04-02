"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ email, password, repeatPassword, acceptTerms });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f6ff] relative overflow-hidden">
      {/* Background Design */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-300 rounded-br-[100%]"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-200 rounded-tl-[100%]"></div>
      </div>

      <div className="bg-white shadow-xl rounded-3xl flex max-w-5xl w-full relative z-10 overflow-hidden">
        {/* Left Section */}
        <div className="w-1/2 p-12  bg-white flex flex-col items-start justify-center">
          <div className="relative w-full h-100 mb-6">
            <Image
              src="/signup.jpg"
              alt="Sign Up Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 p-12 bg-gradient-to-br from-blue-100 to-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Sign Up</h2>
            <p className="text-gray-500 text-sm mb-8">Your Social Campaigns</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use 8 or more characters with a mix of letters, numbers &
                  symbols.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat Password
                </label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repeat Password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  className="mr-2 h-4 w-4"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I accept the{" "}
                  <a href="#" className="text-blue-500">
                    Term
                  </a>
                </label>
              </div>

              <button className="w-full bg-blue-600 text-white p-3 rounded-md font-medium">
                Sign Up
              </button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Already have an account?{" "}
              <a href="#" className="text-blue-500">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
