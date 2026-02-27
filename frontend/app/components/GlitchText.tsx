"use client";

import { useState, useEffect } from "react";

interface GlitchTextProps {
    text: string;
    className?: string;
}

export default function GlitchText({ text, className = "" }: GlitchTextProps) {
    const [isGlitching, setIsGlitching] = useState(false);
    const [glitchText, setGlitchText] = useState(text);

    useEffect(() => {
        if (!isGlitching) {
            setGlitchText(text);
            return;
        }

        const interval = setInterval(() => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
            const newText = text.split("").map((char) => {
                if (char === " " || Math.random() > 0.15) return char;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join("");
            setGlitchText(newText);
        }, 60);

        const timeout = setTimeout(() => {
            setIsGlitching(false);
        }, 400);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [isGlitching, text]);

    return (
        <span
            className={`relative inline-block cursor-default ${className}`}
            onMouseEnter={() => setIsGlitching(true)}
            style={{
                textShadow: isGlitching
                    ? "2px 0 #ff00c1, -2px 0 #00fff9"
                    : "none",
                transition: "text-shadow 0.1s ease",
            }}
        >
            {glitchText}
            {isGlitching && (
                <span
                    className="absolute inset-0 opacity-50 translate-x-[2px] -translate-y-[1px] text-[#ff00c1] pointer-events-none"
                    aria-hidden="true"
                >
                    {glitchText}
                </span>
            )}
            {isGlitching && (
                <span
                    className="absolute inset-0 opacity-50 -translate-x-[2px] translate-y-[1px] text-[#00fff9] pointer-events-none"
                    aria-hidden="true"
                >
                    {glitchText}
                </span>
            )}
        </span>
    );
}
