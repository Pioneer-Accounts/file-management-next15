"use client";

import { useState } from "react";
import Link from "next/link";
// import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Make API request using axios
      const response = await axios.post("http://localhost:8000/api/token/", {
        username,
        password,
      });
      
      // Store token in localStorage or cookies
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        
        // Redirect to homepage after successful login
        router.push("/");
      } else {
        throw new Error("Authentication failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-[#f0f6ff] justify-center p-4">
      {/* Background Design */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-300 rounded-br-[100%]"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-200 rounded-tl-[100%]"></div>
      </div>
      <div className="w-full max-w-5xl bg-grey rounded-3xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side content */}
          <div className="p-8 md:p-12 flex flex-col justify-center items-center md:w-1/2">
            <img src="\image.png" alt="Logo" width={300} height={300} />
          </div>

          {/* Right side - Sign In Form */}
          <div className="bg-white p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-100 to-white md:w-1/2">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800">Sign In</h2>
              <p className="text-gray-400 text-sm mt-1">to your account</p>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id="username"
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full p-3 border border-gray-200 rounded-lg pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* <div className="pt-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or with</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex justify-center items-center py-2.5 border border-gray-200 rounded-lg"
                    >
                      <Image src="/images/google-logo.png" alt="Google" width={20} height={20} />
                      <span className="ml-2 text-sm">Sign Up with Google</span>
                    </button>
                    
                    <button
                      type="button"
                      className="flex justify-center items-center py-2.5 border border-gray-200 rounded-lg"
                    >
                      <Image src="/images/apple-logo.png" alt="Apple" width={20} height={20} />
                      <span className="ml-2 text-sm">Sign Up with Apple</span>
                    </button>
                  </div>
                </div> */}

                <Button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Not a member yet?{" "}
                  <Link href="/signup" className="text-blue-500">
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
