import { BookOpen, FileText, LayoutDashboard, Users } from "lucide-react";
import type { ShellNav } from "@/components/dashboard/shell";

export const adminNav: ShellNav = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/applications", label: "Applications", icon: <FileText className="h-4 w-4" /> },
  { href: "/admin/programs", label: "Programs", icon: <BookOpen className="h-4 w-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> }
];
