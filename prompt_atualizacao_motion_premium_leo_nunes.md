# PROMPT MESTRE — ATUALIZAÇÃO DE MOTION DESIGN PREMIUM | LÉO NUNES BARBEARIA

## CONTEXTO E MISSÃO

Você é um **diretor de arte digital, motion designer e engenheiro frontend sênior** especializado em sites autorais de alto padrão, motion systems e landing pages de grandes experts. Você já está trabalhando no projeto existente da **Léo Nunes Barbearia**, publicado em `leonunesbarbearia.vercel.app` e versionado em `https://github.com/wesleynunesc1/Leo-Nunes-Barbearia.git`.

**ESTA É UMA ATUALIZAÇÃO DO SITE EXISTENTE, NÃO UM PROJETO NOVO.** Não recrie o repositório, não substitua a arquitetura sem necessidade e não apague componentes ou dados atuais. Preserve todo o conteúdo, as rotas, os profissionais, as fotos oficiais e o sistema de agendamento. Seu trabalho é executar uma **evolução profunda da direção de arte e das interações**, com acabamento de site feito manualmente por um estúdio premium.

O site atual está organizado e funciona como base, porém ainda apresenta uma estética excessivamente estática e repetitiva, semelhante à de um dashboard ou template genérico. Quero que ele tenha **ritmo visual, profundidade, storytelling de scroll, tipografia animada, transições entre seções, detalhes no ponteiro e microinterações exclusivas**. Cada efeito deve ter intenção, fluidez e consistência.

## 1. REFERÊNCIAS QUE DEVEM ORIENTAR O TRABALHO

Foram estudados os HTMLs destas referências:

1. **Easy Builder** — header translúcido e responsivo ao scroll; profundidade na hero; movimento orbital e detalhes luminosos; trilhas horizontais contínuas; uso de GSAP/ScrollTrigger identificado nas dependências.
2. **Gabriel Juste — Marketing Digital** — títulos revelados por linha por GSAP/ScrollTrigger/SplitText e `clip-path`, incluindo uma faixa que varre cada linha; um elemento decorativo que acompanha o mouse suavemente com `requestAnimationFrame` e evita cobrir textos; entradas de seção por direção.
3. **Gestão Criativa — Gabriel Juste** — grupos entrando pelo lado esquerdo/direito e por baixo, faixas contínuas, navegação que muda de estado com o scroll e composição de elementos decorativos flutuantes.
4. **Insta Criativo** — Lenis para suavização opcional de rolagem, Swiper com apresentação parcial do próximo slide, carrosséis contínuos e efeitos de aparição no scroll. Existe lógica de cuidado com desempenho.
5. **LPage** — entradas `fadeInDown`, `fadeInLeft` e por rolagem; movimento horizontal ligado ao scroll; Swiper centralizado adaptativo e header contextual.

**Não copie marca, layout, imagens, textos, fontes comerciais, scripts privados ou códigos proprietários dessas referências.** Crie uma solução original inspirada nos princípios de movimento e acabamento. Os HTMLs salvos podem não conter todos os scripts externos; não presuma que um efeito tenha sido tecnicamente confirmado quando só houver indícios.

## 2. IDENTIDADE VISUAL — REGRA ABSOLUTA

A identidade da Léo Nunes Barbearia tem somente **verde, preto e branco**.

- Preto profundo de referência: `#080A08`.
- Branco principal: `#FFFFFF`.
- Verde atualmente usado no conceito: `#25C440` (valide-o contra os tokens/assets oficiais do projeto e utilize a variante oficial, se diferente).
- Tons secundários devem ser apenas variações neutras de preto, branco e transparência dessas cores.
- **Nenhum azul, laranja, amarelo, roxo, rosa ou outras cores em tags, ícones, botões, hovers, bordas, gradientes e sombras.**
- Evite neon e brilho excessivo. O verde é um detalhe distintivo, não um preenchimento indiscriminado.
- Preserve a logomarca oficial e a família Montserrat, se já adotada.
- Não invente depoimentos, dados, premiações, certificações, preços ou disponibilidade.

