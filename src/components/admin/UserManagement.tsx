"use client";

import { useState } from "react";
import { useTeamMembers } from "@/hooks/queries/leaveQueries";
import { useUpdateUserRole, useCreateUser } from "@/hooks/queries/adminMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  UserPlus, 
  Mail, 
  Building2,
  Shield,
  SendHorizontal,
  ShieldCheck,
  MoreVertical,
  Activity,
  Search
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserManagement() {
  const { data: users, isLoading } = useTeamMembers();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateUserRole();

  const [activeTab, setActiveTab] = useState("invite");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    role: "employee",
    department: "Frontend"
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(formData, {
      onSuccess: () => {
        setFormData({ email: "", fullName: "", role: "employee", department: "Frontend" });
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-slate-900 text-white gap-1 font-black"><ShieldCheck className="w-3 h-3" /> Admin</Badge>;
      case 'manager':
        return <Badge className="bg-indigo-100/50 text-black border-indigo-200 gap-1 font-black"><Shield className="w-3 h-3 text-indigo-600" /> Manager</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500 font-bold">Employee</Badge>;
    }
  };

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_dpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pt-0 pb-10">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-end">
          <TabsList className="bg-slate-100/80 backdrop-blur-sm p-1 rounded-2xl h-11 w-full max-w-[320px] shadow-sm border border-slate-200/50">
            <TabsTrigger value="invite" className="rounded-xl flex-1 font-black text-[10px] uppercase tracking-wider text-black data-[state=active]:bg-[#0D1A2C] data-[state=active]:text-white transition-all h-full gap-2">
              <UserPlus className="w-3 h-3" />
              Invite Member
            </TabsTrigger>
            <TabsTrigger value="manage" className="rounded-xl flex-1 font-black text-[10px] uppercase tracking-wider text-black data-[state=active]:bg-[#0D1A2C] data-[state=active]:text-white transition-all h-full gap-2">
              <ShieldCheck className="w-3 h-3" />
              Manage Roles
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="invite" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-100/10 overflow-hidden bg-white">
            <div className="bg-[#0D1A2C] px-10 py-10 text-white relative overflow-hidden flex items-center justify-between">
              <div className="relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight">Invite New Member</CardTitle>
                    <CardDescription className="text-slate-400 font-medium text-base">
                      Add a professional to the organization.
                    </CardDescription>
                  </div>
                </div>
              </div>
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <CardContent className="p-12">
              <form onSubmit={handleCreateUser} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {/* Full Name */}
                  <div className="space-y-3">
                    <Label htmlFor="fullName" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <Input 
                        id="fullName" 
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Enter full name" 
                        className="h-14 pl-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-semibold" 
                        required 
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <Mail className="w-5 h-5" />
                      </div>
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="email@company.com" 
                        className="h-14 pl-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-semibold"
                        required 
                      />
                    </div>
                  </div>

                  {/* Role Dropdown */}
                  <div className="space-y-3">
                    <Label htmlFor="role" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Designated Role</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                      <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-semibold">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-slate-300" />
                          <SelectValue placeholder="Select role" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white">
                        <SelectItem value="employee" className="rounded-xl py-3 font-bold text-slate-900">Employee</SelectItem>
                        <SelectItem value="manager" className="rounded-xl py-3 font-bold text-indigo-700 bg-indigo-50/50">Manager</SelectItem>
                        <SelectItem value="admin" className="rounded-xl py-3 font-bold text-slate-900 bg-slate-50">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department Dropdown */}
                  <div className="space-y-3">
                    <Label htmlFor="dept" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Department</Label>
                    <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}>
                      <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-semibold">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-slate-300" />
                          <SelectValue placeholder="Select Department" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-2 bg-white">
                        <SelectItem value="Frontend" className="rounded-lg py-2 font-bold text-slate-900">Frontend</SelectItem>
                        <SelectItem value="Backend" className="rounded-lg py-2 font-bold text-slate-900">Backend</SelectItem>
                        <SelectItem value="Full Stack" className="rounded-lg py-2 font-bold text-slate-900">Full Stack</SelectItem>
                        <SelectItem value="HR" className="rounded-lg py-2 font-bold text-pink-700 bg-pink-50/50">HR</SelectItem>
                        <SelectItem value="Graphics Designer" className="rounded-lg py-2 font-bold text-emerald-700 bg-emerald-50/50">Graphics Designer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={isCreating}
                    className="w-full h-16 bg-[#0D1A2C] hover:bg-slate-800 text-white rounded-[1.25rem] font-black text-lg shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] gap-3"
                  >
                    <SendHorizontal className={`w-6 h-6 ${isCreating ? 'animate-pulse' : ''}`} />
                    {isCreating ? "Processing Invite..." : "Send Secure Invitation"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Organizational Roster</h3>
                  <p className="text-sm text-slate-500 font-medium tracking-tight">Manage permissions for {users?.length || 0} active members</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                  <Input 
                    placeholder="Search roster..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 h-11 pl-10 rounded-xl border-slate-200 bg-white focus:bg-white transition-all font-semibold text-sm shadow-sm text-slate-900"
                  />
                </div>
                
                <Button 
                  onClick={() => setActiveTab("invite")}
                  className="bg-[#0D1A2C] hover:bg-slate-800 text-white rounded-xl px-5 h-11 font-black text-sm shadow-lg shadow-slate-200/50 gap-2 transition-all hover:scale-[1.02]"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite New
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-slate-500 p-8 h-auto uppercase tracking-widest text-[10px]">Employee Identity</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Department</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Current Role</TableHead>
                  <TableHead className="text-right p-8 font-bold text-slate-500 uppercase tracking-widest text-[10px] h-auto">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <TableRow key={i} className="animate-pulse border-slate-50">
                      <TableCell className="p-8"><div className="h-12 w-48 bg-slate-100 rounded-xl" /></TableCell>
                      <TableCell><div className="h-8 w-24 bg-slate-50 rounded-lg" /></TableCell>
                      <TableCell><div className="h-8 w-20 bg-slate-50 rounded-lg" /></TableCell>
                      <TableCell className="p-8"><div className="h-10 w-10 ml-auto bg-slate-50 rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/40 transition-colors">
                      <TableCell className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#0D1A2C] flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {user.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-tight text-lg">{user.full_name}</p>
                            <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium mt-1">
                              <Mail className="w-3.5 h-3.5" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5 text-slate-600 font-bold bg-slate-100/50 px-3 py-1.5 rounded-lg inline-flex">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {user.user_dpt || "General"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell className="text-right p-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                              <MoreVertical className="h-6 w-6 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[220px] border-slate-100 shadow-2xl">
                            <p className="px-4 py-3 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Change Permission</p>
                            {user.role === 'employee' ? (
                              <DropdownMenuItem 
                                className="rounded-xl p-4 font-bold text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 focus:bg-indigo-50 focus:text-indigo-600 gap-3 transition-all"
                                onClick={() => updateRole({ targetUserId: user.id, newRole: 'manager' })}
                                disabled={isUpdating}
                              >
                                <Shield className="w-4 h-4" />
                                Promote to Manager
                              </DropdownMenuItem>
                            ) : user.role === 'manager' ? (
                              <DropdownMenuItem 
                                className="rounded-xl p-4 font-bold text-sm cursor-pointer hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 gap-3 transition-all"
                                onClick={() => updateRole({ targetUserId: user.id, newRole: 'employee' })}
                                disabled={isUpdating}
                              >
                                <Shield className="w-4 h-4" />
                                Demote to Employee
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
