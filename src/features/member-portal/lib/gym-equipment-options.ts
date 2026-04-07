/** Opciones del selector de máquinas (Comunidad → reporte de avería). */
export const GYM_EQUIPMENT_OPTIONS = [
	{ value: "Caminadora / cinta", label: "Caminadora / cinta" },
	{ value: "Elíptica", label: "Elíptica" },
	{
		value: "Bicicleta estática / spinning",
		label: "Bicicleta estática / spinning",
	},
	{ value: "Remo / máquina de remo", label: "Remo / máquina de remo" },
	{ value: "Prensa de banca", label: "Prensa de banca" },
	{ value: "Prensa inclinada", label: "Prensa inclinada" },
	{
		value: "Rack de sentadillas / jaula",
		label: "Rack de sentadillas / jaula",
	},
	{ value: "Máquina de piernas", label: "Máquina de piernas" },
	{
		value: "Extensión / curl de piernas",
		label: "Extensión / curl de piernas",
	},
	{ value: "Polea / cruces / jalón", label: "Polea / cruces / jalón" },
	{ value: "Banco / banco declinado", label: "Banco / banco declinado" },
	{ value: "Zona de pesas libres", label: "Zona de pesas libres" },
	{ value: "Otra máquina o zona", label: "Otra máquina o zona" },
] as const;

export type GymEquipmentValue = (typeof GYM_EQUIPMENT_OPTIONS)[number]["value"];
