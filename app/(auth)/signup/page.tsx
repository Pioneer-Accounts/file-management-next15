"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      setError("You must accept the terms to continue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Make API request to backend
      await axios.post(
        "http://localhost:8000/register/",
        {
          username,
          email,
          password,
          password_confirm: repeatPassword
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      // Redirect to signin page after successful registration
      router.push("/activate");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
        <div className="w-1/2 p-12 bg-white flex flex-col items-start justify-center">
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
            <p className="text-gray-500 text-sm mb-8">Create your account</p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

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
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I accept the{" "}
                  <a href="#" className="text-blue-500">
                    Terms
                  </a>
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/signin" className="text-blue-500">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
