# Merchant Profile Schema

> **Version**: 7.0

Reference documentation for the **Merchant Profile** schema.

### Meta

- **Aliases**: Merchant Profiles
- **SDF Id**: MP
- **Is Primary**: Yes

> **Total Properties**: 32

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Address** | No | Yes | String |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Can Delete** | No | No | Logical |
| **Can Link Persist** | No | No | String |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Gateway Name** | No | No | String |
| **Guid** | No | No | String |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Link Expiry Period** | No | No | Due Date |
| **Masterid** | No | No | Number (Integer) |
| **Merchant Email** | No | No | String |
| **Merchant Id** | No | No | String |
| **Merchant Mobile** | No | No | String |
| **Merchantname** | No | No | String |
| **Name** | No | Yes | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Sort Position** | No | No | Number (Integer) |
| **Targetremoteid** | No | Yes | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
