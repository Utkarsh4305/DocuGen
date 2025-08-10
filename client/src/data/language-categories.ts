export interface LanguageFramework {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  maturity: 'High' | 'Medium' | 'Low';
  difficulty: 'Low' | 'Medium' | 'High';
  bidirectionalSupport: boolean;
  conversionRules?: string[];
}

export interface LanguageCategory {
  name: string;
  shortName?: string;
  description: string;
  icon: string;
  tags: string[];
  frameworks: LanguageFramework[];
}

export const languageCategories: Record<string, LanguageCategory> = {
  "frontend-web": {
    name: "Frontend Web Development",
    shortName: "Frontend Web",
    description: "Client-side web technologies for building interactive user interfaces and web applications",
    icon: "fas fa-desktop",
    tags: ["UI/UX", "Interactive", "Browser", "Responsive"],
    frameworks: [
      {
        id: "react",
        name: "React",
        description: "Component-based UI library for building interactive interfaces with virtual DOM and declarative programming",
        icon: "fab fa-react",
        tags: ["JSX", "Hooks", "Virtual DOM", "Component-based"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["jsx-to-tsx", "class-to-functional", "props-interface"]
      },
      {
        id: "typescript",
        name: "TypeScript",
        description: "Statically typed superset of JavaScript providing compile-time type checking and enhanced IDE support",
        icon: "fab fa-js-square",
        tags: ["Types", "Interfaces", "IntelliSense", "Compile-time"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["type-annotations", "interface-generation", "strict-mode"]
      },
      {
        id: "vue",
        name: "Vue.js",
        description: "Progressive framework for building user interfaces with template syntax and reactive data binding",
        icon: "fab fa-vuejs",
        tags: ["Templates", "Reactive", "Progressive", "Single File Components"],
        maturity: "High",
        difficulty: "Low",
        bidirectionalSupport: true
      },
      {
        id: "angular",
        name: "Angular",
        description: "Full-featured framework for building scalable web applications with TypeScript and dependency injection",
        icon: "fab fa-angular",
        tags: ["TypeScript", "Dependency Injection", "CLI", "Enterprise"],
        maturity: "High",
        difficulty: "High",
        bidirectionalSupport: true
      },
      {
        id: "svelte",
        name: "Svelte",
        description: "Compile-time framework that generates vanilla JavaScript with no virtual DOM overhead",
        icon: "fas fa-fire",
        tags: ["Compile-time", "No Virtual DOM", "Small Bundle", "Reactive"],
        maturity: "Medium",
        difficulty: "Medium",
        bidirectionalSupport: false
      }
    ]
  },

  "mobile-dev": {
    name: "Mobile Development",
    shortName: "Mobile Dev",
    description: "Frameworks and languages for building native and cross-platform mobile applications",
    icon: "fas fa-mobile-alt",
    tags: ["Native", "Cross-platform", "iOS", "Android"],
    frameworks: [
      {
        id: "react-native",
        name: "React Native",
        description: "Cross-platform mobile development using React paradigms with native performance",
        icon: "fab fa-react",
        tags: ["Cross-platform", "Native Bridge", "Hot Reload", "React"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["react-to-native", "web-api-to-native", "navigation-conversion"]
      },
      {
        id: "flutter",
        name: "Flutter",
        description: "Google's UI toolkit for building natively compiled applications with Dart language",
        icon: "fas fa-mobile-alt",
        tags: ["Dart", "Widgets", "Hot Reload", "Single Codebase"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["widget-conversion", "state-management", "dart-syntax"]
      },
      {
        id: "kotlin",
        name: "Kotlin (Jetpack Compose)",
        description: "Modern Android development with declarative UI toolkit and coroutines support",
        icon: "fab fa-android",
        tags: ["Android", "Jetpack Compose", "Coroutines", "Declarative UI"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["composable-conversion", "android-lifecycle", "kotlin-syntax"]
      },
      {
        id: "swiftui",
        name: "SwiftUI",
        description: "Apple's declarative framework for building user interfaces across all Apple platforms",
        icon: "fab fa-apple",
        tags: ["iOS", "Declarative", "Swift", "Apple Ecosystem"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["view-conversion", "state-binding", "swift-syntax"]
      },
      {
        id: "xamarin",
        name: "Xamarin",
        description: "Microsoft's cross-platform development using C# and .NET framework",
        icon: "fas fa-code",
        tags: ["C#", ".NET", "Cross-platform", "Microsoft"],
        maturity: "Medium",
        difficulty: "High",
        bidirectionalSupport: false
      }
    ]
  },

  "backend-api": {
    name: "Backend/API Development",
    shortName: "Backend API",
    description: "Server-side technologies for building APIs, microservices, and backend systems",
    icon: "fas fa-server",
    tags: ["APIs", "Microservices", "Databases", "Scalability"],
    frameworks: [
      {
        id: "nodejs",
        name: "Node.js",
        description: "JavaScript runtime for server-side development with extensive package ecosystem via npm",
        icon: "fab fa-node-js",
        tags: ["Express", "NPM", "Async", "Event-driven"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["express-to-fastapi", "async-await", "package-conversion"]
      },
      {
        id: "python",
        name: "Python",
        description: "High-level programming language with rich ecosystem for web APIs, data processing, and AI",
        icon: "fab fa-python",
        tags: ["FastAPI", "Django", "Flask", "Data Science"],
        maturity: "High",
        difficulty: "Low",
        bidirectionalSupport: true,
        conversionRules: ["fastapi-conversion", "async-python", "type-hints"]
      },
      {
        id: "go",
        name: "Go",
        description: "Fast, compiled language designed for building scalable microservices and system programming",
        icon: "fas fa-code",
        tags: ["Goroutines", "Gin", "Compiled", "Concurrent"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["goroutine-conversion", "interface-mapping", "error-handling"]
      },
      {
        id: "java-spring",
        name: "Java Spring Boot",
        description: "Enterprise-grade framework for building robust, scalable Java applications with dependency injection",
        icon: "fab fa-java",
        tags: ["Spring", "Enterprise", "JVM", "Dependency Injection"],
        maturity: "High",
        difficulty: "High",
        bidirectionalSupport: true
      },
      {
        id: "csharp-dotnet",
        name: "C# (.NET)",
        description: "Microsoft's framework for building modern web APIs and applications with strong typing",
        icon: "fas fa-code",
        tags: [".NET", "ASP.NET", "Entity Framework", "Microsoft"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: false
      },
      {
        id: "rust",
        name: "Rust",
        description: "Systems programming language focused on safety, speed, and concurrency without garbage collection",
        icon: "fas fa-cog",
        tags: ["Memory Safety", "Performance", "Concurrency", "Systems"],
        maturity: "Medium",
        difficulty: "High",
        bidirectionalSupport: false
      }
    ]
  },

  "database": {
    name: "Database Technologies",
    shortName: "Database",
    description: "Data storage and management systems including SQL, NoSQL, and specialized databases",
    icon: "fas fa-database",
    tags: ["SQL", "NoSQL", "Data Management", "Persistence"],
    frameworks: [
      {
        id: "postgresql",
        name: "PostgreSQL",
        description: "Advanced open-source relational database with extensive features and JSON support",
        icon: "fas fa-database",
        tags: ["SQL", "ACID", "JSON", "Extensions"],
        maturity: "High",
        difficulty: "Medium",
        bidirectionalSupport: true,
        conversionRules: ["sql-to-nosql", "schema-migration", "query-conversion"]
      },
      {
        id: "mongodb",
        name: "MongoDB",
        description: "Document-oriented NoSQL database with flexible schema and horizontal scaling capabilities",
        icon: "fas fa-leaf",
        tags: ["NoSQL", "Document", "Flexible Schema", "Scalable"],
        maturity: "High",
        difficulty: "Low",
        bidirectionalSupport: true,
        conversionRules: ["document-to-table", "aggregation-to-sql", "schema-design"]
      },
      {
        id: "redis",
        name: "Redis",
        description: "In-memory data structure store used as database, cache, and message broker",
        icon: "fas fa-memory",
        tags: ["In-memory", "Cache", "Pub/Sub", "Data Structures"],
        maturity: "High",
        difficulty: "Low",
        bidirectionalSupport: false
      },
      {
        id: "sqlite",
        name: "SQLite",
        description: "Lightweight, serverless SQL database engine embedded in applications",
        icon: "fas fa-database",
        tags: ["Embedded", "Serverless", "Lightweight", "SQL"],
        maturity: "High",
        difficulty: "Low",
        bidirectionalSupport: true
      },
      {
        id: "elasticsearch",
        name: "Elasticsearch",
        description: "Distributed search and analytics engine built on Apache Lucene for full-text search",
        icon: "fas fa-search",
        tags: ["Search", "Analytics", "Distributed", "Full-text"],
        maturity: "High",
        difficulty: "High",
        bidirectionalSupport: false
      }
    ]
  }
};
