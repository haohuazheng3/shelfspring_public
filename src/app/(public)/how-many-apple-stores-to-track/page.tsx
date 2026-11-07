import { planningGuides } from "@/content/planning/guides";
import { PlanningPage, planningMetadata } from "@/components/planning/PlanningPage";
const guide = planningGuides[1];
export const metadata = planningMetadata(guide);
export default function Page() { return <PlanningPage guide={guide} />; }
