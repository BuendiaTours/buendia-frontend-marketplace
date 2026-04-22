import { env } from '$env/dynamic/private';

const BUSINESS_UNIT_ID = '6875230edd0a4c4d3e408b7c';
const CACHE_TTL = 60 * 60 * 1000;

type TrustpilotCache = { score: number; total: number; timestamp: number };

let cache: TrustpilotCache | null = null;

export const load = async () => {
	if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
		return { trustpilot: { score: cache.score, total: cache.total } };
	}

	if (!env.TRUSTPILOT_API_KEY) return { trustpilot: null };

	try {
		const res = await fetch(
			`https://api.trustpilot.com/v1/business-units/${BUSINESS_UNIT_ID}?apikey=${env.TRUSTPILOT_API_KEY}`
		);
		if (!res.ok) return { trustpilot: null };

		const data = await res.json();
		const score: number = data.score?.trustScore;
		const total: number = data.numberOfReviews?.total;

		if (score == null) return { trustpilot: null };

		cache = { score, total, timestamp: Date.now() };
		return { trustpilot: { score, total } };
	} catch {
		return { trustpilot: null };
	}
};
