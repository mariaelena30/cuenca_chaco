import { EstacionHidrometrica } from '../types';
import { obtenerHistoricoReal } from './api';

type Lectura = { fecha: string; altura_m: number };

// Estaciones del panel que tienen una fuente REAL de datos en el backend.
// Las demás (ej. Resistencia - Dique Río Negro, El Sauzalito) todavía no
// tienen una fuente verificada: quedan con los valores de referencia y el
// panel las marca como "dato desactualizado" en lugar de mostrar datos de
// otra estación como si fueran propios.
//   - est_barranqueras: medición directa de Prefectura Naval (vía CIM-UNL).
//   - est_puerto_bermejo: estación "Bermejo" de Prefectura, aproximada.
const CLAVE_BACKEND_POR_ESTACION: Record<string, string> = {
  est_barranqueras: 'barranqueras',
  est_puerto_bermejo: 'puerto_bermejo',
};

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
// - Con 2 o más lecturas diarias: nivel actual, tendencia y distancia al
//   umbral salen de los datos reales.
// - Con 1 sola lectura: se muestra el nivel real de hoy, pero sin tendencia
//   (no se puede calcular una tendencia con un solo punto).
// - Sin lecturas, o sin fuente real: queda la semilla (y el panel avisa que
//   el dato es viejo).
export async function construirEstacionesVivas(
  semilla: EstacionHidrometrica[]
): Promise<EstacionHidrometrica[]> {
  return Promise.all(
    semilla.map(async (est) => {
      const clave = CLAVE_BACKEND_POR_ESTACION[est.id];
      if (!clave) {
        return est;
      }

      const crudo = await obtenerHistoricoReal(clave, 30);
      const serie = unaLecturaPorDia(crudo).slice(-7);

      if (serie.length === 0) {
        console.warn('Sin histórico real para la estación:', est.id, est.nombre);
        return est;
      }

      const ultima = serie[serie.length - 1];
      const anterior = serie.length >= 2 ? serie[serie.length - 2] : null;

      return {
        ...est,
        altura_actual_m: ultima.altura_m,
        altura_anterior_m: anterior ? anterior.altura_m : ultima.altura_m,
        distancia_a_alerta_m: Number((est.nivel_alerta_m - ultima.altura_m).toFixed(2)),
        timestamp_consulta: ultima.fecha,
        historico: serie as EstacionHidrometrica['historico'],
        tendencia_texto:
          serie.length >= 2
            ? textoTendencia(calcularPendienteDiaria(serie))
            : 'sin tendencia todavía: hay una sola lectura guardada',
      };
    })
  );
}
