
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserCog, Trash2, Loader2 } from 'lucide-react';
import type { Profile } from '@/api/profiles';

interface AccountsTableProps {
  profiles: Profile[];
  loading: boolean;
  actionLoading: boolean;
  onEdit: (profile: Profile) => void;
  onDelete: (id: string, email: string) => void;
}

export function AccountsTable({ profiles, loading, actionLoading, onEdit, onDelete }: AccountsTableProps) {
  return (
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
              <Button variant="ghost" size="icon" onClick={() => onEdit(p)} disabled={actionLoading}>
                <UserCog className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDelete(p.id, p.email)} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
