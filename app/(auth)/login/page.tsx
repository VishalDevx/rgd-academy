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
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    aadharNo: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (key: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;

      if (role === "STUDENT") {
        // Student login → aadharNo + password
        result = await signIn("student-login", {
          adharNo: form.aadharNo,
          password: form.password,
          redirect: false,
        });
      } else {
        // Admin or staff login → email + password
        result = await signIn("email-password", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
      }

      setLoading(false);

      if (result?.error) {
        setError(result.error);
        return;
      }

      // Role-based redirect
      switch (role) {
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "STAFF":
          router.push("/staff/dashboard");
          break;
        case "STUDENT":
          router.push("/student/dashboard");
          break;
        default:
          router.push("/");
      }
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
              onClick={() => setRole(r as Role)}
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
            <>
              <input
                type="email"
                placeholder="Email"
                value={form.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border p-2 rounded-md text-black"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full border p-2 rounded-md text-black"
                required
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Aadhar Number"
                value={form.aadharNo || ""}
                onChange={(e) => handleChange("aadharNo", e.target.value)}
                className="w-full border p-2 rounded-md text-black"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full border p-2 rounded-md text-black"
                required
              />
            </>
          )}

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
