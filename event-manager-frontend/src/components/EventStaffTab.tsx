import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Trash2, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { eventStaffAPI, type EventStaff } from '@/api/eventStaff';
import { downloadStaffTemplate } from '@/lib/excelExport';

interface EventStaffTabProps {
  eventId: string;
  eventStaffList: EventStaff[];
  onRefresh: () => void;
}

export function EventStaffTab({ eventId, eventStaffList, onRefresh }: EventStaffTabProps) {
  const [localStaff, setLocalStaff] = useState<EventStaff[]>(eventStaffList);

  // Sync with parent when eventStaffList changes
  useEffect(() => {
    setLocalStaff(eventStaffList);
  }, [eventStaffList]);

  const handleAddRow = () => {
    const newStaff: Partial<EventStaff> = {
      id: `temp-${Date.now()}`,
      eventId,
      fullName: '',
      phone: '',
      department: '',
      staffType: 'Tình nguyện viên',
      assignedTask: '',
      note: '',
    };
    setLocalStaff([...localStaff, newStaff as EventStaff]);
  };

  const handleSaveRow = async (staff: EventStaff) => {
    if (!staff.fullName.trim()) {
      toast.error('Vui lòng nhập tên nhân sự');
      return;
    }

    try {
      if (staff.id.startsWith('temp-')) {
        // Create new
        await eventStaffAPI.create({
          eventId,
          fullName: staff.fullName,
          phone: staff.phone,
          department: staff.department,
          staffType: staff.staffType,
          assignedTask: staff.assignedTask,
          note: staff.note,
        });
        toast.success('Đã thêm nhân sự');
      } else {
        // Update existing
        await eventStaffAPI.update(staff.id, {
          eventId: staff.eventId,
          fullName: staff.fullName,
          phone: staff.phone,
          department: staff.department,
          staffType: staff.staffType,
          assignedTask: staff.assignedTask,
          note: staff.note,
        });
        toast.success('Đã cập nhật');
      }
      onRefresh();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Lỗi khi lưu nhân sự');
    }
  };

  const handleDeleteRow = async (staffId: string) => {
    if (staffId.startsWith('temp-')) {
      setLocalStaff(localStaff.filter(s => s.id !== staffId));
      return;
    }

    try {
      await eventStaffAPI.delete(staffId);
      toast.success('Đã xóa nhân sự');
      onRefresh();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Lỗi khi xóa');
    }
  };

  const updateLocal = (idx: number, updates: Partial<EventStaff>) => {
    const updated = [...localStaff];
    updated[idx] = { ...updated[idx], ...updates };
    setLocalStaff(updated);
  };

  const handleSaveAll = async () => {
    const staffToSave = localStaff.filter(s => s.fullName.trim());
    if (staffToSave.length === 0) {
      toast.error('Không có nhân sự nào để lưu');
      return;
    }

    try {
      let saved = 0;
      for (const staff of staffToSave) {
        if (staff.id.startsWith('temp-')) {
          await eventStaffAPI.create({
            eventId,
            fullName: staff.fullName,
            phone: staff.phone,
            department: staff.department,
            staffType: staff.staffType,
            assignedTask: staff.assignedTask,
            note: staff.note,
          });
          saved++;
        } else {
          await eventStaffAPI.update(staff.id, {
            eventId: staff.eventId,
            fullName: staff.fullName,
            phone: staff.phone,
            department: staff.department,
            staffType: staff.staffType,
            assignedTask: staff.assignedTask,
            note: staff.note,
          });
          saved++;
        }
      }
      toast.success(`Đã lưu ${saved} nhân sự`);
      onRefresh();
    } catch (error) {
      console.error('Error saving all:', error);
      toast.error('Lỗi khi lưu tất cả');
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to EventStaff
        const staffToImport = jsonData.map((row: any) => ({
          eventId,
          fullName: row['Họ và tên'] || row['fullName'] || '',
          phone: row['Số điện thoại'] || row['phone'] || '',
          department: row['Phòng ban'] || row['department'] || '',
          staffType: row['Loại nhân sự'] || row['staffType'] || 'Tình nguyện viên',
          assignedTask: row['Công việc'] || row['assignedTask'] || '',
          note: row['Ghi chú'] || row['note'] || '',
        }));

        // Bulk create
        await eventStaffAPI.createBulk(staffToImport);
        toast.success(`Đã import ${staffToImport.length} nhân sự`);
        onRefresh();
      } catch (error) {
        console.error('Error importing:', error);
        toast.error('Lỗi khi import Excel');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleExportExcel = () => {
    const data = localStaff.map((s, idx) => ({
      'STT': idx + 1,
      'Họ và tên': s.fullName,
      'Số điện thoại': s.phone || '',
      'Phòng ban': s.department || '',
      'Loại nhân sự': s.staffType || '',
      'Công việc': s.assignedTask || '',
      'Ghi chú': s.note || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nhân sự');
    XLSX.writeFile(wb, `Nhan_su_${eventId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Danh sách nhân sự ({localStaff.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-blue-600" onClick={downloadStaffTemplate}>
               <Download className="h-4 w-4 mr-2" />
               Tải file mẫu
            </Button>
            <label htmlFor="import-excel">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Excel
                </span>
              </Button>
            </label>
            <input
              id="import-excel"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
            />
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSaveAll}>
              <Save className="h-4 w-4 mr-2" />
              Lưu tất cả
            </Button>
            <Button size="sm" onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm nhân sự
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {localStaff.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có nhân sự nào. Click "Thêm nhân sự" hoặc "Import Excel" để bắt đầu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên *</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Công việc</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {localStaff.map((staff, idx) => (
                  <tr key={staff.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">
                      <Input
                        value={staff.fullName}
                        onChange={(e) => updateLocal(idx, { fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={staff.phone || ''}
                        onChange={(e) => updateLocal(idx, { phone: e.target.value })}
                        placeholder="0123456789"
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={staff.department || ''}
                        onChange={(e) => updateLocal(idx, { department: e.target.value })}
                        placeholder="Phòng CTSV"
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Select
                        value={staff.staffType || 'Tình nguyện viên'}
                        onValueChange={(v) => updateLocal(idx, { staffType: v })}
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cán bộ">Cán bộ</SelectItem>
                          <SelectItem value="Sinh viên">Sinh viên</SelectItem>
                          <SelectItem value="Tình nguyện viên">Tình nguyện viên</SelectItem>
                          <SelectItem value="CTV">CTV</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={staff.assignedTask || ''}
                        onChange={(e) => updateLocal(idx, { assignedTask: e.target.value })}
                        placeholder="MC, Kỹ thuật..."
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={staff.note || ''}
                        onChange={(e) => updateLocal(idx, { note: e.target.value })}
                        placeholder="Ghi chú..."
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600"
                          onClick={() => handleSaveRow(staff)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDeleteRow(staff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
