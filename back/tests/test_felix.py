# Este archivo contiene el análisis de pruebas de caja blanca y caja negra
# para la función crear_reporte_desvio del backend, como fue solicitado.

# ==============================================================================
# ANÁLISIS DE PRUEBAS PARA LA FUNCIÓN: crear_reporte_desvio
# UBICACIÓN: back/services/DiagramaClases/reporte_service.py
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. PRUEBAS DE CAJA BLANCA (WHITE-BOX TESTING)
# ------------------------------------------------------------------------------
# La función `crear_reporte_desvio` en `reporte_service.py` es un buen candidato
# para este análisis debido a sus múltiples flujos condicionales.

# Fragmento de código analizado:
#
# def crear_reporte_desvio(self, payload: Dict) -> Dict:
#     # 1. Crear objeto de reporte
#     reporte_obj = self.reporte_factory.crear("desvio", payload)
#     record = { ... }
#
#     # 2. Validar paradero (Decisión 1)
#     if not self.paradero_service.get_paradero_by_id(record["id_paradero_inicial"]):
#         raise ValueError(...)
#
#     # 3. Idempotencia (Decisión 2 y 3)
#     id_cliente = str(record.get("id_reporte"))
#     if id_cliente:
#         existing = self.find_report_by_id_reporte(id_cliente)
#         if existing:
#             return existing 
#
#     # 4. Guardar en BD
#     saved = self.save_report(record)
#     
#     # 5. Enviar notificación (Decisión 4 y 5)
#     try:
#         ...
#         tokens = [reg.fcm_token for reg in reguladores if reg.fcm_token]
#         if tokens:
#             firebase_admin.send_multicast(...)
#         else:
#             print("No se encontraron reguladores...")
#     except Exception as e:
#         print(f"Error al enviar notificación...")
#     finally:
#         db.close()
#
#     return saved

# === A. Grafo de Flujo de Control ===
#
# Nodos (representan bloques de código secuencial):
#   - N1 (Inicio): Entrada a la función.
#   - N2: Creación de `reporte_obj` y `record`.
#   - N3 (Decisión): `if not self.paradero_service.get_paradero_by_id(...)`
#   - N4: `raise ValueError(...)` y fin anormal.
#   - N5: `if id_cliente:` (Decisión)
#   - N6: `if existing:` (Decisión)
#   - N7: `return existing` (retorno anticipado).
#   - N8: `saved = self.save_report(record)` (Bloque común).
#   - N9: `try` para notificación, obtención de tokens.
#   - N10 (Decisión): `if tokens:`
#   - N11: `firebase_admin.send_multicast(...)`
#   - N12: `print("No se encontraron...")`
#   - N13 (Manejo de Error): `except Exception as e`
#   - N14: `print(f"Error al enviar...")`
#   - N15: `finally` block, `db.close()`
#   - N16: `return saved`
#   - N17 (Fin): Salida normal de la función.
#
# Grafo Textual:
#   1 -> 2 -> 3
#   3 -> 4 (Si paradero es inválido)
#   3 -> 5 (Si paradero es válido)
#   5 -> 6 (Si id_cliente existe)
#   5 -> 8 (Si id_cliente no existe)
#   6 -> 7 (Si `existing` es True)
#   6 -> 8 (Si `existing` es False)
#   7 -> 17 (Fin)
#   8 -> 9
#   9 -> 10 
#   10 -> 11 (Si hay tokens) -> 15
#   10 -> 12 (Si no hay tokens) -> 15
#   (Cualquier punto dentro del try: 9, 10, 11, 12) -> 13 (Si ocurre una excepción)
#   13 -> 14 -> 15
#   15 -> 16 -> 17 (Fin)

