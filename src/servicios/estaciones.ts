import { EstacionHidrometrica } from '../types';
import { obtenerHistoricoReal } from './api';

type Lectura = { fecha: string; altura_m: number };

// Recuerda qué nombre de estación funcionó contra /historico/{estacion}
const nombreQueFunciono = new Map<string, string>();

function quitarAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function candidatosDeNombre(est: EstacionHidrometrica): string[] {
  const porId = est.id.replace(/^est_/, '');
  const base = quitarAcentos(est.nombre.split('(')[0].trim().toLowerCase());
  const guionBajo = base.replace(/\s+/g, '_');
  const guion = base.replace(/\s+/g, '-');
  const pegado = base.replace(/\s+/g, '');
  const lista = Array.from(new Set([porId, guionBajo, guion, pegado, base]));
  const guardado = nombreQueFunciono.get(est.id);
  return guardado ? [guardado, ...lista.filter((n) => n !== guardado)] : lista;
}

function unaLecturaPorDia(lecturas: Lectura[]): Lectura[] {
  const validas = lecturas.filter(
    (l) =>
      l &&
      typeof l.altura_m === 'number' &&
      typeof l.fecha === 'string' &&
      !isNaN(new Date(l.fecha).getTime())
  );
  const ordenadas = [...validas].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  const porDia = new Map<string, Lectura>();
  for (const l of ordenadas) {
    porDia.set(l.fecha.slice(0, 10), l);
  }
  return Array.from(porDia.values());
}

// Pendiente por mínimos cuadrados, en metros por día
export function calcularPendienteDiaria(lecturas: Lectura[]): number {
  if (lecturas.length < 2) return 0;
  const t0 = new Date(lecturas[0].fecha).getTime();
  const xs = lecturas.map((l) => (new Date(l.fecha).getTime() - t0) / 86400000);
  const ys = lecturas.map((l) => l.altura_m);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) * (xs[i] - mx);
  }
  return den === 0 ? 0 : num / den;
}

export function textoTendencia(pendienteDia: number): string {
  const signo = pendienteDia >= 0 ? '+' : '';
  const valor = `${signo}${pendienteDia.toFixed(2)} m en 24h`;
  if (pendienteDia > 0.01) return `creciendo (${valor})`;
  if (pendienteDia < -0.01) return `bajando (${valor})`;
  return `estable (${valor})`;
}

// Parte de las estaciones semilla y las pisa con el histórico real.
// Si una estación no consigue datos reales, queda la semilla
// (y HydroTrends avisa que el dato es viejo).
export async function construirEstacionesVivas(
  semilla: EstacionHidrometrica[]
): Promise<EstacionHidrometrica[]> {
  return Promise.all(
    semilla.map(async (est) => {
      for (const nombre of candidatosDeNombre(est)) {
        const crudo = await obtenerHistoricoReal(nombre, 30);
        const serie = unaLecturaPorDia(crudo).slice(-7);
        if (serie.length >= 2) {
          nombreQueFunciono.set(est.id, nombre);
          return {
            ...est,
            altura_actual_m: serie[serie.length - 1].altura_m,
            historico: serie as EstacionHidrometrica['historico'],
            tendencia_texto: textoTendencia(calcularPendienteDiaria(serie)),
          };
        }
      }
      console.warn('Sin histórico real para la estación:', est.id, est.nombre);
      return est;
    })
  );
}
