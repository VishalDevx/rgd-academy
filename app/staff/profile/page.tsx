"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  Hash,
  UserCircle,
  Briefcase,
} from "lucide-react";
import Image from "next/image";

interface StaffProfile {
  id: string;
  designation: string;
  salary: number | null;
  joinDate: string;
  active: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    createdAt: string;
  };
  classes: {
    id: string;
    name: string;
    grade: string;
    section: string | null;
    academicSession: {
      name: string;
    };
    students?: {
      id: string;
    }[];
    subjects?: {
      id: string;
      name: string;
    }[];
    _count?: {
      students: number;
      subjects: number;
    };
  }[];
  subjects: {
    id: string;
    name: string;
    code: string;
    class: {
      id: string;
      name: string;
      grade: string;
    };
  }[];
}

interface ProfileData {
  staff: StaffProfile;
}

export default function StaffProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/staff/profile");
        if (res.ok) {
          const profileData = await res.json();
          setData(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load profile data</p>
      </div>
    );
  }

  const { staff } = data;
  const profileImage = staff.user.image || "/logo.jpeg";
  const totalStudents = (staff.classes || []).reduce(
    (sum, cls) => sum + (cls.students?.length ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View your profile information</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={profileImage}
                  alt={staff.user.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 border-4 border-white">
                <UserCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {staff.user.name}
              </h2>
              <p className="text-gray-600 mt-1">{staff.user.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-purple-100 text-purple-700">
                  {staff.designation}
                </Badge>
                <Badge
                  variant={staff.active ? "default" : "outline"}
                  className={staff.active ? "bg-green-100 text-green-700" : ""}
                >
                  {staff.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-gray-900">{staff.user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                <p className="text-gray-900">
                  {staff.user.phone || "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Briefcase className="h-4 w-4" />
                  Designation
                </label>
                <p className="text-gray-900">{staff.designation}</p>
              </div>

              {staff.salary && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                    <Hash className="h-4 w-4" />
                    Salary
                  </label>
                  <p className="text-gray-900">₹{staff.salary.toLocaleString()}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  Join Date
                </label>
                <p className="text-gray-900">
                  {format(new Date(staff.joinDate), "MMM dd, yyyy")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </label>
                <p className="text-gray-900">
                  {format(new Date(staff.user.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Work Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1">
                Classes Assigned
              </label>
              <p className="text-2xl font-bold">{staff.classes.length}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 mb-1">
                Total Students
              </label>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 mb-1">
                Subjects Teaching
              </label>
              <p className="text-2xl font-bold">{staff.subjects.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Assigned */}
      {staff.classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Classes Assigned ({staff.classes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{cls.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{cls.grade}</Badge>
                    {cls.section && (
                      <Badge variant="outline">Section {cls.section}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {cls.students?.length ?? 0} students
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {cls.subjects?.length ?? 0} subjects
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {cls.academicSession.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subjects Teaching */}
      {staff.subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subjects Teaching ({staff.subjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {staff.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{subject.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{subject.code}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {subject.class.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
