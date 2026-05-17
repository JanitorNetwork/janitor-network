"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomePage from "@/components/pages/HomePage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("jn_welcomed")) {
      router.replace("/welcome");
    }
  }, [router]);

  return <HomePage />;
}
