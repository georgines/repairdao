import { Stack, TextInput } from "@mantine/core";

type EligibilityPanelIdentitySectionViewProps = {
	nome: string;
	areaAtuacao: string;
	identificadorCarteira: string;
	depositing: boolean;
	exibirAreaAtuacao: boolean;
	onNomeChange: (value: string) => void;
	onAreaAtuacaoChange: (value: string) => void;
};

export function EligibilityPanelIdentitySectionView({
	nome,
	areaAtuacao,
	identificadorCarteira,
	depositing,
	exibirAreaAtuacao,
	onNomeChange,
	onAreaAtuacaoChange,
}: EligibilityPanelIdentitySectionViewProps) {
	return (
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
	);
}
