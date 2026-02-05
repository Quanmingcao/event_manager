import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/app/contexts/EventContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Plus, Search, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';

export function EventList() {
  const { events, deleteEvent } = useEvents();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(search.toLowerCase()) ||
    event.organizer.toLowerCase().includes(search.toLowerCase()) ||
    event.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteEvent(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Danh sách sự kiện</h2>
          <p className="text-gray-500">Quản lý tất cả các sự kiện</p>
        </div>
        <Button onClick={() => navigate('/events/new')}>
          <Plus className="size-4 mr-2" />
          Tạo sự kiện mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="size-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sự kiện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {search ? 'Không tìm thấy sự kiện nào' : 'Chưa có sự kiện nào. Hãy tạo sự kiện mới!'}
              </div>
            ) : (
              filteredEvents.map(event => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'ongoing' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {event.status === 'planning' ? 'Lên kế hoạch' :
                           event.status === 'ongoing' ? 'Đang diễn ra' : 'Hoàn thành'}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>{event.organizer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">Dịch vụ:</span>
                          <span className="ml-2 font-medium">{event.services.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Nhân sự:</span>
                          <span className="ml-2 font-medium">{event.staff.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Kinh phí:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {event.budget.estimatedTotal.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa sự kiện "{event.name}"? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
