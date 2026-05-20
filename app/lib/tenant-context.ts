import { getServerSession } from "next-auth"
import { authOption } from "@/app/lib/auth"

export async function getCurrentOrganization(): Promise<string | null> {
  const session = await getServerSession(authOption)
  return session?.user?.organizationId ?? null
}
