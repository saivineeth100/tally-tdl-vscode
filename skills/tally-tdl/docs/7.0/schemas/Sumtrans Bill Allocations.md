# Sumtrans Bill Allocations Schema

> **Version**: 7.0

Reference documentation for the **Sumtrans Bill Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 12

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Sumvch Amount** | No | No | Amount |
| **Sumvch Bill Credit Period** | No | No | Due Date |
| **Sumvch Interest Collection** | Yes | No | [Sumtrans Interest Collection](Sumtrans%20Interest%20Collection.md) |
| **Sumvch Name** | No | No | String (Link Master Reference) |
| **Sumvch Service Tax Ledger** | No | No | String (Master Reference) |
| **Sumvch Stbillcategories** | Yes | No | [Sumtrans Stbillcategory](Sumtrans%20Stbillcategory.md) |
| **Sumvch Sumname** | No | No | String |
| **Sumvch Tds Deductee Is Special Rate** | No | No | Logical |
| **Sumvch Tds Deductee Section Number** | No | No | String |
| **Sumvch Tds Deductee Special Rate** | No | No | Number |
| **Sumvch Tds Ledger Nc** | No | No | String (Master Reference) |
| **Sumvch Year End** | No | No | Date |
