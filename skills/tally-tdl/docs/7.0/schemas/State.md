# State Schema

> **Version**: 7.0

Reference documentation for the **State** schema.

### Meta

- **Aliases**: States
- **SDF Id**: ST
- **Is Primary**: Yes

> **Total Properties**: 38

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Can Delete** | No | No | Logical |
| **Depth** | No | No | Number |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Guid** | No | No | String |
| **Is Country** | No | No | Logical |
| **Is Deemed Positive** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Iszone** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Mark For Deletion** | No | No | Logical |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Previous Name** | No | Yes | String |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Sort Position** | No | No | Number (Integer) |
| **State Code** | No | No | String |
| **State Period** | Yes | No | [State Period](State%20Period.md) |
| **Targetremoteid** | No | Yes | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Zonestatename** | No | No | String (Master Reference) |
