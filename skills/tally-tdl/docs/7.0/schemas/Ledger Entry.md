# Ledger Entry Schema

> **Version**: 7.0

Reference documentation for the **Ledger Entry** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 354

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Accountaudit Entries** | Yes | No | [Accountaudit Entries](Accountaudit%20Entries.md) |
| **Addlalloctype** | No | No | String (Sysname) |
| **Addnlvatclassamt** | No | No | Amount |
| **Advancetaxdetails** | Yes | No | [Advancetaxdetails](Advancetaxdetails.md) |
| **Amount** | No | No | Amount |
| **Applicablefrom** | No | No | Date |
| **Apprcess** | No | No | Amount |
| **Apprcessonqty** | No | No | Amount |
| **Apprcgst** | No | No | Amount |
| **Apprigst** | No | No | Amount |
| **Appropriateddiscount** | No | No | Amount |
| **Appropriatefor** | No | No | String (Sysname) |
| **Appropriatevalue** | No | No | Amount |
| **Appropriatevaluerounddiff** | No | No | Amount |
| **Apprsgst** | No | No | Amount |
| **Apprstatecessgst** | No | No | Amount |
| **Apprutgst** | No | No | Amount |
| **Bank Allocations** | Yes | No | [Bank Allocations](Bank%20Allocations.md) |
| **Bankderivedstatus** | No | No | String (Sysname) |
| **Basic  Rate Of Invoice Tax** | No | Yes | Number |
| **Bill Allocations** | Yes | No | [Bill Allocations](Bill%20Allocations.md) |
| **Bill Credit Period** | No | No | Due Date |
| **Bill Date** | No | No | Date |
| **Bill Type** | No | No | String (Sysname) |
| **Calculation Type** | No | No | String (Sysname) |
| **Capvatasseablevalue** | No | No | Amount |
| **Capvattaxrate** | No | No | Number |
| **Capvattaxvalue** | No | No | Amount |
| **Cashreceived** | No | No | Amount |
| **Category Allocations** | Yes | No | [Category Allocations](Category%20Allocations.md) |
| **Cenvatcaptinputamt** | No | No | Amount |
| **Cenvatduty Allocations** | Yes | No | [Cenvatduty Allocations](Cenvatduty%20Allocations.md) |
| **Cessassvalonclass** | No | No | Amount |
| **Cessgstrate** | No | No | Number |
| **Cessgstrateperunit** | No | No | Number |
| **Cessgstvaluationtype** | No | No | String (Sysname) |
| **Cessonqtygstrate** | No | No | Number |
| **Cessonqtygstrateperunit** | No | No | Number |
| **Cessonqtygstvaluationtype** | No | No | String (Sysname) |
| **Cgstliability** | No | No | Amount |
| **Cgstrate** | No | No | Number |
| **Cgstrateperunit** | No | No | Number |
| **Cgstvaluationtype** | No | No | String (Sysname) |
| **Classrate** | No | No | String |
| **Computedassessablevalue** | No | No | Amount |
| **Computedassessablevaluetemp** | No | No | Amount |
| **Computedcess** | No | No | Amount |
| **Computedcessonqty** | No | No | Amount |
| **Computedcgst** | No | No | Amount |
| **Computeddutytaxvalue** | No | No | Amount |
| **Computedexcisetax** | No | No | Amount |
| **Computedhsncode** | No | No | String |
| **Computedigst** | No | No | Amount |
| **Computedsgst** | No | No | Amount |
| **Computedstatecessgst** | No | No | Amount |
| **Computedutgst** | No | No | Amount |
| **Content Neg Is Pos** | No | No | Logical |
| **Cost Centre Allocations** | Yes | No | [Cost Center Allocations](Cost%20Center%20Allocations.md) |
| **Costtrackallocations** | Yes | No | [Costtrackallocations](Costtrackallocations.md) |
| **Dutyheaddetails** | Yes | No | [Dutyheaddetails](Dutyheaddetails.md) |
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
| **Excise Duty Head Details** | Yes | No | [Excise Duty Head Details](Excise%20Duty%20Head%20Details.md) |
| **Excisealloctype** | No | No | String |
| **Exciseclassificationname** | No | No | String (Master Reference) |
| **Excisepaymentallocations** | Yes | No | [Excisepaymentallocations](Excisepaymentallocations.md) |
| **Fbtexemptamount** | No | No | Amount |
| **Goodstype** | No | No | String |
| **Gst Assessable Value** | No | No | Amount |
| **Gst Class** | No | No | String (Sysname) |
| **Gst Party Ledger** | No | No | String (Master Reference) |
| **Gst Source Type** | No | No | String (Sysname) |
| **Gstappropriateto ** | No | No | String (Sysname) |
| **Gstassblvalue** | No | No | Amount |
| **Gstcessliability** | No | No | Amount |
| **Gstdepgstclassification** | No | No | String (Master Reference) |
| **Gstdephsnclassification** | No | No | String (Master Reference) |
| **Gstderivedlocationtype** | No | No | String (Sysname) |
| **Gstderivednatureofentry** | No | No | String (Sysname) |
| **Gstderivednaturetype** | No | No | String (Sysname) |
| **Gstderivedrcm** | No | No | String (Sysname) |
| **Gstderivedregistrationtype** | No | No | String (Sysname) |
| **Gstderivedsupplytype** | No | No | String (Sysname) |
| **Gstderivedtaxability** | No | No | String (Sysname) |
| **Gstdutyhead** | No | No | String (Sysname) |
| **Gstfinalnatureofentry** | No | No | String (Sysname) |
| **Gstgroupsource** | No | No | String (Master Reference) |
| **Gsthsndescription** | No | No | String |
| **Gsthsninferapplicability** | No | No | String (Sysname) |
| **Gsthsnname** | No | No | String |
| **Gsthsnsaccode** | No | No | String |
| **Gstineligibleitc** | No | No | Logical |
| **Gstinferencedepid** | No | No | Number (Integer) |
| **Gstispurchaseentry** | No | No | Logical |
| **Gstissalesentry** | No | No | Logical |
| **Gstitemsource** | No | No | String (Master Reference) |
| **Gstledgersource** | No | No | String (Master Reference) |
| **Gstnatureofentry** | No | No | String |
| **Gstnatureoftransaction** | No | No | String |
| **Gstoverridden** | No | No | Logical |
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
| **Gsttaxrate** | No | No | Number |
| **Gsttypeofsupply** | No | No | String |
| **Hsn** | No | No | String |
| **Hsn Source Type** | No | No | String (Sysname) |
| **Hsnapplicablefrom** | No | No | Date |
| **Hsncode** | No | No | String |
| **Hsngroupsource** | No | No | String (Master Reference) |
| **Hsnitemsource** | No | No | String (Master Reference) |
| **Hsnledgersource** | No | No | String (Master Reference) |
| **Hsnovrdnclassification** | No | No | String (Master Reference) |
| **Hsnstockgroupsource** | No | No | String (Master Reference) |
| **Igstliability** | No | No | Amount |
| **Igstrate** | No | No | Number |
| **Igstrateperunit** | No | No | Number |
| **Igstvaluationtype** | No | No | String (Sysname) |
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
| **Inputcrallocs** | Yes | No | [Inputcrallocs](Inputcrallocs.md) |
| **Interest Collection** | Yes | No | [Vch Interest Collection](Vch%20Interest%20Collection.md) |
| **Inventory Allocations** | Yes | No | [Inventory Entry](Inventory%20Entry.md) |
| **Invoicewisedetails** | Yes | No | [Refvoucherdetails](Refvoucherdetails.md) |
| **Is Deemed Positive** | No | No | Logical |
| **Isasseablevalueoverridden** | No | No | Logical |
| **Iscapvatnotclaimed** | No | No | Logical |
| **Iscapvattaxaltered** | No | No | Logical |
| **Iscessonqtyoverridden** | No | No | Logical |
| **Iscessoverridden** | No | No | Logical |
| **Iscgstoverridden** | No | No | Logical |
| **Isgst Applicable** | No | No | Logical |
| **Isgstassessablevalueoverridden** | No | No | Logical |
| **Isgstnatureoftransactionoverridden** | No | No | Logical |
| **Isigstoverridden** | No | No | Logical |
| **Islastdeemedpositive** | No | No | Logical |
| **Isnongstgoods** | No | No | Logical |
| **Ispartyledger** | No | No | Logical |
| **Isreversechargeapplicable** | No | No | Logical |
| **Isreversechargeapplicableoverridden** | No | No | Logical |
| **Issgstoverridden** | No | No | Logical |
| **Isstatecessgstoverridden** | No | No | Logical |
| **Istaxabilityoverridden** | No | No | Logical |
| **Isutgstoverridden** | No | No | Logical |
| **Iszrbasicservice** | No | No | String (Sysname) |
| **Ledger Name** | No | No | String (Master Reference) |
| **Ledgerfromitem** | No | No | Logical |
| **Method Type** | No | No | String (Sysname) |
| **Narration** | No | No | String |
| **Natureofgoods** | No | No | String |
| **Oldauditentries** | Yes | No | [Audit Entries](Audit%20Entries.md) |
| **Oldauditentryids** | No | Yes | Number (Integer) |
| **Originvgoodsqty** | No | No | Number |
| **Originvgoodstaxvalue** | No | No | Amount |
| **Originvgoodsvalue** | No | No | Amount |
| **Origpurchinvdate** | No | No | Date |
| **Origpurchinvno** | No | No | String |
| **Origpurchnote** | No | No | String |
| **Origpurchparty** | No | No | String |
| **Origpurchpartyaddress** | No | No | String |
| **Origpurchvalue** | No | No | Amount |
| **Pospaymenttype** | No | No | String |
| **Prevamount** | No | No | Amount |
| **Previnvtotalamt** | No | No | Amount |
| **Previnvtotalnum** | No | No | Number |
| **Prevledgername** | No | No | String |
| **Ratedetails** | Yes | No | [Gstratedetails](Gstratedetails.md) |
| **Rateofaddlvat** | No | No | Number |
| **Rateofcessonvat** | No | No | Number |
| **Refvoucherdetails** | Yes | No | [Refvoucherdetails](Refvoucherdetails.md) |
| **Removezeroentries** | No | No | Logical |
| **Reversechargerate** | No | No | Number |
| **Roundlimit** | No | No | Number |
| **Roundtype** | No | No | String (Sysname) |
| **Schedule** | No | No | String |
| **Scheduleserialnumber** | No | No | String |
| **Schviadjtype** | No | No | String |
| **Servicetaxdetails** | Yes | No | [Servicetaxdetails](Servicetaxdetails.md) |
| **Sgstliability** | No | No | Amount |
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
| **St Cr Adj Percent** | No | No | Number |
| **Statclassificationname** | No | No | String (Master Reference) |
| **Statecessgstrate** | No | No | Number |
| **Statecessgstrateperunit** | No | No | Number |
| **Statecessgstvaluationtype** | No | No | String (Sysname) |
| **Statnaturename** | No | No | String |
| **Stnotificationno** | No | No | String |
| **Stock Item Name** | No | No | String |
| **Stpymtdetails** | Yes | No | [Stpymtdetails](Stpymtdetails.md) |
| **Strd Computedassessablevalue** | No | No | Amount |
| **Strd Computedcess** | No | No | Amount |
| **Strd Computedcessonqty** | No | No | Amount |
| **Strd Computedcgst** | No | No | Amount |
| **Strd Computedigst** | No | No | Amount |
| **Strd Computedsgst** | No | No | Amount |
| **Strd Gstderivedlocationtype** | No | No | String (Sysname) |
| **Strd Gstdutyhead** | No | No | String (Sysname) |
| **Strd Gstisdutyledger** | No | No | Logical |
| **Strd Gstispartyledger** | No | No | Logical |
| **Strd Isgst Applicable** | No | No | Logical |
| **Strdappropriateddiscount** | No | No | Amount |
| **Strdapprstatecessgst** | No | No | Amount |
| **Strdexcisetax** | No | No | Amount |
| **Strdgstderivednaturetype** | No | No | String (Sysname) |
| **Strdgstderivedsupplytype** | No | No | String (Sysname) |
| **Strdgstderivedtaxability** | No | No | String (Sysname) |
| **Strdgstfinalnatureofentry** | No | No | String (Sysname) |
| **Summaryallocs** | Yes | No | [Summaryallocs](Summaryallocs.md) |
| **Supplymargval** | No | No | Amount |
| **Supplytype** | No | No | String (Sysname) |
| **Swiftcode** | No | No | String |
| **Tax Bill Allocations** | Yes | No | [Tax Bill Allocations](Tax%20Bill%20Allocations.md) |
| **Tax Classification Name** | No | No | String (Master Reference) |
| **Tax Object Allocations** | Yes | No | [Tax Object Allocations](Tax%20Object%20Allocations.md) |
| **Tax Type Allocations** | Yes | No | [Tax Type Allocations](Tax%20Type%20Allocations.md) |
| **Taxability** | No | No | String (Sysname) |
| **Taxunitname** | No | No | String (Master Reference) |
| **Tds Party Name** | No | No | String (Master Reference) |
| **Tdsexpenseallocations** | Yes | No | [Tdsexpenseallocations](Tdsexpenseallocations.md) |
| **Type Of Tax Payment** | No | No | String (Sysname) |
| **Utgstrate** | No | No | Number |
| **Utgstrateperunit** | No | No | Number |
| **Utgstvaluationtype** | No | No | String (Sysname) |
| **Vat Assessable Value** | No | No | Amount |
| **Vatacceptedaddltaxamt** | No | No | Amount |
| **Vatacceptedtaxamt** | No | No | Amount |
| **Vatassblvalue** | No | No | Amount |
| **Vatcalculationtype** | No | No | String (Sysname) |
| **Vatcommoditycode** | No | No | String |
| **Vatcommodityname** | No | No | String |
| **Vatexpamount** | No | No | Amount |
| **Vatgoodsnature** | No | No | String |
| **Vatitcdetails** | Yes | No | [Vatitcdetails](Vatitcdetails.md) |
| **Vatitemqty** | No | No | Number |
| **Vatmajorcommodityname** | No | No | String |
| **Vatpartyname** | No | No | String (Master Reference) |
| **Vatstatutorydetails** | Yes | No | [Vatstatutorydetails](Vatstatutorydetails.md) |
| **Vatsubcommoditycode** | No | No | String |
| **Vattaxrate** | No | No | Number |
| **Vattradename** | No | No | String |
| **Vatwcconsumablescost** | No | No | Amount |
| **Vatwccontractorprofit** | No | No | Amount |
| **Vatwccostofland** | No | No | Amount |
| **Vatwcdedlabourcharges** | No | No | Amount |
| **Vatwcdeductamt** | No | No | Amount |
| **Vatwcdeductionamount** | No | No | Amount |
| **Vatwcdeductionrate** | No | No | Number |
| **Vatwcdeductrate** | No | No | Number (Integer) |
| **Vatwcdescription** | No | No | String |
| **Vatwcestablishmentcost** | No | No | Amount |
| **Vatwcmachinerytoolscharges** | No | No | Amount |
| **Vatwcothercharges** | No | No | Amount |
| **Vatwcotherdeductionamt** | No | No | Amount |
| **Vatwcplanningdesignfees** | No | No | Amount |
| **Vatwcsubcontractoramt** | No | No | Amount |
| **Vatwcvalueoftaxfreegoods** | No | No | Amount |
| **Vatworkscontracttype** | No | No | String |
| **Voucher Fbt Category** | No | No | String (Master Reference) |
| **Wctotaldeductionamt** | No | No | Amount |
| **Xbrladjtype** | No | No | String |
