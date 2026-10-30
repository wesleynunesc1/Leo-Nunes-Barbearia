// ============================================================
// Chatbot Engine — Motor de fluxos baseado em regras
// Sem inteligência artificial generativa, sem APIs de IA
// ============================================================
import {
  ChatbotSession,
  ChatbotAction,
  ChatbotStepId,
  ChatMessage,
  ChatButton,
  MemberBookingItem,
} from "@/types/chatbot";

let _msgCounter = 0;
function msgId() {
  return `msg-${Date.now()}-${++_msgCounter}`;
}

// ─── Helpers de Mensagens ──────────────────────────────────────────────────────

function botText(text: string, buttons?: ChatButton[]): ChatMessage {
  return {
    id: msgId(),
    role: "bot",
    type: buttons ? "buttons" : "text",
    text,
    buttons,
    timestamp: new Date(),
  };
}

function userText(text: string): ChatMessage {
  return {
    id: msgId(),
    role: "user",
    type: "text",
    text,
    timestamp: new Date(),
  };
}

function loading(): ChatMessage {
  return {
    id: msgId(),
    role: "bot",
    type: "loading",
    timestamp: new Date(),
  };
}

// ─── Botões padrão ────────────────────────────────────────────────────────────

const BTN_MAIN_MENU: ChatButton = { id: "MAIN_MENU", label: "🏠 Menu Principal", variant: "ghost" };
const BTN_RESTART: ChatButton = { id: "RESTART", label: "🔄 Recomeçar", variant: "ghost" };
const BTN_WHATSAPP: ChatButton = { id: "GOTO_WHATSAPP", label: "💬 Falar via WhatsApp", variant: "secondary" };
const BTN_BOOK: ChatButton = { id: "GOTO_STEP:BOOK_BARBER", label: "✂️ Agendar agora", variant: "primary" };
const BTN_MY_BOOKINGS: ChatButton = { id: "SHOW_MY_BOOKINGS", label: "📅 Meus Agendamentos", variant: "secondary" };
const BTN_SERVICES: ChatButton = { id: "SHOW_SERVICES_MENU", label: "💈 Ver Serviços e Preços", variant: "secondary" };

// ─── Estado inicial ───────────────────────────────────────────────────────────

export function createInitialSession(member?: any): ChatbotSession {
  if (member && member.name) {
    const firstName = member.name.trim().split(" ")[0];
    const welcome = botText(
      `Olá, **${firstName}**! 👋 Que bom ter você de volta à **Léo Nunes Barbearia**.\n\nJá tenho seus dados de cadastro. Como posso ajudar hoje?`
    );
    const menu = buildMainMenu(member);
    return {
      step: "MAIN_MENU",
      messages: [welcome, menu],
      customerName: member.name,
      customerEmail: member.email || "",
      customerPhone: member.phone || "",
    };
  }

  const welcome = botText(
    "Olá! Seja bem-vindo à **Léo Nunes Barbearia** ✂️\n\nSou o assistente virtual da barbearia. Como posso te ajudar hoje?"
  );
  const menu = buildMainMenu(null);
  return {
    step: "MAIN_MENU",
    messages: [welcome, menu],
  };
}

export function buildMainMenu(member?: any): ChatMessage {
  if (member && member.name) {
    return {
      id: msgId(),
      role: "bot",
      type: "buttons",
      text: "Escolha uma das opções abaixo:",
      buttons: [
        { id: "GOTO_STEP:BOOK_BARBER", label: "✂️ Agendar Horário", variant: "primary" },
        { id: "REPEAT_LAST_BOOKING", label: "🔁 Repetir Meu Último Agendamento", variant: "primary" },
        { id: "FIND_NEXT_SLOT", label: "⚡ Encontrar Próximo Horário", variant: "secondary" },
        { id: "SHOW_MY_BOOKINGS", label: "📅 Meus Agendamentos", variant: "secondary" },
        { id: "GOTO_WHATSAPP", label: "💬 Falar com a Equipe", variant: "ghost" },
      ],
      timestamp: new Date(),
    };
  }

  return {
    id: msgId(),
    role: "bot",
    type: "buttons",
    text: "Escolha uma das opções abaixo:",
    buttons: [
      { id: "GOTO_STEP:BOOK_BARBER", label: "✂️ Agendar Horário", variant: "primary" },
      { id: "SHOW_SERVICES_MENU", label: "💈 Serviços e Preços", variant: "secondary" },
      { id: "SHOW_OPENING_HOURS", label: "⏰ Horário de Funcionamento", variant: "secondary" },
      { id: "SHOW_MY_BOOKINGS", label: "📅 Meus Agendamentos", variant: "secondary" },
      { id: "GOTO_WHATSAPP", label: "💬 Falar no WhatsApp", variant: "ghost" },
    ],
    timestamp: new Date(),
  };
}

