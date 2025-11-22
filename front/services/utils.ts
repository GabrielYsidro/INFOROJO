
const handlePath = (path: string) => {
  return path.replace(/^\/+|\/+$/g, '');
}

function diasTranscurridos(fechaISO: string): string {
  const fecha = new Date(fechaISO);       // Fecha del dato
  const ahora = new Date();               // Fecha actual

  const diffMs = ahora.getTime() - fecha.getTime();  // Diferencia en ms

  const dias = diffMs / (1000 * 60 * 60 * 24);        // Convertir a días

  return 'hace '+Math.floor(dias)+' días';
}

export {
  diasTranscurridos, handlePath
};
