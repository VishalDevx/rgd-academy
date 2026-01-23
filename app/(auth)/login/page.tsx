"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, IdCard, UserCog, Users, GraduationCap, Quote, Loader2, Sparkles } from "lucide-react";
import { StudyAnimation } from "@/app/components/StudyAnimation";

type Role = "ADMIN" | "STAFF" | "STUDENT";

interface LoginForm {
  email?: string;
  password: string;
  aadharNo?: string;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const [role, setRole] = useState<Role>("STAFF");
  const [form, setForm] = useState<LoginForm>({ email: "", password: "", aadharNo: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Show admin role if query param ?admin=true
  const showAdmin = searchParams.get("admin") === "true";

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setForm({ email: "", password: "", aadharNo: "" });
    setError("");
  };

  const handleChange = (key: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
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

const ROLE_ADMIN: Role = "ADMIN";
const ROLE_STAFF: Role = "STAFF";
const ROLE_STUDENT: Role = "STUDENT";

const roles = [
  ...(showAdmin ? [{ type: ROLE_ADMIN, label: "Admin", icon: UserCog, color: "from-purple-500 to-purple-600" }] : []),
  { type: ROLE_STAFF, label: "Staff", icon: Users, color: "from-blue-500 to-blue-600" },
  { type: ROLE_STUDENT, label: "Student", icon: GraduationCap, color: "from-emerald-500 to-emerald-600" },
];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-emerald-50 overflow-hidden">
      {/* Left Side - Visual Section */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center relative p-10 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-lg">
          {/* Logo/Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
                <GraduationCap className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Animation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <StudyAnimation />
            </div>
          </div>

          {/* Quote */}
          <div className="text-center text-white">
            <Quote className="mx-auto mb-4 h-10 w-10 text-white/80" />
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 drop-shadow-lg">
              &ldquo;The future belongs to those who believe in the beauty of their dreams.&rdquo;
            </h2>
            <p className="text-white/90 text-lg font-medium">&mdash; Eleanor Roosevelt</p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-10 left-10 flex gap-2">
            <Sparkles className="h-5 w-5 text-white/40 animate-pulse" />
            <Sparkles className="h-5 w-5 text-white/40 animate-pulse" style={{ animationDelay: "0.3s" }} />
            <Sparkles className="h-5 w-5 text-white/40 animate-pulse" style={{ animationDelay: "0.7s" }} />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 md:py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl shadow-lg mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to your portal</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-8 md:p-10">
            {/* Role Selection */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {roles.map(r => (
                <button
                  key={r.type}
                  onClick={() => handleRoleChange(r.type)}
                  className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                    role === r.type
                      ? `bg-gradient-to-r ${r.color} text-white shadow-lg scale-105`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                  }`}
                >
                  <r.icon size={18} className={role === r.type ? "text-white" : "text-gray-600"} />
                  {r.label}
                  {role === r.type && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Aadhar Input */}
              {role !== "STUDENT" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className={`relative group transition-all duration-200 ${
                    focusedField === "email" ? "scale-[1.01]" : ""
                  }`}>
                    <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "email" ? "text-blue-600" : "text-gray-400"
                    }`} size={20} />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={e => handleChange("email", e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 bg-white ${
                        focusedField === "email"
                          ? "border-blue-500 ring-4 ring-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 placeholder-gray-400`}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Aadhar Number</label>
                  <div className={`relative group transition-all duration-200 ${
                    focusedField === "aadharNo" ? "scale-[1.01]" : ""
                  }`}>
                    <IdCard className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "aadharNo" ? "text-emerald-600" : "text-gray-400"
                    }`} size={20} />
                    <input
                      type="text"
                      placeholder="Enter your Aadhar number"
                      value={form.aadharNo}
                      onChange={e => handleChange("aadharNo", e.target.value)}
                      onFocus={() => setFocusedField("aadharNo")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 bg-white ${
                        focusedField === "aadharNo"
                          ? "border-emerald-500 ring-4 ring-emerald-100"
                          : "border-gray-200 hover:border-gray-300"
                      } focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 text-gray-900 placeholder-gray-400`}
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className={`relative group transition-all duration-200 ${
                  focusedField === "password" ? "scale-[1.01]" : ""
                }`}>
                  <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "password" ? "text-blue-600" : "text-gray-400"
                  }`} size={20} />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => handleChange("password", e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 bg-white ${
                      focusedField === "password"
                        ? "border-blue-500 ring-4 ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    } focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 placeholder-gray-400`}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-red-700 text-sm font-medium text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 shadow-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : `bg-gradient-to-r ${
                        role === "ADMIN" ? "from-purple-600 to-purple-700" :
                        role === "STAFF" ? "from-blue-600 to-blue-700" :
                        "from-emerald-600 to-emerald-700"
                      } hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Mobile Quote */}
            <div className="block md:hidden text-center mt-8 pt-8 border-t border-gray-200">
              <Quote className="mx-auto mb-3 h-6 w-6 text-gray-400" />
              <p className="text-gray-600 text-sm italic mb-2">
                &ldquo;Education is the most powerful weapon which you can use to change the world.&rdquo;
              </p>
              <span className="text-blue-600 text-xs font-medium">&mdash; Nelson Mandela</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Secure login powered by NextAuth
          </p>
        </div>
      </div>
    </div>
  );
}
