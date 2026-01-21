
import React, { useEffect, useRef } from 'react';
import { VistaApp } from '../types';
import Logo from '../components/Logo';
import anime from 'animejs';

interface LandingViewProps {
  onNavigate: (view: VistaApp) => void;
  onOpenAuth: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenAuth }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 1. Animación del título (Letra por Letra)
    if (titleRef.current) {
      const textWrapper = titleRef.current;
      // Ajuste para evitar que el texto se rompa de forma extraña
      const text = textWrapper.textContent || "";
      textWrapper.innerHTML = text.split(' ').map(word => 
        `<span class="inline-block whitespace-nowrap">${word.replace(/\S/g, "<span class='letter inline-block'>$&</span>")}</span>`
      ).join(' ');

      (anime as any).timeline({ loop: false })
        .add({
          targets: '.letter',
          translateY: [60, 0],
          translateZ: 0,
          opacity: [0, 1],
          scale: [0.5, 1],
          rotateX: [-90, 0],
          easing: "easeOutElastic(1, .6)",
          duration: 1200,
          delay: (el: any, i: number) => 200 + 35 * i
        });
    }

    // 2. Observer para animaciones de entrada
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target === buttonsRef.current) {
                    (anime as any)({
                        targets: buttonsRef.current!.children,
                        translateY: [30, 0],
                        opacity: [0, 1],
                        delay: (anime as any).stagger(100),
                        easing: 'easeOutQuart',
                        duration: 800
                    });
                }
                if (entry.target === footerRef.current) {
                    (anime as any)({
                        targets: footerRef.current,
                        translateY: [50, 0],
                        opacity: [0, 1],
                        easing: 'easeOutQuint',
                        duration: 1200
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (buttonsRef.current) observer.observe(buttonsRef.current);
    if (footerRef.current) observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-x-hidden selection:bg-primary selection:text-slate-900">
      {/* Fondo optimizado */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] size-[40vw] bg-primary/5 rounded-full blur-[120px] animate-float"></div>
         <div className="absolute bottom-[-10%] right-[-10%] size-[50vw] bg-primary/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <nav className="relative z-50 w-full border-b border-gray-100 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/70">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="group cursor-pointer" onClick={() => onNavigate('inicio')}>
            <Logo size={38} />
          </div>
          <div className="hidden items-center gap-10 md:flex">
            {['Educación', 'Comunidad', 'Asesores'].map((item) => (
              <button 
                key={item}
                onClick={() => onNavigate(item === 'Comunidad' ? 'comunidad' : 'asesores')} 
                className="text-sm font-black text-slate-500 hover:text-primary transition-all dark:text-gray-400 relative group uppercase tracking-widest"
              >
                {item}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onOpenAuth} className="rounded-xl px-5 py-2.5 text-sm font-black text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-white/5 hidden sm:block uppercase tracking-widest">Entrar</button>
            <button onClick={onOpenAuth} className="rounded-2xl bg-zinc-950 dark:bg-primary px-8 py-3.5 text-sm font-black text-white dark:text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95 shadow-primary/20 uppercase tracking-[0.2em]">Registro</button>
          </div>
        </div>
      </nav>

      <section className="relative pt-24 pb-36 lg:pt-32 lg:pb-40 z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-10 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-7 py-2.5 text-[11px] font-black uppercase tracking-[0.4em] text-primary">
              FINANCIAL ECOSYSTEM MÉXICO
            </div>
            <h1 ref={titleRef} className="text-6xl font-black leading-[1.1] tracking-tighter text-slate-900 sm:text-7xl lg:text-9xl dark:text-white py-4">
              Domina tu Riqueza Juntos
            </h1>
            <p className="text-2xl text-slate-500 dark:text-gray-400 leading-relaxed max-w-2xl font-medium italic">
              "La mejor inversión es la que haces con información, comunidad y tecnología."
            </p>
            <div ref={buttonsRef} className="flex w-full flex-col gap-6 sm:flex-row justify-center mt-12">
              <button onClick={onOpenAuth} className="group flex items-center justify-center gap-4 rounded-[2rem] bg-primary px-16 py-7 text-2xl font-black text-slate-900 shadow-[0_25px_50px_rgba(17,212,50,0.4)] transition-all hover:scale-105 active:scale-95">
                Empezar Ahora
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-2 !text-[36px]">east</span>
              </button>
              <button onClick={() => onNavigate('asesores')} className="flex items-center justify-center gap-4 rounded-[2rem] border-2 border-slate-100 bg-white/50 backdrop-blur-md px-16 py-7 text-2xl font-bold text-slate-900 transition-all hover:border-primary dark:bg-white/5 dark:border-white/10 dark:text-white">
                Explorar Expertos
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer ref={footerRef} className="relative z-20 pb-20 pt-10 opacity-0 translate-y-12 contain-content">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-[5rem] p-12 lg:p-24 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                
                <div className="space-y-14">
                    <div className="space-y-6">
                        <div className="size-18 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 shadow-inner">
                            <span className="material-symbols-outlined fill-1 !text-5xl">contact_support</span>
                        </div>
                        <h3 className="text-6xl font-black tracking-tighter mb-4 leading-none">Soporte & <br/><span className="text-primary italic">Fundadores</span></h3>
                        <p className="text-slate-500 dark:text-gray-400 font-bold max-w-md text-xl leading-relaxed">Impulsamos FINTAL para que cada mexicano tenga un asesor financiero de élite en su bolsillo.</p>
                    </div>
                    
                    <div className="grid gap-10">
                        <div className="flex items-center gap-8 group cursor-pointer" onClick={() => window.open('mailto:fundadores@fintal.io')}>
                            <div className="size-20 rounded-[1.75rem] bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 transition-all group-hover:bg-primary group-hover:text-slate-900 shadow-xl group-hover:rotate-6">
                                <span className="material-symbols-outlined !text-4xl">mail</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] mb-1.5">Email de Contacto</p>
                                <p className="text-2xl font-black dark:text-white group-hover:text-primary transition-colors underline-offset-8 group-hover:underline">fundadores@fintal.io</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-8 group cursor-pointer">
                            <div className="size-20 rounded-[1.75rem] bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 transition-all group-hover:bg-primary group-hover:text-slate-900 shadow-xl group-hover:rotate-6">
                                <span className="material-symbols-outlined !text-4xl">phone_iphone</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] mb-1.5">WhatsApp Premium</p>
                                <p className="text-2xl font-black dark:text-white">+52 (55) 1234 5678</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-8 group cursor-pointer" onClick={() => window.open('https://maps.google.com')}>
                            <div className="size-20 rounded-[1.75rem] bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 transition-all group-hover:bg-primary group-hover:text-slate-900 shadow-xl group-hover:rotate-6">
                                <span className="material-symbols-outlined !text-4xl">location_on</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] mb-1.5">Centro Tecnológico</p>
                                <p className="text-2xl font-black dark:text-white">Paseo de la Reforma, CDMX</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group" onClick={onOpenAuth}>
                    <div className="absolute -top-8 -right-8 bg-primary text-slate-900 px-12 py-5 rounded-full text-sm font-black tracking-[0.5em] uppercase z-30 shadow-2xl animate-bounce-slow">
                        TUTORIAL
                    </div>
                    
                    <div className="relative aspect-video rounded-[4.5rem] overflow-hidden border-[14px] border-slate-50 dark:border-zinc-800 shadow-[0_80px_160px_rgba(0,0,0,0.5)] bg-zinc-800 transition-all group-hover:scale-[1.04] group-hover:border-primary/20">
                        <img 
                            src="https://storage.googleapis.com/static.re-collect.ai/generative_ai/399083cc63e5e4f488118f7004f84f09cb8d95190623d538676d6da2f854be74.png" 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" 
                            alt="FINTAL App Tutorial"
                        />
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[6px] group-hover:backdrop-blur-0 transition-all duration-700">
                            <div className="size-32 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/60 group-hover:scale-125 transition-all">
                                <span className="material-symbols-outlined !text-[64px] text-slate-900 fill-1 ml-3">play_circle</span>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black/95 via-black/50 to-transparent">
                            <div className="flex items-center justify-between text-white text-[14px] font-black mb-5">
                                <span className="flex items-center gap-3"><div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#11d432]"></div> TOUR DEL ECOSISTEMA</span>
                                <span>03:50</span>
                            </div>
                            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                                <div className="w-[45%] h-full bg-primary shadow-[0_0_25px_#11d432] transition-all duration-1000 group-hover:w-[70%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-32 text-center space-y-8">
                <Logo size={32} className="justify-center grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer" />
                <p className="text-[12px] text-slate-400 font-black tracking-[0.6em] uppercase">© 2024 FINTAL TECHNOLOGIES • CIUDAD DE MÉXICO</p>
            </div>
        </div>
      </footer>
      
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent z-0 pointer-events-none"></div>
    </div>
  );
};

export default LandingView;
