import { getYouTubeEmbedUrl } from "@/lib/utils/video-helpers";

/**
 * Builds a safe embed URL for YouTube / Vimeo. Other URLs are passed through for iframe src (e.g. Cloudinary).
 */
export type VideoEmbedKind = "youtube" | "vimeo" | "iframe";

export type VideoEmbedResult = {
	kind: VideoEmbedKind;
	embedSrc: string;
	title: string;
};

function vimeoId(url: string): string | null {
	try {
		const u = new URL(url.trim());
		const host = u.hostname.replace(/^www\./, "");
		if (host !== "vimeo.com" && host !== "player.vimeo.com") {
			return null;
		}
		const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
		return m?.[1] ?? null;
	} catch {
		return null;
	}
}

export function resolveVideoEmbed(
	url: string,
	fallbackTitle: string,
): VideoEmbedResult | null {
	const trimmed = url.trim();
	if (!trimmed) {
		return null;
	}

	const ytEmbed = getYouTubeEmbedUrl(trimmed);
	if (ytEmbed) {
		return {
			kind: "youtube",
			embedSrc: ytEmbed,
			title: fallbackTitle,
		};
	}

	const vm = vimeoId(trimmed);
	if (vm) {
		return {
			kind: "vimeo",
			embedSrc: `https://player.vimeo.com/video/${vm}`,
			title: fallbackTitle,
		};
	}

	// Direct file / Cloudinary / other HTTPS page — use as iframe (admin responsibility)
	if (/^https:\/\//i.test(trimmed)) {
		return {
			kind: "iframe",
			embedSrc: trimmed,
			title: fallbackTitle,
		};
	}

	return null;
}
