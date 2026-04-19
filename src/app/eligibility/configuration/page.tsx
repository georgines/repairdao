"use client";

import { Alert, Loader, Paper, Stack, Text } from "@mantine/core";
import { DepositConfigurationPanel } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanel";
import { useDepositConfigurationAccess } from "@/hooks/useDepositConfigurationAccess";

export default function DepositConfigurationPage() {
	const access = useDepositConfigurationAccess();

	if (access.loading) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Stack gap="sm">
					<Loader size="sm" />
					<Text size="sm">Carregando pagina administrativa...</Text>
				</Stack>
			</Paper>
		);
	}

	if (!access.connected) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Alert color="yellow" title="Carteira desconectada">
					Conecte a carteira do dono para acessar a configuracao do deposito.
				</Alert>
			</Paper>
		);
	}

	if (access.error) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Alert color="red" title="Falha ao carregar a configuracao">
					{access.error}
				</Alert>
			</Paper>
		);
	}

	if (!access.isOwner) {
		return null;
	}

	return <DepositConfigurationPanel />;
}
