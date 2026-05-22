# Batch Allocations Schema

> **Version**: 7.0

Reference documentation for the **Batch Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 47

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Actual Qty** | No | No | Quantity |
| **Additional Details** | Yes | No | [Additional Details](Additional%20Details.md) |
| **Addl Amount** | No | No | Amount |
| **Addlexpenseamount** | No | No | Amount |
| **Amount** | No | No | Amount |
| **Batch Discount** | No | No | Number |
| **Batch Id** | No | No | Number (Integer) |
| **Batch Name** | No | No | String (Link Master Reference) |
| **Batch Phys Diff** | No | No | Quantity |
| **Batch Rate** | No | No | Rate |
| **Batchdiffval** | No | No | Amount |
| **Billed Qty** | No | No | Quantity |
| **Destination Godown Name** | No | No | String (Master Reference) |
| **Dynamiccstiscleared** | No | No | Logical |
| **Dynamiccstno** | No | No | String (Link Master Reference) |
| **Dynamiccstparentitem** | No | No | String (Master Reference) |
| **Escalationrate** | No | No | Rate |
| **Expiry Period** | No | No | Due Date |
| **Godown Name** | No | No | String (Master Reference) |
| **Inclvatrate** | No | No | Rate |
| **Indent Id** | No | No | Number (Integer) |
| **Indent No** | No | No | String (Link Master Reference) |
| **Indentduedate** | No | No | Due Date |
| **Mfd On** | No | No | Date |
| **Narration** | No | No | String |
| **Order Id** | No | No | Number (Integer) |
| **Order Year End** | No | No | Date |
| **Orderduedate** | No | No | Due Date |
| **Orderno** | No | No | String (Link Master Reference) |
| **Orderpreclosuredate** | No | No | Date |
| **Orderpreclosureqty** | No | No | Quantity |
| **Orderpreclosurereason** | No | No | String |
| **Ordertype** | No | No | String (Sysname) |
| **Origactualqty** | No | No | Quantity |
| **Origbilledqty** | No | No | Quantity |
| **Origrate** | No | No | Rate |
| **Parentitem** | No | No | String (Master Reference) |
| **Revisedrate** | No | No | Rate |
| **Sumbatchname** | No | No | String |
| **Sumdynamiccstno** | No | No | String |
| **Sumindentno** | No | No | String |
| **Sumorderno** | No | No | String |
| **Sumtrackingnumber** | No | No | String |
| **Track Id** | No | No | Number (Integer) |
| **Tracking Number** | No | No | String (Link Master Reference) |
| **Tracking Year End** | No | No | Date |
| **Vouchercomponentlist** | Yes | No | [Inventory Entry](Inventory%20Entry.md) |
