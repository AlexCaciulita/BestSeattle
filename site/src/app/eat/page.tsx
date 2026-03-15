import type { Metadata } from "next";
import EatClient from "@/components/eat/eat-client";

export const metadata: Metadata = {
  title: "Going Out — BestInSeattle",
  description:
    "Discover the best restaurants, cafes, and bars in Seattle. Real-time ratings, photos, and hours powered by Google Places.",
};

export const dynamic = "force-dynamic";

export default function EatPage() {
  return <EatClient />;
}
