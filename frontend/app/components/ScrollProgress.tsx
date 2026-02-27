"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            setProgress((currentScroll / scrollHeight) * 100);
        };

        window.addEventListener("scroll", updateScroll, { passive: true });
        updateScroll();

        return () => window.removeEventListener("scroll", updateScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[100] pointer-events-none">
            <div
                className="h-full bg-[#6E14D4]"
                style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 8px #6E14D4",
                    transition: "width 100ms ease-out"
                }}
            />
        </div>
    );
}
