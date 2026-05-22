# Order Schema

> **Version**: 7.0

Reference documentation for the **Order** schema.

### Meta

- **Is Primary**: Yes

> **Total Properties**: 24

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Amount** | No | No | Amount |
| **Batch Name** | No | No | String (Link Master Reference) |
| **Billed Qty** | No | No | Quantity |
| **Closing Balance** | No | No | Quantity |
| **Closing Value** | No | No | Amount |
| **Date** | No | No | Date |
| **Discount** | No | No | Number |
| **Godown Name** | No | No | String (Master Reference) |
| **Indent No** | No | No | String (Link Master Reference) |
| **Is Inward Track** | No | No | Logical |
| **Ledger Entries** | Yes | No | [Voucher](Voucher.md) |
| **Name** | No | No | String |
| **Opening Balance** | No | No | Quantity |
| **Opening Value** | No | No | Amount |
| **Order Id** | No | No | Number (Integer) |
| **Order Year End** | No | No | Date |
| **Orderclosurereason** | No | No | String |
| **Orderduedate** | No | No | Due Date |
| **Orderpreclosureqty** | No | No | Quantity |
| **Ordertype** | No | No | String (Sysname) |
| **Parent** | No | No | String (Master Reference) |
| **Parentitem** | No | No | String (Master Reference) |
| **Rate** | No | No | Rate |
| **Trackledger** | No | No | String (Master Reference) |
