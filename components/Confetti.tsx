import React, { useEffect, useRef } from 'react';

export const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: any[] = [];
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
    const PI_180 = Math.PI / 180;

    // Create particles once
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 4,
        angle: Math.random() * 360,
        spin: Math.random() * 10 - 5
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;
        p.x += p.vx;
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * PI_180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        // Wrap around horizontally
        if (p.x > width) p.x = 0;
        else if (p.x < 0) p.x = width;
        
        // Loop vertically
        if (p.y > height) p.y = -20;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none animate-in fade-in duration-500">
        <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        />
        {/* Celebration Message */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-in zoom-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-sm">
                All Done!
            </h2>
            <p className="text-slate-500 dark:text-slate-300 font-bold uppercase tracking-widest mt-2 text-sm md:text-base">
                Daily objectives complete
            </p>
        </div>
    </div>
  );
};