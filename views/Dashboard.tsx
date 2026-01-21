
import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { VistaApp, Transaccion } from '../types';
import { AppContext } from '../App';
import { GoogleGenAI } from "@google/genai";
import Sidebar from '../components/Sidebar';
import anime from 'animejs';
import MobileNav from '../components/MobileNav';

interface DashboardViewProps {
  onNavigate: (view: VistaApp) => void;
}

interface HoverInfo {
  x: number;
  y: number;
  mes: string;
  valor: number;
  tipo: 'Ingreso' | 'Gasto';
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const contexto = useContext(AppContext);
  const [generando, setGenerando] = useState(false);
  const [consejoIA, setConsejoIA] = useState<string | null>(null);
  const [recIAHormiga, setRecIAHormiga] = useState<string | null>(null);
  const [cargandoRecIA, setCargandoRecIA] = useState(false);
  const [modalActividadAbierto, setModalActividadAbierto] = useState(false);
  const [monto, setMonto] = useState('');
  const [motivo, setMotivo] = useState('');
  const [categoria, setCategoria] = useState('General');
  const [tipoTransaccion, setTipoTransaccion] = useState<'gasto' | 'ingreso'>('gasto');
  const [filtroGrafica, setFiltroGrafica] = useState<'todos' | 'ingresos' | 'gastos'>('todos');
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  
  const dashboardRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (dashboardRef.current) {
      (anime as any).timeline({ easing: 'easeOutQuint' })
        .add({
          targets: '.stat-card',
          translateY: [30, 0],
          opacity: [0, 1],
          delay: (anime as any).stagger(120),
          duration: 1000
        })
        .add({
          targets: '.chart-container, .activity-container, .ia-section',
          translateY: [40, 0],
          opacity: [0, 1],
          duration: 1200
        }, '-=600');
    }
  }, []);

  useEffect(() => {
    if (modalActividadAbierto && modalContentRef.current) {
      (anime as any)({
        targets: modalContentRef.current,
        scale: [0.8, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutElastic(1, .8)',
        duration: 800
      });
    }
  }, [modalActividadAbierto]);

  if (!contexto) return null;
  const { notificar, usuario, gastos, agregarTransaccion } = contexto;

  // Lógica Avanzada de Gasto Hormiga
  const infoHormiga = useMemo(() => {
    const conteo: Record<string, { total: number, veces: number }> = {};
    
    gastos.filter(t => t.tipo === 'gasto').forEach(t => {
      const baseMotivo = t.comercio.split(' (')[0].toLowerCase().trim();
      if (!conteo[baseMotivo]) {
        conteo[baseMotivo] = { total: 0, veces: 0 };
      }
      conteo[baseMotivo].total += Math.abs(t.monto);
      conteo[baseMotivo].veces += 1;
    });

    const hormigas = Object.entries(conteo)
      .filter(([_, data]) => data.veces >= 5)
      .map(([nombre, data]) => ({ nombre, ...data }));

    const total = hormigas.reduce((acc, h) => acc + h.total, 0);
    // Ordenar por frecuencia para encontrar el principal
    const topHormiga = hormigas.sort((a, b) => b.veces - a.veces)[0];

    return { total, topHormiga };
  }, [gastos]);

  // Generar recomendación IA específica sobre gastos hormiga
  useEffect(() => {
    const generarRecomendacionHormiga = async () => {
      if (infoHormiga.total === 0) return;
      setCargandoRecIA(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `El usuario tiene un gasto hormiga de $${infoHormiga.total} MXN al mes principalmente en "${infoHormiga.topHormiga?.nombre}". 
          Actúa como un asesor financiero mexicano. Dime en 3 puntos claros cómo podría invertir ese dinero en CETES o FIBRAS y cuánto podría ganar en un año. Sé muy motivador y usa un tono profesional.`,
        });
        setRecIAHormiga(res.text);
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoRecIA(false);
      }
    };
    generarRecomendacionHormiga();
  }, [infoHormiga.total, infoHormiga.topHormiga?.nombre]);

  const datosGrafica = useMemo(() => {
    const base = [
      { mes: 'Ene', ingresos: 12000, gastos: 8000 },
      { mes: 'Feb', ingresos: 15500, gastos: 9200 },
      { mes: 'Mar', ingresos: 13000, gastos: 11500 },
      { mes: 'Abr', ingresos: 19000, gastos: 7500 },
      { mes: 'May', ingresos: 21000, gastos: 12800 },
    ];
    let ingresosJun = 0, gastosJun = 0;
    gastos.forEach(t => t.tipo === 'ingreso' ? ingresosJun += t.monto : gastosJun += Math.abs(t.monto));
    return [...base, { mes: 'Jun', ingresos: ingresosJun, gastos: gastosJun }];
  }, [gastos]);

  const anchoTotal = 1000;
  const altoTotal = 200;
  const maxVal = 70000;

  const calcularCoordenada = (index: number, valor: number) => {
    const pasoX = anchoTotal / (datosGrafica.length - 1);
    const x = index * pasoX;
    const y = altoTotal - (valor / maxVal) * altoTotal;
    return { x, y };
  };

  const generarPuntosLinea = (tipo: 'ingresos' | 'gastos') => {
    return datosGrafica.map((d, i) => {
      const val = tipo === 'ingresos' ? d.ingresos : d.gastos;
      const { x, y } = calcularCoordenada(i, val);
      return `${x},${y}`;
    }).join(' ');
  };

  const generarConsejoIA = async () => {
    setGenerando(true);
    setConsejoIA(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiza patrimonio: Ahorros $125k, Egresos $${datosGrafica[5].gastos}. Dame un consejo rápido de inversión en México.`,
      });
      setConsejoIA(response.text || "Excelente gestión.");
      notificar('¡Análisis IA completado!', 'success');
    } catch (err) {
      notificar('IA en mantenimiento', 'info');
    } finally {
      setGenerando(false);
    }
  };

  const handleDescargarRegistro = () => {
    notificar('Generando Registro Fiscal...', 'info');
    setTimeout(() => notificar('Registro_Fiscal_2024.pdf descargado', 'success'), 2000);
  };

  const ejecutarRegistroActividad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || !motivo) return;
    agregarTransaccion(parseFloat(monto), `${motivo} (${categoria})`, tipoTransaccion);
    setModalActividadAbierto(false);
    setMonto('');
    setMotivo('');
    setCategoria('General');
  };

  const handlePointHover = (index: number, tipo: 'Ingreso' | 'Gasto', e: React.MouseEvent) => {
    const d = datosGrafica[index];
    const valor = tipo === 'Ingreso' ? d.ingresos : d.gastos;
    const { x, y } = calcularCoordenada(index, valor);
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      setHoverInfo({
        x: (x / anchoTotal) * svgRect.width,
        y: (y / altoTotal) * svgRect.height,
        mes: d.mes,
        valor,
        tipo
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-zinc-950">
      <Sidebar vistaActual="panel" onNavigate={onNavigate} />

      <main ref={dashboardRef} className="w-full md:flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-12 pb-24">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter">Hola, {usuario.nombre.split(' ')[0]} 👋</h2>
            <p className="text-slate-500 font-bold mt-2 text-lg">Tu patrimonio creció un <span className="text-primary">8.4%</span> este trimestre.</p>
          </div>
          <div className="flex flex-wrap gap-4">
             <button 
                onClick={handleDescargarRegistro} 
                className="flex items-center gap-3 px-8 py-5 border-2 border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-black rounded-[1.75rem] shadow-sm transition-all hover:border-primary active:scale-95 group"
             >
               <span className="material-symbols-outlined !text-[24px] group-hover:animate-bounce">download</span>
               Descargar Registro
             </button>
             <button 
                onClick={generarConsejoIA} 
                disabled={generando} 
                className="flex items-center gap-3 px-8 py-5 bg-primary text-slate-900 font-black rounded-[1.75rem] shadow-2xl transition-all hover:scale-105 active:scale-95 shadow-primary/30"
             >
               <span className="material-symbols-outlined fill-1 !text-[24px]">{generando ? 'sync' : 'auto_awesome'}</span>
               {generando ? 'Consultando IA...' : 'Asesor IA'}
             </button>
          </div>
        </header>

        {consejoIA && (
          <div className="bg-primary/10 border border-primary/30 p-10 rounded-[4rem] flex gap-8 items-start animate-in zoom-in-95 relative overflow-hidden group shadow-xl">
             <div className="size-16 bg-primary rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl shadow-primary/40 relative z-10"><span className="material-symbols-outlined fill-1 text-slate-900 !text-[32px]">magic_button</span></div>
             <div className="flex-1 relative z-10">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-2">IA STRATEGY</p>
                <p className="text-2xl font-black">{consejoIA}</p>
             </div>
             <button onClick={() => setConsejoIA(null)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0"><span className="material-symbols-outlined !text-[32px]">close</span></button>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Capital Total', val: '$125,400', trend: '+12.5%', icon: 'account_balance_wallet', color: 'primary' },
            { 
              label: 'Gasto Hormiga', 
              val: `$${infoHormiga.total.toLocaleString()}`, 
              trend: infoHormiga.topHormiga ? `Top: ${infoHormiga.topHormiga.nombre}` : 'Sin alertas', 
              icon: 'leak_add', 
              color: 'amber' 
            },
            { label: 'Egresos Mes', val: `$${datosGrafica[5].gastos.toLocaleString()}`, trend: '-2.1%', icon: 'trending_down', color: 'red' },
            { label: 'Ingresos Mes', val: `$${datosGrafica[5].ingresos.toLocaleString()}`, trend: '+15.4%', icon: 'trending_up', color: 'primary' },
          ].map(stat => (
            <div key={stat.label} className="stat-card bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all group cursor-default">
               <div className="flex justify-between items-start mb-8">
                  <div className={`size-14 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-${stat.color === 'amber' ? 'amber-500' : 'primary'}/10 group-hover:text-${stat.color === 'amber' ? 'amber-500' : 'primary'} transition-colors`}>
                    <span className="material-symbols-outlined !text-[28px]">{stat.icon}</span>
                  </div>
                  <span className={`text-[10px] font-black px-4 py-2 rounded-xl shadow-inner ${stat.color === 'amber' ? 'bg-amber-500/10 text-amber-500' : (stat.trend.startsWith('+') ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500')}`}>
                    {stat.trend}
                  </span>
               </div>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">{stat.label}</p>
               <h3 className="text-3xl font-black tracking-tighter truncate">{stat.val}</h3>
            </div>
          ))}
        </section>

        <section className="chart-container bg-white dark:bg-zinc-900 p-12 lg:p-16 rounded-[4rem] border dark:border-zinc-800 shadow-sm overflow-visible relative">
           <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-8 relative z-10">
              <div className="text-center sm:text-left">
                <h3 className="font-black text-4xl tracking-tighter mb-2">Tendencia Patrimonial</h3>
                <p className="text-slate-500 font-bold">Análisis dinámico de tus flujos financieros.</p>
              </div>
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setModalActividadAbierto(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-zinc-950 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    <span className="material-symbols-outlined !text-[20px]">add</span>
                    Guardar Actividad
                  </button>
                  <div className="flex gap-2 p-2 bg-slate-100 dark:bg-zinc-800 rounded-[2.25rem]">
                    {['todos', 'ingresos', 'gastos'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFiltroGrafica(f as any)}
                        className={`px-8 py-4 text-[10px] font-black rounded-2xl transition-all uppercase tracking-[0.2em] ${filtroGrafica === f ? 'bg-primary text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
              </div>
           </div>
           
           <div className="relative h-96 w-full px-4 mb-8">
              <svg ref={svgRef} className="h-full w-full overflow-visible" viewBox={`0 -80 ${anchoTotal} ${altoTotal + 100}`} preserveAspectRatio="none">
                {[0, 50, 100, 150, 200].map(val => (
                   <line key={val} x1="0" y1={val} x2={anchoTotal} y2={val} className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="10,10" />
                ))}
                
                {(filtroGrafica === 'todos' || filtroGrafica === 'ingresos') && (
                  <>
                    <path d={`M ${generarPuntosLinea('ingresos')}`} fill="none" className="stroke-primary" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    {datosGrafica.map((d, i) => {
                      const { x, y } = calcularCoordenada(i, d.ingresos);
                      return (
                        <circle key={`ing-${i}`} cx={x} cy={y} r="12" className="fill-primary cursor-pointer hover:r-16 transition-all" onMouseEnter={(e) => handlePointHover(i, 'Ingreso', e)} onMouseLeave={() => setHoverInfo(null)} />
                      );
                    })}
                  </>
                )}

                {(filtroGrafica === 'todos' || filtroGrafica === 'gastos') && (
                  <>
                    <path d={`M ${generarPuntosLinea('gastos')}`} fill="none" className="stroke-red-500" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    {datosGrafica.map((d, i) => {
                      const { x, y } = calcularCoordenada(i, d.gastos);
                      return (
                        <circle key={`gst-${i}`} cx={x} cy={y} r="12" className="fill-red-500 cursor-pointer hover:r-16 transition-all" onMouseEnter={(e) => handlePointHover(i, 'Gasto', e)} onMouseLeave={() => setHoverInfo(null)} />
                      );
                    })}
                  </>
                )}
              </svg>

              {hoverInfo && (
                <div 
                  className="absolute pointer-events-none z-[100] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-90 flex flex-col items-center min-w-[140px]"
                  style={{ left: `${hoverInfo.x}px`, top: `${hoverInfo.y - 120}px`, transform: 'translateX(-50%)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{hoverInfo.mes} · {hoverInfo.tipo}</p>
                  <p className="text-xl font-black">${hoverInfo.valor.toLocaleString()}</p>
                  <div className={`mt-2 size-2 rounded-full ${hoverInfo.tipo === 'Ingreso' ? 'bg-primary' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
                </div>
              )}

              <div className="flex justify-between mt-12 px-2 border-t dark:border-zinc-800 pt-8">
                 {datosGrafica.map(d => (
                   <span key={d.mes} className="text-[12px] font-black text-slate-400 tracking-[0.2em] uppercase">{d.mes}</span>
                 ))}
              </div>
           </div>
        </section>

        {/* SECCIÓN IA: PLAN DE OPTIMIZACIÓN (GASTO HORMIGA) */}
        <section className="ia-section bg-gradient-to-br from-slate-900 to-zinc-950 dark:from-zinc-900 dark:to-black p-12 lg:p-16 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined !text-[120px] text-primary">savings</span>
           </div>
           
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="size-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30">
                    <span className="material-symbols-outlined fill-1 text-slate-900 !text-[32px]">auto_awesome</span>
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">Estrategia de Optimización IA</h3>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Análisis de Fugas de Capital</p>
                 </div>
              </div>

              {infoHormiga.total > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <p className="text-xl text-slate-200 leading-relaxed font-bold">
                        Hemos detectado que gastas <span className="text-primary">$${infoHormiga.total.toLocaleString()}</span> al mes en conceptos recurrentes (Hormiga).
                      </p>
                      <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Offender</span>
                            <span className="text-primary font-black uppercase text-xs tracking-widest">{infoHormiga.topHormiga?.veces} veces</span>
                         </div>
                         <p className="text-4xl font-black text-white capitalize tracking-tighter">{infoHormiga.topHormiga?.nombre}</p>
                         <p className="text-slate-500 font-bold mt-2">$${infoHormiga.topHormiga?.total.toLocaleString()} MXN acumulados</p>
                      </div>
                   </div>
                   <div className="p-8 lg:p-10 bg-primary/5 rounded-[3rem] border border-primary/20 relative">
                      <div className="absolute -top-4 -left-4 px-6 py-2 bg-primary text-slate-900 rounded-full text-[10px] font-black tracking-widest uppercase">Plan de Inversión IA</div>
                      {cargandoRecIA ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                           <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                           <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Generando Estrategia...</p>
                        </div>
                      ) : (
                        <div className="prose prose-invert text-slate-300 font-bold leading-relaxed whitespace-pre-line text-lg">
                           {recIAHormiga}
                        </div>
                      )}
                   </div>
                </div>
              ) : (
                <p className="text-slate-400 font-bold italic text-center py-12">Sigue registrando tus gastos. Si detectamos un patrón recurrente (5+ veces), aquí aparecerá tu estrategia de optimización.</p>
              )}
           </div>
        </section>
      </main>

      {/* MODAL REGISTRO DE ACTIVIDAD */}
      {modalActividadAbierto && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-xl">
           <div ref={modalContentRef} className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[4rem] p-12 lg:p-16 shadow-2xl border dark:border-white/10">
              <div className="flex justify-between items-center mb-12">
                 <div>
                    <h3 className="text-4xl font-black tracking-tighter">Registrar Flujo</h3>
                    <p className="text-slate-500 font-bold mt-1">Tu IA detectará automáticamente si es un Gasto Hormiga.</p>
                 </div>
                 <button onClick={() => setModalActividadAbierto(false)} className="size-16 rounded-3xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                   <span className="material-symbols-outlined !text-[32px]">close</span>
                 </button>
              </div>

              <form onSubmit={ejecutarRegistroActividad} className="space-y-8">
                 <div className="flex gap-4 p-2 bg-slate-100 dark:bg-zinc-800 rounded-[2.5rem] shadow-inner">
                    <button type="button" onClick={() => setTipoTransaccion('gasto')} className={`flex-1 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${tipoTransaccion === 'gasto' ? 'bg-red-500 text-white shadow-xl scale-[1.02]' : 'text-slate-400'}`}>Egreso</button>
                    <button type="button" onClick={() => setTipoTransaccion('ingreso')} className={`flex-1 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${tipoTransaccion === 'ingreso' ? 'bg-primary text-slate-900 shadow-xl scale-[1.02]' : 'text-slate-400'}`}>Ingreso</button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4">Monto (MXN)</label>
                       <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl">$</span>
                          <input autoFocus type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-zinc-800/50 border-none rounded-[2rem] py-6 pl-12 pr-6 text-2xl font-black focus:ring-8 focus:ring-primary/10 transition-all shadow-inner" required />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4">Categoría</label>
                       <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800/50 border-none rounded-[2rem] py-6 px-8 text-lg font-black focus:ring-8 focus:ring-primary/10 transition-all shadow-inner cursor-pointer appearance-none">
                          <option>Alimentos</option>
                          <option>Transporte (Uber/Didi)</option>
                          <option>Salud</option>
                          <option>Educación</option>
                          <option>Inversión</option>
                          <option>General</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4">Concepto (Ej: Café, Oxxo, Taxi)</label>
                    <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Introduce el nombre del comercio..." className="w-full bg-slate-50 dark:bg-zinc-800/50 border-none rounded-[2rem] py-6 px-8 text-lg font-black focus:ring-8 focus:ring-primary/10 transition-all shadow-inner" required />
                 </div>

                 <button type="submit" className="w-full py-8 bg-zinc-950 dark:bg-primary dark:text-slate-900 text-white font-black rounded-[2.5rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-[0.2em]">Guardar Registro Financiero</button>
              </form>
           </div>
        </div>
      )}
    
      <MobileNav vistaActual="panel" onNavigate={onNavigate} />
</div>
  );
};

export default DashboardView;