# Tariff Classification Schema

> **Version**: 7.0

Reference documentation for the **Tariff Classification** schema.

### Meta

- **Aliases**: Tariff Classifications
- **SDF Id**: TC
- **Is Primary**: Yes

> **Total Properties**: 40

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Can Delete** | No | No | Logical |
| **Commodityname** | No | No | String |
| **Commodityvatrate** | No | No | Number (Integer) |
| **Enteredby** | No | No | String |
| **Entrytaxschedulenumber** | No | No | String |
| **Entrytaxscheduleserialnumber** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Excise Tariff Details** | Yes | No | [Excise Tariff Details](Excise%20Tariff%20Details.md) |
| **Guid** | No | No | String |
| **Hsn** | No | No | String |
| **Is Security On When Entered** | No | No | Logical |
| **Isactive** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
| **Note** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Schedulenumber** | No | No | String |
| **Scheduleserialnumber** | No | No | String |
| **Sort Position** | No | No | Number (Integer) |
| **Targetremoteid** | No | Yes | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Usedfor** | No | No | String (Sysname) |
| **Vatcommoditycode** | No | No | String |
| **Vattradecode** | No | No | String |
