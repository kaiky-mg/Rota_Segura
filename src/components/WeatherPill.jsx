// Exemplo de como implementar a "Pílula" no canto superior direito
 function WeatherPill({ condition, temp, isCritical }) {
  
  // Se for crítico (tempestade), muda a cor para alertar
  const bgStyle = isCritical ? "bg-red-600 animate-pulse" : "bg-black/60 backdrop-blur-md";

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
      
      {/* 1. O Indicador Padrão (Sempre visível) */}
      <button className={`${bgStyle} flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-lg border border-white/10`}>
        <span className="text-xl">{condition === 'rain' ? '⛈️' : '☀️'}</span>
        <span className="font-bold">{temp}°C</span>
      </button>

      {/* 2. O Alerta Extendido (Só aparece se for crítico) */}
      {isCritical && (
        <div className="bg-red-600 text-white font-bold  py-2 rounded-xl shadow-xl text-sm max-w-4xl min-w-[360px] px-4">
          ⚠️ Alerta de Chuva: Risco de atoleiro no próximo trecho.
        </div>
      )}
      
    </div>
  );
}
export default WeatherPill;