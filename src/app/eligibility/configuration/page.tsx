"use client";

import { Alert, Loader, Paper, Stack, Text } from "@mantine/core";
import { SystemConfigurationPanel } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanel";
import { useSystemConfigurationAccess } from "@/hooks/useSystemConfigurationAccess";

export default function SystemConfigurationPage() {
	const access = useSystemConfigurationAccess();

	if (access.loading) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Stack gap="sm">
					<Loader size="sm" />
					<Text size="sm">Carregando configuracoes do sistema...</Text>
				</Stack>
			</Paper>
		);
	}

	if (!access.connected) {
		return (
			<Paper p="lg" withBorder radius="md">
				<Alert color="yellow" title="Carteira desconectada">
					Conecte a carteira autorizada para acessar as configuracoes do sistema.
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

	return <SystemConfigurationPanel />;
}