A linguagem visual deve ser **cinematográfica, editorial, masculina, minimalista e autoral**, valorizando fotografias reais de cortes, navalha, acabamento e ambiente.

## 3. CRIE UM DESIGN SYSTEM DE MOVIMENTO, NÃO EFEITOS ISOLADOS

Antes de alterar componentes, defina tokens e uma biblioteca pequena e reutilizável de motion:

- **Microinterações:** 160–280 ms.
- **Entrada de conteúdo:** 550–850 ms.
- **Animações de título:** 650–1000 ms por conjunto, com `stagger` de 80–160 ms.
- **Transições entre blocos:** 650–1000 ms, sem atrasar a leitura.
- **Deslocamento de reveal:** normalmente 16–32 px; limites maiores somente onde houver motivo editorial.
- **Hover de cartões:** deslocamento de até 4–6 px, escala máxima por volta de 1.015–1.025.
- **Parallax:** pequeno e contido, somente em imagens decorativas; não mova CTAs, formulários ou textos essenciais de forma que prejudique a leitura.
- **Curvas:** `power3.out`, `expo.out` ou equivalentes cúbicas suaves; evite bouncing cartunesco.
- **Stagger:** distribuído conforme a leitura, nunca cada elemento de forma aleatória.

Organize as animações em utilitários/componentes reutilizáveis e centralize valores de duração, distância, easing e breakpoints. Evite duplicação de observers, listeners e timelines.

## 4. HEADER — MOVIMENTO REFINADO

Atualize a navegação desktop e mobile:

- No topo, header discreto e bem integrado à hero.
- Após rolar, aplicar **transição suave** para um estado compacto, fundo preto translúcido e `backdrop-filter: blur(...)` moderado, borda branca sutil e sombra controlada.
- Animação de aproximadamente 250–400 ms; sem saltos de layout.
- Nos links, criar indicador ativo/hover que se desloca suavemente ou underline que cresce de maneira elegante. Não usar glow ostensivo.
- CTA `Agendar Horário` sempre fácil de encontrar, sem encobrir conteúdo.
- No mobile, menu de abertura/fechamento fluida, acessível, com backdrop discreto, travamento correto de rolagem somente enquanto o menu estiver aberto e retorno de foco.
- O header **não pode tremer** durante o scroll, interferir no clique nem mudar de altura continuamente.

## 5. HERO — PRIMEIRA DOBRA CINEMATOGRÁFICA

Mantenha a assinatura textual da página atual:

**SEU ESTILO. / NOSSA ASSINATURA.**

Recrie a sensação da hero, sem reinventar a copy. Exigências:

- Fotografia real da barbearia/corte com presença suficiente, contraste controlado e enquadramento responsivo; não deixe o fundo quase preto a ponto de a foto desaparecer.
- Criar sequência de entrada **coreografada**: marca/navegação, pequeno texto superior, primeira linha da headline, segunda linha com destaque verde, subtítulo, botões e detalhes finais.
- O principal efeito deve ser **reveal de título por linha**: texto mascarado por `overflow:hidden`/`clip-path`, entrada vertical sutil e, opcionalmente, uma faixa verde que percorre o texto uma única vez. Evitar que a faixa cubra o texto por tempo excessivo.
- Animação executada apenas na primeira exposição, respeitando o estado de navegação e `prefers-reduced-motion`.
- Leve movimento de profundidade em uma camada fotográfica no desktop, sem deslocamento grande e sem `background-attachment: fixed` no mobile.
- Botão verde com microinteração de elevação e seta deslocando 2–4 px no hover; clique deve continuar imediato.
- Detalhe pequeno de orientação para scroll, com animação discreta e removido/reduzido no mobile.
- Respeitar o LCP: nunca atrasar o conteúdo acima da dobra para carregar uma biblioteca ou executar uma intro longa.

## 6. INTERAÇÃO COM O MOUSE — IDENTIDADE PRÓPRIA

Inspirar-se na lógica de seguimento suave do Gabriel Juste, mas criar uma assinatura autoral para a Léo Nunes:

