# Voucher Number Series Schema

> **Version**: 7.0

Reference documentation for the **Voucher Number Series** schema.

### Meta

- **SDF Id**: VS
- **Is Primary**: Yes

> **Total Properties**: 36

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Additional Name** | No | No | String |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Beginning Number** | No | No | Number (Integer) |
| **Can Delete** | No | No | Logical |
| **Duplicatecontrol** | No | No | String (Sysname) |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Numbering Method** | No | No | String (Sysname) |
| **Numbering Submethod** | No | No | String (Sysname) |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Parent** | No | No | String (Master Reference) |
| **Parent Hierarchy** | No | Yes | String |
| **Prefill Zero** | No | No | Logical |
| **Prefix List** | Yes | No | [Prefix Suffix List](Prefix%20Suffix%20List.md) |
| **Prevent Duplicates** | No | No | Logical |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Restart From List** | Yes | No | [Restart From List](Restart%20From%20List.md) |
| **Sort Position** | No | No | Number (Integer) |
| **Suffix List** | Yes | No | [Prefix Suffix List](Prefix%20Suffix%20List.md) |
| **Targetremoteid** | No | Yes | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Use Deleted Vchnum** | No | No | Logical |
| **Width Of Number** | No | No | Number (Integer) |
