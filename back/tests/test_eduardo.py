import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from services.comentario_paradero_service import ComentarioParaderoService
from main import app

client = TestClient(app)

token_valido = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZXBpdG9AZ21haWwuY29tIiwiaWQiOjEsInJvbGUiOiJjbGllbnRlIiwiZXhwIjoxNzY0MDM4MzgwfQ.I6ckQEnkFSSHoplsSIiBaInHbCPv_z0VgRVmoPJB0NQ"
token_invalido = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXJpYUBhdHUuY29tLnBlIiwiaWQiOjMsInJvbGUiOiJyZWd1bGFkb3IiLCJleHAiOjE3NjQwMzg3OTl9.dMvtYHrJHaSE0ukI4E6Ou4s4ba4uAIlO8JXz0PwgzvY"
id_comentario = 5


def test_editar_comentario_paradero_token_nulo():
    service = ComentarioParaderoService(db=None)

    with pytest.raises(HTTPException) as exc:
        service.editar_comentario(None, id_comentario, "Nuevo comentario")

    assert exc.value.status_code == 401
    #assert "Token inválido: sin id de usuario" in exc.value.detail

def test_editar_comentario_paradero_token_invalido():
    service = ComentarioParaderoService(db=None)

    with pytest.raises(HTTPException) as exc:
        service.editar_comentario(token_invalido, id_comentario, "Nuevo comentario")

    assert exc.value.status_code == 403
    #assert "Token inválido: sin id de usuario" in exc.value.detail

def test_editar_comentario_paradero_id_invalido():
    service = ComentarioParaderoService(db=None)

    with pytest.raises(HTTPException) as exc:
        service.editar_comentario(token_valido, 100, "Nuevo comentario")

    assert exc.value.status_code == 401
    #assert "Token inválido: sin id de usuario" in exc.value.detail


def test_eliminar_comentario_paradero_token_nulo():
    service = ComentarioParaderoService(db=None)

    with pytest.raises(HTTPException) as exc:
        service.eliminar_comentario(None, id_comentario)

    assert exc.value.status_code == 401
    #assert "Token inválido: sin id de usuario" in exc.value.detail


def test_eliminar_comentario_paradero_no_autorizado():
    service = ComentarioParaderoService(db=None)

    # Mock correcto
    service.leerToken = lambda t: {"id_usuario": 2}  # usuario falso NO es el autor

    with pytest.raises(HTTPException) as exc:
        service.eliminar_comentario("token_fake", id_comentario)

    assert exc.value.status_code == 403
    #assert "No autorizado para eliminar este comentario" in exc.value.detail


def test_eliminar_comentario_paradero_no_encontrado():
    service = ComentarioParaderoService(db=None)
    id_usuario_autor = 1

    # Mock del token con usuario válido
    service.leerToken = lambda t: {"id_usuario": id_usuario_autor}

    # Mock del DB para que .first() devuelva None
    class FakeQuery:
        def filter(self, *args, **kwargs):
            class FakeFilter:
                def first(self):
                    return None
            return FakeFilter()

    class FakeDB:
        def query(self, x):
            return FakeQuery()

    service.db = FakeDB()

    with pytest.raises(HTTPException) as exc:
        service.eliminar_comentario(token_valido, 100)

    assert exc.value.status_code == 404
    #assert "Comentario no encontrado" in exc.value.detail


def test_eliminar_comentario_paradero_autorizado():
    service = ComentarioParaderoService(db=None)
    id_usuario_autor = 1

    # Mock leerToken → correcto
    service.leerToken = lambda t: {"id_usuario": id_usuario_autor}

    # Mock que simula un comentario válido
    class FakeComentario:
        id_usuario = 1

    class FakeFilter:
        def first(self):
            return FakeComentario()

    class FakeQuery:
        def filter(self, *args, **kwargs):
            return FakeFilter()

    class FakeDB:
        def query(self, x):
            return FakeQuery()

        def delete(self, obj):
            pass

        def commit(self):
            pass

    service.db = FakeDB()
    try:
        service.eliminar_comentario(token_valido, id_comentario)
    except HTTPException:
        pytest.fail("El método lanzó una excepción inesperada")