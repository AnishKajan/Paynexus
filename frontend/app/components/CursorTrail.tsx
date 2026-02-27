"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  opacity: number;
  radius: number;
  vx: number;
  vy: number;
}

const PARTICLE_COUNT = 2;      // spawned per mousemove event
const MAX_PARTICLES = 80;
const BASE_RADIUS = 3.5;
const FADE_SPEED = 0.038;
const DRIFT = 0.18;            // subtle upward/outward drift

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mousePos = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Track mouse
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (particles.current.length >= MAX_PARTICLES) {
          particles.current.shift(); // drop oldest
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.4;
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 4,
          y: e.clientY + (Math.random() - 0.5) * 4,
          opacity: 0.55 + Math.random() * 0.3,
          radius: BASE_RADIUS * (0.6 + Math.random() * 0.8),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - DRIFT,
        });
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= FADE_SPEED;

        if (p.opacity <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        // Outer glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
        glow.addColorStop(0, `rgba(110, 20, 212, ${p.opacity * 0.35})`);
        glow.addColorStop(1, "rgba(110, 20, 212, 0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        core.addColorStop(0, `rgba(200, 150, 255, ${p.opacity})`);
        core.addColorStop(0.5, `rgba(110, 20, 212, ${p.opacity * 0.85})`);
        core.addColorStop(1, `rgba(110, 20, 212, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
