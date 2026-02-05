
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Event, FinanceSummary } from '@/types';

interface SummaryTabProps {
  event: Partial<Event>;
  summary: FinanceSummary | null;
  onExport: () => void;
}

export function SummaryTab({ event, summary, onExport }: SummaryTabProps) {
  return (
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
          <Button className="w-full" variant="outline" onClick={onExport}>
            <Download className="mr-2 size-4" /> Tải báo cáo đầy đủ (.xlsx)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
