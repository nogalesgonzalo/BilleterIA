export interface Transaccion {
  id: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  concepto: string;
  tipo: 'ingreso' | 'gasto fijo' | 'gasto variable' | 'ahorro' | 'inversión';
  categoria: string;
  canal: 'Telegram' | 'Web' | 'Sistema';
}

export interface PresetTope {
  fijo: number;
  variable: number;
}

export interface AlertaIA {
  id: string;
  tipo: 'presupuesto' | 'liquidez' | 'regla15';
  titulo: string;
  descripcion: string;
  btnLabel?: string;
}
