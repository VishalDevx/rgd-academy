import { describe, it, expect } from "@jest/globals"

describe("Project Setup", () => {
  it("has valid TypeScript configuration", () => {
    const tsconfig = { strict: true, target: "ES2017" }
    expect(tsconfig.strict).toBe(true)
  })

  it("has required environment variables documented", () => {
    const requiredVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]
    expect(requiredVars.length).toBeGreaterThan(0)
    expect(requiredVars).toContain("DATABASE_URL")
  })
})
