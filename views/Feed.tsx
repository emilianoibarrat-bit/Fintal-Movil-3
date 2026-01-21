
import React, { useState, useContext, useEffect, useRef } from 'react';
import { VistaApp, Publicacion } from '../types';
import { AppContext } from '../App';
import Sidebar from '../components/Sidebar';
import anime from 'animejs';
import MobileNav from '../components/MobileNav';

interface FeedViewProps {
  onNavigate: (view: VistaApp) => void;
}

const FeedView: React.FC<FeedViewProps> = ({ onNavigate }) => {
  const contexto = useContext(AppContext);
  const [contenido, setContenido] = useState('');
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<string | null>(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Animación de entrada de las publicaciones al cargar
    if (feedRef.current) {
      // Fix: Cast anime to any to avoid call signature error
      (anime as any)({
        targets: '.feed-item',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: (anime as any).stagger(100, { start: 400 }),
        easing: 'easeOutQuint',
        duration: 800
      });
    }
  }, []);

  if (!contexto) return null;
  const { publicaciones, agregarPublicacion, agregarComentario, notificar, usuario, alternarLike, alternarCompartir } = contexto;

  const enviarPublicacion = () => {
    if (!contenido.trim()) return;
    agregarPublicacion(contenido);
    setContenido('');
  };

  const enviarComentario = (pubId: string) => {
    if (!nuevoComentario.trim()) return;
    agregarComentario(pubId, nuevoComentario);
    setNuevoComentario('');
    setPublicacionSeleccionada(null);
  };

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto min-h-screen bg-white dark:bg-zinc-950">
      <Sidebar vistaActual="comunidad" onNavigate={onNavigate} />

      <main className="w-full md:flex-1 border-r dark:border-zinc-800 max-w-[600px] bg-white dark:bg-zinc-950 pb-24">
        <header className="sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 border-b dark:border-zinc-800 px-6 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tighter">Comunidad</h2>
          <span className="material-symbols-outlined text-primary cursor-pointer hover:rotate-180 transition-transform duration-500">auto_awesome</span>
        </header>
        
        <div className="p-6 border-b dark:border-zinc-800 flex gap-4">
          <img src={usuario.avatar} className="size-14 rounded-full ring-2 ring-primary shadow-xl" alt="Perfil" />
          <div className="flex-1">
            <textarea 
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className="w-full bg-transparent border-none text-xl placeholder-slate-300 dark:placeholder-zinc-700 focus:ring-0 resize-none p-0 min-h-[100px] font-bold" 
              placeholder="¿Qué movimientos harás hoy?"
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-zinc-900">
              <div className="flex gap-2 text-primary">
                {['image', 'gif_box', 'ballot', 'sentiment_satisfied'].map(icon => (
                  <button key={icon} className="p-2.5 hover:bg-primary/10 rounded-xl transition-all hover:scale-110 active:scale-90"><span className="material-symbols-outlined !text-[22px]">{icon}</span></button>
                ))}
              </div>
              <button 
                onClick={enviarPublicacion}
                disabled={!contenido.trim()}
                className="bg-primary disabled:opacity-30 text-slate-900 font-black py-3 px-10 rounded-full text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>

        <div ref={feedRef} className="divide-y dark:divide-zinc-900">
          {publicaciones.map(pub => (
            <div key={pub.id} className="feed-item">
              <article className={`p-6 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-all ${pub.usuario === usuario.usuario ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                <div className="flex gap-4">
                  <div className="relative shrink-0">
                    <img src={pub.avatar} className="size-14 rounded-[1.5rem] object-cover shadow-md" alt={pub.autor} />
                    {pub.verificado && (
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 border border-primary/20">
                        <span className="material-symbols-outlined fill-1 text-primary !text-[14px]">verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-black text-sm hover:underline tracking-tight">{pub.autor}</span>
                        <span className="text-slate-400 text-xs truncate">{pub.usuario} · {pub.fecha}</span>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors cursor-pointer">more_horiz</span>
                    </div>
                    <p className="text-[16px] leading-relaxed font-bold text-slate-800 dark:text-slate-200">{pub.contenido}</p>
                    
                    <div className="flex justify-between items-center mt-6 max-w-sm text-slate-400">
                      {[
                        { icon: 'chat_bubble', count: pub.comentariosCount, color: 'hover:text-primary', active: publicacionSeleccionada === pub.id, action: () => setPublicacionSeleccionada(publicacionSeleccionada === pub.id ? null : pub.id) },
                        { icon: 'repeat', count: pub.compartidos, color: 'hover:text-green-500', active: pub.estaCompartido, action: () => alternarCompartir(pub.id) },
                        { icon: 'favorite', count: pub.meGusta, color: 'hover:text-pink-500', active: pub.estaLike, action: () => alternarLike(pub.id) },
                        { icon: 'bar_chart', count: pub.vistas, color: 'hover:text-sky-500', active: false, action: () => {} },
                      ].map((btn, idx) => (
                        <button 
                          key={idx}
                          onClick={btn.action}
                          className={`flex items-center gap-2.5 transition-all active:scale-90 ${btn.active ? btn.color.replace('hover:', '') : btn.color}`}
                        >
                          <span className={`material-symbols-outlined !text-[20px] ${btn.active ? 'fill-1' : ''}`}>{btn.icon}</span>
                          <span className="text-xs font-black">{btn.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              {publicacionSeleccionada === pub.id && (
                <div className="bg-slate-100 dark:bg-zinc-900 px-6 py-6 border-t dark:border-zinc-800 animate-in slide-in-from-top-2">
                   <div className="space-y-5 mb-6">
                      {pub.comentarios?.map(c => (
                        <div key={c.id} className="flex gap-3 items-start animate-in fade-in">
                           <img src={c.avatar} className="size-10 rounded-xl" alt={c.autor} />
                           <div className="flex-1 bg-white dark:bg-zinc-800 p-4 rounded-[1.25rem] shadow-sm border dark:border-zinc-700">
                              <p className="text-xs font-black mb-1">{c.autor} · <span className="text-slate-400 font-bold">{c.fecha}</span></p>
                              {/* Fix: Property 'content' does not exist on type 'Comentario', use 'contenido' */}
                              <p className="text-[14px] font-bold text-slate-700 dark:text-slate-300">{c.contenido}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="flex gap-3">
                      <img src={usuario.avatar} className="size-10 rounded-xl" alt="Yo" />
                      <div className="flex-1 flex gap-2">
                        <input 
                          autoFocus
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                          placeholder="Publica tu respuesta financiera..."
                          className="flex-1 bg-white dark:bg-zinc-800 border-none rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none shadow-inner"
                        />
                        <button 
                          onClick={() => enviarComentario(pub.id)}
                          className="px-6 py-3 bg-primary text-slate-900 font-black text-xs rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                        >
                          Responder
                        </button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <aside className="hidden lg:flex flex-col w-[350px] shrink-0 sticky top-0 h-screen p-8 gap-8 bg-slate-50 dark:bg-zinc-950">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">search</span>
          <input className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-black shadow-sm" placeholder="Buscar en FINTAL..." />
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><span className="material-symbols-outlined !text-[80px]">trending_up</span></div>
          <h3 className="font-black text-2xl tracking-tight relative z-10">Tendencias</h3>
          <div className="space-y-5 relative z-10">
            {['#CETES2025', '#IBEX_MX', 'Inversión Real', 'Dolar Hoy', 'Bitcoin MXN'].map((t, i) => (
              <div key={i} className="group cursor-pointer p-3 rounded-2xl hover:bg-primary/5 transition-all">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">MERCADO ACTIVO</p>
                <p className="font-black text-[15px] group-hover:text-primary transition-colors">{t}</p>
                <div className="flex items-center gap-2 mt-1">
                   <div className="size-1.5 bg-primary rounded-full animate-pulse" />
                   <p className="text-[10px] text-slate-400 font-bold">{(Math.random()*15).toFixed(1)}k menciones</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 text-xs font-black text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors uppercase tracking-widest">Ver todas</button>
        </div>
      </aside>
    
      <MobileNav vistaActual="comunidad" onNavigate={onNavigate} />
</div>
  );
};

export default FeedView;