import { Button, Card, Divider, Group, NumberInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { BalanceSummary } from "@/components/balance/BalanceSummary";

export type EligibilityPanelViewProps = {
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
	badgeLevel: string;
	isActive: boolean;
	perfilAtivo: "cliente" | "tecnico" | null;
	mostrarSeletoresPapel: boolean;
	perfilSelecionado: "cliente" | "tecnico";
	perfilConfirmacao: "cliente" | "tecnico";
	nome: string;
	areaAtuacao: string;
	identificadorCarteira: string;
	quantidadeRpt: string | number | null;
	quantidadeErro: string | null;
	quantidadeMinima: number;
	acaoLabel: string;
	mensagemAcao: string;
	walletNotice: string | null;
	depositing: boolean;
	error: string | null;
	onPerfilChange: (value: "cliente" | "tecnico") => void;
	onNomeChange: (value: string) => void;
	onAreaAtuacaoChange: (value: string) => void;
	onQuantidadeChange: (value: string | number) => void;
	onDeposit: () => void;
	connected: boolean;
};

export function EligibilityPanelView({
	ethBalance,
	usdBalance,
	ethUsdPrice,
	tokensPerEth,
	rptBalance,
	badgeLevel,
	isActive,
	perfilAtivo,
	mostrarSeletoresPapel,
	perfilSelecionado,
	perfilConfirmacao,
	nome,
	areaAtuacao,
	identificadorCarteira,
	quantidadeRpt,
	quantidadeErro,
	quantidadeMinima,
	acaoLabel,
	mensagemAcao,
	walletNotice,
	depositing,
	error,
	onPerfilChange,
	onNomeChange,
	onAreaAtuacaoChange,
	onQuantidadeChange,
	onDeposit,
	connected,
}: EligibilityPanelViewProps) {
	const quantidadeTexto =
		typeof quantidadeRpt === "number"
			? String(quantidadeRpt)
			: typeof quantidadeRpt === "string"
				? quantidadeRpt.trim()
				: "";
	const quantidadeNumerica = Number(quantidadeTexto.replace(",", "."));
	const quantidadeValida =
		quantidadeTexto !== "" && Number.isFinite(quantidadeNumerica) && quantidadeNumerica >= quantidadeMinima;
	const precisaAreaAtuacao = isActive ? perfilAtivo === "cliente" : perfilConfirmacao === "tecnico";
	const podeDepositar =
		connected &&
		!depositing &&
		quantidadeValida &&
		quantidadeErro === null &&
		nome.trim().length > 0 &&
		(!precisaAreaAtuacao || areaAtuacao.trim().length > 0);
	const mostrarBotaoAcao = !isActive || podeDepositar;
	const perfilExibido = perfilAtivo ?? perfilSelecionado;
	const exibirAreaAtuacao = precisaAreaAtuacao;

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

				{mostrarSeletoresPapel ? (
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
				) : (
					<Stack gap={4}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
							Papel registrado
						</Text>
						<Text size="sm" c="dimmed">
							O seletor fica oculto porque a conta ja esta ativa. Use o botao abaixo para trocar de cliente para tecnico ou de tecnico para cliente.
						</Text>
					</Stack>
				)}

				<Stack gap="sm">
					<TextInput
						label="Nome do usuario"
						description="Esse nome sera salvo no cadastro e usado na descoberta."
						placeholder="Digite seu nome"
						value={nome}
						onChange={(event) => onNomeChange(event.currentTarget.value)}
						required
						disabled={depositing}
					/>

					{exibirAreaAtuacao ? (
						<TextInput
							label="Area de atuacao"
							description="Obrigatoria para tecnicos."
							placeholder="Ex.: eletrica residencial"
							value={areaAtuacao}
							onChange={(event) => onAreaAtuacaoChange(event.currentTarget.value)}
							required
							disabled={depositing}
						/>
					) : null}

					<TextInput
						label="Identificador da carteira"
						description="Endereco usado nas transacoes entre cliente e tecnico."
						value={identificadorCarteira || "Carteira desconectada"}
						readOnly
						disabled
					/>
				</Stack>

				<Group align="stretch" grow wrap="wrap">
					<BalanceSummary
						rptBalance={rptBalance}
						tokensPerEth={tokensPerEth}
						ethUsdPrice={ethUsdPrice}
						ethBalance={ethBalance}
						usdBalance={usdBalance}
						note={walletNotice}
						style={{ flex: "1 1 280px" }}
					/>

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
							Nivel do {perfilExibido}
						</Text>
						<Text size="xl" fw={800}>
							{badgeLevel}
						</Text>
						<Text size="xs" c="dimmed">
							{isActive ? "Conta ativa" : "Aguardando deposito"}
						</Text>
						<Text size="sm" c="dimmed">
							Este e o nivel que sera usado para o {perfilExibido}.
						</Text>
					</Stack>
				</Group>

				<Divider />

				<Stack gap="sm">
					<NumberInput
						label="Quanto RPT deseja depositar"
						description={`Valor minimo: ${quantidadeMinima} RPT.`}
						placeholder="Digite um valor"
						value={quantidadeRpt ?? undefined}
						onChange={onQuantidadeChange}
						step={0.1}
						hideControls
						error={quantidadeErro}
					/>

					<Text size="sm" c="dimmed">
						{mensagemAcao}
					</Text>

					{mostrarBotaoAcao ? (
						<Button onClick={onDeposit} disabled={!podeDepositar} loading={depositing}>
							{acaoLabel}
						</Button>
					) : null}

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
