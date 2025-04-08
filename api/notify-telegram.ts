export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

const { record } = req.body;
const { id: orderId, customer_id, total_amount, payment_method } = record;


  // 💡 Supabase config
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // 🔹 Запит клієнта
  const customerRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${customer_id}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const [customer] = await customerRes.json();

  // 🔹 Запит товарів замовлення
  const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}&select=product_name,quantity,price`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const items = await itemsRes.json();

  // 📝 Формування повідомлення
  const message = `
🛒 *Нове замовлення!*
👤 ${customer.first_name} ${customer.last_name}
📞 ${customer.phone}
📧 ${customer.email}
🏙️ ${customer.city}
📦 Нова Пошта: ${customer.nova_poshta}
💳 Оплата: ${payment_method}
🧾 Товари:
${items.map((item) => `- ${item.product_name} x${item.quantity} = ${item.price * item.quantity} грн`).join('\n')}
💰 Всього: ${total_amount} грн
  `;

  const chatIds = ['345118990', '193480574'];
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  // Відправлення у Telegram
  await Promise.all(chatIds.map(chatId =>
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })
  ));

  res.status(200).json({ message: 'Telegram notification sent' });
}
