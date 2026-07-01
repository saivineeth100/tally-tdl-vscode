import * as fsasync from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger';
import * as v8 from 'v8';
import { ScopeManager, ScopeKind, DefinitionScope } from './scopeManager/index';
import {
    SymbolKind,
    FunctionSymbol,
    ActionSymbol,
    AttributeSymbol,
    SchemaSymbol,
    TDLParameter,
    TDLSchemaProperty
} from 'tally-tdl-shared';
import { normalizeTypeName } from '../utils/normalizeUtils';
import { ReferenceIndex } from './symbols/referenceIndex';

async function loadJsonSafe<T>(filePath: string): Promise<T | null> {
    return fs.existsSync(filePath) ? JSON.parse(await fsasync.readFile(filePath, 'utf-8')) : null;
}

export async function loadMetadata(basePath: string, version: string, manager: ScopeManager, forceRebuild = false, loadBaseTdl = true) {
    const versionPath = path.join(basePath, version);
    const metaBinPath = path.join(basePath, `${version}_metadata.bin`);
    const baseBinPath = path.join(basePath, `${version}_basetdl.bin`);
    
    // We only skip rebuilding if BOTH files exist (or if it's the old single .bin)
    const oldBinPath = path.join(basePath, `${version}.bin`);
    // If loadBaseTdl is false, we only need the metaBinPath to exist.
    const hasNewBins = fs.existsSync(metaBinPath) && (!loadBaseTdl || fs.existsSync(baseBinPath));
    const hasOldBin = fs.existsSync(oldBinPath);

    // Check if binary cache exists
    if (!forceRebuild && (hasNewBins || hasOldBin)) {
        try {
            logger.info(`[Cache] Loading cache for version ${version}...`);

            if (hasNewBins) {
                // Load Metadata Bin
                logger.debug(`[Cache] Loading metadata from ${version}_metadata.bin...`);
                const metaBuffer = await fsasync.readFile(metaBinPath);
                const metaDeserialized = v8.deserialize(metaBuffer) as ScopeManager;

                manager.globalScope.functions = metaDeserialized.globalScope.functions;
                manager.globalScope.actions = metaDeserialized.globalScope.actions;
                manager.globalScope.schemas = metaDeserialized.globalScope.schemas;
                manager.globalScope.attributes = metaDeserialized.globalScope.attributes;
                manager.globalScope.interchangeableTypesMap = metaDeserialized.globalScope.interchangeableTypesMap;
                manager.globalScope.interchangeableAttributesMap = metaDeserialized.globalScope.interchangeableAttributesMap;
                manager.keywordSets = metaDeserialized.keywordSets;
                manager.primarySchemaNames = metaDeserialized.primarySchemaNames;
                manager.definitionTypeLabels = metaDeserialized.definitionTypeLabels;

                // Load Base TDL Bin
                if (loadBaseTdl) {
                    logger.debug(`[Cache] Loading base TDL structures from ${version}_basetdl.bin...`);
                    const baseBuffer = await fsasync.readFile(baseBinPath);
                    const baseDeserialized = v8.deserialize(baseBuffer) as ScopeManager;

                    manager.globalScope.definitions = baseDeserialized.globalScope.definitions;
                    manager.globalScope.variables = baseDeserialized.globalScope.variables;
                    manager.globalScope.formulas = baseDeserialized.globalScope.formulas;
                    if (baseDeserialized.globalScope.referenceIndex) {
                        const newIndex = new ReferenceIndex();
                        newIndex.identifierToUris = (baseDeserialized.globalScope.referenceIndex as any).identifierToUris;
                        manager.globalScope.referenceIndex = newIndex;
                    }

                if (baseDeserialized.childDefinitions) manager.childDefinitions = baseDeserialized.childDefinitions;
                if (baseDeserialized.parentDefinitions) manager.parentDefinitions = baseDeserialized.parentDefinitions;
                if (baseDeserialized.useInheritance) manager.useInheritance = baseDeserialized.useInheritance;
                if (baseDeserialized.inUseInheritance) manager.inUseInheritance = baseDeserialized.inUseInheritance;
                if ((baseDeserialized as any).nameIndex) manager.nameIndex = (baseDeserialized as any).nameIndex;
                if (baseDeserialized.scopeIndex) manager.scopeIndex = baseDeserialized.scopeIndex;
                if (baseDeserialized.modifierContributions) manager.modifierContributions = baseDeserialized.modifierContributions;
                if (baseDeserialized.uriGraphContributions) manager.uriGraphContributions = baseDeserialized.uriGraphContributions;
                }
            } 

            logger.info(`[Cache] Cache data loaded successfully.`);
            return;
        } catch (error) {
            logger.error(`Failed to load binary caches for version ${version}: ${error}`);
            // Fall back to JSON parsing if binary cache fails
        }
    }

    // Initialize global sets if they don't exist
    if (!manager.keywordSets) manager.keywordSets = new Map();
    if (!manager.primarySchemaNames) manager.primarySchemaNames = [];

    await loadDefinitionAliases(versionPath, manager);

    await loadFunctions(versionPath, manager);
    await loadActions(versionPath, manager);
    await loadDefinitionAttributes(versionPath, manager);
    await loadSchemas(versionPath, manager);
    await loadExistingDefinitions(versionPath, manager);
}

