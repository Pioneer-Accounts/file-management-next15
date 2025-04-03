"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Activate() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // if (!token.trim()) {
    //   setError("Please enter your activation token");
    //   return;
    // }

    setLoading(true);
    setError("");

    try {
      // Make API request to backend
      await axios.get(
        `http://localhost:8000/accounts/activate/${token}`,
        {},
      );
      
      setSuccess(true);
      
      // Redirect to signin page after successful activation
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err: any) {
      console.error("Activation error:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Account activation failed. Please check your token and try again."
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
        <div className="w-1/2 p-12 bg-white flex flex-col items-center justify-center">
          <div className="relative w-full h-64 md:h-80">
            <Image
              src="/FP.jpg" // You may want to replace this with an activation-specific image
              alt="Account Activation Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 p-12 bg-gradient-to-br from-blue-100 to-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Activate Account</h2>
            <p className="text-gray-500 text-sm mb-8">Enter your activation token to complete registration</p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                Your account has been successfully activated! Redirecting to sign in page...
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activation Token
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your activation token"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white p-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Activating..." : "Activate Account"}
                </button>
              </form>
            )}

            <p className="text-center text-gray-500 mt-6">
              Already activated your account?{" "}
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