// ─── Reducer Principal ────────────────────────────────────────────────────────

export function chatbotReducer(
  session: ChatbotSession,
  action: ChatbotAction
): ChatbotSession {
  switch (action.type) {
    case "RESTART":
      return createInitialSession(session.customerName ? { name: session.customerName, email: session.customerEmail, phone: session.customerPhone } : null);

    case "MAIN_MENU": {
      const msgs = [
        ...session.messages,
        userText("🏠 Menu Principal"),
        buildMainMenu(session.customerName ? { name: session.customerName } : null),
      ];
      return { ...session, step: "MAIN_MENU", messages: msgs };
    }

    case "SHOW_SERVICES_MENU": {
      const msgs = [
        ...session.messages,
        userText("💈 Serviços e Preços"),
        botText(
          "Aqui estão nossas categorias de serviços. Escolha para ver os valores:",
          [
            { id: "SERVICES:cabelo", label: "✂️ Cortes de Cabelo", variant: "primary" },
            { id: "SERVICES:barba", label: "🪒 Barba", variant: "primary" },
            { id: "SERVICES:combo", label: "💎 Combos Especiais", variant: "primary" },
            { id: "SERVICES:tratamento", label: "🌿 Tratamentos", variant: "primary" },
            BTN_BOOK,
            BTN_MAIN_MENU,
          ]
        ),
      ];
      return { ...session, step: "SERVICES_MENU", messages: msgs };
    }

    case "SHOW_OPENING_HOURS": {
      const msgs = [
        ...session.messages,
        userText("⏰ Horário de Funcionamento"),
        botText(
          "⏰ **Horários de Atendimento da Léo Nunes Barbearia**\n\n" +
          "• **Segunda a Sexta**: 08h às 19h\n" +
          "• **Sábado**: 08h às 18h\n" +
          "• **Domingo**: Fechado\n\n" +
          "📍 **Endereço**: Rua Joaquim Nogueira Lopes, 180 — Centro, Pacajus - CE\n" +
          "📞 **WhatsApp**: (85) 99222-7064\n\n" +
          "Deseja agendar um horário com nossa equipe?",
          [
            BTN_BOOK,
            BTN_SERVICES,
            BTN_WHATSAPP,
            BTN_MAIN_MENU,
          ]
        ),
      ];
      return { ...session, step: "OPENING_HOURS", messages: msgs };
    }

    case "SHOW_MY_BOOKINGS": {
      const msgs = [
        ...session.messages,
        userText("📅 Meus Agendamentos"),
        {
          id: msgId(),
          role: "bot" as const,
          type: "loading" as const,
          text: "Consultando seus agendamentos futuros...",
          timestamp: new Date(),
        },
      ];
      return { ...session, step: "MY_BOOKINGS", messages: msgs, isLoading: true };
    }

    case "REPEAT_LAST_BOOKING": {
      const msgs = [
        ...session.messages,
        userText("🔁 Repetir Meu Último Agendamento"),
        {
          id: msgId(),
          role: "bot" as const,
          type: "loading" as const,
          text: "Consultando seu histórico oficial na barbearia...",
          timestamp: new Date(),
        },
      ];
      return { ...session, step: "REPEAT_PROMPT", messages: msgs, isLoading: true };
    }

    case "SHOW_REPEAT_CARD": {
      const msgs = [
        ...session.messages.filter((m) => m.type !== "loading"),
        botText("Encontrei seu último atendimento! ✂️\n\nQuer repetir o mesmo serviço com seu barbeiro?"),
        {
          id: msgId(),
          role: "bot" as const,
          type: "repeat_card" as const,
          repeatCard: action.data,
          timestamp: new Date(),
        },
      ];
      return {
        ...session,
        step: "REPEAT_PROMPT",
        messages: msgs,
        isLoading: false,
        repeatCardData: action.data,
      };
    }

    case "FIND_NEXT_SLOT": {
      const msgs = [
        ...session.messages,
        userText("⚡ Encontrar Próximo Horário"),
        botText("Com qual barbeiro você deseja encontrar o próximo horário disponível?"),
        {
          id: msgId(),
          role: "bot" as const,
          type: "barber_cards" as const,
          timestamp: new Date(),
        },
      ];
      return {
        ...session,
        step: "FIND_NEXT_SLOT",
        messages: msgs,
      };
    }

    case "EDIT_CUSTOMER_DATA": {
      const msgs = [
        ...session.messages,
        userText("✏️ Alterar Meus Dados"),
        botText("Por favor, digite seu **nome completo**:"),
        {
          id: msgId(),
          role: "bot" as const,
          type: "input_request" as const,
          inputRequest: {
            placeholder: "Seu nome completo",
            type: "text" as const,
            validation: "name" as const,
          },
          timestamp: new Date(),
        },
      ];
      return {
        ...session,
        step: "BOOK_CUSTOMER_NAME",
        messages: msgs,
      };
    }

    case "SYNC_MEMBER": {
      const member = action.member;
      if (member && member.name) {
        const firstName = member.name.trim().split(" ")[0];
        const isFresh = session.messages.length <= 2 && (session.step === "MAIN_MENU" || session.step === "WELCOME");
        if (isFresh) {
          const welcome = botText(
            `Olá, **${firstName}**! 👋 Que bom ter você de volta à **Léo Nunes Barbearia**.\n\nJá tenho seus dados de cadastro. Como posso ajudar hoje?`
          );
          const menu = buildMainMenu(member);
          return {
            ...session,
            step: "MAIN_MENU",
            messages: [welcome, menu],
            customerName: member.name,
            customerEmail: member.email || "",
            customerPhone: member.phone || "",
          };
        }
        return {
          ...session,
          customerName: session.customerName || member.name,
          customerEmail: session.customerEmail || member.email || "",
          customerPhone: session.customerPhone || member.phone || "",
        };
      } else {
        const isFresh = session.messages.length <= 2 && (session.step === "MAIN_MENU" || session.step === "WELCOME");
        const msgs = isFresh
          ? [
              botText("Olá! Seja bem-vindo à **Léo Nunes Barbearia** ✂️\n\nSou o assistente virtual da barbearia. Como posso te ajudar hoje?"),
              buildMainMenu(null),
            ]
          : session.messages;

        return {
          ...session,
          customerName: undefined,
          customerEmail: undefined,
          customerPhone: undefined,
          activeBookingId: undefined,
          activeBookingDetail: undefined,
          repeatCardData: undefined,
          messages: msgs,
          step: isFresh ? "MAIN_MENU" : session.step,
        };
      }
    }

    case "GOTO_WHATSAPP": {
      const msgs = [
        ...session.messages,
        userText("💬 Falar no WhatsApp"),
        {
          id: msgId(),
          role: "bot" as const,
          type: "buttons" as const,
          text: "Vou te encaminhar para o WhatsApp da barbearia! 📱\n\nClique no botão abaixo para iniciar a conversa:",
          buttons: [
            {
              id: "WHATSAPP_OPEN",
              label: "💬 Abrir WhatsApp",
              variant: "primary" as const,
            },
            BTN_MAIN_MENU,
          ],
          timestamp: new Date(),
        },
      ];
      return { ...session, step: "WHATSAPP", messages: msgs };
    }

    case "GOTO_STEP": {
      if (action.step === "BOOK_BARBER") {
        const msgs = [
          ...session.messages,
          userText("✂️ Agendar Horário"),
          botText("Ótimo! Vamos começar seu agendamento 🎉\n\nPrimeiro, escolha com qual barbeiro você quer ser atendido:"),
          {
            id: msgId(),
            role: "bot" as const,
            type: "barber_cards" as const,
            timestamp: new Date(),
          },
        ];
        return {
          ...session,
          step: "BOOK_BARBER",
          messages: msgs,
          // Limpa seleção anterior
          selectedBarberId: undefined,
          selectedBarberSlug: undefined,
          selectedServiceIds: undefined,
          selectedDate: undefined,
          selectedTime: undefined,
        };
      }
      return { ...session, step: action.step };
    }

    case "SELECT_BARBER": {
      const msgs = [
        ...session.messages,
        userText(`✂️ ${action.barberName}`),
        botText(
          `Excelente escolha! **${action.barberName}** está disponível para te atender.\n\nAgora selecione o(s) serviço(s) que deseja:`
        ),
        {
          id: msgId(),
          role: "bot" as const,
          type: "service_cards" as const,
          timestamp: new Date(),
        },
      ];
      return {
        ...session,
        step: "BOOK_SERVICE",
        messages: msgs,
        selectedBarberId: action.barberId,
        selectedBarberSlug: action.barberSlug,
        selectedBarberName: action.barberName,
        selectedBarberPhoto: action.barberPhoto,
        selectedServiceIds: [],
        selectedServiceWixIds: [],
        selectedServiceNames: [],
        selectedServicePrices: [],
        selectedServiceDurations: [],
        selectedDate: undefined,
        selectedTime: undefined,
      };
    }

    case "TOGGLE_SERVICE": {
      const currentIds = session.selectedServiceIds || [];
      const isSelected = currentIds.includes(action.serviceId);
      let newIds: string[];
      let newWixIds: string[];
      let newNames: string[];
      let newPrices: number[];
      let newDurations: number[];

      if (isSelected) {
        const idx = currentIds.indexOf(action.serviceId);
        newIds = currentIds.filter((_, i) => i !== idx);
        newWixIds = (session.selectedServiceWixIds || []).filter((_, i) => i !== idx);
        newNames = (session.selectedServiceNames || []).filter((_, i) => i !== idx);
        newPrices = (session.selectedServicePrices || []).filter((_, i) => i !== idx);
        newDurations = (session.selectedServiceDurations || []).filter((_, i) => i !== idx);
      } else {
        if (currentIds.length >= 5) return session; // Limite de 5 serviços
        newIds = [...currentIds, action.serviceId];
        newWixIds = [...(session.selectedServiceWixIds || []), action.wixServiceId || action.serviceId];
        newNames = [...(session.selectedServiceNames || []), action.name];
        newPrices = [...(session.selectedServicePrices || []), action.price];
        newDurations = [...(session.selectedServiceDurations || []), action.duration];
      }

      return {
        ...session,
        selectedServiceIds: newIds,
        selectedServiceWixIds: newWixIds,
        selectedServiceNames: newNames,
        selectedServicePrices: newPrices,
        selectedServiceDurations: newDurations,
        selectedDate: undefined,
        selectedTime: undefined,
      };
    }

    case "SELECT_DATE": {
      const msgs = [
        ...session.messages,
        userText(`📅 ${formatDate(action.date)}`),
        {
          id: msgId(),
          role: "bot" as const,
          type: "loading" as const,
          text: "Consultando horários disponíveis na agenda...",
          timestamp: new Date(),
        },
      ];
      return {
        ...session,
        step: "BOOK_TIME",
        messages: msgs,
        selectedDate: action.date,
        selectedTime: undefined,
        isLoading: true,
      };
    }

    case "SELECT_TIME": {
      const hasValidName = Boolean(session.customerName && session.customerName.trim().length >= 2);
      const hasValidPhone = Boolean(session.customerPhone && session.customerPhone.trim().replace(/\D/g, "").length >= 8);

      if (hasValidName && hasValidPhone) {
        // Cliente autenticado com cadastro completo: não pedir novamente dados válidos
        const sessionWithTime = {
          ...session,
          selectedTime: action.time,
          selectedSlotMetadata: action.metadata,
          isLoading: false,
        };
        return buildConfirmStep(sessionWithTime, session.customerEmail || "", true);
      }

      if (hasValidName && !hasValidPhone) {
        // Nome disponível mas telefone ausente: solicitar apenas o telefone com DDD
        const firstName = session.customerName!.trim().split(" ")[0];
        const msgs = [
          ...session.messages,
          userText(`⏰ ${action.time}`),
          botText(
            `${firstName}, encontrei sua conta! Para continuar e confirmar seu agendamento, só preciso confirmar seu telefone com DDD:\nEx: (85) 99999-9999`
          ),
          {
            id: msgId(),
            role: "bot" as const,
            type: "input_request" as const,
            inputRequest: {
              placeholder: "(85) 99999-9999",
              type: "tel" as const,
              validation: "phone" as const,
            },
            timestamp: new Date(),
          },
        ];
        return {
          ...session,
          step: "BOOK_CUSTOMER_PHONE",
          messages: msgs,
          selectedTime: action.time,
          selectedSlotMetadata: action.metadata,
          isLoading: false,
        };
      }

      if (!hasValidName && hasValidPhone) {
        // Telefone cadastrado mas nome ausente: solicitar apenas o nome
        const msgs = [
          ...session.messages,
          userText(`⏰ ${action.time}`),
          botText(
            `Horário **${action.time}** selecionado para **${formatDate(session.selectedDate || "")}**.\n\nPor favor, informe seu **nome completo**:`
          ),
          {
            id: msgId(),
            role: "bot" as const,
            type: "input_request" as const,
            inputRequest: {
              placeholder: "Seu nome completo",
              type: "text" as const,
              validation: "name" as const,
            },
            timestamp: new Date(),
          },
        ];
        return {
          ...session,
          step: "BOOK_CUSTOMER_NAME",
          messages: msgs,
          selectedTime: action.time,
          selectedSlotMetadata: action.metadata,
          isLoading: false,
        };
      }

      // Cliente sem cadastro prévio: fluxo padrão
      const msgs = [
        ...session.messages,
        userText(`⏰ ${action.time}`),
        botText(
          "Perfeito! Agora preciso de algumas informações para finalizar o agendamento.\n\n**Qual é o seu nome completo?**"
        ),
        {
          id: msgId(),
          role: "bot" as const,
          type: "input_request" as const,
          inputRequest: {
            placeholder: "Seu nome completo",
            type: "text" as const,
            validation: "name" as const,
          },
          timestamp: new Date(),
        },
      ];
      return {
        ...session,
        step: "BOOK_CUSTOMER_NAME",
        messages: msgs,
        selectedTime: action.time,
        selectedSlotMetadata: action.metadata,
        isLoading: false,
      };
    }

    case "SET_CUSTOMER_NAME": {
      const hasValidPhone = Boolean(session.customerPhone && session.customerPhone.trim().replace(/\D/g, "").length >= 8);
      if (hasValidPhone) {
        return buildConfirmStep({ ...session, customerName: action.name }, session.customerEmail || "", true);
      }

      const msgs = [
        ...session.messages,
        userText(action.name),
        botText(`Olá, **${action.name.split(" ")[0]}**! 👋\n\n**Qual é o seu número de WhatsApp?** (com DDD)\nEx: (85) 99999-9999`),
        {
          id: msgId(),
          role: "bot" as const,
          type: "input_request" as const,
          inputRequest: {
            placeholder: "(85) 99999-9999",
            type: "tel" as const,
            validation: "phone" as const,
          },
          timestamp: new Date(),
        },
      ];
      return { ...session, step: "BOOK_CUSTOMER_PHONE", messages: msgs, customerName: action.name };
    }

    case "SET_CUSTOMER_PHONE": {
      const hasValidName = Boolean(session.customerName && session.customerName.trim().length >= 2);
      if (hasValidName) {
        return buildConfirmStep({ ...session, customerPhone: action.phone }, session.customerEmail || "", true);
      }

      const msgs = [
        ...session.messages,
        userText(action.phone),
        botText(
          "Ótimo! Se quiser receber a confirmação por e-mail, informe abaixo. Caso contrário, pule essa etapa.",
          [
            { id: "SKIP_EMAIL", label: "⏭️ Pular e-mail", variant: "secondary" },
          ]
        ),
        {
          id: msgId(),
          role: "bot" as const,
          type: "input_request" as const,
          inputRequest: {
            placeholder: "seu@email.com (opcional)",
            type: "email" as const,
            validation: "email" as const,
          },
          timestamp: new Date(),
        },
      ];
      return { ...session, step: "BOOK_CUSTOMER_EMAIL", messages: msgs, customerPhone: action.phone };
    }

    case "SET_CUSTOMER_EMAIL": {
      return buildConfirmStep(session, action.email || "");
    }

    case "CONFIRM_BOOKING": {
      const msgs = [
        ...session.messages,
        userText("✅ Confirmar agendamento"),
        {
          id: msgId(),
          role: "bot" as const,
          type: "loading" as const,
          text: "Criando sua reserva na agenda oficial...",
          timestamp: new Date(),
        },
      ];
      return { ...session, step: "BOOK_RESULT", messages: msgs, isLoading: true };
    }

    case "SELECT_BOOKING": {
      const msgs = [
        ...session.messages,
        userText(`📋 ${action.booking.serviceName}`),
        {
          id: msgId(),
          role: "bot" as const,
          type: "booking_detail" as const,
          bookingDetail: action.booking,
          timestamp: new Date(),
        },
      ];
      return {
        ...session,
        step: "BOOKING_DETAIL",
        messages: msgs,
        activeBookingId: action.booking.bookingId,
        activeBookingDetail: action.booking,
      };
    }

    case "CONFIRM_CANCEL": {
      const msgs = [
        ...session.messages,
        userText("❌ Cancelar agendamento"),
        botText(
          `⚠️ **Tem certeza que deseja cancelar?**\n\nEsta ação não pode ser desfeita. O agendamento será removido da sua agenda.`,
          [
            { id: "DO_CANCEL", label: "❌ Sim, cancelar", variant: "danger" },
            { id: "BOOKING_DETAIL_BACK", label: "← Voltar", variant: "ghost" },
          ]
        ),
      ];
      return { ...session, step: "CANCEL_CONFIRM", messages: msgs };
    }

    case "SELECT_RESCHEDULE_DATE": {
      const msgs = [
        ...session.messages,
        userText(`📅 ${formatDate(action.date)}`),
        {
          id: msgId(),
          role: "bot" as const,
          type: "loading" as const,
          text: "Consultando horários disponíveis...",
          timestamp: new Date(),
        },
      ];
      return {
        ...session,
        step: "RESCHEDULE_TIME",
        messages: msgs,
        rescheduleDate: action.date,
        isLoading: true,
      };
    }

    case "SELECT_RESCHEDULE_TIME": {
      return buildRescheduleConfirm(session, action.time, action.metadata);
    }

    case "CONFIRM_RESCHEDULE": {
      const msgs = [
        ...session.messages,
        userText("✅ Confirmar reagendamento"),
        {
          id: msgId(),
          role: "bot" as const,
          type: "loading" as const,
          text: "Reagendando sua reserva...",
          timestamp: new Date(),
        },
      ];
      return { ...session, step: "RESCHEDULE_RESULT", messages: msgs, isLoading: true };
    }

    case "SET_LOADING": {
      return { ...session, isLoading: action.loading };
    }

    case "SET_ERROR": {
      const msgs = [
        ...session.messages.filter((m) => m.type !== "loading"),
        botText(`❌ ${action.error}`, [BTN_MAIN_MENU, BTN_RESTART]),
      ];
      return { ...session, step: "ERROR", messages: msgs, isLoading: false, error: action.error };
    }

    case "ADD_MESSAGE": {
      return { ...session, messages: [...session.messages, action.message] };
    }

    default:
      return session;
  }
}

