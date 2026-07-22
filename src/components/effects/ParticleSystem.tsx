'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  el: HTMLDivElement;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  offsetX: number;
  offsetY: number;
}

export function ParticleSystem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const particleContainer = containerRef.current;
    const particleCount = 40;
    const particles: Particle[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let animationFrameId: number;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const speedX = (Math.random() - 0.5) * 0.5;
      const speedY = (Math.random() - 0.5) * 0.5 - 0.2; 
      const opacity = Math.random() * 0.5 + 0.1;
      
      p.style.position = 'absolute';
      p.style.backgroundColor = 'rgba(16, 185, 129, 0.6)';
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.borderRadius = '50%';
      p.style.transition = 'transform 0.1s ease-out';
      
      p.style.left = `${x}%`;
      p.style.top = `${y}%`;
      p.style.opacity = opacity.toString();
      
      particleContainer.appendChild(p);
      
      particles.push({
        el: p,
        x,
        y,
        speedX,
        speedY,
        offsetX: 0,
        offsetY: 0
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 20; 
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 20;
      
      // Handle editor glow effect if it exists
      const editorContainer = document.getElementById('editor-container');
      const editorGlow = document.getElementById('editor-glow');
      if (editorContainer && editorGlow) {
        const rect = editorContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        editorGlow.style.left = `${x}px`;
        editorGlow.style.top = `${y}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    const animateParticles = () => {
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.y < -10) p.y = 110;
        if (p.y > 110) p.y = -10;
        if (p.x < -10) p.x = 110;
        if (p.x > 110) p.x = -10;
        
        p.offsetX = mouseX * (p.speedX + 1);
        p.offsetY = mouseY * (p.speedY + 1);
        
        p.el.style.transform = `translate(${p.offsetX}px, ${p.offsetY}px)`;
        p.el.style.left = `${p.x}%`;
        p.el.style.top = `${p.y}%`;
      });
      
      animationFrameId = requestAnimationFrame(animateParticles);
    };
    
    animateParticles();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Cleanup particles
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      id="particles" 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden" 
    />
  );
}
