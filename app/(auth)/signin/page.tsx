"use client";

import { useState } from "react";
import Link from "next/link";
// import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      {/* Background Design */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-300 rounded-br-[100%]"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-200 rounded-tl-[100%]"></div>
      </div>
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side content */}
          <div className="p-8 md:p-12 flex flex-col justify-center items-center md:w-1/2">
            <img src="\image.png" alt="Logo" width={300} height={300} />
          </div>

          {/* Right side - Sign In Form */}
          <div className="bg-white p-8 md:p-12 rounded-3xl  md:w-1/2">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800">Sign In</h2>
              <p className="text-gray-400 text-sm mt-1">to your account</p>

              <form className="mt-8 space-y-6">
                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg"
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

                <Button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Sign In
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Not a member yet?{" "}
                  <a href="/signup" className="text-blue-500">
                Sign Up
              </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
