# System Architecture

The Tally TDL Language Server is built using the `vscode-languageserver` node SDK. It follows a modular architecture to separate concerns between LSP communication, parsing, and language features.

## High-Level Components

### 1. Server Entry Point (`server.ts`)
The `server.ts` file is the entry point. It handling the LSP connection lifecycle:
- **Initialize**: Negotiates capabilities with the client (VS Code).
- **Documents**: Manages `TextDocuments` sync.
- **Handlers**: Registers providers for Completion, Hover, Definition, and Workspace Symbols.

### 2. Document Manager (`DocManager.ts`)
The `DocManager` class orchestrates the state of open documents.
- Maintains a mapping of Document URI -> `DocumentState` (SourceFile, wrapper).
- Triggers parsing and validation whenever a document changes (`onDidChangeContent`).
- Updates the central `SymbolTable` with definitions found in the document.

### 3. Parser Layer (`parser/`)
A custom recursive descent parser converts TDL source code into an AST (Abstract Syntax Tree).
- **Lexer**: Tokenizes input.
- **Parser**: Builds `DefinitionNode`, `AttributeNode`, etc.
- **Error Recovery**: Provides robust parsing even with syntax errors, inserting missing tokens to maintain AST structure.

### 4. Metadata Manager (`tdlMetaData.ts`)
Loads and caches standard TDL definitions (Reports, Forms, Functions) from JSON files.
- Used for validating against "Default TDL" to prevent duplicate errors.
- Used for providing completions for built-in types and attributes.

### 5. Services & Features
- **Validation (`services/validation.ts`)**: logic for diagnostics (syntax errors provided by parser, semantic errors like duplicates checked here).
- **Completion (`features/completion.ts`)**: Context-aware suggestions.
- **Symbol Table (`services/symbolTable.ts`)**: Tracks user-defined symbols across the workspace for Go-to-Definition.
