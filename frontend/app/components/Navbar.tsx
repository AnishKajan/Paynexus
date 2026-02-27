"use client";

import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 80);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes glowBreath {
          0%, 100% {
            box-shadow: 0 0 20px rgba(110, 20, 212, 0.4),
                        0 0 40px rgba(110, 20, 212, 0.2),
                        inset 0 0 20px rgba(110, 20, 212, 0.1),
                        0 8px 32px rgba(110, 20, 212, 0.15);
          }
          50% {
            box-shadow: 0 0 40px rgba(110, 20, 212, 0.7),
                        0 0 80px rgba(110, 20, 212, 0.4),
                        inset 0 0 40px rgba(110, 20, 212, 0.2),
                        0 12px 48px rgba(110, 20, 212, 0.3);
          }
        }
        
        @keyframes glowBreathScrolled {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(110, 20, 212, 0.2),
                        0 0 30px rgba(110, 20, 212, 0.15),
                        inset 0 0 15px rgba(110, 20, 212, 0.08);
          }
          50% {
            box-shadow: 0 12px 48px rgba(110, 20, 212, 0.35),
                        0 0 50px rgba(110, 20, 212, 0.25),
                        inset 0 0 30px rgba(110, 20, 212, 0.12);
          }
        }
      `}</style>

      <header
        className="fixed top-6 left-1/2 z-40 -translate-x-1/2"
        style={{
          width: "calc(100% - 32px)",
          maxWidth: "1200px",
        }}
      >
        <div
          className="flex items-center justify-start px-6 md:px-8 py-3 rounded-3xl transition-all duration-300"
          style={{
            background: scrolled
              ? "rgba(13,13,13,0.96)"
              : "rgba(13,13,13,0.85)",
            border: `1px solid ${
              scrolled ? "rgba(110,20,212,0.35)" : "rgba(110,20,212,0.25)"
            }`,
            backdropFilter: "blur(20px)",
            animation: scrolled
              ? "glowBreathScrolled 4s ease-in-out infinite"
              : "glowBreath 4s ease-in-out infinite",
          }}
        >
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Paynexus-logo.svg"
              alt="Paynexus logo"
              width={28}
              height={28}
              style={{
                borderRadius: 6,
                boxShadow: "0 0 12px rgba(110,20,212,0.4)",
              }}
            />
            <span className="font-black text-sm tracking-wide uppercase hidden sm:inline">
              Paynexus
            </span>
          </a>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm ml-8">
            {["Product", "Compliance", "MCP", "Pricing", "Docs"].map((item) => {
              const href =
                item === "Docs" ? "https://paynexus-docs.vercel.app/" : "#";
              const target = item === "Docs" ? "_blank" : undefined;
              const rel = item === "Docs" ? "noopener noreferrer" : undefined;
              return (
                <a
                  key={item}
                  href={href}
                  target={target}
                  rel={rel}
                  className="px-3 py-1.5 rounded-xl transition-all duration-200"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.9)";
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(110,20,212,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.5)";
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                  }}
                >
                  {item}
                </a>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2.5 flex-shrink-0 ml-auto">
            <a
              href="/login"
              className="hidden md:block text-sm px-3 py-1.5 rounded-xl transition-all duration-200"
              style={{
                color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.9)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(110,20,212,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.5)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent";
              }}
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-2xl transition-all duration-200 inline-block"
              style={{
                background: "#6E14D4",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(110,20,212,0.3)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 8px 24px rgba(110,20,212,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 4px 16px rgba(110,20,212,0.3)";
              }}
            >
              Get API Key
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
