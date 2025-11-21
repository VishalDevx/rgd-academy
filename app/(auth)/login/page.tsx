"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Mail,
  Lock,
  IdCard,
  UserCog,
  Users,
  GraduationCap,
  Quote,
} from "lucide-react";
import { StudyAnimation } from "@/app/components/StudyAnimation";

type Role = "ADMIN" | "STAFF" | "STUDENT";

interface LoginForm {
  email?: string;
  password: string;
  aadharNo?: string;
}

export default function LoginPage() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  const [role, setRole] = useState<Role>("STAFF");
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    aadharNo: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const allowAdmin = searchParams.get("admin") === "true";
    setShowAdmin(allowAdmin);
  }, [searchParams]);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setForm({ email: "", password: "", aadharNo: "" });
    setError("");
  };

  const handleChange = (key: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      const result = await signIn(provider, { ...credentials, redirect: false });
      setLoading(false);

      if (!result) {
        setError("Unexpected error");
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      const redirectUrl =
        role === "ADMIN"
          ? "/admin/dashboard"
          : role === "STAFF"
          ? "/staff/dashboard"
          : "/student/dashboard";

      router.push(redirectUrl);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const roles: { type: Role; label: string; icon: any }[] = [
    ...(showAdmin
      ? [{ type: "ADMIN" as Role, label: "Admin", icon: UserCog }]
      : []),
    { type: "STAFF", label: "Staff", icon: Users },
    { type: "STUDENT", label: "Student", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Animation / Quote */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center relative bg-gradient-to-br from-blue-white to-white p-10">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

        {/* ✅ Custom animated SVG component */}
        <div className="relative z-10">
          <StudyAnimation />
        </div>

        <div className="text-center mt-8 relative z-10">
          <Quote size={40} className="mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-semibold text-gray-700 leading-snug">
            “The future belongs to those who believe in the beauty of their dreams.”
          </h2>
          <p className="text-blue-500 mt-2 font-medium">— Eleanor Roosevelt</p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🎓 School Portal
          </h1>

          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {roles.map((r) => (
              <button
                key={r.type}
                onClick={() => handleRoleChange(r.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium ${
                  role === r.type
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                <r.icon size={18} />
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {role !== "STUDENT" ? (
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            ) : (
              <div className="relative">
                <IdCard className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Aadhar Number"
                  value={form.aadharNo}
                  onChange={(e) => handleChange("aadharNo", e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-center font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold mt-2 transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Mobile Quote */}
          <div className="block md:hidden text-center mt-10 text-gray-500 text-sm">
            <p className="italic">
              “Education is the most powerful weapon which you can use to change the world.”
            </p>
            <span className="text-blue-600 mt-2 block">— Nelson Mandela</span>
          </div>
        </div>
      </div>
    </div>
  );
}
