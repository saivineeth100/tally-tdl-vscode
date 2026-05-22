# Voucher Type Schema

> **Version**: 7.0

Reference documentation for the **Voucher Type** schema.

### Meta

- **Aliases**: Voucher Types
- **SDF Id**: VT
- **Is Primary**: Yes

> **Total Properties**: 158

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Additional Name** | No | No | String |
| **Affects Stock** | No | No | Logical |
| **All Vouchers** | No | No | Number |
| **Allowconsumption** | No | No | Logical |
| **Allowmultipletaxunitsperseries** | No | No | Logical |
| **Altercount** | No | No | Number (Integer) |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Altertotalvercount** | No | No | Number (Integer) |
| **Altervercount** | No | No | Number (Integer) |
| **Asmfgjrnl** | No | No | Logical |
| **Asoriginal** | No | No | Logical |
| **Basetype** | No | No | Number (Integer) |
| **Beginning Number** | No | No | Number (Integer) |
| **Bill Credit Period** | No | No | String |
| **Can Delete** | No | No | Logical |
| **Cancelled Vouchers** | No | No | Number |
| **Closing Balance** | No | No | Amount |
| **Cnotecontra** | No | No | String (Master Reference) |
| **Commonnarration** | No | No | Logical |
| **Contracontra** | No | No | String (Master Reference) |
| **Credit Totals** | No | No | Amount |
| **Creditcstctr** | No | No | String (Master Reference) |
| **Debit Totals** | No | No | Amount |
| **Debitcstctr** | No | No | String (Master Reference) |
| **Default Gst Registration** | No | No | String (Master Reference) |
| **Defaultexciseregistration** | No | No | String (Master Reference) |
| **Defaultstregistration** | No | No | String (Master Reference) |
| **Defaulttemplatename** | No | No | String |
| **Delcount** | No | No | Number (Integer) |
| **Deltotalvercount** | No | No | Number (Integer) |
| **Delvercount** | No | No | Number (Integer) |
| **Depth** | No | No | Number |
| **Diffactqty** | No | No | Logical |
| **Discappl** | No | No | Logical |
| **Dnotecontra** | No | No | String (Master Reference) |
| **Effective Date** | No | No | Logical |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Excise Tariff Details** | Yes | No | [Excise Tariff Details](Excise%20Tariff%20Details.md) |
| **Excisebookname** | No | No | String (Master Reference) |
| **Exciseunitname** | No | No | String (Master Reference) |
| **Excludeewaybillforupload** | No | No | Logical |
| **First Voucher Date** | No | No | Date |
| **Formalreceipt** | No | No | Logical |
| **Generateewaybillaftersave** | No | No | Logical |
| **Getpymtlinkaftersave** | No | No | Logical |
| **Guid** | No | No | String |
| **Hasvouchers** | No | No | Logical |
| **Is Deemed Positive** | No | No | Logical |
| **Is Optional** | No | No | Logical |
| **Is Reserved** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Is Tax Invoice** | No | No | Logical |
| **Isactive** | No | No | Logical |
| **Isdefaultallocenabled** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Isewayapplicable** | No | No | Logical |
| **Isforjobworkin** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Isuseforexcise** | No | No | String |
| **Journalcontra** | No | No | String (Master Reference) |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Last Gst Tax Unit by Series** | No | Yes | String (Master Reference) |
| **Last Series by Gst Tax Unit** | No | Yes | String (Master Reference) |
| **Last Voucher Date** | No | No | Date |
| **Last Whatsapp Template** | No | No | String |
| **Lastgsttaxunit** | No | No | String (Master Reference) |
| **Lastnumber** | No | No | String |
| **Lastvchnumseries** | No | No | String (Master Reference) |
| **Lbtdeclaration** | No | No | String |
| **Masterid** | No | No | Number (Integer) |
| **Masterreserveid** | No | No | Number (Integer) |
| **Multinarration** | No | No | Logical |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Natureoftransaction** | No | No | String (Sysname) |
| **Nonaltercount** | No | No | Number (Integer) |
| **Nonaltertotalvercount** | No | No | Number (Integer) |
| **Nonaltervercount** | No | No | Number (Integer) |
| **Numbering Method** | No | No | String (Sysname) |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Opening Balance** | No | No | Amount |
| **Optional Vouchers** | No | No | Number |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Parent** | No | No | String |
| **Parent Hierarchy** | No | Yes | String |
| **Paymentcontra** | No | No | String (Master Reference) |
| **Pos Message Line1** | No | No | String |
| **Pos Message Line2** | No | No | String |
| **Posreturntype** | No | No | String |
| **Prefill Zero** | No | No | Logical |
| **Prefix List** | Yes | No | [Prefix Suffix List](Prefix%20Suffix%20List.md) |
| **Prev Narration** | No | No | String |
| **Prevent Duplicates** | No | No | Logical |
| **Previousgodown** | No | No | String (Master Reference) |
| **Previouspurchase** | No | No | String (Master Reference) |
| **Previoussales** | No | No | String (Master Reference) |
| **Printaftersave** | No | No | Logical |
| **Printbookno** | No | No | Logical |
| **Productcodedetails** | Yes | No | [Productcodedetails](Productcodedetails.md) |
| **Purchasecontra** | No | No | String (Master Reference) |
| **Receiptcontra** | No | No | String (Master Reference) |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Reserved Name** | No | No | String |
| **Restart From List** | Yes | No | [Restart From List](Restart%20From%20List.md) |
| **Salescontra** | No | No | String (Master Reference) |
| **Samplingamtonefactor** | No | No | Amount |
| **Samplingamttwofactor** | No | No | Amount |
| **Samplingdateonefactor** | No | No | Date |
| **Samplingdatetwofactor** | No | No | Date |
| **Samplingmethod** | No | No | String (Sysname) |
| **Samplingnumonefactor** | No | No | Number |
| **Samplingnumtwofactor** | No | No | Number |
| **Samplingstronefactor** | No | No | String (Sysname) |
| **Showdeletedvchnum** | No | No | Logical |
| **Sort Position** | No | No | Number (Integer) |
| **Suffix List** | Yes | No | [Prefix Suffix List](Prefix%20Suffix%20List.md) |
| **Targetremoteid** | No | Yes | String |
| **Taxunitname** | No | No | String (Master Reference) |
| **Total Vouchers** | No | No | Number |
| **Trackaddlcost** | No | No | Logical |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Un Accounted Vouchers** | No | No | Number |
| **Updateddatetime** | No | No | DateTime |
| **Use For Pos Invoice** | No | No | Logical |
| **Useforexcise** | No | No | Logical |
| **Useforexcisegoods** | No | No | Logical |
| **Useforexcisesupplementary** | No | No | Logical |
| **Useforexcisetraderinvoice** | No | No | Logical |
| **Useforjobwork** | No | No | Logical |
| **Usezeroentries** | No | No | Logical |
| **Vatinvoiceformat** | No | No | String |
| **Vch Print Addl Decl** | No | No | String |
| **Vch Print Decl** | No | No | String |
| **Vch Print Decl Native** | No | No | String |
| **Vch Print Title** | No | No | String |
| **Vch Print Title Native** | No | No | String |
| **Vchdeviceno** | No | No | String |
| **Vchdevicetype** | No | No | String |
| **Vchnum Seriesid** | Yes | No | [Voucher Numbering Series ID](Voucher%20Numbering%20Series%20ID.md) |
| **Vchprintbankname** | No | No | String |
| **Vchprintjurisdiction** | No | No | String |
| **Vchtypeauditdetails** | Yes | No | [Vchtypeauditdetails](Vchtypeauditdetails.md) |
| **Voucher Class List** | Yes | No | [Voucher Class List](Voucher%20Class%20List.md) |
| **Voucher Number Series** | Yes | No | [Vchtype Voucher Number Series](Vchtype%20Voucher%20Number%20Series.md) |
| **Vouchertypename** | No | No | String |
| **Whatsappaftersave** | No | No | Logical |
| **Width Of Number** | No | No | Number (Integer) |
