InfoRojo Project:

Front -> React Native
Back -> FastAPI
DB -> Supabase

Instrucciones para correr localmente:

Front:

0. En Android Studio, crear un Device compatible con Android 33. Prenderlo y dejarlo asi para visualizar.

1. npm install (instala la libreria de expo que permite exponer localmente).

2. npx expo start (inicia la aplicacion)

3. presionar "a" (si la ruta del SDK de Android es la default, funciona sin problema. De lo contrario, actualizar la env de sistema: ANDROID_HOME)

Back:

0. Crear una venv en la raiz de "back" con Python 3.12.3

1. source <nombre de la venv>/bin/activate (Linux y Mac)
   <nombre de la venv>\Scripts\Activate.ps1 (Windows)

1. pip install -r requirements (en la raiz del proyecto)

2.  uvicorn main:app --reload
