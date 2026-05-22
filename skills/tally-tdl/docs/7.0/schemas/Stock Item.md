# Stock Item Schema

> **Version**: 7.0

Reference documentation for the **Stock Item** schema.

### Meta

- **Aliases**: Stock Items
- **SDF Id**: SI
- **Is Primary**: Yes

> **Total Properties**: 240

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Accountaudit Entries** | Yes | No | [Accountaudit Entries](Accountaudit%20Entries.md) |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Actual Purc Qty** | No | No | Quantity |
| **Actual Sale Qty** | No | No | Quantity |
| **Additional Ledgers** | Yes | No | [Additional Ledgers](Additional%20Ledgers.md) |
| **Additional Units** | No | No | String (Master Reference) |
| **Addl Inward Value** | No | No | Amount |
| **Addl Outward Value** | No | No | Amount |
| **Addlexternalinward Value** | No | No | Amount |
| **Addlexternaloutward Value** | No | No | Amount |
| **Addlinternalinward Value** | No | No | Amount |
| **Addlinternaloutward Value** | No | No | Amount |
| **Adjdiffinfirstpurcledger** | No | No | Logical |
| **Adjdiffinfirstsaleledger** | No | No | Logical |
| **Allow Use Of Expired Items** | No | No | Logical |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Avgpurccost** | No | No | Rate |
| **Avgpurcprice** | No | No | Rate |
| **Avgsaleprice** | No | No | Rate |
| **Base Units** | No | No | String (Master Reference) |
| **Basic Qty** | No | No | Quantity |
| **Basic Rate Of Excise** | No | No | Number |
| **Basic Tariff Type** | No | No | String (Master Reference) |
| **Basic Value** | No | No | Amount |
| **Batch Allocations** | Yes | No | [Item Batch Allocations](Item%20Batch%20Allocations.md) |
| **Billed Purc Qty** | No | No | Quantity |
| **Billed Sale Qty** | No | No | Quantity |
| **Calconmrp** | No | No | Logical |
| **Can Delete** | No | No | Logical |
| **Category** | No | No | String (Master Reference) |
| **Category Hierarchy** | No | Yes | String |
| **Closing Balance** | No | No | Quantity |
| **Closing Rate** | No | No | Rate |
| **Closing Value** | No | No | Amount |
| **Component List** | Yes | No | [Component List](Component%20List.md) |
| **Conversion** | No | No | Number |
| **Costing Method** | No | No | String (Sysname) |
| **Denominator** | No | No | Number |
| **Depth** | No | No | Number |
| **Description** | No | No | String |
| **Enteredby** | No | No | String |
| **Entrytaxapplicable** | No | No | Logical |
| **Entrytaxcommodity** | No | No | String (Master Reference) |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Estimate** | No | No | Rate |
| **Excise Item Classification** | No | No | String |
| **Excise Tariff Details** | Yes | No | [Excise Tariff Details](Excise%20Tariff%20Details.md) |
| **Exciseapplicability** | No | No | String (Sysname) |
| **Exciseitemgodown** | Yes | No | [Exciseitemgodown](Exciseitemgodown.md) |
| **Excisetaxtype** | No | No | String (Sysname) |
| **Exclude Jrnl For Valuation** | No | No | Logical |
| **Excludedtaxations** | Yes | No | [Excludedtaxations](Excludedtaxations.md) |
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
| **First Voucher Date** | No | No | Date |
| **Fullpricelist** | Yes | No | [Fullpricelist](Fullpricelist.md) |
| **Gstapplicable** | No | No | String (Sysname) |
| **Gstcalcslabonmrp** | No | No | Logical |
| **Gstconvunit** | No | No | String (Master Reference) |
| **Gstdetails** | Yes | No | [Gstdetails](Gstdetails.md) |
| **Gstitemunits** | No | No | Number |
| **Gstrepunits** | No | No | Number |
| **Gstrepuom** | No | No | String |
| **Gsttypeofsupply** | No | No | String (Sysname) |
| **Guid** | No | No | String |
| **Gvatisexciseappl** | No | No | Logical |
| **Has Mfg Date** | No | No | Logical |
| **Hsn Details** | Yes | No | [Hsn Details](Hsn%20Details.md) |
| **Ignore Batches** | No | No | Logical |
| **Ignore Godowns** | No | No | Logical |
| **Ignore Negative Stock** | No | No | Logical |
| **Ignore Physical Difference** | No | No | Logical |
| **Inclusivetax** | No | No | Logical |
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
| **Is Deemed Positive** | No | No | Logical |
| **Is Mrp Incl Of Tax** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isadditionaltax** | No | No | Logical |
| **Isaddltaxexempt** | No | No | Logical |
| **Isbatchwiseon** | No | No | Logical |
| **Iscessexempted** | No | No | Logical |
| **Iscostcentreson** | No | No | Logical |
| **Iscosttrackingon** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Iseditlogpresent** | No | No | Logical |
| **Isexcisecalculateonmrp** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isperishableon** | No | No | Logical |
| **Israteinclusivevat** | No | No | Logical |
| **Issupplementrydutyon** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Job Outward Quantity** | No | No | Quantity |
| **Job Outward Value** | No | No | Amount |
| **Journalinqty** | No | No | Quantity |
| **Journalinvalue** | No | No | Amount |
| **Journaloutqty** | No | No | Quantity |
| **Journaloutvalue** | No | No | Amount |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Last Purc Cost** | No | No | Rate |
| **Last Purc Date** | No | No | Date |
| **Last Purc Party** | No | No | String |
| **Last Purc Price** | No | No | Rate |
| **Last Purc Qty** | No | No | Quantity |
| **Last Sale Date** | No | No | Date |
| **Last Sale Party** | No | No | String |
| **Last Sale Price** | No | No | Rate |
| **Last Sale Qty** | No | No | Quantity |
| **Last Voucher Date** | No | No | Date |
| **Lbtdetails** | Yes | No | [Lbtdetails](Lbtdetails.md) |
| **Ledger Name** | No | No | String (Master Reference) |
| **Manufacturing Credit Amount** | No | No | Amount |
| **Manufacturing Debit Amount** | No | No | Amount |
| **Manufacturing In Quantity** | No | No | Quantity |
| **Manufacturing Out Quantity** | No | No | Quantity |
| **Masterid** | No | No | Number (Integer) |
| **Mastertype** | No | No | String |
| **Minimumorder** | No | No | Quantity |
| **Minimumorderbase** | No | No | Quantity |
| **Minorderashigher** | No | No | Logical |
| **Minorderperiod** | No | No | String (Sysname) |
| **Minorderperiodlength** | No | No | Number (Integer) |
| **Minorderroundlimit** | No | No | Number |
| **Minorderroundtype** | No | No | String (Sysname) |
| **Modifymrprate** | No | No | Logical |
| **Mrpdetails** | Yes | No | [Mrpdetails](Mrpdetails.md) |
| **Multicomponentlist** | Yes | No | [Multicomponentlist](Multicomponentlist.md) |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Natureofitem** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Old Basic Tariff Type** | No | No | String |
| **Oldauditentries** | Yes | No | [Audit Entries](Audit%20Entries.md) |
| **Oldauditentryids** | No | Yes | Number (Integer) |
| **Oldmrpdetails** | Yes | No | [Oldmrpdetails](Oldmrpdetails.md) |
| **Opening Balance** | No | No | Quantity |
| **Opening Rate** | No | No | Rate |
| **Opening Value** | No | No | Amount |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Outward Quantity** | No | No | Quantity |
| **Outward Value** | No | No | Amount |
| **Parent** | No | No | String (Master Reference) |
| **Parent Hierarchy** | No | Yes | String |
| **Part No** | No | Yes | String |
| **Po Due** | No | No | Quantity |
| **Po Duevalue** | No | No | Amount |
| **Po Total** | No | No | Quantity |
| **Po Totalvalue** | No | No | Amount |
| **Price Level** | No | No | String |
| **Price Level Date** | No | No | Date |
| **Pricelevellist** | Yes | No | [Pricelevellist](Pricelevellist.md) |
| **Purchaselist** | Yes | No | [Voucher Class Ledger List](Voucher%20Class%20Ledger%20List.md) |
| **Purcqty** | No | No | Quantity |
| **Purcvalue** | No | No | Amount |
| **Rate Of Mrp** | No | No | Number |
| **Rate Of Sat** | No | No | Number |
| **Rate Of Vat** | No | No | Number |
| **Rateofentrytax** | No | No | Number |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Reorderashigher** | No | No | Logical |
| **Reorderbase** | No | No | Quantity |
| **Reorderlevel** | No | No | Quantity |
| **Reorderperiod** | No | No | String (Sysname) |
| **Reorderperiodlength** | No | No | Number (Integer) |
| **Reorderroundlimit** | No | No | Number |
| **Reorderroundtype** | No | No | String (Sysname) |
| **Reporting Uom Details** | Yes | No | [Reporting Uom Details](Reporting%20Uom%20Details.md) |
| **Requestorrule** | No | No | String |
| **Saleqty** | No | No | Quantity |
| **Saleslist** | Yes | No | [Voucher Class Ledger List](Voucher%20Class%20Ledger%20List.md) |
| **Salestaxcessapplicable** | No | No | String (Sysname) |
| **Salestaxcessdetails** | Yes | No | [Salestaxcessdetails](Salestaxcessdetails.md) |
| **Salevalue** | No | No | Amount |
| **Schvidetails** | Yes | No | [Schvidetails](Schvidetails.md) |
| **Servicetaxapplicable** | No | No | String (Sysname) |
| **Servicetaxdetails** | Yes | No | [Servicetaxdetails](Servicetaxdetails.md) |
| **So Due** | No | No | Quantity |
| **So Duevalue** | No | No | Amount |
| **So Total** | No | No | Quantity |
| **So Totalvalue** | No | No | Amount |
| **Sort Position** | No | No | Number (Integer) |
| **Standard Cost** | No | No | Rate |
| **Standard Cost List** | Yes | No | [Costpricelist](Costpricelist.md) |
| **Standard Price** | No | No | Rate |
| **Standard Price List** | Yes | No | [Costpricelist](Costpricelist.md) |
| **Targetremoteid** | No | Yes | String |
| **Tax Classification Name** | No | No | String (Master Reference) |
| **Tcsapplicable** | No | No | String (Sysname) |
| **Tcscategory** | No | No | String |
| **Tcscategorydetails** | Yes | No | [Tdscategorydetails](Tdscategorydetails.md) |
| **Tdsapplicable** | No | No | String (Sysname) |
| **Tdscategorydetails** | Yes | No | [Tdscategorydetails](Tdscategorydetails.md) |
| **Trader Excise Duties** | Yes | No | [Trader Excise Duties](Trader%20Excise%20Duties.md) |
| **Transfer Credit Amount** | No | No | Amount |
| **Transfer Debit Amount** | No | No | Amount |
| **Transfer In Quantity** | No | No | Quantity |
| **Transfer Out Quantity** | No | No | Quantity |
| **Treat Purchases As Consumed** | No | No | Logical |
| **Treat Rejects As Scrap** | No | No | Logical |
| **Treat Sales As Manufactured** | No | No | Logical |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Valuation Method** | No | No | String (Sysname) |
| **Vatactualratio** | No | No | Number |
| **Vatapplicable** | No | No | String (Sysname) |
| **Vatbaseno** | No | No | Number |
| **Vatbaseunit** | No | No | String |
| **Vatclassificationdetails** | Yes | No | [Vatclassificationdet](Vatclassificationdet.md) |
| **Vatcommodity** | No | No | String (Master Reference) |
| **Vatdetails** | Yes | No | [Vatdetails](Vatdetails.md) |
| **Vatschdlentrtyno** | No | No | String |
| **Vattrailno** | No | No | Number |
| **Vattrailunit** | No | No | String |
