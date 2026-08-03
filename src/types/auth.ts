import type { CampusRole } from "@/config/roles";

export type CampusUser = {
  id: string;
  email: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  role: CampusRole;
  profileImage: string | null;
  status: "active" | "inactive" | "pending";
  relationshipNote: string | null;
  profileComplete: boolean;
  initials: string;
};

export type AuthSession = {
  user: CampusUser;
};
