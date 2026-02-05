import React from 'react';
import { useEvents } from '@/app/contexts/EventContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const { events } = useEvents();

  const stats = {
    totalEvents: events.length,
    plannedEvents: events.filter(e => e.status === 'planning').length,
    ongoingEvents: events.filter(e => e.status === 'ongoing').length,
    completedEvents: events.filter(e => e.status === 'completed').length,
    totalBudget: events.reduce((sum, e) => sum + e.budget.estimatedTotal, 0),
    totalStaff: events.reduce((sum, e) => sum + e.staff.length, 0),
  };

  const statusData = [
    { name: 'Đang lên kế hoạch', value: stats.plannedEvents, color: '#3b82f6' },
    { name: 'Đang diễn ra', value: stats.ongoingEvents, color: '#f59e0b' },
    { name: 'Hoàn thành', value: stats.completedEvents, color: '#10b981' },
  ];

  const budgetData = events.slice(0, 5).map(event => ({
    name: event.name.substring(0, 15) + '...',
    'Dự kiến': event.budget.estimatedTotal,
    'Thực tế': event.budget.actualTotal,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Tổng quan</h2>
        <p className="text-gray-500">Thống kê và báo cáo tổng hợp</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số sự kiện</CardTitle>
            <Calendar className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.plannedEvents} đang lên kế hoạch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sự kiện đang diễn ra</CardTitle>
            <TrendingUp className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.ongoingEvents}</div>
            <p className="text-xs text-gray-500 mt-1">
              Đang trong quá trình thực hiện
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng kinh phí</CardTitle>
            <DollarSign className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.totalBudget.toLocaleString('vi-VN')} VNĐ
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tổng dự toán ước tính
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân sự</CardTitle>
            <Users className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.totalStaff}</div>
            <p className="text-xs text-gray-500 mt-1">
              Tổng số nhân viên tham gia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái sự kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kinh phí sự kiện (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Dự kiến" fill="#3b82f6" />
                <Bar dataKey="Thực tế" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Sự kiện gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="text-sm text-gray-500">{event.organizer}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                    event.status === 'ongoing' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {event.status === 'planning' ? 'Lên kế hoạch' :
                     event.status === 'ongoing' ? 'Đang diễn ra' : 'Hoàn thành'}
                  </span>
                </div>
              </div>
            ))}
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
