import { AccountPanelHeaderView } from "@/components/account/AccountPanel/AccountPanelHeader/AccountPanelHeaderView";

type AccountPanelHeaderProps = {
	badgeLevel: string;
	isActive: boolean;
	perfilAtivo: "cliente" | "tecnico" | null;
};

export function AccountPanelHeader(props: AccountPanelHeaderProps) {
	return <AccountPanelHeaderView {...props} />;
}
