# Voucher Schema

> **Version**: 7.0

Reference documentation for the **Voucher** schema.

### Meta

- **Aliases**: Vouchers
- **SDF Id**: VO
- **Is Primary**: Yes

> **Total Properties**: 793

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Acceptasisflag** | No | Yes | String (Sysname) |
| **Accountaudit Entries** | Yes | No | [Accountaudit Entries](Accountaudit%20Entries.md) |
| **Active To** | No | No | Date |
| **Additionalnarration** | No | No | String |
| **Addnlvatclassamt** | No | No | Amount |
| **Address** | No | Yes | String |
| **Adjfromdate** | No | No | Date |
| **Adjpartygstin** | No | No | String |
| **Adjpartyinvoicedate** | No | No | Date |
| **Adjpartyinvoiceno** | No | No | String |
| **Adjpartyinvoicevalue** | No | No | Amount |
| **Adjpartypaymentdate** | No | No | Date |
| **Adjtodate** | No | No | Date |
| **Advancereceiptdate** | No | No | Date |
| **Advancereceiptnumber** | No | No | String |
| **Aggrementorderdate** | No | No | Date |
| **Aggrementorderno** | No | No | String |
| **Airportname** | No | No | String |
| **Airwaybilldate** | No | No | Date |
| **Airwaybillno** | No | No | String |
| **All Inventory Entries** | Yes | No | [Inventory Entry](Inventory%20Entry.md) |
| **All Ledger Entries** | Yes | No | [Ledger Entry](Ledger%20Entry.md) |
| **Allowconsumption** | No | No | Logical |
| **Alteredby** | No | No | String |
| **Alteredon** | No | No | Date |
| **Alterid** | No | No | Number (Integer) |
| **Amount** | No | No | Amount |
| **Areformtype** | No | No | String (Sysname) |
| **Areserialmaster** | No | No | String (Master Reference) |
| **Areserialnumber** | No | No | String |
| **As Payslip** | No | No | Logical |
| **Asoriginal** | No | No | Logical |
| **Attendance Entries** | Yes | No | [Attendance Entry](Attendance%20Entry.md) |
| **Audited** | No | No | Logical |
| **Audited On** | No | No | Date |
| **Authorityaddress** | No | No | String |
| **Authorityname** | No | No | String |
| **Autocostlevel** | No | No | String |
| **Bankderivedstatus** | No | No | String (Sysname) |
| **Base Voucher Type** | No | No | Number (Integer) |
| **Basic  Buyer Address** | No | Yes | String |
| **Basic Bankers Date** | No | Yes | Date |
| **Basic Base Party Name** | No | No | String |
| **Basic Buyer Name** | No | No | String |
| **Basic Buyers Sales Tax No** | No | No | String |
| **Basic Date Time Of Invoice** | No | No | String |
| **Basic Date Time Of Removal** | No | No | String |
| **Basic Destination Country** | No | No | String |
| **Basic Duedateofpymt** | No | No | String |
| **Basic Final Destination** | No | No | String |
| **Basic Order Date** | No | No | Date |
| **Basic Order Ref** | No | No | String |
| **Basic Order Terms** | No | Yes | String |
| **Basic Place Of Receipt** | No | No | String |
| **Basic Port Of Discharge** | No | No | String |
| **Basic Port Of Loading** | No | No | String |
| **Basic Purchaseorderno** | No | No | String |
| **Basic Ship Delivery Note** | No | No | String |
| **Basic Ship Document No** | No | No | String |
| **Basic Ship Vessel No** | No | No | String |
| **Basic Shipped by** | No | No | String |
| **Basic Shipping Date** | No | No | Date |
| **Basic Voucher Cheque Name** | No | No | String |
| **Basic Voucher Cross Comment** | No | No | String |
| **Basicserial Num In Pla** | No | No | String |
| **Billofentrydate** | No | No | Date |
| **Billofentryno** | No | No | String |
| **Billofladingdate** | No | No | Date |
| **Billofladingno** | No | No | String |
| **Billtoplace** | No | No | String |
| **Bondamount** | No | No | Amount |
| **Bonddateofissue** | No | No | Date |
| **Bondexpirydate** | No | No | Date |
| **Bondnumber** | No | No | String |
| **Booknumber** | No | No | String |
| **Buyeraddresstype** | No | No | String |
| **Buyerpinno** | No | No | String |
| **Buyerpinnumber** | No | No | String |
| **Buyerscstnumber** | No | No | String |
| **Carrieraddress** | No | Yes | String |
| **Carriername** | No | No | String |
| **Cashpartydedtype** | No | No | String (Sysname) |
| **Cashpartypan** | No | No | String |
| **Category Allocations** | Yes | No | [Category Allocations](Category%20Allocations.md) |
| **Category Entries** | Yes | No | [Category Entry](Category%20Entry.md) |
| **Category Entry** | Yes | No | [Category Entry](Category%20Entry.md) |
| **Certificatedate** | No | No | Date |
| **Certificatenumber** | No | No | String |
| **Certificatetype** | No | No | String |
| **Cessassvalonclass** | No | No | Amount |
| **Challantype** | No | No | String (Sysname) |
| **Changevchmode** | No | No | Logical |
| **Chequedepositorname** | No | No | String |
| **Classname** | No | No | String |
| **Clearingagentaddress** | No | Yes | String |
| **Clearingagentname** | No | No | String |
| **Cmp08status** | No | No | String (Sysname) |
| **Cmpdeviceno** | No | No | String |
| **Cmpgstin** | No | No | String |
| **Cmpgstisothterritoryassessee** | No | No | Logical |
| **Cmpgstregistrationtype** | No | No | String (Sysname) |
| **Cmpgststate** | No | No | String |
| **Cmptypeofdevice** | No | No | String |
| **Consigneecircle** | No | No | String |
| **Consigneecity** | No | No | String |
| **Consigneecountryname** | No | No | String |
| **Consigneecstnumber** | No | No | String |
| **Consigneegstin** | No | No | String |
| **Consigneeiecode** | No | No | String |
| **Consigneelbtregnno** | No | No | String |
| **Consigneelbtzone** | No | No | String |
| **Consigneemail** | No | No | String |
| **Consigneemailingname** | No | No | String |
| **Consigneemobilenumber** | No | No | String |
| **Consigneeothers** | No | No | String |
| **Consigneepincode** | No | No | String |
| **Consigneepinno** | No | No | String |
| **Consigneepinnumber** | No | No | String |
| **Consigneestatename** | No | No | String |
| **Consumeridentificationnumber** | No | No | String |
| **Contractortin** | No | No | String |
| **Contri Trans** | Yes | No | [Contri Trans](Contri%20Trans.md) |
| **Contributedvchentries** | Yes | No | [Voucher](Voucher.md) |
| **Contributedvchlist** | No | Yes | Number (Integer) |
| **Cost Center Allocations** | Yes | No | [Cost Center Allocations](Cost%20Center%20Allocations.md) |
| **Costcentrename** | No | No | String (Master Reference) |
| **Countryofresidence** | No | No | String |
| **Creditletterdate** | No | No | Date |
| **Creditletterref** | No | No | String |
| **Cst Form Issue Date** | No | No | Date |
| **Cst Form Issue Number** | No | No | String |
| **Cst Form Issue Type** | No | No | String |
| **Cst Form Recv Date** | No | No | Date |
| **Cst Form Recv Number** | No | No | String |
| **Cst Form Recv Type** | No | No | String |
| **Cstformissueseriesnum** | No | No | String |
| **Cstformrecvseriesnum** | No | No | String |
| **Cstregistrationdate** | No | No | Date |
| **Customdutypaid** | No | No | Amount |
| **Date** | No | No | Date |
| **Deliverycity** | No | No | String |
| **Deliveryothers** | No | No | String |
| **Deliverypincode** | No | No | String |
| **Deliverystate** | No | No | String |
| **Depotname** | No | No | String |
| **Depth** | No | No | Number |
| **Destinationgodown** | No | No | String |
| **Destinationpermitnumber** | No | No | String |
| **Destinationtaxunit** | No | No | String (Master Reference) |
| **Diff Actual Qty** | No | No | Logical |
| **Dispatchcity** | No | No | String |
| **Dispatchdate** | No | No | Date |
| **Dispatchfromaddress** | No | Yes | String |
| **Dispatchfromaddresstype** | No | No | String |
| **Dispatchfromname** | No | No | String |
| **Dispatchfrompincode** | No | No | String |
| **Dispatchfromplace** | No | No | String |
| **Dispatchfromstatename** | No | No | String |
| **Dispatchpincode** | No | No | String |
| **Documentid** | No | No | String |
| **Dutyheaddetails** | Yes | No | [Dutyheaddetails](Dutyheaddetails.md) |
| **Ecdate** | No | No | Date |
| **Ecfeeamount** | No | No | Amount |
| **Ecfeedepositbyawarder** | No | No | Amount |
| **Ecfeedepositbycontractor** | No | No | Amount |
| **Ecfeerate** | No | No | Number |
| **Ecissuingauthority** | No | No | String |
| **Ecnumber** | No | No | String |
| **Ecommercegstin** | No | No | String |
| **Effective Date** | No | No | Date |
| **Eicheckpost** | No | No | String |
| **Eidespdate** | No | No | Date |
| **Eidiscountamt** | No | No | Amount |
| **Eidiscountrate** | No | No | Number (Integer) |
| **Emirate Pos** | No | No | String (Sysname) |
| **Employee Entries** | Yes | No | [Employee Entry](Employee%20Entry.md) |
| **Enteredby** | No | No | String |
| **Entrycheckpostlocation** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Eway Bill Error List** | Yes | No | [Eway Bill Error List](Eway%20Bill%20Error%20List.md) |
| **Ewaybill Details** | Yes | No | [Ewaybill Details](Ewaybill%20Details.md) |
| **Exchgcurrencyname** | No | No | String |
| **Exchgrate** | No | No | Rate of Exchange |
| **Excise Opening** | No | No | Logical |
| **Excise Treasury Name** | No | No | String |
| **Excise Treasury Number** | No | No | String |
| **Exciseclassificationname** | No | No | String (Master Reference) |
| **Excisenatureofvoucher** | No | No | String |
| **Excisenotificationno** | No | No | String |
| **Excisenotificationserialno** | No | No | String |
| **Excisetarifftype** | No | No | String (Sysname) |
| **Excisetaxoverride** | No | No | Logical |
| **Exciseunitname** | No | No | String (Master Reference) |
| **Excludedtaxations** | Yes | No | [Excludedtaxations](Excludedtaxations.md) |
| **Exitcheckpostlocation** | No | No | String |
| **Exportercountry** | No | No | String |
| **Fbt From Date** | No | No | Date |
| **Fbt Payment Type** | No | No | String |
| **Fbt To Date** | No | No | Date |
| **Fetched Invoice Value** | No | No | Number |
| **Fetched Tax Value** | No | No | Number |
| **Fetched Taxable Value** | No | No | Number |
| **For Job Costing** | No | No | Logical |
| **Foreignselleraddress** | No | Yes | String |
| **Foreignsellername** | No | No | String |
| **Form16 Issue Date** | No | No | Date |
| **Fromdate** | No | No | Date |
| **Fwdagentname** | No | No | String |
| **Goodsrcptdate** | No | No | Date |
| **Goodsvehiclenumber** | No | No | String |
| **Gst Itcatrisk Tax Amt** | No | No | Amount |
| **Gst Status For Os** | No | No | String (Sysname) |
| **Gstactivitystatus** | No | No | String (Sysname) |
| **Gstadditionaldetails** | No | No | String |
| **Gstadvadjdetails** | Yes | No | [Gstadvancedetails](Gstadvancedetails.md) |
| **Gstadvtaxderivedtaxability** | No | No | String (Sysname) |
| **Gstbankaccountholder** | No | No | String |
| **Gstbankaccountnumber** | No | No | String |
| **Gstbankaccounttype** | No | No | String |
| **Gstbankbranchaddress** | No | No | String |
| **Gstbankbranchname** | No | No | String |
| **Gstbankifsccode** | No | No | String |
| **Gstbankmicrcode** | No | No | String |
| **Gstbankname** | No | No | String |
| **Gstchallandate** | No | No | Date |
| **Gstchallanexpirydate** | No | No | Date |
| **Gstchallannumber** | No | No | String |
| **Gstcinnumber** | No | No | String |
| **Gstcpinnumber** | No | No | String |
| **Gstdealertype** | No | No | String |
| **Gstdebitdocnumber** | No | No | String |
| **Gstderivedkeyword** | No | No | String (Sysname) |
| **Gstderivedlocationtype** | No | No | String (Sysname) |
| **Gstderivednatureofvoucher** | No | No | String (Sysname) |
| **Gstderivednaturetype** | No | No | String (Sysname) |
| **Gstderivedrcm** | No | No | String (Sysname) |
| **Gstderivedregistrationtype** | No | No | String (Sysname) |
| **Gstderivedsupplytype** | No | No | String (Sysname) |
| **Gstderivedtaxability** | No | No | String (Sysname) |
| **Gstinstrumentnumber** | No | No | String |
| **Gstinvassessablevalue** | No | No | Amount |
| **Gstisadvancecurrentmonth** | No | No | Logical |
| **Gstisadvancepriormonth** | No | No | Logical |
| **Gstisineligibleitcapplicable** | No | No | Logical |
| **Gstitcdocumenttype** | No | No | String |
| **Gstitcreversaldetails** | No | No | String |
| **Gstmerchantid** | No | No | String |
| **Gstnature** | No | No | String (Sysname) |
| **Gstnatureofreturn** | No | No | String |
| **Gstnatureofvoucher** | No | No | String |
| **Gstnotexported** | No | No | Logical |
| **Gstpymtmodeofdeposit** | No | No | String |
| **Gstr1status** | No | No | String (Sysname) |
| **Gstr2astatus** | No | No | String (Sysname) |
| **Gstr2bstatus** | No | No | String (Sysname) |
| **Gstr3bstatus** | No | No | String (Sysname) |
| **Gstr4status** | No | No | String (Sysname) |
| **Gstreasonforrejection** | No | No | String |
| **Gstreconstatus** | No | No | String (Sysname) |
| **Gstregistration** | No | No | String (Master Reference) |
| **Gstregistrationtype** | No | No | String (Sysname) |
| **Gstsupplytype** | No | No | String (Sysname) |
| **Guid** | No | No | String |
| **Haryanavat** | Yes | No | [Haryanavat](Haryanavat.md) |
| **Has Cash Flow** | No | No | Logical |
| **Has Discounts** | No | No | Logical |
| **Holdreference** | No | No | String |
| **Igneinvvalidcrc** | No | No | Number (Integer) |
| **Ignextnvalidcrc** | No | No | Number (Integer) |
| **Igngenerationvalidcrc** | No | No | Number (Integer) |
| **Igngstfmtcrc** | No | No | Number (Integer) |
| **Igngstoptuncertcrc** | No | No | Number (Integer) |
| **Igngstvalidcrc** | No | No | Number (Integer) |
| **Ignoreeinvvalidation** | No | No | Logical |
| **Ignoregstconflictinmig** | No | No | Logical |
| **Ignoregstformatvalidation** | No | No | Logical |
| **Ignoregstinvalidation** | No | No | Logical |
| **Ignoregstoptionaluncertain** | No | No | Logical |
| **Ignoreorigvchdate** | No | No | Logical |
| **Ignoreposvalidation** | No | No | Logical |
| **Ignpartbvalidcrc** | No | No | Number (Integer) |
| **Igntransidvalidcrc** | No | No | Number (Integer) |
| **Importerexportercode** | No | No | String |
| **Includeadvpymtvch** | No | No | Logical |
| **Indent No** | No | No | String |
| **Indentduedate** | No | No | Date |
| **Inspdocdate** | No | No | Date |
| **Inspdocno** | No | No | String |
| **Invdeliverydate** | No | No | Date |
| **Inventory Entries** | Yes | No | [Inventory Entry](Inventory%20Entry.md) |
| **Inventory Entries In** | Yes | No | [Inventory Entry](Inventory%20Entry.md) |
| **Inventory Entries Out** | Yes | No | [Inventory Entry](Inventory%20Entry.md) |
| **Invoice Del Notes** | Yes | No | [Invoice Del Notes](Invoice%20Del%20Notes.md) |
| **Invoice Orderlist** | Yes | No | [Invoice Orderlist](Invoice%20Orderlist.md) |
| **Invoiceexportlist** | Yes | No | [Invoiceexportlist](Invoiceexportlist.md) |
| **Irn** | No | No | String |
| **Irn Ackdate** | No | No | Date |
| **Irn Ackno** | No | No | String |
| **Irn Ackupdatedatetime** | No | No | DateTime |
| **Irn Qrcode** | No | No | String |
| **Irncancelcode** | No | No | String |
| **Irncanceldate** | No | No | Date |
| **Irncancelled** | No | No | Logical |
| **Irncancelreason** | No | No | String |
| **Irnerrorlist** | Yes | No | [Exchange Error List](Exchange%20Error%20List.md) |
| **Irnirpsource** | No | No | String |
| **Irnjsonexported** | No | No | Logical |
| **Irp Buyer Gstin** | No | No | String |
| **Irp Doc Date** | No | No | Date |
| **Irp Doc No** | No | No | String |
| **Irp Doc Type** | No | No | String |
| **Irp Invoice Value** | No | No | Number |
| **Irp Irn** | No | No | String |
| **Irp Irn Date** | No | No | Date |
| **Irp Item Count** | No | No | Number |
| **Irp Main Item Code** | No | No | String |
| **Irp Seller Gstin** | No | No | String |
| **Is Cancelled** | No | No | Logical |
| **Is Costcentre** | No | No | Logical |
| **Is Deemed Positive** | No | No | Logical |
| **Is Ecommerce Supply** | No | No | Logical |
| **Is Ewaybill Applicable** | No | No | Logical |
| **Is Invoice** | No | No | Logical |
| **Is Op Bal Transaction** | No | No | Logical |
| **Is Optional** | No | No | Logical |
| **Is Post Dated** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isaltered** | No | No | Logical |
| **Isauditedvchmodified** | No | No | Logical |
| **Isblankcheque** | No | No | Logical |
| **Isboenotapplicable** | No | No | Logical |
| **Iscommonparty** | No | No | Logical |
| **Iscstdelcaredgoodssales** | No | No | Logical |
| **Isd Document Date** | No | No | Date |
| **Isddcnotedocnumber** | No | No | String |
| **Isddocumentnumber** | No | No | String |
| **Isdeclaredtocustoms** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Isdeletedretained** | No | No | Logical |
| **Isdeletedvchretained** | No | No | Logical |
| **Isdeliverynotetagged** | No | No | Logical |
| **Isdeliverysameasconsignee** | No | No | Logical |
| **Isdesignatedzoneparty** | No | No | Logical |
| **Isdispatchsameasconsignor** | No | No | Logical |
| **Isdraft** | No | No | Logical |
| **Iseditlogpresent** | No | No | Logical |
| **Iseligibleforitc** | No | No | Logical |
| **Isexcisemanufactureron** | No | No | Logical |
| **Isexciseoverridden** | No | No | Logical |
| **Isexcisesupplyvch** | No | No | Logical |
| **Isexcisevoucher** | No | No | Logical |
| **Isexer1nopoverwrite** | No | No | Logical |
| **Isexer3nopoverwrite** | No | No | Logical |
| **Isexf2nopoverwrite** | No | No | Logical |
| **Isfetchedonly** | No | No | Logical |
| **Isforjobworkin** | No | No | Logical |
| **Isgstoverridden** | No | No | Logical |
| **Isgstovrdncrc** | No | No | Number (Integer) |
| **Isgstrefund** | No | No | Logical |
| **Isgstsecsevenapplicable** | No | No | Logical |
| **Isisdvoucher** | No | No | Logical |
| **Isnatureofentrymismatched** | No | No | Logical |
| **Isnegisposset** | No | No | Logical |
| **Isnull** | No | No | Logical |
| **Isonhold** | No | No | Logical |
| **Isoverseastouristtrans** | No | No | Logical |
| **Isremovebankalloclinks** | No | No | Logical |
| **Isreversechargeapplicable** | No | No | Logical |
| **Isservicetaxoverridden** | No | No | Logical |
| **Isshippingwithinstate** | No | No | Logical |
| **Isstxnonrealizedvch** | No | No | Logical |
| **Issubworkscontract** | No | No | Logical |
| **Issummary** | No | No | Logical |
| **Issystem** | No | No | Logical |
| **Istcsoverridden** | No | No | Logical |
| **Istdsoverridden** | No | No | Logical |
| **Istdstcscashvch** | No | No | Logical |
| **Isvatdutypaid** | No | No | Logical |
| **Isvatoverridden** | No | No | Logical |
| **Isvatpaidatcustoms** | No | No | Logical |
| **Isvatprincipalaccount** | No | No | Logical |
| **Isvatrestaxinv** | No | No | Logical |
| **Isvatrestaxinvoice** | No | No | Logical |
| **Isvchfromsplit** | No | No | Logical |
| **Isvoid** | No | No | Logical |
| **Itemstate** | No | No | String |
| **Lbt Mappedcategory** | No | No | String (Sysname) |
| **Lbt Mappedzone** | No | No | String |
| **Lbt Natureofliability** | No | No | String (Sysname) |
| **Ledger Entries** | Yes | No | [Ledger Entry](Ledger%20Entry.md) |
| **Ledger Name** | No | No | String |
| **Lorryrecptdate** | No | No | Date |
| **Lorryrecptno** | No | No | String |
| **Lutdateofissue** | No | No | Date |
| **Lutexpirydate** | No | No | Date |
| **Lutnumber** | No | No | String |
| **Mahwcassessablevalue** | No | No | Amount |
| **Masterid** | No | No | Number (Integer) |
| **Mfg Journal** | No | No | Logical |
| **Mfgraddresstype** | No | No | String |
| **Narration** | No | No | String |
| **Natureoftransaction** | No | No | String |
| **Natureofvoucher** | No | No | String |
| **Numberingstyle** | No | No | String (Sysname) |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Oldauditentries** | Yes | No | [Audit Entries](Audit%20Entries.md) |
| **Oldauditentryids** | No | Yes | Number (Integer) |
| **Opbalanceusedfor** | No | No | String (Sysname) |
| **Openingvchfor** | No | No | String (Sysname) |
| **Order Line Status** | No | No | Logical |
| **Originalvchdate** | No | No | Date |
| **Originalvchnumber** | No | No | String |
| **Originvoicedetails** | Yes | No | [Originvoicedetails](Originvoicedetails.md) |
| **Ovrdnewaybillapplicability** | No | No | Logical |
| **Party Ledger Name** | No | No | String (Master Reference) |
| **Party Name** | No | No | String |
| **Partyaddresstype** | No | No | String |
| **Partygstin** | No | No | String |
| **Partygstisothterritoryassessee** | No | No | Logical |
| **Partyinvdate** | No | No | Date |
| **Partyinvno** | No | No | String |
| **Partylocation** | No | No | String (Sysname) |
| **Partymailingname** | No | No | String |
| **Partyorderdate** | No | No | Date |
| **Partyorderno** | No | No | String |
| **Partypincode** | No | No | String |
| **Pay Allocations** | Yes | No | [Bank Allocations](Bank%20Allocations.md) |
| **Payment Link** | No | No | String |
| **Payment Link Amount** | No | No | Amount |
| **Payment Link Expiry Date** | No | No | Date |
| **Payment Link Has Multi Ref** | No | No | Logical |
| **Persisted View** | No | No | String (Sysname) |
| **Pftdlversioninfo** | Yes | No | [Platformversioninfo](Platformversioninfo.md) |
| **Placeofsupply** | No | No | String |
| **Placeofsupplycountry** | No | No | String |
| **Placeofsupplystate** | No | No | String |
| **Pointoftransaction** | No | No | String |
| **Portcode** | No | No | String |
| **Portname** | No | No | String |
| **Pos Card Ledger** | No | No | String (Master Reference) |
| **Pos Card Number** | No | No | String |
| **Pos Cash Ledger** | No | No | String (Master Reference) |
| **Pos Cash Received** | No | No | Amount |
| **Pos Cheque Bank Name** | No | No | String |
| **Pos Cheque Ledger** | No | No | String (Master Reference) |
| **Pos Cheque Number** | No | No | String |
| **Pos Gift Ledger** | No | No | String (Master Reference) |
| **Prevreferences** | No | Yes | String |
| **Price Level** | No | No | String |
| **Prioritystateconflict** | No | No | String |
| **Processingduration** | No | No | Due Date |
| **Purposeofpurchase** | No | No | String |
| **Purposetype** | No | No | String (Sysname) |
| **Qrcode Crc** | No | No | Number (Integer) |
| **Rateofinvoicetax** | No | No | Number (Integer) |
| **Reconcilation Date** | No | No | Date |
| **Reference** | No | No | String |
| **Referencedate** | No | No | Date |
| **Refferedvchentries** | Yes | No | [Voucher](Voucher.md) |
| **Refferedvchlist** | No | Yes | Number (Integer) |
| **Refundorderdt** | No | No | Date |
| **Refundorderno** | No | No | String |
| **Refundvoucherdate** | No | No | Date |
| **Refundvouchernumber** | No | No | String |
| **Remarks** | No | No | String |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Remotevchkey** | No | No | String |
| **Requestorrule** | No | No | String |
| **Resetirnqrcode** | No | No | Logical |
| **Returninvoicedate** | No | No | Date |
| **Returnname** | No | No | String (Sysname) |
| **Reuseholeid** | No | No | Number (Integer) |
| **Sectionname** | No | No | String (Sysname) |
| **Serialmaster** | No | No | String (Master Reference) |
| **Serialnumber** | No | No | String |
| **Settlementtype** | No | No | String (Sysname) |
| **Shipagentaddress** | No | Yes | String |
| **Shipagentname** | No | No | String |
| **Shipname** | No | No | String |
| **Shippingbilldate** | No | No | Date |
| **Shippingbillno** | No | No | String |
| **Shiptoplace** | No | No | String |
| **Sort Position** | No | No | Number (Integer) |
| **Sourceofcreate** | No | No | String (Sysname) |
| **Srvtregnumber** | No | No | String |
| **Statadjustmenttype** | No | No | String (Master Reference) |
| **State Name** | No | No | String |
| **Statpaymenttype** | No | No | String (Sysname) |
| **Statusbeforecreate** | No | No | String (Sysname) |
| **Stnatureofvoucher** | No | No | String |
| **Stock Item Name** | No | No | String |
| **Sttaxbankchallannumber** | No | No | String |
| **Sttaxchallandate** | No | No | Date |
| **Sttvchrhandle** | No | No | String |
| **Sumautovchnum** | No | No | String |
| **Supplementarydutyheaddetails** | Yes | No | [Supplementarydutyheaddetails](Supplementarydutyheaddetails.md) |
| **Supplieriecode** | No | No | String |
| **Supplierlbtregnno** | No | No | String |
| **Supplierlbtzone** | No | No | String |
| **Tax Bank Challan Number** | No | No | String |
| **Tax Bank Name** | No | No | String |
| **Tax Challan Bsr Code** | No | No | String |
| **Tax Challan Date** | No | No | Date |
| **Tax Cheque Number** | No | No | String |
| **Taxadjustment** | No | No | String |
| **Taxbankaccountnumber** | No | No | String |
| **Taxbankbranchname** | No | No | String |
| **Taxchequedate** | No | No | Date |
| **Taxinvoiceno** | No | No | String |
| **Taxpaymenttype** | No | No | String (Sysname) |
| **Taxpayperiodfromdate** | No | No | Date |
| **Taxpayperiodtodate** | No | No | Date |
| **Taxunitname** | No | No | String (Master Reference) |
| **Tcsadjustmenttype** | No | No | String (Sysname) |
| **Tdnofawarder** | No | No | String |
| **Tdsadjustmenttype** | No | No | String (Sysname) |
| **Tdsdednstatus** | No | No | String (Sysname) |
| **Tdsdeducted** | No | No | Amount |
| **Tdsnatureofpayment** | No | No | String (Master Reference) |
| **Tdssectionno** | No | No | String |
| **Todate** | No | No | Date |
| **Totalvercount** | No | No | Number (Integer) |
| **Traderconscommissionerate** | No | No | String |
| **Traderconsdivision** | No | No | String |
| **Traderconsexciseregnno** | No | No | String |
| **Traderconsrange** | No | No | String |
| **Traderconsvattinno** | No | No | String |
| **Tradermfgraddress** | No | Yes | String |
| **Tradermfgrcommissionerate** | No | No | String |
| **Tradermfgrdivision** | No | No | String |
| **Tradermfgrexciseregnno** | No | No | String |
| **Tradermfgrinvoicedt** | No | No | Date |
| **Tradermfgrinvoiceno** | No | No | String |
| **Tradermfgrname** | No | No | String |
| **Tradermfgrrange** | No | No | String |
| **Tradersuppcommissionerate** | No | No | String |
| **Tradersuppdivision** | No | No | String |
| **Tradersuppexciseregnno** | No | No | String |
| **Tradersupprange** | No | No | String |
| **Transactionispurchase** | No | No | Logical |
| **Transactionissales** | No | No | Logical |
| **Transbuyerlandingdate** | No | No | Date |
| **Transcategory** | No | No | String |
| **Transporteraddrarea** | No | No | String |
| **Transporteraddrbldg** | No | No | String |
| **Transporteraddrdist** | No | No | String |
| **Transporteraddrfax** | No | No | String |
| **Transporteraddrphone** | No | No | String |
| **Transporteraddrpincode** | No | No | String |
| **Transporteraddrroad** | No | No | String |
| **Transporteraddrroom** | No | No | String |
| **Transporteraddrstate** | No | No | String |
| **Transporteraddrtown** | No | No | String |
| **Transportername** | No | No | String |
| **Transportervehicle2** | No | No | String |
| **Transportlocaltin** | No | No | String |
| **Transportmode** | No | No | String |
| **Transsalelandingdate** | No | No | Date |
| **Transsourceplace** | No | No | String |
| **Typeofexcisevoucher** | No | No | String (Sysname) |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Updatesummaryvalues** | No | No | Logical |
| **Updatetype** | No | No | String (Sysname) |
| **Urdoriginalsalevalue** | No | No | String (Sysname) |
| **Useforcompound** | No | No | Logical |
| **Useforexcise** | No | No | Logical |
| **Useforfinalproduction** | No | No | Logical |
| **Useforgainloss** | No | No | Logical |
| **Useforgodowntransfer** | No | No | Logical |
| **Useforinterest** | No | No | Logical |
| **Useforservicetax** | No | No | Logical |
| **Usefortaxunittransfer** | No | No | Logical |
| **User Invoice Value** | No | No | Amount |
| **User Subaction** | No | No | String (Sysname) |
| **User Tax Value** | No | No | Amount |
| **User Taxable Value** | No | No | Amount |
| **Usetrackingnumber** | No | No | Logical |
| **Utkagreeorddate** | No | No | Date |
| **Utkagreeordno** | No | No | String |
| **Utkgoodsdeldate** | No | No | Date |
| **Utktransportmode** | No | No | String |
| **Utktransportvehno** | No | No | String |
| **Utktrnsportcmpname** | No | No | String |
| **Valueofsubworkscont** | No | No | Amount |
| **Valueofworkscontract** | No | No | Amount |
| **Vat Analysis** | Yes | No | [Vat Analysis](Vat%20Analysis.md) |
| **Vat Extract** | Yes | No | [Vat Extract](Vat%20Extract.md) |
| **Vat Submission Date** | No | No | Date |
| **Vatadjaddldetails** | No | No | String |
| **Vatadjustmenttype** | No | No | String (Sysname) |
| **Vatadvancepayment** | No | No | Logical |
| **Vatadvpay** | No | No | Logical |
| **Vatbank** | No | No | String |
| **Vatbankaccnumber** | No | No | String |
| **Vatbankbranch** | No | No | String |
| **Vatbankname** | No | No | String |
| **Vatbiltydate** | No | No | Date |
| **Vatbiltyno** | No | No | String |
| **Vatbranch** | No | No | String |
| **Vatbranchcode** | No | No | String |
| **Vatbranchname** | No | No | String |
| **Vatbriefdesc** | No | No | String |
| **Vatbriefdescription** | No | No | String |
| **Vatcancinvdate** | No | No | Date |
| **Vatcancinvno** | No | No | String |
| **Vatcancpurcname** | No | No | String |
| **Vatcancpurctin** | No | No | String |
| **Vatcancsalesinvoicedate** | No | No | Date |
| **Vatcancsalesinvoiceno** | No | No | String |
| **Vatcancsalespartycsttin** | No | No | String |
| **Vatcancsalespartyname** | No | No | String |
| **Vatcategorytype** | No | No | String |
| **Vatcertificateno** | No | No | String |
| **Vatcformissuestate** | No | No | String |
| **Vatchallanagainst** | No | No | String |
| **Vatchallandate** | No | No | Date |
| **Vatchallanno** | No | No | String |
| **Vatchallannumber** | No | No | String |
| **Vatcheckpost** | No | No | String |
| **Vatcheckpostname** | No | No | String |
| **Vatconsignmentno** | No | No | Number |
| **Vatcontracteedistrict** | No | No | String |
| **Vatcontracteename** | No | No | String |
| **Vatcontracteetdn** | No | No | String |
| **Vatcste1date** | No | No | Date |
| **Vatcste1serialno** | No | No | String |
| **Vatcste1serialnumber** | No | No | String |
| **Vatcste1seriesdate** | No | No | Date |
| **Vatcste1seriesno** | No | No | String |
| **Vatcste1seriesnumber** | No | No | String |
| **Vatcustomsentryno** | No | No | String |
| **Vatddchequedate** | No | No | Date |
| **Vatddchequeno** | No | No | String |
| **Vatdealernature** | No | No | String |
| **Vatdealertype** | No | No | String (Sysname) |
| **Vatdelay** | No | No | Date |
| **Vatdemandpurpose** | No | No | String |
| **Vatdepositdate** | No | No | Date |
| **Vatdescription** | No | No | String |
| **Vatdesigofpurchaser** | No | No | String |
| **Vatdestinationdistrict** | No | No | String |
| **Vatdestinationplace** | No | No | String |
| **Vatdestinationstate** | No | No | String |
| **Vatdeviceno** | No | No | String |
| **Vatdispatchtime** | No | No | String |
| **Vatdistrictname** | No | No | String |
| **Vatdocumentdate** | No | No | Date |
| **Vatdocumentnumber** | No | No | String |
| **Vatdocumenttype** | No | No | String |
| **Vatdraftchequeno** | No | No | String |
| **Vatdriveraddress** | No | No | String |
| **Vatduedate** | No | No | Date |
| **Vateformapplicable** | No | No | String |
| **Vateformapplicableno** | No | No | String |
| **Vatexemptcertificateno** | No | No | String |
| **Vatexemptcertifino** | No | No | String |
| **Vatexportentryno** | No | No | String |
| **Vatexportentrynumber** | No | No | String |
| **Vatform38no** | No | No | String |
| **Vatform49no** | No | No | String |
| **Vatformstatus** | No | No | String |
| **Vatformsubmissiondate** | No | No | Date |
| **Vatformtwelvedate** | No | No | Date |
| **Vatformtwelveno** | No | No | String |
| **Vatgoodsrcptno** | No | No | String |
| **Vatgoodsreceiptdate** | No | No | Date |
| **Vatgoodsreceiptnumber** | No | No | String |
| **Vatgoodsvalue** | No | No | Amount |
| **Vatgrndate** | No | No | Date |
| **Vatincourseof** | No | No | String |
| **Vatintdate** | No | No | Date |
| **Vatisagnstcancsales** | No | No | Logical |
| **Vatisassesablecalcvch** | No | No | Logical |
| **Vatispurcexempted** | No | No | Logical |
| **Vatissuebank** | No | No | String |
| **Vatlicensestate** | No | No | String |
| **Vatmobilenumber** | No | No | String |
| **Vatorderdate** | No | No | Date |
| **Vatorderno** | No | No | String |
| **Vatpaidagainst** | No | No | String |
| **Vatpartnername** | No | No | String |
| **Vatpartyitcclaimed** | No | No | Amount |
| **Vatpartyorgname** | No | No | String |
| **Vatpartyorgtype** | No | No | String |
| **Vatpartytaxliability** | No | No | Amount |
| **Vatpartytransreturndate** | No | No | Date |
| **Vatpartytransreturnnumber** | No | No | String |
| **Vatpartytype** | No | No | String |
| **Vatpaymentmode** | No | No | String |
| **Vatpermitform** | No | No | String |
| **Vatpurchasercpttype** | No | No | String |
| **Vatpurchasevalue** | No | No | Amount |
| **Vatpurposecode** | No | No | String |
| **Vatpymtmodeofdeposit** | No | No | String |
| **Vatpymttaxdesc** | No | No | String |
| **Vatrateoftax** | No | No | Number (Integer) |
| **Vatregistrationdate** | No | No | Date |
| **Vatsellertin** | No | No | String |
| **Vatsourcedistrict** | No | No | String |
| **Vatsourcestate** | No | No | String |
| **Vattdsamt** | No | No | Amount |
| **Vattdsbarcode** | No | No | String |
| **Vattdsdate** | No | No | Date |
| **Vattdsdeductorname** | No | No | String |
| **Vattdsrate** | No | No | Number |
| **Vattransbillno** | No | No | String |
| **Vattransbillqty** | No | No | String |
| **Vattransporteraddress** | No | No | String |
| **Vattranssource** | No | No | String |
| **Vattreasury** | No | No | String |
| **Vattype** | No | No | String |
| **Vattypeofdevice** | No | No | String |
| **Vatvchrhandle** | No | No | String |
| **Vatvehicleno** | No | No | String |
| **Vatvehiclenumber** | No | No | String |
| **Vatwaybillno** | No | No | String |
| **Vatwaybillnumber** | No | No | String |
| **Vatwaybillqty** | No | No | String |
| **Vatwcdeductionamt** | No | No | Amount |
| **Vatwcdeductionperc** | No | No | Number (Integer) |
| **Vatwcdesc** | No | No | String |
| **Vatwcotherdeductamt** | No | No | Amount |
| **Vch Entries** | Yes | No | [Vch Entry](Vch%20Entry.md) |
| **Vchalteredbytypeid** | No | Yes | String (Sysname) |
| **Vchempattdtotaltree** | Yes | No | Vchempattdtotaltree |
| **Vchentrymode** | No | No | String (Sysname) |
| **Vchgstclass** | No | No | String (Sysname) |
| **Vchgststatusisapplicable** | No | No | Logical |
| **Vchgststatusisbranchtransferout** | No | No | Logical |
| **Vchgststatusisexcluded** | No | No | Logical |
| **Vchgststatusisgstr2bindiffperiod** | No | No | Logical |
| **Vchgststatusisgstr2bmismatch** | No | No | Logical |
| **Vchgststatusisgstr2bonlyinbooks** | No | No | Logical |
| **Vchgststatusisgstr2bonlyinportal** | No | No | Logical |
| **Vchgststatusisgstr2breconciled** | No | No | Logical |
| **Vchgststatusisincluded** | No | No | Logical |
| **Vchgststatusisoptionaluncertain** | No | No | Logical |
| **Vchgststatusisoverrdn** | No | No | Logical |
| **Vchgststatusisreteffdateoverrdn** | No | No | Logical |
| **Vchgststatusisretindiffdate** | No | No | Logical |
| **Vchgststatusisstatindiffdate** | No | No | Logical |
| **Vchgststatusissystemsummary** | No | No | Logical |
| **Vchgststatusisuncertain** | No | No | Logical |
| **Vchgststatusmainsectionexcluded** | No | No | Logical |
| **Vchisexportedtoewaybill** | No | No | Logical |
| **Vchisexportedtogst** | No | No | Logical |
| **Vchisfromsync** | No | No | Logical |
| **Vchledcsttotaltree** | Yes | No | VchCstLedTotalTree |
| **Vchledtotaltree** | Yes | No | Vchledtotaltree |
| **Vchonlyaddlinfoupdated** | No | No | Logical |
| **Vchpropcurnegispos** | No | No | Logical |
| **Vchpropdeleted** | No | No | Logical |
| **Vchpropisstkjrnl** | No | No | Logical |
| **Vchproppreferredid** | No | No | Number (Integer) |
| **Vchproppreferredischild** | No | No | Logical |
| **Vchreferencedate** | No | No | Date |
| **Vchretainedpurpose** | No | No | String (Sysname) |
| **Vchstatusdate** | No | No | Date |
| **Vchstatusdummylong** | No | No | Number (Integer) |
| **Vchstatusiscancelled** | No | No | Logical |
| **Vchstatusisdeleted** | No | No | Logical |
| **Vchstatusisfetchedonly** | No | No | Logical |
| **Vchstatusisopeningbalance** | No | No | Logical |
| **Vchstatusisoptional** | No | No | Logical |
| **Vchstatusisreaccephsnsixonedone** | No | No | Logical |
| **Vchstatusisreacceptforhsndone** | No | No | Logical |
| **Vchstatusisunregisteredrcm** | No | No | Logical |
| **Vchstatusisvchnumused** | No | No | Logical |
| **Vchstatustaxadjustment** | No | No | String (Sysname) |
| **Vchstatustaxunit** | No | No | String (Master Reference) |
| **Vchstatusvouchertype** | No | No | String (Master Reference) |
| **Vchtaxtype** | No | No | String (Sysname) |
| **Vchtaxunit** | No | No | String (Master Reference) |
| **Vchvatdepositdate** | No | No | Date |
| **Vchvatdocumenttype** | No | No | String |
| **Vercount** | No | No | Number (Integer) |
| **Version** | No | No | Number |
| **Voucher Destinationgodown** | No | No | String |
| **Voucher Number Series** | No | No | String |
| **Voucher Type Orig Name** | No | No | String (Master Reference) |
| **Voucherid** | No | No | Number (Integer) |
| **Voucherkey** | No | No | Number (64 bit) |
| **Vouchernumber** | No | No | String |
| **Voucherretainkey** | No | No | Number (64 bit) |
| **Vouchersourcegodown** | No | No | String |
| **Vouchertime** | No | No | String |
| **Vouchertypename** | No | No | String (Master Reference) |
| **Wbtransferassessrate** | No | No | Number (Integer) |
| **Wbtransferbasevalue** | No | No | Amount |
