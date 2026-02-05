import { useEffect, useState } from 'react';
import { servicesAPI } from '@/api/services';
import type { Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
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

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    basePrice: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const getColorClass = (name: string) => {
    const colors = [
      'bg-teal-50 text-teal-600',
      'bg-emerald-50 text-emerald-600',
      'bg-pink-50 text-pink-600',
      'bg-amber-50 text-amber-600',
      'bg-rose-50 text-rose-600',
      'bg-cyan-50 text-cyan-600',
    ];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  const filteredServices = services.filter(s => 
    s.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAll();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services', error);
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({ serviceName: '', basePrice: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({ 
      serviceName: service.serviceName, 
      basePrice: service.basePrice 
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.serviceName) {
        toast.error('Vui lòng nhập tên dịch vụ');
        return;
      }

      if (editingService) {
        // Update
        await servicesAPI.update(editingService.id, formData);
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        // Create
        await servicesAPI.create(formData);
        toast.success('Thêm dịch vụ thành công');
      }
      
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error('Lỗi khi lưu dịch vụ');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await servicesAPI.delete(id);
      toast.success('Đã xóa dịch vụ');
      fetchServices();
    } catch (error) {
      toast.error('Lỗi khi xóa dịch vụ');
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <h1 className="text-3xl font-bold tracking-tight text-primary">
             Quản lý Dịch vụ
           </h1>
           <p className="text-muted-foreground mt-1">Thiết lập đơn giá và các gói dịch vụ tổ chức sự kiện</p>
         </div>
         <Button onClick={handleOpenAdd}>
           <Plus className="mr-2 h-4 w-4" /> Thêm Dịch vụ mới
         </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
               placeholder="Tìm kiếm dịch vụ..." 
               className="pl-10" 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredServices.map((service) => (
            <Card key={service.id} className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-gray-200 overflow-hidden">
               <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                     <div className={`p-3 rounded-xl ${getColorClass(service.serviceName)}`}>
                        <Package className="h-6 w-6" />
                     </div>
                  </div>
                  <CardTitle className="mt-4 text-xl font-bold text-gray-800">
                     {service.serviceName}
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="flex items-baseline gap-1">
                     <span className="text-2xl font-extrabold text-gray-900">{formatCurrency(service.basePrice)}</span>
                  </div>
                  
                  <div className="mt-6 flex gap-2 pt-4 border-t border-gray-100">
                     <Button variant="outline" className="flex-1" onClick={() => handleOpenEdit(service)}>
                        <Edit2 className="h-4 w-4 mr-2" /> Sửa
                     </Button>
                     
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="hover:bg-red-50 text-gray-400 hover:text-red-600">
                            <Trash2 className="h-5 w-5" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                           <AlertDialogDescription>
                             Bạn có chắc chắn muốn xóa dịch vụ "{service.serviceName}" không?
                             Hành động này không thể hoàn tác.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Hủy</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-red-600">
                             Xóa
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                  </div>
               </CardContent>
            </Card>
         ))}

         {filteredServices.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
               <div className="bg-gray-50 p-4 rounded-full mb-4">
                 <Package className="h-8 w-8 text-gray-400" />
               </div>
               <p className="text-lg font-medium">Chưa có dịch vụ nào phù hợp</p>
               <p className="text-sm mt-1">Thử tìm kiếm từ khóa khác hoặc thêm dịch vụ mới</p>
            </div>
         )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Cập nhật Dịch vụ' : 'Thêm Dịch vụ mới'}</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết cho dịch vụ.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên *
              </Label>
              <Input
                id="name"
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                className="col-span-3"
                placeholder="VD: Thuê hội trường"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Đơn giá *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
