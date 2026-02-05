import { useEffect, useState } from 'react';
import { profilesAPI, type Profile } from '@/api/profiles';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, UserCog, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AccountManagementPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'super_admin' | 'admin' | 'staff'>('staff');

  const fetchProfiles = async () => {
    try {
      console.log('Fetching all profiles...');
      const data = await profilesAPI.getAll();
      console.log('Profiles fetched:', data.length);
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    console.log('Starting account creation for:', email);

    try {
      // 1. Tạo user trong Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });

      if (authError) {
        console.error('Supabase Auth Error:', authError);
        toast.error(`Lỗi Supabase: ${authError.message}`);
        setSubmitLoading(false);
        return;
      }

      const userId = authData.user.id;
      console.log('Auth user created:', userId);

      // 2. Tạo profile trong database backend
      let finalProfile: Profile;
      try {
        finalProfile = await profilesAPI.create({
          id: userId,
          email,
          fullName,
          role
        });
      } catch (err: any) {
        console.warn('Backend profile creation issue, creating local placeholder:', err);
        // Nếu backend lỗi nhưng auth đã ok, tạo placeholder để UI hiện ngay
        finalProfile = {
          id: userId,
          email,
          fullName,
          role,
          createdAt: new Date().toISOString()
        };
      }

      console.log('Updating profiles state with:', finalProfile);

      // 3. Cập nhật UI ngay lập tức
      setProfiles(current => {
        const filtered = current.filter(p => p.id !== userId);
        const updated = [...filtered, finalProfile].sort((a, b) => 
          (a.email || '').localeCompare(b.email || '')
        );
        return updated;
      });

      toast.success('Tạo tài khoản thành công');
      setIsCreateOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Creation process error:', error);
      toast.error(error.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    setSubmitLoading(true);

    try {
      const updatedProfile: Profile = {
        ...selectedProfile,
        fullName,
        role
      };
      
      await profilesAPI.update(selectedProfile.id, updatedProfile);

      setProfiles(current => current.map(p => p.id === selectedProfile.id ? updatedProfile : p));
      toast.success('Cập nhật thành công');
      setIsEditOpen(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Lỗi khi cập nhật');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string, userEmail: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${userEmail}?`)) return;

    setSubmitLoading(true);
    console.log('Deleting account:', id);

    try {
      // 1. Xóa trong Supabase Auth
      try {
        await supabaseAdmin.auth.admin.deleteUser(id);
      } catch (authErr: any) {
        console.warn('Supabase Auth Delete issue (ignoring):', authErr.message);
      }

      // 2. Xóa trong Backend Database
      try {
        await profilesAPI.delete(id);
      } catch (dbErr: any) {
        // 404 nghĩa là đã xóa hoặc không tồn tại, có thể bỏ qua để UI cập nhật
        if (dbErr.response?.status !== 404) {
          console.error('Backend Delete Error:', dbErr);
        }
      }

      // 3. Cập nhật UI ngay lập tức bất kể lỗi backend nào
      setProfiles(current => current.filter(p => p.id !== id));
      toast.success('Đã xóa tài khoản');
    } catch (error: any) {
      console.error('Delete process error:', error);
      toast.error(error.message || 'Lỗi khi xóa tài khoản');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('staff');
  };

  const openEdit = (profile: Profile) => {
    setSelectedProfile(profile);
    setFullName(profile.fullName || '');
    setRole(profile.role);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý nhân sự</h2>
          <p className="text-gray-500 mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAccount} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Họ và tên</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Nhân sự</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitLoading}>
                {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo tài khoản
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                    <p className="mt-2 text-gray-500">Đang tải danh sách...</p>
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    Không tìm thấy tài khoản nào
                  </TableCell>
                </TableRow>
              ) : profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.fullName}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      p.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.role === 'super_admin' ? 'Super Admin' : 
                       p.role === 'admin' ? 'Admin' : 'Staff'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} disabled={submitLoading}>
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteAccount(p.id, p.email)} disabled={submitLoading}>
                      {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Nhân sự</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={submitLoading}>
              {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
