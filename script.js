// script.js
// Minimal rule-based "AI Buddy" for Sanatan Sparks
// Founder fallback: "Founder Swayam Mishra didn't add any information yet."

document.addEventListener('DOMContentLoaded', () => {
  // DOM refs
  const chat = document.getElementById('chat');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');

  // Quick helper to append messages
  function appendMsg(text, who = 'bot') {
    const d = document.createElement('div');
    d.className = 'msg ' + (who === 'bot' ? 'bot' : 'user');
    d.textContent = text;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  // Initial greeting (only once)
  if (chat && chat.children.length === 0) {
    appendMsg('Namaste. I am Sanatan Buddy. Ask me about a place, ritual, or yatra.');
  }

  // Very small "knowledge base" (seeded training)
  const kb = [
    {
      keywords: ['sarayu', 'saryu', 'sarayu cave', 'saryu cave', 'ayodhya'],
      answer:
        'Sarayu (Saryu) is the sacred river beside Ayodhya. The cave near its banks is linked by local tradition to Lord Ram’s final journey. Would you like a short 40s spark script or a travel plan?'
    },
    {
      keywords: ['omkareshwar', 'narmada'],
      answer:
        'Omkareshwar is a sacred island on the Narmada river, known for its Shiva temple and unique OM-shaped geography. Want a short script or route stops?'
    },
    {
      keywords: ['deepawali', 'dev deepawali', 'deepotsav', 'varanasi'],
      answer:
        'Dev Deepawali in Varanasi is on Kartik Purnima — the ghats glow with lamps and aarti. Options: plan a visit, watch VIP streams, or learn ritual details.'
    },
    {
      keywords: ['narmada parikrama', 'parikrama', 'parikram'],
      answer:
        'Narmada Parikrama is a
