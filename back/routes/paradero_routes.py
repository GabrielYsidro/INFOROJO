from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from services.DiagramaClases.paradero_service import Paradero_Service
from services.DiagramaClases.eta_service import EtaService
from fastapi import HTTPException

router = APIRouter(
    prefix="/paradero",
    tags=["paradero"]
)

@router.get("")
@router.get("/")
def listar_paraderos(db: Session = Depends(get_db)):
    return Paradero_Service(db=db).get_paraderos()


@router.get("/{id_paradero}/eta")
def obtener_eta_paradero(id_paradero: int, db: Session = Depends(get_db)):
    """
    Devuelve el ETA (en minutos) del corredor que llegará primero al paradero.
    Respuesta: { paradero_id, corredor_id, eta_minutos, distancia_km }
    """
    # validar paradero
    from models.Paradero import Paradero as ParaderoModel

    paradero = db.query(ParaderoModel).filter(ParaderoModel.id_paradero == id_paradero).first()
    if not paradero:
        raise HTTPException(status_code=404, detail="Paradero no encontrado")
    if paradero.coordenada_lat is None or paradero.coordenada_lng is None:
        raise HTTPException(status_code=404, detail="Paradero sin coordenadas")

    eta_service = EtaService(db=db)
    result = eta_service.get_best_eta_for_paradero(id_paradero)
    if result is None:
        raise HTTPException(status_code=404, detail="No hay corredores con ubicación para calcular ETA")
    return result