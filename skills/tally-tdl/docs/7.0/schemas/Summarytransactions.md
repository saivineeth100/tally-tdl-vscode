# Summarytransactions Schema

> **Version**: 7.0

Reference documentation for the **Summarytransactions** schema.

### Meta

- **SDF Id**: SU
- **Is Primary**: Yes

> **Total Properties**: 76

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Accountid** | No | No | String |
| **Adjustment Details** | No | No |  |
| **Alteredby** | No | No | String |
| **Alteredmasters** | Yes | No | [Alteredmasterslist](Alteredmasterslist.md) |
| **Alteredon** | No | No | Date |
| **Alterid** | No | No | Number (Integer) |
| **Annexerrorcount** | No | No | Number |
| **Annexvchcount** | No | No | Number |
| **Audited On** | No | No | Date |
| **Can Delete** | No | No | Logical |
| **Cancelled Vouchers** | Yes | No | [Modifiedvch](Modifiedvch.md) |
| **Categorydetails** | Yes | No | [Categorydetails](Categorydetails.md) |
| **Cenvatcreditavaileddetails** | Yes | No | [Cenvatcreditdetails](Cenvatcreditdetails.md) |
| **Cenvatcreditutilizeddetails** | Yes | No | [Cenvatcreditdetails](Cenvatcreditdetails.md) |
| **Challandetails** | Yes | No | [Challandetails](Challandetails.md) |
| **Dateoffiling** | No | No | Date |
| **Deleted Vouchers** | Yes | No | [Modifiedvch](Modifiedvch.md) |
| **Enteredby** | No | No | String |
| **Formtype** | No | No | String |
| **Fromdate** | No | No | Date |
| **Godown Name** | No | No | String (Master Reference) |
| **Guid** | No | No | String |
| **Interunitprimarytransferchallans** | Yes | No | [Interunitprimarytransferchallans](Interunitprimarytransferchallans.md) |
| **Interunitsecondarytransferchallans** | Yes | No | [Interunitprimarytransferchallans](Interunitprimarytransferchallans.md) |
| **Interunittransferin** | Yes | No | [Interunittransfer](Interunittransfer.md) |
| **Interunittransferout** | Yes | No | [Interunittransfer](Interunittransfer.md) |
| **Inventorydetails** | Yes | No | [Inventorydetails](Inventorydetails.md) |
| **Iscompoundsummary** | No | No | Logical |
| **Isfetchedonly** | No | No | Logical |
| **Isprofitmargin** | No | No | Logical |
| **Isrefundclaimed** | No | No | Logical |
| **Isrevisedsumtrans** | No | No | Logical |
| **Issuedinvoices** | Yes | No | [Issuedinvoices](Issuedinvoices.md) |
| **Issummarydirty** | No | No | Logical |
| **Issummaryfrozen** | No | No | Logical |
| **Itcclosingbalance** | No | No | Amount |
| **Masterid** | No | No | Number (Integer) |
| **Modified Vouchers** | Yes | No | [Modifiedvch](Modifiedvch.md) |
| **Newvoucherslist** | Yes | No | [Newvoucherlist](Newvoucherlist.md) |
| **Nextsumtransid** | No | No | Number (Integer) |
| **Openingtaxcredit** | No | No | Amount |
| **Payment Details** | No | No |  |
| **Paymenttype** | No | No | String (Sysname) |
| **Person** | No | No | String |
| **Pftdlversioninfo** | Yes | No | [Platformversioninfo](Platformversioninfo.md) |
| **Place** | No | No | String |
| **Prevsumtransid** | No | No | Number (Integer) |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Remotesumkey** | No | No | String |
| **Requestorrule** | No | No | String |
| **Service Tax Payment Details** | Yes | No | [Service Tax Payment Details](Service%20Tax%20Payment%20Details.md) |
| **State Name** | No | No | String (Sysname) |
| **Sumisfromsync** | No | No | Logical |
| **Summary Trans Purpose** | No | No | String (Sysname) |
| **Summaryallocs** | Yes | No | [Summaryallocs](Summaryallocs.md) |
| **Summarydate** | No | No | Date |
| **Summarytranskey** | No | No | String |
| **Tax Type** | No | No | String (Sysname) |
| **Taxregnumber** | No | No | String |
| **Taxunit** | No | No | String (Master Reference) |
| **Todate** | No | No | Date |
| **Typeofsummary** | No | No | String |
| **Uaevat** | Yes | No | Purpose |
| **Uncertainvch** | No | No | Number (Integer) |
| **Vat Reference Number** | No | No | String |
| **Vat Submission Date** | No | No | Date |
| **Vat Upload Status** | No | No | String (Sysname) |
| **Vatmanualreconstatus** | No | No | String (Sysname) |
| **Vchexclcount** | No | No | Number |
| **Vchinclcount** | No | No | Number |
| **Vchpymtexclcount** | No | No | Number |
| **Vchpymtinclcount** | No | No | Number |
| **Vchreversecount** | No | No | Number |
| **Vchtotalcount** | No | No | Number |
