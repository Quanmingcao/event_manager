import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { eventsAPI } from '@/api/events';
import type { CreateEventInput } from '@/types';

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddEventModal({ open, onOpenChange, onSuccess }: AddEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventInput>({
    name: '',
    organizer: '',
    location: '',
    startDate: '',
    format: 'offline',
    status: 'Planning',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      };
      console.log('Sending payload:', payload);
      await eventsAPI.create(payload as any);
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        organizer: '',
        location: '',
        startDate: '',
        format: 'offline',
        status: 'Planning',
      });
    } catch (error: any) {
      console.error('Error creating event:', error);
      console.error('Error response:', error.response?.data);
      alert(`Lỗi khi tạo sự kiện: ${error.response?.data?.Details || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo sự kiện mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="name">Tên sự kiện *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="organizer">Đơn vị tổ chức *</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Địa điểm *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="startDate">Ngày bắt đầu *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="format">Hình thức *</Label>
              <select
                id="format"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as 'online' | 'offline' | 'hybrid' })}
                required
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Trạng thái *</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Planning' | 'Running' | 'Completed' | 'Canceled' })}
                required
              >
                <option value="Planning">Planning</option>
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
