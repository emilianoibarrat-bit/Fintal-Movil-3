
import React, { useState, useContext, useEffect, useRef } from 'react';
import { VistaApp } from '../types';
import { AppContext } from '../App';
import Sidebar from '../components/Sidebar';
import anime from 'animejs';
import MobileNav from '../components/MobileNav';

interface SettingsViewProps {
  onNavigate: (view: VistaApp) => void;
}

const BANCOS_MEXICO = [
  { id: 'b1', nombre: 'BBVA México', status: 'Sincronizado', color: 'bg-[#004481]', balance: '$45,230.50', icon: '🏦' },
  { id: 'b2', nombre: 'Nu México', status: 'Sincronizado', color: 'bg-[#820ad1]', balance: '$12,400.00', icon: '💳' },
  { id: 'b4', nombre: 'Santander', status: 'Sincronizado', color: 'bg-[#ec0000]', balance: '$2,150.20', icon: '🏦' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const contexto = useContext(AppContext);
  const [guardando, setGuardando] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (contentRef.current) {
      // Fix: Cast anime to any to avoid call signature error
      (anime as any)({
        targets: contentRef.current.children,
        translateY: [20, 0],
        opacity: [0, 1],
        delay: (anime as any).stagger(100, { start: 400 }),
        easing: 'easeOutQuint',
        duration: 800
      });
    }
  }, []);

  if (!contexto) return null;
  const { notificar, usuario, actualizarUsuario } = contexto;

  const [datos, setDatos] = useState({
    nombre: usuario.nombre.split(' ')[0],
    apellido: usuario.nombre.split(' ')[1] || '',
    email: 'hola@fintal.io',
    tel: '+52 55 9876 5432'
  });

  const manejarGuardado = () => {
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      actualizarUsuario({ nombre: `${datos.nombre} ${datos.apellido}` });
      notificar('Tu perfil ha sido actualizado.', 'success');
    }, 1200);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      <Sidebar vistaActual="ajustes" onNavigate={onNavigate} />

      <main className="w-full md:flex-1 overflow-y-auto p-4 md:p-8 lg:p-16 relative z-10 pb-24">
        <div ref={contentRef} className="max-w-5xl mx-auto space-y-16 pb-32">
          <header className="flex flex-col md:flex-row items-center gap-10 pb-12 border-b dark:border-zinc-800">
             <div className="relative group cursor-pointer shrink-0">
                <div className="size-40 rounded-[3rem] overflow-hidden ring-12 ring-primary/5 shadow-2xl transition-all group-hover:scale-105 group-hover:ring-primary/10">
                  <img src={usuario.avatar} className="size-full object-cover" alt="Avatar" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]">
                   <span className="material-symbols-outlined text-white !text-[32px]">edit</span>
                </div>
             </div>
             <div className="text-center md:text-left flex-1">
                <h2 className="text-5xl font-black mb-3 tracking-tighter">Mi Perfil</h2>
                <p className="text-slate-500 font-bold text-xl">Configuración de seguridad y vinculación bancaria.</p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                   <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20">FINTAL PRO VERIFICADO</span>
                   <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl">KYC VALIDADO</span>
                </div>
             </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <section className="lg:col-span-7 space-y-12">
              <div className="flex items-center gap-4 mb-2">
                  <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined fill-1 !text-[24px]">manage_accounts</span>
                  </div>
                  <h3 className="font-black text-3xl tracking-tight">Datos Personales</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[
                    { id: 'nombre', label: 'Nombre' },
                    { id: 'apellido', label: 'Apellido' },
                    { id: 'email', label: 'Correo' },
                    { id: 'tel', label: 'Celular' },
                  ].map(field => (
                    <div key={field.id} className="space-y-3 group">
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] group-focus-within:text-primary transition-colors">{field.label}</label>
                      <input 
                        value={(datos as any)[field.id]}
                        onChange={(e) => setDatos({...datos, [field.id]: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border-none rounded-3xl py-5 px-8 text-base font-black outline-none focus:ring-8 focus:ring-primary/5 transition-all shadow-inner" 
                      />
                    </div>
                  ))}
              </div>
              <div className="flex justify-end pt-8">
                  <button onClick={manejarGuardado} disabled={guardando} className="bg-primary text-slate-900 px-16 py-6 rounded-[2rem] font-black text-sm shadow-2xl transition-all hover:scale-105 active:scale-95 shadow-primary/30 uppercase tracking-widest">
                    {guardando ? 'Guardando...' : 'Actualizar Perfil'}
                  </button>
              </div>
            </section>

            <section className="lg:col-span-5 space-y-10">
              <div className="flex items-center gap-4 mb-2">
                  <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined fill-1 !text-[24px]">account_balance</span>
                  </div>
                  <h3 className="font-black text-3xl tracking-tight">Cuentas</h3>
              </div>
              <div className="space-y-6">
                {BANCOS_MEXICO.map(banco => (
                  <div key={banco.id} className="p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border dark:border-zinc-800 hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-6 mb-8">
                      <div className={`size-16 ${banco.color} rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-white/10`}>
                         <span className="relative z-10">{banco.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-xl tracking-tight mb-1">{banco.nombre}</p>
                        <div className="flex items-center gap-2">
                           <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{banco.status}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] flex justify-between items-center shadow-inner">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo</p>
                          <p className="text-2xl font-black tracking-tighter">{banco.balance}</p>
                       </div>
                       <button className="text-slate-300 hover:text-primary transition-colors"><span className="material-symbols-outlined">settings</span></button>
                    </div>
                  </div>
                ))}
                <button className="w-full py-8 border-4 border-dashed border-slate-100 dark:border-zinc-800 rounded-[3rem] text-slate-400 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.3em] active:scale-95 bg-slate-50/50">
                  <span className="material-symbols-outlined !text-[28px]">add_circle</span> Conectar Banco
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    
      <MobileNav vistaActual="ajustes" onNavigate={onNavigate} />
</div>
  );
};

export default SettingsView;