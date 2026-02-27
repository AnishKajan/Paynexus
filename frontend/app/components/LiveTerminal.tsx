"use client";

import { useEffect, useRef, useState } from "react";

type LineType = "command" | "output" | "arrow" | "blank" | "progress";

interface TerminalLine {
  type: LineType;
  text: string;
}

const SCRIPT: TerminalLine[] = [
  { type: "command", text: "$ merchantos init --project my-saas-app" },
  { type: "output", text: "  ✓ Config created" },
  { type: "blank", text: "" },
  { type: "command", text: "$ merchantos keys create --tag billing" },
  { type: "output", text: "  ✓ sk_live_•••••••••••••6f2a" },
  { type: "blank", text: "" },
  { type: "command", text: "$ mcp.createCheckoutSession({" },
  { type: "command", text: "    amount: 4900," },
  { type: "command", text: '    currency: "usd"' },
  { type: "command", text: "  })" },
  { type: "blank", text: "" },
  { type: "arrow", text: "  → Connecting to MerchantOS..." },
  { type: "arrow", text: "  → Session created: cs_live_Kx9..." },
  { type: "arrow", text: "  → Checkout URL ready ✓" },
  { type: "blank", text: "" },
  { type: "command", text: "$ merchantos compliance --scan" },
  { type: "output", text: "  Running GNN inference..." },
  { type: "progress", text: "  [████████████████] 100%" },
  { type: "output", text: "  AML Risk: 0.08 ✓ LOW" },
  { type: "output", text: "  Fraud Risk: 0.06 ✓ LOW" },
  { type: "blank", text: "" },
  { type: "output", text: "  All clear. Ready to charge." },
];

const CHAR_SPEED = 18;
const LOOP_PAUSE = 5000;

function getLineColor(type: LineType): string {
  switch (type) {
    case "command":
      return "#ffffff";
    case "output":
      return "#22C55E";
    case "arrow":
      return "#3B82F6";
    case "progress":
      return "#ffffff"; // Bar characters usually look better in white or dim white
    case "blank":
      return "transparent";
  }
}

export default function LiveTerminal() {
  const [renderedLines, setRenderedLines] = useState<TerminalLine[]>([]);
  const [currentTyping, setCurrentTyping] = useState("");
  const [scriptIndex, setScriptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [looping, setLooping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLine = SCRIPT[scriptIndex];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [renderedLines, currentTyping]);

  useEffect(() => {
    if (looping) return;

    if (scriptIndex >= SCRIPT.length) {
      // Loop: wait then restart
      timerRef.current = setTimeout(() => {
        setRenderedLines([]);
        setCurrentTyping("");
        setScriptIndex(0);
        setCharIndex(0);
        setLooping(false);
      }, LOOP_PAUSE);
      return;
    }

    if (!currentLine) return;

    if (currentLine.type === "blank") {
      timerRef.current = setTimeout(() => {
        setRenderedLines((prev) => [...prev, currentLine]);
        setScriptIndex((i) => i + 1);
        setCharIndex(0);
      }, 80);
      return;
    }

    if (charIndex < currentLine.text.length) {
      timerRef.current = setTimeout(() => {
        setCurrentTyping(currentLine.text.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, CHAR_SPEED);
    } else {
      // Line complete
      timerRef.current = setTimeout(() => {
        setRenderedLines((prev) => [...prev, currentLine]);
        setCurrentTyping("");
        setScriptIndex((i) => i + 1);
        setCharIndex(0);
      }, currentLine.type === "command" ? 120 : 60);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scriptIndex, charIndex, currentLine, looping]);

  return (
    <div
      className="font-mono text-xs leading-relaxed relative"
      style={{
        width: 400,
        height: 280,
        background: "#0D0D0D",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(110,20,212,0.25)",
        boxShadow:
          "0 0 40px rgba(110,20,212,0.15), 0 20px 60px rgba(0,0,0,0.8)",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4"
        style={{
          height: 34,
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          className="inline-block rounded-full"
          style={{ width: 10, height: 10, background: "#EF4444" }}
        />
        <span
          className="inline-block rounded-full"
          style={{ width: 10, height: 10, background: "#F59E0B" }}
        />
        <span
          className="inline-block rounded-full"
          style={{ width: 10, height: 10, background: "#22C55E" }}
        />
        <span
          className="ml-auto text-xs"
          style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}
        >
          paynexus — terminal
        </span>
      </div>

      {/* Terminal content */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{
          height: "calc(100% - 34px)",
          padding: "12px 16px",
          scrollbarWidth: "none",
        }}
      >
        {renderedLines.map((line, i) => (
          <div
            key={i}
            style={{
              color: getLineColor(line.type),
              lineHeight: "1.6",
              whiteSpace: "pre",
            }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}

        {/* Currently typing line */}
        {currentTyping && (
          <div
            style={{
              color: getLineColor(currentLine?.type ?? "command"),
              lineHeight: "1.6",
              whiteSpace: "pre",
            }}
          >
            {currentTyping}
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: "0.85em",
                background: "#6E14D4",
                marginLeft: 1,
                verticalAlign: "middle",
                animation: "cursorBlink 500ms step-end infinite",
              }}
            />
          </div>
        )}

        {/* Idle cursor when nothing typing */}
        {!currentTyping && scriptIndex < SCRIPT.length && (
          <div style={{ lineHeight: "1.6" }}>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: "0.85em",
                background: "#6E14D4",
                animation: "cursorBlink 500ms step-end infinite",
                verticalAlign: "middle",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
