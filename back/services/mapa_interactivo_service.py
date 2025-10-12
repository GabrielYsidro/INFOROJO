from typing import List

class Coordenada:
    """
    Clase para representar una coordenada geográfica (latitud, longitud).
    # TODO: Desarrollar la lógica de la clase Coordenada.
    """
    def __init__(self, latitud: float, longitud: float):
        self.latitud = latitud
        self.longitud = longitud
        # TODO: Añadir validaciones y otros atributos si es necesario.

class MapaInteractivo:
    """
    Representa un mapa interactivo que puede mostrar diferentes capas de información
    relacionada con el transporte público.
    """
    def __init__(self):
        """
        Inicializa el mapa interactivo.
        """
        self._capas: List[str] = [] # Atributo privado para almacenar las capas activas

    def mostrar_rutas(self) -> None:
        """
        Muestra las rutas de transporte en el mapa.
        # TODO: Implementar la lógica para visualizar las rutas.
        """
        pass

    def mostrar_corredores(self) -> None:
        """
        Muestra los corredores viales en el mapa.
        # TODO: Implementar la lógica para visualizar los corredores.
        """
        pass

    def mostrar_paraderos(self) -> None:
        """
        Muestra los paraderos de autobuses en el mapa.
        # TODO: Implementar la lógica para visualizar los paraderos.
        """
        pass

    def mostrar_alertas(self) -> None:
        """
        Muestra alertas de tráfico o servicio en el mapa.
        # TODO: Implementar la lógica para visualizar las alertas.
        """
        pass

    def centrar_en(self, coordenada: Coordenada) -> None:
        """
        Centra la vista del mapa en una coordenada específica.

        Args:
            coordenada (Coordenada): El punto geográfico para centrar el mapa.
        # TODO: Implementar la lógica para cambiar el centro del mapa.
        """
        pass