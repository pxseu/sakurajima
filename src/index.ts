import morgan from "morgan";
import express from "express";
import fetch from "node-fetch";

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
];

const app = express();

app.disable("x-powered-by");
app.use(morgan(PRODUCTION ? "combined" : "dev"));

app.use((_, res, next) => {
	res.setHeader("Connection", "keep-alive");
	res.setHeader("Keep-Alive", "timeout=15, max=200");
	res.setHeader("Cache-Control", "private, max-age=0");
	next();
});

app.get("/favicon.ico", async (_, res) => {
	const response = await fetch(FAVICON);

	res.setHeader("Cache-Control", "public, max-age=31536000");
	res.setHeader("Content-Type", response.headers.get("content-type")!);
	response.body!.pipe(res);
});

app.use(async (_, res) => {
	const response = await fetch(IMAGES[Math.floor(Math.random() * IMAGES.length)]);

	res.setHeader("Content-Type", response.headers.get("content-type")!);
	response.body!.pipe(res);
});

app.listen(PORT, () => {
	console.log(`Listening on http://localhost:${PORT}`);
});
