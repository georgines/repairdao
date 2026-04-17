import { Button, Card, Divider, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { formatarUSD } from "@/services/wallet";
import { formatarNumero } from "@/services/wallet/formatters";

export type StorePanelViewProps = {
	ethBalance: string;
	usdBalance: string;
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
	usdBalance,
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
					<Text size="sm" fw={600}>
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

				<Divider />

				<Stack gap="sm">
					<TextInput
						label="Quantidade em ETH"
						placeholder="0,10"
						inputMode="decimal"
						value={quantityEth}
						onChange={(event) => onQuantityEthChange(event.currentTarget.value)}
					/>

					<Group grow align="stretch">
						<Button onClick={onBuy} disabled={!podeComprar} loading={buying}>
							Trocar ETH por RPT
						</Button>
					</Group>
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
