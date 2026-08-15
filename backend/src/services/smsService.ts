
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

let client: twilio.Twilio | null = null;

if (accountSid && authToken && twilioNumber) {
  client = twilio(accountSid, authToken);
}

export const sendOrderSMS = async (phone: string, orderId: string, total: number) => {
  try {
    if (!client || !twilioNumber) {
      console.warn('Twilio credentials not configured. Skipping SMS notification.');
      return;
    }

    // Format phone number to E.164 if needed. Assuming user provides +91 format or we append it.
    // For safety, ensuring it starts with +
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    await client.messages.create({
      body: `Thank you for your order from Uttranjali Organics! Order #${orderId} for ₹${total} has been confirmed.`,
      from: twilioNumber,
      to: formattedPhone,
    });
    
    console.log('Order confirmation SMS sent to', formattedPhone);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};
