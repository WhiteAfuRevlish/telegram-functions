export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { new: order } = req.body.record ? req.body : req.body;

  const message = `
🛒 *Нове замовлення Vitiligo.UA!*
👤 ${order.firstName} ${order.lastName}
📞 ${order.phone}
📦 НП: ${order.novaPoshta}
💳 ${order.paymentMethod}
🧾 Товари:
${order.items.map((i) => `- ${i.product.name} x${i.quantity}`).join('\n')}
💰 Всього: ${order.total} грн
`;

const chatIds = ['345118990', '193480574'];

  await Promise.all(chatIds.map(chatId => 
  fetch(`https://api.telegram.org/bot7852252128:AAH8eMQKVCc3rfzE2AVscbJL02OuQ1W8fdc/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  })
  ));

  res.status(200).json({ message: 'Message sent' });
}
