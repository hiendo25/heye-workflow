// Config chạy local trên Windows.
//
// vite.config.ts mặc định nạp mcpPlugin của Lovable, plugin đó so sánh đường
// dẫn kiểu POSIX với đường dẫn Windows nên báo lỗi
// 'routesDir "src/routes" must resolve under ...' rồi chết ngay khi khởi động.
// Plugin ấy chỉ phục vụ môi trường Lovable, app không cần tới, nên bản local
// bỏ nó ra. KHÔNG sửa vite.config.ts để không ảnh hưởng lúc deploy.
//
//   npx vite dev --config vite.config.local.ts --port 5199
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
