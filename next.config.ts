import type { NextConfig } from "next";

let nextConfig = {
 images: {
    domains: ['qoigzylkryyfjzbxzqiv.supabase.co'], 
  },
env:{
   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
}
};

export default nextConfig;
