export interface BarberService {
  id: string;
  name: string;
  category: "cabelo" | "barba" | "combo" | "tratamento";
  bookingUrl: string;
  description?: string;
}

export interface Barber {
  id: string;
  slug: "leo-nunes" | "aleffer-nunes" | "helio-victor" | "guilherme-oliveira";
  name: string;
  role: string;
  tagline: string;
  photo: string;
  legacyPage: string;
  services: BarberService[];
}

export const BARBERS: Barber[] = [
  {
    id: "leo-nunes",
    slug: "leo-nunes",
    name: "Léo Nunes",
    role: "Fundador & Master Barber",
    tagline: "Especialista em visagismo, cortes de precisão e acabamentos de alta definição.",
    photo: "/images/barbers/leo-nunes.jpeg",
    legacyPage: "https://leonunesbarbearia.com.br/leonunesagenda/",
    services: [
      {
        id: "ln-corte",
        name: "CORTE COM LÉO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/corte-com-leo-1?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Corte personalizado com visagismo exclusivo e acabamento refinado com Léo Nunes."
      },
      {
        id: "ln-cabelo-barba",
        name: "CABELO + BARBA COM LÉO",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Experiência completa de corte de cabelo e alinhamento de barba com Léo Nunes."
      },
      {
        id: "ln-cabelo-barba-sobrancelha",
        name: "CABELO + BARBA + SOBRANCELHA COM LÉO",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Alinhamento total: cabelo, desenho de barba e sobrancelha com padrão de excelência."
      },
      {
        id: "ln-cabelo-sobrancelha",
        name: "CABELO + SOBRANCELHA COM LÉO",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Corte de precisão acompanhado de design de sobrancelha."
      },
      {
        id: "ln-barba",
        name: "BARBA",
        category: "barba",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Desenho, contorno e tratamento para sua barba com toalha quente e lâmina afiada."
      },
      {
        id: "ln-sobrancelha",
        name: "SOBRANCELHA",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Alinhamento e limpeza dos fios com simetria natural."
      },
      {
        id: "ln-hidratacao",
        name: "HIDRATAÇÃO",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Nutrição e restauração profunda dos fios com produtos profissionais de alta performance."
      },
      {
        id: "ln-penteado",
        name: "PENTEADO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/penteado?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Finalização estilizada e fixação para eventos e ocasiões especiais."
      },
      {
        id: "ln-limpeza-facial",
        name: "LIMPEZA FACIAL",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Higienização da pele, remoção de impurezas e hidratação revigorante."
      },
      {
        id: "ln-botox",
        name: "BOTOX",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/botox?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Tratamento de alinhamento e redução de volume com reposição de massa capilar."
      }
    ]
  },
  {
    id: "aleffer-nunes",
    slug: "aleffer-nunes",
    name: "Aleffer Nunes",
    role: "Barber Professional",
    tagline: "Técnica apurada, degradês limpos e atendimento atencioso aos mínimos detalhes.",
    photo: "/images/barbers/aleffer-nunes.jpeg",
    legacyPage: "https://leonunesbarbearia.com.br/aleffernunesagenda/",
    services: [
      {
        id: "an-corte",
        name: "CORTE DE CABELO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/corte-com-equipe-1?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Corte moderno alinhado ao seu estilo com acabamento de alta qualidade."
      },
      {
        id: "an-cabelo-barba",
        name: "CABELO + BARBA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Combo essencial para renovar o visual por completo."
      },
      {
        id: "an-cabelo-barba-sobrancelha",
        name: "CABELO + BARBA + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Cuidado integral do rosto: corte de cabelo, barba alinhada e sobrancelha desenhada."
      },
      {
        id: "an-cabelo-sobrancelha",
        name: "CABELO + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Harmonia entre corte de cabelo e design de sobrancelha."
      },
      {
        id: "an-barba",
        name: "BARBA",
        category: "barba",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Contorno nítido, navalhado impecável e produtos para hidratação dos fios."
      },
      {
        id: "an-sobrancelha",
        name: "SOBRANCELHA",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Design limpo e harmônico respeitando o desenho natural."
      },
      {
        id: "an-hidratacao",
        name: "HIDRATAÇÃO",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Tratamento de condicionamento e vitalidade para cabelo e couro cabeludo."
      },
      {
        id: "an-limpeza-facial",
        name: "LIMPEZA FACIAL",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Pele renovada com esfoliação e hidratação profunda masculina."
      }
    ]
  },
  {
    id: "helio-victor",
    slug: "helio-victor",
    name: "Hélio Victor",
    role: "Barber Professional",
    tagline: "Criatividade, consistência e domínio de técnicas modernas de corte e barboterapia.",
    photo: "/images/barbers/helio-victor.jpeg",
    legacyPage: "https://leonunesbarbearia.com.br/heliovictoragenda/",
    services: [
      {
        id: "hv-corte",
        name: "CORTE DE CABELO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/corte-com-equipe-1?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Corte executado com precisão e estilo individualizado."
      },
      {
        id: "hv-cabelo-barba",
        name: "CABELO + BARBA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Visual completo com corte moderno e alinhamento milimétrico da barba."
      },
      {
        id: "hv-cabelo-sobrancelha",
        name: "CABELO + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Corte de cabelo e limpeza das sobrancelhas para um semblante leve e definido."
      },
      {
        id: "hv-barba",
        name: "BARBA",
        category: "barba",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Alinhamento e contorno preciso para valorizar suas linhas faciais."
      },
      {
        id: "hv-cabelo-barba-sobrancelha",
        name: "CABELO + BARBA + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "O combo supremo para sair com corte, barba e sobrancelhas impecáveis."
      },
      {
        id: "hv-sobrancelha",
        name: "SOBRANCELHA",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Acabamento natural e limpeza de excessos."
      },
      {
        id: "hv-hidratacao",
        name: "HIDRATAÇÃO",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Restauração da maciez e brilho natural dos fios."
      },
      {
        id: "hv-limpeza-facial",
        name: "LIMPEZA FACIAL",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Tratamento facial purificante e relaxante."
      },
      {
        id: "hv-penteado",
        name: "PENTEADO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/penteado?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Estilização com secador e pomadas de alta fixação."
      },
      {
        id: "hv-botox",
        name: "BOTOX",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/botox?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Tratamento de alinhamento com hidratação intensa e duradoura."
      }
    ]
  },
  {
    id: "guilherme-oliveira",
    slug: "guilherme-oliveira",
    name: "Guilherme Oliveira",
    role: "Barber Professional",
    tagline: "Dedicação, técnica contemporânea e agilidade sem abrir mão do conforto.",
    photo: "/images/barbers/guilherme-oliveira.jpeg",
    legacyPage: "https://leonunesbarbearia.com.br/guilhermeagenda/",
    services: [
      {
        id: "go-corte",
        name: "CORTE DE CABELO",
        category: "cabelo",
        bookingUrl: "https://wix.to/2I5cgLC",
        description: "Corte sob medida com visual atual e alinhado."
      },
      {
        id: "go-cabelo-barba",
        name: "CABELO + BARBA",
        category: "combo",
        bookingUrl: "https://wix.to/KbvPXny",
        description: "Corte de cabelo e acabamento completo de barba."
      },
      {
        id: "go-cabelo-barba-sobrancelha",
        name: "CABELO + BARBA + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://wix.to/lHygBj0",
        description: "Pacote completo com corte, barba detalhada e sobrancelhas."
      },
      {
        id: "go-cabelo-sobrancelha",
        name: "CABELO + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://wix.to/gWTv5wh",
        description: "Harmonia facial com corte de cabelo e sobrancelhas limpas."
      },
      {
        id: "go-barba",
        name: "BARBA",
        category: "barba",
        bookingUrl: "https://wix.to/SQa8obM",
        description: "Acabamento de barba com lâmina, hidratação e pós-barba refrescante."
      },
      {
        id: "go-sobrancelha",
        name: "SOBRANCELHA",
        category: "tratamento",
        bookingUrl: "https://wix.to/TMp5QmM",
        description: "Limpeza de sobrancelha com navalha e simetria."
      },
      {
        id: "go-hidratacao",
        name: "HIDRATAÇÃO",
        category: "tratamento",
        bookingUrl: "https://wix.to/eY7WEYe",
        description: "Nutrição e maciez instantânea para o cabelo."
      },
      {
        id: "go-limpeza-facial",
        name: "LIMPEZA FACIAL",
        category: "tratamento",
        bookingUrl: "https://wix.to/LpILH2Q",
        description: "Remoção de impurezas e hidratação da pele masculina."
      }
    ]
  }
];

export const TOTAL_SERVICES_COUNT = BARBERS.reduce((acc, b) => acc + b.services.length, 0);

export function getAllBarbers(): Barber[] {
  return BARBERS;
}

export function getBarberBySlug(slug: string): Barber | undefined {
  return BARBERS.find((b) => b.slug === slug);
}
