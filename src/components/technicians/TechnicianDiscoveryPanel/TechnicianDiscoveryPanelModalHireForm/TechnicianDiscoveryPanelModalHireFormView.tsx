"use client";

import { Button, Card, Group, Stack, Text, Textarea } from "@mantine/core";
import styles from "./TechnicianDiscoveryPanelModalHireFormView.module.css";

type TechnicianDiscoveryPanelModalHireFormViewProps = {
	serviceDescription: string;
	submittingRequest: boolean;
	requestError: string | null;
	onCloseTechnicianModal: () => void;
	onServiceDescriptionChange: (value: string) => void;
	onConfirmTechnicianHire: () => Promise<void>;
};

export function TechnicianDiscoveryPanelModalHireFormView({
	serviceDescription,
	submittingRequest,
	requestError,
	onCloseTechnicianModal,
	onServiceDescriptionChange,
	onConfirmTechnicianHire,
}: TechnicianDiscoveryPanelModalHireFormViewProps) {
	return (
		<Card withBorder radius="md" padding="md" shadow="none" className={styles.root}>
			<Stack gap="sm">
				<Text size="sm">Descreva o servico para abrir uma ordem de servico para este tecnico.</Text>
				<Textarea
					label="Descricao do servico"
					placeholder="Explique o problema, o local e o que precisa ser feito."
					minRows={4}
					value={serviceDescription}
					onChange={(event) => onServiceDescriptionChange(event.currentTarget.value)}
				/>
				{requestError ? (
					<Text size="sm" c="red" role="status" aria-live="assertive">
						{requestError}
					</Text>
				) : null}
				<Group justify="flex-end">
					<Button variant="light" onClick={onCloseTechnicianModal}>
						Cancelar
					</Button>
					<Button
						onClick={() => void onConfirmTechnicianHire()}
						loading={submittingRequest}
						disabled={!serviceDescription.trim()}
					>
						Contratar tecnico
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}

