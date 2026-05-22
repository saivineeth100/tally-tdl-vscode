# Taxunit Schema

> **Version**: 7.0

Reference documentation for the **Taxunit** schema.

### Meta

- **Aliases**: TaxUnits
- **SDF Id**: TU
- **Is Primary**: Yes

> **Total Properties**: 120

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Address** | No | Yes | String |
| **Addressname** | No | No | String |
| **Allow Export Rebate** | No | No | Logical |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Are1serialmaster** | No | No | String (Master Reference) |
| **Are2serialmaster** | No | No | String (Master Reference) |
| **Are3serialmaster** | No | No | String (Master Reference) |
| **Asoriginal** | No | No | Logical |
| **Authorityaddress** | No | No | String |
| **Authorityname** | No | No | String |
| **Can Delete** | No | No | Logical |
| **Donotmarkreconciledimstransasaccepted** | No | No | Logical |
| **Email** | No | No | String |
| **Enableexport** | No | No | Logical |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Esignmethod** | No | No | String (Sysname) |
| **Ewaybill Applicable Amount** | No | No | Amount |
| **Ewaybill Applicable Amount Intra** | No | No | Amount |
| **Ewaybill Applicable Date** | No | No | Date |
| **Ewaybill Applicable Date Prev** | No | No | Date |
| **Ewaybill Applicable Type** | No | No | String (Sysname) |
| **Excise Regnumber** | No | No | String |
| **Excise Tariff Details** | Yes | No | [Excise Tariff Details](Excise%20Tariff%20Details.md) |
| **Excisearename** | No | No | String |
| **Excisebonddetails** | Yes | No | [Excisebonddetails](Excisebonddetails.md) |
| **Excisecommissioneratedetails** | Yes | No | [Excisecommissioneratedetails](Excisecommissioneratedetails.md) |
| **Excisedivisiondetails** | Yes | No | [Excisedivisiondetails](Excisedivisiondetails.md) |
| **Exciselutdetails** | Yes | No | [Exciselutdetails](Exciselutdetails.md) |
| **Excisemailingname** | No | No | String |
| **Excisemfgdetails** | Yes | No | [Excisemfgdetails](Excisemfgdetails.md) |
| **Exciserangedetails** | Yes | No | [Exciserangedetails](Exciserangedetails.md) |
| **Exciseregistrationtype** | No | No | String (Sysname) |
| **Fax Number** | No | No | String |
| **Fetchdataholeinfo** | Yes | No | [Fetched Data Info](Fetched%20Data%20Info.md) |
| **Gst Recon Config Details** | Yes | No | [Gst Recon Config Details](Gst%20Recon%20Config%20Details.md) |
| **Gst Reg Date** | No | No | Date |
| **Gst Reg Number** | No | No | String |
| **Gst Registration Details** | Yes | No | [Gst Registration Details](Gst%20Registration%20Details.md) |
| **Gst Turnover Rate Details** | Yes | No | [Gst Turnover Rate Details](Gst%20Turnover%20Rate%20Details.md) |
| **Gstaddressname** | No | No | String |
| **Gstapplicabledate** | No | No | Date |
| **Gstcompositiondetails** | Yes | No | [GST Composite Details](GST%20Composite%20Details.md) |
| **Gstdetails** | Yes | No | [Gstdetails](Gstdetails.md) |
| **Gsteinvapplicabledate** | No | No | Date |
| **Gsteinvapplicabledateprev** | No | No | Date |
| **Gsteinvbillfromplace** | No | No | String |
| **Gsteinvoicedetails** | Yes | No | [GSTeInvoiceDetail](GSTeInvoiceDetail.md) |
| **Gsteinvreportperiod** | No | No | Number |
| **Gstewaybilldetails** | Yes | No | [GSTeWayBillDetail](GSTeWayBillDetail.md) |
| **Gstn Username** | No | No | String |
| **Gstoldregnumber** | No | No | String |
| **Gstr1periodicity** | No | No | String (Sysname) |
| **Gstregistrationtype** | No | No | String (Sysname) |
| **Guid** | No | No | String |
| **Hsn Details** | Yes | No | [Hsn Details](Hsn%20Details.md) |
| **Is Ewaybill Applicable** | No | No | Logical |
| **Is Ewaybill Applicable For Intra** | No | No | Logical |
| **Is Ewaybill Applicable Prev** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Isewaybillprintapplicable** | No | No | Logical |
| **Isgstadvrcpton** | No | No | Logical |
| **Isgstcesson** | No | No | Logical |
| **Isgsteinvapplicable** | No | No | Logical |
| **Isgsteinvapplicableprev** | No | No | Logical |
| **Isgsteinvinclewaybill** | No | No | Logical |
| **Isgstonforpurc** | No | No | Logical |
| **Isgstrcon** | No | No | Logical |
| **Isgstrdownloadapplicable** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isothterritoryassessee** | No | No | Logical |
| **Isprimaryexciseunit** | No | No | Logical |
| **Isprimaryunit** | No | No | Logical |
| **Isstatecessapplicable** | No | No | Logical |
| **Istraderrgnumberon** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Last Exchange Info** | Yes | No | [LAST Update Time Info](LAST%20Update%20Time%20Info.md) |
| **Lut Details** | Yes | No | [Lut Details](Lut%20Details.md) |
| **Lut Details Old** | Yes | No | [Lut Details Old](Lut%20Details%20Old.md) |
| **Masterid** | No | No | Number (Integer) |
| **Migsrcidforgstreg** | No | No | Number (Integer) |
| **Mobilenumber** | No | No | String |
| **Name** | No | Yes | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Oldgstcompositiondetails** | Yes | No | [Gst Composite Details](GST%20Composite%20Details.md) |
| **Pan** | No | No | String |
| **Parent** | No | No | String (Master Reference) |
| **Phonenumber** | No | No | String |
| **Pin Code** | No | No | String |
| **Prior State Name** | No | No | String (Sysname) |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Serialnumberlist** | Yes | No | [Serialnumberlist](Serialnumberlist.md) |
| **Servicetaxdetails** | Yes | No | [Servicetaxdetails](Servicetaxdetails.md) |
| **Servicetaxissez** | No | No | Logical |
| **Sort Position** | No | No | Number (Integer) |
| **St Org Type** | No | No | String |
| **St Reg Date** | No | No | Date |
| **St Reg Number** | No | No | String |
| **State Name** | No | No | String |
| **Statecessapplicabledate** | No | No | Date |
| **Stisinputservdistributor** | No | No | Logical |
| **Stismonthlyreturns** | No | No | Logical |
| **Stisstlargetaxpayer** | No | No | Logical |
| **Stlargetaxpayerunit** | No | No | String |
| **Sttaxliabcomputedtls** | Yes | No | [Sttaxliabcomputedtls](Sttaxliabcomputedtls.md) |
| **Targetremoteid** | No | Yes | String |
| **Traderrgnoprefix** | No | No | String |
| **Traderrgnosuffix** | No | No | String |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Usedfor** | No | No | String (Sysname) |
| **Useforjewellery** | No | No | Logical |
| **Website** | No | No | String |
