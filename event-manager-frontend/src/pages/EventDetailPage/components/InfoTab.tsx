
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Trash2 } from 'lucide-react';
import type { Event } from '@/types';

interface InfoTabProps {
  event: Partial<Event>;
  onChange: (updates: Partial<Event>) => void;
  onFileUpload: (field: 'scriptLink' | 'timelineLink', file: File) => void;
  onFileDelete: (field: 'scriptLink' | 'timelineLink') => void;
}

export function InfoTab({ event, onChange, onFileUpload, onFileDelete }: InfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiết sự kiện</CardTitle>
        <CardDescription>Quản lý các thông tin cơ bản và tài liệu đính kèm.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tên sự kiện *</Label>
            <Input 
              value={event.name} 
              onChange={e => onChange({ name: e.target.value })} 
              placeholder="VD: Lễ Trao bằng Tốt nghiệp..." 
            />
          </div>
          <div className="space-y-2">
            <Label>Đơn vị tổ chức *</Label>
            <Input 
              value={event.organizer} 
              onChange={e => onChange({ organizer: e.target.value })} 
              placeholder="VD: Phòng Công tác Sinh viên" 
            />
          </div>
          <div className="space-y-2">
            <Label>Địa điểm</Label>
            <Input 
              value={event.location} 
              onChange={e => onChange({ location: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Ngày bắt đầu</Label>
            <Input 
              type="date"
              value={event.startDate ? event.startDate.split('T')[0] : ''} 
              onChange={e => onChange({ startDate: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Hình thức</Label>
            <Select 
              value={event.format} 
              onValueChange={(v: any) => onChange({ format: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select 
              value={event.status} 
              onValueChange={(v: 'Planning' | 'Running' | 'Completed' | 'Canceled') => onChange({ status: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Đang kế hoạch</SelectItem>
                <SelectItem value="Running">Đang diễn ra</SelectItem>
                <SelectItem value="Completed">Đã hoàn thành</SelectItem>
                <SelectItem value="Canceled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
           <div className="space-y-2">
               <Label className="flex items-center gap-2"><FileText className="size-4"/> Kịch bản (Script)</Label>
              {event.scriptLink ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                   <FileText className="size-4 text-blue-600 mb-0.5" />
                   <a href={event.scriptLink} target="_blank" rel="noreferrer" className="flex-1 text-sm text-blue-600 truncate hover:underline" title={event.scriptLink}>
                      {decodeURIComponent(event.scriptLink.split('/').pop() || 'Xem file')}
                   </a>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => onFileDelete('scriptLink')}>
                      <Trash2 className="size-4" />
                   </Button>
                </div>
              ) : (
                <Input type="file" onChange={(e) => e.target.files?.[0] && onFileUpload('scriptLink', e.target.files[0])} />
              )}
           </div>
           <div className="space-y-2">
              <Label className="flex items-center gap-2"><FileText className="size-4"/> Timeline (Excel/Image)</Label>
              {event.timelineLink ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                   <FileText className="size-4 text-orange-600 mb-0.5" />
                   <a href={event.timelineLink} target="_blank" rel="noreferrer" className="flex-1 text-sm text-blue-600 truncate hover:underline" title={event.timelineLink}>
                      {decodeURIComponent(event.timelineLink.split('/').pop() || 'Xem file')}
                   </a>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => onFileDelete('timelineLink')}>
                      <Trash2 className="size-4" />
                   </Button>
                </div>
              ) : (
                <Input type="file" onChange={(e) => e.target.files?.[0] && onFileUpload('timelineLink', e.target.files[0])} />
              )}
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
