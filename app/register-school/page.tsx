"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Check, ArrowLeft, ArrowRight, GraduationCap, Building2, User, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio"

interface Plan {
  id: string
  name: string
  code: string
  description: string | null
  priceMonthly: number
  priceYearly: number
  maxStudents: number
  maxStaff: number
  maxBranches: number
}

export default function RegisterSchoolPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPlan = searchParams.get("plan") || "trial"

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [form, setForm] = useState({
    schoolName: "",
    address: "",
    city: "",
    state: "",
    adminName: "",
    adminEmail: "",
    phone: "",
    password: "",
    planCode: preselectedPlan,
  })

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPlans)
      .catch(() => toast.error("Failed to load plans"))
  }, [])

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const selectedPlan = plans.find((p) => p.code === form.planCode)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Registration failed")

      if (data.isPaid) {
        // Redirect to payment page
        router.push(`/payment?org=${data.slug}&amount=${data.planPrice}`)
      } else {
        toast.success("School registered! Redirecting to login...")
        router.push("/login")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const canNext = () => {
    if (step === 1) return form.schoolName.length >= 2
    if (step === 2) return form.adminName.length >= 2 && form.adminEmail.includes("@") && form.password.length >= 6
    if (step === 3) return !!form.planCode
    return true
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Register Your School</CardTitle>
          <CardDescription>Get started with your 14-day free trial</CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > s ? "bg-primary text-primary-foreground" : step === s ? "bg-primary/20 text-primary border border-primary" : "bg-muted text-muted-foreground"}`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">School Details</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name *</Label>
                <Input id="schoolName" placeholder="e.g. Green Valley School" value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="School address" value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="State" value={form.state} onChange={(e) => update("state", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Admin Account</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Your Name *</Label>
                <Input id="adminName" placeholder="e.g. Rajesh Kumar" value={form.adminName} onChange={(e) => update("adminName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address *</Label>
                <Input id="adminEmail" type="email" placeholder="admin@school.com" value={form.adminEmail} onChange={(e) => update("adminEmail", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password * (min 6 characters)</Label>
                <Input id="password" type="password" placeholder="Create a strong password" value={form.password} onChange={(e) => update("password", e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Choose Your Plan</h3>
              </div>
              <RadioGroup value={form.planCode} onValueChange={(v) => update("planCode", v)} className="space-y-3">
                {plans.filter((p) => p.code !== "enterprise").map((plan) => (
                  <label key={plan.id} className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${form.planCode === plan.code ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <RadioGroupItem value={plan.code} id={plan.code} />
                    <div className="flex-1">
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">{plan.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{plan.priceMonthly === 0 ? "Free" : `₹${plan.priceMonthly.toLocaleString()}/mo`}</div>
                      <div className="text-xs text-muted-foreground">{plan.maxStudents} students</div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
              {selectedPlan && selectedPlan.priceMonthly > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  You&apos;ll be redirected to payment after registration.
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Check className="h-8 w-8 text-green-500" />
                <h3 className="text-lg font-semibold">Review & Confirm</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">School:</span> <span className="font-medium">{form.schoolName}</span></div>
                  <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{form.city || "—"}</span></div>
                  <div><span className="text-muted-foreground">Admin:</span> <span className="font-medium">{form.adminName}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{form.adminEmail}</span></div>
                  <div><span className="text-muted-foreground">Plan:</span> <span className="font-medium">{selectedPlan?.name || "Trial"}</span></div>
                  <div><span className="text-muted-foreground">Price:</span> <span className="font-medium">{selectedPlan?.priceMonthly ? `₹${selectedPlan.priceMonthly}/mo` : "Free Trial"}</span></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">By registering, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="min-w-[160px]">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Registering..." : "Create Account"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
