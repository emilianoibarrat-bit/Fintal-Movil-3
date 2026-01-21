import React from 'react';
import { VistaApp } from '../types';

export default function MobileNav({
  vistaActual,
  onNavigate,
}: {
  vistaActual: VistaApp;
  onNavigate: (v: VistaApp) => void;
}) {
  const items: { id: VistaApp; icon: string; label: string }[] = [
    { id: 'comunidad', icon: 'diversity_3', label: 'Comunidad' },
    { id: 'asesores', icon: 'explore', label: 'Explorar' },
    { id: 'panel', icon: 'dashboard', label: 'Panel' },
    { id: 'ajustes', icon: 'person', label: 'Perfil' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex justify-around px-2 py-2">
        {items.map((it) => {
          const active = vistaActual === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate(it.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${
                active ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={it.label}
            >
              <span className={`material-symbols-outlined ${active ? 'fill-1' : ''}`}>
                {it.icon}
              </span>
              <span className="text-[10px] font-black">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
