
import React, { useEffect, useRef, useContext } from 'react';
import { VistaApp } from '../types';
import Logo from './Logo';
import { AppContext } from '../App';
import anime from 'animejs';

interface SidebarProps {
  vistaActual: VistaApp;
  onNavigate: (vista: VistaApp) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ vistaActual, onNavigate }) => {
  const contexto = useContext(AppContext);
  const navRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animación de entrada escalonada para los items de navegación
    if (navRef.current) {
      // Fix: Cast anime to any to avoid call signature error
      (anime as any)({
        targets: navRef.current.querySelectorAll('.nav-item'),
        translateX: [-30, 0],
        opacity: [0, 1],
        delay: (anime as any).stagger(80, { start: 200 }),
        easing: 'easeOutQuint',
        duration: 800
      });
    }

    // Animación de pulso para el badge de Pro
    if (badgeRef.current) {
      // Fix: Cast anime to any to avoid call signature error
      (anime as any)({
        targets: badgeRef.current,
        scale: [1, 1.03],
        opacity: [0.8, 1],
        duration: 2000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
      });
    }

    // Entrada del perfil
    if (profileRef.current) {
      // Fix: Cast anime to any to avoid call signature error
      (anime as any)({
        targets: profileRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        delay: 800,
        easing: 'easeOutElastic(1, .8)',
        duration: 1000
      });
    }
  }, []);

  if (!contexto) return null;
  const { usuario } = contexto;

  const menuItems = [
    { id: 'comunidad', icon: 'diversity_3', label: 'Comunidad' },
    { id: 'asesores', icon: 'explore', label: 'Explorar' },
    { id: 'panel', icon: 'dashboard', label: 'Panel' },
    { id: 'ajustes', icon: 'person', label: 'Perfil' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-[280px] shrink-0 sticky top-0 h-screen border-r dark:border-zinc-800 px-6 py-8 justify-between bg-white dark:bg-zinc-950 z-50 overflow-hidden">
      <div className="flex flex-col gap-12">
        <div className="px-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => onNavigate('inicio')}>
          <Logo size={36} />
        </div>
        
        <nav ref={navRef} className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = vistaActual === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as VistaApp)}
                className={`nav-item flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all relative group overflow-hidden ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-black shadow-inner' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-900 font-bold'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                )}
                <span className={`material-symbols-outlined !text-[26px] transition-transform group-hover:scale-110 ${isActive ? 'fill-1' : ''}`}>
                  {item.icon}
                </span>
                <span className="hidden lg:block text-[17px] tracking-tight">{item.label}</span>
                
                {!isActive && (
                  <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out -z-10" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-6">
        {/* Pro Badge con efecto de pulso */}
        <div 
          ref={badgeRef}
          className="p-5 bg-primary/10 text-primary rounded-[2rem] border border-primary/20 flex items-center gap-4 cursor-pointer hover:bg-primary/20 transition-colors"
        >
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined fill-1 text-slate-900 !text-[20px]">workspace_premium</span>
          </div>
          <div className="hidden lg:block">
            <p className="font-black text-[10px] uppercase tracking-[0.2em] mb-0.5">FINTAL PRO ACTIVO</p>
            <p className="text-[9px] font-bold text-primary/70">Nivel de cuenta: VIP</p>
          </div>
        </div>

        {/* Profile Card */}
        <div 
          ref={profileRef}
          onClick={() => onNavigate('ajustes')} 
          className="hover:bg-slate-50 dark:hover:bg-zinc-900 p-4 rounded-[2rem] flex items-center gap-4 cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-zinc-800"
        >
          <div className="relative">
            <img src={usuario.avatar} className="size-12 rounded-full border-2 border-primary shadow-lg" alt="Perfil" />
            <div className="absolute bottom-0 right-0 size-3 bg-primary border-2 border-white dark:border-zinc-950 rounded-full"></div>
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-black truncate">{usuario.nombre}</p>
            <p className="text-[11px] text-slate-400 font-bold truncate">{usuario.usuario}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
