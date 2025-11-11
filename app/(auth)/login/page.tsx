"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, IdCard, UserCog, Users, GraduationCap } from "lucide-react";

type Role = "ADMIN" | "STAFF" | "STUDENT";

interface LoginForm {
  email?: string;
  password: string;
  aadharNo?: string;
}

export default function LoginPage() {
  const [role, setRole] = useState<Role>("STAFF");
  const [form, setForm] = useState<LoginForm>({ email: "", password: "", aadharNo: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only show admin login if ?admin=true in URL or secure condition
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

    if ((role === "STUDENT" && !form.aadharNo?.trim()) || (role !== "STUDENT" && !form.email?.trim()) || !form.password.trim()) {
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
    ...(showAdmin ? [{ type: "ADMIN" as Role, label: "Admin", icon: UserCog }] : []),
    { type: "STAFF", label: "Staff", icon: Users },
    { type: "STUDENT", label: "Student", icon: GraduationCap },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1950&q=80')",
      }}
    >
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-center text-white mb-8 tracking-wide">🎓 School Portal</h1>

        <div className="flex justify-center gap-3 mb-8">
          {roles.map((r) => (
            <button
              key={r.type}
              onClick={() => handleRoleChange(r.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium ${
                role === r.type
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white/20 text-gray-100 hover:bg-white/30"
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
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && <p className="text-red-400 text-center font-medium">{error}</p>}

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
      </div>
    </div>
  );
}
