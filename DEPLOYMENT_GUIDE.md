# 🚀 Hướng dẫn Deploy - QL LHTTBB

## 📋 Chuẩn bị trước khi deploy

### 1. 🗄️ Thiết lập Supabase Database
1. Tạo project mới trên [Supabase](https://supabase.com)
2. Chạy script `database_setup.sql` trong SQL Editor
3. Lấy URL và API Key từ Settings > API

### 2. 🔐 Environment Variables
Tạo file `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌐 Deploy lên Vercel (Recommended)

### Bước 1: Chuẩn bị
```bash
npm install -g vercel
npm run build
```

### Bước 2: Deploy
```bash
vercel --prod
```

### Bước 3: Cấu hình Environment Variables
Trong Vercel Dashboard:
1. Vào Settings > Environment Variables
2. Thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🔧 Deploy lên Netlify

### Bước 1: Build
```bash
npm run build
```

### Bước 2: Deploy
1. Kéo thả folder `dist/` vào [Netlify Drop](https://app.netlify.com/drop)
2. Hoặc connect GitHub repository

### Bước 3: Cấu hình
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: Thêm Supabase credentials

## 🐳 Deploy với Docker

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build & Run
```bash
docker build -t ql-lhttbb .
docker run -p 80:80 ql-lhttbb
```

## ☁️ Deploy lên GitHub Pages

### Bước 1: Cài đặt gh-pages
```bash
npm install --save-dev gh-pages
```

### Bước 2: Thêm scripts vào package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Bước 3: Deploy
```bash
npm run deploy
```

## 🔒 Bảo mật Production

### 1. Environment Variables
- Không commit file `.env`
- Sử dụng environment variables cho production
- Rotate API keys định kỳ

### 2. Supabase Security
- Cấu hình Row Level Security (RLS)
- Thiết lập proper authentication
- Giới hạn API access

### 3. Domain & SSL
- Sử dụng custom domain
- Bật HTTPS/SSL
- Cấu hình CORS properly

## 📊 Monitoring & Analytics

### 1. Error Tracking
- Sentry integration
- Console error monitoring
- Performance tracking

### 2. Analytics
- Google Analytics
- User behavior tracking
- Performance metrics

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎯 Performance Optimization

### 1. Build Optimization
- Code splitting
- Tree shaking
- Bundle analysis

### 2. Runtime Optimization
- Lazy loading
- Image optimization
- Caching strategies

### 3. Database Optimization
- Query optimization
- Connection pooling
- Indexing

## 🐛 Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version (18+)
2. **Supabase connection**: Verify environment variables
3. **CORS errors**: Configure Supabase CORS settings
4. **404 on refresh**: Configure SPA routing

### Debug Commands:
```bash
npm run build -- --debug
npm run preview
vercel logs
```

## 📞 Support

- 📧 Email: support@example.com
- 📱 GitHub Issues: [Create Issue](https://github.com/username/ql-lhttbb/issues)
- 📖 Documentation: [Wiki](https://github.com/username/ql-lhttbb/wiki)

---

*Hướng dẫn này sẽ được cập nhật thường xuyên. Vui lòng check phiên bản mới nhất.*
