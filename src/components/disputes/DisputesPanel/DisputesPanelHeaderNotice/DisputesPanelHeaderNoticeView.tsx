import { Button, Group, Text } from "@mantine/core";
import styles from "./DisputesPanelHeaderNoticeView.module.css";

type DisputesPanelHeaderNoticeViewProps = {
	walletNotice: string | null;
	loading: boolean;
	onRefresh: () => void;
};

export function DisputesPanelHeaderNoticeView({ walletNotice, loading, onRefresh }: DisputesPanelHeaderNoticeViewProps) {
	return (
		<Group justify="space-between" align="center" wrap="nowrap" className={styles.root}>
			<Text size="sm" c="dimmed">
				{walletNotice ?? "Selecione uma disputa para abrir o modal e interagir."}
			</Text>

			<Button type="button" variant="light" onClick={onRefresh} loading={loading}>
				Atualizar
			</Button>
		</Group>
	);
}

