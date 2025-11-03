"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [role, setRole] = useState<"ADMIN" | "STAFF" | "STUDENT">("ADMIN");
  const [form, setForm] = useState({ email: "", password: "", aadhar: "", dob: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let result;
      if (role === "STUDENT") {
        result = await signIn("student-login", {
          aadhar: form.aadhar,
          dob: form.dob,
          redirect: false,
        });
      } else {
        result = await signIn("email-password", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
      }

      if (result?.error) {
        setError(result.error);
      } else {
        if (role === "ADMIN") router.push("/admin/dashboard");
        else if (role === "STAFF") router.push("/staff/dashboard");
        else router.push("/student/dashboard");
      }
    } catch (err: any) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">School Login</h1>

        <div className="flex justify-center gap-3 mb-6">
          {["ADMIN", "STAFF", "STUDENT"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r as any)}
              className={`px-4 py-2 rounded-md font-medium ${
                role === r ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "STUDENT" ? (
            <>
              <input
                type="text"
                placeholder="Aadhaar Number"
                value={form.aadhar}
                onChange={(e) => setForm({ ...form, aadhar: e.target.value })}
                className="w-full border p-2 rounded-md text-black"
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full border p-2 rounded-md text-black"
              />
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border p-2 rounded-md text-black"
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border p-2 rounded-md text-black" 
              />
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
