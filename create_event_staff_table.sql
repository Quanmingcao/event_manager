-- Tạo bảng event_staff cho việc quản lý nhân sự sự kiện
-- Bảng này cho phép import từ Excel và lưu công việc phân công trực tiếp

CREATE TABLE IF NOT EXISTS public.event_staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  full_name text NOT NULL,
  phone text,
  department text,
  staff_type text,
  assigned_task text,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT event_staff_pkey PRIMARY KEY (id),
  CONSTRAINT event_staff_event_id_fkey FOREIGN KEY (event_id) 
    REFERENCES public.events(id) ON DELETE CASCADE
);

-- Tạo index để tăng tốc query
CREATE INDEX IF NOT EXISTS idx_event_staff_event_id ON public.event_staff(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_full_name ON public.event_staff(full_name);

-- Comment mô tả bảng
COMMENT ON TABLE public.event_staff IS 'Danh sách nhân sự tham gia từng sự kiện, hỗ trợ import từ Excel';
COMMENT ON COLUMN public.event_staff.assigned_task IS 'Công việc được phân công (text tự do)';
