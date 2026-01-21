
import React, { useState, useEffect, Suspense, createContext, useContext } from 'react';
import { VistaApp, Publicacion, Notificacion, PerfilUsuario, Transaccion, Comentario, AppContextType } from './types';
import LandingView from './views/Landing';
import FeedView from './views/Feed';
import MarketplaceView from './views/Marketplace';
import DashboardView from './views/Dashboard';
import SettingsView from './views/Settings';
import AIAssistant from './components/AIAssistant';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';

export const AppContext = createContext<AppContextType | null>(null);

const USUARIO_INVITADO: PerfilUsuario = {
  nombre: 'Invitado',
  usuario: '@invitado',
  avatar: 'https://i.pravatar.cc/150?u=invitado',
  esPremium: false
};

const PUBLICACIONES_INICIALES: Publicacion[] = [
  {
    id: '1',
    autor: 'Sofía Macías',
    usuario: '@sofia_macias',
    avatar: 'https://i.pravatar.cc/150?u=sofia',
    contenido: "¡El IPC está en un punto de entrada interesante! Analicen sus stop-loss antes de entrar. 📈 #InversionesMX #BMV",
    fecha: 'hace 2h',
    verificado: true,
    meGusta: 156,
    comentariosCount: 42,
    compartidos: 42,
    vistas: '3.1k',
    estaLike: false,
    comentarios: [
      { id: 'c1', autor: 'Carlos Inversor', avatar: 'https://i.pravatar.cc/150?u=carlos', contenido: 'Totalmente de acuerdo, Sofía. Yo entré ayer con una posición pequeña en Cemex.', fecha: 'hace 1h' },
      { id: 'c2', autor: 'Elena Vázquez', avatar: 'https://i.pravatar.cc/150?u=elena', contenido: '¿Qué stop-loss recomiendas para una posición larga en este sector?', fecha: 'hace 45m' }
    ]
  },
  {
    id: '2',
    autor: 'Daniel Martínez',
    usuario: '@dan_finanzas',
    avatar: 'https://i.pravatar.cc/150?u=daniel',
    contenido: "Con la última decisión de Banxico, las tasas de CETES se mantienen atractivas. Es momento de amarrar plazos largos (1 año) antes de que empiecen los recortes. 💸 #CETES #AhorroInteligente",
    fecha: 'hace 4h',
    verificado: true,
    meGusta: 89,
    comentariosCount: 15,
    compartidos: 20,
    vistas: '1.8k',
    estaLike: false,
    comentarios: [
      { id: 'c3', autor: 'Mariana R.', avatar: 'https://i.pravatar.cc/150?u=mariana', contenido: '¿Crees que sea mejor que una SOFIPO ahorita?', fecha: 'hace 2h' },
      { id: 'c4', autor: 'Daniel Martínez', avatar: 'https://i.pravatar.cc/150?u=daniel', contenido: 'Las SOFIPOs dan más, pero el riesgo soberano de CETES es imbatible para el fondo de emergencia.', fecha: 'hace 1h' }
    ]
  },
  {
    id: '3',
    autor: 'Elena Vázquez',
    usuario: '@elena_retiro',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    contenido: "Muchos me preguntan: ¿PPR o AFORE? Mi respuesta siempre es: ¡Ambos! Pero el beneficio fiscal del PPR (Art. 151) es una joya que no deben dejar pasar este año fiscal. 🛡️ #RetiroDigno #SAT",
    fecha: 'hace 6h',
    verificado: true,
    meGusta: 210,
    comentariosCount: 56,
    compartidos: 85,
    vistas: '5.4k',
    estaLike: false,
    comentarios: [
      { id: 'c5', autor: 'Ricardo Ruiz', avatar: 'https://i.pravatar.cc/150?u=ricardo', contenido: 'La deducción de impuestos es el rendimiento inmediato más grande que existe.', fecha: 'hace 3h' }
    ]
  },
  {
    id: '4',
    autor: 'Ricardo Ruiz',
    usuario: '@ric_trader',
    avatar: 'https://i.pravatar.cc/150?u=ricardo',
    contenido: "El USD/MXN rompiendo soportes clave. El 'Super Peso' sigue sorprendiendo a muchos, pero ojo con las exportadoras en la BMV, sus márgenes están sufriendo. 🇲🇽🇺🇸 #TradingMX #SuperPeso",
    fecha: 'hace 8h',
    verificado: false,
    meGusta: 45,
    comentariosCount: 8,
    compartidos: 5,
    vistas: '900',
    estaLike: false,
    comentarios: []
  },
  {
    id: '5',
    autor: 'Mónica Silva',
    usuario: '@moni_inmuebles',
    avatar: 'https://i.pravatar.cc/150?u=monica',
    contenido: "¿Vieron el nuevo reporte de Fibras? FIBRAMQ y FUNO traen dividendos interesantes este trimestre. El sector industrial sigue fuerte por el Nearshoring. 🏗️ #Fibras #BienesRaices",
    fecha: 'hace 10h',
    verificado: true,
    meGusta: 132,
    comentariosCount: 22,
    compartidos: 14,
    vistas: '2.5k',
    estaLike: false,
    comentarios: [
      { id: 'c6', autor: 'Luis Broker', avatar: 'https://i.pravatar.cc/150?u=luis', contenido: 'El nearshoring va para largo, excelente recomendación.', fecha: 'hace 5h' }
    ]
  }
];

