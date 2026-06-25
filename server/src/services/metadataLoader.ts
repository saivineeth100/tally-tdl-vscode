import * as fsasync from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { ScopeManager } from './scopeManager/index';
import {
    SymbolKind,
    FunctionSymbol,
    ActionSymbol,
    AttributeSymbol,
    SchemaSymbol,
    TDLParameter,
    TDLSchemaProperty
} from '../models/symbols';
import { normalizeTypeName, registerInterchangeableTypes, registerInterchangeableAttributes } from './utils';

async function loadJsonSafe<T>(filePath: string): Promise<T | null> {
    return fs.existsSync(filePath) ? JSON.parse(await fsasync.readFile(filePath, 'utf-8')) : null;
}

export async function loadMetadata(basePath: string, version: string, manager: ScopeManager) {
    const versionPath = path.join(basePath, version);

    // Initialize global sets if they don't exist
    if (!manager.existingDefinitions) manager.existingDefinitions = new Map();
    if (!manager.keywordSets) manager.keywordSets = new Map();
    if (!manager.primarySchemaNames) manager.primarySchemaNames = [];

    await loadDefinitionAliases(versionPath);
    await loadFunctions(versionPath, manager);
    await loadActions(versionPath, manager);
    await loadDefinitionAttributes(versionPath, manager);
    await loadSchemas(versionPath, manager);
    await loadExistingDefinitions(versionPath, manager);
}

async function loadDefinitionAliases(versionPath: string) {
    const definitionMetaFile = path.join(versionPath, "Definition", "Definition.json");
    if (fs.existsSync(definitionMetaFile)) {
        const defMetaData = await loadJsonSafe<any>(definitionMetaFile);
        if (defMetaData) {
            for (const defType of Object.keys(defMetaData)) {
                const meta = defMetaData[defType].meta;
                if (meta && meta.Aliases) {
                    const aliases = meta.Aliases.split(',').map((a: string) => a.trim());
                    if (aliases.length > 0) {
                        registerInterchangeableTypes(aliases);
                        registerInterchangeableAttributes(defType, aliases);
                    }
                }
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

                attrMap.set(normalizeTypeName(symbol.name), symbol);

                if (symbol.aliases) {
                    for (const alias of symbol.aliases.split(',')) {
                        const normalized = normalizeTypeName(alias);
                        if (normalized) attrMap.set(normalized, symbol);
                    }
                }

                // Cache Keyword Sets
                for (const param of symbol.parameters) {
                    if (param.KeywordSet && param.Keywords) {
                        const normalizedKey = normalizeTypeName(param.KeywordSet);
                        if (!manager.keywordSets.has(normalizedKey)) {
                            manager.keywordSets.set(normalizedKey, param.Keywords.map(k => k.trim()));
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

async function loadExistingDefinitions(versionPath: string, manager: ScopeManager) {
    const existingPath = path.join(versionPath, "ExistingDefinitions");
    if (!fs.existsSync(existingPath)) return;

    const existingFiles = await fsasync.readdir(existingPath);
    for (const existingFile of existingFiles) {
        if (!existingFile.endsWith('.json')) continue;

        const defType = existingFile.replace('.json', '');
        const defData = await loadJsonSafe<string[]>(path.join(existingPath, existingFile));
        if (defData && Array.isArray(defData)) {
            const defSet = new Set<string>();
            for (const defName of defData) {
                if (defName.includes(',')) {
                    for (const part of defName.split(',')) {
                        defSet.add(normalizeTypeName(part));
                    }
                } else {
                    defSet.add(normalizeTypeName(defName));
                }
            }
            
            

            manager.existingDefinitions.set(normalizeTypeName(defType), defSet);
            manager.definitionTypeLabels.set(normalizeTypeName(defType), defType);
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
