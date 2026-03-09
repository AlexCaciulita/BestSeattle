import NearMeClient from "@/components/nearby/near-me-client";

export const metadata = {
  title: "Near Me — BestInSeattle",
  description: "Discover events, restaurants, and things to do near you in Seattle and the PNW.",
};

export const dynamic = "force-dynamic";

export default function NearMePage() {
  return <NearMeClient />;
}
