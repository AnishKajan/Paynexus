"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "Initializing Paynexus...", delay: 0 },
  { text: "Loading compliance engine... OK", delay: 180 },
  { text: "Connecting IBM watsonx... OK", delay: 360 },
  { text: "GNN model loaded (GraphSAGE v1)... OK", delay: 540 },
  { text: "Payment engine online.", delay: 720 },
  { text: "All systems operational.", delay: 900 },
];

const CHAR_SPEED = 30;

type Phase =
  | "cursor"
  | "scanline"
  | "typing"
  | "fadeout"
  | "done";

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>("cursor");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineText, setCurrentLineText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [scanlineWidth, setScanlineWidth] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Phase: cursor blinks for 400ms
    timeoutRef.current = setTimeout(() => {
      setPhase("scanline");
    }, 400);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Scanline expansion phase
  useEffect(() => {
    if (phase !== "scanline") return;

    const duration = 500;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setScanlineWidth(progress * 100);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setPhase("typing");
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // Typing phase
  useEffect(() => {
    if (phase !== "typing") return;
    if (currentLineIndex >= BOOT_LINES.length) {
      // All lines typed — wait then fadeout
      timeoutRef.current = setTimeout(() => setPhase("fadeout"), 400);
      return;
    }

    const line = BOOT_LINES[currentLineIndex];
    let charIdx = 0;
    setCurrentLineText("");

    const typeChar = () => {
      charIdx++;
      setCurrentLineText(line.text.slice(0, charIdx));
      if (charIdx < line.text.length) {
        timeoutRef.current = setTimeout(typeChar, CHAR_SPEED);
      } else {
        // Line complete — move to next
        timeoutRef.current = setTimeout(() => {
          setVisibleLines((prev) => [...prev, line.text]);
          setCurrentLineText("");
          setCurrentLineIndex((i) => i + 1);
        }, 80);
      }
    };

    timeoutRef.current = setTimeout(typeChar, line.delay > 0 ? 60 : 0);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, currentLineIndex]);

  // Fadeout → done
  useEffect(() => {
    if (phase !== "fadeout") return;
    timeoutRef.current = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 700);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, onComplete]);

  if (phase === "done") return null;

  const isTyping = phase === "typing";
  const isFadeout = phase === "fadeout";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      style={{
        transition: isFadeout ? "opacity 600ms ease-out" : undefined,
        opacity: isFadeout ? 0 : 1,
      }}
      aria-hidden="true"
    >
      {/* Blinking cursor — only in cursor phase */}
      {phase === "cursor" && (
        <div
          style={{
            width: 2,
            height: 20,
            background: "#fff",
            boxShadow: "0 0 8px rgba(255,255,255,0.8)",
            animation: "cursorBlink 500ms step-end infinite",
          }}
        />
      )}

      {/* Scanline */}
      {phase === "scanline" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: 1,
            width: `${scanlineWidth}%`,
            background: "#fff",
            boxShadow: "0 0 8px rgba(255,255,255,0.8)",
            transform: "translateY(-50%)",
            transition: "none",
          }}
        />
      )}

      {/* Terminal output */}
      {(isTyping || isFadeout) && (
        <div
          className="font-mono text-sm"
          style={{
            minWidth: 420,
            maxWidth: 520,
            padding: "0 16px",
            transition: isFadeout ? "opacity 600ms ease-out, transform 600ms ease-out" : undefined,
            opacity: isFadeout ? 0 : 1,
            transform: isFadeout ? "translateY(-30px)" : "translateY(0)",
          }}
        >
          {visibleLines.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.includes("OK") || line.includes("online") || line.includes("operational")
                  ? "#22C55E"
                  : "#e5e7eb",
                lineHeight: "1.7",
                fontSize: 13,
              }}
            >
              {line}
            </div>
          ))}
          {currentLineText && (
            <div style={{ color: "#e5e7eb", lineHeight: "1.7", fontSize: 13 }}>
              {currentLineText}
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 13,
                  background: "#fff",
                  marginLeft: 2,
                  verticalAlign: "middle",
                  animation: "cursorBlink 500ms step-end infinite",
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
