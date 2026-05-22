# Godown Schema

> **Version**: 7.0

Reference documentation for the **Godown** schema.

### Meta

- **Aliases**: Godowns
- **SDF Id**: GO
- **Is Primary**: Yes

> **Total Properties**: 106

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Addl Inward Value** | No | No | Amount |
| **Addl Outward Value** | No | No | Amount |
| **Address** | No | Yes | String |
| **Allow Export Rebate** | No | No | Logical |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Are1serialmaster** | No | No | String (Master Reference) |
| **Are2serialmaster** | No | No | String (Master Reference) |
| **Are3serialmaster** | No | No | String (Master Reference) |
| **Asoriginal** | No | No | Logical |
| **Authorityaddress** | No | No | String |
| **Authorityname** | No | No | String |
| **Bonddateofissue** | No | No | Date |
| **Bondexpirydate** | No | No | Date |
| **Bondnumber** | No | No | String |
| **Can Delete** | No | No | Logical |
| **Closing Balance** | No | No | Quantity |
| **Closing Value** | No | No | Amount |
| **Depth** | No | No | Number |
| **Enableexport** | No | No | Logical |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Excise Commissionerate** | No | No | String |
| **Excise Division Code** | No | No | String |
| **Excise Range Code** | No | No | String |
| **Excise Regnumber** | No | No | String |
| **Excise Tariff Details** | Yes | No | [Excise Tariff Details](Excise%20Tariff%20Details.md) |
| **Excisearename** | No | No | String (Sysname) |
| **Excisebonddetails** | Yes | No | [Excisebonddetails](Excisebonddetails.md) |
| **Excisecommissioneratedetails** | Yes | No | [Excisecommissioneratedetails](Excisecommissioneratedetails.md) |
| **Excisecomsnrateaddress** | No | No | String |
| **Excisecomsnratecode** | No | No | String |
| **Excisedivisionaddress** | No | No | String |
| **Excisedivisiondetails** | Yes | No | [Excisedivisiondetails](Excisedivisiondetails.md) |
| **Excisedivisionname** | No | No | String |
| **Exciselargetaxpayer** | No | No | String |
| **Exciselutdetails** | Yes | No | [Exciselutdetails](Exciselutdetails.md) |
| **Excisemailingname** | No | No | String |
| **Excisemanufacturertype** | No | No | String (Sysname) |
| **Excisemfgdetails** | Yes | No | [Excisemfgdetails](Excisemfgdetails.md) |
| **Exciserange** | No | No | String |
| **Exciserangeaddress** | No | No | String |
| **Exciserangedetails** | Yes | No | [Exciserangedetails](Exciserangedetails.md) |
| **Exciseregistrationdate** | No | No | Date |
| **Exciseregistrationtype** | No | No | String (Sysname) |
| **Guid** | No | No | String |
| **Has No Space** | No | No | Logical |
| **Has No Stock** | No | No | Logical |
| **Importerexportercode** | No | No | String |
| **Inward Quantity** | No | No | Quantity |
| **Inward Value** | No | No | Amount |
| **Is Deemed Positive** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Isexternal** | No | No | Logical |
| **Isinternal** | No | No | Logical |
| **Ismigratedfortaxunit** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isprimaryexciseunit** | No | No | Logical |
| **Istraderrgnumberon** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Itemstate** | No | No | String |
| **Job Name** | No | No | String (Master Reference) |
| **Job Outward Quantity** | No | No | Quantity |
| **Job Outward Value** | No | No | Amount |
| **Journalinqty** | No | No | Quantity |
| **Journalinvalue** | No | No | Amount |
| **Journaloutqty** | No | No | Quantity |
| **Journaloutvalue** | No | No | Amount |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Lutdateofissue** | No | No | Date |
| **Lutexpirydate** | No | No | Date |
| **Lutnumber** | No | No | String |
| **Masterid** | No | No | Number (Integer) |
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
| **Phonenumber** | No | No | String |
| **Pin Code** | No | No | String |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Schvidetails** | Yes | No | [Schvidetails](Schvidetails.md) |
| **Serialnumberlist** | Yes | No | [Serialnumberlist](Serialnumberlist.md) |
| **Sort Position** | No | No | Number (Integer) |
| **State Name** | No | No | String (Sysname) |
| **Targetremoteid** | No | Yes | String |
| **Taxunitname** | No | No | String (Master Reference) |
| **Traderrgnoprefix** | No | No | String |
| **Traderrgnosuffix** | No | No | String |
| **Typeofconsignmentagent** | No | No | String (Sysname) |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
