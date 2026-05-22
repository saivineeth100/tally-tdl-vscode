# Budget Periods Schema

> **Version**: 7.0

Reference documentation for the **Budget Periods** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 6

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Accounting Allocations** | Yes | No | [Budget Ledger Allocations](Budget%20Ledger%20Allocations.md) |
| **Cost Centre Allocations** | Yes | No | [Budget Cost Center Allocations](Budget%20Cost%20Center%20Allocations.md) |
| **Ending at** | No | No | Date |
| **Group Allocations** | Yes | No | [Budget Group Allocations](Budget%20Group%20Allocations.md) |
| **Inventory Allocations** | Yes | No | [Budget Inventory Allocations](Budget%20Inventory%20Allocations.md) |
| **Starting From** | No | No | Date |
