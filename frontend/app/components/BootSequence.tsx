"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "> Initializing MerchantOS...", delay: 0 },
  { text: "> Loading compliance engine... OK", delay: 0 },
  { text: "> Connecting IBM watsonx... OK", delay: 0 },
  { text: "> GNN model loaded (GraphSAGE v1)... OK", delay: 0 },
  { text: "> All systems operational.", delay: 0 },
];

const CHAR_SPEED = 30;

type Phase = "cursor" | "scanline" | "typing" | "fadeout" | "done";

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>("cursor");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineText, setCurrentLineText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 0-400ms: Pure black with cursor blink (dealt with in JSX)
    timeoutRef.current = setTimeout(() => {
      setPhase("scanline");
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // 400-900ms: Scanline expansion phase
  useEffect(() => {
    if (phase !== "scanline") return;

    timeoutRef.current = setTimeout(() => {
      setPhase("typing");
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase]);

  // 900-1400ms: Typing phase (now part of the 1200ms sequence)
  useEffect(() => {
    if (phase !== "typing") return;

    if (currentLineIndex >= BOOT_LINES.length) {
      // 1.2s total boot text sequence ends around 900 + 1200 = 2100ms
      // We'll transition to fadeout after a short pause
      timeoutRef.current = setTimeout(() => setPhase("fadeout"), 200);
      return;
    }

    const line = BOOT_LINES[currentLineIndex];
    let charIdx = 0;
    setCurrentLineText("");

    const typeChar = () => {
      charIdx++;
      const nextChar = line.text.slice(0, charIdx);
      setCurrentLineText(nextChar);

      if (charIdx < line.text.length) {
        timeoutRef.current = setTimeout(typeChar, CHAR_SPEED);
      } else {
        // Line complete
        timeoutRef.current = setTimeout(() => {
          setVisibleLines((prev) => [...prev, line.text]);
          setCurrentLineText("");
          setCurrentLineIndex((i) => i + 1);
        }, 50);
      }
    };

    typeChar();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, currentLineIndex]);

  // 1400-2000ms: Fadeout upward (started around 2.1s based on text lengths)
  useEffect(() => {
    if (phase !== "fadeout") return;
    
    timeoutRef.current = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 600);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
      style={{
        pointerEvents: "all",
      }}
    >
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scanlineExpand {
          from { transform: scaleX(0); opacity: 1; }
          to { transform: scaleX(1); opacity: 0; }
        }
      `}</style>

      {/* 0-400ms: Pulse cursor */}
      {phase === "cursor" && (
        <div
          style={{
            width: 2,
            height: 20,
            background: "#fff",
            animation: "cursorBlink 500ms step-end infinite",
          }}
        />
      )}

      {/* 400-900ms: Scanline */}
      {phase === "scanline" && (
        <div
          className="absolute left-0 right-0 h-[1px] bg-white"
          style={{
            top: "50%",
            boxShadow: "0 0 8px rgba(255,255,255,0.8)",
            animation: "scanlineExpand 500ms ease-out forwards",
            transformOrigin: "center",
          }}
        />
      )}

      {/* Terminal Text */}
      {(phase === "typing" || phase === "fadeout") && (
        <div
          className="font-mono text-[14px] text-[#22C55E]"
          style={{
            transition: "all 600ms ease-out",
            opacity: phase === "fadeout" ? 0 : 1,
            transform: phase === "fadeout" ? "translateY(-20px)" : "translateY(0)",
          }}
        >
          {visibleLines.map((line, i) => (
            <div key={i} className="mb-1">{line}</div>
          ))}
          {currentLineText && (
            <div className="relative">
              {currentLineText}
              <span
                className="inline-block w-[2px] h-[14px] bg-white ml-1 animate-pulse"
                style={{ verticalAlign: "middle" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
