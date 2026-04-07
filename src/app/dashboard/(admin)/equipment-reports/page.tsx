import { EquipmentDamageAdminView } from "@/features/member-portal/components/equipment-damage-admin-view";
import { getEquipmentDamageReportsForAdmin } from "@/features/member-portal/lib/get-equipment-damage-reports";

export default async function EquipmentReportsAdminPage(): Promise<React.ReactElement> {
	const { reports, missingTable } = await getEquipmentDamageReportsForAdmin();
	return (
		<EquipmentDamageAdminView
			initialReports={reports}
			missingTable={missingTable}
		/>
	);
}
