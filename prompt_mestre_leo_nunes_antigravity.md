# PROMPT MESTRE — REFORMULAÇÃO COMPLETA LÉO NUNES BARBEARIA

## MISSÃO / MODO DE EXECUÇÃO

Você é um time sênior de estratégia digital, UX/UI, direção de arte, engenharia front-end, qualidade, performance e SEO local. DESENVOLVA, IMPLEMENTE, TESTE E ENTREGUE um site de produção completo para a **Léo Nunes Barbearia**, em Pacajus, Ceará, Brasil. Quero o resultado realmente implementado e navegável, não apenas mockup, wireframe, screenshots ou plano de execução.

O site atual é `https://leonunesbarbearia.com.br/`. Refazer tudo com estética editorial de altíssimo padrão, mantendo a identidade existente (especialmente logomarca e VERDE) e SEM QUEBRAR O AGENDAMENTO. O projeto poderá ser feito do zero no diretório de trabalho, se necessário. Inspecione os arquivos existentes antes de sobrescrever qualquer coisa útil.

**Regra operacional absoluta:** cliente deve navegar `Início → Escolher barbeiro → Escolher serviço → Link exato da agenda externa`. As duas primeiras escolhas acontecem dentro do novo site, com experiência nova. O calendário/disponibilidade/registro da reserva permanece no sistema externo vigente (Wix). Nunca simule horários disponíveis nem confirme reservas no front-end sem integração legítima.

## MATERIAL E REFERÊNCIAS

Arquivos HTML que o cliente já forneceu (caso estejam anexados no workspace):
- `home - Leo Nunes.html`
- `Selecionar Barbeiro - Leo Nunes.html`
- `leonunesagenda - Leo Nunes.html`
- `aleffernunesagenda - Leo Nunes.html`
- `héliovictoragenda - Leo Nunes.html`
- `guilhermeagenda - Leo Nunes.html`

Arquivos opcionais complementares: `mapeamento_agendamento_leo_nunes.zip`, `links_agendamento.csv`, `estrutura_agendamento.json`, `dados_prontos_para_site.json`.

A seção `DADOS OFICIAIS DE AGENDAMENTO` deste prompt é AUTOSSUFICIENTE e prevalece se os anexos não estiverem disponíveis. Esses dados foram extraídos de HTMLs fornecidos pelo cliente e **não equivalem à verificação de reserva real**. Se houver divergência entre anexos e esse bloco, explicar qual dado foi usado e não improvisar links.

## 1. DIREÇÃO DE ARTE E DESIGN SYSTEM

Fazer um site singular, premium, fotográfico e elegante — **não** usar aparência de template genérico de barbearia, landing page de afiliado, loja virtual ou UI de dashboard. Referência estética: editorial masculino contemporâneo, alto contraste, detalhes precisos, fotografias reais grandes, bastante respiro, tipografia com personalidade, grids sólidos, microinterações discretas. Visual refinado e coerente no desktop e no celular.

Paleta sugerida (ajustável com critério de contraste):
- Preto principal `#080B09`, superfícies `#101611` e `#171E19`
- Verde de marca `#25C440`, usado **somente como destaque estratégico**: CTAs, indicadores, detalhes e hover
- Branco suave `#F5F7F3`, cinza `#A6AEA8`, borda `#29342B`
- Não usar neon excessivo, brilhos artificiais, meteoros/partículas, gradientes exagerados, cartões com bordas sem propósito ou sombras pesadas.

Tipografia: `Montserrat` (títulos display fortes, 600–800), `Manrope` ou `Inter` (textos e UI). Se quiser um detalhe condensado, `Bebas Neue` só pontualmente. Não depender de Gotham sem licença. Usar hierarquia e quebras cuidadosas, largura de leitura legível, responsividade fluida, botões retangulares com cantos discretos (6–10px).

Usar a logomarca oficial original (não redesenhar nem criar substitutos):
`https://leonunesbarbearia.com.br/wp-content/uploads/2024/11/LOGO-SEM-FUNDO-Copia-e1760996511549.png`

As imagens reais de profissionais estão nos dados abaixo. Baixar/otimizar imagens para assets locais quando possível e permitido; usar `next/image` com configuração correta caso sejam remotas. Não trocar os rostos por fotos de pessoas aleatórias, nem representar fotos de banco de imagens como se fossem os barbeiros reais.

