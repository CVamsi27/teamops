import {
  type CreateInvite,
  type AcceptInvite,
  type Invite,
  CreateInviteSchema,
  AcceptInviteSchema,
} from "@workspace/api";
import { useApiMutation } from "./useApiMutation";

export function useInvites() {
  const create = useApiMutation<Invite, CreateInvite>(
    "/invites",
    ["invites"],
    CreateInviteSchema,
    {
      invalidateKeys: [["teams"]],
    },
  );

  const accept = useApiMutation<any, AcceptInvite>(
    "/invites/accept",
    ["invites"],
    AcceptInviteSchema,
    {
      invalidateKeys: [["me"], ["teams"]],
    },
  );

  return { create, accept };
}
