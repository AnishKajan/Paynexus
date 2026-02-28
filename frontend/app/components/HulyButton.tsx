"use client";

import React, { useRef, useState, useEffect } from "react";

interface HulyButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

export default function HulyButton({
    children,
    href,
    onClick,
    className = "",
    style = {},
    type = "button",
    disabled = false,
}: HulyButtonProps) {
    const [mPos, setMPos] = useState({ x: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Raw X relative to the left edge
        setMPos({ x: e.clientX - rect.left });
    };

    // Base styles for the button
    const baseClassName = `
    relative overflow-hidden transition-all duration-300
    flex items-center justify-center font-bold uppercase tracking-wider
    rounded-full border
    ${className}
  `;

    const integratedStyle: React.CSSProperties = {
        background: "#000000",
        borderColor: isHovered ? "rgba(110, 20, 212, 0.5)" : "rgba(255, 255, 255, 0.1)",
        color: isHovered ? "#fff" : "rgba(255, 255, 255, 0.7)",
        ...style,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
    };

    // The Huly glow effect layer
    const glowLayer = (
        <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
                opacity: isHovered && !disabled ? 1 : 0,
                zIndex: 0,
            }}
        >
            <div
                className="absolute top-1/2 left-0 flex items-center justify-center w-[240px]"
                style={{
                    transform: `translateX(${mPos.x}px) translateX(-50%) translateY(-50%) translateZ(0px)`,
                    transition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)",
                }}
            >
                {/* Intense Core highlight - Purple themed */}
                <div
                    className="absolute h-[140px] w-[140px]"
                    style={{
                        background: "radial-gradient(center, circle, #FFFFFF 0%, #A855F7 30%, #6E14D4 60%, transparent 80%)",
                        backgroundImage: "radial-gradient(circle at center, #FFFFFF 0%, #A855F7 25%, #6E14D4 50%, transparent 75%)",
                        filter: "blur(4px)",
                        opacity: 0.8,
                    }}
                />
                {/* Wider Background glow */}
                <div
                    className="absolute h-[120px] w-[220px]"
                    style={{
                        background: "radial-gradient(circle at center, rgba(110, 20, 212, 0.6) 0%, rgba(110, 20, 212, 0.2) 60%, transparent 100%)",
                        filter: "blur(12px)",
                    }}
                />
            </div>
        </div>
    );

    const content = (
        <>
            {glowLayer}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </>
    );

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    if (href) {
        return (
            <a
                href={href}
                className={baseClassName}
                style={integratedStyle}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div ref={containerRef} className="absolute inset-0 pointer-events-none" />
                {content}
            </a>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={baseClassName}
            style={integratedStyle}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div ref={containerRef} className="absolute inset-0 pointer-events-none" />
            {content}
        </button>
    );
}
