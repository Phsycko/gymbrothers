/**
 * Genera icon-192.png e icon-512.png para el manifest PWA a partir de public/icons/image.png.
 * Si no existe image.png, usa un color de marca sólido.
 * Ejecutar: node scripts/generate-pwa-icons.mjs
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
const sourcePng = join(outDir, "image.png");

mkdirSync(outDir, { recursive: true });

const brand = { r: 225, g: 29, b: 72, alpha: 1 };

for (const size of [192, 512]) {
	if (existsSync(sourcePng)) {
		await sharp(sourcePng)
			.resize(size, size, { fit: "cover", position: "centre" })
			.png()
			.toFile(join(outDir, `icon-${size}.png`));
		console.log(`Wrote icons/icon-${size}.png (from image.png)`);
	} else {
		await sharp({
			create: {
				width: size,
				height: size,
				channels: 4,
				background: brand,
			},
		})
			.png()
			.toFile(join(outDir, `icon-${size}.png`));
		console.log(`Wrote icons/icon-${size}.png (fallback solid)`);
	}
}
