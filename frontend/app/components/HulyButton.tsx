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
    glowColor?: "purple" | "white";
}

export default function HulyButton({
    children,
    href,
    onClick,
    className = "",
    style = {},
    type = "button",
    disabled = false,
    glowColor = "purple",
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
    relative transition-all duration-300
    flex items-center justify-center font-bold uppercase tracking-wider
    rounded-full border ${glowColor === "white" ? "btn-glow-breath-white" : "btn-glow-breath"}
    ${className}
  `;

    // Strip boxShadow and borderColor from caller's style — the CSS animation controls these
    const { boxShadow: _bs, borderColor: _bc, ...cleanStyle } = style;

    const integratedStyle: React.CSSProperties = {
        background: "#000000",
        color: isHovered ? "#fff" : "rgba(255, 255, 255, 0.7)",
        ...cleanStyle,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
    };

    // Define cursor glow colors based on the glowColor prop
    const isWhiteGlow = glowColor === "white";

    const coreGlowGradient = isWhiteGlow
        ? "radial-gradient(circle at center, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 30%, rgba(255, 255, 255, 0.4) 60%, transparent 80%)"
        : "radial-gradient(circle at center, #FFFFFF 0%, #A855F7 25%, #6E14D4 50%, transparent 75%)";

    const bgGlowGradient = isWhiteGlow
        ? "radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 60%, transparent 100%)"
        : "radial-gradient(circle at center, rgba(110, 20, 212, 0.6) 0%, rgba(110, 20, 212, 0.2) 60%, transparent 100%)";

    // The Huly glow effect layer
    const glowLayer = (
        <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 overflow-hidden rounded-full"
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
                {/* Intense Core highlight */}
                <div
                    className="absolute h-[140px] w-[140px]"
                    style={{
                        background: coreGlowGradient,
                        filter: "blur(4px)",
                        opacity: 0.8,
                    }}
                />
                {/* Wider Background glow */}
                <div
                    className="absolute h-[120px] w-[220px]"
                    style={{
                        background: bgGlowGradient,
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