const GASTOS_INICIALES: Transaccion[] = [
  { id: '1', comercio: 'Walmart Express', categoria: 'Despensa', fecha: 'Hoy', monto: -1240.50, icono: '🛒', tipo: 'gasto' },
  { id: '2', comercio: 'Sueldo Mensual', categoria: 'Ingreso', fecha: 'Hoy', monto: 25000.00, icono: '💰', tipo: 'ingreso' },
  { id: 'c1', comercio: 'Café', categoria: 'Alimentos', fecha: 'Ayer', monto: -55.00, icono: '☕', tipo: 'gasto' },
  { id: 'c2', comercio: 'Café', categoria: 'Alimentos', fecha: 'Hace 2 días', monto: -55.00, icono: '☕', tipo: 'gasto' },
  { id: 'c3', comercio: 'Café', categoria: 'Alimentos', fecha: 'Hace 3 días', monto: -55.00, icono: '☕', tipo: 'gasto' },
  { id: 'c4', comercio: 'Café', categoria: 'Alimentos', fecha: 'Hace 4 días', monto: -55.00, icono: '☕', tipo: 'gasto' },
  { id: 'c5', comercio: 'Café', categoria: 'Alimentos', fecha: 'Hace 5 días', monto: -55.00, icono: '☕', tipo: 'gasto' },
];