## 2. ESTRUTURA DO SITE

Rotas obrigatórias:
- `/` → página inicial completa
- `/agendar` → seleção dos quatro profissionais
- `/agendar/leo-nunes` → serviços exatos de Léo Nunes
- `/agendar/aleffer-nunes` → serviços exatos de Aleffer Nunes
- `/agendar/helio-victor` → serviços exatos de Hélio Victor
- `/agendar/guilherme-oliveira` → serviços exatos de Guilherme Oliveira
- `not-found` amigável e retorno para agendamento

Se a hospedagem/domínio permitir, mapear rotas legadas `/selecionar-barbeiro/`, `/leonunesagenda/`, `/aleffernunesagenda/`, `/heliovictoragenda/` e `/guilhermeagenda/` para as novas equivalentes com 301/308, **somente quando não houver conflito com WordPress/Wix existente**. Não apagar páginas ou interromper links legados no domínio ativo antes do corte planejado. Se a plataforma nova não controlar essas rotas, documentar as regras de redirecionamento necessárias na origem.

### Home `/`
1. **Header** fixo/aderente elegante: logo original à esquerda; links Início, Serviços, Equipe, Experiência, Localização; CTA verde `Agendar horário`. Menu móvel acessível, elegante e funcional.
2. **Hero impactante:** tela inicial com composição fotográfica real, overlay escuro de leitura confortável e headline de alto impacto, sugestão `SEU ESTILO. NOSSA ASSINATURA.`; linha de apoio clara e verossímil sobre cortes, barbas e atendimento em Pacajus–CE. Botões `Agendar meu horário` (vai para `/agendar`) e `Conhecer serviços` (âncora). Selo discreto `PACAJUS — CE`. Não inventar tempo de mercado, avaliações ou quantidades de clientes.
3. **Serviços**: Corte de cabelo, Barba, Cabelo + barba, Sobrancelha, Hidratação, Limpeza facial e outros oferecidos; destaques em cards editoriais de corte/barba/experiência. Exibir preços SÓ após validação: o HTML antigo mostra corte geral R$35, corte com Léo R$40, barba R$20, sobrancelha R$10, hidratação R$15, penteado R$10, limpeza facial R$30, botox R$55; isso não garante preço atual nem preços idênticos por profissional. Preferir `Consultar no agendamento` se não houver confirmação. Não inventar valores, duração ou descontos.
4. **Equipe**: quatro cards com fotos oficiais, nome, pequena descrição genérica não biográfica e CTA contextual `Ver serviços` para sua nova rota individual. Mostrar exatamente Léo Nunes, Aleffer Nunes, Hélio Victor e Guilherme Oliveira. Cards não podem enviar todos para a mesma pessoa.
5. **Experiência / Institucional**: composição editorial fotos/brief copy sobre atenção aos detalhes, conforto, técnica e estilo sem afirmações não comprovadas.
6. **Galeria**: somente resultados/fotos reais disponíveis/autorizados, com legendas neutras. Sem galeria falsificada. Se houver poucas imagens, criar um layout refinado menor, sem placeholders visíveis ou galeria vazia.
7. **Como agendar**: 3 etapas claras (barbeiro, serviço, calendário externo) + CTA.
8. **Localização / Contato**: endereço `Rua Joaquim Nogueira Lopes, 180, Centro, Pacajus – CE, 62870-000`; telefone/WhatsApp `(85) 99222-7064` com link `https://wa.me/5585992227064`; Instagram `@leonunesbarbearia` com link para perfil somente após checagem. Endereço clicável para pesquisa/rota no Google Maps; mapa incorporado só se carregar bem e preservar privacidade. Horários provenientes do HTML antigo: segunda a sexta 08h–19h, sábado 08h–18h, domingo não indicado. Mostrar horários somente após conferência; não deduzir horário de domingo.
9. **Footer**: logo, navegação, endereço, contatos, copyright dinâmico, links funcionais.

