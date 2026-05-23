import * as fsasync from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { TDLFunction, TDLFunctionParameter } from './models/tdlFunction';

async function loadJsonSafe<T>(filePath: string): Promise<T | null> {
    return fs.existsSync(filePath) ? JSON.parse(await fsasync.readFile(filePath, 'utf-8')) : null;
}

async function loadAllJsonFromDirectory<T>(dirPath: string, excludeFiles: string[] = []): Promise<Map<string, T>> {
    const result = new Map<string, T>();
    if (!fs.existsSync(dirPath)) return result;

    const files = await fsasync.readdir(dirPath);
    for (const file of files) {
        if (excludeFiles.includes(file) || !file.endsWith('.json')) continue;
        const data = await loadJsonSafe<T>(path.join(dirPath, file));
        if (data !== null) {
            result.set(file.replace('.json', ''), data);
        }
    }
    return result;
}

/** TDL Action metadata */
export class TDLAction {
    static FromJSON(json: any): TDLAction {
        const action = new TDLAction();
        action.Name = json.Name;
        action.Description = json.Description;
        action.Parameters = (json.Parameters || []).map((p: any) => TDLParameter.FromJSON(p));
        if (json.Meta) {
            action.Aliases = json.Meta.Aliases;
            action.TotalParameters = parseInt(json.Meta["Total Parameters"]) || 0;
            action.TotalMandatoryParameters = parseInt(json.Meta["Total Mandatory Parameters"]) || 0;
            action.Category = json.Meta.Category;
            action.Mode = json.Meta.Mode;
            action.ReturnType = json.Meta["Return Type"];
        }
        return action;
    }
    Name!: string;
    Description?: string;
    Parameters: TDLParameter[] = [];
    Aliases?: string;
    TotalParameters: number = 0;
    TotalMandatoryParameters: number = 0;
    Category?: string;
    Mode?: string;
    ReturnType?: string;
}

/** TDL Definition attribute metadata */
export class TDLDefinition {
    static FromJSON(json: any): TDLDefinition {
        const def = new TDLDefinition();
        def.Name = json.Name;
        def.Description = json.Description;
        def.Parameters = (json.Parameters || []).map((p: any) => TDLParameter.FromJSON(p));
        if (json.Meta) {
            def.Aliases = json.Meta.Aliases;
            def.Type = json.Meta.Type;
            def.IsDiscrete = json.Meta["Is Discrete"] === "Yes";
        }
        return def;
    }
    Name!: string;
    Description?: string;
    Parameters: TDLParameter[] = [];
    Aliases?: string;
    Type?: string;
    IsDiscrete: boolean = false;
}

/** Parameter for Actions/Definitions */
export class TDLParameter {
    static FromJSON(json: any): TDLParameter {
        const param = new TDLParameter();
        param.ParameterType = json["Parameter Type"];
        param.IsConstant = json["Is Constant"] === "Yes";
        param.DataType = json.Datatype || json.DataType;
        param.IsMandatory = json["Is Mandatory"] === "Yes";
        param.RefersTo = json["Refers To"];
        param.KeywordSet = json["Keyword Set"];
        param.Keywords = json.Keywords;
        param.IsList = json["Is List"] === "Yes";
        param.IsVariableArgument = json["Variable Argument"] === "Yes";
        param.DimensionExpression = json["Dimension Expression"] === "Yes";
        return param;
    }
    ParameterType?: string;
    IsConstant: boolean = false;
    DataType?: string;
    IsMandatory: boolean = false;
    RefersTo?: string;
    KeywordSet?: string;
    Keywords?: string;
    IsList: boolean = false;
    IsVariableArgument: boolean = false;
    DimensionExpression: boolean = false;
}

