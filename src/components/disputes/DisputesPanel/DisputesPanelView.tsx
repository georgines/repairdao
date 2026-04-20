import { Card, Stack, Text } from "@mantine/core";
import styles from "./DisputesPanelView.module.css";
import { DisputesPanelHeader } from "@/components/disputes/DisputesPanel/DisputesPanelHeader/DisputesPanelHeader";
import { DisputesPanelFilters } from "@/components/disputes/DisputesPanel/DisputesPanelFilters/DisputesPanelFilters";
import { DisputesPanelTable } from "@/components/disputes/DisputesPanel/DisputesPanelTable/DisputesPanelTable";
import { DisputesPanelModal } from "@/components/disputes/DisputesPanel/DisputesPanelModal/DisputesPanelModal";
import type { DisputesPanelViewProps } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
export function DisputesPanelView({ error, header, filters, table, modal }: DisputesPanelViewProps) {
	const errorNode = error ? (
		<Card withBorder radius="sm" shadow="none" padding="md" className={styles.card}>
			<Text size="sm" c="red" role="status" aria-live="assertive">
				{error}
			</Text>
		</Card>
	) : null;

	return (
		<Stack gap="lg" className={styles.root}>
			<DisputesPanelHeader
				disputes={header.disputes}
				visibleDisputes={header.visibleDisputes}
				connected={header.connected}
				walletAddress={header.walletAddress}
				walletNotice={header.walletNotice}
				perfilAtivo={header.perfilAtivo}
				loading={header.loading}
				onRefresh={header.onRefresh}
			/>

			{errorNode}

			<DisputesPanelFilters
				query={filters.query}
				statusFilter={filters.statusFilter}
				onQueryChange={filters.onQueryChange}
				onStatusFilterChange={filters.onStatusFilterChange}
				onClearFilters={filters.onClearFilters}
			/>

			<DisputesPanelTable
				visibleDisputes={table.visibleDisputes}
				selectedDisputeId={table.selectedDisputeId}
				onSelectDispute={table.onSelectDispute}
			/>

			<DisputesPanelModal {...modal} />
		</Stack>
	);
}
