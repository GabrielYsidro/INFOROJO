from typing import List, Dict, Optional
from sqlalchemy.orm import Session

class Coordenada:
    def __init__(self, latitud: float, longitud: float):
        self.latitud = self._validar_latitud(latitud)
        self.longitud = self._validar_longitud(longitud)
    
    @staticmethod
    def _validar_latitud(latitud: float) -> float:
        """Valida que la latitud esté entre -90 y 90"""
        if not isinstance(latitud, (int, float)):
            raise ValueError(f"Latitud debe ser numérica, recibió: {type(latitud)}")
        if latitud < -90 or latitud > 90:
            raise ValueError(f"Latitud debe estar entre -90 y 90, recibió: {latitud}")
        return float(latitud)
    
    @staticmethod
    def _validar_longitud(longitud: float) -> float:
        """Valida que la longitud esté entre -180 y 180"""
        if not isinstance(longitud, (int, float)):
            raise ValueError(f"Longitud debe ser numérica, recibió: {type(longitud)}")
        if longitud < -180 or longitud > 180:
            raise ValueError(f"Longitud debe estar entre -180 y 180, recibió: {longitud}")
        return float(longitud)
    
    def __repr__(self) -> str:
        return f"Coordenada(lat={self.latitud}, lng={self.longitud})"
    
    def to_dict(self) -> Dict:
        """Convierte la coordenada a diccionario"""
        return {
            "latitud": self.latitud,
            "longitud": self.longitud
        }


