"use client";

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

interface TOCSection {
    id: string;
    title: string;
}

interface LegalPageLayoutProps {
    title: string;
    lastUpdated: string;
    sections: TOCSection[];
    children: React.ReactNode;
}

export default function LegalPageLayout({
    title,
    lastUpdated,
    sections,
    children,
}: LegalPageLayoutProps) {
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        // Setup IntersectionObserver to highlight active TOC item
        const observer = new IntersectionObserver(
            (entries) => {
                // Find the first visible entry
                const visibleEntry = entries.find((entry) => entry.isIntersecting);
                if (visibleEntry) {
                    setActiveSection(visibleEntry.target.id);
                }
            },
            { rootMargin: "0px 0px -60% 0px", threshold: 0.1 } // Trigger when element hits top 40% of viewport
        );

        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sections]);

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            // Account for potential fixed headers
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-900/50 selection:text-white">
            {/* Absolute positioning so it doesn't shift layout, z-index to stay above content */}
            <div className="absolute top-0 w-full z-50">
                <Navbar />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
                {/* Header Area */}
                <div className="max-w-3xl mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white/90">
                        {title}
                    </h1>
                    <p className="text-white/50 text-sm">
                        Last Updated: {lastUpdated}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

                    {/* Main Content */}
                    <div className="flex-1 max-w-3xl">
                        {/* 
              Prose styling tailored for dark mode long-form reading.
              Uses leading-relaxed for comfortable line height.
              Text color is slightly muted (white/80) to reduce eye strain.
            */}
                        <article className="prose prose-invert prose-p:text-white/80 prose-p:leading-relaxed prose-headings:text-white/90 prose-a:text-purple-400 prose-li:text-white/80 prose-li:leading-relaxed marker:text-purple-500 max-w-none">
                            {children}
                        </article>
                    </div>

                    {/* Sticky Table of Contents Sidebar (Hidden on mobile) */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-32">
                            <h4 className="font-semibold text-white/90 mb-4 text-sm uppercase tracking-wider">
                                Contents
                            </h4>
                            <nav className="flex flex-col space-y-3 border-l border-white/10 pl-4">
                                {sections.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        onClick={(e) => handleScrollTo(e, section.id)}
                                        className={`text-sm transition-colors duration-200 ${activeSection === section.id
                                                ? "text-purple-400 font-medium"
                                                : "text-white/50 hover:text-white/80"
                                            }`}
                                    >
                                        {section.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
