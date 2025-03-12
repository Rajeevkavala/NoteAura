import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 29900, // ₹299 in paise
      currency: "INR",
      receipt: `receipt_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);

    return new Response(JSON.stringify(order), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Something went wrong!" }), { status: 500 });
  }
}
