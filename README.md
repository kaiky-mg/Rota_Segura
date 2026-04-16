# Rota Segura — Frontend (MVP)

Aplicação web voltada para motoristas que trafegam no corredor **Manaus → Porto Velho (BR-319)**. O objetivo é aumentar a segurança na estrada oferecendo navegação em tempo real, alertas colaborativos de perigos, informações meteorológicas e pontos de apoio ao longo da rota.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + Vite |
| Estilização | Tailwind CSS v4 |
| Mapas | MapLibre GL JS via `react-map-gl` |
| Roteamento | React Router DOM v7 |
| Autenticação | Microsoft SSO (MSAL Browser / MSAL React — Azure AD) |
| Tempo real | Socket.IO Client |
| HTTP | Axios |
| Ícones | React Feather |
| Deploy | Docker (multi-stage) + Nginx + Azure DevOps + Bicep IaC |

---

## Estrutura do Projeto

```
src/
├── main.jsx                  # Bootstrap: MsalProvider + App
├── App.jsx                   # Roteamento principal + templates de auth
├── authConfig.js             # Configuração MSAL (clientId, authority, scopes)
├── index.css / App.css       # Estilos globais
│
├── pages/
│   ├── Login.jsx             # Tela de login via SSO Microsoft
│   ├── EscolherTrajeto.jsx   # Seleção de direção (ida/volta)
│   └── PaginaPrincipal.jsx   # Dashboard principal com mapa, sockets e controles
│
├── components/
│   ├── MapaRotaSegura.jsx    # Mapa MapLibre: rota OSRM, marcadores, pontos de apoio
│   ├── MenuReportar.jsx      # Bottom sheet para reportar perigos na pista
│   ├── AlertaFlutuante.jsx   # Modal fullscreen de alerta recebido via socket
│   ├── WeatherPill.jsx       # Indicador de clima (com estado crítico)
│   ├── UserCount.jsx         # Contador de usuários online via socket
│   ├── ProgressBar.jsx       # Barra de progresso + botões de navegação/recentralizar
│   ├── Header.jsx            # Header com logo e botão de perfil
│   ├── ProfileMenu.jsx       # Modal de perfil com foto do Microsoft Graph + logout
│   ├── AuthenticatedLayout.jsx # Wrapper de layout para rotas autenticadas
│   ├── AuthenticatedRoute.jsx  # (Legado — não utilizado atualmente)
│   ├── RotaBR319.jsx           # (Legado — implementação Leaflet, não utilizada)
│   ├── TrajetoControl.jsx      # (Legado — não utilizado)
│   ├── TrajetoModal.jsx        # (Legado — não utilizado)
│   ├── FixedBottomMenu.jsx     # (Legado — não utilizado)
│   └── FloatingActionButton.jsx # (Legado — não utilizado)
│
├── services/
│   └── api.js                # Cliente Axios (baseURL via VITE_API_URL)
│
└── utils/
    └── calculatePointAhead.js # Utilitário de cálculo geoespacial (importado mas não usado)
```

---

## Fluxo Principal do Usuário

1. **Login** — Usuário acessa a aplicação e é redirecionado para autenticação Microsoft (SSO).
2. **Escolher Trajeto** — Seleciona a direção da viagem (apenas **ida** está funcional; volta exibe placeholder).
3. **Mapa / Dashboard** — Tela principal onde:
   - A posição do usuário é rastreada via GPS do navegador.
   - A rota até o destino é desenhada com polyline via API OSRM.
   - Outros veículos conectados aparecem no mapa em tempo real (Socket.IO).
   - Pontos de apoio são carregados do backend e exibidos como marcadores.
   - Informações de clima e contagem de usuários são atualizadas via socket.
   - O usuário pode ativar o **modo navegação** (pitch 3D + bússola).
   - O progresso da viagem é exibido em uma barra inferior com porcentagem.
4. **Reportar Perigo** — Botão flutuante abre um bottom sheet onde o usuário escolhe tipo e gravidade do perigo e envia ao backend.
5. **Receber Alerta** — Quando outro usuário reporta um perigo, um modal fullscreen aparece com os detalhes.

---

## Funcionalidades Implementadas ✅