// ─── Funções auxiliares ────────────────────────────────────────────────────────

function buildConfirmStep(session: ChatbotSession, email: string, isAutoFilled?: boolean): ChatbotSession {
  const totalPrice = (session.selectedServicePrices || []).reduce((s, p) => s + p, 0);
  const totalDuration = (session.selectedServiceDurations || []).reduce((s, d) => s + d, 0);
  const isMulti = (session.selectedServiceIds || []).length > 1;

  const summary = {
    barberName: session.selectedBarberName || "",
    barberPhoto: session.selectedBarberPhoto,
    services: (session.selectedServiceNames || []).map((name, i) => ({
      name,
      formattedPrice: `R$ ${((session.selectedServicePrices || [])[i] || 0).toFixed(2).replace(".", ",")}`,
      durationMinutes: (session.selectedServiceDurations || [])[i] || 0,
    })),
    totalPrice,
    totalDuration,
    date: session.selectedDate || "",
    time: session.selectedTime || "",
    customerName: session.customerName || "",
    customerPhone: session.customerPhone || "",
    customerEmail: email,
  };

  const confirmText = isAutoFilled
    ? "Identifiquei sua conta e preenchi seus dados cadastrados. Confira todos os detalhes do seu agendamento antes de confirmar:"
    : "Revise os detalhes do seu agendamento antes de confirmar:";

  const confirmButtons: ChatButton[] = isMulti
    ? [
        { id: "CONFIRM_MULTI_PACKAGE", label: "💬 Confirmar Pacote via WhatsApp", variant: "primary" as const },
        { id: "EDIT_CUSTOMER_DATA", label: "✏️ Alterar Meus Dados", variant: "secondary" as const },
        { id: "GOTO_STEP:BOOK_DATE", label: "📅 Mudar Data/Hora", variant: "ghost" as const },
        { id: "MAIN_MENU", label: "❌ Cancelar", variant: "ghost" as const },
      ]
    : [
        { id: "CONFIRM_BOOKING", label: "✅ Confirmar Agendamento", variant: "primary" as const },
        { id: "EDIT_CUSTOMER_DATA", label: "✏️ Alterar Meus Dados", variant: "secondary" as const },
        { id: "GOTO_STEP:BOOK_DATE", label: "📅 Mudar Data/Hora", variant: "ghost" as const },
        { id: "MAIN_MENU", label: "❌ Cancelar", variant: "ghost" as const },
      ];

  const msgs = [
    ...(email && !isAutoFilled ? [userText(email)] : []),
    botText(confirmText),
    {
      id: msgId(),
      role: "bot" as const,
      type: "booking_summary" as const,
      bookingSummary: summary,
      timestamp: new Date(),
    },
    {
      id: msgId(),
      role: "bot" as const,
      type: "buttons" as const,
      text: "Tudo certo? Confirme para reservar seu horário:",
      buttons: confirmButtons,
      timestamp: new Date(),
    },
  ];

  return {
    ...session,
    step: "BOOK_CONFIRM",
    messages: [...session.messages, ...msgs],
    customerEmail: email || session.customerEmail || undefined,
  };
}

