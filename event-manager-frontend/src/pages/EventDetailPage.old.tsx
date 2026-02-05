import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/api/events';
import { eventTasksAPI } from '@/api/eventTasks';
import { eventFinancesAPI } from '@/api/eventFinances';
import { eventStaffAPI, type EventStaff } from '@/api/eventStaff';
import { staffAPI } from '@/api/staff';
import { servicesAPI } from '@/api/services';
import { taskTemplatesAPI } from '@/api/taskTemplates';

import type { Event, EventTask, EventFinance, FinanceSummary, Staff, Service, TaskTemplate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Plus, Save, Trash2, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EventStaffTab } from '@/components/EventStaffTab';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  // Local State for Event Info (Form)
  const [event, setEvent] = useState<Partial<Event>>({
    name: '',
    organizer: '',
    location: '',
    format: 'offline',
    status: 'Planning',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Data State
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [eventStaffList, setEventStaffList] = useState<EventStaff[]>([]);
  const [finances, setFinances] = useState<EventFinance[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);

  // Catalogs
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [templateList, setTemplateList] = useState<TaskTemplate[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [staff, services, templates] = await Promise.all([
          staffAPI.getAll(),
          servicesAPI.getAll(),
          taskTemplatesAPI.getAll()
        ]);
        setStaffList(staff);
        setServiceList(services);
        setTemplateList(templates);
      } catch (error) {
        console.error('Failed to load catalogs', error);
        toast.error('Không thể tải danh mục dữ liệu');
      }
    };
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (!id || isNew) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const eventData = await eventsAPI.getById(id);
        setEvent(eventData);

        // Load related data parallel
        const [tasksData, eventStaffData, financesData, summaryData] = await Promise.all([
          eventTasksAPI.getByEvent(id).catch(() => []),
          eventStaffAPI.getByEvent(id).catch(() => []),
          eventFinancesAPI.getByEvent(id).catch(() => []),
          eventFinancesAPI.getSummary(id).catch(() => null)
        ]);

        setTasks(tasksData);
        setEventStaffList(eventStaffData);
        
        // Enhance finances with derived quantity if possible
        // We need serviceList to be loaded. It usually is by now if initialized in parallel.
        // But to be safe, we can do it in a separate effect or just rely on the component render to handle defaults,
        // AND one-time calculation here if services are already in state? 
        // Actually, state updates are batched. `serviceList` might be empty here if this useEffect runs before loadCatalogs finishes.
        // Better strategy: useEffect dependency on [financesData, serviceList].
        // For now, let's just set raw data.
        setFinances(financesData);
        setSummary(summaryData);
      } catch (error) {
        toast.error('Lỗi khi tải thông tin sự kiện');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, navigate]);

  // Effect to derive quantity once services and finances are available
  useEffect(() => {
     if (serviceList.length > 0 && finances.length > 0) {
         setFinances(prev => prev.map(f => {
             // If already has quantity (user edited), skip
             if ((f as any).quantity) return f;
             
             // If manual service or no service, qty 1
             if (!f.serviceId) return { ...f, quantity: 1 } as any;

             const svc = serviceList.find(s => s.id === f.serviceId);
             if (svc && svc.basePrice > 0) {
                 const qty = Math.round(f.estimatedAmount / svc.basePrice);
                 // Only set if it divides evenly or close enough? 
                 // Let's assume yes.
                 return { ...f, quantity: qty > 0 ? qty : 1 } as any;
             }
             return { ...f, quantity: 1 } as any;
         }));
     }
  }, [serviceList.length]); // Only run when serviceList populates mostly. 
  // Warning: if finances change (user adds row), we don't want to re-run this and overwrite user inputs.
  // So dependency should be careful. 
  // Ideally, we only run this when we *first* receive data. 
  // But `finances` state changes on every edit.
  // Let's stick to the render-time derivation or just accept the limitation for now to avoid state loops.
  // BETTER: Calculate default value in the render method directly? 
  // No, because we want to EDIT it.
  
  // Revised approach: Do nothing here.
  // In the render return: `value={(f as any).quantity || (f.serviceId && getServicePrice(...) > 0 ? f.estimatedAmount/price : 1)}`
  // But we need to onChange it.
  

  // --- Handlers: Event Info ---
  const handleSaveInfo = async () => {
    try {
      if (!event.name || !event.organizer) {
        toast.error('Vui lòng điền tên và đơn vị tổ chức');
        return;
      }

      const payload = {
        ...event,
        startDate: event.startDate ? new Date(event.startDate).toISOString() : null
      };

      if (isNew) {
        const created = await eventsAPI.create(payload as any);
        toast.success('Tạo sự kiện thành công');
        navigate(`/events/${created.id}`);
      } else if (id) {
        await eventsAPI.update(id, payload as any);
        // Refresh event data to ensure UI is in sync
        const updatedEvent = await eventsAPI.getById(id);
        setEvent(updatedEvent);
        toast.success('Cập nhật thông tin thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi lưu sự kiện');
    }
  };

  const handleFileUpload = async (field: 'scriptLink' | 'timelineLink', file: File) => {
    try {
      toast.info('Đang tải file lên...');
      const url = await eventsAPI.uploadFile(file);
      setEvent(prev => ({ ...prev, [field]: url }));
      
      // Auto save if existing event
      if (!isNew && id) {
        await eventsAPI.update(id, { [field]: url });
        // Refresh event data to ensure UI is in sync
        const updatedEvent = await eventsAPI.getById(id);
        setEvent(updatedEvent);
        toast.success('Đã lưu file và cập nhật sự kiện');
      } else {
        toast.success('Đã tải file xong (nhớ Lưu sự kiện)');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải file');
    }
  };

  const handleDeleteFile = async (field: 'scriptLink' | 'timelineLink') => {
      if (!confirm('Bạn có chắc muốn xóa file này không?')) return;
      try {
        // Technically we should also delete from Storage, but API doesn't support generic delete yet easily
        // and we might want to keep history. For now, just unlink from Event.
        // Update local state
        setEvent(prev => ({ ...prev, [field]: null }));
        // Update backend
        if (id && !isNew) {
            await eventsAPI.update(id, { [field]: null });
            toast.success('Đã xóa file đính kèm');
        }
      } catch (e) {
          toast.error('Lỗi khi xóa file');
      }
  };

  // --- Handlers: TASKS ---
  const handleAddTask = async () => {
    if (isNew || !id) return toast.warning('Vui lòng tạo sự kiện trước');
    try {
      // Create a default task placeholder? Or open modal?
      // For simplicity, create a task with empty values if backend allows, or prompt.
      // Better: Append a specialized "isNew" item to local state and save later?
      // No, let's just add a blank task row locally and require Save.
      // ACTUALLY: Backend requires TaskId and StaffId.
      // Let's add an empty row to UI, validation on Save.
      // But managing "draft" rows mixed with real rows is hard.
      // Strategy: Create immediately with dummy data? No.
      // Strategy: Add a local "draft" object.
      // Simplified: Just add a row to `tasks` list with `id: 'temp-...'`
      const newTask: EventTask = {
        id: `temp-${Date.now()}`,
        eventId: id,
        taskId: '', // Invalid initially
        staffId: '', // Invalid initially
        status: 'Pending',
        note: '',
      } as any;
      setTasks([...tasks, newTask]);
    } catch (error) {}
  };

  const handleSaveTaskRow = async (task: EventTask, skipRefresh = false) => {
    try {
      if (!task.taskId) {
        return toast.error('Vui lòng chọn công việc');
      }

      // Logic to resolve Staff
      let finalStaffId: string | null = task.staffId || (task as any).StaffId || null;
      const tempName = (task as any).tempStaffName;
      const tempType = (task as any).tempStaffType || 'Tình nguyện viên';

      if (!finalStaffId && tempName) {
           // User typed a name. Check if it exists in our list
           const existing = staffList.find(s => (s.fullName || (s as any).FullName || '').toLowerCase() === tempName.toLowerCase());
           if (existing) {
               console.log('Linking to existing staff:', existing);
               finalStaffId = existing.id || (existing as any).Id;
           } else {
               // Create new staff
               try {
                   console.log('Creating new staff:', tempName);
                   const newStaff = await staffAPI.create({ 
                       fullName: tempName, 
                       staffType: tempType 
                   });
                   console.log('Created new staff successfully:', newStaff);
                   // Support both id and Id casing from backend
                   const actualId = newStaff.id || (newStaff as any).Id;
                   if (actualId) {
                      setStaffList(prev => [...prev, { ...newStaff, id: actualId }]);
                      finalStaffId = actualId;
                   } else {
                      console.error('Failed to get ID from new staff object:', newStaff);
                      throw new Error('Không lấy được ID nhân sự mới');
                   }
               } catch (e) {
                   toast.error('Lỗi khi tạo nhân sự: ' + tempName);
                   return;
               }
           }
      }

      if (!finalStaffId) {
          return toast.error('Vui lòng chọn hoặc nhập tên nhân sự');
      }
      
      const currentTaskId = task.taskId || (task as any).TaskId;
      if (!currentTaskId) {
          return toast.error('Vui lòng chọn công việc');
      }

      const payload: any = {
        eventId: id!,
        EventId: id!,
        taskId: currentTaskId,
        TaskId: currentTaskId,
        staffId: finalStaffId,
        StaffId: finalStaffId,
        status: 'Pending',
        note: task.note || null
      };

      console.log('Payload for EventTask:', payload);

      console.log('Saving Task Row:', { 
          originalId: task.id, 
          isNew: task.id.startsWith('temp-'),
          payload 
      });

      if (task.id.startsWith('temp-')) {
        await eventTasksAPI.create(payload);
        if (!skipRefresh) toast.success('Đã thêm phân công');
      } else {
        await eventTasksAPI.update(task.id, payload);
        if (!skipRefresh) toast.success('Đã cập nhật phân công');
      }

      if (!skipRefresh) {
        const newTasks = await eventTasksAPI.getByEvent(id!);
        setTasks(newTasks);
      }
    } catch (e: any) {
      console.error('Error saving task:', e);
      if (e.response?.data?.errors) {
          const errors = e.response.data.errors;
          console.error('Validation Errors:', errors);
          const firstError = Object.values(errors)[0];
          toast.error(`Lỗi dữ liệu: ${firstError}`);
      } else {
          toast.error('Lỗi khi lưu phân công: ' + (e.response?.data?.Details || e.message));
      }
      throw e; // Re-throw to catch in handleSaveAllTasks
    }
  };

  const handleSaveAllTasks = async () => {
    try {
      const tasksToSave = tasks.filter(t => t.id.startsWith('temp-') || (t as any).tempStaffName);
      
      if (tasksToSave.length === 0) {
        return toast.info('Không có thay đổi nào cần lưu');
      }

      toast.info(`Đang lưu ${tasksToSave.length} phân công...`);
      
      for (const task of tasksToSave) {
        await handleSaveTaskRow(task, true);
      }
      
      const newTasks = await eventTasksAPI.getByEvent(id!);
      setTasks(newTasks);
      toast.success('Đã lưu tất cả phân công');
    } catch (e) {
      // Error already handled in handleSaveTaskRow toast
      console.error('Bulk save failed:', e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (taskId.startsWith('temp-')) {
      setTasks(tasks.filter(t => t.id !== taskId));
      return;
    }
    try {
      await eventTasksAPI.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Đã xóa');
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  const updateLocalTask = (idx: number, updates: Partial<EventTask>) => {
    const newTasks = [...tasks];
    newTasks[idx] = { ...newTasks[idx], ...updates };
    setTasks(newTasks);
  };

  // --- Handlers: FINANCES ---
  const handleAddFinance = () => {
    if (isNew || !id) return toast.warning('Vui lòng tạo sự kiện trước');
    const newFin: EventFinance = {
      id: `temp-${Date.now()}`,
      eventId: id,
      serviceId: undefined,
      estimatedAmount: 0,
      extraAmount: 0,
      estimatedNote: '',
      extraNote: '',
      quantity: 1, // Default quantity
    } as any;
    setFinances([...finances, newFin]);
  };

  const handleSaveFinanceRow = async (fin: EventFinance) => {
    try {
      // Auto fill estimated amount from service if 0?
      // If service selected and amount is 0, maybe user wants base price.
      // But let's just save what is there.
      
      // Backend Validation Fix: Ensure we DO NOT send 'event', 'service' objects, only IDs.
      // And strict casing check if needed (though usually camelCase -> PascalCase is handled or matched).
      const payload: any = {
          eventId: id!,
          serviceId: fin.serviceId || null,
          estimatedAmount: Number(fin.estimatedAmount) || 0,
          extraAmount: Number(fin.extraAmount) || 0,
          estimatedNote: fin.estimatedNote || null,
          extraNote: fin.extraNote || null
      };
      
      // Explicitly delete any navigation properties if they somehow crept in from 'fin'
      // (Though we are constructing a new object above, so they shouldn't be there.)
      // The error "The Event field is required" suggests the Backend Model expects "Event" to be populated 
      // OR "EventId" is missing/empty.
      // We are sending 'eventId'. 
      // It is possible the backend DTO requires 'Event' object? Unlikely for a Create DTO.
      // OR, maybe the backend is using the Entity class directly as DTO, and 'Event' property is [Required].
      // If so, we can't fix it from frontend easily without backend change, UNLESS we pass the Event object?
      // No, that causes circular ref.
      // Most likely: "EventId" vs "eventId" casing issue? Or `id` is empty?
      console.log('Sending Payload:', payload);

      if (fin.id.startsWith('temp-')) {
        await eventFinancesAPI.create(payload);
        toast.success('Đã thêm khoản chi');
      } else {
        await eventFinancesAPI.update(fin.id, payload);
        toast.success('Đã cập nhật khoản chi');
      }
      const [newFin, newSum] = await Promise.all([
        eventFinancesAPI.getByEvent(id!),
        eventFinancesAPI.getSummary(id!)
      ]);
      setFinances(newFin);
      setSummary(newSum);
    } catch (e: any) {
      console.error('Full Error Object:', e);
      if (e.response?.data?.errors) {
         console.error('Validation Errors:', e.response.data.errors);
         // Alert user to check console for now, or just show the first error
         const firstError = Object.values(e.response.data.errors)[0];
         toast.error(`Lỗi dữ liệu: ${firstError}`);
      } else {
         toast.error('Lỗi khi lưu: ' + (e.message || 'Unknown error'));
      }
    }
  };

  const handleDeleteFinance = async (finId: string) => {
    if (finId.startsWith('temp-')) {
      setFinances(finances.filter(f => f.id !== finId));
      return;
    }
    try {
      await eventFinancesAPI.delete(finId);
      setFinances(finances.filter(f => f.id !== finId));
      setSummary(await eventFinancesAPI.getSummary(id!));
      toast.success('Đã xóa');
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  const updateLocalFinance = (idx: number, updates: Partial<EventFinance>) => {
    const newFin = [...finances];
    // Auto-populate price if service changes
    if (updates.serviceId) {
       const svc = serviceList.find(s => s.id === updates.serviceId);
       if (svc && newFin[idx].estimatedAmount === 0) {
           updates.estimatedAmount = svc.basePrice;
       }
    }
    newFin[idx] = { ...newFin[idx], ...updates };
    setFinances(newFin);
  };

  const handleExportExcel = () => {
    if (!event || !summary) return;
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Event Info
    const infoData = [
       ['THÔNG TIN SỰ KIỆN'],
       ['Tên:', event.name],
       ['Đơn vị:', event.organizer],
       ['Địa điểm:', event.location],
       ['Ngày:', formatDate(event.startDate || '')],
       ['Trạng thái:', event.status]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(infoData), 'Info');

    // Sheet 2: Tasks
    const tasksData = [
       ['STT', 'Công việc', 'Nhân sự', 'Trạng thái', 'Ghi chú'],
       ...tasks.map((t, i) => [
          i+1, 
          t.task?.taskName || 'N/A', 
          t.staff?.fullName || 'N/A', 
          t.status, 
          t.note
       ])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tasksData), 'Tasks');

    // Sheet 3: Finance
    const finData = [
      ['STT', 'Dịch vụ', 'Dự toán', 'Phát sinh', 'Tổng', 'Ghi chú'],
      ...finances.map((f, i) => [
         i+1,
         f.service?.serviceName || 'Khác',
         f.estimatedAmount,
         f.extraAmount,
         f.estimatedAmount + f.extraAmount,
         `${f.estimatedNote || ''} ${f.extraNote || ''}`
      ]),
      ['', 'TỔNG', summary.estimatedTotal, summary.extraTotal, summary.grandTotal]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(finData), 'Budget');

    XLSX.writeFile(wb, `${event.name || 'Event'}-Export.xlsx`);
  };

  const handleExportStaff = () => {
    if (!event || tasks.length === 0) {
      toast.warning('Không có danh sách nhân sự để xuất');
      return;
    }
    
    const wb = XLSX.utils.book_new();
    const data = [
      [`DANH SÁCH NHÂN SỰ - ${event.name?.toUpperCase()}`],
      [`Đơn vị: ${event.organizer} | Ngày: ${formatDate(event.startDate || '')} | Địa điểm: ${event.location || ''}`],
      [],
      ['STT', 'Họ và tên', 'Loại nhân sự', 'Số điện thoại', 'Phòng ban/Đơn vị', 'Nhiệm vụ', 'Ghi chú'],
      ...tasks.map((t, i) => [
        i + 1,
        t.staff?.fullName || (t as any).tempStaffName || 'N/A',
        t.staff?.staffType || (t as any).tempStaffType || 'N/A',
        t.staff?.phone || '-',
        t.staff?.department || '-',
        t.task?.taskName || 'N/A',
        t.note || ''
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Thiết lập độ rộng cột
    ws['!cols'] = [
      { wch: 5 },  // STT
      { wch: 25 }, // Họ tên
      { wch: 20 }, // Loại
      { wch: 15 }, // SĐT
      { wch: 25 }, // Đơn vị
      { wch: 25 }, // Nhiệm vụ
      { wch: 30 }  // Ghi chú
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Nhân Sự');
    XLSX.writeFile(wb, `DS_NhanSu_${event.name?.replace(/\s+/g, '_')}.xlsx`);
    toast.success('Đã xuất danh sách nhân sự');
  };

  if (loading) {
     return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
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
             <Button variant="outline" onClick={handleExportExcel}>
                <Download className="mr-2 size-4" /> Xuất Excel
             </Button>
           )}
           <Button onClick={handleSaveInfo}>
              <Save className="mr-2 size-4" /> Lưu thông tin
           </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full justify-start">
           <TabsTrigger value="info">Thông tin chung</TabsTrigger>
           <TabsTrigger value="staff" disabled={isNew}>Nhân sự ({eventStaffList.length})</TabsTrigger>
           <TabsTrigger value="tasks" disabled={isNew}>Phân công ({tasks.length})</TabsTrigger>
           <TabsTrigger value="finances" disabled={isNew}>Tài chính & Dịch vụ</TabsTrigger>
           <TabsTrigger value="summary" disabled={isNew}>Tổng kết</TabsTrigger>
        </TabsList>

        {/* TAB: INFO */}
        <TabsContent value="info" className="space-y-4">
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
                      onChange={e => setEvent({...event, name: e.target.value})} 
                      placeholder="VD: Lễ Trao bằng Tốt nghiệp..." 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Đơn vị tổ chức *</Label>
                    <Input 
                      value={event.organizer} 
                      onChange={e => setEvent({...event, organizer: e.target.value})} 
                      placeholder="VD: Phòng Công tác Sinh viên" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Địa điểm</Label>
                    <Input 
                      value={event.location} 
                      onChange={e => setEvent({...event, location: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input 
                      type="date"
                      value={event.startDate ? event.startDate.split('T')[0] : ''} 
                      onChange={e => setEvent({...event, startDate: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hình thức</Label>
                    <Select 
                      value={event.format} 
                      onValueChange={(v:any) => setEvent({...event, format: v})}
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
                      onValueChange={(v: 'Planning' | 'Running' | 'Completed' | 'Canceled') => setEvent({...event, status: v})}
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
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteFile('scriptLink')}>
                              <Trash2 className="size-4" />
                           </Button>
                        </div>
                      ) : (
                        <Input type="file" onChange={(e) => e.target.files?.[0] && handleFileUpload('scriptLink', e.target.files[0])} />
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
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteFile('timelineLink')}>
                              <Trash2 className="size-4" />
                           </Button>
                        </div>
                      ) : (
                        <Input type="file" onChange={(e) => e.target.files?.[0] && handleFileUpload('timelineLink', e.target.files[0])} />
                      )}
                   </div>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* TAB: STAFF */}
        <TabsContent value="staff" className="space-y-4">
          <EventStaffTab
            eventId={id!}
            eventStaffList={eventStaffList}
            onRefresh={() => {
              if (id) {
                eventStaffAPI.getByEvent(id).then(setEventStaffList).catch(() => setEventStaffList([]));
              }
            }}
          />
        </TabsContent>

        {/* TAB: TASKS */}
        <TabsContent value="tasks" className="space-y-4">
           {/* Auto-Creation Dialogs will go here eventually or handled inline */}
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <CardTitle>Phân công nhân sự</CardTitle>
                   <CardDescription>Nhập trực tiếp Tên và Loại nhân sự, hệ thống sẽ tự động lưu mới.</CardDescription>
                </div>
                <div className="flex gap-2">
                   <Button onClick={handleExportStaff} variant="outline" size="sm">
                      <Download className="mr-2 size-4"/> Xuất danh sách
                   </Button>
                   <Button onClick={handleSaveAllTasks} variant="secondary" size="sm">
                      <Save className="mr-2 size-4"/> Lưu tất cả
                   </Button>
                   <Button onClick={handleAddTask} variant="default" size="sm">
                      <Plus className="mr-2 size-4"/> Thêm dòng
                   </Button>
                </div>
             </CardHeader>
             <CardContent>
                <div className="relative w-full overflow-auto">
                   <table className="w-full text-sm caption-bottom">
                      <thead className="[&_tr]:border-b">
                         <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12">#</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Công việc</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tên Nhân sự</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Loại Nhân sự</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ghi chú</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-20">Lưu/Xóa</th>
                         </tr>
                      </thead>
                      <tbody>
                         {tasks.map((task, idx) => (
                           <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle">{idx + 1}</td>
                              <td className="p-4 align-middle">
                                 <div className="flex items-center gap-2">
                                    <Select 
                                      value={task.taskId} 
                                      onValueChange={(v) => {
                                         if (v === 'custom') {
                                             const name = prompt("Nhập tên công việc mới:");
                                             if (name) {
                                                 taskTemplatesAPI.create({ taskName: name }).then(newT => {
                                                     setTemplateList(prev => [...prev, newT]);
                                                     updateLocalTask(idx, { taskId: newT.id });
                                                 });
                                             }
                                         } else {
                                             updateLocalTask(idx, { taskId: v });
                                         }
                                      }}
                                    >
                                      <SelectTrigger className="w-[180px] h-8">
                                        <SelectValue placeholder="Chọn việc..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="custom" className="text-blue-600 font-semibold">+ Thêm việc mới</SelectItem>
                                        {templateList.map(t => <SelectItem key={t.id} value={t.id}>{t.taskName}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                 </div>
                              </td>
                              <td className="p-4 align-middle">
                                 {/* Staff Name Input: Use existing staff name if linked, or temp name */}
                                 <Input 
                                   className="h-8 min-w-[150px]"
                                   placeholder="Họ và tên..."
                                   value={(task as any).tempStaffName ?? (task.staff?.fullName || '')}
                                   onChange={e => {
                                       // If user types here, we imply they might be creating a new staff
                                       // or editing. For simplicity: unlink staffId if text changes significantly?
                                       // Actually, let's keep it simple: Just store in temp field.
                                       // If we have a staffId but user changes name, we probably should create NEW staff 
                                       // or update existing? Updating existing is risky if shared.
                                       // Strategy: If user types, we clear staffId and rely on auto-create by name.
                                       const val = e.target.value;
                                       updateLocalTask(idx, { 
                                           staffId: undefined, // Clear ID to force create/search on save
                                           staff: undefined,
                                           ['tempStaffName' as any]: val // Store temp name
                                       } as any);
                                   }}
                                   // Also allow picking from list?
                                   // Maybe a datalist or Combobox would be better, but user asked for "Input"
                                   list={`staff-list-${idx}`}
                                 />
                                 <datalist id={`staff-list-${idx}`}>
                                     {staffList.map(s => <option key={s.id} value={s.fullName}>{s.staffType}</option>)}
                                 </datalist>
                              </td>
                              <td className="p-4 align-middle">
                                 <Select 
                                   value={(task as any).tempStaffType ?? (task.staff?.staffType || 'Tình nguyện viên')} 
                                   onValueChange={(v) => updateLocalTask(idx, { ['tempStaffType' as any]: v } as any)}
                                 >
                                   <SelectTrigger className="w-[140px] h-8">
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
                              <td className="p-4 align-middle">
                                 <Input 
                                   value={task.note || ''} 
                                   onChange={e => updateLocalTask(idx, { note: e.target.value })} 
                                   className="h-8"
                                 />
                              </td>
                              <td className="p-4 align-middle text-right">
                                 <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => handleSaveTaskRow(task)}>
                                       <Save className="size-4"/>
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDeleteTask(task.id)}>
                                       <Trash2 className="size-4"/>
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* TAB: FINANCES */}
        <TabsContent value="finances" className="space-y-4">
           {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Tổng Dự trù</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.estimatedTotal)}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Tổng Phát sinh</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">{formatCurrency(summary.extraTotal)}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Tổng Chi phí</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(summary.grandTotal)}</div></CardContent>
                  </Card>
              </div>
           )}

           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bảng Kê Chi phí & Dịch vụ</CardTitle>
                </div>
                <Button onClick={handleAddFinance} size="sm"><Plus className="mr-2 size-4"/> Thêm mục</Button>
             </CardHeader>
             <CardContent>
               <div className="relative w-full overflow-auto">
                   <table className="w-full text-sm caption-bottom">
                      <thead className="[&_tr]:border-b">
                         <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium w-12">#</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Dịch vụ (Nếu có)</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-right w-24">SL</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-right">Dự trù (VNĐ)</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-right">Phát sinh (VNĐ)</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Ghi chú</th>
                            <th className="h-12 px-4 text-right align-middle w-20">Lưu/Xóa</th>
                         </tr>
                      </thead>
                      <tbody>
                        {finances.map((f, idx) => {
                           // Helper to find current service price
                           const currentService = serviceList.find(s => s.id === f.serviceId);
                           const price = currentService?.basePrice || 0;
                           
                           return (
                           <tr key={f.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle">{idx+1}</td>
                              <td className="p-4 align-middle">
                                 <Select 
                                   value={f.serviceId} 
                                   onValueChange={(v) => {
                                      if (v === 'create_new') {
                                           const name = prompt("Nhập tên dịch vụ mới:");
                                           if (name) {
                                               const price = Number(prompt("Nhập đơn giá (VNĐ):") || '0');
                                               servicesAPI.create({ serviceName: name, basePrice: price }).then(newS => {
                                                   setServiceList(prev => [...prev, newS]);
                                                   updateLocalFinance(idx, { 
                                                       serviceId: newS.id, 
                                                       estimatedAmount: price * ((f as any).quantity || 1) 
                                                   });
                                               });
                                           }
                                      } else {
                                          const svc = serviceList.find(s => s.id === v);
                                          const newPrice = svc?.basePrice || 0;
                                          updateLocalFinance(idx, { 
                                              serviceId: v === 'other' ? undefined : v,
                                              estimatedAmount: newPrice * ((f as any).quantity || 1)
                                          });
                                      }
                                   }}
                                 >
                                   <SelectTrigger className="w-[180px] h-8">
                                     <SelectValue placeholder="Chọn dịch vụ..." />
                                   </SelectTrigger>
                                   <SelectContent>
                                      <SelectItem value="other">-- Không chọn --</SelectItem>
                                      <SelectItem value="create_new" className="text-blue-600 font-semibold">+ Thêm dịch vụ mới</SelectItem>
                                      {serviceList.map(s => <SelectItem key={s.id} value={s.id}>{s.serviceName} ({formatCurrency(s.basePrice)})</SelectItem>)}
                                   </SelectContent>
                                 </Select>
                              </td>
                              <td className="p-4 align-middle text-right">
                                 <Input 
                                    className="h-8 text-right w-20 ml-auto"
                                    type="number" 
                                    min={1}
                                    value={(f as any).quantity || 1} 
                                    onChange={e => {
                                        const qty = Number(e.target.value);
                                        updateLocalFinance(idx, { 
                                            ['quantity' as any]: qty,
                                            estimatedAmount: price * qty
                                        } as any);
                                    }} 
                                 />
                              </td>
                              <td className="p-4 align-middle text-right">
                                 <Input 
                                    className="h-8 text-right w-32 ml-auto"
                                    type="number" 
                                    value={f.estimatedAmount} 
                                    onChange={e => updateLocalFinance(idx, { estimatedAmount: Number(e.target.value) })} 
                                 />
                              </td>
                              <td className="p-4 align-middle text-right">
                                 <Input 
                                    className="h-8 text-right w-32 ml-auto"
                                    type="number" 
                                    value={f.extraAmount} 
                                    onChange={e => updateLocalFinance(idx, { extraAmount: Number(e.target.value) })} 
                                 />
                              </td>
                              <td className="p-4 align-middle">
                                 <Input 
                                    className="h-8"
                                    placeholder="Ghi chú..." 
                                    value={f.estimatedNote || f.extraNote || ''} 
                                    onChange={e => updateLocalFinance(idx, { estimatedNote: e.target.value })} 
                                 />
                              </td>
                              <td className="p-4 align-middle text-right">
                                 <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => handleSaveFinanceRow(f)}>
                                       <Save className="size-4"/>
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDeleteFinance(f.id)}>
                                       <Trash2 className="size-4"/>
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        )})}
                      </tbody>
                   </table>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* TAB: SUMMARY */}
        <TabsContent value="summary">
           <Card>
              <CardHeader>
                 <CardTitle>Tổng kết sự kiện</CardTitle>
                 <CardDescription>Bảng tổng hợp nhanh.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div>Tổ chức: <strong>{event.organizer}</strong></div>
                       <div>Trạng thái: <strong>{event.status}</strong></div>
                       <div>Dự trù: <strong className="text-blue-600">{summary ? formatCurrency(summary.estimatedTotal) : 0}</strong></div>
                       <div>Thực tế: <strong className="text-green-600">{summary ? formatCurrency(summary.grandTotal) : 0}</strong></div>
                    </div>
                    <Button className="w-full" variant="outline" onClick={handleExportExcel}>
                       <Download className="mr-2 size-4" /> Tải báo cáo đầy đủ (.xlsx)
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
