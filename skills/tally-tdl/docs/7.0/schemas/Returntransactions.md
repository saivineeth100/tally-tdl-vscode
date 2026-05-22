# Returntransactions Schema

> **Version**: 7.0

Reference documentation for the **Returntransactions** schema.

### Meta

- **SDF Id**: RT
- **Is Primary**: Yes

> **Total Properties**: 46

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Alteredby** | No | No | String |
| **Alteredon** | No | No | Date |
| **Alterid** | No | No | Number (Integer) |
| **Arn** | No | No | String |
| **Arn Date** | No | No | Date |
| **Audited On** | No | No | Date |
| **Can Delete** | No | No | Logical |
| **Contributingvoucher** | Yes | No | [Contri Trans](Contri%20Trans.md) |
| **Download Status** | No | No | String (Sysname) |
| **Enteredby** | No | No | String |
| **Exchangeable** | No | No | Logical |
| **Filing Refid** | No | No | String |
| **Filing Status** | No | No | String (Sysname) |
| **Fromdate** | No | No | Date |
| **Guid** | No | No | String |
| **Isdirty** | No | No | Logical |
| **Isfetchedonly** | No | No | Logical |
| **Isinvalid** | No | No | Logical |
| **Isreconciled** | No | No | Logical |
| **Issigned** | No | No | Logical |
| **Issubmitted** | No | No | Logical |
| **Issystemret** | No | No | Logical |
| **Masterid** | No | No | Number (Integer) |
| **Noreturnondisk** | No | No | Logical |
| **Period** | No | No | Date |
| **Pftdlversioninfo** | Yes | No | [Platformversioninfo](Platformversioninfo.md) |
| **Reconstate** | No | No | String (Sysname) |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Remotesumkey** | No | No | String |
| **Requestorrule** | No | No | String |
| **Returnfrequency** | No | No | String (Sysname) |
| **Returnstatus** | No | No | String (Sysname) |
| **Returntranskey** | No | No | String |
| **Returntranspurpose** | No | No | String (Sysname) |
| **Returntype** | No | No | String (Sysname) |
| **Signing Method** | No | No | String (Sysname) |
| **Signing Value** | No | No | String |
| **Stateofreturn** | No | No | String (Sysname) |
| **Sumisfromsync** | No | No | Logical |
| **Taxunit** | No | No | String (Master Reference) |
| **Todate** | No | No | Date |
| **Tppayload** | No | No | String |
| **Updatetype** | No | No | String (Sysname) |
| **User Subaction** | No | No | String (Sysname) |
