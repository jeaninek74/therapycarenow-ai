import { trpc } from "@/lib/trpc";
import { SERVICE_STATE_CODE, SOCAL_COUNTIES } from "@shared/region";

export interface CountyCounts {
  therapists: number;
  psychiatrists: number;
  psychologists: number;
  total: number;
}

/** Southern California provider counts per city and per county (aggregated from city counts). */
export function useCountyDirectory() {
  const { data: cities, isLoading } = trpc.providers.getCitiesForStateByCategory.useQuery({
    stateCode: SERVICE_STATE_CODE,
  });

  const countyMap = new Map<string, CountyCounts>(
    SOCAL_COUNTIES.map((c) => [c.slug, { therapists: 0, psychiatrists: 0, psychologists: 0, total: 0 }])
  );
  for (const city of cities ?? []) {
    const entry = city.county ? countyMap.get(city.county) : undefined;
    if (!entry) continue;
    entry.therapists += city.therapists;
    entry.psychiatrists += city.psychiatrists;
    entry.psychologists += city.psychologists;
    entry.total += city.total;
  }

  return { cities: cities ?? [], countyMap, isLoading };
}
