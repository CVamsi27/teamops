import { Team, TeamSchema } from "@workspace/api";
import { z } from "zod";
import { useApiQuery } from "@/hooks/useApiQuery";

export function useTeam() {
  return useApiQuery<Team[]>(
    ["teams"],
    "/teams",
    z.array(TeamSchema)
  );
}
