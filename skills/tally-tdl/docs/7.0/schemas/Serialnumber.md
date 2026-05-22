# Serialnumber Schema

> **Version**: 7.0

Reference documentation for the **Serialnumber** schema.

### Meta

- **Aliases**: Serial Numbers
- **SDF Id**: SN
- **Is Primary**: Yes

> **Total Properties**: 36

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Beginning Number** | No | No | Number (Integer) |
| **Can Delete** | No | No | Logical |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Exciseformtype** | No | No | String (Sysname) |
| **Guid** | No | No | String |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
| **Numbering Method** | No | No | String (Sysname) |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Prefill Zero** | No | No | Logical |
| **Prefix List** | Yes | No | [Prefix Suffix List](Prefix%20Suffix%20List.md) |
| **Prevent Duplicates** | No | No | Logical |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Restart From List** | Yes | No | [Restart From List](Restart%20From%20List.md) |
| **Sort Position** | No | No | Number (Integer) |
| **Suffix List** | Yes | No | [Prefix Suffix List](Prefix%20Suffix%20List.md) |
| **Targetremoteid** | No | Yes | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Width Of Number** | No | No | Number (Integer) |