- **Autenticação Microsoft SSO** (login/logout com Azure AD)
- **Perfil do usuário** com foto do Microsoft Graph
- **Mapa interativo MapLibre** com estilo OpenStreetMap
- **Rota dinâmica** desenhada via OSRM entre posição atual e destino
- **Geolocalização em tempo real** (watchPosition)
- **Modo navegação** com pitch 3D e orientação por bússola do dispositivo
- **Veículos de outros usuários** exibidos no mapa via Socket.IO
- **Pontos de apoio** (postos, oficinas etc.) carregados do backend e exibidos no mapa
- **Reportar perigos** (animais na pista, buracos, alagamentos, deslizamentos, etc.) com gravidade
- **Alerta flutuante fullscreen** ao receber notificação de perigo via socket
- **Indicador de clima** com modo crítico (pulsante + mensagem expandida)
- **Contagem de usuários online** na rota
- **Barra de progresso** da viagem com cálculo Haversine
- **Botão de recentralizar** no mapa
- **Deploy containerizado** com Docker multi-stage + Nginx
- **Pipeline CI/CD** Azure DevOps com segurança (GitLeaks) + IaC Bicep

---

## Funcionalidades a Implementar 🚧

- **Renderizar pontos de alertas reportados no mapa** — Exibir marcadores visuais no mapa para cada obstáculo/perigo reportado por outros usuários, permitindo ao motorista visualizar zonas de risco antes de chegar nelas.
- **Botão de reportar pane elétrica no carro** — Adicionar nova opção no menu de reporte para que o motorista possa sinalizar pane elétrica, diferenciando de outros tipos de obstáculo.
- **Habilitar rota de volta** — Atualmente apenas a direção "ida" (Manaus → Porto Velho) está funcional.
- **Remover URLs hardcoded** — `MenuReportar.jsx` e `AlertaFlutuante.jsx` possuem URLs `localhost` hardcoded; devem usar `VITE_API_URL`.
- **Limpeza de código legado** — Remover componentes não utilizados (RotaBR319, TrajetoControl, TrajetoModal, FixedBottomMenu, FloatingActionButton, AuthenticatedRoute, AppRoutes.jsx).
- **Remover log de variáveis de ambiente** — `api.js` imprime `import.meta.env` no console (risco em produção).

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_API_URL=<URL do backend>
VITE_CLIENT_ID=<Client ID do App Registration Azure AD>
VITE_AUTHORITY=https://login.microsoftonline.com/<tenant-id>
VITE_REDIRECT_URI=<URL de redirect após login>
VITE_POST_LOGOUT_REDIRECT_URI=<URL de redirect após logout>
```

---

## Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar dev server (HTTPS, porta 5173)
npm run dev
```

A aplicação estará disponível em `https://localhost:5173`.

### Build de Produção

```bash
npm run build
npm run preview
```

### Docker

```bash
docker build \
  --build-arg VITE_API_URL=<url> \
  --build-arg VITE_CLIENT_ID=<id> \
  --build-arg VITE_AUTHORITY=<authority> \
  --build-arg VITE_REDIRECT_URI=<uri> \
  --build-arg VITE_POST_LOGOUT_REDIRECT_URI=<uri> \
  -t rotasegura-front .

docker run -p 80:80 rotasegura-front
```

---

## Observações Importantes para o Próximo Dev

1. **O roteamento real da aplicação está em `src/App.jsx`**, não em `AppRoutes.jsx` (que é legado comentado).
2. **O motor de mapas ativo é MapLibre** (`MapaRotaSegura.jsx`). O Leaflet está nas dependências mas os componentes que o usam (`RotaBR319.jsx`) estão desconectados.
3. **Existem duas conexões Socket.IO separadas**: uma em `PaginaPrincipal.jsx` (principal) e outra em `AlertaFlutuante.jsx` (alertas). A do `AlertaFlutuante` está hardcoded para `localhost`.
4. **O POST de reportar perigo** em `MenuReportar.jsx` usa `fetch` com URL hardcoded `http://localhost:8080` em vez do Axios com `VITE_API_URL`.
5. **Geolocalização requer HTTPS** — o dev server já está configurado com SSL via `@vitejs/plugin-basic-ssl`.
