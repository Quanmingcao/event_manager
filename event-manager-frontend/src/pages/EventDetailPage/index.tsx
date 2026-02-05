
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventHeader } from './components/EventHeader';
import { InfoTab } from './components/InfoTab';
import { EventStaffTab } from '@/components/EventStaffTab';
import { TasksTab } from './components/TasksTab';

import { FinancesTab } from './components/FinancesTab';
import { SummaryTab } from './components/SummaryTab';
import { useEventDetail } from './hooks/useEventDetail';

export function EventDetailPage() {
  const {
      event, tasks, finances, summary, eventStaffList, staffList, serviceList, templateList,
      loading, isNew,
      setEvent,
      handleSaveInfo, handleFileUpload, handleDeleteFile, handleDeleteEvent, handleAutoUpdateStatus,
      handleAddTask, handleSaveTaskRow, handleSaveAllTasks, handleDeleteTask, updateLocalTask, 
      handleExportStaff, handleImportStaff, handleDownloadTemplate,
      createTaskTemplate,
      handleAddFinance, handleSaveFinanceRow, handleDeleteFinance, updateLocalFinance,
      handleExportExcel,
      createService, refreshEventStaff, navigate
  } = useEventDetail();

  if (loading) {
      return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6">
       <EventHeader 
          event={event} 
          isNew={isNew} 
          onSave={handleSaveInfo} 
          onExport={handleExportExcel}
          onDelete={handleDeleteEvent}
          onAutoUpdateStatus={handleAutoUpdateStatus}
          onBack={() => navigate('/events')}
       />

       <Tabs defaultValue="info" className="w-full">
         <TabsList className="w-full justify-start">
            <TabsTrigger value="info">Thông tin chung</TabsTrigger>
            <TabsTrigger value="tasks" disabled={isNew}>Phân công ({tasks.length})</TabsTrigger>
            <TabsTrigger value="staff" disabled={isNew}>Nhân sự ({eventStaffList.length})</TabsTrigger>
            <TabsTrigger value="finances" disabled={isNew}>Tài chính & Dịch vụ</TabsTrigger>
            <TabsTrigger value="summary" disabled={isNew}>Tổng kết</TabsTrigger>
         </TabsList>

         <TabsContent value="info" className="space-y-4">
            <InfoTab 
               event={event} 
               onChange={(updates) => setEvent(prev => ({ ...prev, ...updates }))}
               onFileUpload={handleFileUpload}
               onFileDelete={handleDeleteFile}
            />
         </TabsContent>

         <TabsContent value="tasks" className="space-y-4">
            <TasksTab 
                tasks={tasks}
                staffList={staffList}
                templateList={templateList}
                onAdd={handleAddTask}
                onSave={handleSaveTaskRow}
                onSaveAll={handleSaveAllTasks}
                onDelete={handleDeleteTask}
                onUpdate={updateLocalTask}
                onExport={handleExportStaff}
                onImport={handleImportStaff}
                onDownloadTemplate={handleDownloadTemplate}
                onCreateTemplate={createTaskTemplate}
            />
         </TabsContent>

         <TabsContent value="staff" className="space-y-4">
            <EventStaffTab
                eventId={event.id || ''}
                eventStaffList={eventStaffList}
                onRefresh={refreshEventStaff}
            />
         </TabsContent>



         <TabsContent value="finances" className="space-y-4">
             <FinancesTab
                 finances={finances}
                 summary={summary}
                 serviceList={serviceList}
                 onAdd={handleAddFinance}
                 onSave={handleSaveFinanceRow}
                 onDelete={handleDeleteFinance}
                 onUpdate={updateLocalFinance}
                 onCreateService={createService}
             />
         </TabsContent>

         <TabsContent value="summary">
             <SummaryTab
                 event={event}
                 summary={summary}
                 onExport={handleExportExcel}
             />
         </TabsContent>
       </Tabs>
    </div>
  );
}