class MapaInteractivo:
    
    CAPA_RUTAS = "rutas"
    CAPA_CORREDORES = "corredores"
    CAPA_PARADEROS = "paraderos"
    CAPA_ALERTAS = "alertas"
    
    def __init__(self, db: Session):
        self.db = db
        self._capas_activas: Dict[str, bool] = {
            self.CAPA_RUTAS: True,
            self.CAPA_CORREDORES: True,
            self.CAPA_PARADEROS: True,
            self.CAPA_ALERTAS: True
        }
        self._centro_mapa: Optional[Coordenada] = None
        
        from .ruta_service import RutaService
        from .corredor_service import CorredorService
        from .paradero_service import Paradero_Service
        
        self.ruta_service = RutaService(db)
        self.corredor_service = CorredorService(db)
        self.paradero_service = Paradero_Service(db=db)
    
    def activar_capa(self, nombre_capa: str) -> None:
        if nombre_capa in self._capas_activas:
            self._capas_activas[nombre_capa] = True
            print(f"✅ Capa '{nombre_capa}' activada")
        else:
            print(f"⚠️ Capa '{nombre_capa}' no existe")
    
    def desactivar_capa(self, nombre_capa: str) -> None:
        if nombre_capa in self._capas_activas:
            self._capas_activas[nombre_capa] = False
            print(f"✅ Capa '{nombre_capa}' desactivada")
        else:
            print(f"⚠️ Capa '{nombre_capa}' no existe")
    
    def obtener_capas_activas(self) -> Dict[str, bool]:
        return self._capas_activas.copy()

    def mostrar_rutas(self) -> List[Dict]:
        if not self._capas_activas[self.CAPA_RUTAS]:
            print("⚠️ Capa de rutas desactivada")
            return []
        
        try:
            rutas = self.ruta_service.get_rutas()
            resultado = []
            
            for ruta in rutas:
                marker = {
                    "id": ruta.get("id_ruta"),
                    "nombre": ruta.get("nombre", "Ruta sin nombre"),
                    "tipo": "ruta",
                    "coordenada": None  # Las rutas no tienen una coordenada única
                }
                resultado.append(marker)
            
            print(f"✅ {len(resultado)} rutas cargadas en el mapa")
            return resultado
        
        except Exception as e:
            print(f"❌ Error al mostrar rutas: {str(e)}")
            return []

    def mostrar_corredores(self) -> List[Dict]:
        if not self._capas_activas[self.CAPA_CORREDORES]:
            print("⚠️ Capa de corredores desactivada")
            return []
        
        try:
            corredores = self.corredor_service.get_corredores()
            resultado = []
            
            for corredor in corredores:
                # Validar que las coordenadas no sean None
                lat = corredor.get("ubicacion_lat")
                lng = corredor.get("ubicacion_lng")
                
                if lat is None or lng is None:
                    print(f"⚠️ Corredor {corredor.get('id_corredor')} sin ubicación válida, omitido")
                    continue
                
                try:
                    marker = {
                        "id": corredor.get("id_corredor"),
                        "nombre": f"Corredor {corredor.get('id_corredor')}",
                        "latitud": lat,
                        "longitud": lng,
                        "estado": corredor.get("estado"),
                        "capacidad_max": corredor.get("capacidad_max"),
                        "tipo": "corredor",
                        "coordenada": Coordenada(lat, lng).to_dict()
                    }
                    resultado.append(marker)
                except ValueError as coord_error:
                    print(f"⚠️ Error en coordenadas del corredor {corredor.get('id_corredor')}: {str(coord_error)}")
                    continue
            
            print(f"✅ {len(resultado)} corredores cargados en el mapa")
            return resultado
        
        except Exception as e:
            print(f"❌ Error al mostrar corredores: {str(e)}")
            return []

    def mostrar_paraderos(self) -> List[Dict]:
        if not self._capas_activas[self.CAPA_PARADEROS]:
            print("⚠️ Capa de paraderos desactivada")
            return []
        
        try:
            paraderos = self.paradero_service.get_paraderos()
            resultado = []
            
            for paradero in paraderos:
                # Validar que las coordenadas no sean None
                lat = paradero.get("coordenada_lat")
                lng = paradero.get("coordenada_lng")
                
                if lat is None or lng is None:
                    print(f"⚠️ Paradero '{paradero.get('nombre')}' sin coordenadas válidas, omitido")
                    continue
                
                try:
                    marker = {
                        "id": paradero.get("id_paradero"),
                        "nombre": paradero.get("nombre", "Paradero sin nombre"),
                        "latitud": lat,
                        "longitud": lng,
                        "colapso_actual": paradero.get("colapso_actual"),
                        "imagen_url": paradero.get("imagen_url"),
                        "tipo": "paradero",
                        "coordenada": Coordenada(lat, lng).to_dict()
                    }
                    resultado.append(marker)
                except ValueError as coord_error:
                    print(f"⚠️ Error en coordenadas de '{paradero.get('nombre')}': {str(coord_error)}")
                    continue
            
            print(f"✅ {len(resultado)} paraderos cargados en el mapa")
            return resultado
        
        except Exception as e:
            print(f"❌ Error al mostrar paraderos: {str(e)}")
            return []

    def mostrar_alertas(self) -> List[Dict]:
        """
        Muestra alertas de tráfico o servicio en el mapa.
        
        Returns:
            List[Dict]: Lista de alertas con su ubicación.
                Formato: [{"id": int, "tipo": str, "descripcion": str, "coordenada": Dict}, ...]
        """
        if not self._capas_activas[self.CAPA_ALERTAS]:
            print("⚠️ Capa de alertas desactivada")
            return []
        
        # Por ahora retorna alertas simuladas (estructura)
        # En el futuro se conectaría a un servicio de alertas
        alertas_simuladas = [
            {
                "id": 1,
                "tipo": "congestión",
                "descripcion": "Congestión vehicular detectada",
                "latitud": -12.0460,
                "longitud": -77.0428,
                "severidad": "alta",
                "coordenada": Coordenada(-12.0460, -77.0428).to_dict()
            }
        ]
        
        print(f"✅ {len(alertas_simuladas)} alertas cargadas en el mapa")
        return alertas_simuladas

    def centrar_en(self, coordenada: Coordenada) -> Dict:
        try:
            if not isinstance(coordenada, Coordenada):
                raise TypeError(f"Se esperaba Coordenada, recibió: {type(coordenada)}")
            
            self._centro_mapa = coordenada
            print(f"✅ Mapa centrado en {coordenada}")
            
            return {
                "status": "success",
                "centro": coordenada.to_dict(),
                "mensaje": f"Mapa centrado en latitud {coordenada.latitud}, longitud {coordenada.longitud}"
            }
        
        except Exception as e:
            print(f"❌ Error al centrar mapa: {str(e)}")
            return {
                "status": "error",
                "mensaje": str(e)
            }
    
    def obtener_centro_actual(self) -> Optional[Dict]:
        """Retorna el centro actual del mapa"""
        if self._centro_mapa:
            return self._centro_mapa.to_dict()
        return None
    
    def obtener_todos_los_markers(self) -> Dict[str, List[Dict]]:
        """
        Obtiene todos los markers del mapa agrupados por tipo.
        
        Returns:
            Dict: Diccionario con listas de markers por tipo.
        """
        return {
            "rutas": self.mostrar_rutas(),
            "corredores": self.mostrar_corredores(),
            "paraderos": self.mostrar_paraderos(),
            "alertas": self.mostrar_alertas()
        }
