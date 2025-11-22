export function getMotivationalMessage(): string {
  const hour = new Date().getHours();
  const messages = {
    morning: [
      "Bom dia! Que seu dia seja produtivo e cheio de conquistas! 🌅",
      "Bom dia! Vamos começar o dia com energia e foco! 💪",
      "Bom dia! Hoje é um novo dia para fazer a diferença! ✨",
      "Bom dia! Você tem tudo para ter um dia incrível! 🚀",
      "Bom dia! Que cada trabalho seja uma oportunidade de crescimento! 📚",
    ],
    afternoon: [
      "Boa tarde! Continue focado e mantenha o ritmo! 🌞",
      "Boa tarde! Você está no caminho certo, continue assim! 💯",
      "Boa tarde! Cada entrega é um passo em direção ao sucesso! 🎯",
      "Boa tarde! Seu trabalho faz a diferença, continue! 🌟",
      "Boa tarde! A persistência é a chave do sucesso! 🔑",
    ],
    evening: [
      "Boa noite! Você fez um ótimo trabalho hoje! 🌙",
      "Boa noite! Obrigado pelo seu empenho e dedicação! 🙏",
      "Boa noite! Cada trabalho concluído é uma vitória! 🏆",
      "Boa noite! Descanse bem, você merece! 😊",
      "Boa noite! Amanhã será outro dia de oportunidades! 🌟",
    ],
  };

  let timeOfDay: 'morning' | 'afternoon' | 'evening';
  if (hour < 12) {
    timeOfDay = 'morning';
  } else if (hour < 18) {
    timeOfDay = 'afternoon';
  } else {
    timeOfDay = 'evening';
  }

  const timeMessages = messages[timeOfDay];
  return timeMessages[Math.floor(Math.random() * timeMessages.length)];
}

