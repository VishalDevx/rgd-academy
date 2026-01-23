import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/lib/auth";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET school settings
export async function GET() {
  try {
    const session = await getServerSession(authOption);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.schoolSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await db.schoolSettings.create({
        data: {
          name: "RGD School",
          tier: "BASIC",
          primaryColor: "#2563eb",
        },
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT/PATCH school settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOption);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({})) as {
      name?: string;
      address?: string | null;
      contactEmail?: string | null;
      contactPhone?: string | null;
      academicYear?: string | null;
      logoUrl?: string | null;
      faviconUrl?: string | null;
      primaryColor?: string | null;
      tier?: "BASIC" | "PRO" | "ENTERPRISE";
      featureFlags?: unknown;
    };
    const {
      name,
      address,
      contactEmail,
      contactPhone,
      academicYear,
      logoUrl,
      faviconUrl,
      primaryColor,
      tier,
      featureFlags,
    } = body;

    // Get existing settings or create new
    const existing = await db.schoolSettings.findFirst();
    
    const updated = existing
      ? await db.schoolSettings.update({
          where: { id: existing.id },
          data: {
            name: name ?? existing.name,
            address: address !== undefined ? address : existing.address,
            contactEmail: contactEmail !== undefined ? contactEmail : existing.contactEmail,
            contactPhone: contactPhone !== undefined ? contactPhone : existing.contactPhone,
            academicYear: academicYear !== undefined ? academicYear : existing.academicYear,
            logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
            faviconUrl: faviconUrl !== undefined ? faviconUrl : existing.faviconUrl,
            primaryColor: primaryColor !== undefined ? primaryColor : existing.primaryColor,
            tier: tier ?? existing.tier,
            featureFlags: featureFlags !== undefined 
              ? (featureFlags as Prisma.InputJsonValue) 
              : (existing.featureFlags ?? Prisma.DbNull),
          },
        })
      : await db.schoolSettings.create({
          data: {
            name: name || "RGD School",
            address,
            contactEmail,
            contactPhone,
            academicYear,
            logoUrl,
            faviconUrl,
            primaryColor: primaryColor || "#2563eb",
            tier: tier || "BASIC",
            featureFlags: featureFlags as Prisma.InputJsonValue | undefined,
          },
        });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_SETTINGS",
        entity: "SchoolSettings",
        entityId: updated.id,
        oldValue: existing 
          ? (JSON.parse(JSON.stringify(existing)) as Prisma.InputJsonValue)
          : Prisma.DbNull,
        newValue: JSON.parse(JSON.stringify(updated)) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating settings:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
