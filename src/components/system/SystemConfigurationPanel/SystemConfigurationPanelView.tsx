"use client";

import { Alert, Badge, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { formatarRPT } from "@/services/wallet/formatters";

type SystemConfigurationPanelViewProps = {
	loading: boolean;
	error: string | null;
	minDepositError: string | null;
	tokensPerEthError: string | null;
	connected: boolean;
	isDepositOwner: boolean;
	isTokenOwner: boolean;
	walletAddress: string | null;
	donoDepositoAtualCurto: string;
	donoTokenAtualCurto: string;
	minDeposit: string;
	editingMinDeposit: string;
	savingMinDeposit: boolean;
	tokensPerEth: string;
	editingTokensPerEth: string;
	savingTokensPerEth: boolean;
	onEditingMinDepositChange: (value: string) => void;
	onEditingTokensPerEthChange: (value: string) => void;
	onSubmitMinDeposit: () => Promise<void>;
	onSubmitTokensPerEth: () => Promise<void>;
};

function renderBadge(isOwner: boolean, label: string) {
	return (
		<Badge variant="light" color={isOwner ? "teal" : "gray"}>
			{label}
		</Badge>
	);
}

export function SystemConfigurationPanelView({
	loading,
	error,
	minDepositError,
	tokensPerEthError,
	connected,
	isDepositOwner,
	isTokenOwner,
	walletAddress,
	donoDepositoAtualCurto,
	donoTokenAtualCurto,
	minDeposit,
	editingMinDeposit,
	savingMinDeposit,
	tokensPerEth,
	editingTokensPerEth,
	savingTokensPerEth,
	onEditingMinDepositChange,
	onEditingTokensPerEthChange,
	onSubmitMinDeposit,
	onSubmitTokensPerEth,
}: SystemConfigurationPanelViewProps) {
	if (loading) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Group gap="sm" align="center">
					<Loader size="sm" />
					<Text size="sm">Carregando configuracoes do sistema...</Text>
				</Group>
			</Paper>
		);
	}

	return (
		<Paper p="lg" withBorder radius="md">
			<Stack gap="lg">
				<Stack gap={4}>
					<Group justify="space-between" align="flex-start">
						<Stack gap={2}>
							<Title order={3}>Configuracoes do sistema</Title>
							<Text size="sm" c="dimmed">
								A blockchain e a fonte de verdade. O banco apenas espelha o estado dos contratos.
							</Text>
						</Stack>

						{isDepositOwner || isTokenOwner
							? renderBadge(true, isDepositOwner && isTokenOwner ? "Dono autenticado" : "Acesso parcial")
							: renderBadge(false, "Apenas leitura")}
					</Group>

					<Text size="sm">
						Deposito minimo atual: <strong>{formatarRPT(minDeposit)}</strong>
					</Text>
					<Text size="sm">
						Taxa atual: <strong>1 ETH = {tokensPerEth} RPT</strong>
					</Text>
					<Text size="sm" c="dimmed">
						Dono do deposito: {donoDepositoAtualCurto}
					</Text>
					<Text size="sm" c="dimmed">
						Dono da taxa de cambio: {donoTokenAtualCurto}
					</Text>
					<Text size="sm" c="dimmed">
						Carteira conectada: {walletAddress ?? "Carteira desconectada"}
					</Text>
				</Stack>

				{error ? <Alert color="red" title="Falha ao carregar">{error}</Alert> : null}

				<Stack gap="md">
					<Stack gap={4}>
						<Title order={4}>Deposito minimo</Title>
						<Text size="sm" c="dimmed">
							Valor exigido para ativacao da conta.
						</Text>
					</Stack>

					{minDepositError ? <Alert color="red" title="Nao foi possivel salvar">{minDepositError}</Alert> : null}

					<TextInput
						label="Deposito minimo (RPT)"
						description="Use o valor em RPT que a conta precisa depositar para ficar ativa."
						value={editingMinDeposit}
						onChange={(event) => onEditingMinDepositChange(event.currentTarget.value)}
						disabled={!connected || !isDepositOwner || savingMinDeposit}
						rightSection={<Text size="xs" c="dimmed">RPT</Text>}
					/>

					<Group justify="space-between" align="center">
						<Text size="sm" c="dimmed">
							{connected ? "A alteracao sera enviada ao contrato e depois espelhada no banco." : "Conecte a carteira para alterar."}
						</Text>
						<Button onClick={() => void onSubmitMinDeposit()} loading={savingMinDeposit} disabled={!connected || !isDepositOwner}>
							Salvar deposito minimo
						</Button>
					</Group>
				</Stack>

				<Stack gap="md">
					<Stack gap={4}>
						<Title order={4}>Taxa de cambio ETH para RPT</Title>
						<Text size="sm" c="dimmed">
							Quantidade de RPT emitida para cada 1 ETH.
						</Text>
					</Stack>

					{tokensPerEthError ? <Alert color="red" title="Nao foi possivel salvar">{tokensPerEthError}</Alert> : null}

					<TextInput
						label="Taxa de cambio (RPT por ETH)"
						description="Informe quantos RPT o contrato deve emitir para cada ETH recebido."
						value={editingTokensPerEth}
						onChange={(event) => onEditingTokensPerEthChange(event.currentTarget.value)}
						disabled={!connected || !isTokenOwner || savingTokensPerEth}
						rightSection={<Text size="xs" c="dimmed">RPT</Text>}
					/>

					<Group justify="space-between" align="center">
						<Text size="sm" c="dimmed">
							{connected ? "A alteracao sera enviada ao contrato e depois espelhada no banco." : "Conecte a carteira para alterar."}
						</Text>
						<Button onClick={() => void onSubmitTokensPerEth()} loading={savingTokensPerEth} disabled={!connected || !isTokenOwner}>
							Salvar taxa de cambio
						</Button>
					</Group>
				</Stack>
			</Stack>
		</Paper>
	);
}
