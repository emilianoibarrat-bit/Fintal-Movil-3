
export type VistaApp = 'inicio' | 'comunidad' | 'asesores' | 'panel' | 'ajustes';

export interface PerfilUsuario {
  nombre: string;
  usuario: string;
  avatar: string;
  esPremium: boolean;
}

export interface Experto {
  id: string;
  nombre: string;
  rol: string;
  calificacion: number;
  resenas: number;
  tarifaHora: number;
  etiquetas: string[];
  avatar: string;
  verificado: boolean;
  descripcion: string;
}

export interface Comentario {
  id: string;
  autor: string;
  avatar: string;
  contenido: string;
  fecha: string;
}

export interface Publicacion {
  id: string;
  autor: string;
  usuario: string;
  avatar: string;
  contenido: string;
  fecha: string;
  verificado: boolean;
  meGusta: number;
  comentariosCount: number;
  compartidos: number;
  vistas: string;
  estaLike?: boolean;
  estaCompartido?: boolean;
  comentarios?: Comentario[];
}

export interface Transaccion {
  id: string;
  comercio: string;
  categoria: string;
  fecha: string;
  monto: number;
  icono: string;
  tipo: 'gasto' | 'ingreso';
}

export interface Notificacion {
  mensaje: string;
  tipo: 'success' | 'error' | 'info';
}

export interface AppContextType {
  publicaciones: Publicacion[];
  usuario: PerfilUsuario;
  gastos: Transaccion[];
  agregarPublicacion: (contenido: string) => void;
  agregarComentario: (publicacionId: string, contenido: string) => void;
  agregarTransaccion: (monto: number, motivo: string, tipo: 'gasto' | 'ingreso') => void;
  eliminarTransaccion: (id: string) => void;
  notificar: (msg: string, tipo?: 'success' | 'error' | 'info') => void;
  navegarA: (vista: VistaApp) => void;
  abrirAuth: () => void;
  actualizarUsuario: (cambios: Partial<PerfilUsuario>) => void;
  alternarLike: (pubId: string) => void;
  alternarCompartir: (pubId: string) => void;
}
