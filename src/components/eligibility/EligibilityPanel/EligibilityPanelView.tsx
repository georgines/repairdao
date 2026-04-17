import { Button, Card, Divider, Group, NumberInput, Stack, Text, Title } from "@mantine/core";
import { formatarNumero, formatarUSD } from "@/services/wallet/formatters";

export type EligibilityPanelViewProps = {
	ethBalance: string;
	usdBalance: string;
	rptBalance: string;
	badgeLevel: string;
	isActive: boolean;
	perfilSelecionado: "cliente" | "tecnico";
	quantidadeRpt: string | number;
	quantidadeErro: string | null;
	quantidadeMinima: number;
	acaoLabel: string;
	mensagemAcao: string;
	walletNotice: string | null;
	depositing: boolean;
	error: string | null;
	onPerfilChange: (value: "cliente" | "tecnico") => void;
	onQuantidadeChange: (value: string | number) => void;
	onDeposit: () => void;
	connected: boolean;
};

export function EligibilityPanelView({
	ethBalance,
	usdBalance,
	rptBalance,
	badgeLevel,
	isActive,
	perfilSelecionado,
	quantidadeRpt,
	quantidadeErro,
	quantidadeMinima,
	acaoLabel,
	mensagemAcao,
	walletNotice,
	depositing,
	error,
	onPerfilChange,
	onQuantidadeChange,
	onDeposit,
	connected,
}: EligibilityPanelViewProps) {
	const podeDepositar = connected && !depositing && quantidadeErro === null;

	return (
		<Card
			radius="sm"
			withBorder
			shadow="none"
			padding="lg"
			style={{
				background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
				borderColor: "rgba(15, 23, 42, 0.08)",
			}}
		>
			<Stack gap="lg">
				<Stack gap={6}>
					<Text size="xs" tt="uppercase" fw={700} c="dimmed">
						Elegibilidade
					</Text>
					<Title order={1}>Depositar RPT e ativar conta</Title>
				</Stack>

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

				<Group align="stretch" grow wrap="wrap">
					<Stack gap={4} style={{ flex: "1 1 280px" }}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
							Saldo atual
						</Text>
						<Text size="xl" fw={800}>
							RPT {formatarNumero(rptBalance, 2)}
						</Text>
						<Text size="sm" c="dimmed">
							ETH {formatarNumero(ethBalance, 4)}
						</Text>
						<Text size="sm" c="dimmed">
							USD {formatarUSD(usdBalance)}
						</Text>
						{walletNotice ? (
							<Text size="xs" c="dimmed">
								{walletNotice}
							</Text>
						) : null}
					</Stack>

					<Stack
						gap={6}
						justify="center"
						style={{
							flex: "0 1 240px",
							minWidth: "220px",
							marginLeft: "auto",
							alignItems: "flex-end",
							textAlign: "right",
						}}
					>
						<Text size="xs" tt="uppercase" fw={700} c="dimmed">
							Nivel do {perfilSelecionado}
						</Text>
						<Text size="xl" fw={800}>
							{badgeLevel}
						</Text>
						<Text size="xs" c="dimmed">
							{isActive ? "Conta ativa" : "Aguardando deposito"}
						</Text>
						<Text size="sm" c="dimmed">
							Este e o nivel que sera usado para o {perfilSelecionado}.
						</Text>
					</Stack>
				</Group>

				<Divider />

				<Stack gap="sm">
					<NumberInput
						label="Quanto RPT deseja depositar"
						description={`Valor minimo: ${quantidadeMinima} RPT.`}
						placeholder={`${quantidadeMinima}`}
						value={quantidadeRpt}
						onChange={onQuantidadeChange}
						step={0.1}
						hideControls
						error={quantidadeErro}
					/>

					<Text size="sm" c="dimmed">
						{mensagemAcao}
					</Text>

					<Button onClick={onDeposit} disabled={!podeDepositar} loading={depositing}>
						{acaoLabel}
					</Button>

					{error ? (
						<Text size="sm" c="red" role="status" aria-live="assertive">
							{error}
						</Text>
					) : null}
				</Stack>
			</Stack>
		</Card>
	);
}
