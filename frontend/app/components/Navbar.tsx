"use client";

import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10"
      style={{
        height: 60,
        background: scrolled
          ? "rgba(0,0,0,0.85)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid rgba(110,20,212,0.15)"
          : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition:
          "background 300ms ease-out, border-color 300ms ease-out, backdrop-filter 300ms ease-out",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Paynexus-logo.svg"
          alt="Paynexus logo"
          width={28}
          height={28}
          style={{
            borderRadius: 6,
            boxShadow: "0 0 12px rgba(110,20,212,0.5)",
          }}
        />
        <span className="font-black text-sm tracking-wide uppercase">
          Paynexus
        </span>
      </div>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-8 text-sm">
        {["Product", "Compliance", "MCP", "Pricing", "Docs"].map((item) => (
          <a
            key={item}
            href="#"
            className="transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color =
                "rgba(255,255,255,0.5)";
            }}
          >
            {item}
          </a>
        ))}
      </nav>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          className="hidden md:block text-sm transition-colors duration-200"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(255,255,255,0.5)";
          }}
        >
          Sign in
        </a>
        <button
          className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200"
          style={{
            background: "#6E14D4",
            color: "#fff",
            boxShadow: "0 0 12px rgba(110,20,212,0.35)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 24px rgba(110,20,212,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 12px rgba(110,20,212,0.35)";
          }}
        >
          Get API Key
        </button>
      </div>
    </header>
  );
}