export async function loadExternalLibraries(libraryPaths: string[], manager: ScopeManager) {
    if (!libraryPaths || libraryPaths.length === 0) return;

    for (const libPath of libraryPaths) {
        if (fs.existsSync(libPath)) {
            try {
                const buffer = await fsasync.readFile(libPath);
                const deserialized = v8.deserialize(buffer) as ScopeManager;

                // Merge user definitions from projectScope into the current globalScope
                if (deserialized.projectScope && deserialized.scopeIndex) {
                    for (const [defType, defMap] of deserialized.scopeIndex.entries()) {
                        let globalDefMap = manager.globalScope.definitions.get(defType);
                        if (!globalDefMap) {
                            globalDefMap = new Map();
                            manager.globalScope.definitions.set(defType, globalDefMap);
                        }
                        for (const [name, sym] of defMap.entries()) {
                            if (sym.kind === ScopeKind.Definition) {
                                const ds = sym as DefinitionScope;
                                if (ds.definition) {
                                    globalDefMap.set(name, ds.definition);
                                }
                            }
                        }
                    }
                }

                if (deserialized.projectScope && deserialized.projectScope.variables) {
                    for (const [name, sym] of deserialized.projectScope.variables.entries()) {
                        manager.globalScope.variables.set(name, sym);
                    }
                }

                if (deserialized.projectScope && deserialized.projectScope.formulas) {
                    for (const [name, sym] of deserialized.projectScope.formulas.entries()) {
                        manager.globalScope.formulas.set(name, sym);
                    }
                }

                // Merge structural graphs
                const mergeSetMap = (src: Map<string, Set<string>>, dest: Map<string, Set<string>>) => {
                    if (!src) return;
                    for (const [key, set] of src.entries()) {
                        let existing = dest.get(key);
                        if (!existing) {
                            existing = new Set();
                            dest.set(key, existing);
                        }
                        for (const item of set) existing.add(item);
                    }
                };

                mergeSetMap(deserialized.childDefinitions, manager.childDefinitions);
                mergeSetMap(deserialized.parentDefinitions, manager.parentDefinitions);
                mergeSetMap(deserialized.useInheritance, manager.useInheritance);
                mergeSetMap(deserialized.inUseInheritance, manager.inUseInheritance);

                // Merge file scopes to preserve AST-level details (variables, formulas, etc.)
                if (deserialized.fileMap) {
                    for (const [uri, fileScope] of deserialized.fileMap.entries()) {
                        manager.fileMap.set(uri, fileScope);
                        manager.indexScope(fileScope);
                    }
                }

                if (deserialized.modifierContributions) {
                    for (const [key, contributions] of deserialized.modifierContributions.entries()) {
                        let existing = manager.modifierContributions.get(key);
                        if (!existing) {
                            existing = [];
                            manager.modifierContributions.set(key, existing);
                        }
                        existing.push(...contributions);
                    }
                }

                if (deserialized.uriGraphContributions) {
                    for (const [key, val] of deserialized.uriGraphContributions.entries()) {
                        manager.uriGraphContributions.set(key, val);
                    }
                }
            } catch (error) {
                logger.error(`Failed to load external library ${libPath}: ${error}`);
            }
        } else {
            logger.warn(`External library not found: ${libPath}`);
        }
    }
}

