# Attendance Type Schema

> **Version**: 7.0

Reference documentation for the **Attendance Type** schema.

### Meta

- **Aliases**: AttendanceTypes
- **SDF Id**: AT
- **Is Primary**: Yes

> **Total Properties**: 40

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Attendance Period** | No | No | String (Sysname) |
| **Attendance Production Type** | No | No | String (Sysname) |
| **Base Units** | No | No | String (Master Reference) |
| **Can Delete** | No | No | Logical |
| **Depth** | No | No | Number |
| **Displayname** | No | No | String |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Guid** | No | No | String |
| **Is Deemed Positive** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Iscombinedobj** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Israngefilterobj** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
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
| **Showinreport** | No | No | Logical |
| **Sort Position** | No | No | Number (Integer) |
| **Targetremoteid** | No | Yes | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
