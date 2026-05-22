# Sumtrans Batch Allocations Schema

> **Version**: 7.0

Reference documentation for the **Sumtrans Batch Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 39

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Sumvch Actual Qty** | No | No | Quantity |
| **Sumvch Additionaldetails** | Yes | No | [Sumtrans Additional Details](Sumtrans%20Additional%20Details.md) |
| **Sumvch Addl Amount** | No | No | Amount |
| **Sumvch Addl Expense Amount** | No | No | Amount |
| **Sumvch Amount** | No | No | Amount |
| **Sumvch Batch Name** | No | No | String (Link Master Reference) |
| **Sumvch Batch Phys Diff** | No | No | Quantity |
| **Sumvch Batchdiffval** | No | No | Amount |
| **Sumvch Billed Qty** | No | No | Quantity |
| **Sumvch Destination Godown Name** | No | No | String (Master Reference) |
| **Sumvch Dynamiccstno** | No | No | String (Link Master Reference) |
| **Sumvch Dynamiccstparentitem** | No | No | String (Master Reference) |
| **Sumvch Escalationrate** | No | No | Rate |
| **Sumvch Godownname** | No | No | String (Master Reference) |
| **Sumvch Inclvatrate** | No | No | Rate |
| **Sumvch Indent No** | No | No | String (Link Master Reference) |
| **Sumvch Indentduedate** | No | No | Due Date |
| **Sumvch Mfd On** | No | No | Date |
| **Sumvch Narration** | No | No | String |
| **Sumvch Order Year End** | No | No | Date |
| **Sumvch Orderduedate** | No | No | Due Date |
| **Sumvch Orderno** | No | No | String (Link Master Reference) |
| **Sumvch Orderpreclosuredate** | No | No | Date |
| **Sumvch Orderpreclosureqty** | No | No | Quantity |
| **Sumvch Orderpreclosurereason** | No | No | String |
| **Sumvch Ordertype** | No | No | String (Sysname) |
| **Sumvch Origactualqty** | No | No | Quantity |
| **Sumvch Origbilledqty** | No | No | Quantity |
| **Sumvch Origrate** | No | No | Rate |
| **Sumvch Parentitem** | No | No | String (Master Reference) |
| **Sumvch Revisedrate** | No | No | Rate |
| **Sumvch Sumbatchname** | No | No | String |
| **Sumvch Sumdynamiccstno** | No | No | String |
| **Sumvch Sumindentno** | No | No | String |
| **Sumvch Sumorderno** | No | No | String |
| **Sumvch Sumtrackingnumber** | No | No | String |
| **Sumvch Tracking Number** | No | No | String (Link Master Reference) |
| **Sumvch Tracking Year End** | No | No | Date |
| **Sumvch Vouchercomponentlist** | Yes | No | [Sumtrans Inventory Entry](Sumtrans%20Inventory%20Entry.md) |
