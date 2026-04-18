"use client";

import { Group, Loader, Rating, Text } from "@mantine/core";

export type RatingSummaryViewProps = {
	averageRating: string | number;
	totalRatings: string | number;
	loading?: boolean;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
};

function normalizarNumero(valor: string | number) {
	if (typeof valor === "number") {
		return Number.isFinite(valor) ? valor : 0;
	}

	const parsed = Number(valor.replace(",", "."));
	return Number.isFinite(parsed) ? parsed : 0;
}

function converterNotaParaEstrelas(averageRating: number, totalRatings: number) {
	if (totalRatings <= 0) {
		return 5;
	}

	return Math.min(5, Math.max(0, Math.round(averageRating)));
}

export function RatingSummaryView({ averageRating, totalRatings, loading = false, size = "sm" }: RatingSummaryViewProps) {
	const media = normalizarNumero(averageRating);
	const total = normalizarNumero(totalRatings);
	const hasRatings = total > 0;
	const stars = hasRatings ? converterNotaParaEstrelas(media, total) : 5;

	if (loading && total <= 0) {
		return (
			<Group gap={4} aria-label="Reputacao carregando">
				<Loader size="xs" />
				<Text size="xs" c="dimmed">
					Carregando
				</Text>
			</Group>
		);
	}

	return (
		<Group gap={4} aria-label={`Reputacao ${stars} de 5, ${total} avaliacoes`}>
			<Rating value={stars} readOnly size={size} color={hasRatings ? "yellow" : "gray"} />
			<Text size="sm" c="dimmed">
				({total})
			</Text>
		</Group>
	);
}
