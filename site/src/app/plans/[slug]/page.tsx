import PlanDetailClient from "@/components/plan-detail-client";
import { getPlanItems } from "@/lib/plan-repo";

export default async function PlanDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await getPlanItems(slug);

  return <PlanDetailClient slug={slug} items={items} />;
}
