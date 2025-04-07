export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { id: orderId, customer_id, total_amount, payment_method } = req.body;

  // 💡 Supabase config
  const SUPABASE_URL = 'https://gaitzkxrbuzraysohewf.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaXR6a3hyYnV6cmF5c29oZXdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQ0OTc0MSwiZXhwIjoyMDU5MDI1NzQxfQ.1_HDbgDPlUZ74hEeGtd1rlbFYt9CUWH64wFi81U_cNo';

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
  const TELEGRAM_BOT_TOKEN = '7852252128:AAH8eMQKVCc3rfzE2AVscbJL02OuQ1W8fdc';

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
