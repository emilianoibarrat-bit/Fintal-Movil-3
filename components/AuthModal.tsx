
import React, { useState, useContext, useEffect, useRef } from 'react';
import Logo from './Logo';
import { AppContext } from '../App';
import anime from 'animejs';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const contexto = useContext(AppContext);
  const [modo, setModo] = useState<'login' | 'signup' | 'faceid'>('login');
  const [procesando, setProcesando] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen && modalRef.current) {
      (anime as any)({
        targets: modalRef.current,
        scale: [0.95, 1],
        opacity: [0, 1],
        translateY: [30, 0],
        easing: 'easeOutBack',
        duration: 500
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (modo === 'faceid' && scannerRef.current && procesando) {
      (anime as any)({
        targets: scannerRef.current,
        translateY: [0, 180],
        easing: 'easeInOutSine',
        duration: 1500,
        direction: 'alternate',
        loop: true
      });
    }
  }, [modo, procesando]);

  if (!isOpen || !contexto) return null;
  const { actualizarUsuario, notificar } = contexto;

  const manejarFaceID = () => {
    setModo('faceid');
    setProcesando(true);
    setVerificado(false);
    
    // Simulación de escaneo biométrico
    setTimeout(() => {
      setVerificado(true);
      setProcesando(false);
      
      // Feedback de éxito
      notificar('¡Acceso concedido vía Face ID!', 'success');

      // Redirección inmediata tras mostrar el éxito de la biometría
      setTimeout(() => {
        actualizarUsuario({
          nombre: 'Inversor Pro',
          usuario: '@biometric_user',
          avatar: 'https://i.pravatar.cc/150?u=faceid_verified'
        });
        onClose();
        // Redirección forzada al apartado de comunidad como solicitó el usuario
        window.location.hash = 'comunidad';
      }, 1500); // Un poco más de tiempo para apreciar el estado de éxito
    }, 3000); 
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    setTimeout(() => {
      const nombreAMostrar = modo === 'signup' ? nombre : (nombre || email.split('@')[0]);
      actualizarUsuario({
        nombre: nombreAMostrar,
        usuario: '@' + email.split('@')[0].toLowerCase()
      });

      setProcesando(false);
      notificar(`¡Bienvenido, ${nombreAMostrar}!`, 'success');
      onClose();
      window.location.hash = 'comunidad';
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-3xl transition-all duration-700">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[5rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.8)] border dark:border-white/10"
      >
        <div className="p-12 lg:p-16">
          <div className="flex justify-between items-center mb-14">
            <Logo size={40} />
            <button onClick={onClose} className="size-14 bg-slate-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90">
              <span className="material-symbols-outlined !text-[32px]">close</span>
            </button>
          </div>

          {modo === 'faceid' ? (
            <div className="flex flex-col items-center py-10 space-y-14 animate-in fade-in duration-700">
              <div className="relative size-64 flex items-center justify-center">
                {/* Scanner Rim / Dashed Border */}
                <div className={`absolute inset-0 border-[6px] border-dashed rounded-[5rem] transition-all duration-1000 ${verificado ? 'border-primary rotate-0 scale-105 shadow-[0_0_50px_rgba(17,212,50,0.4)]' : 'border-primary/20 animate-[spin_12s_linear_infinite]'}`}></div>
                
                {/* Central Identity Circle - Refined to match image */}
                <div className={`relative size-48 rounded-[4rem] flex items-center justify-center overflow-hidden transition-all duration-700 shadow-2xl ${verificado ? 'bg-primary scale-110' : 'bg-primary/5'}`}>
                  {verificado ? (
                    <div className="flex items-center justify-center bg-[#102213] size-24 rounded-3xl shadow-inner animate-in zoom-in-50 duration-500">
                       <span className="material-symbols-outlined !text-[56px] text-primary fill-1">verified</span>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined !text-[110px] text-primary fill-1 opacity-80 animate-pulse">faceid</span>
                      {procesando && (
                        <div 
                          ref={scannerRef}
                          className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_30px_#11d432] z-20"
                        ></div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="text-center space-y-5">
                <h3 className="text-4xl font-black tracking-tighter">
                  {verificado ? 'Identidad Confirmada' : 'Escaneo Biométrico'}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 font-bold px-12 text-lg leading-relaxed">
                  {verificado ? 'Redirigiendo a la comunidad...' : 'Escaneando puntos faciales para autenticación segura de alta precisión.'}
                </p>
                
                {!verificado && (
                    <div className="flex gap-2.5 justify-center pt-4">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="size-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                        ))}
                    </div>
                )}
              </div>
              
              {!verificado && (
                <button 
                    onClick={() => setModo('login')} 
                    className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] hover:text-primary transition-all pt-8"
                >
                    USAR CONTRASEÑA
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-2 p-2.5 bg-slate-100 dark:bg-zinc-800 rounded-[2.5rem] mb-14">
                <button 
                  onClick={() => setModo('login')}
                  className={`flex-1 py-5 text-[11px] font-black rounded-3xl transition-all uppercase tracking-[0.3em] ${modo === 'login' ? 'bg-white dark:bg-zinc-700 shadow-xl text-primary' : 'text-slate-500'}`}
                >
                  ENTRAR
                </button>
                <button 
                  onClick={() => setModo('signup')}
                  className={`flex-1 py-5 text-[11px] font-black rounded-3xl transition-all uppercase tracking-[0.3em] ${modo === 'signup' ? 'bg-white dark:bg-zinc-700 shadow-xl text-primary' : 'text-slate-500'}`}
                >
                  REGISTRO
                </button>
              </div>

              <form onSubmit={manejarEnvio} className="space-y-6">
                {modo === 'signup' && (
                  <input 
                    type="text" 
                    placeholder="Tu nombre completo" 
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-[2rem] py-7 px-10 text-xl font-black focus:ring-[12px] focus:ring-primary/5 outline-none transition-all shadow-inner" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required 
                  />
                )}
                <input 
                  type="email" 
                  placeholder="Tu correo institucional" 
                  className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-[2rem] py-7 px-10 text-xl font-black focus:ring-[12px] focus:ring-primary/5 outline-none transition-all shadow-inner" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <input 
                  type="password" 
                  placeholder="Tu contraseña secreta" 
                  className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-[2rem] py-7 px-10 text-xl font-black focus:ring-[12px] focus:ring-primary/5 outline-none transition-all shadow-inner" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                
                <button 
                  type="submit"
                  disabled={procesando}
                  className="w-full py-8 bg-zinc-950 dark:bg-primary dark:text-slate-900 text-white font-black rounded-[3rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-10 tracking-[0.4em] text-[12px] uppercase"
                >
                  {procesando ? 'AUTORIZANDO...' : modo === 'login' ? 'ACCEDER AL PANEL' : 'CREAR MI CUENTA'}
                </button>
              </form>

              <div className="relative my-16">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 dark:border-zinc-800 opacity-30"></div></div>
                <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.6em] bg-white dark:bg-zinc-900 px-8 text-slate-400">SMART ACCESS</div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <button onClick={manejarFaceID} className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-slate-100 dark:border-zinc-800 rounded-[3.5rem] font-black text-[11px] uppercase tracking-widest hover:border-primary hover:bg-primary/5 transition-all group active:scale-95 shadow-sm">
                  <span className="material-symbols-outlined !text-[44px] text-primary group-hover:scale-125 transition-transform duration-500">faceid</span>
                  Face ID
                </button>
                <button className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-slate-100 dark:border-zinc-800 rounded-[3.5rem] font-black text-[11px] uppercase tracking-widest hover:border-primary hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all group active:scale-95 shadow-sm">
                   <div className="size-11 bg-slate-950 dark:bg-white dark:text-slate-900 rounded-full flex items-center justify-center text-[20px] text-white font-black group-hover:scale-110 transition-transform">G</div>
                   Google
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