- Em **um único ponto do site** — preferencialmente uma área editorial da hero ou Experiência — usar um elemento decorativo discreto (por exemplo, reflexo localizado, uma linha de precisão ou detalhe gráfico relacionado a corte).
- O movimento reage ao ponteiro com interpolação suave via `requestAnimationFrame` ou mecanismo equivalente; intensidade de poucos pixels.
- Não substituir o cursor padrão, não mostrar desenhos grandes seguindo o mouse e não encobrir headline, fotos, CTAs nem controles.
- Restrinja a dispositivos com `hover: hover` e `pointer: fine`.
- Desative para `prefers-reduced-motion`, baixa performance, telas touch e quando a aba estiver inativa. Limpe `requestAnimationFrame` e listeners ao desmontar.
- Opcional: leve efeito de spotlight verde transparente em **alguns** cartões de serviço/equipe, vinculado à posição do mouse, sem poluição visual.

## 7. SCROLL REVEAL — RITMO ENTRE SEÇÕES

Implemente um sistema de revelação consistente, inspirado nas classes `scroll-left`, `scroll-right`, `scroll-bottom` e no GSAP/ScrollTrigger observado nas referências:

- Títulos entram por máscara ou por `translateY` leve + opacidade.
- Subtítulos e descrições entram em seguida, não simultaneamente com todos os elementos.
- Cartões entram em sequência (stagger) ao alcançar cerca de 75–85% da altura visível.
- Seções com fotografia podem ter `clip-path` que abre gradualmente, escala controlada de 1.04 para 1.00 ou reveal lateral.
- Preserve contraste, leitura e estabilidade: nada deve ficar permanentemente invisível caso JS falhe, navegação volte do cache, hidratação atrase ou o usuário role muito rápido.
- Não acrescente reveal a cada parágrafo, cada preço e cada informação trivial. Faça uma seleção editorial consciente.
- Evite scrub pesado em conteúdos essenciais. Não bloqueie o scroll natural e evite seções `pin` sem motivo.

## 8. SEÇÃO SERVIÇOS — SOFISTICAÇÃO SEM DASHBOARD

O layout deve se afastar de cartões SaaS repetitivos:

- Refinar geometria, tipografia, proporções e hierarquia dos blocos existentes.
- Entradas em sequência, com detalhes verdes precisos.
- Hover desktop: elevação discreta, mudança suave da borda, ícone levemente animado e eventual highlight que acompanha o ponteiro.
- Não usar tilt 3D intenso, flipping cards ou ações escondidas apenas no hover.
- No mobile, sempre mostrar as informações e CTAs sem depender do hover.
- Manter os links para escolha do profissional e os textos verdadeiros.

## 9. EQUIPE — PRIORIDADE MÁXIMA NO MOBILE

Preserve os quatro profissionais com **fotografias oficiais**: Léo Nunes, Aleffer Nunes, Hélio Victor e Guilherme Oliveira.

**Desktop**:
- Grid de quatro cartões, com tamanho/proporção padronizados.
- Revelação fotográfica refinada por máscara + `stagger` quando a seção entrar no viewport.
- No hover, leve aproximação da fotografia, overlay escuro sutil e destaque verde no nome/CTA; nunca corte o rosto inadequadamente.

**Página inicial no mobile — CARROSSEL OBRIGATÓRIO**:
- Um cartão inteiro em destaque e cerca de 10%–15% do próximo visível.
- Swipe natural com inércia, snap correto, suporte a arrastar e indicadores acessíveis.
- Usar Embla Carousel, Swiper já presente ou solução nativa equivalente que se integre ao projeto, sem bibliotecas duplicadas.
- Sem autoplay obrigatório, sem arrastar a página inteira lateralmente, sem cartões semitransparentes ilegíveis.
- Nomes e botões sempre visíveis; imagem com proporção uniforme e enquadramento preservado.
- Ao clicar `Ver serviços e horários`, navegar para o profissional escolhido no **novo site**, preservando a seleção e suas opções.
- Controle via teclado e toque; suporte excelente ao Safari iOS.

**Página de escolha de barbeiros**: todos os quatro precisam continuar fáceis de encontrar, preferencialmente sem carrossel obrigatório, para reduzir fricção no agendamento.

## 10. COMO FUNCIONA O AGENDAMENTO — CONEXÃO ENTRE ETAPAS

