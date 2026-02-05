import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/app/contexts/EventContext';
import { Event, Service, Staff } from '@/app/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, addEvent, updateEvent, getEvent } = useEvents();
  const isNew = id === 'new';

  const [event, setEvent] = useState<Event>({
    id: '',
    name: '',
    organizer: '',
    location: '',
    notes: '',
    scriptFileName: '',
    services: [],
    staff: [],
    budget: {
      estimatedServices: 0,
      actualServices: 0,
      estimatedStaff: 0,
      actualStaff: 0,
      estimatedTotal: 0,
      actualTotal: 0,
    },
    status: 'planning',
    createdAt: new Date().toISOString(),
    eventDate: '',
  });

  useEffect(() => {
    if (!isNew && id) {
      const existingEvent = getEvent(id);
      if (existingEvent) {
        setEvent(existingEvent);
      } else {
        navigate('/events');
      }
    }
  }, [id, isNew]);

  useEffect(() => {
    calculateBudget();
  }, [event.services, event.staff]);

  const calculateBudget = () => {
    const estimatedServices = event.services.reduce((sum, s) => sum + s.estimatedCost, 0);
    const actualServices = event.services.reduce((sum, s) => sum + (s.actualCost || 0), 0);
    const estimatedStaff = event.staff.reduce((sum, s) => sum + s.salary, 0);
    const actualStaff = estimatedStaff; // In real app, this could be different

    setEvent(prev => ({
      ...prev,
      budget: {
        estimatedServices,
        actualServices,
        estimatedStaff,
        actualStaff,
        estimatedTotal: estimatedServices + estimatedStaff,
        actualTotal: actualServices + actualStaff,
      }
    }));
  };

  const handleSave = () => {
    if (!event.name || !event.organizer || !event.location) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (isNew) {
      const newEvent = {
        ...event,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      addEvent(newEvent);
      toast.success('Tạo sự kiện thành công');
      navigate('/events');
    } else {
      updateEvent(event.id, event);
      toast.success('Cập nhật sự kiện thành công');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvent({ ...event, scriptFileName: file.name });
      toast.success('Tải kịch bản thành công');
    }
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      category: 'other',
      estimatedCost: 0,
      actualCost: 0,
      notes: '',
    };
    setEvent({ ...event, services: [...event.services, newService] });
  };

  const updateService = (index: number, updatedService: Partial<Service>) => {
    const newServices = [...event.services];
    newServices[index] = { ...newServices[index], ...updatedService };
    setEvent({ ...event, services: newServices });
  };

  const deleteService = (index: number) => {
    const newServices = event.services.filter((_, i) => i !== index);
    setEvent({ ...event, services: newServices });
  };

  const addStaff = () => {
    const newStaff: Staff = {
      id: Date.now().toString(),
      name: '',
      role: '',
      phone: '',
      email: '',
      salary: 0,
    };
    setEvent({ ...event, staff: [...event.staff, newStaff] });
  };

  const updateStaff = (index: number, updatedStaff: Partial<Staff>) => {
    const newStaff = [...event.staff];
    newStaff[index] = { ...newStaff[index], ...updatedStaff };
    setEvent({ ...event, staff: newStaff });
  };

  const deleteStaff = (index: number) => {
    const newStaff = event.staff.filter((_, i) => i !== index);
    setEvent({ ...event, staff: newStaff });
  };

  const importStaffFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const importedStaff: Staff[] = data.map((row: any, index) => ({
          id: `${Date.now()}-${index}`,
          name: row['Họ tên'] || row['Name'] || '',
          role: row['Vai trò'] || row['Role'] || '',
          phone: row['Số điện thoại'] || row['Phone'] || '',
          email: row['Email'] || '',
          salary: parseFloat(row['Lương'] || row['Salary'] || 0),
        }));

        setEvent({ ...event, staff: [...event.staff, ...importedStaff] });
        toast.success(`Nhập ${importedStaff.length} nhân sự thành công`);
      } catch (error) {
        toast.error('Lỗi khi đọc file Excel');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/events')}>
            <ArrowLeft className="size-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h2 className="text-3xl font-bold">
              {isNew ? 'Tạo sự kiện mới' : event.name}
            </h2>
            <p className="text-gray-500">
              {isNew ? 'Điền thông tin sự kiện' : 'Chỉnh sửa thông tin sự kiện'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="size-4 mr-2" />
          Lưu
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="services">Dịch vụ</TabsTrigger>
          <TabsTrigger value="staff">Nhân sự</TabsTrigger>
          <TabsTrigger value="budget">Kinh phí</TabsTrigger>
          <TabsTrigger value="summary">Tổng kết</TabsTrigger>
        </TabsList>

        {/* Tab Thông tin */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sự kiện *</Label>
                  <Input
                    id="name"
                    value={event.name}
                    onChange={(e) => setEvent({ ...event, name: e.target.value })}
                    placeholder="Nhập tên sự kiện"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer">Đơn vị tổ chức *</Label>
                  <Input
                    id="organizer"
                    value={event.organizer}
                    onChange={(e) => setEvent({ ...event, organizer: e.target.value })}
                    placeholder="Nhập đơn vị tổ chức"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm *</Label>
                  <Input
                    id="location"
                    value={event.location}
                    onChange={(e) => setEvent({ ...event, location: e.target.value })}
                    placeholder="Nhập địa điểm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Ngày diễn ra</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={event.eventDate}
                    onChange={(e) => setEvent({ ...event, eventDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={event.status}
                    onValueChange={(value: any) => setEvent({ ...event, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Lên kế hoạch</SelectItem>
                      <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="script">Kịch bản</Label>
                  <div className="flex gap-2">
                    <Input
                      id="script"
                      type="file"
                      onChange={handleFileUpload}
                      className="flex-1"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    {event.scriptFileName && (
                      <Button variant="outline" size="icon">
                        <FileText className="size-4" />
                      </Button>
                    )}
                  </div>
                  {event.scriptFileName && (
                    <p className="text-sm text-gray-500">Đã tải: {event.scriptFileName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={event.notes}
                  onChange={(e) => setEvent({ ...event, notes: e.target.value })}
                  placeholder="Nhập ghi chú về sự kiện..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Dịch vụ */}
        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dịch vụ sử dụng</CardTitle>
              <Button onClick={addService} size="sm">
                <Plus className="size-4 mr-2" />
                Thêm dịch vụ
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.services.map((service, index) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Tên dịch vụ</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(index, { name: e.target.value })}
                          placeholder="Tên dịch vụ"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Loại dịch vụ</Label>
                        <Select
                          value={service.category}
                          onValueChange={(value: any) => updateService(index, { category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mc">MC</SelectItem>
                            <SelectItem value="stage">Sân khấu</SelectItem>
                            <SelectItem value="decoration">Trang trí</SelectItem>
                            <SelectItem value="sound">Âm thanh</SelectItem>
                            <SelectItem value="lighting">Ánh sáng</SelectItem>
                            <SelectItem value="catering">Phục vụ ăn uống</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Chi phí dự kiến (VNĐ)</Label>
                        <Input
                          type="number"
                          value={service.estimatedCost}
                          onChange={(e) => updateService(index, { estimatedCost: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Chi phí thực tế (VNĐ)</Label>
                        <Input
                          type="number"
                          value={service.actualCost || 0}
                          onChange={(e) => updateService(index, { actualCost: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Ghi chú</Label>
                        <Input
                          value={service.notes || ''}
                          onChange={(e) => updateService(index, { notes: e.target.value })}
                          placeholder="Ghi chú về dịch vụ"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="size-4 mr-2" />
                            Xóa
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa dịch vụ này?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteService(index)}>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}

                {event.services.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có dịch vụ nào. Hãy thêm dịch vụ mới!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Nhân sự */}
        <TabsContent value="staff">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Danh sách nhân sự</CardTitle>
              <div className="flex gap-2">
                <Button onClick={addStaff} size="sm" variant="outline">
                  <Plus className="size-4 mr-2" />
                  Thêm thủ công
                </Button>
                <Button size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="size-4 mr-2" />
                    Nhập Excel
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={importStaffFromExcel}
                    />
                  </label>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.staff.map((person, index) => (
                  <div key={person.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Họ tên</Label>
                        <Input
                          value={person.name}
                          onChange={(e) => updateStaff(index, { name: e.target.value })}
                          placeholder="Họ và tên"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Vai trò</Label>
                        <Input
                          value={person.role}
                          onChange={(e) => updateStaff(index, { role: e.target.value })}
                          placeholder="Vai trò"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input
                          value={person.phone}
                          onChange={(e) => updateStaff(index, { phone: e.target.value })}
                          placeholder="Số điện thoại"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={person.email}
                          onChange={(e) => updateStaff(index, { email: e.target.value })}
                          placeholder="email@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Lương (VNĐ)</Label>
                        <Input
                          type="number"
                          value={person.salary}
                          onChange={(e) => updateStaff(index, { salary: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="size-4 mr-2" />
                            Xóa
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa nhân sự này?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteStaff(index)}>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}

                {event.staff.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có nhân sự nào. Hãy thêm nhân sự mới!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Kinh phí */}
        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý kinh phí</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold text-lg mb-4">Chi phí dự kiến</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Dịch vụ:</span>
                        <span className="font-medium">
                          {event.budget.estimatedServices.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nhân sự:</span>
                        <span className="font-medium">
                          {event.budget.estimatedStaff.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-blue-200">
                        <span className="font-semibold">Tổng cộng:</span>
                        <span className="font-bold text-lg text-blue-600">
                          {event.budget.estimatedTotal.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold text-lg mb-4">Chi phí thực tế</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Dịch vụ:</span>
                        <span className="font-medium">
                          {event.budget.actualServices.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nhân sự:</span>
                        <span className="font-medium">
                          {event.budget.actualStaff.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-green-200">
                        <span className="font-semibold">Tổng cộng:</span>
                        <span className="font-bold text-lg text-green-600">
                          {event.budget.actualTotal.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4">Chênh lệch</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Chênh lệch dịch vụ:</span>
                      <span className={`font-medium ${
                        event.budget.actualServices - event.budget.estimatedServices > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {(event.budget.actualServices - event.budget.estimatedServices).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chênh lệch nhân sự:</span>
                      <span className={`font-medium ${
                        event.budget.actualStaff - event.budget.estimatedStaff > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {(event.budget.actualStaff - event.budget.estimatedStaff).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="font-semibold">Tổng chênh lệch:</span>
                      <span className={`font-bold text-lg ${
                        event.budget.actualTotal - event.budget.estimatedTotal > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {(event.budget.actualTotal - event.budget.estimatedTotal).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Tổng kết */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Tổng kết sự kiện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Thông tin sự kiện</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Tên sự kiện:</span>
                    <span className="font-medium">{event.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Đơn vị tổ chức:</span>
                    <span className="font-medium">{event.organizer}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Địa điểm:</span>
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="font-medium capitalize">
                      {event.status === 'planning' ? 'Lên kế hoạch' :
                       event.status === 'ongoing' ? 'Đang diễn ra' : 'Hoàn thành'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Dịch vụ sử dụng ({event.services.length})</h3>
                <div className="space-y-2">
                  {event.services.map((service, idx) => (
                    <div key={service.id} className="flex justify-between items-center border-b pb-2 text-sm">
                      <span>{idx + 1}. {service.name}</span>
                      <span className="font-medium">{service.estimatedCost.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  ))}
                  {event.services.length === 0 && (
                    <p className="text-gray-500 text-sm">Chưa có dịch vụ nào</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Nhân sự ({event.staff.length})</h3>
                <div className="space-y-2">
                  {event.staff.map((person, idx) => (
                    <div key={person.id} className="flex justify-between items-center border-b pb-2 text-sm">
                      <div>
                        <span>{idx + 1}. {person.name}</span>
                        <span className="text-gray-500 ml-2">- {person.role}</span>
                      </div>
                      <span className="font-medium">{person.salary.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  ))}
                  {event.staff.length === 0 && (
                    <p className="text-gray-500 text-sm">Chưa có nhân sự nào</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Tổng kết kinh phí</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Kinh phí dự kiến</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {event.budget.estimatedTotal.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Kinh phí thực tế</p>
                    <p className="text-2xl font-bold text-green-600">
                      {event.budget.actualTotal.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
