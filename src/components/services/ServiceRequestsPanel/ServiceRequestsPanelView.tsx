import { Stack } from "@mantine/core";
import styles from "./ServiceRequestsPanelView.module.css";
import { ServiceRequestsPanelHeader } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelHeader/ServiceRequestsPanelHeader";
import { ServiceRequestsPanelFilters } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelFilters/ServiceRequestsPanelFilters";
import { ServiceRequestsPanelTable } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelTable/ServiceRequestsPanelTable";
import { ServiceRequestsPanelModal } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModal/ServiceRequestsPanelModal";
import type { ServiceRequestsPanelViewProps } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";
export function ServiceRequestsPanelView({ error, header, filters, table, modal }: ServiceRequestsPanelViewProps) {
	const errorNode = error ? (
		<div className={styles.errorCard} role="status" aria-live="assertive">
			{error}
		</div>
	) : null;

	return (
		<Stack gap="lg" className={styles.root}>
			<ServiceRequestsPanelHeader
				connected={header.connected}
				walletAddress={header.walletAddress}
				walletNotice={header.walletNotice}
				perfilAtivo={header.perfilAtivo}
				clientRequests={header.clientRequests}
				visibleRequests={header.visibleRequests}
				loading={header.loading}
				onRefresh={header.onRefresh}
			/>

			{errorNode}

			<ServiceRequestsPanelFilters
				query={filters.query}
				statusFilter={filters.statusFilter}
				visibleRequests={filters.visibleRequests}
				onQueryChange={filters.onQueryChange}
				onStatusFilterChange={filters.onStatusFilterChange}
				onClearFilters={filters.onClearFilters}
			/>

			<ServiceRequestsPanelTable
				connected={table.connected}
				visibleRequests={table.visibleRequests}
				perfilAtivo={table.perfilAtivo}
				walletAddress={table.walletAddress}
				busyRequestId={table.busyRequestId}
				onOpenRequestModal={table.onOpenRequestModal}
			/>

			<ServiceRequestsPanelModal {...modal} />
		</Stack>
	);
}
