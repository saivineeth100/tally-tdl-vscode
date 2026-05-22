# Tracking Number Schema

> **Version**: 7.0

Reference documentation for the **Tracking Number** schema.

### Meta

- **Aliases**: Tracking Numbers
- **Is Primary**: Yes

> **Total Properties**: 21

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Addlexpenseamount** | No | No | Amount |
| **Affects Stock** | No | No | Logical |
| **Amount** | No | No | Amount |
| **Batch Name** | No | No | String (Link Master Reference) |
| **Billed Qty** | No | No | Quantity |
| **Closing Balance** | No | No | Quantity |
| **Date** | No | No | Date |
| **Discount** | No | No | Number |
| **Godown Name** | No | No | String (Master Reference) |
| **Is Inward Track** | No | No | Logical |
| **Ledger Entries** | Yes | No | [Voucher](Voucher.md) |
| **Name** | No | No | String |
| **Opening Balance** | No | No | Quantity |
| **Opening Value** | No | No | Amount |
| **Orderduedate** | No | No | Due Date |
| **Orderno** | No | No | String (Link Master Reference) |
| **Parent** | No | No | String (Master Reference) |
| **Rate** | No | No | Rate |
| **Track Id** | No | No | Number (Integer) |
| **Tracking Year End** | No | No | Date |
| **Trackledger** | No | No | String (Master Reference) |
