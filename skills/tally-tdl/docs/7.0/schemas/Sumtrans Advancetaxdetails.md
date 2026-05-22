# Sumtrans Advancetaxdetails Schema

> **Version**: 7.0

Reference documentation for the **Sumtrans Advancetaxdetails** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 14

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Sumvch Advanceamount** | No | No | Amount |
| **Sumvch Amount** | No | No | Amount |
| **Sumvch Assessablevalue** | No | No | Amount |
| **Sumvch Hsncode** | No | No | String |
| **Sumvch Isreversechargeapplicable** | No | No | Logical |
| **Sumvch Itemquantity** | No | No | Quantity |
| **Sumvch Itemrate** | No | No | Rate |
| **Sumvch Ledger Name** | No | No | String (Master Reference) |
| **Sumvch Stockitemname** | No | No | String (Master Reference) |
| **Sumvch Strd Isgst Applicable** | No | No | Logical |
| **Sumvch Strdgstderivedtaxability** | No | No | String (Sysname) |
| **Sumvch Tax Details** | Yes | No | [Sumtrans Tax Details](Sumtrans%20Tax%20Details.md) |
| **Sumvch Taxrate** | No | No | Number |
| **Sumvch Taxvalue** | No | No | Amount |
