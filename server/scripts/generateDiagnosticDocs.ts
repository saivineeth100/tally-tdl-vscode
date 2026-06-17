import * as fs from 'fs';
import * as path from 'path';
import { SyntaxRules } from '../src/diagnostics/syntaxRules';
import { DefinitionRules } from '../src/diagnostics/definitionRules';
import { SchemaRules } from '../src/diagnostics/schemaRules';
import { StatementRules } from '../src/diagnostics/statementRules';

const DOCS_DIR = path.join(__dirname, '..', 'docs', 'diagnostics');

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
}

function getSeverityName(severity: number): string {
    switch (severity) {
        case 1: return 'Error';
        case 2: return 'Warning';
        case 3: return 'Information';
        case 4: return 'Hint';
        default: return 'Unknown';
    }
}

function generateCategoryMarkdown(categoryName: string, fileName: string, rules: any) {
    let md = `# ${categoryName} Diagnostics\n\n`;

    for (const [ruleName, rule] of Object.entries(rules)) {
        md += `## ${ruleName} (${(rule as any).code})\n\n`;
        md += `**Default Severity:** ${getSeverityName((rule as any).defaultSeverity)}\n`;
        md += `**Message Format:** \`${(rule as any).messageFormat}\`\n\n`;
        
        md += `### Description\n`;
        md += `${(rule as any).description}\n\n`;

        md += `### Configuration\n`;
        md += `This diagnostic's severity can be configured in your \`settings.json\`.\n`;
        md += `You can change it to \`"error"\`, \`"warning"\`, \`"information"\`, \`"hint"\`, or \`"none"\`.\n\n`;

        md += `\`\`\`json\n`;
        md += `{\n`;
        md += `    "tallyTDL.diagnostics.severity": {\n`;
        md += `        "${(rule as any).code}": "${getSeverityName((rule as any).defaultSeverity).toLowerCase()}"\n`;
        md += `    }\n`;
        md += `}\n`;
        md += `\`\`\`\n\n`;
    }

    const filePath = path.join(DOCS_DIR, `${fileName}.md`);
    fs.writeFileSync(filePath, md, 'utf-8');
    console.log(`Generated ${fileName}.md`);
}

function generateDocs() {
    console.log('Generating diagnostic documentation...');
    
    const ruleSets = [
        { name: 'Syntax & Lexical', fileName: 'syntax', rules: SyntaxRules },
        { name: 'Definitions & Attributes', fileName: 'definitions', rules: DefinitionRules },
        { name: 'Schema & Objects', fileName: 'schema', rules: SchemaRules },
        { name: 'Statements & Variables', fileName: 'statements', rules: StatementRules }
    ];

    let summaryMd = '# Tally TDL Diagnostics\n\nThis folder contains documentation for all diagnostic rules.\n\n';

    for (const ruleSet of ruleSets) {
        generateCategoryMarkdown(ruleSet.name, ruleSet.fileName, ruleSet.rules);
        
        summaryMd += `## [${ruleSet.name}](${ruleSet.fileName}.md)\n\n`;
        summaryMd += `| Code | Rule | Default Severity | Description |\n`;
        summaryMd += `|------|------|------------------|-------------|\n`;

        for (const [ruleName, rule] of Object.entries(ruleSet.rules)) {
            summaryMd += `| [${(rule as any).code}](${ruleSet.fileName}.md#${ruleName.toLowerCase()}-${(rule as any).code.toLowerCase()}) | ${ruleName} | ${getSeverityName((rule as any).defaultSeverity)} | ${(rule as any).description} |\n`;
        }
        summaryMd += '\n';
    }

    fs.writeFileSync(path.join(DOCS_DIR, 'README.md'), summaryMd, 'utf-8');
    console.log('Generated README.md');
    console.log('Documentation generation complete.');
}

generateDocs();
