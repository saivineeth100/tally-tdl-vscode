# Sumtrans Ledger Entry Schema

> **Version**: 7.0

Reference documentation for the **Sumtrans Ledger Entry** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 173

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Sumvch Accountauditentries** | Yes | No | [Sumtrans Accountaudit Entries](Sumtrans%20Accountaudit%20Entries.md) |
| **Sumvch Addnlvatclassamt** | No | No | Amount |
| **Sumvch Advance Tax Details** | Yes | No | [Sumtrans Advancetaxdetails](Sumtrans%20Advancetaxdetails.md) |
| **Sumvch Amount** | No | No | Amount |
| **Sumvch Appropriatefor** | No | No | String (Sysname) |
| **Sumvch Bankallocations** | Yes | No | [Sumtrans Bank Allocations](Sumtrans%20Bank%20Allocations.md) |
| **Sumvch Basic  Rate Of Invoice Tax** | No | Yes | Number |
| **Sumvch Bill Allocations** | Yes | No | [Sumtrans Bill Allocations](Sumtrans%20Bill%20Allocations.md) |
| **Sumvch Capvatasseablevalue** | No | No | Amount |
| **Sumvch Capvattaxrate** | No | No | Number |
| **Sumvch Capvattaxvalue** | No | No | Amount |
| **Sumvch Cashreceived** | No | No | Amount |
| **Sumvch Cenvatcaptinputamt** | No | No | Amount |
| **Sumvch Cenvatduty Allocations** | Yes | No | [Sumtrans Cenvatduty Allocations](Sumtrans%20Cenvatduty%20Allocations.md) |
| **Sumvch Cessassvalonclass** | No | No | Amount |
| **Sumvch Cgstliability** | No | No | Amount |
| **Sumvch Classrate** | No | No | String |
| **Sumvch Content Neg Is Pos** | No | No | Logical |
| **Sumvch Dutyheaddetails** | Yes | No | [Sumtrans Dutyheaddetails](Sumtrans%20Dutyheaddetails.md) |
| **Sumvch Eidiscountamt** | No | No | Amount |
| **Sumvch Excisealloctype** | No | No | String |
| **Sumvch Exciseclassificationname** | No | No | String (Master Reference) |
| **Sumvch Excisedutyheaddetails** | Yes | No | [Sumtrans Excise Duty Head Details](Sumtrans%20Excise%20Duty%20Head%20Details.md) |
| **Sumvch Excisepaymentallocations** | Yes | No | [Sumtrans Excisepaymentallocations](Sumtrans%20Excisepaymentallocations.md) |
| **Sumvch Fbtexemptamount** | No | No | Amount |
| **Sumvch Goodstype** | No | No | String |
| **Sumvch Gst Assessable Value** | No | No | Amount |
| **Sumvch Gst Class** | No | No | String (Sysname) |
| **Sumvch Gst Party Ledger** | No | No | String (Master Reference) |
| **Sumvch Gst Source Type** | No | No | String (Sysname) |
| **Sumvch Gstappropriateto ** | No | No | String (Sysname) |
| **Sumvch Gstassblvalue** | No | No | Amount |
| **Sumvch Gstcessliability** | No | No | Amount |
| **Sumvch Gstdepgstclassification** | No | No | String (Master Reference) |
| **Sumvch Gstdephsnclassification** | No | No | String (Master Reference) |
| **Sumvch Gstdutyhead** | No | No | String (Sysname) |
| **Sumvch Gstgroupsource** | No | No | String (Master Reference) |
| **Sumvch Gsthsndescription** | No | No | String |
| **Sumvch Gsthsninferapplicability** | No | No | String (Sysname) |
| **Sumvch Gsthsnname** | No | No | String |
| **Sumvch Gsthsnsaccode** | No | No | String |
| **Sumvch Gstitemsource** | No | No | String (Master Reference) |
| **Sumvch Gstledgersource** | No | No | String (Master Reference) |
| **Sumvch Gstoverridden** | No | No | Logical |
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
| **Sumvch Gsttaxrate** | No | No | Number |
| **Sumvch Hsn Source Type** | No | No | String (Sysname) |
| **Sumvch Hsngroupsource** | No | No | String (Master Reference) |
| **Sumvch Hsnitemsource** | No | No | String (Master Reference) |
| **Sumvch Hsnledgersource** | No | No | String (Master Reference) |
| **Sumvch Hsnovrdnclassification** | No | No | String (Master Reference) |
| **Sumvch Hsnstockgroupsource** | No | No | String (Master Reference) |
| **Sumvch Igstliability** | No | No | Amount |
| **Sumvch Inputcrallocs** | Yes | No | [Sumtrans Inputcrallocs](Sumtrans%20Inputcrallocs.md) |
| **Sumvch Interest Collection** | Yes | No | [Sumtrans Vch Interest Collection](Sumtrans%20Vch%20Interest%20Collection.md) |
| **Sumvch Invoicewisedetails** | Yes | No | [Sumtrans Refvoucherdetails](Sumtrans%20Refvoucherdetails.md) |
| **Sumvch Iscapvatnotclaimed** | No | No | Logical |
| **Sumvch Iscapvattaxaltered** | No | No | Logical |
| **Sumvch Isgstassessablevalueoverridden** | No | No | Logical |
| **Sumvch Ispartyledger** | No | No | Logical |
| **Sumvch Iszrbasicservice** | No | No | String (Sysname) |
| **Sumvch Ledger Name** | No | No | String (Master Reference) |
| **Sumvch Ledgerfromitem** | No | No | Logical |
| **Sumvch Method Type** | No | No | String (Sysname) |
| **Sumvch Narration** | No | No | String |
| **Sumvch Oldauditentries** | Yes | No | [Sumtrans Audit Entries](Sumtrans%20Audit%20Entries.md) |
| **Sumvch Oldauditentryids** | No | Yes | Number (Integer) |
| **Sumvch Originvgoodsqty** | No | No | Number |
| **Sumvch Originvgoodstaxvalue** | No | No | Amount |
| **Sumvch Originvgoodsvalue** | No | No | Amount |
| **Sumvch Origpurchinvdate** | No | No | Date |
| **Sumvch Origpurchinvno** | No | No | String |
| **Sumvch Origpurchnote** | No | No | String |
| **Sumvch Origpurchparty** | No | No | String |
| **Sumvch Origpurchpartyaddress** | No | No | String |
| **Sumvch Origpurchvalue** | No | No | Amount |
| **Sumvch Pospaymenttype** | No | No | String |
| **Sumvch Prevamount** | No | No | Amount |
| **Sumvch Previnvtotalamt** | No | No | Amount |
| **Sumvch Previnvtotalnum** | No | No | Number |
| **Sumvch Ratedetails** | Yes | No | [Sumtrans Gstratedetails](Sumtrans%20Gstratedetails.md) |
| **Sumvch Rateofaddlvat** | No | No | Number |
| **Sumvch Rateofcessonvat** | No | No | Number |
| **Sumvch Refvoucherdetails** | Yes | No | [Sumtrans Refvoucherdetails](Sumtrans%20Refvoucherdetails.md) |
| **Sumvch Removezeroentries** | No | No | Logical |
| **Sumvch Roundlimit** | No | No | Number |
| **Sumvch Roundtype** | No | No | String (Sysname) |
| **Sumvch Schedule** | No | No | String |
| **Sumvch Scheduleserialnumber** | No | No | String |
| **Sumvch Schviadjtype** | No | No | String |
| **Sumvch Servicetaxdetails** | Yes | No | [Sumtrans Servicetaxdetails](Sumtrans%20Servicetaxdetails.md) |
| **Sumvch Sgstliability** | No | No | Amount |
| **Sumvch St Cr Adj Percent** | No | No | Number |
| **Sumvch Statclassificationname** | No | No | String (Master Reference) |
| **Sumvch Statnaturename** | No | No | String |
| **Sumvch Stnotificationno** | No | No | String |
| **Sumvch Stpymtdetails** | Yes | No | [Sumtrans Stpymtdetails](Sumtrans%20Stpymtdetails.md) |
| **Sumvch Strd Computedassessablevalue** | No | No | Amount |
| **Sumvch Strd Computedcess** | No | No | Amount |
| **Sumvch Strd Computedcessonqty** | No | No | Amount |
| **Sumvch Strd Computedcgst** | No | No | Amount |
| **Sumvch Strd Computedigst** | No | No | Amount |
| **Sumvch Strd Computedsgst** | No | No | Amount |
| **Sumvch Strd Gstdutyhead** | No | No | String (Sysname) |
| **Sumvch Strd Gstisdutyledger** | No | No | Logical |
| **Sumvch Strd Gstispartyledger** | No | No | Logical |
| **Sumvch Strd Isgst Applicable** | No | No | Logical |
| **Sumvch Strdappropriateddiscount** | No | No | Amount |
| **Sumvch Strdapprstatecessgst** | No | No | Amount |
| **Sumvch Strdexcisetax** | No | No | Amount |
| **Sumvch Strdgstderivedlocationtype** | No | No | String (Sysname) |
| **Sumvch Strdgstderivednaturetype** | No | No | String (Sysname) |
| **Sumvch Strdgstderivedsupplytype** | No | No | String (Sysname) |
| **Sumvch Strdgstderivedtaxability** | No | No | String (Sysname) |
| **Sumvch Strdgstfinalnatureofentry** | No | No | String (Sysname) |
| **Sumvch Summaryallocs** | Yes | No | [Sumtrans Summaryallocs](Sumtrans%20Summaryallocs.md) |
| **Sumvch Supplymargval** | No | No | Amount |
| **Sumvch Swiftcode** | No | No | String |
| **Sumvch Tax Bill Allocations** | Yes | No | [Sumtrans Tax Bill Allocations](Sumtrans%20Tax%20Bill%20Allocations.md) |
| **Sumvch Tax Classification Name** | No | No | String (Master Reference) |
| **Sumvch Tax Object Allocations** | Yes | No | [Sumtrans Tax Object Allocations](Sumtrans%20Tax%20Object%20Allocations.md) |
| **Sumvch Tax Type Allocations** | Yes | No | [Sumtrans Tax Type Allocations](Sumtrans%20Tax%20Type%20Allocations.md) |
| **Sumvch Taxunitname** | No | No | String (Master Reference) |
| **Sumvch Tds Party Name** | No | No | String (Master Reference) |
| **Sumvch Tdsexpenseallocations** | Yes | No | [Sumtrans Tdsexpenseallocations](Sumtrans%20Tdsexpenseallocations.md) |
| **Sumvch Type Of Tax Payment** | No | No | String (Sysname) |
| **Sumvch Vat Assessable Value** | No | No | Amount |
| **Sumvch Vatacceptedaddltaxamt** | No | No | Amount |
| **Sumvch Vatacceptedtaxamt** | No | No | Amount |
| **Sumvch Vatassblvalue** | No | No | Amount |
| **Sumvch Vatcalculationtype** | No | No | String (Sysname) |
| **Sumvch Vatcommoditycode** | No | No | String |
| **Sumvch Vatcommodityname** | No | No | String |
| **Sumvch Vatexpamount** | No | No | Amount |
| **Sumvch Vatgoodsnature** | No | No | String |
| **Sumvch Vatitcdetails** | Yes | No | [Sumtrans Vatitcdetails](Sumtrans%20Vatitcdetails.md) |
| **Sumvch Vatitemqty** | No | No | Number |
| **Sumvch Vatmajorcommodityname** | No | No | String |
| **Sumvch Vatpartyname** | No | No | String (Master Reference) |
| **Sumvch Vatstatutorydetails** | Yes | No | [Sumtrans Vatstatutorydetails](Sumtrans%20Vatstatutorydetails.md) |
| **Sumvch Vatsubcommoditycode** | No | No | String |
| **Sumvch Vattaxrate** | No | No | Number |
| **Sumvch Vattradename** | No | No | String |
| **Sumvch Vatwcconsumablescost** | No | No | Amount |
| **Sumvch Vatwccontractorprofit** | No | No | Amount |
| **Sumvch Vatwccostofland** | No | No | Amount |
| **Sumvch Vatwcdedlabourcharges** | No | No | Amount |
| **Sumvch Vatwcdeductamt** | No | No | Amount |
| **Sumvch Vatwcdeductionamount** | No | No | Amount |
| **Sumvch Vatwcdeductionrate** | No | No | Number |
| **Sumvch Vatwcdeductrate** | No | No | Number (Integer) |
| **Sumvch Vatwcdescription** | No | No | String |
| **Sumvch Vatwcestablishmentcost** | No | No | Amount |
| **Sumvch Vatwcmachinerytoolscharges** | No | No | Amount |
| **Sumvch Vatwcothercharges** | No | No | Amount |
| **Sumvch Vatwcotherdeductionamt** | No | No | Amount |
| **Sumvch Vatwcplanningdesignfees** | No | No | Amount |
| **Sumvch Vatwcsubcontractoramt** | No | No | Amount |
| **Sumvch Vatwcvalueoftaxfreegoods** | No | No | Amount |
| **Sumvch Vatworkscontracttype** | No | No | String |
| **Sumvch Voucher Fbt Category** | No | No | String (Master Reference) |
| **Sumvch Wctotaldeductionamt** | No | No | Amount |
| **Sumvch Xbrladjtype** | No | No | String |
