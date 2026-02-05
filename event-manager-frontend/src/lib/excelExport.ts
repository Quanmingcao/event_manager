import * as XLSX from 'xlsx';
import { formatDate } from './utils';
import type { Event, EventTask, EventFinance, FinanceSummary } from '@/types';

export const exportEventToExcel = (
    event: Partial<Event>,
    tasks: EventTask[],
    finances: EventFinance[],
    summary: FinanceSummary | null
) => {
    if (!event || !summary) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Báo cáo Tài chính
    const reportData = [
        ['BÁO CÁO TÀI CHÍNH SỰ KIỆN'],
        [(event.name || '').toUpperCase()],
        [''],
        ['I. THÔNG TIN CHUNG'],
        ['Tên sự kiện:', event.name],
        ['Đơn vị tổ chức:', event.organizer],
        ['Địa điểm:', event.location],
        ['Ngày diễn ra:', formatDate(event.startDate || '')],
        ['Hình thức:', event.format],
        ['Trạng thái:', event.status],
        [''],
        ['II. CHI TIẾT KINH PHÍ'],
        ['STT', 'Dịch vụ / Hạng mục', 'Chi phí dự trù', 'Phát sinh', 'Tổng chi phí', 'Ghi chú'],
        ...finances.map((f, i) => [
            i + 1,
            f.service?.serviceName || f.serviceName || 'Dịch vụ phát sinh',
            f.estimatedAmount,
            f.extraAmount,
            f.estimatedAmount + f.extraAmount,
            `${f.estimatedNote || ''} ${f.extraNote || ''}`.trim()
        ]),
        [],
        ['', 'TỔNG CHI PHÍ SỰ KIỆN', summary.estimatedTotal, summary.extraTotal, summary.grandTotal]
    ];

    const wsFinance = XLSX.utils.aoa_to_sheet(reportData);

    // Cấu hình độ rộng cột
    wsFinance['!cols'] = [
        { wch: 5 },  // STT
        { wch: 35 }, // Dịch vụ
        { wch: 15 }, // Dự trù
        { wch: 15 }, // Phát sinh
        { wch: 15 }, // Tổng
        { wch: 40 }  // Ghi chú
    ];

    // Định dạng số (VNĐ) cho các cột tiền
    const range = XLSX.utils.decode_range(wsFinance['!ref'] || 'A1:A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
        // Chỉ định dạng từ dòng tiêu đề trở xuống (dòng 13 trong file excel, index 12)
        if (R >= 12) {
            for (let C = 2; C <= 4; ++C) { // Cột C, D, E (Chi phí, Phát sinh, Tổng)
                const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
                if (wsFinance[cellRef] && typeof wsFinance[cellRef].v === 'number') {
                    wsFinance[cellRef].z = '#,##0'; // Định dạng có dấu phẩy ngăn cách nghìn
                }
            }
        }
    }

    XLSX.utils.book_append_sheet(wb, wsFinance, 'Bao_Cao_Tai_Chinh');

    // Sheet 2: Danh sách Công việc
    const tasksData = [
        ['DANH SÁCH PHÂN CÔNG CÔNG VIỆC'],
        ['STT', 'Công việc', 'Nhân sự', 'Trạng thái', 'Ghi chú'],
        ...tasks.map((t, i) => [
            i + 1,
            t.task?.taskName || 'N/A',
            t.staff?.fullName || 'N/A',
            t.status,
            t.note
        ])
    ];
    const wsTasks = XLSX.utils.aoa_to_sheet(tasksData);
    wsTasks['!cols'] = [
        { wch: 5 },  // STT
        { wch: 30 }, // Công việc
        { wch: 20 }, // Nhân sự
        { wch: 15 }, // Trạng thái
        { wch: 40 }  // Ghi chú
    ];
    XLSX.utils.book_append_sheet(wb, wsTasks, 'Cong_Viec');

    XLSX.writeFile(wb, `${event.name || 'Event'}-Export.xlsx`);
};

export const exportStaffListToExcel = (
    event: Partial<Event>,
    tasks: EventTask[]
) => {
    if (!event || tasks.length === 0) return;

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
};

export const downloadStaffTemplate = () => {
    const wb = XLSX.utils.book_new();
    const data = [
        ['Họ và tên', 'Loại nhân sự', 'Nhiệm vụ', 'Ghi chú'],
        ['Nguyễn Văn A', 'Cán bộ', 'Điều phối chung', 'Trưởng đoàn'],
        ['Trần Thị B', 'Sinh viên', 'Hỗ trợ kỹ thuật', ''],
        ['Lê Văn C', 'Tình nguyện viên', 'Lễ tân', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
        { wch: 25 }, // Họ tên
        { wch: 20 }, // Loại
        { wch: 25 }, // Nhiệm vụ
        { wch: 30 }  // Ghi chú
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, 'Mau_Nhap_Nhan_Su.xlsx');
};

export const readStaffFromExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                resolve(jsonData);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};