# === B. Complejidad Ciclomática (V(G)) ===
#
# Se calcula como V(G) = P + 1, donde P es el número de nodos de decisión.
# Los nodos de decisión (predicados) son:
#   1. `if not self.paradero_service.get_paradero_by_id(...)`
#   2. `if id_cliente:`
#   3. `if existing:`
#   4. `if reg.fcm_token` (implícito en la list comprehension, se puede contar)
#   5. `if tokens:`
#   6. El bloque `try-except` actúa como una decisión (flujo normal vs. flujo de excepción).
#
# P = 6
# V(G) = 6 + 1 = 7
#
# La complejidad ciclomática es 7, lo que indica que se necesitan al menos 7 casos de prueba para cubrir todos los caminos linealmente independientes.

# === C. Caminos Linealmente Independientes ===
#
#   1. Camino Feliz (Todo OK): 
#      - Payload completo, paradero válido, id_reporte nuevo, hay reguladores con tokens.
#      - Flujo: 1->2->3(F)->5(T)->6(F)->8->9->10(T)->11->15->16->17
#
#   2. Camino con Paradero Inválido:
#      - Payload con `paradero_afectado_id` que no existe en la BD.
#      - Flujo: 1->2->3(T)->4 (Termina con ValueError)
#
#   3. Camino con Reporte Duplicado (Idempotencia):
#      - Payload con un `id_reporte` que ya ha sido procesado.
#      - Flujo: 1->2->3(F)->5(T)->6(T)->7->17
#
#   4. Camino sin id_reporte en el Payload:
#      - Payload no incluye la clave `id_reporte`.
#      - Flujo: 1->2->3(F)->5(F)->8->... (sigue como el camino 1)
#
#   5. Camino sin Reguladores con Tokens:
#      - Todo válido, pero ningún regulador en la BD tiene un `fcm_token`.
#      - Flujo: 1->2->3(F)->5(T)->6(F)->8->9->10(F)->12->15->16->17
#
#   6. Camino con Falla en el Envío de Notificación:
#      - Todo válido, pero el servicio de Firebase (send_multicast) falla y lanza una excepción.
#      - Flujo: 1->2->3(F)->5(T)->6(F)->8->9->10(T)->11(falla)->13->14->15->16->17
#
#   7. Camino Feliz (sin list comprehension):
#      - Similar al 1, pero se puede considerar el caso donde la lista de reguladores está vacía, haciendo que el `if tokens` sea falso directamente.
#      - Flujo: 1->2->3(F)->5(T)->6(F)->8->9->10(F)->12->15->16->17

