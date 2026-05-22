# Excise Schema

> **Version**: 7.0

Reference documentation for the **Excise** schema.

### Meta

- **Is Primary**: Yes

> **Total Properties**: 27

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Closing Balance** | No | No | Quantity |
| **Excise Assessablevalue** | No | No | Amount |
| **Excise Date** | No | No | Date |
| **Excise Duty Amount** | No | No | Amount |
| **Excise Id** | No | No | Number (Integer) |
| **Excise Ledger Address** | No | Yes | String |
| **Excise Ledger Name** | No | No | String (Master Reference) |
| **Excise Type Of Purchase** | No | No | String (Sysname) |
| **Exciseactualqty** | No | No | Quantity |
| **Excisegodowndetails** | Yes | No | [Excisegodowndetails](Excisegodowndetails.md) |
| **Excisependingqty** | No | No | Quantity |
| **Excisepurchase Number** | No | No | String |
| **Excisetaxunitdetails** | Yes | No | [Excisetaxunitdetails](Excisetaxunitdetails.md) |
| **Issplaedofcvdnotpasson** | No | No | Logical |
| **Ledger Entries** | Yes | No | [Voucher](Voucher.md) |
| **Opening Balance** | No | No | Quantity |
| **Parent** | No | No | String (Master Reference) |
| **Tradermfgrassessablevalue** | No | No | Amount |
| **Tradermfgrexciseqty** | No | No | Quantity |
| **Tradermfgrimportername** | No | No | String |
| **Tradermfgrinvoicedate** | No | No | Date |
| **Tradermfgrinvoicenumber** | No | No | String |
| **Tradermfgrplargslno** | No | No | String |
| **Traderorigrefno** | No | No | String |
| **Traderplargslno** | No | No | String |
| **Traderrgslnumber** | No | No | String |
| **Tradersupplierrgno** | No | No | String |
