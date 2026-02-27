"use client";

import { useEffect, useRef } from "react";

export default function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const particleCount = 60;
        const connectionDist = 120;
        const repulsionDist = 100;
        const repulsionForce = 0.5;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;

            constructor(w: number, h: number) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = 2;
            }

            update(w: number, h: number) {
                // Repulsion from mouse
                const dx = this.x - mouseRef.current.x;
                const dy = this.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < repulsionDist) {
                    const force = (repulsionDist - dist) / repulsionDist;
                    this.vx += (dx / dist) * force * repulsionForce;
                    this.vy += (dy / dist) * force * repulsionForce;
                }

                this.x += this.vx;
                this.y += this.vy;

                // Bouncing
                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;

                // Friction to prevent infinite speed increase from repulsion
                this.vx *= 0.99;
                this.vy *= 0.99;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
                ctx.fill();
            }
        }

        const setSize = () => {
            canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.offsetHeight || 800;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height));
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                p1.update(canvas.width, canvas.height);
                p1.draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDist) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist / connectionDist)})`;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        setSize();
        window.addEventListener("resize", setSize);
        window.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);
        animate();

        return () => {
            window.removeEventListener("resize", setSize);
            window.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
