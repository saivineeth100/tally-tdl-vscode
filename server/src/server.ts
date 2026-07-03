import {
    createConnection,
    ProposedFeatures,
    TextDocuments
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { logger } from './logger';

// Create LSP connection
const connection = createConnection(ProposedFeatures.all);
logger.setConnection(connection);

const docs = new TextDocuments(TextDocument);

import { LspClientGateway } from './adapters/lspClientGateway';
import { LspDiagnosticPublisher } from './adapters/lspDiagnosticPublisher';
import { NodeScheduler } from './adapters/nodeScheduler';
import { NodeFileAccess } from './adapters/nodeFileAccess';

// Create ports
const clientGateway = new LspClientGateway(connection);
const diagnosticPublisher = new LspDiagnosticPublisher(connection);
const scheduler = new NodeScheduler();
const fileAccess = new NodeFileAccess();

import { ServerRuntimeDependencies } from './runtime/serverRuntime';
import { createServerRuntime } from './runtime/createServerRuntime';
import { registerLspHandlers } from './runtime/registerLspHandlers';

// Compose dependencies
const dependencies: ServerRuntimeDependencies = {
    documents: docs,
    client: clientGateway,
    diagnostics: diagnosticPublisher,
    scheduler: scheduler,
    files: fileAccess,
    logger: logger
};

// Compose the runtime
const runtime = createServerRuntime(dependencies);

// Register all LSP handlers
registerLspHandlers(connection, runtime);

// Start listening
docs.listen(connection);
connection.listen();
