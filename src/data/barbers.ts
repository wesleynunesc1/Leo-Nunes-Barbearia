export interface BarberService {
  id: string;
  name: string;
  category: "cabelo" | "barba" | "combo" | "tratamento";
  bookingUrl: string;
  description?: string;
  durationMinutes: number;
  price: number;
  formattedPrice: string;
  wixServiceId?: string;
}

export interface Barber {
  id: string;
  slug: "leo-nunes" | "aleffer-nunes" | "helio-victor" | "guilherme-oliveira";
  name: string;
  role: string;
  tagline: string;
  photo: string;
  legacyPage: string;
  resourceId?: string;
  services: BarberService[];
}

export const BARBERS: Barber[] = [
  {
    id: "leo-nunes",
    slug: "leo-nunes",
    name: "Léo Nunes",
    role: "Barber Profissional",
    tagline: "Especialista em visagismo, cortes de precisão e acabamentos de alta definição.",
    photo: "/images/barbers/leo-nunes.webp",
    legacyPage: "https://leonunesbarbearia.com.br/leonunesagenda/",
    resourceId: "76570209-101f-409b-af97-b445bdb63125",
    services: [
      {
        id: "ln-corte",
        wixServiceId: "71a2e1ca-2bce-410f-8d98-a64a5225a9ab",
        name: "CORTE COM LÉO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/corte-com-leo-1?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Corte personalizado com visagismo exclusivo e acabamento refinado com Léo Nunes.",
        durationMinutes: 40,
        price: 40,
        formattedPrice: "R$ 40,00"
      },
      {
        id: "ln-cabelo-barba",
        wixServiceId: "f8b38ec2-82fe-41f6-9248-4a4913dbbd02",
        name: "CABELO + BARBA COM LÉO",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Experiência completa de corte de cabelo e alinhamento de barba com Léo Nunes.",
        durationMinutes: 60,
        price: 60,
        formattedPrice: "R$ 60,00"
      },
      {
        id: "ln-cabelo-barba-sobrancelha",
        wixServiceId: "bc1b2625-68be-49f3-beeb-a5a2108affc7",
        name: "CABELO + BARBA + SOBRANCELHA COM LÉO",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Alinhamento total: cabelo, desenho de barba e sobrancelha com padrão de excelência.",
        durationMinutes: 70,
        price: 70,
        formattedPrice: "R$ 70,00"
      },
      {
        id: "ln-cabelo-sobrancelha",
        wixServiceId: "bbb28966-e7c4-4290-8135-3db8d8d1c8b7",
        name: "CABELO + SOBRANCELHA COM LÉO",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha-com-leo?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Corte de precisão acompanhado de design de sobrancelha.",
        durationMinutes: 50,
        price: 50,
        formattedPrice: "R$ 50,00"
      },
      {
        id: "ln-barba",
        wixServiceId: "2d00c842-d8b6-4f0f-af3d-d14107bea561",
        name: "BARBA",
        category: "barba",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Desenho, contorno e tratamento para sua barba com toalha quente e lâmina afiada.",
        durationMinutes: 30,
        price: 20,
        formattedPrice: "R$ 20,00"
      },
      {
        id: "ln-sobrancelha",
        wixServiceId: "ee6ce61d-93fd-402f-8e89-dfe8b0f559d2",
        name: "SOBRANCELHA",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Alinhamento e limpeza dos fios com simetria natural.",
        durationMinutes: 15,
        price: 10,
        formattedPrice: "R$ 10,00"
      },
      {
        id: "ln-hidratacao",
        wixServiceId: "c0a10935-85ac-4296-8a02-3cb4087c2e87",
        name: "HIDRATAÇÃO",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Nutrição e restauração profunda dos fios com produtos profissionais de alta performance.",
        durationMinutes: 30,
        price: 15,
        formattedPrice: "R$ 15,00"
      },
      {
        id: "ln-penteado",
        wixServiceId: "af2c1043-0e8a-4c58-9e8b-f0ea5c41b269",
        name: "PENTEADO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/penteado?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Finalização estilizada e fixação para eventos e ocasiões especiais.",
        durationMinutes: 20,
        price: 10,
        formattedPrice: "R$ 10,00"
      },
      {
        id: "ln-limpeza-facial",
        wixServiceId: "c152abfe-01eb-4af6-b0ef-d61140ef74ef",
        name: "LIMPEZA FACIAL",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Higienização da pele, remoção de impurezas e hidratação revigorante.",
        durationMinutes: 35,
        price: 30,
        formattedPrice: "R$ 30,00"
      },
      {
        id: "ln-botox",
        wixServiceId: "72c69ddf-b07a-4016-ba45-e3559d2c458b",
        name: "BOTOX",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/botox?resource=76570209-101f-409b-af97-b445bdb63125&referral=service_list_widget",
        description: "Tratamento de alinhamento e redução de volume com reposição de massa capilar.",
        durationMinutes: 45,
        price: 55,
        formattedPrice: "R$ 55,00"
      }
    ]
  },
  {
    id: "aleffer-nunes",
    slug: "aleffer-nunes",
    name: "Aleffer Nunes",
    role: "Barber Profissional",
    tagline: "Técnica apurada, degradês limpos e atendimento atencioso aos mínimos detalhes.",
    photo: "/images/barbers/aleffer-nunes.webp",
    legacyPage: "https://leonunesbarbearia.com.br/aleffernunesagenda/",
    resourceId: "ea570fb8-8b9c-493d-af1b-437f2b7a9883",
    services: [
      {
        id: "an-corte",
        wixServiceId: "5fdf0f3a-8e3e-4009-8421-4467ef3b3871",
        name: "CORTE DE CABELO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/corte-com-equipe-1?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Corte moderno alinhado ao seu estilo com acabamento de alta qualidade.",
        durationMinutes: 35,
        price: 35,
        formattedPrice: "R$ 35,00"
      },
      {
        id: "an-cabelo-barba",
        wixServiceId: "5b84cd2e-9bcc-4281-97ff-d27bdc6ac309",
        name: "CABELO + BARBA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Combo essencial para renovar o visual por completo.",
        durationMinutes: 55,
        price: 55,
        formattedPrice: "R$ 55,00"
      },
      {
        id: "an-cabelo-barba-sobrancelha",
        wixServiceId: "27fa2a23-52e3-4897-86ed-3150f047a7a0",
        name: "CABELO + BARBA + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Cuidado integral do rosto: corte de cabelo, barba alinhada e sobrancelha desenhada.",
        durationMinutes: 65,
        price: 65,
        formattedPrice: "R$ 65,00"
      },
      {
        id: "an-cabelo-sobrancelha",
        wixServiceId: "66165be6-4510-4fe1-8cf2-00436501e0d1",
        name: "CABELO + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Harmonia entre corte de cabelo e design de sobrancelha.",
        durationMinutes: 45,
        price: 45,
        formattedPrice: "R$ 45,00"
      },
      {
        id: "an-barba",
        wixServiceId: "2d00c842-d8b6-4f0f-af3d-d14107bea561",
        name: "BARBA",
        category: "barba",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Contorno nítido, navalhado impecável e produtos para hidratação dos fios.",
        durationMinutes: 30,
        price: 20,
        formattedPrice: "R$ 20,00"
      },
      {
        id: "an-sobrancelha",
        wixServiceId: "ee6ce61d-93fd-402f-8e89-dfe8b0f559d2",
        name: "SOBRANCELHA",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Design limpo e harmônico respeitando o desenho natural.",
        durationMinutes: 15,
        price: 10,
        formattedPrice: "R$ 10,00"
      },
      {
        id: "an-hidratacao",
        wixServiceId: "c0a10935-85ac-4296-8a02-3cb4087c2e87",
        name: "HIDRATAÇÃO",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Tratamento de condicionamento e vitalidade para cabelo e couro cabeludo.",
        durationMinutes: 30,
        price: 15,
        formattedPrice: "R$ 15,00"
      },
      {
        id: "an-limpeza-facial",
        wixServiceId: "c152abfe-01eb-4af6-b0ef-d61140ef74ef",
        name: "LIMPEZA FACIAL",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=ea570fb8-8b9c-493d-af1b-437f2b7a9883&referral=service_list_widget",
        description: "Pele renovada com esfoliação e hidratação profunda masculina.",
        durationMinutes: 35,
        price: 30,
        formattedPrice: "R$ 30,00"
      }
    ]
  },
  {
    id: "helio-victor",
    slug: "helio-victor",
    name: "Hélio Victor",
    role: "Barber Profissional",
    tagline: "Criatividade, consistência e domínio de técnicas modernas de corte e barboterapia.",
    photo: "/images/barbers/helio-victor.webp",
    legacyPage: "https://leonunesbarbearia.com.br/heliovictoragenda/",
    resourceId: "9ede92c1-dc85-4536-895f-5a9ec6665612",
    services: [
      {
        id: "hv-corte",
        wixServiceId: "5fdf0f3a-8e3e-4009-8421-4467ef3b3871",
        name: "CORTE DE CABELO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/corte-com-equipe-1?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Corte executado com precisão e estilo individualizado.",
        durationMinutes: 35,
        price: 35,
        formattedPrice: "R$ 35,00"
      },
      {
        id: "hv-cabelo-barba",
        wixServiceId: "5b84cd2e-9bcc-4281-97ff-d27bdc6ac309",
        name: "CABELO + BARBA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Visual completo com corte moderno e alinhamento milimétrico da barba.",
        durationMinutes: 55,
        price: 55,
        formattedPrice: "R$ 55,00"
      },
      {
        id: "hv-cabelo-sobrancelha",
        wixServiceId: "66165be6-4510-4fe1-8cf2-00436501e0d1",
        name: "CABELO + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Corte de cabelo e limpeza das sobrancelhas para um semblante leve e definido.",
        durationMinutes: 45,
        price: 45,
        formattedPrice: "R$ 45,00"
      },
      {
        id: "hv-barba",
        wixServiceId: "2d00c842-d8b6-4f0f-af3d-d14107bea561",
        name: "BARBA",
        category: "barba",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/barba?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Alinhamento e contorno preciso para valorizar suas linhas faciais.",
        durationMinutes: 30,
        price: 20,
        formattedPrice: "R$ 20,00"
      },
      {
        id: "hv-cabelo-barba-sobrancelha",
        wixServiceId: "27fa2a23-52e3-4897-86ed-3150f047a7a0",
        name: "CABELO + BARBA + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/cabelo-barba-sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "O combo supremo para sair com corte, barba e sobrancelhas impecáveis.",
        durationMinutes: 65,
        price: 65,
        formattedPrice: "R$ 65,00"
      },
      {
        id: "hv-sobrancelha",
        wixServiceId: "ee6ce61d-93fd-402f-8e89-dfe8b0f559d2",
        name: "SOBRANCELHA",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/sobrancelha?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Acabamento natural e limpeza de excessos.",
        durationMinutes: 15,
        price: 10,
        formattedPrice: "R$ 10,00"
      },
      {
        id: "hv-hidratacao",
        wixServiceId: "c0a10935-85ac-4296-8a02-3cb4087c2e87",
        name: "HIDRATAÇÃO",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/hidrata%C3%A7%C3%A3o-1?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Restauração da maciez e brilho natural dos fios.",
        durationMinutes: 30,
        price: 15,
        formattedPrice: "R$ 15,00"
      },
      {
        id: "hv-limpeza-facial",
        wixServiceId: "c152abfe-01eb-4af6-b0ef-d61140ef74ef",
        name: "LIMPEZA FACIAL",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/limpeza-facial?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Tratamento facial purificante e relaxante.",
        durationMinutes: 35,
        price: 30,
        formattedPrice: "R$ 30,00"
      },
      {
        id: "hv-penteado",
        wixServiceId: "af2c1043-0e8a-4c58-9e8b-f0ea5c41b269",
        name: "PENTEADO",
        category: "cabelo",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/penteado?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Estilização com secador e pomadas de alta fixação.",
        durationMinutes: 20,
        price: 10,
        formattedPrice: "R$ 10,00"
      },
      {
        id: "hv-botox",
        wixServiceId: "72c69ddf-b07a-4016-ba45-e3559d2c458b",
        name: "BOTOX",
        category: "tratamento",
        bookingUrl: "https://www.leonunesbarbearia.com/booking-calendar/botox?resource=9ede92c1-dc85-4536-895f-5a9ec6665612&referral=service_list_widget",
        description: "Tratamento de alinhamento com hidratação intensa e duradoura.",
        durationMinutes: 45,
        price: 55,
        formattedPrice: "R$ 55,00"
      }
    ]
  },
  {
    id: "guilherme-oliveira",
    slug: "guilherme-oliveira",
    name: "Guilherme Oliveira",
    role: "Barber Profissional",
    tagline: "Dedicação, técnica contemporânea e agilidade sem abrir mão do conforto.",
    photo: "/images/barbers/guilherme-oliveira.webp",
    legacyPage: "https://leonunesbarbearia.com.br/guilhermeagenda/",
    resourceId: "106d620c-2150-4558-98bb-ad2777bd32e3",
    services: [
      {
        id: "go-corte",
        wixServiceId: "5fdf0f3a-8e3e-4009-8421-4467ef3b3871",
        name: "CORTE DE CABELO",
        category: "cabelo",
        bookingUrl: "https://wix.to/2I5cgLC",
        description: "Corte sob medida com visual atual e alinhado.",
        durationMinutes: 35,
        price: 35,
        formattedPrice: "R$ 35,00"
      },
      {
        id: "go-cabelo-barba",
        wixServiceId: "5b84cd2e-9bcc-4281-97ff-d27bdc6ac309",
        name: "CABELO + BARBA",
        category: "combo",
        bookingUrl: "https://wix.to/KbvPXny",
        description: "Corte de cabelo e acabamento completo de barba.",
        durationMinutes: 55,
        price: 55,
        formattedPrice: "R$ 55,00"
      },
      {
        id: "go-cabelo-barba-sobrancelha",
        wixServiceId: "27fa2a23-52e3-4897-86ed-3150f047a7a0",
        name: "CABELO + BARBA + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://wix.to/lHygBj0",
        description: "Pacote completo com corte, barba detalhada e sobrancelhas.",
        durationMinutes: 65,
        price: 65,
        formattedPrice: "R$ 65,00"
      },
      {
        id: "go-cabelo-sobrancelha",
        wixServiceId: "66165be6-4510-4fe1-8cf2-00436501e0d1",
        name: "CABELO + SOBRANCELHA",
        category: "combo",
        bookingUrl: "https://wix.to/gWTv5wh",
        description: "Harmonia facial com corte de cabelo e sobrancelhas limpas.",
        durationMinutes: 45,
        price: 45,
        formattedPrice: "R$ 45,00"
      },
      {
        id: "go-barba",
        wixServiceId: "2d00c842-d8b6-4f0f-af3d-d14107bea561",
        name: "BARBA",
        category: "barba",
        bookingUrl: "https://wix.to/SQa8obM",
        description: "Acabamento de barba com lâmina, hidratação e pós-barba refrescante.",
        durationMinutes: 30,
        price: 20,
        formattedPrice: "R$ 20,00"
      },
      {
        id: "go-sobrancelha",
        wixServiceId: "ee6ce61d-93fd-402f-8e89-dfe8b0f559d2",
        name: "SOBRANCELHA",
        category: "tratamento",
        bookingUrl: "https://wix.to/TMp5QmM",
        description: "Limpeza de sobrancelha com navalha e simetria.",
        durationMinutes: 15,
        price: 10,
        formattedPrice: "R$ 10,00"
      },
      {
        id: "go-hidratacao",
        wixServiceId: "c0a10935-85ac-4296-8a02-3cb4087c2e87",
        name: "HIDRATAÇÃO",
        category: "tratamento",
        bookingUrl: "https://wix.to/eY7WEYe",
        description: "Nutrição e maciez instantânea para o cabelo.",
        durationMinutes: 30,
        price: 15,
        formattedPrice: "R$ 15,00"
      },
      {
        id: "go-limpeza-facial",
        wixServiceId: "c152abfe-01eb-4af6-b0ef-d61140ef74ef",
        name: "LIMPEZA FACIAL",
        category: "tratamento",
        bookingUrl: "https://wix.to/LpILH2Q",
        description: "Remoção de impurezas e hidratação da pele masculina.",
        durationMinutes: 35,
        price: 30,
        formattedPrice: "R$ 30,00"
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

export function getBarberById(id: string): Barber | undefined {
  return BARBERS.find((b) => b.id === id);
}

export function getBarberService(barberSlug: string, serviceId: string): BarberService | undefined {
  const barber = getBarberBySlug(barberSlug);
  return barber?.services.find((s) => s.id === serviceId);
}
