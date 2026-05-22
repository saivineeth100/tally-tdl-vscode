# Inventory Entry Schema

> **Version**: 7.0

Reference documentation for the **Inventory Entry** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 320

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Accounting Allocations** | Yes | No | [Ledger Entry](Ledger%20Entry.md) |
| **Actual Qty** | No | No | Quantity |
| **Additional Details** | Yes | No | [Additional Details](Additional%20Details.md) |
| **Addl Amount** | No | No | Amount |
| **Addlcostperc** | No | No | Number |
| **Amount** | No | No | Amount |
| **Applicablefrom** | No | No | Date |
| **Apprcess** | No | No | Amount |
| **Apprcessonqty** | No | No | Amount |
| **Apprcgst** | No | No | Amount |
| **Apprigst** | No | No | Amount |
| **Appropriateddiscount** | No | No | Amount |
| **Appropriatevalue** | No | No | Amount |
| **Appropriatevaluerounddiff** | No | No | Amount |
| **Apprsgst** | No | No | Amount |
| **Apprstatecessgst** | No | No | Amount |
| **Apprutgst** | No | No | Amount |
| **Basic Num Packages** | No | No | String |
| **Basic Package Marks** | No | No | String |
| **Basic User Description** | No | Yes | String |
| **Batch Allocations** | Yes | No | [Batch Allocations](Batch%20Allocations.md) |
| **Batch Discount** | No | No | Number |
| **Batch Name** | No | No | String |
| **Batch Rate** | No | No | Rate |
| **Billed Qty** | No | No | Quantity |
| **Bomname** | No | No | String |
| **Calculation Type** | No | No | String (Sysname) |
| **Category Allocations** | Yes | No | [Category Allocations](Category%20Allocations.md) |
| **Cessassvalonclass** | No | No | Amount |
| **Cessgstrate** | No | No | Number |
| **Cessgstrateperunit** | No | No | Number |
| **Cessgstvaluationtype** | No | No | String (Sysname) |
| **Cessonqtygstrate** | No | No | Number |
| **Cessonqtygstrateperunit** | No | No | Number |
| **Cessonqtygstvaluationtype** | No | No | String (Sysname) |
| **Cgstrate** | No | No | Number |
| **Cgstrateperunit** | No | No | Number |
| **Cgstvaluationtype** | No | No | String (Sysname) |
| **Componentlisttype** | No | No | String (Sysname) |
| **Computedassessablevalue** | No | No | Amount |
| **Computedassessablevaluetemp** | No | No | Amount |
| **Computedcess** | No | No | Amount |
| **Computedcessonqty** | No | No | Amount |
| **Computedcgst** | No | No | Amount |
| **Computedexcisetax** | No | No | Amount |
| **Computedhsncode** | No | No | String |
| **Computedigst** | No | No | Amount |
| **Computedsgst** | No | No | Amount |
| **Computedstatecessgst** | No | No | Amount |
| **Computedutgst** | No | No | Amount |
| **Content Neg Is Pos** | No | No | Logical |
| **Cost Centre Allocations** | Yes | No | [Cost Center Allocations](Cost%20Center%20Allocations.md) |
| **Costtrackallocations** | Yes | No | [Costtrackallocations](Costtrackallocations.md) |
| **Description** | No | No | String |
| **Destination Godown Name** | No | No | String |
| **Discount** | No | No | Number |
| **Displaynatureofcomponent** | No | No | String (Sysname) |
| **Dutyheaddetails** | Yes | No | [Dutyheaddetails](Dutyheaddetails.md) |
| **Dynamiccstno** | No | No | String |
| **Dynamiccstparentitem** | No | No | String |
| **Eidiscountamt** | No | No | Amount |
| **Entrycessgstrate** | No | No | Number |
| **Entrycessgstrateperunit** | No | No | Number |
| **Entrycessgstvaluationtype** | No | No | String (Sysname) |
| **Entrycessonqtygstrate** | No | No | Number |
| **Entrycessonqtygstrateperunit** | No | No | Number |
| **Entrycessonqtygstvaluationtype** | No | No | String (Sysname) |
| **Entrycgstrate** | No | No | Number |
| **Entrycgstrateperunit** | No | No | Number |
| **Entrycgstvaluationtype** | No | No | String (Sysname) |
| **Entryigstrate** | No | No | Number |
| **Entryigstrateperunit** | No | No | Number |
| **Entryigstvaluationtype** | No | No | String (Sysname) |
| **Entrysgstrate** | No | No | Number |
| **Entrysgstrateperunit** | No | No | Number |
| **Entrysgstvaluationtype** | No | No | String (Sysname) |
| **Entrystatecessgstrate** | No | No | Number |
| **Entrystatecessgstrateperunit** | No | No | Number |
| **Entrystatecessgstvaluationtype** | No | No | String (Sysname) |
| **Entryutgstrate** | No | No | Number |
| **Entryutgstrateperunit** | No | No | Number |
| **Entryutgstvaluationtype** | No | No | String (Sysname) |
| **Escalationrate** | No | No | Rate |
| **Excise Allocations** | Yes | No | [Excise Allocations](Excise%20Allocations.md) |
| **Excise Assessablevalue** | No | No | Amount |
| **Excise Exemption** | No | No | String |
| **Excise Tariff** | No | No | String |
| **Exciseclassificationname** | No | No | String (Master Reference) |
| **Excisecreditcategory** | No | No | String |
| **Excisecreditparty** | No | No | String |
| **Excisecreditpendingqty** | No | No | Quantity |
| **Excisecreditstkitem** | No | No | String |
| **Excisemrpabatement** | No | No | Number |
| **Excisemrprate** | No | No | Rate |
| **Excisereturndutyrate** | No | No | Number |
| **Excisereturninvoiceno** | No | No | String |
| **Excisereturninvoiceqty** | No | No | Quantity |
| **Excisesalesinvoiceno** | No | No | String |
| **Expense Allocations** | Yes | No | [Expense Allocations](Expense%20Allocations.md) |
| **Expiry Period** | No | No | Due Date |
| **Godown Name** | No | No | String |
| **Gst Source Type** | No | No | String (Sysname) |
| **Gstassblvalue** | No | No | Amount |
| **Gstdepgstclassification** | No | No | String (Master Reference) |
| **Gstdephsnclassification** | No | No | String (Master Reference) |
| **Gstderivedlocationtype** | No | No | String (Sysname) |
| **Gstderivednatureofentry** | No | No | String (Sysname) |
| **Gstderivednaturetype** | No | No | String (Sysname) |
| **Gstderivedrcm** | No | No | String (Sysname) |
| **Gstderivedregistrationtype** | No | No | String (Sysname) |
| **Gstderivedsupplytype** | No | No | String (Sysname) |
| **Gstderivedtaxability** | No | No | String (Sysname) |
| **Gstfinalnatureofentry** | No | No | String (Sysname) |
| **Gstgroupsource** | No | No | String (Master Reference) |
| **Gsthsndescription** | No | No | String |
| **Gsthsninferapplicability** | No | No | String (Sysname) |
| **Gsthsnname** | No | No | String |
| **Gstineligibleitc** | No | No | Logical |
| **Gstinferencedepid** | No | No | Number (Integer) |
| **Gstispurchaseentry** | No | No | Logical |
| **Gstissalesentry** | No | No | Logical |
| **Gstitemsource** | No | No | String (Master Reference) |
| **Gstitemuqc** | No | No | String |
| **Gstitemuqcuom** | No | No | String (Master Reference) |
| **Gstledgersource** | No | No | String (Master Reference) |
| **Gstnatureofentry** | No | No | String |
| **Gstnatureoftransaction** | No | No | String |
| **Gstovrdnassessablevalue** | No | No | Amount |
| **Gstovrdnclassification** | No | No | String (Master Reference) |
| **Gstovrdnineligibleitc** | No | No | String (Sysname) |
| **Gstovrdnisrevchargeappl** | No | No | String (Sysname) |
| **Gstovrdnnature** | No | No | String |
| **Gstovrdnnatureofgoods** | No | No | String |
| **Gstovrdnstorednature** | No | No | String (Sysname) |
| **Gstovrdntaxability** | No | No | String (Sysname) |
| **Gstovrdntypeofsupply** | No | No | String (Sysname) |
| **Gstrateinferapplicability** | No | No | String (Sysname) |
| **Gststockgroupsource** | No | No | String (Master Reference) |
| **Gsttypeofsupply** | No | No | String |
| **Gvatexciseamt** | No | No | Amount |
| **Gvatexciserate** | No | No | Number |
| **Hsn** | No | No | String |
| **Hsn Source Type** | No | No | String (Sysname) |
| **Hsnapplicablefrom** | No | No | Date |
| **Hsncode** | No | No | String |
| **Hsngroupsource** | No | No | String (Master Reference) |
| **Hsnitemsource** | No | No | String (Master Reference) |
| **Hsnledgersource** | No | No | String (Master Reference) |
| **Hsnovrdnclassification** | No | No | String (Master Reference) |
| **Hsnstockgroupsource** | No | No | String (Master Reference) |
| **Igstrate** | No | No | Number |
| **Igstrateperunit** | No | No | Number |
| **Igstvaluationtype** | No | No | String (Sysname) |
| **Inclvatrate** | No | No | Rate |
| **Indent No** | No | No | String |
| **Indentduedate** | No | No | Due Date |
| **Inferredcessgstrate** | No | No | Number |
| **Inferredcessgstvaluationtype** | No | No | String (Sysname) |
| **Inferredcessonqtygstrate** | No | No | Number |
| **Inferredcessonqtygstvaluationtype** | No | No | String (Sysname) |
| **Inferredcgstrate** | No | No | Number |
| **Inferredcgstvaluationtype** | No | No | String (Sysname) |
| **Inferredgstineligibleitc** | No | No | Logical |
| **Inferredgstnatureoftransaction** | No | No | String |
| **Inferredigstrate** | No | No | Number |
| **Inferredigstvaluationtype** | No | No | String (Sysname) |
| **Inferredisreversechargeapplicable** | No | No | Logical |
| **Inferredsgstrate** | No | No | Number |
| **Inferredsgstvaluationtype** | No | No | String (Sysname) |
| **Inferredstatecessgstrate** | No | No | Number |
| **Inferredstatecessgstvaluationtype** | No | No | String (Sysname) |
| **Inferredtaxability** | No | No | String (Sysname) |
| **Inferredutgstrate** | No | No | Number |
| **Inferredutgstvaluationtype** | No | No | String (Sysname) |
| **Infgstgroupsource** | No | No | String |
| **Infgstitemsource** | No | No | String |
| **Infgstledgersource** | No | No | String |
| **Infgstmastername** | No | No | String |
| **Infgstsourcetype** | No | No | String (Sysname) |
| **Infgststockgroupsource** | No | No | String |
| **Infhsngroupsource** | No | No | String |
| **Infhsnitemsource** | No | No | String |
| **Infhsnledgersource** | No | No | String |
| **Infhsnmastername** | No | No | String |
| **Infhsnsourcetype** | No | No | String (Sysname) |
| **Infhsnstockgroupsource** | No | No | String |
| **Infsrcofgstdetails** | No | No | String (Sysname) |
| **Infsrcofhsndetails** | No | No | String (Sysname) |
| **Is Deemed Positive** | No | No | Logical |
| **Isasseablevalueoverridden** | No | No | Logical |
| **Isautonegate** | No | No | Logical |
| **Iscessonqtyoverridden** | No | No | Logical |
| **Iscessoverridden** | No | No | Logical |
| **Iscgstoverridden** | No | No | Logical |
| **Iscustomsclearance** | No | No | Logical |
| **Isgst Applicable** | No | No | Logical |
| **Isgstassessablevalueoverridden** | No | No | Logical |
| **Isgstnatureoftransactionoverridden** | No | No | Logical |
| **Isigstoverridden** | No | No | Logical |
| **Islastdeemedpositive** | No | No | Logical |
| **Isnongstgoods** | No | No | Logical |
| **Isprimaryitem** | No | No | Logical |
| **Isreversechargeapplicable** | No | No | Logical |
| **Isreversechargeapplicableoverridden** | No | No | Logical |
| **Isscrap** | No | No | Logical |
| **Issgstoverridden** | No | No | Logical |
| **Isstatecessgstoverridden** | No | No | Logical |
| **Istaxabilityoverridden** | No | No | Logical |
| **Istrackcomponent** | No | No | Logical |
| **Istrackproduction** | No | No | Logical |
| **Isutgstoverridden** | No | No | Logical |
| **Iszrbasicservice** | No | No | String (Sysname) |
| **Ledger Name** | No | No | String |
| **Mfd On** | No | No | Date |
| **Mrprate** | No | No | Rate |
| **Natureofcomponent** | No | No | String (Sysname) |
| **Natureofgoods** | No | No | String |
| **Orderduedate** | No | No | Due Date |
| **Orderno** | No | No | String |
| **Origactualqty** | No | No | Quantity |
| **Origbilledqty** | No | No | Quantity |
| **Originvgoodsqty** | No | No | Number |
| **Originvgoodstaxvalue** | No | No | Amount |
| **Originvgoodsvalue** | No | No | Amount |
| **Originvoicebookname** | No | No | String |
| **Originvoicedate** | No | No | Date |
| **Originvoicenumber** | No | No | String |
| **Origmrpabatement** | No | No | Number |
| **Origmrprate** | No | No | Rate |
| **Origrate** | No | No | Rate |
| **Origrateofduty** | No | No | Number |
| **Origrateofqty** | No | No | Rate |
| **Origsalesinvdate** | No | No | Date |
| **Origsalesinvno** | No | No | String |
| **Rate** | No | No | Rate |
| **Ratedetails** | Yes | No | [Gstratedetails](Gstratedetails.md) |
| **Reasonofrejection** | No | No | String |
| **Refvoucherdetails** | Yes | No | [Refvoucherdetails](Refvoucherdetails.md) |
| **Reversechargerate** | No | No | Number |
| **Revisedrate** | No | No | Rate |
| **Revisedrateofduty** | No | No | Number |
| **Revisedrateofqty** | No | No | Rate |
| **Sdtaxclassificationname** | No | No | String (Master Reference) |
| **Sgstrate** | No | No | Number |
| **Sgstrateperunit** | No | No | Number |
| **Sgstvaluationtype** | No | No | String (Sysname) |
| **Srcinfcessgstrate** | No | No | Number |
| **Srcinfcessgstrateperunit** | No | No | Number |
| **Srcinfcessgstvaluationtype** | No | No | String (Sysname) |
| **Srcinfcessonqtygstrate** | No | No | Number |
| **Srcinfcessonqtygstrateperunit** | No | No | Number |
| **Srcinfcessonqtygstvaluationtype** | No | No | String (Sysname) |
| **Srcinfcgstrate** | No | No | Number |
| **Srcinfcgstrateperunit** | No | No | Number |
| **Srcinfcgstvaluationtype** | No | No | String (Sysname) |
| **Srcinfcomputedhsncode** | No | No | String |
| **Srcinfgstcalcslabonmrp** | No | No | Logical |
| **Srcinfgstdetappfrom** | No | No | Date |
| **Srcinfgstineligibleitc** | No | No | Logical |
| **Srcinfgstmastername** | No | No | String |
| **Srcinfgstnatureoftransaction** | No | No | String |
| **Srcinfhsn** | No | No | String |
| **Srcinfhsnappfrom** | No | No | Date |
| **Srcinfhsncode** | No | No | String |
| **Srcinfhsnmastername** | No | No | String |
| **Srcinfigstrate** | No | No | Number |
| **Srcinfigstrateperunit** | No | No | Number |
| **Srcinfigstvaluationtype** | No | No | String (Sysname) |
| **Srcinfincludeexpforslabcalc** | No | No | Logical |
| **Srcinfisreversechargeapplicable** | No | No | Logical |
| **Srcinfsgstrate** | No | No | Number |
| **Srcinfsgstrateperunit** | No | No | Number |
| **Srcinfsgstvaluationtype** | No | No | String (Sysname) |
| **Srcinfslabrangestring** | No | No | String |
| **Srcinfsrcofgstdetails** | No | No | String (Sysname) |
| **Srcinfsrcofhsndetails** | No | No | String (Sysname) |
| **Srcinfstatecessgstrate** | No | No | Number |
| **Srcinfstatecessgstrateperunit** | No | No | Number |
| **Srcinfstatecessgstvaluationtype** | No | No | String (Sysname) |
| **Srcinftaxability** | No | No | String (Sysname) |
| **Statecessgstrate** | No | No | Number |
| **Statecessgstrateperunit** | No | No | Number |
| **Statecessgstvaluationtype** | No | No | String (Sysname) |
| **Statnaturename** | No | No | String |
| **Stock Item Name** | No | No | String (Master Reference) |
| **Strd Computedassessablevalue** | No | No | Amount |
| **Strd Computedcess** | No | No | Amount |
| **Strd Computedcessonqty** | No | No | Amount |
| **Strd Computedcgst** | No | No | Amount |
| **Strd Computedigst** | No | No | Amount |
| **Strd Computedsgst** | No | No | Amount |
| **Strd Gstderivedlocationtype** | No | No | String (Sysname) |
| **Strd Isgst Applicable** | No | No | Logical |
| **Strdappropriateddiscount** | No | No | Amount |
| **Strdapprstatecessgst** | No | No | Amount |
| **Strdexcisetax** | No | No | Amount |
| **Strdgstderivednaturetype** | No | No | String (Sysname) |
| **Strdgstderivedsupplytype** | No | No | String (Sysname) |
| **Strdgstderivedtaxability** | No | No | String (Sysname) |
| **Strdgstfinalnatureofentry** | No | No | String (Sysname) |
| **Supplementarydutyheaddetails** | Yes | No | [Supplementarydutyheaddetails](Supplementarydutyheaddetails.md) |
| **Supplytype** | No | No | String (Sysname) |
| **Tax Object Allocations** | Yes | No | [Tax Object Allocations](Tax%20Object%20Allocations.md) |
| **Taxability** | No | No | String (Sysname) |
| **Tracking Number** | No | No | String |
| **Tradercnsalesnumber** | No | No | String |
| **Tradersupplierinvoiceno** | No | No | String |
| **Usableqty** | No | No | Quantity |
| **Utgstrate** | No | No | Number |
| **Utgstrateperunit** | No | No | Number |
| **Utgstvaluationtype** | No | No | String (Sysname) |
| **Vat Assessable Value** | No | No | Amount |
| **Vatacceptedaddltaxamt** | No | No | Amount |
| **Vatacceptedtaxamt** | No | No | Amount |
| **Vatassblvalue** | No | No | Amount |
| **Vateligiblecredit** | No | No | Amount |
| **Vatinputtaxcredit** | No | No | Amount |
| **Vattaxrate** | No | No | Number |
| **Vatwcdeductamt** | No | No | Amount |
| **Wctotaldeductionamt** | No | No | Amount |
