# Excise Allocations Schema

> **Version**: 7.0

Reference documentation for the **Excise Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 33

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Excise Duty Allocations** | Yes | No | [Excise Duty Allocations](Excise%20Duty%20Allocations.md) |
| **Excise Id** | No | No | Number (Integer) |
| **Excisegodownname** | No | No | String (Master Reference) |
| **Is Excise Opening** | No | No | Logical |
| **Issplaedofcvdnotpasson** | No | No | Logical |
| **Mfgrimporteraddress** | No | Yes | String |
| **Mfgrimporteraddresstype** | No | No | String |
| **Mfgrimportercommissionerate** | No | No | String |
| **Mfgrimporterdivision** | No | No | String |
| **Mfgrimporterexciseregnno** | No | No | String |
| **Mfgrimporterexportercode** | No | No | String |
| **Mfgrimportername** | No | No | String |
| **Mfgrimporterrange** | No | No | String |
| **Sumtraderreferenceno** | No | No | String |
| **Taxunitname** | No | No | String (Master Reference) |
| **Traderassessablevalue** | No | No | Amount |
| **Traderexcisedutyamount** | No | No | Amount |
| **Traderexcisependingqty** | No | No | Quantity |
| **Traderexciseqty** | No | No | Quantity |
| **Tradermfgrassessablevalue** | No | No | Amount |
| **Tradermfgrexciseqty** | No | No | Quantity |
| **Tradermfgrimportername** | No | No | String |
| **Tradermfgrinvoicedate** | No | No | Date |
| **Tradermfgrinvoicenumber** | No | No | String |
| **Tradermfgrplargslno** | No | No | String |
| **Traderorigrefno** | No | No | String |
| **Traderplargslno** | No | No | String |
| **Traderreferenceno** | No | No | String (Link Master Reference) |
| **Traderrgslnumber** | No | No | String |
| **Tradersupplierinvoicedate** | No | No | Date |
| **Tradersuppliername** | No | No | String (Master Reference) |
| **Tradersupplierrgno** | No | No | String |
| **Tradertypeofpurchase** | No | No | String (Sysname) |
