
import { useEffect, useState } from 'react';
import { profilesAPI, type Profile } from '@/api/profiles';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { CreateAccountDialog } from './components/CreateAccountDialog';
import { EditRoleDialog } from './components/EditRoleDialog';
import { AccountsTable } from './components/AccountsTable';

export function AccountManagementPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // For delete actions
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const fetchProfiles = async () => {
    try {
      const data = await profilesAPI.getAll();
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

  const handleDeleteAccount = async (id: string, userEmail: string) => {
    // confirm is synchronous here
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${userEmail}?`)) return;

    setActionLoading(true);
    console.log('Deleting account:', id);

    try {
      // 1. Delete in Supabase Auth
      try {
        await supabaseAdmin.auth.admin.deleteUser(id);
      } catch (authErr: any) {
        console.warn('Supabase Auth Delete issue (ignoring):', authErr.message);
      }

      // 2. Delete in Backend Database
      try {
        await profilesAPI.delete(id);
      } catch (dbErr: any) {
        if (dbErr.response?.status !== 404) {
          console.error('Backend Delete Error:', dbErr);
        }
      }

      // 3. Update UI
      setProfiles(current => current.filter(p => p.id !== id));
      toast.success('Đã xóa tài khoản');
    } catch (error: any) {
      console.error('Delete process error:', error);
      toast.error(error.message || 'Lỗi khi xóa tài khoản');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsEditOpen(true);
  };

  const handleCreateSuccess = (newProfile: Profile) => {
    setProfiles(current => {
       const filtered = current.filter(p => p.id !== newProfile.id);
       return [...filtered, newProfile].sort((a, b) => (a.email || '').localeCompare(b.email || ''));
    });
  };

  const handleEditSuccess = (updatedProfile: Profile) => {
      setProfiles(current => current.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý nhân sự</h2>
          <p className="text-gray-500 mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        
        <Button onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm tài khoản
        </Button>
      </div>

      <CreateAccountDialog 
         open={isCreateOpen} 
         onOpenChange={setIsCreateOpen}
         onSuccess={handleCreateSuccess}
      />

      <Card>
        <CardContent className="p-0">
           <AccountsTable 
              profiles={profiles}
              loading={loading}
              actionLoading={actionLoading}
              onEdit={openEdit}
              onDelete={handleDeleteAccount}
           />
        </CardContent>
      </Card>

      <EditRoleDialog
         open={isEditOpen}
         onOpenChange={setIsEditOpen}
         profile={selectedProfile}
         onSuccess={handleEditSuccess}
      />
    </div>
  );
}