/** Schema property metadata */
export class TDLSchemaProperty {
    static FromJSON(json: any): TDLSchemaProperty {
        const prop = new TDLSchemaProperty();
        prop.Name = json.Name;
        prop.IsComplex = json.IsComplex === true;
        if (json.Meta) {
            prop.IsRepeated = json.Meta["Is Repeated"] === "Yes";
            prop.DataType = json.Meta.Datatype;
            prop.ObjectName = json.Meta["Object Name"];
        }
        return prop;
    }
    Name!: string;
    IsComplex: boolean = false;
    IsRepeated: boolean = false;
    DataType?: string;
    ObjectName?: string;
}

/** TDL Schema (Object definition) */
export class TDLSchema {
    Name!: string;
    Properties: Map<string, TDLSchemaProperty> = new Map();
    IsPrimary: boolean = false;
    ComplexProperties: Map<string, string> = new Map(); // PropertyName -> SchemaName

    static FromJSON(name: string, json: any): TDLSchema {
        const schema = new TDLSchema();
        schema.Name = name;
        if (json.Properties) {
            for (const propName of Object.keys(json.Properties)) {
                schema.Properties.set(propName, TDLSchemaProperty.FromJSON(json.Properties[propName]));
            }
        }
        if (json.Meta && json.Meta["Is Primary"] === "Yes") {
            schema.IsPrimary = true;
        }
        if (json.ComplexProperties) {
            for (const propName of Object.keys(json.ComplexProperties)) {
                schema.ComplexProperties.set(propName, json.ComplexProperties[propName]);
            }
        }
        return schema;
    }
}

/** App information */
export interface AppInfo {
    Name: string;
    Release: string;
    Build: string;
}

export class TdlMetadata {
    functions: TDLFunction[] = [];
    actions: TDLAction[] = [];
    definitions: Map<string, TDLDefinition[]> = new Map(); // Grouped by definition type (Collection, Field, etc.)
    schemas: Map<string, TDLSchema> = new Map();
    existingDefinitions: Map<string, string[]> = new Map();
    keywordSets: Map<string, string[]> = new Map(); // Cache keywords by Keyword Set name
    allActions: string[] = [];
    allDefinitions: string[] = [];
    allFunctions: string[] = [];
    allSchemas: string[] = [];
    primarySchemaNames: string[] = [];
    appInfo?: AppInfo;

    // Fast lookup maps (populated during load)
    private _functionsByName: Map<string, TDLFunction> = new Map();
    private _actionsByName: Map<string, TDLAction> = new Map();
    private _definitionsByName: Map<string, TDLDefinition> = new Map(); // all definitions
    private _schemasByName: Map<string, TDLSchema> = new Map();

    constructor(private basePath: string, private version: string = "7.0") { }

    async load() {
        const versionPath = path.join(this.basePath, this.version);

        // Load app info
        this.appInfo = await loadJsonSafe<AppInfo>(path.join(versionPath, "appInfo.json")) ?? undefined;

        // Load functions
        await this.loadFunctions(versionPath);

        // Load actions
        await this.loadActions(versionPath);

        // Load definitions
        await this.loadDefinitions(versionPath);

        // Load schemas
        await this.loadSchemas(versionPath);

        // Load existing definitions
        await this.loadExistingDefinitions(versionPath);

        // Build fast lookup maps
        this.buildLookupMaps();
    }

    private buildLookupMaps() {
        // Functions
        for (const func of this.functions) {
            this._functionsByName.set(func.Name.toLowerCase(), func);
            if (func.Aliases) {
                const aliases = func.Aliases.split(',').map(a => a.trim().toLowerCase());
                for (const alias of aliases) {
                    if (alias) this._functionsByName.set(alias, func);
                }
            }
        }

        // Actions
        for (const action of this.actions) {
            this._actionsByName.set(action.Name.toLowerCase(), action);
            if (action.Aliases) {
                const aliases = action.Aliases.split(',').map(a => a.trim().toLowerCase());
                for (const alias of aliases) {
                    if (alias) this._actionsByName.set(alias, action);
                }
            }
        }

        // Definitions
        for (const [_, defs] of this.definitions) {
            for (const def of defs) {
                this._definitionsByName.set(def.Name.toLowerCase(), def);
                if (def.Aliases) {
                    const aliases = def.Aliases.split(',').map(a => a.trim().toLowerCase());
                    for (const alias of aliases) {
                        if (alias) this._definitionsByName.set(alias, def);
                    }
                }
            }
        }

        // Schemas
        for (const [_, schema] of this.schemas) {
            this._schemasByName.set(schema.Name.toLowerCase(), schema);
        }
    }

