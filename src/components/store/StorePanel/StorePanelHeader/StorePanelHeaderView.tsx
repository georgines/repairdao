import { Badge, Stack, Text, Title } from "@mantine/core";
import { formatarNumeroCompleto } from "@/services/wallet/formatters";
import styles from "./StorePanelHeaderView.module.css";

type StorePanelHeaderViewProps = {
	tokensPerEth: string;
};

export function StorePanelHeaderView({ tokensPerEth }: StorePanelHeaderViewProps) {
	return (
		<Stack gap={6} className={styles.root}>
			<Text size="xs" tt="uppercase" fw={700} c="dimmed">
				Loja
			</Text>
			<Title order={1}>Trocar ETH por RPT</Title>

			<Stack gap={2} className={styles.priceBlock}>
				<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
					Preço atual
				</Text>
				<Badge variant="light" color="green" size="lg">
					1 ETH = {formatarNumeroCompleto(tokensPerEth, 2)} RPT
				</Badge>
			</Stack>
		</Stack>
	);
}
