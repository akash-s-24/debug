'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// ─── Particle Field Background ─────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#00F0FF', '#FF006E', '#7B2FF7', '#00FF88'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnections();

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Simple hex to rgba
        const hex = p.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.15})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();
    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg shadow-black/30' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center font-display font-bold text-void text-sm">
            DD
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-text-primary group-hover:text-neon-cyan transition-colors">
            DEBUG DUEL
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-text-secondary hover:text-neon-cyan transition-colors font-body text-sm tracking-wide">
            Features
          </a>
          <a href="#how-it-works" className="text-text-secondary hover:text-neon-cyan transition-colors font-body text-sm tracking-wide">
            How It Works
          </a>
          <Link
            href="/create"
            className="btn-glow-cyan px-6 py-2.5 rounded-lg font-heading font-semibold text-neon-cyan tracking-wider text-sm"
          >
            CREATE ROOM
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-text-secondary hover:text-neon-cyan p-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </motion.nav>
  );
}

// ─── Animated Counter ───────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Hero Section ───────────────────────────────────────────────────────────
function HeroSection() {
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinRole, setJoinRole] = useState<'contestant' | 'viewer'>('contestant');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('join=true')) {
      setShowJoinModal(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    
    if (joinRole === 'contestant') {
      if (!joinName) return;
      router.push(`/battle/${joinCode.toUpperCase()}?name=${encodeURIComponent(joinName)}&role=contestant`);
    } else {
      router.push(`/arena/${joinCode.toUpperCase()}`);
    }
  };

  const containerVariants: import('framer-motion').Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-neon-violet/8 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-neon-magenta/5 rounded-full blur-[80px]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-8">
          <span className="px-4 py-1.5 rounded-full glass neon-border-cyan text-xs font-mono text-neon-cyan tracking-wider uppercase">
            <span className="inline-block w-2 h-2 bg-neon-green rounded-full mr-2 animate-glow-pulse" />
            Live Coding Battles
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6"
        >
          <span className="block text-text-primary">DEBUG</span>
          <span className="block bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta bg-clip-text text-transparent">
            DUEL ARENA
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="font-body text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          The esports-style live coding battle platform. Share your screen,
          compete in real-time, and prove you&apos;re the ultimate developer.
        </motion.p>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-sm text-text-muted mb-10 tracking-wide"
        >
          {'>'} Enter the arena. Debug faster. Win glory.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/create"
            className="group relative px-8 py-4 rounded-xl font-heading font-bold text-lg tracking-wider overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-violet opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-violet opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
            <span className="relative text-void">START A DUEL</span>
          </Link>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-glow-violet px-8 py-4 rounded-xl font-heading font-semibold text-lg tracking-wider text-neon-violet"
          >
            JOIN ARENA
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: 12847, label: 'Battles Fought', suffix: '+' },
            { value: 4200, label: 'Active Duelers', suffix: '+' },
            { value: 99, label: 'Uptime', suffix: '%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-neon-cyan">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-body text-xs text-text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-text-muted text-xs font-mono tracking-widest">SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-text-muted/30 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-neon-cyan rounded-full" />
        </motion.div>
      </motion.div>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-abyss border border-white/10 rounded-xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-display font-bold text-neon-cyan mb-6">JOIN ARENA</h2>
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary font-mono mb-1">ROOM CODE (6 CHARS)</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="e.g. A1B2C3"
                    maxLength={6}
                    className="w-full bg-void border border-white/10 rounded p-3 text-white font-mono focus:border-neon-cyan focus:outline-none uppercase tracking-widest transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary font-mono mb-1">JOIN AS</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-white cursor-pointer group">
                      <input
                        type="radio"
                        checked={joinRole === 'contestant'}
                        onChange={() => setJoinRole('contestant')}
                        className="accent-neon-cyan"
                      />
                      <span className="group-hover:text-neon-cyan transition-colors">Contestant</span>
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer group">
                      <input
                        type="radio"
                        checked={joinRole === 'viewer'}
                        onChange={() => setJoinRole('viewer')}
                        className="accent-neon-magenta"
                      />
                      <span className="group-hover:text-neon-magenta transition-colors">Viewer</span>
                    </label>
                  </div>
                </div>
                <AnimatePresence mode="popLayout">
                  {joinRole === 'contestant' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-sm text-text-secondary font-mono mb-1 mt-2">YOUR NAME</label>
                      <input
                        type="text"
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        placeholder="e.g. Neo"
                        className="w-full bg-void border border-white/10 rounded p-3 text-white font-body focus:border-neon-cyan focus:outline-none transition-colors"
                        required
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={joinCode.length < 6}
                    className="w-full btn-glow-cyan bg-neon-cyan text-void font-bold py-3 rounded uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Enter Room
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Features Section ───────────────────────────────────────────────────────
const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Live Screen Sharing',
    description: 'Share your IDE in real-time via WebRTC. Audiences see every keystroke, every debug step, every breakthrough moment.',
    color: 'neon-cyan',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Timed Challenges',
    description: 'From 5-minute sprints to 60-minute marathons. Choose your battle format and race against the clock.',
    color: 'neon-magenta',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Up to 8 Players',
    description: 'Duel 1v1 or run a full tournament with up to 8 contestants battling simultaneously.',
    color: 'neon-violet',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: 'Arena Viewer Mode',
    description: 'Dedicated spectator view optimized for large screens, projectors, and streaming. Built for esports.',
    color: 'neon-green',
  },

  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Multiple Duel Types',
    description: 'Debug Race, Algorithm Sprint, Code Golf, Freestyle — choose your arena format.',
    color: 'neon-red',
  },
];