const App: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<VistaApp>('inicio');
  const [iaAbierta, setIaAbierta] = useState(false);
  const [authAbierto, setAuthAbierto] = useState(false);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>(PUBLICACIONES_INICIALES);
  const [gastos, setGastos] = useState<Transaccion[]>(GASTOS_INICIALES);
  const [notificacion, setNotificacion] = useState<Notificacion | null>(null);
  const [usuario, setUsuario] = useState<PerfilUsuario>(USUARIO_INVITADO);
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  useEffect(() => {
    const manejarCambioHash = () => {
      const hash = window.location.hash.replace('#', '') as VistaApp;
      const vistasPrivadas: VistaApp[] = ['comunidad', 'asesores', 'panel', 'ajustes'];
      
      if (vistasPrivadas.includes(hash) && !estaAutenticado) {
        setAuthAbierto(true);
        window.location.hash = 'inicio';
        return;
      }

      if (['inicio', 'comunidad', 'asesores', 'panel', 'ajustes'].includes(hash)) {
        setVistaActual(hash);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', manejarCambioHash);
    manejarCambioHash();
    return () => window.removeEventListener('hashchange', manejarCambioHash);
  }, [estaAutenticado]);

  const navegarA = (vista: VistaApp) => {
    if (vista !== 'inicio' && !estaAutenticado) {
      setAuthAbierto(true);
      return;
    }
    window.location.hash = vista;
  };

  const notificar = (mensaje: string, tipo: 'success' | 'error' | 'info' = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const actualizarUsuario = (cambios: Partial<PerfilUsuario>) => {
    setUsuario(prev => ({ ...prev, ...cambios }));
    setEstaAutenticado(true);
  };

  const agregarPublicacion = (contenido: string) => {
    const nueva: Publicacion = {
      id: Date.now().toString(),
      autor: usuario.nombre,
      usuario: usuario.usuario,
      avatar: usuario.avatar,
      contenido,
      fecha: 'Ahora',
      verificado: true,
      meGusta: 0,
      comentariosCount: 0,
      compartidos: 0,
      vistas: '1',
      estaLike: false,
      estaCompartido: false,
      comentarios: []
    };
    setPublicaciones([nueva, ...publicaciones]);
    notificar('¡Publicado con éxito!', 'success');
  };

  const agregarComentario = (publicacionId: string, contenido: string) => {
    setPublicaciones(prev => prev.map(p => {
      if (p.id === publicacionId) {
        const nuevoCom: Comentario = {
          id: Date.now().toString(),
          autor: usuario.nombre,
          avatar: usuario.avatar,
          contenido,
          fecha: 'Ahora'
        };
        return {
          ...p,
          comentarios: [...(p.comentarios || []), nuevoCom],
          comentariosCount: p.comentariosCount + 1
        };
      }
      return p;
    }));
    notificar('Respuesta enviada', 'success');
  };

  const agregarTransaccion = (monto: number, motivo: string, tipo: 'gasto' | 'ingreso') => {
    const nuevo: Transaccion = {
      id: Date.now().toString(),
      comercio: motivo,
      categoria: tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
      fecha: 'Hoy',
      monto: tipo === 'ingreso' ? Math.abs(monto) : -Math.abs(monto),
      icono: tipo === 'ingreso' ? '💰' : '💸',
      tipo
    };
    setGastos([nuevo, ...gastos]);
    notificar(tipo === 'ingreso' ? 'Ingreso registrado' : 'Gasto registrado', 'success');
  };

  const eliminarTransaccion = (id: string) => {
    setGastos(prev => prev.filter(t => t.id !== id));
    notificar('Transacción eliminada con éxito', 'info');
  };

  const alternarLike = (id: string) => {
    setPublicaciones(prev => prev.map(p => {
      if (p.id === id) {
        const liked = !p.estaLike;
        return { ...p, estaLike: liked, meGusta: liked ? p.meGusta + 1 : p.meGusta - 1 };
      }
      return p;
    }));
  };

  const alternarCompartir = (id: string) => {
    setPublicaciones(prev => prev.map(p => {
      if (p.id === id) {
        const shared = !p.estaCompartido;
        return { ...p, estaCompartido: shared, compartidos: shared ? p.compartidos + 1 : p.compartidos - 1 };
      }
      return p;
    }));
    notificar('Compartido en tu comunidad', 'info');
  };

  const renderizarVista = () => {
    switch (vistaActual) {
      case 'inicio': return <LandingView onNavigate={navegarA} onOpenAuth={() => setAuthAbierto(true)} />;
      case 'comunidad': return <FeedView onNavigate={navegarA} />;
      case 'asesores': return <MarketplaceView onNavigate={navegarA} />;
      case 'panel': return <DashboardView onNavigate={navegarA} />;
      case 'ajustes': return <SettingsView onNavigate={navegarA} />;
      default: return <LandingView onNavigate={navegarA} onOpenAuth={() => setAuthAbierto(true)} />;
    }
  };

  return (
    <AppContext.Provider value={{ 
      publicaciones, usuario, gastos, 
      agregarPublicacion, agregarComentario, agregarTransaccion, eliminarTransaccion,
      notificar, navegarA, abrirAuth: () => setAuthAbierto(true), 
      actualizarUsuario, alternarLike, alternarCompartir
    }}>
      <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans transition-colors duration-500">
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
          {renderizarVista()}
        </Suspense>
        
        {notificacion && <Toast message={notificacion.mensaje} type={notificacion.tipo} />}
        
        <AuthModal isOpen={authAbierto} onClose={() => setAuthAbierto(false)} />

        {vistaActual !== 'inicio' && estaAutenticado && (
          <>
            <button 
              onClick={() => setIaAbierta(true)}
              className="fixed bottom-24 md:bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-slate-900 shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white dark:border-zinc-900"
            >
              <span className="material-symbols-outlined !text-[32px] fill-1">smart_toy</span>
            </button>
            <AIAssistant isOpen={iaAbierta} onClose={() => setIaAbierta(false)} />
          </>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
