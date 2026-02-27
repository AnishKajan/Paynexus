"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
    target: number;
    duration?: number;
    suffix?: string;
    decimals?: number;
}

export default function CountUp({
    target,
    duration = 2000,
    suffix = "",
    decimals = 0,
}: CountUpProps) {
    const [count, setCount] = useState(0);
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const startRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;

        startRef.current = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: ease-out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            setCount(easedProgress * target);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [visible, target, duration]);

    return (
        <span ref={ref}>
            {count.toFixed(decimals)}
            {suffix}
        </span>
    );
}
