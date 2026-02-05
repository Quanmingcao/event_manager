
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Save, Trash2, RefreshCw } from 'lucide-react';
import type { Event } from '@/types';

interface EventHeaderProps {
  event: Partial<Event>;
  isNew: boolean;
  onSave: () => void;
  onExport: () => void;
  onDelete: () => void;
  onAutoUpdateStatus: () => void;
  onBack: () => void;
}

export function EventHeader({ event, isNew, onSave, onExport, onDelete, onAutoUpdateStatus, onBack }: EventHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isNew ? 'Sự kiện mới' : event.name}
          </h2>
          <p className="text-muted-foreground">
            {isNew ? 'Điền thông tin để tạo sự kiện' : (event.organizer || 'Chưa cập nhật đơn vị')}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
         {!isNew && (
           <>
              <Button 
                 onClick={onAutoUpdateStatus} 
                 variant="outline"
                 className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                 <RefreshCw className="mr-2 size-4" /> Cập nhật trạng thái
              </Button>
              <Button 
                 onClick={onDelete} 
                 className="bg-red-600 hover:bg-red-700 text-white"
              >
                 <Trash2 className="mr-2 size-4" /> Xóa sự kiện
              </Button>
              <Button variant="outline" onClick={onExport}>
                 <Download className="mr-2 size-4" /> Xuất Excel
              </Button>
           </>
         )}
         <Button onClick={onSave}>
            <Save className="mr-2 size-4" /> Lưu thông tin
         </Button>
      </div>
    </div>
  );
}
