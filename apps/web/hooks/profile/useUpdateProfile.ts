import { useApiMutation } from "../api/useApiMutation";
import {
  UpdateUserSchema,
  type PublicUser,
  type UpdateUser,
} from "@workspace/api";

export function useUpdateProfile() {
  return useApiMutation<PublicUser, UpdateUser>(
    "/users/me",
    ["profileData"],
    UpdateUserSchema,
    {
      method: "put",
      invalidateKeys: [["profileData"]],
    },
  );
}