const colorMap: Record<string, { border: string; text: string; bg: string; glow: string }> = {
  'neon-cyan': { border: 'border-neon-cyan/30', text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', glow: 'group-hover:shadow-neon-cyan/20' },
  'neon-magenta': { border: 'border-neon-magenta/30', text: 'text-neon-magenta', bg: 'bg-neon-magenta/10', glow: 'group-hover:shadow-neon-magenta/20' },
  'neon-violet': { border: 'border-neon-violet/30', text: 'text-neon-violet', bg: 'bg-neon-violet/10', glow: 'group-hover:shadow-neon-violet/20' },
  'neon-green': { border: 'border-neon-green/30', text: 'text-neon-green', bg: 'bg-neon-green/10', glow: 'group-hover:shadow-neon-green/20' },
  'neon-yellow': { border: 'border-neon-yellow/30', text: 'text-neon-yellow', bg: 'bg-neon-yellow/10', glow: 'group-hover:shadow-neon-yellow/20' },
  'neon-red': { border: 'border-neon-red/30', text: 'text-neon-red', bg: 'bg-neon-red/10', glow: 'group-hover:shadow-neon-red/20' },
};

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-abyss/50 to-transparent" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-neon-cyan text-xs tracking-[0.3em] uppercase mb-4 block">
            {'// FEATURES'}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Built for <span className="text-glow-cyan text-neon-cyan">Battle</span>
          </h2>
          <p className="font-body text-text-secondary max-w-xl mx-auto">
            Everything you need to host, compete in, and spectate live coding duels.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const colors = colorMap[feature.color];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative p-6 rounded-xl glass card-hover border ${colors.border} hover:shadow-lg ${colors.glow} transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ───────────────────────────────────────────────────────────
const steps = [
  {
    num: 1,
    title: 'Create Room',
    desc: 'Set your challenge, choose the format, and configure the battle parameters.',
    icon: '🏗️',
    color: 'neon-cyan',
  },
  {
    num: 2,
    title: 'Share Code',
    desc: 'Invite contestants with a room code. They join and share their screens.',
    icon: '📡',
    color: 'neon-violet',
  },
  {
    num: 3,
    title: 'Battle',
    desc: 'The countdown starts. Code, debug, and solve under pressure — live on screen.',
    icon: '⚔️',
    color: 'neon-magenta',
  },
  {
    num: 4,
    title: 'Win Glory',
    desc: 'The fastest solver wins. Stats, replays, and bragging rights included.',
    icon: '🏆',
    color: 'neon-green',
  },
];

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div ref={ref} className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="font-mono text-neon-violet text-xs tracking-[0.3em] uppercase mb-4 block">
            {'// HOW IT WORKS'}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Four Steps to <span className="text-glow-violet text-neon-violet">Glory</span>
          </h2>
          <p className="font-body text-text-secondary max-w-xl mx-auto">
            From room creation to victory in minutes.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-green opacity-20" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center group"
              >
                {/* Step number circle */}
                <div className="relative mx-auto mb-6">
                  <div className={`w-20 h-20 rounded-full glass neon-border-${step.color === 'neon-cyan' ? 'cyan' : step.color === 'neon-magenta' ? 'magenta' : step.color === 'neon-violet' ? 'violet' : 'green'} flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110`}>
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-${step.color} flex items-center justify-center`}>
                    <span className="font-display text-xs font-bold text-void">{step.num}</span>
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ────────────────────────────────────────────────────────────
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-violet/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <div className="glass-strong rounded-2xl p-12 sm:p-16 neon-border-violet corner-brackets">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-text-primary mb-4">
            Ready to <span className="text-glow-magenta text-neon-magenta">Duel</span>?
          </h2>
          <p className="font-body text-text-secondary mb-8 max-w-md mx-auto">
            Create a room, invite your opponents, and prove who writes the cleanest, fastest code under pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="group relative px-10 py-4 rounded-xl font-heading font-bold text-lg tracking-wider overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-magenta to-neon-violet opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-neon-magenta to-neon-violet opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
              <span className="relative text-white font-bold">CREATE ROOM</span>
            </Link>
            <button
              onClick={() => {
                const code = prompt('Enter room code:');
                if (code) window.location.href = `/arena/${code}`;
              }}
              className="btn-glow-cyan px-10 py-4 rounded-xl font-heading font-semibold text-lg tracking-wider text-neon-cyan"
            >
              JOIN AS VIEWER
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center font-display font-bold text-void text-xs">
                DD
              </div>
              <span className="font-display text-sm font-bold tracking-wider">DEBUG DUEL ARENA</span>
            </div>
            <p className="font-body text-sm text-text-muted max-w-sm leading-relaxed">
              The ultimate live coding battle platform. Built for developers who thrive under pressure.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-text-secondary mb-3 text-sm tracking-wider">PLATFORM</h4>
            <ul className="space-y-2">
              {['Create Room', 'Join Battle', 'Spectate', 'Leaderboard'].map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-text-muted hover:text-neon-cyan transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-text-secondary mb-3 text-sm tracking-wider">COMMUNITY</h4>
            <ul className="space-y-2">
              {['Discord', 'GitHub', 'Twitter', 'Blog'].map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-text-muted hover:text-neon-cyan transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-text-muted">
            © {new Date().getFullYear()} Debug Duel Arena. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs text-text-muted">Built with</span>
            <span className="text-neon-red text-xs">♥</span>
            <span className="font-mono text-xs text-text-muted">and</span>
            <span className="font-mono text-xs text-neon-cyan">{'<code/>'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-void">
      <ParticleField />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