### Agendamento `/agendar`
- Introdução clara: `ESCOLHA SEU BARBEIRO` / `O próximo corte começa aqui.`
- Quatro cards visuais e premium, cada um com a FOTO ORIGINAL e nome exato.
- CTA `Selecionar profissional` direciona à rota interna específica. Card todo pode ser clicável se semanticamente acessível.
- Breadcrumb `Início / Agendar`, possibilidade de voltar, texto simples sobre etapas, foco mobile-first.
- Não redirecionar diretamente ao Wix antes da escolha de serviço.

### Agendamento `/agendar/[profissional]`
- Hero compacto com foto/nome reais do barbeiro selecionado, botão `Trocar barbeiro` para `/agendar`.
- Título `ESCOLHA SEU SERVIÇO` e contagem/etapa da jornada.
- Renderizar **somente** os serviços pertencentes ao profissional conforme mapeamento JSON; preservar nomes e links sem misturar IDs.
- Lista/cards responsivos com nome, ícone discreto, talvez categoria, botão `Escolher serviço` / `Agendar`.
- Clicar no botão abre a `bookingUrl` literal exata desse profissional-serviço no calendário existente, idealmente na mesma aba para menor atrito, com orientação clara `Você continuará no sistema de agendamento`.
- O `resource` de cada URL não pode ser alterado/trocado. Não construir serviços genéricos com resource de outro barbeiro. Preservar URL/encoding/slug/query exatos. Links `wix.to` de Guilherme devem ficar intactos.
- Pode haver botão de suporte via WhatsApp, mas NUNCA substituir ou esconder links corretos da agenda.

## 3. REGRA CRÍTICA PARA LINKS

Implementar o banco de dados estático local tipado, ex.: `src/data/barbers.ts` ou `src/data/barbers.json`. Abaixo estão TODOS os 36 pares válidos. Consumir essas URLs como constantes, sem reconstruir/normalizar em tempo de execução, sem substituir `.com` por `.com.br` e sem remover query strings. O agendamento final pertence a `www.leonunesbarbearia.com` e `wix.to`, diferentemente do domínio institucional `leonunesbarbearia.com.br`.

**DADOS EXTRAÍDOS DO SITE EXISTENTE — COPIAR COMO FONTE DE VERDADE DA NOVA INTERFACE ATÉ VALIDAÇÃO DO RESPONSÁVEL:**

```json
{
  "selector_page": "https://leonunesbarbearia.com.br/selecionar-barbeiro/",
  "barbers": [
    {
      "name": "Aleffer Nunes",
      "photo": "https://leonunesbarbearia.com.br/wp-content/uploads/2024/11/s1.jpeg",
      "legacyPage": "https://leonunesbarbearia.com.br/aleffernunesagenda/",
      "services": [
        {
          "name": "CORTE DE CABELO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/corte-com-equipe-1?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget"
        },
        {
          "name": "CABELO + BARBA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget"
        },
        {
          "name": "CABELO + BARBA + SOBRANCELHA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget"
        },
        {
          "name": "CABELO + SOBRANCELHA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget"
        },
        {
          "name": "BARBA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget"
        },
        {
          "name": "SOBRANCELHA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget"
        },
        {
          "name": "HIDRATAÇÃO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget"
        },
        {
          "name": "LIMPEZA FACIAL",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget"
        }
      ]
    },
    {
      "name": "Hélio Victor",
      "photo": "https://leonunesbarbearia.com.br/wp-content/uploads/2024/11/s3.jpeg",
      "legacyPage": "https://leonunesbarbearia.com.br/heliovictoragenda/",
      "services": [
        {
          "name": "CORTE DE CABELO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/corte-com-equipe-1?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "CABELO + BARBA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "CABELO + SOBRANCELHA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "BARBA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "CABELO + BARBA + SOBRANCELHA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "SOBRANCELHA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "HIDRATAÇÃO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "LIMPEZA FACIAL",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "PENTEADO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/penteado?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        },
        {
          "name": "BOTOX",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/botox?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget"
        }
      ]
    },
    {
      "name": "Guilherme Oliveira",
      "photo": "https://leonunesbarbearia.com.br/wp-content/uploads/2026/04/gui-e1777120109563.jpeg",
      "legacyPage": "https://leonunesbarbearia.com.br/guilhermeagenda/",
      "services": [
        {
          "name": "CORTE DE CABELO",
          "bookingUrl": "https://wix.to/2I5cgLC"
        },
        {
          "name": "CABELO + BARBA",
          "bookingUrl": "https://wix.to/KbvPXny"
        },
        {
          "name": "CABELO + BARBA + SOBRANCELHA",
          "bookingUrl": "https://wix.to/lHygBj0"
        },
        {
          "name": "CABELO + SOBRANCELHA",
          "bookingUrl": "https://wix.to/gWTv5wh"
        },
        {
          "name": "BARBA",
          "bookingUrl": "https://wix.to/SQa8obM"
        },
        {
          "name": "SOBRANCELHA",
          "bookingUrl": "https://wix.to/TMp5QmM"
        },
        {
          "name": "HIDRATAÇÃO",
          "bookingUrl": "https://wix.to/eY7WEYe"
        },
        {
          "name": "LIMPEZA FACIAL",
          "bookingUrl": "https://wix.to/LpILH2Q"
        }
      ]
    },
    {
      "name": "Léo Nunes",
      "photo": "https://leonunesbarbearia.com.br/wp-content/uploads/2024/11/s2-1.jpeg",
      "legacyPage": "https://leonunesbarbearia.com.br/leonunesagenda/",
      "services": [
        {
          "name": "CORTE COM LÉO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/corte-com-leo-1?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "CABELO + BARBA COM LÉO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "CABELO + BARBA + SOBRANCELHA COM LÉO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "CABELO + SOBRANCELHA COM LÉO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "BARBA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "SOBRANCELHA",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "HIDRATAÇÃO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "PENTEADO",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/penteado?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "LIMPEZA FACIAL",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        },
        {
          "name": "BOTOX",
          "bookingUrl": "https://www.leonunesbarbearia.com/booking-calendar/botox?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget"
        }
      ]
    }
  ]
}
```