# ------------------------------------------------------------------------------
# 2. PRUEBAS DE CAJA NEGRA (BLACK-BOX TESTING)
# ------------------------------------------------------------------------------
# Se analiza el endpoint `POST /reports/desvio` como una caja negra, basándose
# en su especificación (contrato de la API) sin conocer la implementación interna.
#
# === A. Definición de Entradas y Particiones de Equivalencia ===
#
# Entradas:
#   - `payload` (Cuerpo JSON de la solicitud)
#   - `Headers` de autenticación (`Authorization` o `X-User-Id`)
#
# | Parámetro del Payload | Clase de Equivalencia Válida (CEV)          | Clases de Equivalencia Inválidas (CEI)                              |
# |-----------------------|---------------------------------------------|---------------------------------------------------------------------|
# | `conductor_id` (opc.) | Entero positivo existente en la BD.         | `null`, `0`, `-1`, `string`, `booleano`, ID no existente.           |
# | `ruta_id`             | Entero positivo existente en la BD.         | `null`, ausente, `0`, `-1`, `string`, ID no existente.              |
# | `paradero_afectado_id`| Entero positivo existente en la BD.         | `null`, ausente, `0`, `-1`, `string`, ID no existente.              |
# | `tipo`                | Entero `3` (para desvío).                   | `null`, ausente, otro entero (`1`, `2`), `string`.                  |
# | `paradero_alterna_id` | Entero positivo existente, `null`, ausente. | `0`, `-1`, `string`, ID no existente.                               |
# | `descripcion`         | `string` (vacío o con texto), `null`, ausente.| `entero`, `booleano`, `objeto`.                                     |
# | `id_reporte` (opc.)   | `string` único, `null`, ausente.            | `string` ya utilizado, `entero`, `booleano`.                        |
# | **Autenticación**     | Header `Authorization` o `X-User-Id` válido.| Header ausente Y `conductor_id` ausente en payload, header inválido.  |
#
# === B. Análisis de Valores Límite ===
#
#   - `conductor_id`, `ruta_id`, `paradero_...`: Probar con `1` (límite inferior), un valor medio y un valor muy grande.
#   - `descripcion`: Probar con `""` (vacío), `"a"` (un caracter), un texto largo que se acerque al límite del campo `Text` de la BD.
#
# === C. Combinación de Casos de Prueba ===
#
#   - **TC-BN-01 (Happy Path):**
#     - **Descripción:** Petición con todos los campos requeridos y opcionales válidos. Autenticación por header.
#     - **Entradas:** Header: `Authorization: Bearer <token_valido>`, Payload: `{ "ruta_id": 1, "paradero_afectado_id": 10, "tipo": 3, "paradero_alterna_id": 12, "descripcion": "Desvío por obras", "id_reporte": "unique-uuid-1" }`
#     - **Resultado Esperado:** `200 OK`, el cuerpo de la respuesta contiene el reporte creado.
#
#   - **TC-BN-02 (Campos Mínimos):**
#     - **Descripción:** Petición solo con los campos requeridos. Autenticación por body.
#     - **Entradas:** Payload: `{ "conductor_id": 5, "ruta_id": 2, "paradero_afectado_id": 15, "tipo": 3 }`
#     - **Resultado Esperado:** `200 OK`, el cuerpo de la respuesta contiene el reporte creado.
#
#   - **TC-BN-03 (Falta Autenticación):**
#     - **Descripción:** No se proporciona `conductor_id` ni header de autenticación.
#     - **Entradas:** Payload: `{ "ruta_id": 2, "paradero_afectado_id": 15, "tipo": 3 }`
#     - **Resultado Esperado:** `401 Unauthorized`.
#
#   - **TC-BN-04 (Falta Campo Requerido):**
#     - **Descripción:** `paradero_afectado_id` no se incluye en el payload.
#     - **Entradas:** Header: `Authorization: Bearer <token_valido>`, Payload: `{ "ruta_id": 1, "tipo": 3 }`
#     - **Resultado Esperado:** `422 Unprocessable Entity` o `400 Bad Request` con mensaje de error sobre el campo faltante.
#
#   - **TC-BN-05 (Tipo de Dato Incorrecto):**
#     - **Descripción:** Se envía un `string` en lugar de un entero para `ruta_id`.
#     - **Entradas:** Header: `Authorization: Bearer <token_valido>`, Payload: `{ "ruta_id": "uno", "paradero_afectado_id": 10, "tipo": 3 }`
#     - **Resultado Esperado:** `422 Unprocessable Entity` o `400 Bad Request`.
#
#   - **TC-BN-06 (Clave Foránea Inválida):**
#     - **Descripción:** `ruta_id` es un entero, pero no corresponde a ninguna ruta existente en la BD.
#     - **Entradas:** Header: `Authorization: Bearer <token_valido>`, Payload: `{ "ruta_id": 9999, "paradero_afectado_id": 10, "tipo": 3 }`
#     - **Resultado Esperado:** `400 Bad Request` con un mensaje indicando que la ruta no existe (dependiendo de la validación en el servicio).
#
#   - **TC-BN-07 (Idempotencia - Reporte Duplicado):**
#     - **Descripción:** Se envía la misma petición (con el mismo `id_reporte`) dos veces.
#     - **Entradas:** La misma petición de **TC-BN-01** enviada por segunda vez.
#     - **Resultado Esperado:** `200 OK` o `409 Conflict`. El servicio debería retornar el reporte creado previamente sin crear uno nuevo.
#
#   - **TC-BN-08 (Límite - Descripción Vacía):**
#     - **Descripción:** Se envía una descripción vacía, lo cual es válido.
#     - **Entradas:** Header: `Authorization: Bearer <token_valido>`, Payload: `{ "ruta_id": 1, "paradero_afectado_id": 10, "tipo": 3, "descripcion": "" }`
#     - **Resultado Esperado:** `200 OK`.