A seção de passos deve aparecer de forma sequencial quando rolar, com números e linha conectiva discreta que progride visualmente. São três etapas:

1. Escolher o barbeiro.
2. Selecionar o serviço.
3. Abrir o calendário oficial para escolher data e horário.

Não simule disponibilidade em tempo real sem integração. A linha/animacão é apenas explicativa; a navegação real continua direta.

## 11. EXPERIÊNCIA — SEÇÃO EDITORIAL COM PROFUNDIDADE

Esta seção deve ser uma das mais refinadas:

- Combine fotografias reais em tamanhos assimétricos, texto bem diagramado e bastante respiro.
- Uma foto pode revelar-se por máscara e outra ter parallax vertical limitado durante a rolagem.
- Pequenos detalhes gráficos podem aparecer em sequência com títulos e descrição.
- Evite sobrecarregar tudo com o mesmo efeito.
- No mobile, simplifique a composição para priorizar fotografia, leitura e CTA; não aplique parallax pesado.

## 12. LOCALIZAÇÃO E RODAPÉ

- Revele conteúdo de endereço e horários de forma sutil.
- O mapa permanece funcional e interativo: não cubra com overlay que bloqueie interação; ofereça link claro para abrir rota.
- No rodapé, entrada discreta dos grupos de navegação, sem animações que atrasem cliques.
- Ajuste posicionamento do botão de WhatsApp: nunca sobrepor CTAs, filtros ou cartões, em nenhuma resolução.

## 13. PÁGINAS INTERNAS E AGENDAMENTO — FUNCIONALIDADE INTOCÁVEL

**Preserve 100% do fluxo existente:** página inicial → escolher barbeiro → escolher serviço → calendário externo.

- Não remova nem substitua os **36 links válidos de serviço** que já estão no projeto.
- Não altere os parâmetros `resource`, `referral` nem links `wix.to` ou URLs completas Wix existentes.
- Não invente preços, horários ou agenda própria.
- Não troque um link específico de barbeiro por um genérico.
- Respeite as páginas e seus filtros atuais.
- Deixe as páginas internas **mais rápidas e funcionais do que a homepage**: poucas animações, nomes e serviços visíveis rapidamente, interações claras.
- Transição de página sutil (fade/translate de aproximadamente 150–250 ms) apenas quando não atrasar a ação e não prejudicar browser back/forward; nunca use transições prolongadas antes de links externos de agendamento.
- Elimine duplicações e links inválidos, como o antigo `http://c/`, sem substituir URLs válidas.

## 14. IMPLEMENTAÇÃO FRONTEND

Inspecione a stack atual antes de decidir bibliotecas. Não migre framework sem justificativa.

- Para motion de scroll, **prefira GSAP + ScrollTrigger** se fizer sentido com a stack; para microinterações simples, CSS bem escrito.
- Para animações por linhas, use uma abordagem acessível que preserve o título semântico e funcione em quebra responsiva; **não assuma licença de GSAP SplitText** nem copie código das referências. Use solução licenciada adequadamente ou alternativa compatível.
- Lenis é **opcional**, não obrigatório: se for usado, limitar a desktop com mouse/roda e verificar compatibilidade com ScrollTrigger. Preserve scroll nativo no mobile, teclado, anchors e calendário. Não crie dois controladores conflitantes de rolagem.
- Reutilize a biblioteca de carrossel existente; evite múltiplas bibliotecas pesadas para o mesmo trabalho.
- Inicialize animações apenas no client quando necessário, usando integração segura para SSR/Next.js caso este seja o framework atual.
- Limpe triggers, timelines, listeners, observers e animações desmontadas. Evite animações disparadas repetidamente a cada render.
- Prefira `transform` e `opacity`; evite animar `top/left`, filtros pesados e `box-shadow` de grande área a cada frame.
- Use `will-change` apenas em componentes específicos e durante as animações, não globalmente.
- Não importe pixels de marketing, rastreadores, scripts externos proprietários ou recursos de terceiros dos HTMLs de referência.
- Aplique lazy loading e dimensionamento responsivo corretamente, sem sacrificar a imagem LCP.

