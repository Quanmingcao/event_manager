
import { useState, useEffect } from 'react';
import { profilesAPI, type Profile } from '@/api/profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditRoleDialogProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedProfile: Profile) => void;
}

export function EditRoleDialog({ profile, open, onOpenChange, onSuccess }: EditRoleDialogProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'super_admin' | 'admin' | 'staff'>('staff');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setRole(profile.role);
    }
  }, [profile]);

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitLoading(true);

    try {
      const updatedProfile: Profile = {
        ...profile,
        fullName,
        role
      };
      
      await profilesAPI.update(profile.id, updatedProfile);

      toast.success('Cập nhật thành công');
      onSuccess(updatedProfile);
      onOpenChange(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Lỗi khi cập nhật');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}
