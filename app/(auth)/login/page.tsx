"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Mail,
  Lock,
  IdCard,
  UserCog,
  Users,
  GraduationCap,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* =======================
   Types
======================= */

type Role = "ADMIN" | "STAFF" | "STUDENT";

interface LoginForm {
  email?: string;
  password: string;
  aadharNo?: string;
}

type RoleConfig = {
  type: Role;
  label: string;
  icon: LucideIcon;
  color: string;
};

/* =======================
   Page Wrapper
======================= */

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

/* =======================
   Page Logic (UNCHANGED)
======================= */

function LoginPageInner() {
  const [role, setRole] = useState<Role>("STAFF");
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    aadharNo: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const showAdmin = searchParams.get("admin") === "true";

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setForm({ email: "", password: "", aadharNo: "" });
    setError("");
  };

  const handleChange = (key: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      (role === "STUDENT" && !form.aadharNo?.trim()) ||
      (role !== "STUDENT" && !form.email?.trim()) ||
      !form.password.trim()
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    const credentials =
      role === "STUDENT"
        ? { aadharNo: form.aadharNo!.trim(), password: form.password.trim() }
        : { email: form.email!.trim(), password: form.password.trim() };

    const provider = role === "STUDENT" ? "student-login" : "email-password";

    try {
      const result = await signIn(provider, {
        ...credentials,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push(
        role === "ADMIN"
          ? "/admin/dashboard"
          : role === "STAFF"
          ? "/staff/dashboard"
          : "/student/dashboard"
      );
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  /* =======================
     Role Config (FIXED)
     NO type widening
  ======================= */

  const roles: RoleConfig[] = [];

  if (showAdmin) {
    roles.push({
      type: "ADMIN",
      label: "Admin",
      icon: UserCog,
      color: "from-purple-600 to-purple-700",
    });
  }

  roles.push(
    {
      type: "STAFF",
      label: "Staff",
      icon: Users,
      color: "from-blue-600 to-blue-700",
    },
    {
      type: "STUDENT",
      label: "Student",
      icon: GraduationCap,
      color: "from-emerald-600 to-emerald-700",
    }
  );

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 text-white">
          <div>
            <GraduationCap className="h-10 w-10 mb-6" />
            <h2 className="text-3xl font-bold leading-tight">
              School
              <br />
              Management Portal
            </h2>
            <p className="mt-3 text-sm text-white/90">
              Secure role-based access for administrators, staff and students.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Secure Authentication
                </p>
                <p className="text-xs text-white/80">
                  Encrypted & role-restricted login
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/70">
            Authorized access only
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Sign in
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Select your role and continue
          </p>

          {/* ROLE SELECTOR */}
          <div className="flex gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.type}
                onClick={() => handleRoleChange(r.type)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
                  role === r.type
                    ? `bg-gradient-to-r ${r.color} text-white`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <r.icon size={16} />
                {r.label}
              </button>
            ))}
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {role !== "STUDENT" ? (
              <Input
                icon={Mail}
                placeholder="Email address"
                value={form.email}
                onChange={(v) => handleChange("email", v)}
              />
            ) : (
              <Input
                icon={IdCard}
                placeholder="Aadhar number"
                value={form.aadharNo}
                onChange={(v) => handleChange("aadharNo", v)}
              />
            )}

            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(v) => handleChange("password", v)}
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                loading
                  ? "bg-gray-400"
                  : role === "ADMIN"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700"
                  : role === "STAFF"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700"
                  : "bg-gradient-to-r from-emerald-600 to-emerald-700"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =======================
   Typed Input Component
======================= */

function Input(props: {
  icon: LucideIcon;
  placeholder: string;
  value?: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  const { icon: Icon, onChange, ...rest } = props;

  return (
    <div className="relative">
      <Icon
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />
      <input
        {...rest}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
