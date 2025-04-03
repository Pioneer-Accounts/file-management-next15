"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    
    if (accessToken) {
      router.push("/dashboard");
    } else {
      router.push("/signin");
    }
  }, [router]);

  // Return null or a loading state while redirecting
  return null;
}