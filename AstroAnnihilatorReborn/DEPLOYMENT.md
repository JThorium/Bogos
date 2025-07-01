# 🚀 AstroAnnihilator Reborn - GitHub Pages Deployment

## Live Game URL
Once deployed, your game will be available at:
**`https://[your-username].github.io/[repo-name]/AstroAnnihilatorReborn/`**

## 📋 Setup Instructions

### 1. Push to GitHub
```bash
git add .
git commit -m "Add GitHub Pages deployment setup"
git push origin main
```

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The deployment will start automatically!

### 3. Automatic Deployment
- ✅ **Every push** to `main` or `master` branch triggers automatic deployment
- ✅ **Build time**: ~2-3 minutes
- ✅ **Live updates**: Changes appear within 5 minutes of pushing

## 🔧 Local Development

### Start Development Server
```bash
npm run dev
```
- Runs on `http://localhost:5173`
- Hot reload for instant updates

### Build for Production
```bash
npm run build
```
- Creates optimized build in `dist/` folder
- Ready for deployment

### Preview Production Build
```bash
npm run preview
```
- Test the production build locally

## 📁 Project Structure
```
AstroAnnihilatorReborn/
├── .github/workflows/deploy.yml  # GitHub Actions deployment
├── src/                          # Source code
├── dist/                         # Built files (auto-generated)
├── vite.config.js               # Build configuration
└── package.json                 # Dependencies & scripts
```

## 🎮 What's Next?

1. **Push to GitHub** to get your live game URL
2. **Share the URL** with others to test
3. **Make changes** and push to see them live automatically
4. **Continue development** with instant deployment pipeline

## 🔗 Benefits of This Setup

- **✅ Instant deployment** on every commit
- **✅ Free hosting** via GitHub Pages  
- **✅ Automatic builds** with error reporting
- **✅ Version history** and rollback capability
- **✅ Shareable URLs** for testing and feedback

**Ready to go live! 🚀**