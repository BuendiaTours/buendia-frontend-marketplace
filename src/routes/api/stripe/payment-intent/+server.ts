import { json, error } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const POST: RequestHandler = async ({ request }) => {
	const { amount, currency = 'eur', orderId } = await request.json();

	if (!amount || amount <= 0) {
		error(400, 'Invalid amount');
	}

	const paymentIntent = await stripe.paymentIntents.create({
		amount: Math.round(amount * 100),
		currency,
		payment_method_types: ['card', 'amazon_pay', 'klarna'],
		metadata: { orderId: orderId ?? '' }
	});

	return json({ clientSecret: paymentIntent.client_secret });
};
