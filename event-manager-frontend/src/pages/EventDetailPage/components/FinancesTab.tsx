
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Save, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { EventFinance, FinanceSummary, Service } from '@/types';

interface FinancesTabProps {
  finances: EventFinance[];
  summary: FinanceSummary | null;
  serviceList: Service[];
  onAdd: () => void;
  onSave: (fin: EventFinance) => void;
  onDelete: (finId: string) => void;
  onUpdate: (idx: number, updates: Partial<EventFinance>) => void;
  onCreateService: (name: string, price: number) => Promise<Service>;
}

export function FinancesTab({
  finances,
  summary,
  serviceList,
  onAdd,
  onSave,
  onDelete,
  onUpdate,
  onCreateService
}: FinancesTabProps) {
  return (
    <div className="space-y-4">
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
            <Button onClick={onAdd} size="sm"><Plus className="mr-2 size-4"/> Thêm mục</Button>
         </CardHeader>
         <CardContent>
           <div className="relative w-full overflow-auto">
                <table className="w-full text-sm caption-bottom">
                   <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                         <th className="h-12 px-4 text-left align-middle font-medium w-12">#</th>
                         <th className="h-12 px-4 text-left align-middle font-medium w-[220px]">Dịch vụ / Tên mục</th>
                         <th className="h-12 px-4 text-left align-middle font-medium text-right w-16">SL</th>
                         <th className="h-12 px-4 text-left align-middle font-medium text-right w-28">Dự trù (VNĐ)</th>
                         <th className="h-12 px-4 text-left align-middle font-medium text-right w-28">Phát sinh (VNĐ)</th>
                         <th className="h-12 px-4 text-left align-middle font-medium">Ghi chú Dự trù</th>
                         <th className="h-12 px-4 text-left align-middle font-medium text-orange-600">Ghi chú Phát sinh</th>
                         <th className="h-12 px-4 text-right align-middle w-20">Lưu/Xóa</th>
                      </tr>
                   </thead>
                   <tbody>
                     {finances.map((f, idx) => {
                        const currentService = serviceList.find(s => s.id === f.serviceId);
                        const basePrice = currentService?.basePrice || 0;
                        
                        return (
                        <tr key={f.id} className="border-b transition-colors hover:bg-muted/50">
                           <td className="p-4 align-middle">{idx+1}</td>
                           <td className="p-4 align-middle">
                              <div className="flex flex-col gap-1">
                                 <Select 
                                   value={f.serviceId || 'custom'} 
                                   onValueChange={async (v) => {
                                      if (v === 'create_new') {
                                           const name = prompt("Nhập tên dịch vụ mới vào danh mục chung:");
                                           if (name) {
                                               const priceStr = prompt("Nhập đơn giá (VNĐ):");
                                               const price = Number(priceStr || '0');
                                               const newS = await onCreateService(name, price);
                                               onUpdate(idx, { 
                                                   serviceId: newS.id, 
                                                   serviceName: undefined,
                                                   estimatedAmount: price * ((f as any).quantity || 1) 
                                               });
                                           }
                                      } else if (v === 'custom') {
                                          onUpdate(idx, { 
                                              serviceId: null,
                                              serviceName: f.serviceName || 'Dịch vụ phát sinh'
                                          });
                                      } else {
                                          const svc = serviceList.find(s => s.id === v);
                                          const newPrice = svc?.basePrice || 0;
                                          onUpdate(idx, { 
                                              serviceId: v,
                                              serviceName: undefined,
                                              estimatedAmount: newPrice * ((f as any).quantity || 1)
                                          });
                                      }
                                   }}
                                 >
                                   <SelectTrigger className="h-8">
                                     <SelectValue placeholder="Chọn loại..." />
                                   </SelectTrigger>
                                   <SelectContent>
                                      <SelectItem value="custom">-- Mục tự nhập --</SelectItem>
                                      <SelectItem value="create_new" className="text-blue-600 font-semibold">+ Thêm vào danh mục chung</SelectItem>
                                      {serviceList.map(s => <SelectItem key={s.id} value={s.id}>{s.serviceName}</SelectItem>)}
                                   </SelectContent>
                                 </Select>
                                 
                                 {(!f.serviceId || f.serviceId === 'custom') && (
                                     <Input 
                                        className="h-8" 
                                        placeholder="Tên mục chi phí..." 
                                        value={f.serviceName || ''}
                                        onChange={e => onUpdate(idx, { serviceName: e.target.value })}
                                     />
                                 )}
                              </div>
                           </td>
                           <td className="p-4 align-middle text-right">
                              <Input 
                                 className="h-8 text-right px-1"
                                 type="number" 
                                 min={1}
                                 value={(f as any).quantity || 1} 
                                 onChange={e => {
                                     const qty = Number(e.target.value);
                                     onUpdate(idx, { 
                                         ['quantity' as any]: qty,
                                         estimatedAmount: basePrice ? basePrice * qty : f.estimatedAmount
                                     } as any);
                                 }} 
                              />
                           </td>
                           <td className="p-4 align-middle text-right">
                              <Input 
                                 className="h-8 text-right w-full"
                                 type="number" 
                                 value={f.estimatedAmount} 
                                 onChange={e => onUpdate(idx, { estimatedAmount: Number(e.target.value) })} 
                              />
                           </td>
                           <td className="p-4 align-middle text-right text-orange-600">
                              <Input 
                                 className="h-8 text-right w-full border-orange-200 focus-visible:ring-orange-500"
                                 type="number" 
                                 value={f.extraAmount} 
                                 onChange={e => onUpdate(idx, { extraAmount: Number(e.target.value) })} 
                              />
                           </td>
                           <td className="p-4 align-middle">
                              <Input 
                                 className="h-8"
                                 placeholder="Dự trù..." 
                                 value={f.estimatedNote || ''} 
                                 onChange={e => onUpdate(idx, { estimatedNote: e.target.value })} 
                              />
                           </td>
                           <td className="p-4 align-middle">
                              <Input 
                                 className="h-8 border-orange-100"
                                 placeholder="Phát sinh..." 
                                 value={f.extraNote || ''} 
                                 onChange={e => onUpdate(idx, { extraNote: e.target.value })} 
                              />
                           </td>
                           <td className="p-4 align-middle text-right">
                              <div className="flex justify-end gap-1">
                                 <Button size="icon" variant="ghost" className="size-8 text-blue-600" onClick={() => onSave(f)}>
                                    <Save className="size-4"/>
                                 </Button>
                                 <Button size="icon" variant="ghost" className="size-8 text-red-600" onClick={() => onDelete(f.id)}>
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
    </div>
  );
}