    private async loadFunctions(versionPath: string) {
        const functionsPath = path.join(versionPath, "Function");
        if (!fs.existsSync(functionsPath)) return;

        const functionFiles = await fsasync.readdir(functionsPath);
        for (const functionFile of functionFiles) {
            if (functionFile == "index.json") continue;
            if (functionFile === "AllFunctions.json") {
                // Load all function names
                const allFuncs = await loadJsonSafe<string[]>(path.join(functionsPath, functionFile));
                if (allFuncs) this.allFunctions = allFuncs;
                continue;
            }
            if (!functionFile.endsWith('.json')) continue;

            const functions = await loadJsonSafe<any>(path.join(functionsPath, functionFile));
            if (functions) {
                for (const funcName of Object.keys(functions)) {
                    this.functions.push(TDLFunction.FromJSON(functions[funcName]));
                }
            }
        }
    }

    private async loadActions(versionPath: string) {
        const actionsPath = path.join(versionPath, "Action");
        if (!fs.existsSync(actionsPath)) return;

        const actionFiles = await fsasync.readdir(actionsPath);
        for (const actionFile of actionFiles) {
            if (actionFile == "index.json") continue;
            if (actionFile === "AllActions.json") {
                // Load all action names
                const allActs = await loadJsonSafe<string[]>(path.join(actionsPath, actionFile));
                if (allActs) this.allActions = allActs;
                continue;
            }
            if (!actionFile.endsWith('.json')) continue;

            const actions = await loadJsonSafe<any>(path.join(actionsPath, actionFile));
            if (actions) {
                for (const actionName of Object.keys(actions)) {
                    this.actions.push(TDLAction.FromJSON(actions[actionName]));
                }
            }
        }
    }

    private async loadDefinitions(versionPath: string) {
        const definitionsPath = path.join(versionPath, "Definition");
        if (!fs.existsSync(definitionsPath)) return;

        const definitionFiles = await fsasync.readdir(definitionsPath);
        for (const definitionFile of definitionFiles) {
            if (definitionFile == "index.json") continue;
            if (definitionFile === "AllDefinitions.json") {
                // Load all definition names
                const allDefs = await loadJsonSafe<string[]>(path.join(definitionsPath, definitionFile));
                if (allDefs) this.allDefinitions = allDefs;
                continue;
            }
            if (!definitionFile.endsWith('.json')) continue;

            const defType = definitionFile.replace('.json', '');
            const definitionsData = await loadJsonSafe<any>(path.join(definitionsPath, definitionFile));
            if (definitionsData) {
                // Dynamic Transformation: Split combined attributes using '/' (e.g. "Add/Replace/Delete")
                const keys = Object.keys(definitionsData);
                for (const key of keys) {
                    if (key.indexOf('/') !== -1) {
                        const originalDef = definitionsData[key];
                        const parts = key.split('/');

                        // Remove the generic combined key
                        delete definitionsData[key];

                        for (const part of parts) {
                            // Clone original definition, replace Name and Description with part-specific values
                            let newDesc = originalDef.Description || '';
                            // Build regex to match any permutation of parts joined by / (case-insensitive)
                            // e.g., matches "ADD/Delete/Replace", "Add/Replace/Delete", etc.
                            // Pattern: (part1|part2|part3)/(part1|part2|part3)/(part1|part2|part3) 
                            const escapedParts = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                            const anyPart = `(?:${escapedParts.join('|')})`;
                            const regexPattern = Array(parts.length).fill(anyPart).join('[/]');
                            newDesc = newDesc.replace(new RegExp(regexPattern, 'gi'), part);

                            const newDef = {
                                ...originalDef,
                                Name: part,
                                Description: newDesc,
                                Parameters: originalDef.Parameters ? [...originalDef.Parameters] : []
                            };

                            definitionsData[part] = newDef;
                        }
                    }
                }

                const defs: TDLDefinition[] = [];
                for (const defName of Object.keys(definitionsData)) {
                    const def = TDLDefinition.FromJSON(definitionsData[defName]);
                    defs.push(def);

                    // Extract and cache keywords from parameters
                    for (const param of def.Parameters) {
                        if (param.KeywordSet && param.Keywords) {
                            if (!this.keywordSets.has(param.KeywordSet)) {
                                const keywords = param.Keywords.split(',').map(k => k.trim());
                                this.keywordSets.set(param.KeywordSet, keywords);
                            }
                        }
                    }
                }
                this.definitions.set(defType, defs);
            }
        }
    }

