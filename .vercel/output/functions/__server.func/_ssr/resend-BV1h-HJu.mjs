//#region node_modules/.nitro/vite/services/ssr/assets/resend-BV1h-HJu.js
function env(key) {
	if (typeof process === "undefined") return void 0;
	return process.env[key]?.trim() || void 0;
}
function getResendApiKey() {
	return env("RESEND_API_KEY");
}
function getMailFrom() {
	return env("RESEND_FROM_EMAIL") || env("EMAIL_FROM") || "FacturaFlow <onboarding@resend.dev>";
}
function isRealMailConfigured() {
	return Boolean(getResendApiKey());
}
function getMailProviderStatus() {
	const configured = isRealMailConfigured();
	return {
		mode: configured ? "resend" : "simulated",
		from: getMailFrom(),
		configured
	};
}
/**
* Send email via Resend HTTP API, or return simulated when no API key.
*/
async function sendMail(payload) {
	const apiKey = getResendApiKey();
	if (!apiKey) return {
		mode: "simulated",
		reason: "RESEND_API_KEY no configurada — modo prueba (no se envía correo real)"
	};
	const from = getMailFrom();
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			from,
			to: [payload.to],
			subject: payload.subject,
			text: payload.text,
			...payload.replyTo ? { reply_to: payload.replyTo } : {}
		})
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Error Resend (${res.status}): ${body.slice(0, 240) || res.statusText}`);
	}
	return {
		mode: "resend",
		id: (await res.json()).id ?? "ok"
	};
}
//#endregion
export { getMailProviderStatus, sendMail };
