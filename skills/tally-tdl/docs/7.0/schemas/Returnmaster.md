# Returnmaster Schema

> **Version**: 7.0

Reference documentation for the **Returnmaster** schema.

### Meta

- **Aliases**: ReturnMasters
- **SDF Id**: RM
- **Is Primary**: Yes

> **Total Properties**: 26

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Can Delete** | No | No | Logical |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Guid** | No | No | String |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Sort Position** | No | No | Number (Integer) |
| **Summaryallocs** | Yes | No | [Summaryallocs](Summaryallocs.md) |
| **Targetremoteid** | No | Yes | String |
| **Tax Type** | No | No | String (Sysname) |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
