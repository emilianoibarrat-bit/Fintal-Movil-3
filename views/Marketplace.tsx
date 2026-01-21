
import React, { useState, useContext, useEffect, useRef } from 'react';
import { VistaApp, Experto } from '../types';
import { AppContext } from '../App';
import Sidebar from '../components/Sidebar';
import anime from 'animejs';
import MobileNav from '../components/MobileNav';

interface MarketplaceViewProps {
  onNavigate: (view: VistaApp) => void;
}

const EXPERTOS: Experto[] = [
  { id: '1', nombre: 'Alejandra Rossi', rol: 'CPA CERTIFICADA', calificacion: 4.9, resenas: 124, tarifaHora: 1200, etiquetas: ['SAT', 'Empresas'], avatar: 'https://i.pravatar.cc/150?u=alejandra', verificado: true, descripcion: 'Estratega fiscal para freelancers. Te ayudo a optimizar tus declaraciones y maximizar devoluciones.' },
  { id: '2', nombre: 'Carlos Méndez', rol: 'ANALISTA AMIB L3', calificacion: 5.0, resenas: 42, tarifaHora: 2500, etiquetas: ['Bolsa', 'CETES'], avatar: 'https://i.pravatar.cc/150?u=carlos', verificado: true, descripcion: 'Especialista en portafolios de inversión de bajo riesgo y alto rendimiento. AMIB Certificado.' },
  { id: '3', nombre: 'Elena Vázquez', rol: 'RETIRO & PENSIONES', calificacion: 4.8, resenas: 89, tarifaHora: 1500, etiquetas: ['AFORE', 'PPR'], avatar: 'https://i.pravatar.cc/150?u=elena', verificado: true, descripcion: 'Planificadora financiera enfocada en retiro digno y planes personales de retiro (PPR).' },
  { id: '4', nombre: 'Ricardo Ruiz', rol: 'CRYPTO ESTRATEGA', calificacion: 4.7, resenas: 156, tarifaHora: 1800, etiquetas: ['Bitcoin', 'Ethereum'], avatar: 'https://i.pravatar.cc/150?u=ricardo', verificado: false, descripcion: 'Asesoría en activos digitales, seguridad de carteras y estrategias de inversión en cripto.' },
  { id: '5', nombre: 'Mónica Silva', rol: 'BIENES RAÍCES MX', calificacion: 4.9, resenas: 210, tarifaHora: 2000, etiquetas: ['Preventas', 'FIBRAS'], avatar: 'https://i.pravatar.cc/150?u=monica', verificado: true, descripcion: 'Experta en inversión inmobiliaria en México y análisis de FIBRAS en la bolsa mexicana.' },
  { id: '6', nombre: 'Javier López', rol: 'COACH DE DEUDA', calificacion: 5.0, resenas: 33, tarifaHora: 800, etiquetas: ['Créditos', 'TDC'], avatar: 'https://i.pravatar.cc/150?u=javier', verificado: true, descripcion: 'Te ayudo a salir de deudas de tarjetas de crédito y mejorar tu Score en el Buró de Crédito.' }
];

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onNavigate }) => {
  const contexto = useContext(AppContext);
  const [busqueda, setBusqueda] = useState('');
  const cardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (cardsRef.current) {
      // Fix: Cast anime to any to avoid call signature error
      (anime as any)({
        targets: '.expert-card',
        scale: [0.9, 1],
        opacity: [0, 1],
        delay: (anime as any).stagger(100, { start: 500 }),
        easing: 'easeOutQuint',
        duration: 1000
      });
    }
  }, []);

  if (!contexto) return null;
  const { notificar } = contexto;

  const handleCita = (nombre: string) => {
    notificar(`Solicitud enviada a ${nombre}. Te contactaremos pronto.`, 'success');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar vistaActual="asesores" onNavigate={onNavigate} />

      <main className="w-full md:flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 w-full space-y-12 pb-24">
        <section className="text-center max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Marketplace de Expertos</div>
           <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tighter">Encuentra a tu <br/><span className="text-primary italic">Guía Financiero.</span></h1>
           <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">Conecta con asesores certificados AMIB y especialistas en el mercado mexicano para optimizar tu capital.</p>
           
           <div className="relative group max-w-2xl mx-auto">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border-none rounded-[2.5rem] py-6 pl-16 pr-8 text-xl shadow-2xl focus:ring-8 focus:ring-primary/10 transition-all font-black placeholder:text-slate-200" 
                placeholder="Busca por SAT, Inversiones, PPR..." 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <button className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl hover:bg-primary/10 transition-colors"><span className="material-symbols-outlined">tune</span></button>
              </div>
           </div>
        </section>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {EXPERTOS.filter(e => 
            e.etiquetas.some(t => t.toLowerCase().includes(busqueda.toLowerCase())) || 
            e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            e.rol.toLowerCase().includes(busqueda.toLowerCase())
          ).map(exp => (
            <div key={exp.id} className="expert-card bg-white dark:bg-zinc-900 p-8 rounded-[3.5rem] border dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute -top-12 -right-12 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                 <div className="relative">
                    <img src={exp.avatar} className="size-24 rounded-[2.5rem] object-cover ring-8 ring-slate-50 dark:ring-zinc-800 shadow-xl transition-transform group-hover:scale-110 duration-500" alt={exp.nombre} />
                    {exp.verificado && (
                      <div className="absolute -bottom-2 -right-2 bg-primary text-slate-900 rounded-2xl p-1.5 border-4 border-white dark:border-zinc-900 shadow-lg">
                        <span className="material-symbols-outlined fill-1 !text-[18px]">verified</span>
                      </div>
                    )}
                 </div>
                 <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-amber-500 font-black text-lg">
                       <span className="material-symbols-outlined fill-1 !text-[20px]">star</span>
                       {exp.calificacion}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exp.resenas} Reseñas</p>
                 </div>
              </div>

              <div className="relative z-10 space-y-2">
                <h4 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{exp.nombre}</h4>
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">{exp.rol}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-gray-400 leading-relaxed pt-2 line-clamp-3">{exp.descripcion}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 my-8 relative z-10">
                {exp.etiquetas.map(t => (
                  <span key={t} className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest border dark:border-zinc-700 group-hover:border-primary/30 transition-colors">#{t}</span>
                ))}
              </div>

              <div className="pt-8 border-t dark:border-zinc-800 flex items-center justify-between mt-auto relative z-10">
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">TARIFA/HORA</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${exp.tarifaHora.toLocaleString()} <span className="text-xs font-bold text-slate-400">MXN</span></p>
                 </div>
                 <button 
                   onClick={() => handleCita(exp.nombre)}
                   className="bg-zinc-950 dark:bg-primary dark:text-zinc-950 text-white px-8 py-4 rounded-[1.75rem] font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 group-hover:shadow-primary/30"
                 >
                   Agendar
                 </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    
      <MobileNav vistaActual="asesores" onNavigate={onNavigate} />
</div>
  );
};

export default MarketplaceView;