## 15. ACESSIBILIDADE, PERFORMANCE E RESPONSIVIDADE

- Respeitar `prefers-reduced-motion: reduce` com alternativa sem movimento e conteúdo sempre acessível.
- Respeitar `pointer: coarse` e conexões/dispositivos mais limitados: redução de efeitos de cursor, parallax e scroll suave.
- Sem interferir em seleção de texto, foco, teclado, leitores de tela e controles do formulário.
- Todos os botões funcionais com área tocável confortável (em torno de 44–48 px).
- Zero rolagem horizontal acidental em `320`, `360`, `375`, `390`, `430`, `768`, `1024`, `1440` e `1920` px.
- Títulos nunca cortados durante reveal em mudanças de quebra de linha/orientação.
- Nenhum CLS perceptível por imagens ou elementos animados; reservar espaço antes do carregamento.
- Buscar LCP até 2,5 s, INP até 200 ms e CLS até 0,1 nas condições mensuradas, sem prometer números sem medições reais.
- Não adicionar animações infinitas simultâneas em grande quantidade.
- Não bloquear a interação enquanto a animação roda; evitar telas de loading desnecessárias.

## 16. AUDITORIA E CRITÉRIOS DE ACEITE

ANTES de escrever código: analise o projeto, identifique os componentes atuais, rotas, CSS e animações existentes. Apresente internamente um mapa de quais seções exigem mudança, evitando trabalho duplicado.

DEPOIS de implementar:

1. Validar homepage em desktop e mobile.
2. Validar todas as interações de menu, scroll, CTA, filtros e WhatsApp.
3. Validar o carrossel mobile com toque, swipe, teclado e diferentes larguras.
4. Validar quatro páginas de profissionais e os 36 links de serviços **sem alterar suas URLs**; relatar links externos não verificáveis em vez de presumir que funcionam.
5. Testar usuários com preferência por redução de movimento.
6. Testar emulação iPhone/Android e navegadores modernos; se Playwright estiver disponível, automatizar capturas e navegação.
7. Rodar lint, typecheck, build e testes existentes, corrigindo falhas provocadas pelas alterações.
8. Documentar animações implementadas por seção, bibliotecas adicionadas, efeitos desabilitados no mobile e pontos eventualmente pendentes.

**Rejeitar a entrega se:** parecer template SaaS; possuir animações exageradas ou repetidas; apresentar cores extras; tiver título cortado; parallax travado; carrossel desalinhado; CTA escondido; conflitos de scroll; desempenho ruim; qualquer link de reserva alterado incorretamente; ou se a implementação for apenas troca de classes sem resultado visual perceptível.

## 17. VERSIONAMENTO E PUBLICAÇÃO

Após implementar e validar, publicar a atualização **no repositório já existente**:

`https://github.com/wesleynunesc1/Leo-Nunes-Barbearia.git`

Verifique `git status`, branch atual e `git remote -v`. Preserve o histórico e mudanças preexistentes. Se o remoto `origin` não estiver configurado, use:

```bash
git remote add origin https://github.com/wesleynunesc1/Leo-Nunes-Barbearia.git
```

Se já existir, não tente adicioná-lo novamente. Prepare o commit **somente dos arquivos relevantes** e publique na branch `main` usando o fluxo correto do repositório:

```bash
git add <arquivos-modificados-do-projeto>
git commit -m "feat: aprimora motion design premium e interacoes responsivas"
git push -u origin main
```

Adapte os comandos ao estado real da branch e do remote. Não force push, não sobrescreva commits remotos e não inclua `.env`, tokens ou segredos. Caso haja conflito/autenticação, explique a pendência com exatidão em vez de afirmar que publicou.

## RESULTADO ESPERADO

Quero perceber a mudança **ao entrar, rolar, passar o mouse e tocar na tela**: hero cinematográfica, headline revelada com refinamento, elementos entrando com ritmo, imagens com profundidade, cards com feedback de interação, equipe em carrossel mobile e navegação elegante.

O resultado deve transmitir que cada movimento foi desenhado individualmente por um profissional experiente. **Sofisticação é intenção, não excesso.** Conclua a implementação, valide visual e tecnicamente e só então publique o código atualizado.