function buildRescheduleConfirm(session: ChatbotSession, time: string, metadata?: any): ChatbotSession {
  const booking = session.activeBookingDetail;
  const msgs = [
    ...session.messages.filter((m) => m.type !== "loading"),
    userText(`⏰ ${time}`),
    botText(
      `**Confirmar reagendamento?**\n\n📅 Nova data: ${formatDate(session.rescheduleDate || "")}\n⏰ Novo horário: ${time}\n💈 Serviço: ${booking?.serviceName || ""}\n✂️ Barbeiro: ${booking?.barberName || ""}`,
      [
        { id: "CONFIRM_RESCHEDULE", label: "✅ Confirmar Reagendamento", variant: "primary" as const },
        { id: "RESCHEDULE_DATE_BACK", label: "📅 Mudar Data", variant: "ghost" as const },
        { id: "MAIN_MENU", label: "❌ Cancelar", variant: "ghost" as const },
      ]
    ),
  ];
  return {
    ...session,
    step: "RESCHEDULE_CONFIRM",
    messages: msgs,
    rescheduleTime: time,
    selectedSlotMetadata: metadata,
    isLoading: false,
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const days = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const dt = new Date(y, m - 1, d);
  return `${days[dt.getDay()]}, ${d} de ${months[m - 1]}`;
}

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace(".", ",")}`;
}

export function parseTotalPrice(session: ChatbotSession): number {
  return (session.selectedServicePrices || []).reduce((s, p) => s + p, 0);
}

export function parseTotalDuration(session: ChatbotSession): number {
  return (session.selectedServiceDurations || []).reduce((s, d) => s + d, 0);
}

