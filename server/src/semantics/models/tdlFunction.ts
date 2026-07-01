export class TDLFunction {
    static FromJSON(tfunction: any): TDLFunction {
        const tdlFunction = new TDLFunction();
        tdlFunction.Name = tfunction.Name;
        tdlFunction.Description = tfunction.Description;
        tdlFunction.ReturnType = tfunction.Meta["Return Type"];
        tdlFunction.TotalParameters = parseInt(tfunction.Meta["Total Parameters"]);
        tdlFunction.TotalMandatoryParameters = parseInt(tfunction.Meta["Total Mandatory Parameters"]);;
        tdlFunction.Mode = tfunction.Meta["Execution Mode"];
        tdlFunction.Category = tfunction.Meta["Category"];

        for (const funcParam of tfunction.Parameters) {


            tdlFunction.Parameters.push(TDLFunctionParameter.FromJSON(funcParam));
        }

        return tdlFunction;
    }
    Name!: string;
    Description: string | undefined;
    Parameters: TDLFunctionParameter[] = [];
    ReturnType!: string;
    TotalParameters: number = 0;
    TotalMandatoryParameters: number = 0;
    Aliases: string | undefined;
    Category!: string;
    Mode!: "Edit" | "Both" | "Display";
}
export class TDLFunctionParameter {
    static FromJSON(funcParam: any): TDLFunctionParameter {
        const param = new TDLFunctionParameter();
        param.ParameterType = funcParam["Parameter Type"];
        param.DataType = funcParam.Datatype || funcParam.DataType;
        param.IsMandatory = funcParam["Is Mandatory"] === "Yes";
        param.IsOptional = funcParam["Is Mandatory"] === "No";
        param.IsConstant = funcParam["Is Constant"] === "Yes";
        param.IsVariableArgument = funcParam["Variable Argument"] === "Yes";
        param.RefersTo = funcParam["Refers To"];
        param.KeywordSet = funcParam["Keyword Set"];
        param.Keywords = funcParam.Keywords;
        return param;
    }
    ParameterType?: string;
    DataType?: string;
    IsMandatory: boolean = false;
    IsOptional: boolean = false;
    IsVariableArgument: boolean = false;
    KeywordSet?: string;
    Keywords?: string;
    RefersTo?: string;
    IsConstant: boolean = false;
    // Legacy alias for backwards compatibility
    get Type(): string | undefined { return this.DataType; }
}