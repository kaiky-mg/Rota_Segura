import { useState } from 'react';

// Tipos pré-definidos para facilitar o toque, sem digitação.
const OPCOES_PERIGO = [
  { id: 'ACIDENTE', label: ' Acidente', icon: '🚗' },
  { id: 'ATOLEIRO', label: ' Atoleiro', icon: '🚜' },
  { id: 'BURACO', label: 'Buraco Grave', icon: '🕳️' },
  { id: 'PONTE_QUEBRADA', label: ' Ponte Quebrada', icon: '🌉' },
  { id: 'VEICULO_PARADO', label: ' Veículo Parado', icon: '🚛' },
  { id: 'PROBLEMA_BALSA', label: ' Problema na Balsa', icon: '⛴️' },
  { id: 'INTERDICAO', label: 'Pista Interditada', icon: '🚧' },
  { id: 'OUTROS', label: ' Outros', icon: '⚠️' }
];

// Níveis de gravidade simples
const GRAVIDADE = [
  { id: 'BAIXA', label: '⚠️ Baixa (Passável)', color: 'bg-yellow-500' },
  { id: 'ALTA', label: '🚨 Alta (Pista Bloqueada)', color: 'bg-red-600' }
];

export default function MenuReportar() {
  const [painelAberto, setPainelAberto] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [gravidadeSelecionada, setGravidadeSelecionada] = useState(GRAVIDADE[1].id); // Padrão Alta
  const [enviando, setEnviando] = useState(false);

  // ID simulado do motorista logado no app
  const motoristaTesteId = "d9c936c9-6c3f-436b-ad44-f2040ed3f997";

const handleEnviarReporte = async () => {
    if (!tipoSelecionado) return;
    setEnviando(true);

    // Criamos uma função separada só para fazer o POST, assim podemos reaproveitá-la
    const dispararParaOBackend = async (lat, lng) => {
      const payload = {
        tipo: tipoSelecionado,
        descricao: `Gravidade: ${gravidadeSelecionada}`, 
        latitude: lat,
        longitude: lng,
        motoristaId: motoristaTesteId
      };

      try {
        const response = await fetch('http://localhost:8080/api/obstaculos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setPainelAberto(false);
          setTipoSelecionado(null);
        } else {
          const erroData = await response.json();
          alert(`Erro da API: ${erroData.error}`);
        }
      } catch (error) {
        console.error("Erro de rede:", error);
        alert("Não foi possível conectar ao servidor Rota Segura.");
      } finally {
        setEnviando(false);
      }
    };

    // Tenta pegar o GPS real
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        // SUCESSO: Achou o GPS! Dispara usando a posição real
        (position) => {
          dispararParaOBackend(position.coords.latitude, position.coords.longitude);
        },
        // ERRO: Sem sinal, bloqueado ou no localhost. Dispara usando posição fixa!
        (error) => {
          console.warn("Sem sinal de GPS. Usando coordenada de fallback para testes.");
          alert("Aviso: GPS não detectado. Enviando alerta com localização aproximada (Manaus).");
          
          // Fallback: Coordenadas de teste (Saída de Manaus / Início da BR-319)
          dispararParaOBackend(-3.1390, -59.9817); 
        }, 
        { enableHighAccuracy: true, timeout: 5000 } // Reduzi o timeout para 5 segundos para não ficar carregando muito tempo
      );
    } else {
      alert("Navegador não suporta geolocalização.");
      setEnviando(false);
    }
  };

  return (
    <>
      {/* 1. Botão Redondo (FAB) - Acima da Barra de Progresso */}
      {/* Ajuste o 'bottom-24' conforme a altura real da sua barra de progresso */}
      <button 
        onClick={() => setPainelAberto(true)}
        className="fixed bottom-42 right-6 bg-red-600 text-white p-5 rounded-full shadow-2xl hover:bg-red-700 transition-all hover:scale-110 z-[9900] flex items-center justify-center border-4 border-white"
        title="Reportar Perigo Urgente"
      >
        <span className="text-4xl animate-pulse">🚨</span>
      </button>

      {/* 2. Grande Painel (Bottom Sheet) */}
      <div className={`fixed inset-0 bg-black/70 z-[9999] transition-opacity duration-300 ${painelAberto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 shadow-inner transition-transform duration-500 ease-out ${painelAberto ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ height: '90%' }} // Ocupa 90% da altura da tela
        >
          {/* Cabeçalho do Painel */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900">Reportar Perigo Urgente</h2>
            <button onClick={() => setPainelAberto(false)} className="text-gray-400 hover:text-gray-800 text-5xl font-bold p-2">✕</button>
          </div>

          {/* Área do Formulário (Rolável) */}
          <div className="overflow-y-auto h-[calc(100%-120px)] pr-2 space-y-8">
            
            {/* Passo 1: Selecionar o Tipo (Botões Grandes) */}
            <div>
              <label className="block text-2xl font-bold text-gray-800 mb-5">1. O que você viu? (Toque abaixo)</label>
              <div className="grid grid-cols-2 gap-5">
                {OPCOES_PERIGO.map(opcao => (
                  <button
                    key={opcao.id}
                    onClick={() => setTipoSelecionado(opcao.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-4 transition-all h-36 ${tipoSelecionado === opcao.id ? 'border-red-600 bg-red-50 shadow-lg' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                  >
                    <span className="text-6xl mb-3">{opcao.icon}</span>
                    <span className="text-lg font-bold text-gray-800 text-center leading-tight">{opcao.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Passo 2: Selecionar Gravidade */}
            <div>
              <label className="block text-2xl font-bold text-gray-800 mb-5">2. Gravidade do bloqueio?</label>
              <div className="grid grid-cols-2 gap-5">
                {GRAVIDADE.map(gov => (
                  <button
                    key={gov.id}
                    onClick={() => setGravidadeSelecionada(gov.id)}
                    className={`p-6 rounded-2xl border-4 text-xl font-bold transition-all ${gravidadeSelecionada === gov.id ? `border-gray-900 ${gov.color} text-white shadow-lg` : 'border-gray-200 bg-gray-50 text-gray-800 hover:border-gray-300'}`}
                  >
                    {gov.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão Final de Envio */}
            <div className="pt-6">
              <button 
                onClick={handleEnviarReporte}
                disabled={enviando || !tipoSelecionado}
                className={`w-full text-white text-3xl font-extrabold py-8 rounded-2xl shadow-xl transition-colors ${enviando || !tipoSelecionado ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 animate-pulse'}`}
              >
                {enviando ? 'Enviando Alerta...' : '💥 EMITIR ALERTA URGENTE'}
              </button>
              {!tipoSelecionado && <p className="text-center text-gray-500 mt-4 text-lg">Selecione uma opção acima para habilitar o envio.</p>}
            </div>

          </div> {/* Fim Área Rolável */}
        </div>
      </div>
    </>
  );
}