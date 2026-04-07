import type { Exercise } from "@/server/db/schema/gym-schema";

export type MuscleGroup = Exercise["muscleGroup"];

export const MUSCLE_GROUPS: MuscleGroup[] = [
	"chest",
	"back",
	"legs",
	"shoulders",
	"arms",
	"core",
	"cardio",
	"fullbody",
];

export const muscleGroupLabelEs: Record<MuscleGroup, string> = {
	chest: "Pecho",
	back: "Espalda",
	legs: "Piernas",
	shoulders: "Hombros",
	arms: "Brazos",
	core: "Core",
	cardio: "Cardio",
	fullbody: "Cuerpo completo",
};
