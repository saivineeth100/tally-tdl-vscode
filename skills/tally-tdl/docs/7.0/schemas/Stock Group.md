# Stock Group Schema

> **Version**: 7.0

Reference documentation for the **Stock Group** schema.

### Meta

- **Aliases**: Stock Groups
- **SDF Id**: SG
- **Is Primary**: Yes

> **Total Properties**: 120

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Additional Units** | No | No | String (Master Reference) |
| **Addl Inward Value** | No | No | Amount |
| **Addl Outward Value** | No | No | Amount |
| **Addlexternalinward Value** | No | No | Amount |
| **Addlexternaloutward Value** | No | No | Amount |
| **Addlinternalinward Value** | No | No | Amount |
| **Addlinternaloutward Value** | No | No | Amount |
| **Allow Use Of Expired Items** | No | No | Logical |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Base Units** | No | No | String (Master Reference) |
| **Can Delete** | No | No | Logical |
| **Closing Balance** | No | No | Quantity |
| **Closing Value** | No | No | Amount |
| **Conversion** | No | No | Number |
| **Costing Method** | No | No | String (Sysname) |
| **Denominator** | No | No | Number |
| **Depth** | No | No | Number |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Excise Tariff Details** | Yes | No | [Excise Tariff Details](Excise%20Tariff%20Details.md) |
| **Excisetaxtype** | No | No | String (Sysname) |
| **Externalclosingbalance** | No | No | Quantity |
| **Externalclosingrate** | No | No | Rate |
| **Externalclosingvalue** | No | No | Amount |
| **Externalinward Quantity** | No | No | Quantity |
| **Externalinward Value** | No | No | Amount |
| **Externalopeningbalance** | No | No | Quantity |
| **Externalopeningrate** | No | No | Rate |
| **Externalopeningvalue** | No | No | Amount |
| **Externaloutward Quantity** | No | No | Quantity |
| **Externaloutward Value** | No | No | Amount |
| **Gstapplicable** | No | No | String (Sysname) |
| **Gstdetails** | Yes | No | [Gstdetails](Gstdetails.md) |
| **Guid** | No | No | String |
| **Has Mfg Date** | No | No | Logical |
| **Hsn Details** | Yes | No | [Hsn Details](Hsn%20Details.md) |
| **Ignore Batches** | No | No | Logical |
| **Ignore Godowns** | No | No | Logical |
| **Ignore Negative Stock** | No | No | Logical |
| **Ignore Physical Difference** | No | No | Logical |
| **Internalclosingbalance** | No | No | Quantity |
| **Internalclosingrate** | No | No | Rate |
| **Internalclosingvalue** | No | No | Amount |
| **Internalinward Quantity** | No | No | Quantity |
| **Internalinward Value** | No | No | Amount |
| **Internalopeningbalance** | No | No | Quantity |
| **Internalopeningrate** | No | No | Rate |
| **Internalopeningvalue** | No | No | Amount |
| **Internaloutward Quantity** | No | No | Quantity |
| **Internaloutward Value** | No | No | Amount |
| **Inward Quantity** | No | No | Quantity |
| **Inward Value** | No | No | Amount |
| **Io Total** | No | No | Quantity |
| **Is Addable** | No | No | Logical |
| **Is Deemed Positive** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isbatchwiseon** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Iseditlogpresent** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isperishableon** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Job Outward Quantity** | No | No | Quantity |
| **Job Outward Value** | No | No | Amount |
| **Journalinqty** | No | No | Quantity |
| **Journalinvalue** | No | No | Amount |
| **Journaloutqty** | No | No | Quantity |
| **Journaloutvalue** | No | No | Amount |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Masterid** | No | No | Number (Integer) |
| **Mastertype** | No | No | String |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Opening Balance** | No | No | Quantity |
| **Opening Value** | No | No | Amount |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Outward Quantity** | No | No | Quantity |
| **Outward Value** | No | No | Amount |
| **Parent** | No | No | String (Master Reference) |
| **Parent Hierarchy** | No | Yes | String |
| **Po Due** | No | No | Quantity |
| **Po Duevalue** | No | No | Amount |
| **Po Total** | No | No | Quantity |
| **Po Totalvalue** | No | No | Amount |
| **Purcqty** | No | No | Quantity |
| **Purcvalue** | No | No | Amount |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Saleqty** | No | No | Quantity |
| **Salestaxcessdetails** | Yes | No | [Salestaxcessdetails](Salestaxcessdetails.md) |
| **Salevalue** | No | No | Amount |
| **Schvidetails** | Yes | No | [Schvidetails](Schvidetails.md) |
| **Servicetaxdetails** | Yes | No | [Servicetaxdetails](Servicetaxdetails.md) |
| **So Due** | No | No | Quantity |
| **So Duevalue** | No | No | Amount |
| **So Total** | No | No | Quantity |
| **So Totalvalue** | No | No | Amount |
| **Sort Position** | No | No | Number (Integer) |
| **Targetremoteid** | No | Yes | String |
| **Tcsapplicable** | No | No | String (Sysname) |
| **Tcscategorydetails** | Yes | No | [Tdscategorydetails](Tdscategorydetails.md) |
| **Tdsapplicable** | No | No | String (Sysname) |
| **Tdscategorydetails** | Yes | No | [Tdscategorydetails](Tdscategorydetails.md) |
| **Treat Purchases As Consumed** | No | No | Logical |
| **Treat Rejects As Scrap** | No | No | Logical |
| **Treat Sales As Manufactured** | No | No | Logical |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Valuation Method** | No | No | String (Sysname) |
| **Vatdetails** | Yes | No | [Vatdetails](Vatdetails.md) |
