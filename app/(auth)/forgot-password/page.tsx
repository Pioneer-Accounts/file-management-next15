"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Updated to match the curl command structure
      await axios.post(
        "http://localhost:8000/accounts/password-reset/request/",
        JSON.stringify({
          email: email.trim(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      router.push("/otp-verification");
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f6ff] relative overflow-hidden">
      {/* Background Design */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-teal-300 rounded-br-[100%]"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-200 rounded-tl-[100%]"></div>
      </div>

      <div className="bg-white shadow-xl rounded-3xl flex max-w-5xl w-full relative z-10 overflow-hidden">
        {/* Left Section */}
        <div className=" bg-white w-1/2 p-12  flex flex-col items-center justify-center">
          <div className="relative w-full h-64 md:h-80">
            <Image
              src="/FP.jpg"
              alt="Forgot Password Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="w-1/2 p-12  from-blue-100 via-blue-50 to-teal-50 bg-gradient-to-br flex items-center justify-center">
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Enter your email to reset your password.
            </p>

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

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
                <Link
                  href="/signin"
                  className="flex-1 bg-white text-gray-700 p-3 rounded-md font-medium border border-gray-200 text-center hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
