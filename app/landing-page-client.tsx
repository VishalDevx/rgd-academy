"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, Menu, X, ArrowRight, GraduationCap, CreditCard, FileText, BarChart3, Users, Shield, Star } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"

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
  storageGB: number
  pdfDownloads: number
  features: string[]
  sortOrder: number
}

export function LandingPageClient({ plans }: { plans: Plan[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [yearly, setYearly] = useState(false)

  const featureLabels: Record<string, string> = {
    student_management: "Student Management",
    staff_management: "Staff Management",
    basic_fees: "Basic Fee Records",
    fee_management: "Fee Management",
    razorpay: "Razorpay Payments",
    attendance: "Attendance",
    basic_attendance: "Basic Attendance",
    results: "Results",
    basic_results: "Basic Results",
    bulk_import: "Bulk Import",
    expense_tracking: "Expense Tracking",
    analytics: "Analytics",
    late_fine: "Late Fine Management",
    discount: "Discounts",
    scholarship: "Scholarship/Waiver",
    defaulter: "Defaulter Reports",
    advanced_results: "Advanced Results",
    custom_branding: "Custom Branding",
    email_notifications: "Email Notifications",
    export: "Excel/PDF Export",
    multi_branch: "Multi-Branch",
    custom_roles: "Custom Roles",
    certificates: "Certificates",
    id_cards: "ID Cards",
    payroll: "Payroll",
    custom_domain: "Custom Domain",
    white_label: "White Label",
    priority_support: "Priority Support",
    all: "All Features",
  }

  const features = [
    { icon: Users, title: "Student Management", desc: "Admissions, profiles, documents, bulk import, promotion" },
    { icon: GraduationCap, title: "Staff Management", desc: "Profiles, attendance, leave, payroll, documents" },
    { icon: CreditCard, title: "Fee Collection", desc: "Structures, Razorpay, partial payments, receipts, dues" },
    { icon: BarChart3, title: "Reports & Analytics", desc: "Fee, attendance, results, expenses, custom reports" },
    { icon: FileText, title: "Certificates & IDs", desc: "Bonafide, TC, character, ID cards, bulk generation" },
    { icon: Shield, title: "Role-Based Access", desc: "Admin, staff, student portals with granular permissions" },
  ]

  const faqs = [
    { q: "Can I use this for one school?", a: "Yes. Every plan is designed for individual schools. Professional and Enterprise plans support multiple branches under one account." },
    { q: "Can students pay fees online?", a: "Yes. With Razorpay integration (Basic plan and above), students can pay fees online and download receipts instantly." },
    { q: "Can I manage multiple branches?", a: "Growth plan supports 2 branches, Professional supports 5, and Enterprise supports unlimited branches." },
    { q: "Can I upgrade my plan later?", a: "Yes. Upgrades are instant — your new limits and features unlock immediately after payment." },
    { q: "What happens when my plan expires?", a: "You get a 7-day grace period with full access, then 7 days of restricted access before suspension." },
    { q: "Can I export my data?", a: "Yes. All plans include PDF receipts. Growth and above include Excel/PDF/CSV export." },
    { q: "Can I use my own Razorpay account?", a: "Yes. Schools connect their own Razorpay keys. Student fees go directly to your account." },
    { q: "Do you provide enterprise setup?", a: "Yes. Enterprise includes dedicated onboarding, data migration, custom modules, and a dedicated account manager." },
  ]

  const CTAButton = ({ plan }: { plan: Plan }) => {
    if (plan.code === "enterprise") {
      return <Button className="w-full" asChild><a href="/contact">Contact Sales</a></Button>
    }
    if (plan.code === "trial") {
      return <Button className="w-full" asChild><Link href="/register-school">Start Free Trial</Link></Button>
    }
    return <Button className="w-full" variant={plan.sortOrder === 2 ? "default" : "outline"} asChild><Link href={`/register-school?plan=${plan.code}`}>Choose {plan.name}</Link></Button>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="h-6 w-6 text-primary" />
            SchoolSaaS
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Plans</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
            <Button asChild><Link href="/register-school">Start Free Trial</Link></Button>
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t p-4 space-y-3">
            <Link href="#features" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Features</Link>
            <Link href="#pricing" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/login" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Login</Link>
            <Button className="w-full" asChild><Link href="/register-school" onClick={() => setMobileOpen(false)}>Start Free Trial</Link></Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <Badge variant="outline" className="px-4 py-1.5 text-sm">Multi-Tenant School Management SaaS</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Run your entire school from{" "}
            <span className="text-primary">one powerful cloud dashboard</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage students, staff, fees, attendance, results, expenses, reports, certificates, and online payments — all in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base" asChild>
              <Link href="/register-school">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {["Fee Dashboard", "Online Payments", "Receipt PDF", "Attendance"].map((item) => (
              <div key={item} className="flex items-center gap-2 justify-center text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30 px-4">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to run your school</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform for school operations, fee collection, reports, and student management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <f.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Choose the plan that fits your school. Upgrade anytime.</p>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm ${!yearly ? "font-semibold" : "text-muted-foreground"}`}>Monthly</span>
              <button
                onClick={() => setYearly(!yearly)}
                className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${yearly ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-sm ${yearly ? "font-semibold" : "text-muted-foreground"}`}>
                Yearly <span className="text-green-600 font-semibold">Save ~17%</span>
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.filter((p) => p.code !== "enterprise").map((plan) => (
              <Card key={plan.id} className={`relative flex flex-col ${plan.sortOrder === 2 ? "border-primary shadow-lg" : ""}`}>
                {plan.sortOrder === 2 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">₹{yearly ? (plan.priceYearly / 12).toLocaleString() : plan.priceMonthly.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                    {yearly && plan.priceYearly > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">₹{plan.priceYearly.toLocaleString()}/year</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Students</span><span className="font-semibold">{plan.maxStudents.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Staff</span><span className="font-semibold">{plan.maxStaff}</span></div>
                    <div className="flex justify-between"><span>Branches</span><span className="font-semibold">{plan.maxBranches}</span></div>
                    <hr className="my-3" />
                    <p className="font-semibold mb-2">Features</p>
                    {(plan.features as string[]).slice(0, 8).map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span>{featureLabels[f] || f}</span>
                      </div>
                    ))}
                    {(plan.features as string[]).length > 8 && (
                      <p className="text-xs text-muted-foreground">+{(plan.features as string[]).length - 8} more features</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <CTAButton plan={plan} />
                </CardFooter>
              </Card>
            ))}
          </div>
          {/* Enterprise card */}
          <Card className="max-w-2xl mx-auto border-dashed">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription>Custom solution for school chains and large institutions</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">Custom</span>
                <span className="text-muted-foreground text-sm"> /month</span>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Custom limits, dedicated support, white-label, custom domain, API access, and more.</p>
              <Button size="lg" asChild><a href="/contact">Contact Sales</a></Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30 px-4">
        <div className="container mx-auto max-w-3xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border rounded-lg [&_summary]:open:font-semibold">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-lg">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to transform your school management?</h2>
          <p className="text-lg text-muted-foreground">Start your 14-day free trial. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base" asChild><Link href="/register-school">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" className="text-base" asChild><Link href="/pricing">View Plans</Link></Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-5 w-5 text-primary" /> SchoolSaaS
          </div>
          <nav className="flex gap-6">
            <Link href="#features" className="hover:text-primary">Features</Link>
            <Link href="#pricing" className="hover:text-primary">Pricing</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <p>&copy; {new Date().getFullYear()} SchoolSaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
