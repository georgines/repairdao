import { Badge, Button, Card, Divider, Stack, Text, TextInput, Title } from "@mantine/core";
import { formatarNumero } from "@/services/wallet/formatters";

export type StorePanelViewProps = {
	ethBalance: string;
	rptBalance: string;
	tokensPerEth: string;
	rptPreview: string;
	walletNotice: string | null;
	quantityEth: string;
	buying: boolean;
	error: string | null;
	onQuantityEthChange: (value: string) => void;
	onBuy: () => void;
	connected: boolean;
};

export function StorePanelView({
	ethBalance,
	rptBalance,
	tokensPerEth,
	rptPreview,
	walletNotice,
	quantityEth,
	buying,
	error,
	onQuantityEthChange,
	onBuy,
	connected,
}: StorePanelViewProps) {
	const podeComprar = connected && !buying;

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
						Loja
					</Text>
					<Title order={1}>Trocar ETH por RPT</Title>
				</Stack>

				<Stack gap={2}>
					<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
						Preço atual
					</Text>
					<Badge variant="light" color="green" size="lg">
						1 ETH = {formatarNumero(tokensPerEth, 2)} RPT
					</Badge>
				</Stack>

				<Stack gap={4}>
					<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
						Saldo atual
					</Text>
					<Text size="xl" fw={800}>
						RPT {formatarNumero(rptBalance, 2)}
					</Text>
					<Text size="sm" c="dimmed">
						ETH {formatarNumero(ethBalance, 4)}
					</Text>
					{walletNotice ? (
						<Text size="xs" c="dimmed">
							{walletNotice}
						</Text>
					) : null}
				</Stack>

				<Divider />

				<Stack gap="sm">
					<TextInput
						label="Quanto ETH quer gastar"
						placeholder="0,10"
						inputMode="decimal"
						value={quantityEth}
						onChange={(event) => onQuantityEthChange(event.currentTarget.value)}
					/>
					<Text size="sm" c="dimmed">
						Você receberá cerca de {formatarNumero(rptPreview, 2)} RPT
					</Text>

					<Button onClick={onBuy} disabled={!podeComprar} loading={buying}>
						Comprar RPT
					</Button>
				</Stack>

				{error ? (
					<Text size="sm" c="red" role="status" aria-live="assertive">
						{error}
					</Text>
				) : null}
			</Stack>
		</Card>
	);
}
