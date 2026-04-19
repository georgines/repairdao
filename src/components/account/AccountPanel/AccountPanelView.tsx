import { Badge, Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { BalanceSummary } from "@/components/balance/BalanceSummary";
import { AccountActionsCard } from "@/components/account/AccountPanel/AccountActionsCard";
import { AccountMetricCard } from "@/components/account/AccountPanel/AccountMetricCard";
import { AccountRatingsCard } from "@/components/account/AccountPanel/AccountRatingsCard";
import { formatarNumeroCompleto } from "@/services/wallet/formatters";

export type AccountPanelViewProps = {
	walletAddress: string | null;
	walletNotice: string | null;
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
	deposit: string;
	rewards: string;
	badgeLevel: string;
	reputationLevelName: string;
	perfilAtivo: "cliente" | "tecnico" | null;
	isActive: boolean;
	totalPoints: string;
	positiveRatings: string;
	negativeRatings: string;
	totalRatings: string;
	ratingSum: string;
	averageRating: string;
	withdrawingDeposit: boolean;
	withdrawingRewards: boolean;
	error: string | null;
	canWithdrawDeposit: boolean;
	canWithdrawRewards: boolean;
	onWithdrawDeposit: () => void;
	onWithdrawRewards: () => void;
	connected: boolean;
};

export function AccountPanelView({
	walletAddress,
	walletNotice,
	ethBalance,
	usdBalance,
	ethUsdPrice,
	tokensPerEth,
	rptBalance,
	deposit,
	rewards,
	badgeLevel,
	reputationLevelName,
	perfilAtivo,
	isActive,
	totalPoints,
	positiveRatings,
	negativeRatings,
	totalRatings,
	ratingSum,
	averageRating,
	withdrawingDeposit,
	withdrawingRewards,
	error,
	canWithdrawDeposit,
	canWithdrawRewards,
	onWithdrawDeposit,
	onWithdrawRewards,
	connected,
}: AccountPanelViewProps) {
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
						Conta
					</Text>
					<Title order={1}>Meu dinheiro depositado, rendimento, nivel e minhas avaliacoes</Title>
					<Text size="sm" c="dimmed">
						Resumo centralizado para acompanhar o saldo travado, os rendimentos acumulados, o nivel atual e o historico de avaliacoes.
					</Text>
				</Stack>

				<Group gap="xs">
					<Badge variant="light" color={isActive ? "teal" : "gray"}>
						{isActive ? "Conta ativa" : "Conta inativa"}
					</Badge>
					<Badge variant="light" color="blue">
						Nivel {badgeLevel}
					</Badge>
					{perfilAtivo ? (
						<Badge variant="light" color="orange">
							Perfil {perfilAtivo}
						</Badge>
					) : null}
					</Group>

				<Card withBorder shadow="none" radius="md" padding="md" style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(15, 23, 42, 0.08)" }}>
					<BalanceSummary
						rptBalance={rptBalance}
						tokensPerEth={tokensPerEth}
						ethUsdPrice={ethUsdPrice}
						ethBalance={ethBalance}
						usdBalance={usdBalance}
						note={walletNotice}
					/>
				</Card>

				<Grid>
					<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
						<AccountMetricCard
							label="Deposito"
							value={`RPT ${formatarNumeroCompleto(deposit, 2)}`}
							description="Valor atualmente travado no contrato."
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
						<AccountMetricCard
							label="Rendimento"
							value={`RPT ${formatarNumeroCompleto(rewards, 2)}`}
							description="Valor liberado para saque sem afetar o deposito."
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
						<AccountMetricCard
							label="Nivel"
							value={`${reputationLevelName}`}
							description={`Pontos acumulados: ${totalPoints}`}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
						<AccountMetricCard
							label="Avaliacoes"
							value={`${averageRating}/5`}
							description={`${positiveRatings} positivas, ${negativeRatings} negativas, ${totalRatings} total.`}
						/>
					</Grid.Col>
				</Grid>

				<AccountRatingsCard
					walletAddress={walletAddress}
					averageRating={averageRating}
					positiveRatings={positiveRatings}
					negativeRatings={negativeRatings}
					totalRatings={totalRatings}
					ratingSum={ratingSum}
				/>

				<AccountActionsCard
					walletNotice={walletNotice}
					withdrawingDeposit={withdrawingDeposit}
					withdrawingRewards={withdrawingRewards}
					error={error}
					canWithdrawDeposit={canWithdrawDeposit}
					canWithdrawRewards={canWithdrawRewards}
					onWithdrawDeposit={onWithdrawDeposit}
					onWithdrawRewards={onWithdrawRewards}
					connected={connected}
				/>
			</Stack>
		</Card>
	);
}
