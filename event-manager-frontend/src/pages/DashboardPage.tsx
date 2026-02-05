import { useEffect, useState, useMemo } from 'react';
import { eventsAPI } from '@/api/events';
import type { Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, TrendingUp, DollarSign, Search } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { vi } from 'date-fns/locale';
import { isSameDay } from 'date-fns';

export function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await eventsAPI.getAll();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter recent events based on search query
  const filteredRecentEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    }).slice(0, 5);
  }, [events, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    totalEvents: events.length,
    planning: events.filter(e => e.status === 'Planning').length,
    ongoing: events.filter(e => e.status === 'Running').length,
    completed: events.filter(e => e.status === 'Completed').length,
  };

  const statusData = [
    { name: 'Đang lên kế hoạch', value: stats.planning, color: '#14B8A6' },
    { name: 'Đang diễn ra', value: stats.ongoing, color: '#f59e0b' },
    { name: 'Hoàn thành', value: stats.completed, color: '#10b981' },
  ].filter(item => item.value > 0); // Chỉ hiển thị các trạng thái có sự kiện



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tổng quan</h2>
        <p className="text-gray-500 mt-1">Thống kê và báo cáo tổng hợp</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng số sự kiện
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.planning} đang lên kế hoạch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đang diễn ra
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.ongoing}</div>
            <p className="text-xs text-gray-500 mt-1">
              Đang trong quá trình thực hiện
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hoàn thành
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">
              Sự kiện đã hoàn tất
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Charts & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
             <CardTitle>Lịch sự kiện</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col md:flex-row gap-6">
             <div className="md:border-r border-gray-100 md:pr-6">
                <div style={{
                  width: '280px',
                }}>
                  <style>{`
                    .calendar-fix table {
                      table-layout: fixed !important;
                      width: 100% !important;
                    }
                    .calendar-fix thead tr,
                    .calendar-fix tbody tr {
                      display: table-row !important;
                    }
                    .calendar-fix th,
                    .calendar-fix td {
                      display: table-cell !important;
                      width: 14.28% !important;
                      text-align: center !important;
                    }
                  `}</style>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={vi}
                    className="rounded-md border shadow-sm calendar-fix"
                    modifiers={{
                      hasEvent: (date) => events.some(e => isSameDay(new Date(e.startDate), date))
                    }}
                    modifiersStyles={{
                      hasEvent: {
                           fontWeight: 'bold',
                           color: '#2563eb',
                           textDecoration: 'underline'
                      }
                    }}
                  />
                </div>
             </div>
             <div className="flex-1">
                 <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">
                    {selectedDate ? `Ngày ${selectedDate.toLocaleDateString('vi-VN')}` : 'Chọn ngày'}
                 </h4>
                 <div className="space-y-3 h-[280px] overflow-y-auto pr-2">
                   {events.filter(e => selectedDate && isSameDay(new Date(e.startDate), selectedDate)).map(event => (
                      <div key={event.id} className="p-3 border rounded-lg bg-gray-50 hover:bg-teal-50 transition-colors group cursor-pointer">
                          <div className="font-medium text-teal-900 group-hover:text-teal-700">{event.name}</div>
                          <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                             <span>📍 {event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                event.status === 'Planning' ? 'bg-teal-200 text-teal-800' :
                                event.status === 'Running' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'
                             }`}>
                                {event.status}
                             </span>
                          </div>
                      </div>
                   ))}
                   {selectedDate && events.filter(e => isSameDay(new Date(e.startDate), selectedDate)).length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-gray-400 text-sm mb-2">Chưa có sự kiện nào</p>
                        <p className="text-xs text-gray-300">Chọn ngày có dấu chấm xanh để xem sự kiện</p>
                      </div>
                   )}
                 </div>
             </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Trạng thái sự kiện</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: '#374151' }}>{entry.payload.name}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <p className="text-sm">Chưa có dữ liệu sự kiện</p>
                  <p className="text-xs mt-1">Hãy tạo sự kiện đầu tiên</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sự kiện gần đây</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-500">{event.organizer}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {event.location} • 📅 {new Date(event.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === 'Planning'
                        ? 'bg-teal-100 text-teal-800'
                        : event.status === 'Running'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {event.status === 'Planning' ? 'Lên kế hoạch' :
                     event.status === 'Running' ? 'Đang diễn ra' : 'Hoàn thành'}
                  </span>
                </div>
              </div>
            ))}
            {filteredRecentEvents.length === 0 && events.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy sự kiện nào với từ khóa "{searchQuery}"
              </div>
            )}
            {events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Chưa có sự kiện nào
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
