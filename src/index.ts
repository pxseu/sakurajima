const PRODUCTION = process.env.NODE_ENV === "production";

const PORT = Number(process.env.PORT || 3000);

const FAVICON = "https://cdn.pxseu.com/dlO2HN52D.png";
const IMAGES = [
	"https://cdn.pxseu.com/Nc4z2WvoV.png",
	"https://cdn.pxseu.com/v-cvbCPd2.jpg",
	"https://cdn.pxseu.com/aiXdAtr1Z.png",
	"https://cdn.pxseu.com/ylP2WZ-Gv.jpg",
	"https://cdn.pxseu.com/As6NFGCTK.png",
	"https://cdn.pxseu.com/cfiBi797Q.png",
] as const;

function getRandomImage(): string {
	const array = new Uint32Array(1);

	crypto.getRandomValues(array);

	return IMAGES[array[0]! % IMAGES.length]!;
}

const server = Bun.serve({
	hostname: "0.0.0.0",
	port: PORT,
	async fetch(req: Request) {
		const url = new URL(req.url);

		// Log request in development
		if (!PRODUCTION) {
			console.log(`${req.method} ${url.pathname}`);
		}

		// Handle favicon
		if (url.pathname === "/favicon.ico") {
			const response = await fetch(FAVICON);
			return new Response(response.body, {
				headers: {
					"Cache-Control": "public, max-age=31536000",
					"Content-Type": response.headers.get("content-type")!,
				},
			});
		}

		const random = getRandomImage();

		if (url.pathname === "/json") {
			return new Response(JSON.stringify({ url: random }), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		// Serve random image
		const response = await fetch(random);

		const headers = new Headers({
			"Content-Type": response.headers.get("content-type")!,
			"Cache-Control": "private, max-age=0",
			Connection: "keep-alive",
			"Keep-Alive": "timeout=15, max=200",
		});

		return new Response(response.body, { headers });
	},
});

console.log(`Listening on ${server.url}`);