### Tratamento de dados inconsistentes
- No HTML antigo de Hélio, o serviço `CABELO + BARBA + SOBRANCELHA` apareceu duas vezes: um link era `http://c/` (INVÁLIDO). A fonte de dados acima mantém apenas o link completo correto. Não renderizar duplicidade nem link inválido.
- Existem 36 serviços únicos válidos no conjunto: Léo 10, Hélio 10, Aleffer 8, Guilherme 8. Testar contagens e ausência de URLs vazias.
- Os HTMLs são snapshots: conferir disponibilidade/atualidade dos links; se algum Wix URL não abrir, registrar exatamente qual link falhou e pedir confirmação ao responsável, sem inventar redirecionamentos. NÃO efetivar reservas de teste sem autorização.
- Valores de serviços, fotos extras, depoimentos e horários não confirmados não devem ser publicados como fatos atualizados.

## 4. IMPLEMENTAÇÃO TÉCNICA

- Prioridade: `Next.js` com App Router, TypeScript e Tailwind CSS, escolhendo versões estáveis compatíveis com o ambiente, sem fixar versões obsoletas. Evitar bibliotecas desnecessárias. Escolher outra stack só se houver motivo técnico convincente e documentar.
- Componentização reutilizável para header, footer, service-card, barber-card, breadcrumbs, CTA, containers, seções, navegação, mobile menu. Tipagem clara e dados separados da apresentação.
- Layout inteiramente responsivo (320, 360, 390, 768, 1024, 1440 e 1920px), sem rolagem horizontal, sem texto cortado, botões com área de toque confortável.
- Performance real: fontes otimizadas, imagens otimizadas, lazy loading abaixo da dobra, imagem principal prioritária, poucas dependências, imagens com dimensão, animações CSS leves, nenhuma tela de loading bloqueante desnecessária.
- Motion sutil, scroll reveal opcional com respeito a `prefers-reduced-motion`. Nada que prejudique CLS, interação ou leitura.
- Acessibilidade: semântica HTML5, apenas um H1 por página, imagens alt, navegação por teclado, foco visível, contraste WCAG AA, `aria` correto no menu, botões como botões/links conforme ação.
- SEO local: metadados distintos, `title` e `description` reais para home e cada barbeiro, canonical correto de acordo com domínio de produção, Open Graph com imagem real, robots/sitemap, schema JSON-LD `BarberShop`/`LocalBusiness` conforme dados comprovados; não colocar avaliações falsas.
- Links externos com segurança apropriada (`rel="noopener noreferrer"` se `target="_blank"`); `tel:`, WhatsApp e rota do Maps testados.
- Preparar para deploy, mas não migrar DNS/site ativo por conta própria. Esclarecer processo de corte quando o domínio apontar para a nova hospedagem.
- Não implementar cadastro fictício, pagamento fictício, calendário próprio, disponibilidade simulada, integração falsa de WhatsApp ou avaliações inventadas.

