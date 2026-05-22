# Currency Schema

> **Version**: 7.0

Reference documentation for the **Currency** schema.

### Meta

- **Aliases**: Currencies
- **SDF Id**: CU
- **Is Primary**: Yes

> **Total Properties**: 45

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Can Delete** | No | No | Logical |
| **Daily Buying Rates** | Yes | No | [Exchange Rates](Exchange%20Rates.md) |
| **Daily Selling Rates** | Yes | No | [Exchange Rates](Exchange%20Rates.md) |
| **Daily Std Rates** | Yes | No | [Exchange Rates](Exchange%20Rates.md) |
| **Decimal Places** | No | No | Number (Integer) |
| **Decimal Places For Printing** | No | No | Number (Integer) |
| **Decimal Symbol** | No | No | String |
| **Depth** | No | No | Number |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Expanded Symbol** | No | No | String |
| **Formal Name** | No | No | String |
| **Guid** | No | No | String |
| **Has Space** | No | No | Logical |
| **In Millions** | No | No | Logical |
| **Is Deemed Positive** | No | No | Logical |
| **Is Reserved** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Is Suffix** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isocurrencycode** | No | No | String |
| **Isupdatingtargetid** | No | No | Logical |
| **Masterid** | No | No | Number (Integer) |
| **Narration** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Original Symbol** | No | No | String |
| **Originaldepth** | No | No | Number |
| **Originalsortposition** | No | No | Number |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Sort Position** | No | No | Number (Integer) |
| **Symbol** | No | No | String |
| **Targetremoteid** | No | Yes | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Used by Amount** | No | No | Logical |
