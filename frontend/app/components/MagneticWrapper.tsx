"use client";

import { useEffect, useRef, useState } from "react";

interface MagneticWrapperProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export default function MagneticWrapper({
    children,
    className = "",
    strength = 30,
}: MagneticWrapperProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;

        const { left, top, width, height } = el.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        // Relative distance within the magnet's pull
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.max(width, height) * 1.5;

        if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            setPosition({
                x: (dx / maxDist) * strength * force,
                y: (dy / maxDist) * strength * force,
            });
        } else {
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div
            ref={ref}
            className={`inline-block transition-transform duration-300 ease-out ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
            }}
        >
            {children}
        </div>
    );
}
