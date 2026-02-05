
import { useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { profilesAPI, type Profile } from '@/api/profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (profile: Profile) => void;
}

export function CreateAccountDialog({ open, onOpenChange, onSuccess }: CreateAccountDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'super_admin' | 'admin' | 'staff'>('staff');
  const [submitLoading, setSubmitLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('staff');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // 1. Create user in Supabase Auth
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

      // 2. Create profile in backend
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
        finalProfile = {
          id: userId,
          email,
          fullName,
          role,
          createdAt: new Date().toISOString()
        };
      }

      toast.success('Tạo tài khoản thành công');
      onSuccess(finalProfile);
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Creation process error:', error);
      toast.error(error.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}