async function loadDefinitionAliases(versionPath: string, manager: ScopeManager) {

    const definitionMetaFile = path.join(versionPath, "Definition", "Definition.json");
    if (fs.existsSync(definitionMetaFile)) {
        const defMetaData = await loadJsonSafe<any>(definitionMetaFile);
        if (defMetaData) {
            for (const defType of Object.keys(defMetaData)) {
                const canonicalType = normalizeTypeName(defType);
                const meta = defMetaData[defType].meta;
                if (meta && meta.Aliases) {
                    const aliases = meta.Aliases.split(',').map((a: string) => a.trim());
                    for (const alias of aliases) {
                        const normalizedAlias = normalizeTypeName(alias);
                        manager.globalScope.interchangeableTypesMap.set(normalizedAlias, canonicalType);
                        manager.globalScope.interchangeableAttributesMap.set(normalizedAlias, defType); // Original casing for attributes
                    }
                    // Also map the canonical type to itself for consistency
                    manager.globalScope.interchangeableTypesMap.set(canonicalType, canonicalType);
                }
                manager.definitionTypeLabels.set(canonicalType, defType);
            }
        }
    }
}

async function loadFunctions(versionPath: string, manager: ScopeManager) {
    const functionsPath = path.join(versionPath, "Function");
    if (!fs.existsSync(functionsPath)) return;

    const functionFiles = await fsasync.readdir(functionsPath);
    for (const functionFile of functionFiles) {
        if (functionFile == "index.json" || functionFile === "AllFunctions.json" || !functionFile.endsWith('.json')) continue;

        const functions = await loadJsonSafe<any>(path.join(functionsPath, functionFile));
        if (functions) {
            for (const funcName of Object.keys(functions)) {
                const json = functions[funcName];
                const symbol: FunctionSymbol = {
                    name: json.Name,
                    kind: SymbolKind.Function,
                    uri: 'global:metadata',
                    start: 0, end: 0,
                    definitionType: 'Function',
                    parameters: (json.Parameters || []).map((p: any) => parseParameter(p)),
                    returnType: json.Meta?.["Return Type"],
                    aliases: json.Meta?.Aliases
                };
                manager.globalScope.functions.set(normalizeTypeName(symbol.name), symbol);

                if (symbol.aliases) {
                    for (const alias of symbol.aliases.split(',')) {
                        const normalized = normalizeTypeName(alias);
                        if (normalized) manager.globalScope.functions.set(normalized, symbol);
                    }
                }
            }
        }
    }
}

async function loadActions(versionPath: string, manager: ScopeManager) {
    const actionsPath = path.join(versionPath, "Action");
    if (!fs.existsSync(actionsPath)) return;

    const actionFiles = await fsasync.readdir(actionsPath);
    for (const actionFile of actionFiles) {
        if (actionFile == "index.json" || actionFile === "AllActions.json" || !actionFile.endsWith('.json')) continue;

        const actions = await loadJsonSafe<any>(path.join(actionsPath, actionFile));
        if (actions) {
            for (const actionName of Object.keys(actions)) {
                const json = actions[actionName];
                const symbol: ActionSymbol = {
                    name: json.Name,
                    kind: SymbolKind.Function, // Actions act like functions syntactically
                    uri: 'global:metadata',
                    start: 0, end: 0,
                    definitionType: 'Action',
                    description: json.Description,
                    parameters: (json.Parameters || []).map((p: any) => parseParameter(p)),
                    aliases: json.Meta?.Aliases,
                    totalParameters: parseInt(json.Meta?.["Total Parameters"]) || 0,
                    totalMandatoryParameters: parseInt(json.Meta?.["Total Mandatory Parameters"]) || 0,
                    category: json.Meta?.Category,
                    mode: json.Meta?.Mode,
                    returnType: json.Meta?.["Return Type"]
                };
                manager.globalScope.actions.set(normalizeTypeName(symbol.name), symbol);

                if (symbol.aliases) {
                    for (const alias of symbol.aliases.split(',')) {
                        const normalized = normalizeTypeName(alias);
                        if (normalized) manager.globalScope.actions.set(normalized, symbol);
                    }
                }
            }
        }
    }
}

