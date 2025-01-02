# Bot Jonalandia - Documentação

## **Sumário**

1. [Introdução](#introdução)
2. [Visão Geral](#visão-geral)
3. [Requisitos](#requisitos)
4. [Configuração do Ambiente](#configuração-do-ambiente)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Eventos](#eventos)
7. [Comandos](#comandos)
   - [Usuários](#usuários)
   - [Moderadores](#moderadores)
8. [Funções Principais](#funções-principais)
9. [Instalação e Execução](#instalação-e-execução)
10. [Conclusão](#conclusão)

---

## **Introdução**

O **Bot Jonalandia** é uma ferramenta poderosa para servidores Discord, projetada para automatizar tarefas de moderação, engajar comunidades e oferecer funcionalidades customizáveis. Ele combina comandos intuitivos e funções automáticas, garantindo uma experiência dinâmica e segura para os usuários.

---

## **Visão Geral**

- **Linguagem**: Node.js
- **Bibliotecas**: Discord.js, dotenv, mongoose
- **Banco de Dados**: MongoDB
- **Principais Recursos**:
  - Automação de tarefas de moderação
  - Detecção e bloqueio de links
  - Controle de flood
  - Notificações de aniversariantes e atualizações de plataformas externas

---

## **Requisitos**

Para rodar o bot, você precisará de:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn** para gerenciar pacotes
- **MongoDB** para armazenamento de dados

Instale as dependências com:
```bash
npm install
```

---

## **Configuração do Ambiente**

1. Crie um arquivo `.env` na raiz do projeto.
2. Insira as seguintes variáveis de ambiente:
   ```env
   TOKEN=SEU_TOKEN_DO_BOT
   MONGO_URI=URL_DO_SEU_BANCO_DE_DADOS
   ```
3. Substitua os valores pelos seus dados.

---

## **Estrutura do Projeto**

A organização do projeto segue boas práticas para modularidade e manutenção. Abaixo está uma visão geral:

```plaintext
/src
  /commands
    /moderador
      commands.js
    commands.js
  /config
    bdServerConect.js
  /functions
    functions.js
  /models
    schema.js
Cliente.js
Jonalandia.js
logger.js
```

---

## **Eventos**

### **`ready`**
- Dispara quando o bot está pronto para uso.
- Registra no console: `Bot está online!`

### **`interactionCreate`**
- Gerencia interações de slash commands.

### **`guildMemberAdd`**
- Monitora entradas de novos membros, aplicando regras predefinidas.

### **`messageCreate`**
- Modera mensagens em tempo real (ex.: bloqueio de links, anti-flood).

---

## **Comandos**

### **Usuários**

- **`/oi`**: Saudação simples.
- **`/help`**: Lista os comandos disponíveis.
- **`/birthday [dia] [mês]`**: Registra aniversário do usuário.
- **`/clima [cidade]`**: Previsão do tempo.

### **Moderadores**

- **`/clearall [número]`**: Remove mensagens em massa.
- **`/timeout [usuário]`**: Aplica timeout de 3 minutos.
- **`/kickuser [usuário]`**: Remove um usuário de um canal de voz.

---

## **Funções Principais**

- **`antiFloodChat`**: Controla spam no chat.
- **`blockLinks`**: Bloqueia links de terceiros.
- **`scheduleBirthdayCheck`**: Envia notificações de aniversários registrados.
- **`checkUpdateRoles`**: Gerencia permissões e cargos automaticamente.

---

## **Instalação e Execução**

### **Instalação das Dependências**
No diretório do projeto:
```bash
npm install
```

### **Executando o Projeto**
Para iniciar o bot:
```bash
npm start
```

---

## **Conclusão**

O **Bot Jonalandia** é uma solução completa e eficiente para gerenciar comunidades no Discord. Sua arquitetura modular facilita manutenção e expansões futuras, enquanto suas funções avançadas garantem uma experiência única para usuários e administradores.

Para contribuir, clone o repositório e siga as instruções acima:
```bash
git clone <URL-DO-REPOSITÓRIO>
```