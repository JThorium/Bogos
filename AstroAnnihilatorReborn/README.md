# Astro Annihilator Reborn

A React-based space shooter game built with Three.js and React Three Fiber.

## Quick Start

### Windows - Method 1 (Recommended)
Double-click `start-game-simple.bat` or run:
```cmd
start-game-simple.bat
```

### Windows - Method 2 (PowerShell)
Right-click `start-game.ps1` and select "Run with PowerShell" or run:
```powershell
.\start-game.ps1
```

### Windows - Method 3 (Detailed)
Double-click `start-game.bat` for detailed output and error checking.

### Mac/Linux
Run in terminal:
```bash
chmod +x start-game.sh
./start-game.sh
```

### Manual Start
1. Open terminal/command prompt
2. Navigate to this directory: `cd path/to/AstroAnnihilatorReborn`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Open browser to `http://localhost:3000`

## Troubleshooting

### If the batch file doesn't work:
1. Try the PowerShell script (`start-game.ps1`) instead
2. Or use the simple batch file (`start-game-simple.bat`)
3. Make sure Node.js is installed: `node --version`
4. Make sure npm is installed: `npm --version`

### If you get permission errors:
- Right-click the PowerShell script and select "Run as Administrator"
- Or run PowerShell as Administrator and execute the script

### If the server doesn't start:
- Check if port 3000 is already in use
- Try a different port by editing `vite.config.js`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Game Controls

- Use mouse to aim
- Click to shoot
- Move mouse to control ship movement

## Development

The game is built with:
- React 18
- Vite
- Three.js
- React Three Fiber
- Tailwind CSS 