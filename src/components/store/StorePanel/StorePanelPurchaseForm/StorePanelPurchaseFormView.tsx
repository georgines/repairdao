import { Button, Stack, Text, TextInput } from "@mantine/core";
import { formatarNumeroCompleto } from "@/services/wallet/formatters";
import styles from "./StorePanelPurchaseFormView.module.css";

type StorePanelPurchaseFormViewProps = {
	rptPreview: string;
	quantityEth: string;
	buying: boolean;
	error: string | null;
	onQuantityEthChange: (value: string) => void;
	onBuy: () => void;
	connected: boolean;
};

export function StorePanelPurchaseFormView({
	rptPreview,
	quantityEth,
	buying,
	error,
	onQuantityEthChange,
	onBuy,
	connected,
}: StorePanelPurchaseFormViewProps) {
	const podeComprar = connected && !buying;
	let errorNode = null;

	if (error !== null) {
		errorNode = (
			<Text size="sm" c="red" role="status" aria-live="assertive" className={styles.error}>
				{error}
			</Text>
		);
	}

	return (
		<Stack gap="sm" className={styles.root}>
			<TextInput
				label="Quanto ETH quer gastar"
				placeholder="0,10"
				inputMode="decimal"
				value={quantityEth}
				onChange={(event) => onQuantityEthChange(event.currentTarget.value)}
			/>
			<Text size="sm" c="dimmed">
				Você receberá cerca de {formatarNumeroCompleto(rptPreview, 2)} RPT
			</Text>

			<Button onClick={onBuy} disabled={!podeComprar} loading={buying}>
				Comprar RPT
			</Button>

			{errorNode}
		</Stack>
	);
}