    private async loadSchemas(versionPath: string) {
        const schemasPath = path.join(versionPath, "Schema");
        if (!fs.existsSync(schemasPath)) return;

        const schemaFiles = await fsasync.readdir(schemasPath);
        for (const schemaFile of schemaFiles) {
            if (schemaFile == "index.json") continue;
            if (schemaFile === "AllSchemas.json") {
                const allSchs = await loadJsonSafe<string[]>(path.join(schemasPath, schemaFile));
                if (allSchs) this.allSchemas = allSchs;
                continue;
            }
            if (!schemaFile.endsWith('.json')) continue;

            const schemaName = schemaFile.replace('.json', '');
            const schemaData = await loadJsonSafe<any>(path.join(schemasPath, schemaFile));
            if (schemaData) {
                const schema = TDLSchema.FromJSON(schemaName, schemaData);
                this.schemas.set(schemaName, schema);
                if (schema.IsPrimary) {
                    this.primarySchemaNames.push(schemaName);
                }
            }
        }
    }

    private async loadExistingDefinitions(versionPath: string) {
        const existingPath = path.join(versionPath, "ExistingDefinitions");
        if (!fs.existsSync(existingPath)) return;

        const existingFiles = await fsasync.readdir(existingPath);
        for (const existingFile of existingFiles) {
            if (!existingFile.endsWith('.json')) continue;

            const defName = existingFile.replace('.json', '');
            const defData = await loadJsonSafe<string[]>(path.join(existingPath, existingFile));
            if (defData && Array.isArray(defData)) {
                this.existingDefinitions.set(defName, defData);
            }
        }
    }

    // Helper methods to find metadata - O(1) Lookups

    findFunction(name: string): TDLFunction | undefined {
        if (!name) return undefined;
        return this._functionsByName.get(name.toLowerCase());
    }

    findAction(name: string): TDLAction | undefined {
        if (!name) return undefined;
        return this._actionsByName.get(name.toLowerCase());
    }

    findDefinition(name: string, defType?: string): TDLDefinition | undefined {
        if (!name) return undefined;

        // If defType is provided, we still check the fast map, 
        // but we verify the found definition actually belongs to that type.
        const found = this._definitionsByName.get(name.toLowerCase());

        if (found && defType) {
            // Verify it belongs to the requested defType
            const defsForType = this.definitions.get(defType);
            if (defsForType && defsForType.includes(found)) {
                return found;
            }
            // Edge case: Multiple types might have same alias, fallback to original logic for safety
            return defsForType?.find(d =>
                d.Name.toLowerCase() === name.toLowerCase() ||
                d.Aliases?.toLowerCase().split(',').map(a => a.trim()).includes(name.toLowerCase())
            );
        }

        return found;
    }

    findSchema(name: string): TDLSchema | undefined {
        if (!name) return undefined;
        return this._schemasByName.get(name.toLowerCase());
    }

    getDefinitionsForType(defType: string): TDLDefinition[] {
        return this.definitions.get(defType) || [];
    }
}