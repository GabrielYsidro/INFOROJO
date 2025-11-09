from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from services.DiagramaClases.paradero_service import Paradero_Service

router = APIRouter(
    prefix="/paradero",
    tags=["paradero"]
)

@router.get("/")
def listar_paraderos(db: Session = Depends(get_db)):
    return Paradero_Service(db=db).get_paraderos()