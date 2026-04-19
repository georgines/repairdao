import { Button, Group, Stack, Text } from "@mantine/core";

type EligibilityPanelRoleSectionViewProps = {
	mostrarSeletoresPapel: boolean;
	perfilSelecionado: "cliente" | "tecnico";
	onPerfilChange: (value: "cliente" | "tecnico") => void;
};

export function EligibilityPanelRoleSectionView({
	mostrarSeletoresPapel,
	perfilSelecionado,
	onPerfilChange,
}: EligibilityPanelRoleSectionViewProps) {
	if (mostrarSeletoresPapel) {
		return (
			<Stack gap={4}>
				<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
					Definir papel
				</Text>
				<Text size="sm" c="dimmed">
					Escolha se este deposito vai ativar a conta como cliente ou tecnico.
				</Text>
				<Group grow wrap="nowrap">
					<Button
						variant={perfilSelecionado === "cliente" ? "filled" : "light"}
						onClick={() => onPerfilChange("cliente")}
						radius="md"
					>
						Cliente
					</Button>
					<Button
						variant={perfilSelecionado === "tecnico" ? "filled" : "light"}
						onClick={() => onPerfilChange("tecnico")}
						radius="md"
					>
						Tecnico
					</Button>
				</Group>
			</Stack>
		);
	}

	return (
		<Stack gap={4}>
			<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
				Papel registrado
			</Text>
			<Text size="sm" c="dimmed">
				O seletor fica oculto porque a conta ja esta ativa. Use o botao abaixo para trocar de cliente para tecnico ou de tecnico para cliente.
			</Text>
		</Stack>
	);
}
