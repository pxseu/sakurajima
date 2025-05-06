const FAVICON = "https://cdn.pxseu.com/dlO2HN52D.png";
const IMAGES = [
	"https://cdn.pxseu.com/Nc4z2WvoV.png",
	"https://cdn.pxseu.com/v-cvbCPd2.jpg",
	"https://cdn.pxseu.com/aiXdAtr1Z.png",
	"https://cdn.pxseu.com/ylP2WZ-Gv.jpg",
	"https://cdn.pxseu.com/As6NFGCTK.png",
	"https://cdn.pxseu.com/cfiBi797Q.png",
] as const;

type RandomImage = {
	url: string;
	index: number;
} | null;

function getRandomImage(usedIndexes?: number[]): RandomImage {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);

	let availableIndexes = Array.from({ length: IMAGES.length }, (_, i) => i);
	if (usedIndexes?.length) {
		availableIndexes = availableIndexes.filter((i) => !usedIndexes.includes(i));
	}

	// If all images have been used, return null
	if (availableIndexes.length === 0) {
		return null;
	}

	const randomIndex = array[0]! % availableIndexes.length;
	const index = availableIndexes[randomIndex]!;

	return {
		url: IMAGES[index]!,
		index,
	};
}

const server = Bun.serve({
	hostname: "0.0.0.0",
	port: Number(process.env.PORT || 3000),
	routes: {
		"/": async () => {
			const random = getRandomImage();

			if (!random) {
				return new Response("No more images available", { status: 404 });
			}

			const response = await fetch(random.url);
			const headers = new Headers({
				"Content-Type": response.headers.get("content-type")!,
				"Cache-Control": "private, max-age=0",
				Connection: "keep-alive",
				"Keep-Alive": "timeout=15, max=200",
				"Content-Disposition": `inline; filename="mai-${random.index}.${random.url.split(".").pop()}"`,
			});

			return new Response(response.body, { headers });
		},
		"/favicon.ico": async () => {
			const response = await fetch(FAVICON);

			return new Response(response.body, {
				headers: {
					"Cache-Control": "public, max-age=31536000",
					"Content-Type": response.headers.get("content-type")!,
				},
			});
		},
		"/json": async (req) => {
			const url = new URL(req.url);
			const usedIndexes = url.searchParams
				.get("used")
				?.split(",")
				.map((i) => parseInt(i, 10))
				.filter((i) => !isNaN(i));

			const random = getRandomImage(usedIndexes);
			return new Response(JSON.stringify(random), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		},
		"/privacy": new Response(
			`Privacy Policy

This service is extremely simple and does not collect any data about you. Here's what we do and don't do:

What we do:
- Serve random images from a predefined list
- Log requests in development mode only (not in production)
- Nothing else

What we don't do:
- Store any data
- Track users
- Use cookies
- Share data with third parties
- Collect analytics
- Store IP addresses
- Monitor usage patterns

The only thing we know about you is that you visited this page, and that's it. We don't even store that information.

If you have any questions, feel free to contact me at mai@sakurajima.cloud`,
			{
				headers: {
					"Content-Type": "text/plain",
					"Cache-Control": "public, max-age=3600",
				},
			},
		),
		"/robots.txt": new Response("User-agent: *\nDisallow: /", {
			headers: {
				"Content-Type": "text/plain",
			},
		}),
	},
});

console.log(`Listening on ${server.url}`);
