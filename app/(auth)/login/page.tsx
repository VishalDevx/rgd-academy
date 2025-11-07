"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "STAFF" | "STUDENT";

interface LoginForm {
  email?: string;
  password: string;
  aadharNo?: string;
}

export default function LoginPage() {
  const [role, setRole] = useState<Role>("ADMIN");
  const [form, setForm] = useState<LoginForm>({ email: "", password: "", aadharNo: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">School Login</h1>

        <div className="flex justify-center gap-3 mb-6">
          {["ADMIN", "STAFF", "STUDENT"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r as Role)}
              className={`px-4 py-2 rounded-md font-medium transition ${
                role === r ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role !== "STUDENT" ? (
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required className="w-full border p-2 rounded-md" />
          ) : (
            <input type="text" placeholder="Aadhar Number" value={form.aadharNo} onChange={(e) => handleChange("aadharNo", e.target.value)} required className="w-full border p-2 rounded-md" />
          )}
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} required className="w-full border p-2 rounded-md" />

          {error && <p className="text-red-600 text-center">{error}</p>}

          <button type="submit" disabled={loading} className={`w-full py-2 rounded-md text-white ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
