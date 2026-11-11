/**
 * Configuração Central da Campanha de Fim de Ano / Natal - Leo Nunes Barbearia
 * 
 * Permite ativar ou desativar com facilidade toda a campanha natalina do site.
 * Quando desativada (ou após a data de expiração), o site retorna 100%
 * ao conteúdo e layout padrão institucional.
 */

export interface ChristmasCampaignConfig {
  /** Se a campanha está manualmente ativada */
  enabled: boolean;
  /** Data limite em formato ISO para expiração automática (Horário de Brasília/Fortaleza UTC-3) */
  autoExpireDate: string;
  /** Ano de referência da campanha */
  year: number;
  /** Textos oficiais da campanha */
  texts: {
    heroBadge: string;
    heroHeadlineLine1: string;
    heroHeadlineLine2: string;
    heroSubheadline: string;
  };
}

export const CHRISTMAS_CAMPAIGN_CONFIG: ChristmasCampaignConfig = {
  enabled: true,
  // Desativação automática a partir de 26/12/2026 00:00 (UTC-3)
  autoExpireDate: "2026-12-26T00:00:00-03:00",
  year: 2026,
  texts: {
    heroBadge: "ESPECIAL DE FIM DE ANO",
    heroHeadlineLine1: "O ANO TERMINA.",
    heroHeadlineLine2: "SEU ESTILO NÃO.",
    heroSubheadline:
      "Entre no clima das festas com o corte em dia. Escolha seu barbeiro e garanta seu horário.",
  },
};

/**
 * Retorna true se a campanha natalina estiver ativa e dentro do prazo.
 */
export function isChristmasCampaignActive(): boolean {
  if (!CHRISTMAS_CAMPAIGN_CONFIG.enabled) {
    return false;
  }

  try {
    const expireTime = new Date(CHRISTMAS_CAMPAIGN_CONFIG.autoExpireDate).getTime();
    const nowTime = Date.now();
    return nowTime < expireTime;
  } catch {
    return CHRISTMAS_CAMPAIGN_CONFIG.enabled;
  }
}

