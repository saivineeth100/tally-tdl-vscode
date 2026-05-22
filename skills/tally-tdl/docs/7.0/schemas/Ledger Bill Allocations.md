# Ledger Bill Allocations Schema

> **Version**: 7.0

Reference documentation for the **Ledger Bill Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 13

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Bill Credit Period** | No | No | Due Date |
| **Bill Date** | No | No | Date |
| **Interest Appl From** | No | No | Number (Integer) |
| **Interest Appl On** | No | No | String (Sysname) |
| **Interest Balance Type** | No | No | String (Sysname) |
| **Interest Collection** | Yes | No | [Interest Collection](Interest%20Collection.md) |
| **Interest From Type** | No | No | String (Sysname) |
| **Interest Rate** | No | No | Number |
| **Interest Style** | No | No | String (Sysname) |
| **Is Advance** | No | No | Logical |
| **Name** | No | No | String |
| **Opening Balance** | No | No | Amount |
| **Year End** | No | No | Date |
