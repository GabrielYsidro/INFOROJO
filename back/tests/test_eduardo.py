import pytest
from unittest.mock import MagicMock
from datetime import datetime, timezone

from fastapi import HTTPException, status

from services.comentario_paradero_service import ComentarioParaderoService
from models.ComentarioUsuarioParadero import ComentarioUsuarioParadero


# ==============================
# FIXTURES BÁSICAS
# ==============================

@pytest.fixture
def mock_db():
    """Mock de la sesión de la BD."""
    return MagicMock()


@pytest.fixture
def service(mock_db):
    """Instancia del servicio con DB mockeada."""
    return ComentarioParaderoService(mock_db)


# ==========================================================
#                 EDITAR COMENTARIO
# ==========================================================

def test_editar_comentario_paradero_token_nulo(service, mock_db):
    """
    Debe lanzar 401 cuando el token es nulo o vacío.
    Aquí NO mockeamos leerToken para que use la lógica real:
    - if not token: HTTPException 401 "Token requerido"
    """
    with pytest.raises(HTTPException) as exc:
        service.editar_comentario(token=None, id_comentario=1, nuevo_texto="nuevo texto")

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    # opcional: según tu mensaje de error real
    assert "Token requerido" in exc.value.detail


def test_editar_comentario_paradero_token_invalido(service, mock_db):
    """
    Token presente pero inválido: leerToken debe lanzar HTTPException 401
    debido a verify_access_token.
    """
    # Mockeamos leerToken directamente para simular token inválido
    service.leerToken = MagicMock(side_effect=HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido"
    ))

    with pytest.raises(HTTPException) as exc:
        service.editar_comentario(token="Bearer token_invalido", id_comentario=1, nuevo_texto="nuevo texto")

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Token inválido" in exc.value.detail


def test_editar_comentario_paradero_id_invalido(service, mock_db):
    """
    El payload del token no tiene 'id' o es None -> 401 'Token inválido: sin id de usuario'
    """
    # leerToken devuelve un payload sin id de usuario
    service.leerToken = MagicMock(return_value={"otro_campo": 123})

    with pytest.raises(HTTPException) as exc:
        service.editar_comentario(token="Bearer algo", id_comentario=1, nuevo_texto="nuevo texto")

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "sin id de usuario" in exc.value.detail

    # Aseguramos que nunca se haya llamado a la BD
    mock_db.query.assert_not_called()

def test_editar_comentario_paradero_exitoso(service, mock_db):
    """
    Caso feliz:
    - Token válido
    - El payload trae un id de usuario
    - El comentario existe
    - El comentario pertenece al usuario
    - El texto nuevo es válido
    """
    user_id = 10

    # Simulamos el comentario existente en BD
    comentario = ComentarioUsuarioParadero(
        id_comentario=1,
        id_usuario=user_id,
        id_paradero=123,
        comentario="texto viejo",
        created_at=datetime.now(timezone.utc),
    )

    # Mock del token decodificado
    service.leerToken = MagicMock(return_value={"id": user_id})

    # Mock de la query a la BD
    mock_db.query().filter().first.return_value = comentario

    # Ejecutamos
    resultado = service.editar_comentario(
        token="Bearer token_valido",
        id_comentario=1,
        nuevo_texto="  nuevo texto actualizado  ",  # con espacios para probar el strip()
    )

    # Aserciones
    assert resultado is comentario
    assert resultado.comentario == "nuevo texto actualizado"  # debe venir sin espacios
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(comentario)

def test_editar_comentario_paradero_texto_vacio(service, mock_db):
    """
    Caso: nuevo_texto = "   " (solo espacios) → 400 BAD REQUEST.
    """
    user_id = 10

    comentario = ComentarioUsuarioParadero(
        id_comentario=1,
        id_usuario=user_id,
        id_paradero=700,
        comentario="texto original",
        created_at=datetime.now(timezone.utc),
    )

    service.leerToken = MagicMock(return_value={"id": user_id})
    mock_db.query().filter().first.return_value = comentario

    with pytest.raises(HTTPException) as exc:
        service.editar_comentario(
            token="Bearer valido",
            id_comentario=1,
            nuevo_texto="   "
        )

    assert exc.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "vacío o inválido" in exc.value.detail

# ==========================================================
#                 ELIMINAR COMENTARIO
# ==========================================================

def test_eliminar_comentario_paradero_token_nulo(service, mock_db):
    """
    Debe lanzar 401 cuando el token es nulo o vacío al eliminar comentario.
    """
    with pytest.raises(HTTPException) as exc:
        service.eliminar_comentario(token="", id_comentario=1)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Token requerido" in exc.value.detail


def test_eliminar_comentario_paradero_no_autorizado(service, mock_db):
    """
    El comentario existe pero pertenece a otro usuario -> 403 FORBIDDEN
    """
    # Token válido con id de usuario 10
    service.leerToken = MagicMock(return_value={"id": 10})

    comentario = ComentarioUsuarioParadero(
        id_comentario=1,
        id_usuario=99,  # otro usuario
        id_paradero=123,
        comentario="comentario de otro usuario",
        created_at=datetime.now(timezone.utc),
    )

    mock_db.query().filter().first.return_value = comentario

    with pytest.raises(HTTPException) as exc:
        service.eliminar_comentario(token="Bearer valido", id_comentario=1)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert "No autorizado" in exc.value.detail


def test_eliminar_comentario_paradero_no_encontrado(service, mock_db):
    """
    Comentario no existe -> 404 NOT FOUND
    """
    service.leerToken = MagicMock(return_value={"id": 1})
    mock_db.query().filter().first.return_value = None

    with pytest.raises(HTTPException) as exc:
        service.eliminar_comentario(token="Bearer valido", id_comentario=999)

    assert exc.value.status_code == status.HTTP_404_NOT_FOUND
    assert "Comentario no encontrado" in exc.value.detail


def test_eliminar_comentario_paradero_autorizado(service, mock_db):
    """
    Caso feliz: token válido, usuario dueño del comentario, se elimina correctamente.
    """
    user_id = 20
    service.leerToken = MagicMock(return_value={"id": user_id})

    comentario = ComentarioUsuarioParadero(
        id_comentario=1,
        id_usuario=user_id,
        id_paradero=456,
        comentario="comentario a borrar",
        created_at=datetime.now(timezone.utc),
    )

    mock_db.query().filter().first.return_value = comentario

    result = service.eliminar_comentario(token="Bearer valido", id_comentario=1)

    assert result["detail"] == "Comentario eliminado exitosamente"
    mock_db.delete.assert_called_once_with(comentario)
    mock_db.commit.assert_called_once()
