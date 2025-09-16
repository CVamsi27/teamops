import { Team, CreateTeam, CreateTeamSchema } from "@workspace/api";
import { useApiMutation } from "@/hooks/useApiMutation";

export function useCreateTeam() {
  return useApiMutation<Team, CreateTeam>("/teams", ["teams"], CreateTeamSchema);
}
