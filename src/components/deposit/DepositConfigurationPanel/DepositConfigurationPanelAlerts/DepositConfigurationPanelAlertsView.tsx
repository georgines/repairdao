import { Stack } from "@mantine/core";
import styles from "./DepositConfigurationPanelAlertsView.module.css";
import { DepositConfigurationPanelFormError } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormError/DepositConfigurationPanelFormError";
import { DepositConfigurationPanelLoadError } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelLoadError/DepositConfigurationPanelLoadError";

type DepositConfigurationPanelAlertsViewProps = {
	error: string | null;
	formError: string | null;
};

export function DepositConfigurationPanelAlertsView({ error, formError }: DepositConfigurationPanelAlertsViewProps) {
	return (
		<Stack gap="sm" className={styles.root}>
			{error ? <DepositConfigurationPanelLoadError message={error} /> : null}
			{formError ? <DepositConfigurationPanelFormError message={formError} /> : null}
		</Stack>
	);
}
