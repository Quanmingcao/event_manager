import { useEffect, useState } from 'react';
import { staffAPI } from '@/api/staff';
import type { Staff } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Phone, Building2, User } from 'lucide-react';

export function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await staffAPI.getAll();
        setStaff(data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý nhân sự</h2>
          <p className="text-gray-500 mt-1">Danh sách nhân viên và cộng tác viên</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân sự
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staff.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {member.staffType}
                  </span>
                </div>

                <div className="w-full space-y-2 text-sm text-gray-500">
                  {member.phone && (
                    <div className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.department && (
                    <div className="flex items-center justify-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có nhân sự nào
            </h3>
            <p className="text-gray-500 mb-4">
              Thêm nhân viên để quản lý công việc
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm nhân sự
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
