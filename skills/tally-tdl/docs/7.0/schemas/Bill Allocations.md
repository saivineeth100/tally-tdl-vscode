# Bill Allocations Schema

> **Version**: 7.0

Reference documentation for the **Bill Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 26

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Amount** | No | No | Amount |
| **Bill Credit Period** | No | No | Due Date |
| **Bill Date** | No | No | Date |
| **Bill Id** | No | No | Number (Integer) |
| **Bill Type** | No | No | String (Sysname) |
| **Billcreationdate** | No | No | Date |
| **Interest Appl From** | No | No | Number (Integer) |
| **Interest Appl On** | No | No | String (Sysname) |
| **Interest Balance Type** | No | No | String (Sysname) |
| **Interest Collection** | Yes | No | [Interest Collection](Interest%20Collection.md) |
| **Interest From Date** | No | No | Date |
| **Interest From Type** | No | No | String (Sysname) |
| **Interest Rate** | No | No | Number |
| **Interest Style** | No | No | String (Sysname) |
| **Interest To Date** | No | No | Date |
| **Name** | No | No | String (Link Master Reference) |
| **Roundlimit** | No | No | Number |
| **Roundtype** | No | No | String (Sysname) |
| **Service Tax Ledger** | No | No | String (Master Reference) |
| **Stbillcategories** | Yes | No | [Stbillcategory](Stbillcategory.md) |
| **Sumname** | No | No | String |
| **Tds Deductee Is Special Rate** | No | No | Logical |
| **Tds Deductee Section Number** | No | No | String |
| **Tds Deductee Special Rate** | No | No | Number |
| **Tds Ledger Nc** | No | No | String (Master Reference) |
| **Year End** | No | No | Date |
