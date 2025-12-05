function WeatherPill({ condition, temp, isCritical, mensagem }) {
  // Log para depuração
  console.log('Props recebidas pelo WeatherPill:', { condition, temp, isCritical, mensagem });

  // Define o estilo de fundo com base na condição crítica
  const bgStyle = isCritical ? 'bg-red-600 animate-pulse' : 'bg-black/60 backdrop-blur-md';

  // Define o ícone com base na condição do clima
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'rain':
      case 'storm':
        return '⛈️';
      case 'fog':
        return '🌫️';
      case 'cloud':
        return '☁️';
      default:
        return '☀️';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
      {/* 1. O Indicador Padrão (Sempre visível) */}
      <button
        className={`${bgStyle} flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-lg border border-white/10`}
      >
        <span className="text-xl">{getWeatherIcon(condition)}</span>
        <span className="font-bold">{temp}°C</span>
      </button>

      {/* 2. O Alerta Extendido (Só aparece se for crítico) */}
      {isCritical && mensagem && (
        <div className="bg-red-600 text-white font-bold py-2 rounded-xl shadow-xl text-sm max-w-4xl min-w-[360px] px-4">
          ⚠️ {mensagem}
        </div>
      )}
    </div>
  );
}

export default WeatherPill;