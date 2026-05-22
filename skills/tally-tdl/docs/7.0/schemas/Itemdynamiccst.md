# Itemdynamiccst Schema

> **Version**: 7.0

Reference documentation for the **Itemdynamiccst** schema.

### Meta

- **Is Primary**: Yes

> **Total Properties**: 17

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Aggregatetransactions** | Yes | No | [Transactions](Transactions.md) |
| **Date** | No | No | Date |
| **Documenttype** | No | No | String (Master Reference) |
| **Dynamiccstiscleared** | No | No | Logical |
| **Isbatchmultiple** | No | No | Logical |
| **Isgodownmultiple** | No | No | Logical |
| **Ispartymultiple** | No | No | Logical |
| **Itemcostallocations** | Yes | No | [Itemcostallocations](Itemcostallocations.md) |
| **Itemdynamiccst Id** | No | No | Number (Integer) |
| **Ledger Entries** | Yes | No | [Voucher](Voucher.md) |
| **Ledgercostallocations** | Yes | No | [Ledgercostallocations](Ledgercostallocations.md) |
| **Name** | No | No | String |
| **Originalqty** | No | No | Quantity |
| **Originalvalue** | No | No | Amount |
| **Parent** | No | No | String (Master Reference) |
| **Party Name** | No | No | String |
| **Transactions** | Yes | No | [Transactions](Transactions.md) |
