import { describe, it, expect } from "@jest/globals"

describe("Fee Calculation", () => {
  it("calculates remaining amount correctly", () => {
    const monthlyFee = 1000
    const amountPaid = 600
    const remainAmount = monthlyFee - amountPaid
    expect(remainAmount).toBe(400)
  })

  it("marks as PAID when fully paid", () => {
    const monthlyFee = 1000
    const amountPaid = 1000
    const status = amountPaid >= monthlyFee ? "PAID" : "PENDING"
    expect(status).toBe("PAID")
  })

  it("marks as PARTIAL when partially paid", () => {
    const monthlyFee = 1000
    const amountPaid = 400
    const status = amountPaid >= monthlyFee ? "PAID" : amountPaid > 0 ? "PARTIAL" : "PENDING"
    expect(status).toBe("PARTIAL")
  })
})
