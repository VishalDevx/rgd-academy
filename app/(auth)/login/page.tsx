"use client";

import { useState, useEffect } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "STAFF" | "STUDENT";

interface LoginForm {
  email?: string;
  password: string;
  aadharNo?: string;
}

export default function LoginPage() {
  const [role, setRole] = useState<Role>("ADMIN");
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    aadharNo: "",
  });
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch CSRF token once
  useEffect(() => {
    const fetchCsrf = async () => {
      const token = await getCsrfToken();
      if (token) setCsrfToken(token);
    };
    fetchCsrf();
  }, []);

  // Clear form on role change
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

    // Build credentials object
    const credentials: Record<string, string> =
      role === "STUDENT"
        ? { aadharNo: form.aadharNo!.trim(), password: form.password.trim() }
        : { email: form.email!.trim(), password: form.password.trim() };

    const provider = role === "STUDENT" ? "student-login" : "email-password";

    try {
      const result = await signIn(provider, {
        ...credentials,
        redirect: false,
        callbackUrl:
          role === "ADMIN"
            ? "/admin/dashboard"
            : role === "STAFF"
            ? "/staff/dashboard"
            : "/student/dashboard",
        csrfToken,
      });

      setLoading(false);

      if (!result) {
        setError("Unexpected error, please try again.");
        return;
      }

      if (result.error) {
        // Map backend error to friendly message
        let msg = result.error.toLowerCase();
        if (msg.includes("missing")) msg = "Please fill in all required fields.";
        else if (msg.includes("invalid")) msg = "Incorrect credentials.";
        else if (msg.includes("unauthorized")) msg = "You are not authorized.";
        setError(msg);
        return;
      }

      // Redirect manually
      router.push(
        role === "ADMIN"
          ? "/admin/dashboard"
          : role === "STAFF"
          ? "/staff/dashboard"
          : "/student/dashboard"
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">
          School Login
        </h1>

        {/* Role Selector */}
        <div className="flex justify-center gap-3 mb-6">
          {["ADMIN", "STAFF", "STUDENT"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r as Role)}
              aria-pressed={role === r}
              className={`px-4 py-2 rounded-md font-medium transition ${
                role === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {role !== "STUDENT" ? (
            <input
              type="email"
              placeholder="Email"
              value={form.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border p-2 rounded-md text-black"
              required
            />
          ) : (
            <input
              type="text"
              placeholder="Aadhar Number"
              value={form.aadharNo || ""}
              onChange={(e) => handleChange("aadharNo", e.target.value)}
              className="w-full border p-2 rounded-md text-black"
              required
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="w-full border p-2 rounded-md text-black"
            required
          />

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-medium ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 transition"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
