import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export function TaskTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Mẫu công việc</h2>
        <p className="text-gray-500 mt-1">Quản lý các mẫu công việc cho sự kiện</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang phát triển
          </h3>
          <p className="text-gray-500">
            Tính năng này sẽ sớm được cập nhật
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
