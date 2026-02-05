import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Type, Palette, Moon, Accessibility, RotateCcw } from 'lucide-react';

export function SettingsPage() {
  const {
    settings,
    updateFontSize,
    updateColorTheme,
    toggleDarkMode,
    toggleAccessibilityMode,
    resetSettings,
  } = useSettings();

  const fontSizes = [
    { value: 'small' as const, label: 'Nhỏ', example: 'text-sm' },
    { value: 'medium' as const, label: 'Trung bình', example: 'text-base' },
    { value: 'large' as const, label: 'Lớn', example: 'text-lg' },
    { value: 'xlarge' as const, label: 'Rất lớn', example: 'text-xl' },
  ];

  const colorThemes = [
    { 
      value: 'teal' as const, 
      label: 'Teal + Coral', 
      primary: 'bg-teal-500', 
      accent: 'bg-coral-400',
      description: 'Ấm áp, thân thiện'
    },
    { 
      value: 'blue' as const, 
      label: 'Blue Classic', 
      primary: 'bg-blue-500', 
      accent: 'bg-indigo-400',
      description: 'Chuyên nghiệp, truyền thống'
    },
    { 
      value: 'highcontrast' as const, 
      label: 'Tương phản cao', 
      primary: 'bg-black', 
      accent: 'bg-yellow-400',
      description: 'Dễ đọc, rõ ràng'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Cài đặt</h2>
        <p className="text-gray-500 mt-1">Tùy chỉnh giao diện và khả năng truy cập</p>
      </div>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-teal-600" />
            <CardTitle>Cỡ chữ</CardTitle>
          </div>
          <CardDescription>
            Chọn kích thước chữ phù hợp với thị lực của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fontSizes.map((size) => (
              <Button
                key={size.value}
                variant={settings.fontSize === size.value ? 'default' : 'outline'}
                onClick={() => updateFontSize(size.value)}
                className="h-auto flex-col py-4"
              >
                <span className={size.example + ' font-semibold'}>{size.label}</span>
                <span className="text-xs mt-1 opacity-70">Aa</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Theme */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-teal-600" />
            <CardTitle>Tông màu</CardTitle>
          </div>
          <CardDescription>
            Chọn bảng màu phù hợp với sở thích của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colorThemes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => updateColorTheme(theme.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  settings.colorTheme === theme.value
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex gap-2 mb-3">
                  <div className={`w-8 h-8 rounded ${theme.primary}`}></div>
                  <div className={`w-8 h-8 rounded ${theme.accent}`}></div>
                </div>
                <div className="font-semibold text-gray-900">{theme.label}</div>
                <div className="text-sm text-gray-500 mt-1">{theme.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-teal-600" />
            <CardTitle>Hiển thị</CardTitle>
          </div>
          <CardDescription>
            Tùy chỉnh chế độ hiển thị
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-base font-medium">
                Chế độ tối
              </Label>
              <p className="text-sm text-gray-500">
                Giảm ánh sáng màn hình, dễ chịu hơn cho mắt
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-teal-600" />
            <CardTitle>Khả năng truy cập</CardTitle>
          </div>
          <CardDescription>
            Tùy chọn cho người dùng có nhu cầu đặc biệt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="accessibility-mode" className="text-base font-medium">
                Chế độ truy cập dễ dàng
              </Label>
              <p className="text-sm text-gray-500">
                Nút to hơn, khoảng cách rộng hơn, focus rõ ràng
              </p>
            </div>
            <Switch
              id="accessibility-mode"
              checked={settings.accessibilityMode}
              onCheckedChange={toggleAccessibilityMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Đặt lại cài đặt</h3>
              <p className="text-sm text-gray-500 mt-1">
                Khôi phục tất cả cài đặt về mặc định
              </p>
            </div>
            <Button variant="outline" onClick={resetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Đặt lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
