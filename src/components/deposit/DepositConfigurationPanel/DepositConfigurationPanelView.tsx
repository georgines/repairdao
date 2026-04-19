"use client";

import { Alert, Badge, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { formatarRPT } from "@/services/wallet/formatters";

type DepositConfigurationPanelViewProps = {
	loading: boolean;
	error: string | null;
	formError: string | null;
	connected: boolean;
	isOwner: boolean;
	walletAddress: string | null;
	donoAtualCurto: string;
	minDeposit: string;
	editingMinDeposit: string;
	saving: boolean;
	onEditingMinDepositChange: (value: string) => void;
	onSubmit: () => Promise<void>;
};

export function DepositConfigurationPanelView({
	loading,
	error,
	formError,
	connected,
	isOwner,
	walletAddress,
	donoAtualCurto,
	minDeposit,
	editingMinDeposit,
	saving,
	onEditingMinDepositChange,
	onSubmit,
}: DepositConfigurationPanelViewProps) {
	if (loading) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Group gap="sm" align="center">
					<Loader size="sm" />
					<Text size="sm">Carregando configuracao do deposito...</Text>
				</Group>
			</Paper>
		);
	}

	return (
		<Paper p="lg" withBorder radius="md">
			<Stack gap="md">
				<Stack gap={4}>
					<Group justify="space-between" align="flex-start">
						<Stack gap={2}>
							<Title order={3}>Deposito minimo para ativacao</Title>
							<Text size="sm" c="dimmed">
								Somente o dono do contrato pode alterar este valor.
							</Text>
						</Stack>

						<Badge variant="light" color={isOwner ? "teal" : "gray"}>
							{isOwner ? "Dono autenticado" : "Apenas leitura"}
						</Badge>
					</Group>

					<Text size="sm">
						Valor atual: <strong>{formatarRPT(minDeposit)}</strong>
					</Text>
					<Text size="sm" c="dimmed">
						Dono do contrato: {donoAtualCurto}
					</Text>
					<Text size="sm" c="dimmed">
						Carteira conectada: {walletAddress ?? "Carteira desconectada"}
					</Text>
				</Stack>

				{error ? <Alert color="red" title="Falha ao carregar">{error}</Alert> : null}
				{formError ? <Alert color="red" title="Nao foi possivel salvar">{formError}</Alert> : null}

				<TextInput
					label="Deposito minimo (RPT)"
					description="Use o valor em RPT que a conta precisa depositar para ficar ativa."
					value={editingMinDeposit}
					onChange={(event) => onEditingMinDepositChange(event.currentTarget.value)}
					disabled={!connected || !isOwner || saving}
					rightSection={<Text size="xs" c="dimmed">RPT</Text>}
				/>

				<Group justify="space-between" align="center">
					<Text size="sm" c="dimmed">
						{connected ? "Alteracao sera enviada ao contrato e espelhada no banco." : "Conecte a carteira para alterar."}
					</Text>
					<Button onClick={() => void onSubmit()} loading={saving} disabled={!connected || !isOwner}>
						Salvar no contrato
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
}

