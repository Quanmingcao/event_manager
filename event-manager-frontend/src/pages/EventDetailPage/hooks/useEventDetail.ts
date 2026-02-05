
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/api/events';
import { eventTasksAPI } from '@/api/eventTasks';
import { eventFinancesAPI } from '@/api/eventFinances';
import { eventStaffAPI, type EventStaff } from '@/api/eventStaff';
import { staffAPI } from '@/api/staff';
import { servicesAPI } from '@/api/services';
import { taskTemplatesAPI } from '@/api/taskTemplates';

import type { Event, EventTask, EventFinance, FinanceSummary, Staff, Service, TaskTemplate } from '@/types';
import { toast } from 'sonner';
import { exportEventToExcel, exportStaffListToExcel, downloadStaffTemplate, readStaffFromExcel } from '@/lib/excelExport';

export function useEventDetail() {
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

    const handleDeleteEvent = async () => {
        if (!id || isNew) return;

        if (!window.confirm('CẢNH BÁO: BẠN SẮP XÓA SỰ KIỆN NÀY!\n\nToàn bộ dữ liệu liên quan (công việc, tài chính, nhân sự...) sẽ bị xóa vĩnh viễn.\nHành động này không thể hoàn tác.\n\nBạn có chắc chắn muốn tiếp tục?')) {
            return;
        }

        try {
            await eventsAPI.delete(id);
            toast.success('Đã xóa sự kiện');
            navigate('/events');
        } catch (error) {
            console.error('Delete event error:', error);
            toast.error('Lỗi khi xóa sự kiện');
        }
    };

    const handleAutoUpdateStatus = async () => {
        if (!id || isNew || !event.startDate) {
            toast.error('Không thể cập nhật trạng thái: thiếu thông tin ngày diễn ra');
            return;
        }

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset về đầu ngày

            const eventDate = new Date(event.startDate);
            eventDate.setHours(0, 0, 0, 0);

            let newStatus: 'Planning' | 'Running' | 'Completed';

            if (eventDate > today) {
                newStatus = 'Planning';
            } else if (eventDate.getTime() === today.getTime()) {
                newStatus = 'Running';
            } else {
                newStatus = 'Completed';
            }

            // Nếu trạng thái đã đúng rồi thì không cần update
            if (event.status === newStatus) {
                toast.info(`Trạng thái hiện tại đã chính xác: ${newStatus === 'Planning' ? 'Đang lên kế hoạch' :
                    newStatus === 'Running' ? 'Đang diễn ra' : 'Đã kết thúc'
                    }`);
                return;
            }

            const updatedEvent = await eventsAPI.update(id, { status: newStatus });
            setEvent(updatedEvent);

            toast.success(`Đã cập nhật trạng thái thành: ${newStatus === 'Planning' ? 'Đang lên kế hoạch' :
                newStatus === 'Running' ? 'Đang diễn ra' : 'Đã kết thúc'
                }`);
        } catch (error) {
            console.error('Auto update status error:', error);
            toast.error('Lỗi khi cập nhật trạng thái tự động');
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
        // confirm is handled by browser here, should be handled by UI ideally but alert is OK
        if (!window.confirm('Bạn có chắc muốn xóa file này không?')) return;
        try {
            setEvent(prev => ({ ...prev, [field]: null }));
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
            const newTask: EventTask = {
                id: `temp-${Date.now()}`,
                eventId: id,
                taskId: '', // Invalid initially
                staffId: '', // Invalid initially
                status: 'Pending',
                note: '',
            } as any;
            setTasks([...tasks, newTask]);
        } catch (error) { }
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
                const firstError = Object.values(errors)[0];
                toast.error(`Lỗi dữ liệu: ${firstError}`);
            } else {
                toast.error('Lỗi khi lưu phân công: ' + (e.response?.data?.Details || e.message));
            }
            throw e;
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
            quantity: 1,
        } as any;
        setFinances([...finances, newFin]);
    };

    const handleSaveFinanceRow = async (fin: EventFinance) => {
        try {
            const payload: any = {
                eventId: id!,
                serviceId: fin.serviceId || null,
                serviceName: fin.serviceName || null,
                estimatedAmount: Number(fin.estimatedAmount) || 0,
                extraAmount: Number(fin.extraAmount) || 0,
                estimatedNote: fin.estimatedNote || null,
                extraNote: fin.extraNote || null
            };

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
        exportEventToExcel(event, tasks, finances, summary);
    };

    const handleExportStaff = () => {
        exportStaffListToExcel(event, tasks);
        toast.success('Đã xuất danh sách nhân sự');
    };

    const handleImportStaff = async (file: File) => {
        try {
            const data = await readStaffFromExcel(file);
            const newTasks: EventTask[] = data.map((row: any, i: number) => {
                // Try to find Task ID from template list by name
                const taskName = row['Công việc'] || row['Nhiệm vụ'];
                const matchedTask = templateList.find(t => t.taskName.toLowerCase() === taskName?.toLowerCase());

                return {
                    id: `temp-import-${Date.now()}-${i}`,
                    eventId: id!,
                    taskId: matchedTask?.id || '', // Link if name matches exactly
                    staffId: '', // Will be handled by name on save
                    status: 'Pending',
                    note: row['Ghi chú'] || '',
                    tempStaffName: row['Họ và tên'] || row['Tên nhân sự'] || '',
                    tempStaffType: row['Loại nhân sự'] || 'Tình nguyện viên'
                } as any;
            });

            setTasks([...tasks, ...newTasks]);
            toast.success(`Đã nhập tạm thời ${newTasks.length} nhân sự. Nhấn "Lưu tất cả" để hoàn tất.`);
        } catch (error) {
            toast.error('Lỗi khi đọc file Excel');
        }
    };

    const handleDownloadTemplate = () => {
        downloadStaffTemplate();
    };

    const createTaskTemplate = async (name: string) => {
        const newT = await taskTemplatesAPI.create({ taskName: name });
        setTemplateList(prev => [...prev, newT]);
        return newT;
    };

    const createService = async (name: string, price: number) => {
        const newS = await servicesAPI.create({ serviceName: name, basePrice: price });
        setServiceList(prev => [...prev, newS]);
        return newS;
    };

    const refreshEventStaff = useCallback(() => {
        if (id) {
            eventStaffAPI.getByEvent(id).then(setEventStaffList).catch(() => setEventStaffList([]));
        }
    }, [id]);

    return {
        // State
        event,
        tasks,
        finances,
        summary,
        eventStaffList,
        staffList,
        serviceList,
        templateList,
        loading,
        isNew,
        // Methods
        setEvent, // Exposed for simple updates
        handleSaveInfo,
        handleDeleteEvent,
        handleAutoUpdateStatus,
        handleFileUpload,
        handleDeleteFile,
        handleAddTask,
        handleSaveTaskRow,
        handleSaveAllTasks,
        handleDeleteTask,
        updateLocalTask,
        handleAddFinance,
        handleSaveFinanceRow,
        handleDeleteFinance,
        updateLocalFinance,
        handleExportExcel,
        handleExportStaff,
        handleImportStaff,
        handleDownloadTemplate,
        createTaskTemplate,
        createService,
        refreshEventStaff,
        navigate
    };
}
