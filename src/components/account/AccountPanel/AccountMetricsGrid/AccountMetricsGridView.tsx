import { AccountMetricCard } from "@/components/account/AccountPanel/AccountMetricCard/AccountMetricCard";
import { formatarNumeroCompleto } from "@/services/wallet/formatters";
import styles from "./AccountMetricsGridView.module.css";

type AccountMetricsGridViewProps = {
	deposit: string;
	rewards: string;
	reputationLevelName: string;
	totalPoints: string;
	averageRating: string;
	positiveRatings: string;
	negativeRatings: string;
	totalRatings: string;
};

export function AccountMetricsGridView({
	deposit,
	rewards,
	reputationLevelName,
	totalPoints,
	averageRating,
	positiveRatings,
	negativeRatings,
	totalRatings,
}: AccountMetricsGridViewProps) {
	return (
		<div className={styles.grid}>
			<div className={`${styles.cell} ${styles.cellHalf} ${styles.cellQuarter}`}>
				<AccountMetricCard
					label="Deposito"
					value={`RPT ${formatarNumeroCompleto(deposit, 2)}`}
					description="Valor atualmente travado no contrato."
				/>
			</div>
			<div className={`${styles.cell} ${styles.cellHalf} ${styles.cellQuarter}`}>
				<AccountMetricCard
					label="Rendimento"
					value={`RPT ${formatarNumeroCompleto(rewards, 2)}`}
					description="Valor liberado para saque sem afetar o deposito."
				/>
			</div>
			<div className={`${styles.cell} ${styles.cellHalf} ${styles.cellQuarter}`}>
				<AccountMetricCard
					label="Nivel"
					value={reputationLevelName}
					description={`Pontos acumulados: ${totalPoints}`}
				/>
			</div>
			<div className={`${styles.cell} ${styles.cellHalf} ${styles.cellQuarter}`}>
				<AccountMetricCard
					label="Avaliacoes"
					value={`${averageRating}/5`}
					description={`${positiveRatings} positivas, ${negativeRatings} negativas, ${totalRatings} total.`}
				/>
			</div>
		</div>
	);
}