async function loadDefinitionAttributes(versionPath: string, manager: ScopeManager) {
    const definitionsPath = path.join(versionPath, "Definition");
    if (!fs.existsSync(definitionsPath)) return;

    const definitionFiles = await fsasync.readdir(definitionsPath);
    for (const definitionFile of definitionFiles) {
        if (definitionFile == "index.json" || definitionFile === "AllDefinitions.json" || !definitionFile.endsWith('.json')) continue;

        const defType = definitionFile.replace('.json', '');
        const definitionsData = await loadJsonSafe<any>(path.join(definitionsPath, definitionFile));
        if (definitionsData) {
            // Transform split attributes
            const keys = Object.keys(definitionsData);
            for (const key of keys) {
                if (key.indexOf('/') !== -1) {
                    const originalDef = definitionsData[key];
                    const parts = key.split('/');
                    delete definitionsData[key];

                    const escapedParts = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                    const anyPart = `(?:${escapedParts.join('|')})`;
                    const regexPattern = Array(parts.length).fill(anyPart).join('[/]');
                    const sharedRegex = new RegExp(regexPattern, 'gi');

                    for (const part of parts) {
                        let newDesc = originalDef.Description || '';
                        newDesc = newDesc.replace(sharedRegex, part);
                        definitionsData[part] = {
                            ...originalDef,
                            Name: part,
                            Description: newDesc,
                            Parameters: originalDef.Parameters ? [...originalDef.Parameters] : []
                        };
                    }
                }
            }

            const normalizedDefType = normalizeTypeName(defType);
            let attrMap = manager.globalScope.attributes.get(normalizedDefType);
            if (!attrMap) {
                attrMap = new Map();
                manager.globalScope.attributes.set(normalizedDefType, attrMap);
            }

            for (const defName of Object.keys(definitionsData)) {
                const json = definitionsData[defName];
                const name = json.Name || defName;
                const parameters = (json.Parameters || []).map((p: any) => parseParameter(p));

                const symbol: AttributeSymbol = {
                    name: name,
                    kind: SymbolKind.Unknown, // Attributes don't strictly fit a single kind, they are definition properties
                    uri: 'global:metadata',
                    start: 0, end: 0,
                    definitionType: defType,
                    description: json.Description,
                    parameters: parameters,
                    aliases: json.Meta?.Aliases,
                    type: json.Meta?.Type,
                    isDiscrete: json.Meta?.["Is Discrete"] === "Yes"
                };

                const attrName = normalizeTypeName(symbol.name);
                let targetDefType: string | undefined;

                if (symbol.parameters && symbol.parameters.length > 0) {
                    const refersTo = symbol.parameters[0].RefersTo;
                    if (refersTo) {
                        targetDefType = normalizeTypeName(refersTo);
                    }
                }
                
                if (!targetDefType && manager.globalScope.interchangeableTypesMap?.has(attrName)) {
                    targetDefType = attrName;
                }

                if (targetDefType) {
                    manager.globalScope.interchangeableAttributesMap?.set(attrName, targetDefType);
                }

                attrMap.set(attrName, symbol);

                if (symbol.aliases) {
                    for (const alias of symbol.aliases.split(',')) {
                        const normalized = normalizeTypeName(alias);
                        if (normalized) {
                            attrMap.set(normalized, symbol);
                            if (targetDefType) {
                                manager.globalScope.interchangeableAttributesMap?.set(normalized, targetDefType);
                            }
                        }
                    }
                }

                // Cache Keyword Sets
                for (const param of symbol.parameters) {
                    if (param.KeywordSet && param.Keywords) {
                        const normalizedKey = normalizeTypeName(param.KeywordSet);
                        if (!manager.keywordSets.has(normalizedKey)) {
                            manager.keywordSets.set(normalizedKey, param.Keywords.map((k: string) => k.trim()));
                        }
                    }
                }
            }
        }
    }
}