## 5. CHECKLIST DE QUALIDADE / ACEITE

1. `npm install` e `npm run build` completos, corrigir erros encontrados. Se houver lint/testes, executar e corrigir. Registrar o que foi executado.
2. Navegar `home → agendar → cada um dos 4 profissionais → serviço` e conferir que cada CTA aponta para a URL exata do JSON, mantendo o `resource` / atalho Wix correto.
3. Automatizar, se viável, teste de integridade dos 36 links (verificação sintática e correspondência ao arquivo de dados) e clique via Playwright; testar redirecionamento/HTTP quando o ambiente permitir, sem afirmar que reserva foi concluída.
4. Conferir imagens da equipe, logo, menu, navegação, anchors, links externos e o telefone.
5. Conferir versões mobile e desktop, layout, contraste, posicionamento das imagens, largura e espaçamentos.
6. Criar `README.md` profissional: comandos, arquitetura, rotas, como trocar fotos, serviços, preços e URLs, limitações do agendamento externo, instruções de deploy/URLs legadas e validação antes de publicar.
7. Entregar projeto funcional, sem TODOs essenciais, botões falsos, links `#` sem função, telas vazias, mocks de horários, recursos inexistentes ou rotas quebradas.

## 6. ENTREGA / RESUMO DE CONCLUSÃO

Ao terminar, apresentar: (i) resumo do que foi implementado, (ii) rotas disponíveis, (iii) confirmação da origem de dados (36 opções), (iv) testes executados e resultado real, (v) questões que exigem confirmação do proprietário, especialmente links externos/preços/fotos/horários, (vi) URL do repositório e hash do commit caso o push tenha funcionado. Não dizer que fez deploy do site público sem realmente ter deployado.

## 7. GIT/GITHUB — PASSO FINAL OBRIGATÓRIO

**NO FINAL DO TRABALHO**, depois de implementar, revisar e testar, publicar todo o código no repositório que eu determinei:

`https://github.com/wesleynunesc1/Leo-Nunes-Barbearia.git`

Executar os comandos apropriados no terminal do projeto, verificando estado atual, arquivos ignorados e histórico. Exemplo se for um repositório novo sem `origin`:

```bash
git init
git add .
git commit -m "feat: novo site premium Leo Nunes Barbearia"
git branch -M main
git remote add origin https://github.com/wesleynunesc1/Leo-Nunes-Barbearia.git
git push -u origin main
```

Se `origin` já existir, **não** repetir `git remote add origin` cegamente: verificar `git remote -v` e atualizar apenas se for o repositório solicitado. Se `main` remoto tiver commits, buscar/inspecionar e integrar com segurança antes de enviar, sem sobrescrever trabalho existente. Não usar `--force`, não apagar histórico, não commitar `.env`, chaves, credenciais ou arquivos sensíveis. Criar `.gitignore` correto para stack e assets gerados. Se Git pedir autenticação ou der erro de permissão, explicar o bloqueio e deixar o repositório local pronto; jamais afirmar um push que não ocorreu.

**Minha solicitação explícita é que, se houver acesso e autenticação autorizados, você finalize com o push na branch `main` — incluindo especificamente `git remote add origin https://github.com/wesleynunesc1/Leo-Nunes-Barbearia.git` (quando necessário) e `git push -u origin main`. Não apenas explique como fazer: execute e reporte o resultado real.**


Comandos finais solicitados (executar se aplicáveis, com acesso autorizado e após revisar `git remote -v`):

```bash
git remote add origin https://github.com/wesleynunesc1/Leo-Nunes-Barbearia.git
git push -u origin main
```
