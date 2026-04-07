const YT_ID = /^[\w-]{11}$/;

/**
 * Extracts a YouTube video id from watch, youtu.be, embed, shorts, live, or mobile URLs.
 * Returns null if the string is not a recognizable YouTube reference.
 */
export function extractYouTubeVideoId(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) {
		return null;
	}

	if (YT_ID.test(trimmed)) {
		return trimmed;
	}

	try {
		const u = new URL(trimmed);
		const host = u.hostname.replace(/^www\./, "").toLowerCase();

		if (host === "youtu.be") {
			const id = u.pathname.split("/").filter(Boolean)[0];
			return id && YT_ID.test(id) ? id : null;
		}

		if (
			host === "youtube.com" ||
			host === "m.youtube.com" ||
			host === "music.youtube.com" ||
			host.endsWith(".youtube.com")
		) {
			const v = u.searchParams.get("v");
			if (v && YT_ID.test(v)) {
				return v;
			}
			const embed = u.pathname.match(/\/embed\/([\w-]{11})/);
			if (embed?.[1]) {
				return embed[1];
			}
			const shorts = u.pathname.match(/\/shorts\/([\w-]{11})/);
			if (shorts?.[1]) {
				return shorts[1];
			}
			const live = u.pathname.match(/\/live\/([\w-]{11})/);
			if (live?.[1]) {
				return live[1];
			}
		}
	} catch {
		return null;
	}

	return null;
}

/**
 * Returns a canonical embed URL for YouTube, or null if the link is not a valid YouTube URL/id.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
	const id = extractYouTubeVideoId(url);
	if (!id) {
		return null;
	}
	const params = new URLSearchParams({
		rel: "0",
		modestbranding: "1",
		controls: "1",
	});
	return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}
