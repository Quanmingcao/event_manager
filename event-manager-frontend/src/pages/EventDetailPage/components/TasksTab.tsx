
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Plus, Save, Trash2 } from 'lucide-react';
import type { EventTask, TaskTemplate, Staff } from '@/types';

interface TasksTabProps {
  tasks: EventTask[];
  templateList: TaskTemplate[];
  staffList: Staff[];
  onAdd: () => void;
  onSave: (task: EventTask) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (idx: number, updates: Partial<EventTask>) => void;
  onSaveAll: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onDownloadTemplate: () => void;
  onCreateTemplate: (name: string) => Promise<TaskTemplate>;
}

export function TasksTab({
  tasks,
  templateList,
  staffList,
  onAdd,
  onSave,
  onDelete,
  onUpdate,
  onSaveAll,
  onExport,
  onImport,
  onDownloadTemplate,
  onCreateTemplate,
}: TasksTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
         <div className="flex-1">
            <CardTitle>Phân công nhân sự</CardTitle>
            <CardDescription>Nhập trực tiếp Tên và Loại nhân sự, hệ thống sẽ tự động lưu mới.</CardDescription>
         </div>
         <div className="flex gap-2 shrink-0">
            <Button onClick={onDownloadTemplate} variant="ghost" size="sm" className="text-blue-600">
               <Download className="mr-2 size-4"/> Tải file mẫu
            </Button>
            
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Plus className="mr-2 size-4"/> Nhập Excel
                </span>
              </Button>
              <input 
                 type="file" 
                 className="hidden" 
                 accept=".xlsx,.xls" 
                 onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImport(file);
                    e.target.value = ''; // Reset
                 }}
              />
            </label>

            <Button onClick={onExport} variant="outline" size="sm">
               <Download className="mr-2 size-4"/> Xuất danh sách
            </Button>
            <Button onClick={onSaveAll} variant="secondary" size="sm">
               <Save className="mr-2 size-4"/> Lưu tất cả
            </Button>
            <Button onClick={onAdd} variant="default" size="sm">
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
                               onValueChange={async (v) => {
                                  if (v === 'custom') {
                                      const name = prompt("Nhập tên công việc mới:");
                                      if (name) {
                                          const newT = await onCreateTemplate(name);
                                          onUpdate(idx, { taskId: newT.id });
                                      }
                                  } else {
                                      onUpdate(idx, { taskId: v });
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
                                // If user types, we clear staffId and rely on auto-create by name on save
                                const val = e.target.value;
                                onUpdate(idx, { 
                                    staffId: undefined, // Clear ID to force create/search on save
                                    staff: undefined,
                                    ['tempStaffName' as any]: val // Store temp name
                                } as any);
                            }}
                            list={`staff-list-${idx}`}
                          />
                          <datalist id={`staff-list-${idx}`}>
                              {staffList.map(s => <option key={s.id} value={s.fullName}>{s.staffType}</option>)}
                          </datalist>
                       </td>
                       <td className="p-4 align-middle">
                          <Select 
                            value={(task as any).tempStaffType ?? (task.staff?.staffType || 'Tình nguyện viên')} 
                            onValueChange={(v) => onUpdate(idx, { ['tempStaffType' as any]: v } as any)}
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
                            onChange={e => onUpdate(idx, { note: e.target.value })} 
                            className="h-8"
                          />
                       </td>
                       <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-1">
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => onSave(task)}>
                                <Save className="size-4"/>
                             </Button>
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => onDelete(task.id)}>
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
  );
}
