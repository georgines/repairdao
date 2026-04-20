import { Group, NumberInput, Rating, Stack, Text, Textarea } from "@mantine/core";
import type { ServiceRequestsPanelModalProps } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";

export function ServiceRequestsPanelModalFieldView({
	requestModalAction,
	requestModalRequest,
	requestModalBudget,
	requestModalRating,
	requestModalDisputeReason,
	onRequestModalBudgetChange,
	onRequestModalRatingChange,
	onRequestModalDisputeReasonChange,
}: ServiceRequestsPanelModalProps) {
	if (!requestModalAction || !requestModalRequest) {
		return null;
	}

	const handleBudgetChange = (value: number | string | null) => {
		onRequestModalBudgetChange(typeof value === "number" ? value : null);
	};
	const getStarLabel = (value: number) => `Avaliar com ${value} estrela${value === 1 ? "" : "s"}`;

	if (requestModalAction === "budget") {
		return (
			<NumberInput
				label="Valor do servico"
				description="Esse valor sera salvo como orcamento da ordem em RPT."
				placeholder="Ex.: 250"
				min={1}
				clampBehavior="strict"
				value={requestModalBudget ?? ""}
				onChange={handleBudgetChange}
			/>
		);
	}

	if (requestModalAction === "rate") {
		return (
			<Stack gap={6}>
				<Text size="sm" fw={500}>
					Nota
				</Text>
				<Group gap="sm" align="center">
					<Rating
						value={requestModalRating}
						onChange={onRequestModalRatingChange}
						count={5}
						allowClear={false}
						getSymbolLabel={getStarLabel}
					/>
					<Text size="sm" c="dimmed">
						{requestModalRating} de 5
					</Text>
				</Group>
			</Stack>
		);
	}

	if (requestModalAction === "dispute") {
		return (
			<Textarea
				label="Motivo da disputa"
				description="Explique o problema com clareza. Esse texto vai espelhar o contrato."
				placeholder="Ex.: o servico nao foi executado conforme combinado."
				minRows={4}
				value={requestModalDisputeReason}
				onChange={(event) => onRequestModalDisputeReasonChange(event.currentTarget.value)}
			/>
		);
	}

	return null;
}
