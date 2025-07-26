# 🤖 Bot Jonalandia - Documentação Completa

[![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)](https://github.com/jonathasfrontend/jonalandia)
[![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-14.14.1-7289da.svg)](https://discord.js.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-8.8.0-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/license-Custom-red.svg)](./LICENSE)

## 📋 Sumário

- [🚀 Introdução](#-introdução)
- [⚡ Visão Geral](#-visão-geral)
- [📦 Instalação e Configuração](#-instalação-e-configuração)
- [🏗️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [🎯 Comandos Disponíveis](#-comandos-disponíveis)
- [🔧 Funcionalidades Automáticas](#-funcionalidades-automáticas)
- [🛡️ Sistema de Segurança](#️-sistema-de-segurança)
- [📊 Sistema de Logs Avançado](#-sistema-de-logs-avançado)
- [🔔 Sistema de Notificações](#-sistema-de-notificações)
- [⚙️ Configuração Avançada](#️-configuração-avançada)
- [🐛 Resolução de Problemas](#-resolução-de-problemas)
- [🤝 Contribuição](#-contribuição)

---

## 🚀 Introdução

O **Bot Jonalandia** é uma solução completa e avançada para servidores Discord, desenvolvida com foco na automação de tarefas de moderação, engajamento da comunidade e experiência personalizada. Criado por **Jonathas Oliveira**, o bot combina mais de 40 comandos especializados, sistema de logs avançado e funcionalidades de segurança.

### 🎯 Principais Características

- **Sistema de Moderação Completo** - Ferramentas avançadas para administração do servidor
- **Segurança Multicamadas** - Anti-flood, detecção de links maliciosos e palavras inadequadas
- **Sistema de Logs Profissional** - Monitoramento detalhado de todas as atividades
- **Notificações Inteligentes** - Monitoramento de YouTube, Twitch e jogos gratuitos
- **Interface Moderna** - Embeds personalizados e botões interativos

---

## ⚡ Visão Geral

### 📊 Especificações Técnicas

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| **Runtime** | Node.js | 16+ |
| **Framework Discord** | Discord.js | 14.14.1 |
| **Banco de Dados** | MongoDB | 8.8.0 |
| **Sistema de Logs** | Winston | 3.17.0 |
| **Agendador** | Node-Cron | 3.0.3 |

### 🏆 Recursos Principais

- ✅ **40+ Comandos Especializados** - Cobrindo moderação, diversão e utilidades
- ✅ **Sistema de Logs Avançado** - 6 níveis de log com rotação automática
- ✅ **Segurança Multicamadas** - Proteção contra spam, links e conteúdo inadequado
- ✅ **Economia Integrada** - XP, moedas virtuais e sistema de recompensas
- ✅ **Notificações Inteligentes** - Monitoramento de plataformas externas
- ✅ **Interface Moderna** - Embeds responsivos e componentes interativos

---

## 📦 Instalação e Configuração

### 🔧 Pré-requisitos

- **Node.js** versão 16 ou superior
- **npm** ou **yarn** para gerenciamento de pacotes
- **MongoDB** para armazenamento de dados
- **Conta Discord Developer** para token do bot

### ⚙️ Instalação Rápida

1. **Clone o repositório:**
```bash
git clone https://github.com/jonathasfrontend/jonalandia.git
cd jonalandia
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

4. **Configure o arquivo `.env`:**
```env
# Bot Configuration
TOKEN=seu_token_do_discord_bot
MONGO_URI=mongodb://localhost:27017/jonalandia

# Channel IDs
CHANNEL_ID_LOGS_INFO_BOT=id_do_canal_logs_info
CHANNEL_ID_LOGS_ERRO_BOT=id_do_canal_logs_erro
CHANNEL_ID_CARGOS=id_do_canal_cargos

# Role IDs
CARGO_MODERADOR=id_do_cargo_moderador
CARGO_MEMBRO=id_do_cargo_membro
CARGO_MEMBRO_PLUS=id_do_cargo_membro_plus

# External APIs
WEATHER_API_KEY=sua_chave_api_clima
YOUTUBE_API_KEY=sua_chave_api_youtube
TWITCH_CLIENT_ID=seu_client_id_twitch
TWITCH_CLIENT_SECRET=seu_client_secret_twitch

```

5. **Inicie o bot:**
```bash
npm start
```

### 🔒 Configuração de Segurança

Para máxima segurança, configure:

1. **Permissões do Bot:**
   - Administrator (recomendado para funcionalidade completa)
   - Ou permissões específicas: Manage Messages, Kick Members, Ban Members, etc.

2. **Canais de Log:**
   - Canal para logs informativos
   - Canal para logs de erro
   - Canais com acesso restrito a moderadores

---

## 🏗️ Estrutura do Projeto

```
jonalandia/
├── 📁 src/
│   ├── 📁 commands/           # Comandos do bot
│   │   ├── 📁 moderador/      # Comandos de moderação
│   │   └── 📁 initializebot/  # Comandos de inicialização
│   ├── 📁 config/             # Configurações do sistema
│   ├── 📁 functions/          # Funções automáticas
│   │   └── 📁 punicfunction/  # Funções de segurança
│   ├── 📁 models/             # Esquemas do banco de dados
│   ├── 📁 utils/              # Utilitários e helpers
│   ├── 📁 logs/               # Arquivos de log
│   ├── 📄 Client.js           # Cliente Discord
│   ├── 📄 index.js            # Arquivo principal
│   └── 📄 logger.js           # Sistema de logs
├── 📄 package.json            # Dependências do projeto
├── 📄 README.md               # Documentação
└── 📄 .env                    # Variáveis de ambiente
```

### 📊 Arquitetura Modular

O bot foi projetado com arquitetura modular para facilitar manutenção e expansão:

- **Core System** - Gerenciamento central do bot
- **Command System** - Sistema de comandos slash organizados por categoria
- **Event System** - Manipulação de eventos Discord
- **Security System** - Múltiplas camadas de proteção
- **Database System** - Integração com MongoDB
- **Logging System** - Sistema de logs profissional

---

## 🎯 Comandos Disponíveis

### 👥 Comandos Gerais (Usuários)

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/oi` | Saudação amigável | `/oi` |
| `/help` | Lista todos os comandos disponíveis | `/help` |
| `/server` | Informações detalhadas do servidor | `/server` |
| `/birthday` | Registra data de aniversário | `/birthday dia: 15 mês: 8` |
| `/clima` | Previsão do tempo para cidade | `/clima cidade: São Paulo` |
| `/sorteio` | Participa de sorteios ativos | `/sorteio` |
| `/infosorteio` | Informações sobre sorteios | `/infosorteio` |

### 🛡️ Comandos de Moderação

| Comando | Descrição | Uso | Permissão |
|---------|-----------|-----|-----------|
| `/regra` | Exibe regras do servidor | `/regra` | Moderador |
| `/clearall` | Remove mensagens em massa (1-100) | `/clearall number: 50` | Moderador |
| `/clearuser` | Remove mensagens de usuário específico | `/clearuser numero: 10 usuario: @user` | Moderador |
| `/timeout` | Aplica timeout de 3 minutos | `/timeout usuario: @user` | Moderador |
| `/banir` | Bane usuário do servidor | `/banir usuario: @user` | Moderador |
| `/desbanir` | Remove ban de usuário | `/desbanir usuario: @user` | Moderador |
| `/expulsar` | Expulsa usuário de canal de voz | `/expulsar usuario: @user` | Moderador |
| `/kickuser` | Remove usuário de canal de voz | `/kickuser usuario: @user` | Moderador |
| `/embed` | Cria embed personalizado | `/embed titulo: "Título" descrição: "Texto"` | Moderador |
| `/infouser` | Informações detalhadas do usuário | `/infouser usuario: @user` | Moderador |
| `/voteparaban` | Inicia votação para banimento | `/voteparaban usuario: @user` | Moderador |

### 🎲 Comandos de Sorteio

| Comando | Descrição | Uso | Permissão |
|---------|-----------|-----|-----------|
| `/premiosorteio` | Define prêmio do sorteio | `/premiosorteio premio: "Discord Nitro"` | Moderador |
| `/sortear` | Realiza sorteio entre participantes | `/sortear` | Moderador |
| `/limpasorteio` | Limpa dados do sorteio atual | `/limpasorteio` | Moderador |

### 🛠️ Comandos de Gerenciamento

| Comando | Descrição | Uso | Permissão |
|---------|-----------|-----|-----------|
| `/cargo` | Exibe seletor de cargos | `/cargo` | Moderador |
| `/ticket` | Sistema de tickets de suporte | `/ticket` | Moderador |
| `/manutencao` | Aviso de manutenção | `/manutencao` | Moderador |
| `/excluicomando` | Remove comando do bot | `/excluicomando comando: nome` | Moderador |

### 🔧 Comandos de Inicialização

| Comando | Descrição | Uso | Permissão |
|---------|-----------|-----|-----------|
| `/addchannels` | Adiciona canais ao sistema | `/addchannels opcao: todos` | Moderador |
| `/removechannels` | Remove canal do sistema | `/removechannels channel: #canal` | Moderador |
| `/registerstreamerstwitch` | Cadastra streamer Twitch | `/registerstreamerstwitch streamer: nome` | Moderador |
| `/registerchannelsyoutube` | Cadastra canal YouTube | `/registerchannelsyoutube canal: url` | Moderador |

---

## 🔧 Funcionalidades Automáticas

### 🔄 Sistemas Ativos 24/7

#### 🎂 Notificações de Aniversário
- **Horário**: Verificação diária às 08:00
- **Funcionalidade**: Parabeniza membros que fazem aniversário
- **Personalização**: Mensagens personalizadas com menções

#### 📹 Monitoramento YouTube
- **Frequência**: Verificação a cada 10 minutos
- **Funcionalidade**: Notifica sobre novos vídeos de canais cadastrados
- **Formato**: Embeds com thumbnail e informações do vídeo

#### 🎮 Monitoramento Twitch
- **Frequência**: Verificação a cada 5 minutos
- **Funcionalidade**: Notifica quando streamers entram/saem ao vivo
- **Detalhes**: Informações de categoria, espectadores e duração

#### 🆓 Notificação de Jogos Gratuitos
- **Frequência**: Verificação diária
- **Funcionalidade**: Monitora promoções Epic Games, Steam, etc.
- **Alertas**: Notificações automáticas de jogos gratuitos

#### 📊 Atualização de Cargos
- **Frequência**: Verificação semanal
- **Funcionalidade**: Promove membros após 30 dias no servidor
- **Automação**: Adiciona cargo "Membro Plus" automaticamente

---

## 🛡️ Sistema de Segurança

### 🚫 Anti-Flood Chat
```javascript
// Configurações de segurança
- Limite: 5 mensagens por 10 segundos
- Penalidade: Timeout automático de 3 minutos
- Sistema de pontos: Infrações acumulativas
- Logs detalhados: Todas as ocorrências são registradas
```

### 🔗 Bloqueio de Links
```javascript
// Links bloqueados incluem:
- Links de Discord não autorizados
- Encurtadores de URL suspeitos
- Domínios em lista negra
- Links de phishing conhecidos
```

### 🤬 Detecção de Palavras Inadequadas
```javascript
// Sistema inteligente que detecta:
- Palavrões e linguagem ofensiva
- Conteúdo discriminatório
- Spam e flood de caracteres
- Variações e evasões de filtro
```

### 📎 Bloqueio de Tipos de Arquivo
```javascript
// Arquivos bloqueados:
- Executáveis (.exe, .bat, .cmd)
- Scripts maliciosos (.js, .vbs, .ps1)
- Arquivos de configuração suspeitos
- Extensões potencialmente perigosas
```

### 👤 Proteção Contra Novos Membros
```javascript
// Sistema automático que:
- Monitora comportamento de contas novas
- Detecta padrões de bot/spam
- Aplica medidas preventivas
- Mantém logs de atividade suspeita
```

---

## 📊 Sistema de Logs Avançado

### 📈 Níveis de Log Disponíveis

| Nível | Cor | Descrição | Arquivo |
|-------|-----|-----------|---------|
| **ERROR** | 🔴 Vermelho | Erros críticos e exceções | `error.log` |
| **WARN** | 🟡 Amarelo | Avisos e situações suspeitas | `warn.log` |
| **INFO** | 🔵 Azul | Informações gerais | `bot.log` |
| **DEBUG** | 🟢 Verde | Informações de depuração | `bot.log` |
| **VERBOSE** | 🟣 Magenta | Logs detalhados | `bot.log` |
| **SILLY** | ⚪ Cinza | Logs extremamente detalhados | `bot.log` |

### 📁 Arquivos de Log

#### 📋 Configuração de Rotação
```javascript
- bot.log      // Todos os logs (5MB, 5 arquivos)
- error.log    // Apenas erros (5MB, 5 arquivos)  
- warn.log     // Avisos (5MB, 3 arquivos)
- exceptions.log // Exceções não capturadas
- rejections.log // Promises rejeitadas
```

### 🔍 Contexto Rico dos Logs

Cada log inclui informações detalhadas:

```javascript
{
  timestamp: "2025-01-26 14:30:15",
  level: "INFO",
  message: "Comando executado com sucesso",
  module: "COMMAND",
  command: "help",
  user: "usuario#1234",
  guild: "Nome do Servidor",
  channel: "canal-geral",
  metadata: {
    executionTime: "125ms",
    success: true
  }
}
```

### 🔧 Métodos de Log Disponíveis

#### Métodos Básicos
```javascript
const { logger } = require('./logger');

// Logs simples
logger.error('Erro crítico', context, error);
logger.warn('Situação suspeita detectada', context);
logger.info('Operação realizada com sucesso', context);
logger.debug('Debug: verificando dados', context);
```

#### Métodos Especializados
```javascript
// Execução de comandos
commandExecuted('help', user, guild, true);

// Eventos do bot
botEvent('BOT_READY', 'Bot inicializado com sucesso');

// Eventos de segurança
securityEvent('ANTI_FLOOD_TRIGGERED', user, guild, 'detalhes');

// Operações de banco de dados
databaseEvent('INSERT', 'users', true, 'Usuário criado');
```

### 📊 Monitoramento Abrangente

#### 🔒 Eventos de Segurança Logados
- ✅ Detecções de anti-flood
- ✅ Bloqueios de links maliciosos  
- ✅ Filtros de linguagem inadequada
- ✅ Expulsões e banimentos
- ✅ Tentativas de acesso não autorizado

#### 💾 Operações de Banco de Dados
- ✅ Inserções, atualizações e exclusões
- ✅ Consultas de performance
- ✅ Erros de conexão
- ✅ Backups e restaurações

#### 🎮 Atividades dos Usuários
- ✅ Execução de comandos
- ✅ Entrada e saída de membros
- ✅ Mudanças de cargo
- ✅ Atividades de voz e texto

---

## 🔔 Sistema de Notificações

### 📺 Notificações YouTube
- **Canais Monitorados**: Lista configurável de canais
- **Frequência**: Verificação a cada 10 minutos
- **Formato**: Embeds com thumbnail e informações
- **Personalização**: Mensagens customizáveis por canal

### 🎮 Notificações Twitch
- **Streamers Monitorados**: Lista configurável de streamers
- **Status em Tempo Real**: Detecção de live/offline
- **Informações Detalhadas**: Categoria, viewers, duração
- **Histórico**: Registro de todas as transmissões

### 🆓 Notificações de Jogos Gratuitos
- **Plataformas Monitoradas**: Epic Games, Steam, GOG
- **Alertas Automáticos**: Notificação de novos jogos gratuitos
- **Período Limitado**: Avisos sobre tempo restante
- **Links Diretos**: Links para resgate dos jogos

### 🎂 Sistema de Aniversários
- **Cadastro Individual**: Usuários registram suas datas
- **Verificação Diária**: Checagem automática às 08:00
- **Parabenização Automática**: Mensagens personalizadas
- **Histórico**: Registro de todos os aniversários

---

## ⚙️ Configuração Avançada

### 🔧 Variáveis de Ambiente Detalhadas

```env
# ====================================
# CONFIGURAÇÃO PRINCIPAL DO BOT
# ====================================
TOKEN=seu_token_discord_bot
MONGO_URI=mongodb://localhost:27017/jonalandia

# ====================================
# IDS DOS CANAIS
# ====================================
CHANNEL_ID_LOGS_INFO_BOT=123456789012345678
CHANNEL_ID_LOGS_ERRO_BOT=123456789012345678
CHANNEL_ID_CARGOS=123456789012345678
CHANNEL_ID_REGRAS=123456789012345678
CHANNEL_ID_ANIVERSARIOS=123456789012345678

# ====================================
# IDS DOS CARGOS
# ====================================
CARGO_MODERADOR=123456789012345678
CARGO_MEMBRO=123456789012345678
CARGO_MEMBRO_PLUS=123456789012345678
CARGO_MASCULINO=123456789012345678
CARGO_FEMININO=123456789012345678

# Cargos de Jogos
CARGO_FREE_FIRE=123456789012345678
CARGO_MINECRAFT=123456789012345678
CARGO_VALORANT=123456789012345678
CARGO_FORTNITE=123456789012345678
CARGO_LOL=123456789012345678
CARGO_CS=123456789012345678

# ====================================
# APIS EXTERNAS
# ====================================
WEATHER_API_KEY=sua_chave_api_clima
```

### 🗄️ Configuração do MongoDB

#### Esquemas de Banco de Dados

```javascript
// Principais coleções utilizadas:
1. UserProfile        // Perfis dos usuários
2. UserInfractions    // Sistema de infrações
3. BirthdayNotifications // Aniversários cadastrados  
4. Sorteio           // Participantes de sorteios
5. PremioSorteio     // Prêmios dos sorteios
6. TwitchStreamers   // Streamers monitorados
7. YoutubeChannels   // Canais YouTube monitorados
8. VotoBanUser       // Sistema de votação para ban
9. AddChannels       // Canais configurados no sistema
10. GameNotifications // Notificações de jogos gratuitos
```

### 🔒 Configurações de Segurança

#### Lista de Bloqueios Configurável

```json
// blockedLinks.json
{
  "domains": [
    "discord.gg",
    "discord.com/invite",
    "bit.ly",
    "tinyurl.com"
  ],
  "exceptions": [
    "discord.gg/jonalandia"
  ]
}

// InappropriateWords.json  
{
  "words": [
    "palavra1",
    "palavra2"
  ],
  "severity": {
    "low": ["palavra1"],
    "medium": ["palavra2"], 
    "high": ["palavra3"]
  }
}

// blockedFileExtensions.json
{
  "extensions": [
    ".exe",
    ".bat", 
    ".cmd",
    ".vbs",
    ".ps1"
  ]
}
```

---

## 🐛 Resolução de Problemas

### ❗ Problemas Comuns

#### 🔴 Bot não está iniciando
```bash
# Verifique as dependências
npm install

# Verifique o arquivo .env
cat .env

# Verifique os logs
tail -f src/logs/error.log
```

#### 🟡 Comandos não estão funcionando
```javascript
// Verificações necessárias:
1. Token do bot está correto
2. Bot tem permissões necessárias
3. Canais configurados corretamente
4. IDs dos cargos estão corretos
```

#### 🔵 MongoDB não está conectando
```bash
# Verifique se MongoDB está executando
systemctl status mongod

# Teste a conexão
mongo --eval "db.stats()"

# Verifique a URI no .env
echo $MONGO_URI
```

### 📞 Suporte e Debug

#### 🔍 Logs de Debug
```bash
# Habilitar modo debug
NODE_ENV=development npm start

# Visualizar logs em tempo real
tail -f src/logs/bot.log

# Filtrar por tipo de erro
grep "ERROR" src/logs/error.log
```

#### 📊 Monitoramento de Performance
```javascript
// O bot inclui métricas de performance:
- Tempo de resposta dos comandos
- Uso de memória
- Conexões de banco de dados
- Taxa de erro por módulo
```

---

## 🤝 Contribuição

### 👨‍💻 Como Contribuir

1. **Fork o repositório**
2. **Crie uma branch para sua feature:**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. **Commit suas mudanças:**
   ```bash
   git commit -m "Adiciona nova funcionalidade"
   ```
4. **Push para a branch:**
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. **Abra um Pull Request**

### 📝 Padrões de Código

- **ESLint**: Siga as configurações do projeto
- **Commit Convention**: Use conventional commits
- **Documentação**: Documente todas as funções
- **Testes**: Inclua testes para novas funcionalidades

### 🐛 Reportando Bugs

Para reportar bugs, inclua:
- Versão do bot
- Logs relevantes
- Passos para reproduzir
- Comportamento esperado vs atual

---

## 📄 Licença e Informações

### 👤 Autor
- **Nome**: Jonathas Oliveira
- **Email**: jonathass56778@gmail.com
- **GitHub**: [@jonathasfrontend](https://github.com/jonathasfrontend)

### 📋 Documentos Importantes
- [📋 Política de Privacidade](./PRIVACY_POLICY.md)
- [📋 Termos de Serviço](./TERMS_OF_SERVICE.md)
- [📋 Licença](./LICENSE)

### 🔄 Versionamento
- **Versão Atual**: 1.1.1
- **Sistema**: Semantic Versioning (SemVer)
- **Changelog**: Disponível no repositório

---

<div align="center">

### 🌟 Bot Jonalandia - Transformando Comunidades Discord

**Desenvolvido com ❤️ por [Jonathas Oliveira](https://github.com/jonathasfrontend)**

[![GitHub](https://img.shields.io/badge/GitHub-jonathasfrontend-black?style=for-the-badge&logo=github)](https://github.com/jonathasfrontend)
[![Discord](https://img.shields.io/badge/Discord-Jonalandia-7289da?style=for-the-badge&logo=discord)](https://discord.gg/jonalandia)

---

*"Um bot completo para uma comunidade completa"*

</div>
