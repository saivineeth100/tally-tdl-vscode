# Sumtrans Inventory Entry Schema

> **Version**: 7.0

Reference documentation for the **Sumtrans Inventory Entry** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 127

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Sumvch Addlcostperc** | No | No | Number |
| **Sumvch Basic Num Packages** | No | No | String |
| **Sumvch Basic Package Marks** | No | No | String |
| **Sumvch Basic User Description** | No | Yes | String |
| **Sumvch Batch Allocations** | Yes | No | [Sumtrans Batch Allocations](Sumtrans%20Batch%20Allocations.md) |
| **Sumvch Bomname** | No | No | String |
| **Sumvch Cessassvalonclass** | No | No | Amount |
| **Sumvch Componentlisttype** | No | No | String (Sysname) |
| **Sumvch Content Neg Is Pos** | No | No | Logical |
| **Sumvch Description** | No | No | String |
| **Sumvch Discount** | No | No | Number |
| **Sumvch Displaynatureofcomponent** | No | No | String (Sysname) |
| **Sumvch Dutyheaddetails** | Yes | No | [Sumtrans Dutyheaddetails](Sumtrans%20Dutyheaddetails.md) |
| **Sumvch Eidiscountamt** | No | No | Amount |
| **Sumvch Escalationrate** | No | No | Rate |
| **Sumvch Excise Allocations** | Yes | No | [Sumtrans Excise Allocations](Sumtrans%20Excise%20Allocations.md) |
| **Sumvch Excise Exemption** | No | No | String |
| **Sumvch Excise Tariff** | No | No | String |
| **Sumvch Exciseassessablevalue** | No | No | Amount |
| **Sumvch Exciseclassificationname** | No | No | String (Master Reference) |
| **Sumvch Excisecreditcategory** | No | No | String |
| **Sumvch Excisecreditparty** | No | No | String |
| **Sumvch Excisecreditpendingqty** | No | No | Quantity |
| **Sumvch Excisecreditstkitem** | No | No | String |
| **Sumvch Excisemrpabatement** | No | No | Number |
| **Sumvch Excisemrprate** | No | No | Rate |
| **Sumvch Excisereturndutyrate** | No | No | Number |
| **Sumvch Excisereturninvoiceno** | No | No | String |
| **Sumvch Excisereturninvoiceqty** | No | No | Quantity |
| **Sumvch Excisesalesinvoiceno** | No | No | String |
| **Sumvch Expense Allocations** | Yes | No | [Sumtrans Expense Allocations](Sumtrans%20Expense%20Allocations.md) |
| **Sumvch Gst Source Type** | No | No | String (Sysname) |
| **Sumvch Gstassblvalue** | No | No | Amount |
| **Sumvch Gstdepgstclassification** | No | No | String (Master Reference) |
| **Sumvch Gstdephsnclassification** | No | No | String (Master Reference) |
| **Sumvch Gstgroupsource** | No | No | String (Master Reference) |
| **Sumvch Gsthsndescription** | No | No | String |
| **Sumvch Gsthsninferapplicability** | No | No | String (Sysname) |
| **Sumvch Gsthsnname** | No | No | String |
| **Sumvch Gstitemsource** | No | No | String (Master Reference) |
| **Sumvch Gstitemuqc** | No | No | String |
| **Sumvch Gstitemuqcuom** | No | No | String (Master Reference) |
| **Sumvch Gstledgersource** | No | No | String (Master Reference) |
| **Sumvch Gstovrdnassessablevalue** | No | No | Amount |
| **Sumvch Gstovrdnclassification** | No | No | String (Master Reference) |
| **Sumvch Gstovrdnineligibleitc** | No | No | String (Sysname) |
| **Sumvch Gstovrdnisrevchargeappl** | No | No | String (Sysname) |
| **Sumvch Gstovrdnnature** | No | No | String |
| **Sumvch Gstovrdnnatureofgoods** | No | No | String |
| **Sumvch Gstovrdnstorednature** | No | No | String (Sysname) |
| **Sumvch Gstovrdntaxability** | No | No | String (Sysname) |
| **Sumvch Gstovrdntypeofsupply** | No | No | String (Sysname) |
| **Sumvch Gstrateinferapplicability** | No | No | String (Sysname) |
| **Sumvch Gststockgroupsource** | No | No | String (Master Reference) |
| **Sumvch Gvatexciseamt** | No | No | Amount |
| **Sumvch Gvatexciserate** | No | No | Number |
| **Sumvch Hsn Source Type** | No | No | String (Sysname) |
| **Sumvch Hsngroupsource** | No | No | String (Master Reference) |
| **Sumvch Hsnitemsource** | No | No | String (Master Reference) |
| **Sumvch Hsnledgersource** | No | No | String (Master Reference) |
| **Sumvch Hsnovrdnclassification** | No | No | String (Master Reference) |
| **Sumvch Hsnstockgroupsource** | No | No | String (Master Reference) |
| **Sumvch Inclvatrate** | No | No | Rate |
| **Sumvch Isautonegate** | No | No | Logical |
| **Sumvch Iscustomsclearance** | No | No | Logical |
| **Sumvch Isgstassessablevalueoverridden** | No | No | Logical |
| **Sumvch Isprimaryitem** | No | No | Logical |
| **Sumvch Isscrap** | No | No | Logical |
| **Sumvch Istrackcomponent** | No | No | Logical |
| **Sumvch Istrackproduction** | No | No | Logical |
| **Sumvch Iszrbasicservice** | No | No | String (Sysname) |
| **Sumvch Mrp Rate** | No | No | Rate |
| **Sumvch Natureofcomponent** | No | No | String (Sysname) |
| **Sumvch Origactualqty** | No | No | Quantity |
| **Sumvch Origbilledqty** | No | No | Quantity |
| **Sumvch Originvgoodsqty** | No | No | Number |
| **Sumvch Originvgoodstaxvalue** | No | No | Amount |
| **Sumvch Originvgoodsvalue** | No | No | Amount |
| **Sumvch Originvoicebookname** | No | No | String |
| **Sumvch Originvoicedate** | No | No | Date |
| **Sumvch Originvoicenumber** | No | No | String |
| **Sumvch Origmrpabatement** | No | No | Number |
| **Sumvch Origmrprate** | No | No | Rate |
| **Sumvch Origrate** | No | No | Rate |
| **Sumvch Origrateofduty** | No | No | Number |
| **Sumvch Origrateofqty** | No | No | Rate |
| **Sumvch Origsalesinvdate** | No | No | Date |
| **Sumvch Origsalesinvno** | No | No | String |
| **Sumvch Rate** | No | No | Rate |
| **Sumvch Ratedetails** | Yes | No | [Sumtrans Gstratedetails](Sumtrans%20Gstratedetails.md) |
| **Sumvch Reasonofrejection** | No | No | String |
| **Sumvch Refvoucherdetails** | Yes | No | [Sumtrans Refvoucherdetails](Sumtrans%20Refvoucherdetails.md) |
| **Sumvch Revisedrate** | No | No | Rate |
| **Sumvch Revisedrateofduty** | No | No | Number |
| **Sumvch Revisedrateofqty** | No | No | Rate |
| **Sumvch Sdtaxclassificationname** | No | No | String (Master Reference) |
| **Sumvch Statnaturename** | No | No | String |
| **Sumvch Stockitemname** | No | No | String (Master Reference) |
| **Sumvch Strd Computedassessablevalue** | No | No | Amount |
| **Sumvch Strd Computedcess** | No | No | Amount |
| **Sumvch Strd Computedcessonqty** | No | No | Amount |
| **Sumvch Strd Computedcgst** | No | No | Amount |
| **Sumvch Strd Computedigst** | No | No | Amount |
| **Sumvch Strd Computedsgst** | No | No | Amount |
| **Sumvch Strd Isgst Applicable** | No | No | Logical |
| **Sumvch Strdappropriateddiscount** | No | No | Amount |
| **Sumvch Strdapprstatecessgst** | No | No | Amount |
| **Sumvch Strdexcisetax** | No | No | Amount |
| **Sumvch Strdgstderivedlocationtype** | No | No | String (Sysname) |
| **Sumvch Strdgstderivednaturetype** | No | No | String (Sysname) |
| **Sumvch Strdgstderivedsupplytype** | No | No | String (Sysname) |
| **Sumvch Strdgstderivedtaxability** | No | No | String (Sysname) |
| **Sumvch Strdgstfinalnatureofentry** | No | No | String (Sysname) |
| **Sumvch Supplementarydutyheaddetails** | Yes | No | [Sumtrans Supplementarydutyheaddetails](Sumtrans%20Supplementarydutyheaddetails.md) |
| **Sumvch Tax Object Allocations** | Yes | No | [Sumtrans Tax Object Allocations](Sumtrans%20Tax%20Object%20Allocations.md) |
| **Sumvch Tradercnsalesnumber** | No | No | String |
| **Sumvch Tradersupplierinvoiceno** | No | No | String |
| **Sumvch Usableqty** | No | No | Quantity |
| **Sumvch Vat Assessable Value** | No | No | Amount |
| **Sumvch Vatacceptedaddltaxamt** | No | No | Amount |
| **Sumvch Vatacceptedtaxamt** | No | No | Amount |
| **Sumvch Vatassblvalue** | No | No | Amount |
| **Sumvch Vateligiblecredit** | No | No | Amount |
| **Sumvch Vatinputtaxcredit** | No | No | Amount |
| **Sumvch Vattaxrate** | No | No | Number |
| **Sumvch Vatwcdeductamt** | No | No | Amount |
| **Sumvch Wctotaldeductionamt** | No | No | Amount |
