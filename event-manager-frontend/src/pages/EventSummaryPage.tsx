import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/api/events';
import { eventTasksAPI } from '@/api/eventTasks';
import { eventFinancesAPI } from '@/api/eventFinances';
import type { Event, EventTask, EventFinance, FinanceSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { exportEventToExcel } from '@/lib/excelExport';

export function EventSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [finances, setFinances] = useState<EventFinance[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const eventData = await eventsAPI.getById(id);
        setEvent(eventData);

        try {
          const tasksData = await eventTasksAPI.getByEvent(id);
          setTasks(tasksData);
        } catch {
          setTasks([]);
        }

        try {
          const financesData = await eventFinancesAPI.getByEvent(id);
          setFinances(financesData);
        } catch {
          setFinances([]);
        }

        try {
          const summaryData = await eventFinancesAPI.getSummary(id);
          setSummary(summaryData);
        } catch {
          setSummary({
            eventId: id,
            estimatedTotal: 0,
            extraTotal: 0,
            grandTotal: 0,
            itemCount: 0,
            items: [],
          });
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!event || !summary) return;
    // Map finances from summary items to match EventFinance type if possible, 
    // but exportEventToExcel accepts the data we have.
    // Note: summary.items slightly differs from EventFinance but the utility 
    // uses properties that exist on both for the export.
    exportEventToExcel(event, tasks, finances, summary);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sự kiện</h2>
        <Button onClick={() => navigate('/events')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Get unique staff
  const uniqueStaff = Array.from(
    new Map(tasks.map(t => t.staff).filter(Boolean).map(s => [s!.id, s])).values()
  );

  // Get services used
  const usedServices = finances.map(f => f.service).filter(Boolean);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - Hide on print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/events/${id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Tổng kết sự kiện</h2>
            <p className="text-gray-500 mt-1">{event.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            In báo cáo
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">BÁO CÁO TỔNG KẾT SỰ KIỆN</h1>
        <p className="text-lg mt-2">{event.name}</p>
      </div>

      {/* I. Thông tin sự kiện */}
      <Card>
        <CardHeader>
          <CardTitle>I. THÔNG TIN SỰ KIỆN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tên sự kiện</p>
              <p className="font-medium">{event.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đơn vị tổ chức</p>
              <p className="font-medium">{event.organizer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Địa điểm</p>
              <p className="font-medium">{event.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hình thức</p>
              <p className="font-medium capitalize">{event.format}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày bắt đầu</p>
              <p className="font-medium">{formatDate(event.startDate)}</p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* II. Dịch vụ sử dụng */}
      <Card>
        <CardHeader>
          <CardTitle>II. DỊCH VỤ SỬ DỤNG</CardTitle>
        </CardHeader>
        <CardContent>
          {usedServices.length === 0 ? (
            <p className="text-gray-500">Chưa có dịch vụ nào</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {usedServices.map((service, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="font-medium">{service!.serviceName}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* III. Nhân sự tham gia */}
      <Card>
        <CardHeader>
          <CardTitle>III. NHÂN SỰ THAM GIA ({uniqueStaff.length} người)</CardTitle>
        </CardHeader>
        <CardContent>
          {uniqueStaff.length === 0 ? (
            <p className="text-gray-500">Chưa có nhân sự nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số công việc</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {uniqueStaff.map((staff, index) => (
                    <tr key={staff!.id}>
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2 font-medium">{staff!.fullName}</td>
                      <td className="px-4 py-2">{staff!.staffType}</td>
                      <td className="px-4 py-2">{staff!.department || '-'}</td>
                      <td className="px-4 py-2">
                        {tasks.filter(t => t.staff?.id === staff!.id).length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IV. Phân công công việc */}
      <Card>
        <CardHeader>
          <CardTitle>IV. PHÂN CÔNG CÔNG VIỆC ({tasks.length} công việc)</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-gray-500">Chưa có phân công nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Công việc</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nhân sự</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks.map((task, index) => (
                    <tr key={task.id}>
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{task.task?.taskName || 'N/A'}</td>
                      <td className="px-4 py-2">{task.staff?.fullName || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{task.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* V. Tổng hợp kinh phí */}
      <Card>
        <CardHeader>
          <CardTitle>V. TỔNG HỢP KINH PHÍ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng dự toán</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summary.estimatedTotal)}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng phát sinh</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(summary.extraTotal)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng cộng</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.grandTotal)}
                  </p>
                </div>
              </div>
            )}

            {/* Detail table */}
            {finances.length === 0 ? (
              <p className="text-gray-500">Chưa có khoản chi nào</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Dự toán</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Phát sinh</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tổng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {finances.map((finance, index) => (
                      <tr key={finance.id}>
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{finance.service?.serviceName || finance.serviceName || 'Khác'}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(finance.estimatedAmount)}</td>
                        <td className="px-4 py-2 text-right text-orange-600">
                          {formatCurrency(finance.extraAmount)}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(finance.estimatedAmount + finance.extraAmount)}
                        </td>
                      </tr>
                    ))}
                    {summary && (
                      <tr className="bg-gray-50 font-bold">
                        <td colSpan={2} className="px-4 py-2">TỔNG CỘNG</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(summary.estimatedTotal)}</td>
                        <td className="px-4 py-2 text-right text-orange-600">
                          {formatCurrency(summary.extraTotal)}
                        </td>
                        <td className="px-4 py-2 text-right text-green-600">
                          {formatCurrency(summary.grandTotal)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
