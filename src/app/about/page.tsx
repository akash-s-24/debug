import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About | Debug Duel Arena',
  description: 'Learn more about Debug Duel Arena, the premier platform for live coding battles, screen share duels, and competitive programming challenges.',
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
      <div className="w-full max-w-4xl space-y-12">
        <header className="text-center space-y-4">
          <h1 className="font-display text-4xl md:text-5xl text-brand-primary tracking-tighter">
            Discover the Ultimate Live Coding Battle Arena Today
          </h1>
          <p className="font-mono text-text-secondary text-sm md:text-base uppercase tracking-widest max-w-2xl mx-auto">
            Welcome to the future of competitive programming.
          </p>
        </header>

        <article className="prose prose-invert prose-brand max-w-none space-y-8 text-text-primary">
          <section className="bg-void border border-border-subtle p-8 shadow-md hud-bracket relative">
            <div className="scanline-overlay"></div>
            <h2 className="font-display text-3xl text-brand-secondary mb-4 tracking-tight relative z-10">
              Welcome to Debug Duel Arena
            </h2>
            <div className="font-body text-lg leading-relaxed relative z-10 space-y-4">
              <p>
                Have you ever wanted to prove your coding skills in real time? Welcome to <strong>Debug Duel Arena</strong>, the best place for developers to battle. Coding is usually a quiet job, but we made it an exciting sport. Here, you can challenge your friends or coworkers to solve hard problems fast.
              </p>
              <p>
                Our platform lets you set up a match in seconds. You do not need to download heavy software or pay any fees. You simply create a room, share the special code, and wait for your opponent. Once the match begins, the clock ticks down. Every second counts. You must write clean code and find tricky bugs before the time runs out. The pressure is on, but the feeling of winning is amazing.
              </p>
              <p>
                We built this arena because we saw a need for fun, fast-paced coding games. Many websites offer slow quizzes or long tests. We wanted action. We wanted a place where you can watch someone code live, like an esports game. That is exactly what we created. You can be a player or you can be a spectator. Spectators can watch the code appear on the screen exactly as the player types it.
              </p>
            </div>
          </section>

          <section className="bg-surface border border-border-subtle p-8 shadow-sm">
            <h2 className="font-display text-3xl text-brand-primary mb-4 tracking-tight">
              Two Amazing Ways to Play
            </h2>
            <div className="font-body text-lg leading-relaxed space-y-4 text-text-secondary">
              <p>
                We know that every coder is different. Some like to write code in a web browser. Others only want to use their own setup on their computer. That is why we offer two amazing ways to play.
              </p>
              <p>
                <strong>1. Live Coding Battles:</strong> If you choose this mode, you will use our fast, built-in code editor. We use the Monaco editor, which is the same technology behind Visual Studio Code. It is super fast and has smart features to help you type. Both players look at the same screen layout. When you hit the "Run" button, your code goes to our secure server. The server runs your code and sends the results back in a flash. This makes sure the match is totally fair. No one has a hidden advantage.
              </p>
              <p>
                <strong>2. Screen Share Duels:</strong> Do you have a favorite code editor? Maybe you love Vim, Emacs, or a special dark theme on your computer. If you want to use your own tools, choose the screen share mode. When the match starts, our system uses WebRTC to capture your screen with very low lag. The host can watch your screen and your opponent's screen at the same time. It feels just like watching a professional gaming tournament. This mode is great for bigger events or school clubs.
              </p>
            </div>
          </section>

          <section className="bg-void border border-border-subtle p-8 shadow-md hud-bracket relative">
            <div className="scanline-overlay"></div>
            <h2 className="font-display text-3xl text-brand-secondary mb-4 tracking-tight relative z-10">
              Why Practice Under Pressure?
            </h2>
            <div className="font-body text-lg leading-relaxed relative z-10 space-y-4">
              <p>
                Practicing under pressure is very good for your brain. When you know someone is watching, you learn to focus. You learn to ignore distractions and just fix the problem. This is a very useful skill for your career.
              </p>
              <p>
                Many tech companies give coding tests when you apply for a job. These tests are hard because you have a strict time limit. Sometimes, an interviewer will watch your screen while you work. This makes many people nervous, and they make mistakes they would normally never make. By playing games in Debug Duel Arena, you get used to this feeling. You learn to stay calm. When the real job interview comes, you will be totally ready.
              </p>
              <p>
                Beyond getting a job, it is also just fun. You get to see how other people think. After a match, you can look at the winner's code. Maybe they used a cool trick you didn't know. Maybe they found a faster way to solve the puzzle. You learn from them, and they learn from you. This makes the whole developer community stronger and smarter.
              </p>
            </div>
          </section>

          <section className="bg-surface border border-border-subtle p-8 shadow-sm">
            <h2 className="font-display text-3xl text-brand-primary mb-4 tracking-tight">
              A Community of Builders
            </h2>
            <div className="font-body text-lg leading-relaxed space-y-4 text-text-secondary">
              <p>
                Debug Duel Arena is completely free and made for developers. We don't hide our best features behind a paywall. We believe that everyone should have the chance to improve their coding skills. 
              </p>
              <p>
                As our community grows, we plan to add more languages and bigger challenges. Right now, we support the most popular languages like JavaScript, TypeScript, and Python. We also want to add team battles in the future. Imagine you and your best friend teaming up to fix a broken website against another team. The possibilities are endless.
              </p>
              <p>
                We care about quality and speed. Our servers are designed to handle lots of code at once. We use Redis to keep track of the leaderboards, so you can always see who the top coders are. We want to be the number one spot on the internet for coding sports.
              </p>
            </div>
          </section>

          <section className="bg-void border border-border-subtle p-8 shadow-md">
            <h2 className="font-display text-3xl text-brand-primary mb-4 tracking-tight">
              Get in Touch & View the Code
            </h2>
            <p className="font-body text-lg text-text-secondary mb-6">
              I built this project to push the boundaries of what is possible in the browser. If you want to check out the source code, see how the WebRTC screen sharing was made, or look at our Redis integration, please visit the GitHub repository.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <a 
                href="https://github.com/akash-s-24/debug" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#3b82f6] text-void px-6 py-3 font-bold uppercase tracking-widest hover:bg-[#2563eb] transition-colors"
                title="View Debug Duel Arena on GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                My GitHub Repository
              </a>
              
              <a 
                href="mailto:levelupgamerz28@gmail.com" 
                className="flex items-center justify-center gap-3 bg-transparent border border-brand-primary text-brand-primary px-6 py-3 font-bold uppercase tracking-widest hover:bg-brand-primary/10 transition-colors"
                title="Email me at levelupgamerz28@gmail.com"
              >
                <span className="material-symbols-outlined">mail</span>
                Contact Support
              </a>
            </div>
            
            <p className="font-body text-sm text-text-muted mt-4">
              If you have any questions, feedback, or want to report a bug, please email me directly at <strong>levelupgamerz28@gmail.com</strong>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
