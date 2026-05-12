"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  ScrollText,
  ClipboardList,
  ExternalLink,
  Download,
} from "lucide-react";

interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  videoLink: string | null;
  type: string;
  createdAt: string;
  subject: { name: string };
  teacher: { user: { name: string } } | null;
}

interface StudentData {
  id: string;
  class: { id: string; name: string } | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  NOTES: <ScrollText className="h-4 w-4" />,
  PDF: <FileText className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  REFERENCE: <LinkIcon className="h-4 w-4" />,
  ASSIGNMENT: <ClipboardList className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  NOTES: "bg-blue-100 text-blue-700",
  PDF: "bg-red-100 text-red-700",
  VIDEO: "bg-purple-100 text-purple-700",
  REFERENCE: "bg-amber-100 text-amber-700",
  ASSIGNMENT: "bg-green-100 text-green-700",
};

export default function StudentStudyMaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStudent(data.student);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!student?.class?.id) return;
    async function fetchMaterials() {
      try {
        const params = new URLSearchParams({ classId: student?.class?.id ?? "" });
        if (filterSubject !== "all") params.set("subjectId", filterSubject);
        const res = await fetch(`/api/study-materials?${params}`);
        if (res.ok) {
          const data = await res.json();
          setMaterials(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, [student, filterSubject]);

  const uniqueSubjects = [...new Map(materials.map((m) => [m.subject.name, m.subject.name])).entries()].map(([name]) => name);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!student?.class) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No class assigned</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredMaterials =
    filterSubject === "all"
      ? materials
      : materials.filter((m) => m.subject.name === filterSubject);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
        <p className="text-gray-500 mt-1">{student.class.name}</p>
      </div>

      {materials.length > 0 && (
        <div className="flex items-center gap-4">
          <Label>Filter by Subject:</Label>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {uniqueSubjects.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((m) => (
            <Card key={m.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{m.title}</CardTitle>
                  <Badge className={typeColors[m.type] || ""}>
                    <span className="flex items-center gap-1">
                      {typeIcons[m.type]}
                      {m.type}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">{m.subject.name}</p>
                {m.description && (
                  <p className="text-sm text-gray-600 mb-3">{m.description}</p>
                )}
                {m.teacher && (
                  <p className="text-xs text-gray-400 mb-3">by {m.teacher.user.name}</p>
                )}
                <div className="flex gap-2">
                  {m.fileUrl && (
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        File
                      </Button>
                    </a>
                  )}
                  {m.videoLink && (
                    <a href={m.videoLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Video
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No study materials available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
