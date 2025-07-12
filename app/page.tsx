"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { loginUser } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { loading, error, isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );

  // GSAP animation on mount
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(
      inputsRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out", 
        stagger: 0.15,
        delay: 0.5,
      }
    );
  }, []);

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && token) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, token, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
    console.log("Redux auth state", {
      isAuthenticated,
      token,
      loading,
      error,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
      <div className="w-[55%] h-[70vh] p-4 bg-[#ffffff] rounded-3xl flex items-center gap-8 justify-between">
      <div className="w-full h-full rounded-2xl overflow-hidden">
  <Carousel
    plugins={[
      Autoplay({
        delay: 5000,
      }),
    ]}
    className="w-full h-full"
    opts={{
      loop: true,
    }}
  >
    <CarouselContent>
  {[1, 2, 3, 4, 5].map((num) => (
    <CarouselItem key={num}>
      <div className="relative w-full h-[650px] rounded-xl overflow-hidden">
        <Image
          src={`/LoginPage/Login ${num}.jpg`}
          alt={`Login ${num}`}
          fill
          className="object-cover"
          priority={num === 1}
        />
      </div>
    </CarouselItem>
  ))}
</CarouselContent>
  </Carousel>
</div>

      <div
        ref={cardRef}
        className="w-full max-w-md p-8 bg-[#ffffff] rounded-2xl sm:p-10"
      >
        <h1 className="text-2xl font-bold text-center mb-12 text-gray-900 tracking-tight">
          UWF Member Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2" ref={el => { if (el) inputsRef.current[0] = el; }}>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-2" ref={el => { if (el) inputsRef.current[1] = el; }}>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <div ref={el => { if (el) inputsRef.current[2] = el; }}>
            <Button
              type="submit"
              className="w-full bg-[#292929] hover:bg-zinc-900 text-white font-semibold py-3 rounded-md transition-colors duration-200 tracking-wide"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
              Only UWF Registered Members can access the UWF Portal 
          </p>
        </form>
      </div>
      </div>
    </div>
  );
}
