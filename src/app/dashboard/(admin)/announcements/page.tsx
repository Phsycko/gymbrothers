import { AnnouncementsAdminView } from "@/features/announcements/components/announcements-admin-view";
import { getAnnouncements } from "@/features/announcements/lib/get-announcements";

export default async function AnnouncementsPage(): Promise<React.ReactElement> {
	const { announcements, missingTable } = await getAnnouncements();
	return (
		<AnnouncementsAdminView
			initialAnnouncements={announcements}
			missingTable={missingTable}
		/>
	);
}
