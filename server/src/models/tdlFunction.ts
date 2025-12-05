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
        const TDLFunctionParam = new TDLFunctionParameter();
        TDLFunctionParam.Type = funcParam.DataType;
        if (funcParam.IsConstant) {
            TDLFunctionParam.IsConstant = funcParam.IsConstant;
        }
        TDLFunctionParam.IsOptional = funcParam["Is Mandatory"] === "No";
        return TDLFunctionParam;
    }
    Type!: string;
    IsOptional: boolean = false;
    IsVariableArgument: boolean = false;
    KeywordSet: string | undefined;
    RefersTo: string | undefined;
    IsConstant: boolean = false;
}