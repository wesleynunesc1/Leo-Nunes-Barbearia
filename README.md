# Léo Nunes Barbearia — Novo Site Oficial

Site institucional e portal de agendamento de alto padrão para a **Léo Nunes Barbearia**, localizada no Centro de Pacajus, Ceará.

Desenvolvido com foco em estética editorial masculina contemporânea, alta performance, SEO local e preservação estrita do fluxo oficial de agendamento externo (Wix).

---

## 💈 Arquitetura & Fluxo de Agendamento

O fluxo do cliente segue o padrão:
```
Início (/) → Escolha do Barbeiro (/agendar) → Serviços do Barbeiro (/agendar/[slug]) → Calendário Oficial Wix
```

### 👥 Barbeiros & Serviços Integrados (36 opções oficiais)
- **Léo Nunes** (`/agendar/leo-nunes`): 10 serviços exclusivos com visagismo
- **Aleffer Nunes** (`/agendar/aleffer-nunes`): 8 serviços
- **Hélio Victor** (`/agendar/helio-victor`): 10 serviços
- **Guilherme Oliveira** (`/agendar/guilherme-oliveira`): 8 serviços (links diretos Wix)

> **Regra Operacional Crítica:** Nenhuma reserva ou disponibilidade é simulada no front-end. O botão de cada serviço aciona a URL exata do calendário no Wix mantendo os `resource IDs` oficiais intactos.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js (App Router) com Turbopack
- **Linguagem**: TypeScript com tipagem estrita
- **Estilização**: Tailwind CSS com paleta editorial dark:
  - Preto primário: `#080B09`
  - Superfícies: `#101611`, `#161F18`
  - Destaque Verde Marca: `#25C440`
  - Texto suave: `#F5F7F3` e `#A6AEA8`
- **Tipografia**: Montserrat (display & títulos) e Inter (textos & interface)
- **SEO & Dados Estruturados**: Schema.org `BarberShop` / `LocalBusiness`, OpenGraph, Sitemap XML e Robots.txt
- **Ícones**: Lucide Icons & SVGs otimizados

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ (recomendado Node.js 20+)
- npm ou yarn

### Instalação
```bash
npm install
```

### Executar em Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

### Build de Produção
```bash
npm run build
npm run start
```

---

## 🧭 Rotas da Aplicação

| Rota | Descrição |
| :--- | :--- |
| `/` | Página inicial com Hero, Serviços, Equipe, Experiência, Como Agendar, Localização e Mapa |
| `/agendar` | Seleção dos 4 barbeiros com fotos oficiais e contagem de serviços |
| `/agendar/leo-nunes` | Portal de serviços de Léo Nunes (10 serviços) |
| `/agendar/aleffer-nunes` | Portal de serviços de Aleffer Nunes (8 serviços) |
| `/agendar/helio-victor` | Portal de serviços de Hélio Victor (10 serviços) |
| `/agendar/guilherme-oliveira` | Portal de serviços de Guilherme Oliveira (8 serviços) |
| `/sitemap.xml` | Mapa do site gerado dinamicamente para motores de busca |
| `/robots.txt` | Diretrizes de indexação para robôs de busca |

### 🔄 Redirecionamentos de Rotas Legadas (HTTP 308)
Configurados em `next.config.ts`:
- `/selecionar-barbeiro` → `/agendar`
- `/leonunesagenda` → `/agendar/leo-nunes`
- `/aleffernunesagenda` → `/agendar/aleffer-nunes`
- `/heliovictoragenda` → `/agendar/helio-victor`
- `/guilhermeagenda` → `/agendar/guilherme-oliveira`

---

## 📁 Como Gerenciar e Alterar Conteúdos

### 1. Alterar Barbeiros, Serviços e Links de Agendamento
Edite o arquivo:
[`src/data/barbers.ts`](src/data/barbers.ts)

Para cada barbeiro você pode atualizar:
- Nome (`name`)
- Cargo / Especialidade (`role`)
- Foto (`photo`)
- Lista de serviços (`services`), incluindo nome, categoria e o link exato da agenda (`bookingUrl`).

### 2. Alterar Fotos e Ativos
As imagens estão armazenadas em `public/images/`:
- `public/images/logo.png`: Logomarca oficial transparente
- `public/images/hero-bg.png`: Imagem principal do Hero
- `public/images/gallery-1.png` e `gallery-2.png`: Fotos reais do espaço
- `public/images/barbers/`: Fotos individuais dos barbeiros

### 3. Alterar Informações de Contato & Horários
- Endereço, telefone/WhatsApp e horários estão centralizados em:
  - [`src/app/page.tsx`](src/app/page.tsx)
  - [`src/components/Footer.tsx`](src/components/Footer.tsx)
  - [`src/app/layout.tsx`](src/app/layout.tsx) (JSON-LD para Google)

---

## 📋 Informações Oficiais da Barbearia

- **Endereço**: Rua Joaquim Nogueira Lopes, 180, Centro, Pacajus – CE, 62870-000
- **WhatsApp**: [(85) 99222-7064](https://wa.me/5585992227064)
- **Instagram**: [@leonunesbarbearia](https://instagram.com/leonunesbarbearia)
- **Horário Confirmado**:
  - Segunda a Sexta: 08h às 19h
  - Sábado: 08h às 18h
  - Domingo: Fechado
