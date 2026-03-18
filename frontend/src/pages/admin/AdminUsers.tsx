import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MoreHorizontal, Ban, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockAdminUsers, type AdminUser } from "@/lib/admin-mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "banned">("all");

  const filtered = mockAdminUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: AdminUser["status"]) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-secondary text-muted-foreground",
      banned: "bg-destructive/10 text-destructive",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and monitor user accounts</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="rounded-button pl-9"
            aria-label="Search users"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive", "banned"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-button px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-card border border-border/50 bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Signed Up</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Last Active</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sessions</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden lg:table-cell">Minutes</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.signupDate}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{user.lastActive}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{user.totalSessions}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground hidden lg:table-cell">{user.totalMinutes.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(user.status)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info(`Viewing ${user.name}`)}>
                          <Eye size={14} className="mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`${user.status === "banned" ? "Unbanned" : "Banned"} ${user.name}`)}>
                          <Ban size={14} className="mr-2" /> {user.status === "banned" ? "Unban" : "Ban"} User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => toast.info(`Deleted ${user.name}`)}>
                          <Trash2 size={14} className="mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No users match your filter.</p>
        )}
      </div>
    </div>
  );
}
