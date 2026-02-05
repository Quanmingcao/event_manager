# Connection Strings Guide

## Tại Công Ty (Firewall Chặn Port 5432)

Sử dụng **Session Pooler** (hiện tại trong `appsettings.json`):

```json
"DefaultConnection": "Host=aws-1-ap-south-1.pooler.supabase.com;Database=postgres;Username=postgres.wcibemurarpwsjsachwl;Password=jybafhfnueiojiovojijoisjiovojiwjiooif;Port=5432;Pooling=true;Minimum Pool Size=1;Maximum Pool Size=10;Connection Lifetime=300"
```

## Tại Nhà (Không Bị Chặn)

Sử dụng **Transaction Pooler** (nhanh hơn, có trong `appsettings.BACKUP.json`):

```json
"DefaultConnection": "Host=db.wcibemurarpwsjsachwl.supabase.co;Database=postgres;Username=postgres;Password=jybafhfnueiojiovojijoisjiovojiwjiooif;Port=5432"
```

## Cách Đổi Nhanh

### Về nhà (dùng Transaction Pooler - nhanh hơn):
```powershell
Copy-Item "appsettings.BACKUP.json" "appsettings.json" -Force
```

### Đi làm (dùng Session Pooler - bypass firewall):
Chỉnh thủ công hoặc giữ nguyên Session Pooler (vẫn hoạt động nhưng chậm hơn một chút)
