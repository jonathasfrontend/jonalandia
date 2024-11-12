# Bot Jonalandia - Documentação

## Sumário

- [Introdução](#introdução)
- [Requisitos](#requisitos)
- [Estrutura do Código](#estrutura-do-código)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Eventos](#eventos)
- [Comandos](#comandos)
  - [Comandos para Usuários](#comandos-para-usuários)
  - [Comandos para Moderadores](#comandos-para-moderadores)
- [Funções Principais](#funções-principais)

## Introdução

O **Bot Jonalandia** é um bot do Discord desenvolvido para oferecer diversas funcionalidades para melhorar a experiência de interação e moderação dentro dos servidores. Ele inclui comandos para usuários e moderadores, além de funções automáticas como verificação de links, controle de flood e detecção de palavras inapropriadas.

## Requisitos

- **Node.js** (versão recomendada: 16 ou superior)
- **Discord.js** (versão atualizada)
- Dependências específicas, como `dotenv` para carregar variáveis de ambiente
- Banco de dados conectado via `bdServerConect`

## Estrutura do Código

O bot possui uma estrutura modular com arquivos organizados em pastas para funções, comandos e eventos. Aqui está uma visão geral:

index.js # Arquivo principal do bot config/bdServerConect.js # Conexão com o banco de dados functions/ # Pasta de funções automáticas e eventos commands/ # Comandos para usuários e moderadores

## Configuração do Ambiente

Configure as variáveis de ambiente no arquivo `.env`, incluindo o token do bot:
```env
    TOKEN=SEU_TOKEN_DO_BOT`
```

## Eventos
```ready```
Quando o bot está pronto, ele inicializa diversas funções e exibe uma mensagem de confirmação no console.

```interactionCreate```
Este evento lida com os comandos do bot, verificando o comando invocado e executando a função apropriada.

```guildMemberAdd```
Lida com ações quando novos membros entram no servidor, como verificação de regras e cumprimento de normas.

```messageCreate```
Executa ações automáticas de moderação quando uma nova mensagem é enviada, como bloqueio de links, anti-flood e detecção de palavras inapropriadas.

## Comandos
### Comandos para Usuários
Estes comandos estão disponíveis para todos os usuários.

```/oi```
**Descrição**: Responde com uma saudação.

```/usuario [nome]```
**Descrição**: Busca informações sobre um usuário específico. Parâmetros:

* ```usuario```: Nome do usuário a ser pesquisado.

```/server```
**Descrição**: Exibe informações sobre o servidor.

```/help```
**Descrição**: Lista os comandos disponíveis e ajuda com sua utilização.

```/ticket```
**Descrição**: Cria um botão para abrir um ticket de suporte.

```/memes```
**Descrição**: Gera um meme aleatório.

```/conselho```
**Descrição**: Oferece um conselho aleatório.

```/birthday [dia] [mês]```
**Descrição**: Registra o aniversário do usuário. Parâmetros:

* ```dia```: Dia do aniversário.
* ```mês```: Mês do aniversário.

```/clima [cidade]```
**Descrição**: Exibe a previsão do tempo para uma cidade específica. Parâmetros:

* ```cidade```: Nome da cidade.

### Comandos para Moderadores
Estes comandos são exclusivos para usuários com permissões de moderador.

```/clearall [number]```
**Descrição**: Deleta um número específico de mensagens no canal atual. Parâmetros:

number: Quantidade de mensagens a serem deletadas.
```/clearuser [numero] [usuario]```
**Descrição**: Deleta um número específico de mensagens de um usuário. Parâmetros:

* ```numero```: Quantidade de mensagens a serem deletadas.
* ```usuario```: Usuário cujas mensagens serão deletadas.

```/regra```
**Descrição**: Exibe um embed com as regras do servidor.

```/cargo```
**Descrição**: Mostra botões para seleção de cargos.

```/manutencao```
**Descrição**: Envia uma mensagem de manutenção no canal.

```/embed [titulo] [descricao] [canal] [cor]```
**Descrição**: Cria um embed personalizado em um canal específico. Parâmetros:

* ```titulo```: Título do embed.
* ```descricao```: Descrição do embed.
* ```canal```: Canal onde o embed será enviado.
* ```cor```: Cor do embed.

```/timeout [usuario]```
**Descrição**: Aplica um timeout de 3 minutos em um usuário. Parâmetros:

* ```usuario```: Usuário alvo do timeout.

```/expulsar [usuario]```
**Descrição**: Expulsa um usuário do servidor. Parâmetros:

* ```usuario```: Usuário a ser expulso.

```/banir [usuario]```
**Descrição**: Bane um usuário do servidor. Parâmetros:

* ```usuario```: Usuário a ser banido.

```/desbanir [usuario]```
**Descrição**: Desbane um usuário do servidor. Parâmetros:

* ```usuario```: Usuário a ser desbanido.

```/kickuser [usuario]```
**Descrição**: Expulsa um usuário de um canal de voz. Parâmetros:

* ```usuario```: Usuário a ser expulso do canal de voz.

## Funções Principais
```antiFloodChat```
**Descrição**: Detecta e impede o envio excessivo de mensagens em um curto intervalo de tempo, evitando spam.

```blockLinks```
**Descrição**: Bloqueia links indesejados e links de servidores de terceiros em todas as mensagens.

```detectInappropriateWords```
**Descrição**: Identifica e toma ações sobre mensagens que contêm palavras inapropriadas.

```autoKickNewMembers```
**Descrição**: Kicks novos membros que não atendem aos requisitos do servidor, se aplicável.

```blockFileTypes```
**Descrição**: Bloqueia tipos de arquivos indesejados enviados no chat.

```scheduleBirthdayCheck```
**Descrição**: Verifica regularmente os aniversários registrados para enviar notificações de parabéns.

```checkUpdateRoles```
**Descrição**: Atualiza as permissões e cargos dos membros conforme necessário.

```Status```
**Descrição**: Define o status do bot.

```scheduleNotificationYoutubeCheck```, ```scheduleNotificationTwitchCheck```, ```scheduleonNotificationFreeGamesCheck```
**Descrição**: Verifica regularmente atualizações em plataformas externas como YouTube, Twitch e jogos gratuitos, e notifica os usuários.

### Instalação de Dependências
No diretório do projeto, instale as dependências com o seguinte comando:
```bash
npm install
```

### 6.2. Executando o Projeto em Desenvolvimento
Para iniciar o projeto em modo de desenvolvimento, utilize:
```bash
npm run dev
```

## Conclusão
O bot Jonalandia representa uma solução robusta e adaptável para comunidades no Discord que buscam automação, moderação e engajamento. Com comandos abrangentes para usuários e ferramentas avançadas de moderação, o sistema oferece uma experiência controlada, divertida e funcional. A documentação detalhada é um recurso essencial para gerenciar o código, ajudando a equipe de desenvolvimento e futuros colaboradores a compreender, utilizar e aprimorar o bot de maneira eficaz.

Para copiar o código completo do bot Jonalandia, utilize o seguinte comando:
```bash
git clone <repositório-do-bot-Jonalandia>
```