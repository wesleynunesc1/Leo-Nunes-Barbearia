# Christmas Express

Animação 2D em SVG para a faixa natalina: uma rena galopando puxa o trenó do Papai Noel (que acena), com presentes e rastro de partículas douradas, da direita para a esquerda.

- **Sem dependências** além do React (16.8+). SVG inline + CSS + Web Animations API.
- **~8,5 KB gzip** de código-fonte (JSX + CSS, sem minificar). Fundo transparente.
- Travessia de 10 s, pausa de 5 s, loop contínuo (uma única animação infinita, sem saltos).
- `pointer-events: none` — não bloqueia cliques, rolagem nem navegação.
- Pausa sozinha fora da viewport e com a aba em segundo plano.
- Respeita `prefers-reduced-motion` (cena estática ou oculta).

## Arquivos

```
christmas-express/
├─ index.js                  exportações
├─ index.d.ts                tipos (para projetos TypeScript)
├─ ChristmasExpress.jsx      componente de animação
├─ ChristmasExpress.css      estilos e keyframes (prefixo .cx-)
├─ characters/
│  ├─ Reindeer.jsx           rena (corpo, 4 pernas articuladas, cabeça, arreio)
│  ├─ SantaSleigh.jsx        trenó, Papai Noel e presentes
│  ├─ Sparkles.jsx           partículas douradas
│  └─ shared.jsx             paleta e utilitário de pivô
└─ preview.html              prévia executável (abra direto no navegador)
```

## Integração

1. Copie a pasta `christmas-express/` para o projeto, por exemplo `src/components/christmas-express/`. Nenhum arquivo existente precisa ser alterado além do ponto onde a faixa é renderizada. (`preview.html` não precisa ir junto.)

2. Envolva a faixa de cards em um contêiner com `position: relative` e renderize o componente dentro dele:

```jsx
import ChristmasExpress from './components/christmas-express';

function FaixaNatal() {
  return (
    <div style={{ position: 'relative' }}>
      <ChristmasExpress />
      <CardsStrip /> {/* a faixa de cards existente */}
    </div>
  );
}
```

O conjunto atravessa **a largura desse contêiner**. Para ele cruzar a tela de ponta a ponta, o contêiner relativo deve ter a largura total da página (os cards podem continuar em um contêiner interno com `max-width`).

3. Por padrão a animação fica logo acima da borda superior da faixa, sobrepondo levemente os cards. Reserve um respiro acima (`margin-top` ≈ altura da animação) ou ajuste a posição com `--cx-offset-y`.

### Props

| Prop            | Padrão     | Descrição                                                              |
| --------------- | ---------- | ---------------------------------------------------------------------- |
| `duration`      | `10`       | Segundos de cada travessia.                                            |
| `pause`         | `5`        | Segundos de pausa antes de recomeçar.                                  |
| `reducedMotion` | `'static'` | Com `prefers-reduced-motion`: `'static'` (cena parada) ou `'hide'`.    |
| `className`     | —          | Classe extra no elemento raiz.                                         |
| `style`         | —          | Estilos/variáveis CSS no elemento raiz.                                |

### Variáveis CSS

| Variável        | Padrão                     | Descrição                                               |
| --------------- | -------------------------- | ------------------------------------------------------- |
| `--cx-height`   | `clamp(64px, 13vw, 136px)` | Altura do conjunto (responsiva: mobile → desktop).      |
| `--cx-offset-y` | `-88%`                     | Posição vertical: `0%` = dentro da faixa, alinhado ao topo; `-100%` = totalmente acima. |
| `--cx-z`        | `5`                        | `z-index` do overlay.                                   |
| `--cx-stride`   | `0.56s`                    | Duração de uma passada da rena.                         |

```jsx
<ChristmasExpress style={{ '--cx-height': '110px', '--cx-offset-y': '-70%', '--cx-z': 20 }} />
```

### Observações por stack

- **Vite / CRA**: funciona como está (o componente importa o próprio CSS).
- **Next.js (App Router)**: adicione `'use client';` na primeira linha de `ChristmasExpress.jsx`. Se o projeto não permitir importar CSS global de dentro de componentes (Pages Router), remova a linha `import './ChristmasExpress.css'` e importe o CSS em `_app`.
- **TypeScript**: os tipos estão em `index.d.ts`; é preciso `allowJs: true` no `tsconfig`, ou renomeie os `.jsx` para `.tsx`.
- **Só no período de Natal**: `{isNatal && <ChristmasExpress />}`.

## Como funciona

- **Travessia**: a pista (`.cx-track`) tem a largura do contêiner + a do conjunto e recebe um único `element.animate()` infinito de `translate3d(0)` a `translate3d(-100%)`, com o trecho final do ciclo parado fora da tela (a pausa). Só `transform` é animado, sem medir nada em JS; redimensionar a janela não causa saltos.
- **Ciclos internos**: galope (coxa + canela em cada perna, defasadas), oscilação do corpo, cabeça, orelha, cauda, guizo, balanço do trenó, aceno e partículas são keyframes CSS dentro do SVG.
- **Pausa**: um `IntersectionObserver` e o evento `visibilitychange` pausam a travessia e alternam `data-playing` no elemento raiz, que pausa os keyframes.
- **Movimento reduzido**: nenhuma animação é criada; a cena aparece parada à direita, sem partículas (ou não é renderizada com `reducedMotion="hide"`).

## Personalização

- Cores: objeto `P` em `characters/shared.jsx`.
- Quantidade, tamanho e alcance das partículas: lista `TRAIL` em `characters/Sparkles.jsx`.
- Os personagens também são exportados separadamente (`Reindeer`, `SantaSleigh`, `Sparkles`) para uso dentro de um `<svg viewBox="0 0 760 200">`.

## Compatibilidade

Chrome/Edge 84+, Firefox 75+, Safari 13.1+ (Web Animations API). Em navegadores sem `element.animate`, a animação simplesmente não aparece.