async function loadSchemas(versionPath: string, manager: ScopeManager) {
    const schemasPath = path.join(versionPath, "Schema");
    if (!fs.existsSync(schemasPath)) return;

    const schemaFiles = await fsasync.readdir(schemasPath);
    for (const schemaFile of schemaFiles) {
        if (schemaFile == "index.json" || schemaFile === "AllSchemas.json" || !schemaFile.endsWith('.json')) continue;

        const schemaName = schemaFile.replace('.json', '');
        const json = await loadJsonSafe<any>(path.join(schemasPath, schemaFile));
        if (json) {
            const properties = new Map<string, TDLSchemaProperty>();
            if (json.Properties) {
                for (const propName of Object.keys(json.Properties)) {
                    const pJson = json.Properties[propName];
                    properties.set(propName, {
                        Name: pJson.Name,
                        IsComplex: pJson.IsComplex === true,
                        IsRepeated: pJson.Meta?.["Is Repeated"] === "Yes",
                        DataType: pJson.Meta?.Datatype,
                        ObjectName: pJson.Meta?.["Object Name"]
                    });
                }
            }

            const complexProperties = new Map<string, string>();
            if (json.ComplexProperties) {
                for (const propName of Object.keys(json.ComplexProperties)) {
                    complexProperties.set(propName, json.ComplexProperties[propName]);
                }
            }

            const isPrimary = json.Meta?.["Is Primary"] === "Yes";
            const symbol: SchemaSymbol = {
                name: schemaName,
                kind: SymbolKind.Object,
                uri: 'global:metadata',
                start: 0, end: 0,
                definitionType: 'Schema',
                properties: properties,
                isPrimary: isPrimary,
                complexProperties: complexProperties
            };

            manager.globalScope.schemas.set(normalizeTypeName(schemaName), symbol);
            if (isPrimary) {
                manager.primarySchemaNames.push(schemaName);
            }
        }
    }
}


function parseParameter(json: any): TDLParameter {
    return {
        ParameterType: json["Parameter Type"],
        IsConstant: json["Is Constant"] === "Yes",
        DataType: (json.Datatype || json.DataType || '').trim(),
        IsMandatory: json["Is Mandatory"] === "Yes",
        RefersTo: (json["Refers To"] || '').trim(),
        KeywordSet: normalizeTypeName(json["Keyword Set"] || ''),
        Keywords: json.Keywords?.split(","),
        IsList: json["Is List"] === "Yes",
        IsVariableArgument: json["Variable Argument"] === "Yes",
        DimensionExpression: json["Dimension Expression"] === "Yes"
    };
}

import { } from './scopeManager/types';

async function loadExistingDefinitions(versionPath: string, manager: ScopeManager) {
    const existingPath = path.join(versionPath, "ExistingDefinitions");
    if (!fs.existsSync(existingPath)) return;

    const existingFiles = await fsasync.readdir(existingPath);
    for (const existingFile of existingFiles) {
        if (!existingFile.endsWith('.json')) continue;

        const defType = existingFile.replace('.json', '');
        const defData = await loadJsonSafe<string[]>(path.join(existingPath, existingFile));
        if (defData && Array.isArray(defData)) {
            const normalizedDefType = normalizeTypeName(defType);
            let globalDefMap = manager.globalScope.definitions.get(normalizedDefType);
            if (!globalDefMap) {
                globalDefMap = new Map();
                manager.globalScope.definitions.set(normalizedDefType, globalDefMap);
            }
            for (const defName of defData) {
                if (defName.includes(',')) {
                    for (const part of defName.split(',')) {
                        globalDefMap.set(normalizeTypeName(part), {
                            name: part.trim(),
                            kind: (defType),
                            uri: 'global:metadata',
                            start: 0, end: 0,
                            definitionType: defType
                        } as any);
                    }
                } else {
                    globalDefMap.set(normalizeTypeName(defName), {
                        name: defName.trim(),
                        kind: (defType),
                        uri: 'global:metadata',
                        start: 0, end: 0,
                        definitionType: defType
                    } as any);
                }
            }

            manager.definitionTypeLabels.set(normalizedDefType, defType);
        }
    }
}

import { definitionTypeToSymbolKind } from '../semantics/scopeManager/types';
