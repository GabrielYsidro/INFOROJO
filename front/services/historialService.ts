import { API_URL } from './userService';

export interface HistorialViaje {
  id: number;
  paradero_sube: string | null;
  paradero_baja: string | null;
  fecha: string;
  fecha_subida: string | null;
  fecha_bajada: string | null;
  tiempo_recorrido_minutos: number | null;
  imagen?: string;
}

class HistorialService {
  private historialCache: { [key: number]: HistorialViaje[] } = {};

  async getUserHistorial(userId: number): Promise<HistorialViaje[]> {
    try {
      // Verificar cache primero
      if (this.historialCache[userId]) {
        return this.historialCache[userId];
      }

      const response = await fetch(`${API_URL}/usuario/${userId}/historial`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: HistorialViaje[] = await response.json();
      
      // Guardar en cache
      this.historialCache[userId] = data;
      
      return data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw new Error('No se pudo cargar el historial de viajes');
    }
  }

  // Método para limpiar cache si es necesario
  clearCache(userId?: number): void {
    if (userId) {
      delete this.historialCache[userId];
    } else {
      this.historialCache = {};
    }
  }

  // Formatear tiempo de recorrido para mostrar
  formatearTiempoRecorrido(minutos: number | null): string {
    if (minutos === null || minutos === undefined) {
      return 'No disponible';
    }

    if (minutos < 60) {
      return `${minutos} min`;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (minutosRestantes === 0) {
      return `${horas}h`;
    }
    
    return `${horas}h ${minutosRestantes}min`;
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return d.toLocaleString('es-PE', opciones);
  }

  // Actualizar tiempos de subida y bajada de un viaje
  async actualizarTiemposViaje(
    userId: number, 
    historialId: number, 
    fechaSubida?: string, 
    fechaBajada?: string
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (fechaSubida) params.append('fecha_subida', fechaSubida);
      if (fechaBajada) params.append('fecha_bajada', fechaBajada);

      const response = await fetch(
        `${API_URL}/usuario/${userId}/historial/${historialId}/tiempos?${params.toString()}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Limpiar cache para que se actualicen los datos
      this.clearCache(userId);
      
      return data;
    } catch (error) {
      console.error('Error al actualizar tiempos del viaje:', error);
      throw new Error('No se pudieron actualizar los tiempos del viaje');
    }
  }




}

export default new HistorialService();