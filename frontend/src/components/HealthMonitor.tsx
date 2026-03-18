import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useEffect } from "react";

export default function HealthMonitor() {
  const { data, error } = useQuery({
    queryKey: ["backend-health"],
    queryFn: () => apiFetch("/health"),
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes
    retry: 2,
    staleTime: 1000 * 60 * 2.5,
  });

  useEffect(() => {
    if (error) {
      console.warn("Backend Health Check Failed:", error);
    }
    if (data) {
      console.log("Backend Status:", data.status);
    }
  }, [data, error]);

  // This component doesn't render anything visible
  return null;
}
