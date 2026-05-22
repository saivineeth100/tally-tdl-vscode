/**
 * Script to generate markdown documentation from TDL JSON data files.
 * 
 * Automatically discovers all data categories (Definition, Function, Action, Schema, etc.)
 * under each version in server/data/ and converts them to markdown.
 * 
 * Usage:
 *   node scripts/generate-definition-docs.js           # generates for ALL versions found
 *   node scripts/generate-definition-docs.js 7.0       # generates for a specific version
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'server', 'data');
const DOCS_DIR = path.join(__dirname, '..', 'tally-tdl', 'docs');

// ─── Category Configuration ──────────────────────────────────────────
const CATEGORY_CONFIG = {
  'Definition': { outputDir: 'definitions', label: 'Definitions',  singular: 'Definition' },
  'Function':   { outputDir: 'functions',   label: 'Functions',    singular: 'Function' },
  'Action':     { outputDir: 'actions',      label: 'Actions',      singular: 'Action' },
  'Schema':     { outputDir: 'schemas',      label: 'Schemas',      singular: 'Schema' },
};

function getCategoryConfig(folderName) {
  return CATEGORY_CONFIG[folderName] || {
    outputDir: folderName.toLowerCase().replace(/\s+/g, '-') + 's',
    label: folderName + 's',
    singular: folderName,
  };
}

// ─── Version Discovery ───────────────────────────────────────────────

function discoverVersions() {
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(dir, entry.name);
      const hasCategory = discoverCategories(fullPath).length > 0;
      if (hasCategory) {
        const version = path.relative(DATA_DIR, fullPath).replace(/\\/g, '/');
        results.push(version);
      }
      walk(fullPath);
    }
  }
  walk(DATA_DIR);
  return results.sort();
}

function discoverCategories(versionDir) {
  const categories = [];
  const entries = fs.readdirSync(versionDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const categoryDir = path.join(versionDir, entry.name);
    const indexPath = path.join(categoryDir, 'index.json');
    if (fs.existsSync(indexPath)) {
      categories.push(entry.name);
    }
  }
  return categories.sort();
}

// ─── Markdown Rendering ──────────────────────────────────────────────

function buildParameterTable(params) {
  if (!params || params.length === 0) return '_No parameters._\n';
  const lines = [];
  const allKeys = new Set();
  for (const p of params) {
    Object.keys(p).forEach(k => allKeys.add(k));
  }
  const columnOrder = [
    'Description', 'Parameter Type', 'Datatype', 'Is Mandatory',
    'Is Constant', 'Is List', 'Refers To', 'Keyword Set', 'Keywords',
    'Separator Char', 'Variable Argument', 'Dimension Expression'
  ];
  const columns = columnOrder.filter(col => allKeys.has(col));
  lines.push('| # | ' + columns.join(' | ') + ' |');
  lines.push('|---| ' + columns.map(() => '---').join(' | ') + ' |');
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    const cells = columns.map(col => {
      let val = p[col] || '';
      if (typeof val === 'string') val = val.replace(/\|/g, '\\|').trim();
      return val;
    });
    lines.push(`| ${i + 1} | ` + cells.join(' | ') + ' |');
  }
  return lines.join('\n') + '\n';
}

function buildMetaSection(meta) {
  if (!meta) return '';
  const entries = Object.entries(meta);
  if (entries.length === 0) return '';
  const lines = [];
  for (const [key, value] of entries) {
    lines.push(`- **${key}**: ${value}`);
  }
  return lines.join('\n') + '\n';
}

function convertToMarkdown(groupName, data, version, categoryConfig) {
  const lines = [];
  lines.push(`# ${groupName} ${categoryConfig.singular}`);
  lines.push('');
  lines.push(`> **Version**: ${version}`);
  lines.push('');
  lines.push(`Reference documentation for all entries in the **${groupName}** ${categoryConfig.singular.toLowerCase()}.`);
  lines.push('');

  const itemNames = Object.keys(data);
  lines.push(`> **Total Entries**: ${itemNames.length}`);
  lines.push('');

  lines.push('## Table of Contents');
  lines.push('');
  for (const name of itemNames) {
    const anchor = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    lines.push(`- [${name}](#${anchor})`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const itemName of itemNames) {
    const item = data[itemName];
    lines.push(`## ${itemName}`);
    lines.push('');
    if (item.Description) {
      lines.push(item.Description);
      lines.push('');
    }
    if (item.Meta) {
      lines.push('### Meta');
      lines.push('');
      lines.push(buildMetaSection(item.Meta));
    }
    lines.push('### Parameters');
    lines.push('');
    lines.push(buildParameterTable(item.Parameters));
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

function convertToSchemaMarkdown(groupName, data, version, categoryConfig, allSchemaNames) {
  const lines = [];
  lines.push(`# ${groupName} ${categoryConfig.singular}`);
  lines.push('');
  lines.push(`> **Version**: ${version}`);
  lines.push('');
  lines.push(`Reference documentation for the **${groupName}** schema.`);
  lines.push('');

  if (data.Meta) {
    lines.push('### Meta');
    lines.push('');
    lines.push(buildMetaSection(data.Meta));
  }

  const properties = data.Properties || {};
  const propNames = Object.keys(properties);
  
  lines.push(`> **Total Properties**: ${propNames.length}`);
  lines.push('');

  lines.push('## Properties');
  lines.push('');
  
  if (propNames.length > 0) {
    lines.push('| Property Name | Complex | Is Repeated | Datatype / Object |');
    lines.push('| --- | --- | --- | --- |');
    
    // Create a case-insensitive map for faster and safer lookups
    const schemaNameMap = new Map();
    if (allSchemaNames) {
      allSchemaNames.forEach(name => schemaNameMap.set(name.toLowerCase(), name));
    }

    for (const name of propNames) {
      const prop = properties[name];
      const isComplex = prop.IsComplex ? 'Yes' : 'No';
      const meta = prop.Meta || {};
      const isRepeated = meta['Is Repeated'] || 'No';
      let datatype = meta.Datatype || meta['Object Name'] || '';
      
      // If the datatype matches a known schema name, make it a link
      if (datatype) {
        const lowerDatatype = datatype.toLowerCase();
        if (schemaNameMap.has(lowerDatatype)) {
          const actualSchemaName = schemaNameMap.get(lowerDatatype);
          // Encode the URL properly to handle spaces (e.g. 'Gst Advance Detail' -> 'Gst%20Advance%20Detail.md')
          const linkTarget = encodeURIComponent(actualSchemaName) + '.md';
          datatype = `[${datatype}](${linkTarget})`;
        }
      }

      lines.push(`| **${name}** | ${isComplex} | ${isRepeated} | ${datatype} |`);
    }
    lines.push('');
  } else {
    lines.push('_No properties._');
    lines.push('');
  }

  return lines.join('\n');
}

function generateCategoryIndex(groupNames, version, categoryConfig) {
  const lines = [];
  lines.push(`# TDL ${categoryConfig.label} Reference (v${version})`);
  lines.push('');
  lines.push(`Complete reference for all **${categoryConfig.label.toLowerCase()}** in TDL **version ${version}**.`);
  lines.push('');
  lines.push(`| # | ${categoryConfig.singular} | Entries |`);
  lines.push('|---|-----------|---------|');

  for (let i = 0; i < groupNames.length; i++) {
    const name = groupNames[i];
    const fileName = `${name}.md`;
    lines.push(`| ${i + 1} | [${name}](${fileName}) | — |`);
  }
  lines.push('');
  return lines.join('\n');
}

function generateVersionIndex(version, categoryResults) {
  const lines = [];
  lines.push(`# TDL Reference (v${version})`);
  lines.push('');
  lines.push(`Complete reference documentation for Tally Definition Language (TDL) **version ${version}**.`);
  lines.push('');

  for (const { categoryConfig, totalFiles, totalItems } of categoryResults) {
    lines.push(`## ${categoryConfig.label}`);
    lines.push('');
    lines.push(`- **Files**: ${totalFiles}`);
    lines.push(`- **Total Entries**: ${totalItems}`);
    lines.push(`- [View ${categoryConfig.label} Reference](${categoryConfig.outputDir}/index.md)`);
    lines.push('');
  }
  return lines.join('\n');
}

// ─── Processing ──────────────────────────────────────────────────────

function processCategory(version, categoryName) {
  const categoryConfig = getCategoryConfig(categoryName);
  const sourceDir = path.join(DATA_DIR, version, categoryName);
  const outputDir = path.join(DOCS_DIR, version, categoryConfig.outputDir);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const indexPath = path.join(sourceDir, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.warn(`    WARNING: No index.json in ${sourceDir}, skipping.`);
    return { categoryConfig, totalFiles: 0, totalItems: 0, groupNames: [] };
  }

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  console.log(`    ${categoryConfig.label}: ${index.length} files`);

  let totalFiles = 0;
  let totalItems = 0;

  for (const groupName of index) {
    const jsonPath = path.join(sourceDir, `${groupName}.json`);

    if (!fs.existsSync(jsonPath)) {
      console.warn(`      WARNING: ${groupName}.json not found, skipping.`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    let itemCount = 0;
    let markdown = '';

    if (categoryConfig.label === 'Schemas' || (data.Properties && data.Name)) {
      itemCount = Object.keys(data.Properties || {}).length;
      markdown = convertToSchemaMarkdown(groupName, data, version, categoryConfig, index);
    } else {
      itemCount = Object.keys(data).length;
      markdown = convertToMarkdown(groupName, data, version, categoryConfig);
    }

    totalItems += itemCount;

    const outputFileName = `${groupName}.md`;
    const outputPath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    totalFiles++;
  }

  const indexMd = generateCategoryIndex(index, version, categoryConfig);
  const indexMdPath = path.join(outputDir, 'index.md');
  fs.writeFileSync(indexMdPath, indexMd, 'utf-8');

  return { categoryConfig, totalFiles, totalItems, groupNames: index };
}

function processVersion(version) {
  const versionDir = path.join(DATA_DIR, version);
  const categories = discoverCategories(versionDir);

  console.log(`  Version ${version}: found ${categories.length} categories [${categories.join(', ')}]`);

  const categoryResults = [];
  for (const categoryName of categories) {
    const result = processCategory(version, categoryName);
    categoryResults.push(result);
  }

  const versionIndexMd = generateVersionIndex(version, categoryResults);
  const versionIndexPath = path.join(DOCS_DIR, version, 'index.md');
  fs.mkdirSync(path.dirname(versionIndexPath), { recursive: true });
  fs.writeFileSync(versionIndexPath, versionIndexMd, 'utf-8');

  return categoryResults;
}

// ─── Main ────────────────────────────────────────────────────────────

function main() {
  const requestedVersion = process.argv[2];
  let versions;

  if (requestedVersion) {
    const versionDir = path.join(DATA_DIR, requestedVersion);
    if (!fs.existsSync(versionDir)) {
      console.error(`ERROR: Version "${requestedVersion}" not found at ${versionDir}`);
      process.exit(1);
    }
    versions = [requestedVersion];
  } else {
    versions = discoverVersions();
  }

  console.log(`Generating TDL docs for ${versions.length} version(s): ${versions.join(', ')}`);
  console.log(`Output base: ${DOCS_DIR}`);
  console.log('');

  let grandTotalFiles = 0;
  let grandTotalItems = 0;

  for (const version of versions) {
    const results = processVersion(version);
    for (const r of results) {
      grandTotalFiles += r.totalFiles;
      grandTotalItems += r.totalItems;
    }
    console.log('');
  }

  console.log(`Done! Generated ${grandTotalFiles} markdown files with ${grandTotalItems} total entries across ${versions.length} version(s).`);
}

main();
