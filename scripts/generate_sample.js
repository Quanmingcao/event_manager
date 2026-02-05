const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();
const data = [
    ['Họ và tên', 'Loại nhân sự', 'Nhiệm vụ', 'Ghi chú'],
    ['Nguyễn Thành Trung', 'Cán bộ', 'Điều phối sự kiện', 'Chịu trách nhiệm chính'],
    ['Lê Thị Mai', 'Sinh viên', 'Lễ tân', 'Tiếp đón đại biểu'],
    ['Trần Văn Minh', 'Tình nguyện viên', 'Hậu cần', 'Sắp xếp bàn ghế'],
    ['Phạm Hồng Phúc', 'Sinh viên', 'MC', 'Chương trình khai mạc'],
    ['Hoàng Anh Tuấn', 'CTV', 'Kỹ thuật', 'Âm thanh ánh sáng'],
    ['Đỗ Kim Chi', 'Sinh viên', 'Hỗ trợ', ''],
];

const ws = XLSX.utils.aoa_to_sheet(data);
ws['!cols'] = [
    { wch: 25 }, // Họ tên
    { wch: 20 }, // Loại
    { wch: 25 }, // Nhiệm vụ
    { wch: 30 }  // Ghi chú
];

XLSX.utils.book_append_sheet(wb, ws, 'Sample_Data');
const filePath = path.join(process.cwd(), 'Mau_Nhap_Nhan_Su_Test.xlsx');
XLSX.writeFile(wb, filePath);

console.log('Successfully created sample file at:', filePath);
