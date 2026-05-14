"use client";

import { useEffect, useRef } from "react";
import s from "@/styles/layout/AnimatedBackground.module.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  lime: boolean;
  pulse: number;
  pulseSpeed: number;
}

const LIME = "132, 204, 22";
const NEUTRAL = "180, 180, 195";
const N = 60;
const MAX_DIST = 140;
const BASE_SPEED = 0.22;

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawn = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * BASE_SPEED * 2,
      vy: (Math.random() - 0.5) * BASE_SPEED * 2,
      r: Math.random() * 1.2 + 0.4,
      lime: Math.random() < 0.18,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012,
    });

    const init = () => {
      particles = Array.from({ length: N }, spawn);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.x < -10) p.x = canvas.width + 10;
        else if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        else if (p.y > canvas.height + 10) p.y = -10;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const fade = (1 - dist / MAX_DIST);
            const isLime = a.lime || b.lime;
            const color = isLime ? LIME : NEUTRAL;
            const opacity = isLime ? fade * 0.18 : fade * 0.07;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.lineWidth = isLime ? 0.8 : 0.6;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const pulseScale = 1 + Math.sin(p.pulse) * 0.25;
        if (p.lime) {
          const haloR = p.r * 3.5 * pulseScale;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
          grd.addColorStop(0, `rgba(${LIME}, 0.18)`);
          grd.addColorStop(1, `rgba(${LIME}, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (p.lime ? pulseScale : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.lime
          ? `rgba(${LIME}, ${0.55 + Math.sin(p.pulse) * 0.15})`
          : `rgba(${NEUTRAL}, 0.15)`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={s.canvas} />;
}
