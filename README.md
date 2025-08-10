# Universal Code Transpiler

A comprehensive full-stack application that enables cross-framework code transpilation through AST analysis and Universal Intermediate Representation (UIR). The system exclusively accepts ZIP file uploads, automatically removes cache files for lightweight analysis, and performs bidirectional code conversion between popular frameworks.

## Features

- **ZIP-Only Upload System**: Upload project ZIP files (max 100MB)
- **Automatic Cache Removal**: Removes node_modules, .git, build folders, and cache files automatically
- **AST-Based Analysis**: Uses Abstract Syntax Tree parsing (not LLMs) for accurate code analysis
- **Universal Intermediate Representation**: Custom UIR format for cross-framework compatibility
- **Bidirectional Conversion**: Convert between React, TypeScript, Node.js, Python, Flutter, Kotlin, SwiftUI, and Go
- **Real-time Progress**: Live conversion tracking with detailed logs
- **Tech Stack Detection**: Automatic language detection with percentage distribution

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **File Processing**: yauzl for ZIP extraction + archiver for downloads

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5000`

4. Upload a ZIP file containing your project and select conversion options

## Supported Frameworks

### Frontend
- React (JavaScript/TypeScript)
- Flutter (Dart)
- SwiftUI (Swift)

### Backend
- Node.js (JavaScript/TypeScript)
- Python (FastAPI/Django)
- Go
- Kotlin

### Database
- PostgreSQL
- MySQL
- SQLite
- MongoDB

## How It Works

1. **Upload**: Drop a ZIP file containing your entire project
2. **Analysis**: System extracts files, removes cache/build folders, and analyzes the codebase
3. **Detection**: Identifies programming languages and frameworks with percentage distribution
4. **AST Parsing**: Converts source code into Abstract Syntax Trees
5. **UIR Generation**: Transforms ASTs into Universal Intermediate Representation
6. **Conversion**: Transpiles code to target framework using UIR as intermediary
7. **Download**: Get converted project as clean ZIP file

## Cache Files Removed

The system automatically filters out:
- `node_modules/`, `dist/`, `build/`, `out/`, `target/`
- `.git/`, `.svn/`, `.hg/`
- `.cache/`, `.tmp/`, `temp/`, `logs/`
- `package-lock.json`, `yarn.lock`, `*.pyc`
- IDE files (`.vscode/`, `.idea/`)
- Environment files (`.env*`)

This makes analysis much faster and lighter by focusing only on source code.

## Architecture

- **Service-Oriented Backend**: Modular services for language detection, AST parsing, UIR generation, and transpilation
- **Component-Based Frontend**: React components with shadcn/ui design system
- **Type-Safe Database**: Drizzle ORM with PostgreSQL for reliable data storage
- **Extensible Design**: Easy to add new framework support through plugin architecture

## Development

- Language detection: `server/services/language-detector.ts`
- AST parsing: `server/services/ast-parser.ts`
- UIR generation: `server/services/uir-generator.ts`
- Transpilation: `server/services/transpiler.ts`
- File handling: `server/utils/file-handler.ts`

## License

MIT License - see LICENSE file for details