export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

   const { record } = req.body;
  const { name, phone, message } = record;

  const text = `
📥 *Нове повідомлення зв'яжіться з нами!*
👤 Ім’я: ${name}
📞 Телефон: ${phone}
📝 Повідомлення:
${message}
  `;

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = ['345118990', '193480574'];

  await Promise.all(chatIds.map(chatId =>
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    })
  ));

  res.status(200).json({ message: 'Contact message sent to Telegram' });
}
