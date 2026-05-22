# Budget Schema

> **Version**: 7.0

Reference documentation for the **Budget** schema.

### Meta

- **Aliases**: Budgets
- **SDF Id**: BU
- **Is Primary**: Yes

> **Total Properties**: 43

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Budget Periods** | Yes | No | [Budget Periods](Budget%20Periods.md) |
| **Can Delete** | No | No | Logical |
| **Depth** | No | No | Number |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Exclude List** | Yes | No | [Budget Vouchertype List](Budget%20Vouchertype%20List.md) |
| **Exclude Unaccounted List** | Yes | No | [Budget Vouchertype List](Budget%20Vouchertype%20List.md) |
| **Excludeforex** | No | No | Logical |
| **Excludetracking** | No | No | Logical |
| **Guid** | No | No | String |
| **Include List** | Yes | No | [Budget Vouchertype List](Budget%20Vouchertype%20List.md) |
| **Include Unaccounted List** | Yes | No | [Budget Vouchertype List](Budget%20Vouchertype%20List.md) |
| **Is Deemed Positive** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isscenario** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Parent** | No | No | String (Master Reference) |
| **Parent Hierarchy** | No | Yes | String |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Sort Position** | No | No | Number (Integer) |
| **Targetremoteid** | No | Yes | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Useactuals** | No | No | Logical |
