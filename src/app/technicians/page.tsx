import { TechnicianDiscoveryPanel } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanel";
import { loadTechniciansForDiscovery } from "@/services/users";

export const dynamic = "force-dynamic";

export default async function TechniciansPage() {
	const initialTechnicians = await loadTechniciansForDiscovery();

	return <TechnicianDiscoveryPanel initialTechnicians={initialTechnicians} />;
}
