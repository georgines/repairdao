import { Button, NumberInput, Stack, Text } from "@mantine/core";

type EligibilityPanelDepositSectionViewProps = {
	quantidadeRpt: string | number | null;
	quantidadeErro: string | null;
	quantidadeMinima: number;
	acaoLabel: string;
	mensagemAcao: string;
	error: string | null;
	onQuantidadeChange: (value: string | number) => void;
	onDeposit: () => void;
	podeDepositar: boolean;
	mostrarBotaoAcao: boolean;
	depositing: boolean;
};

export function EligibilityPanelDepositSectionView({
	quantidadeRpt,
	quantidadeErro,
	quantidadeMinima,
	acaoLabel,
	mensagemAcao,
	error,
	onQuantidadeChange,
	onDeposit,
	podeDepositar,
	mostrarBotaoAcao,
	depositing,
}: EligibilityPanelDepositSectionViewProps) {
	let errorNode = null;

	if (error !== null) {
		errorNode = (
			<Text size="sm" c="red" role="status" aria-live="assertive">
				{error}
			</Text>
		);
	}

	return (
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

			{errorNode}
		</Stack>
	);
}
