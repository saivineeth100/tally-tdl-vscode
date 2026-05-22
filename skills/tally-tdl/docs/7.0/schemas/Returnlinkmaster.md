# Returnlinkmaster Schema

> **Version**: 7.0

Reference documentation for the **Returnlinkmaster** schema.

### Meta

- **Is Primary**: Yes

> **Total Properties**: 17

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Date** | No | No | Date |
| **Formtype** | No | No | String |
| **Fromdate** | No | No | Date |
| **Godown Name** | No | No | String (Master Reference) |
| **Ledger Entries** | Yes | No | [Voucher](Voucher.md) |
| **Paidamount** | No | No | Amount |
| **Payableamount** | No | No | Amount |
| **Paymenttype** | No | No | String (Sysname) |
| **Reference** | No | No | String |
| **Returnid** | No | No | Number (Integer) |
| **Returnname** | No | No | String |
| **Sbcpaidamount** | No | No | Amount |
| **Sbcpayableamount** | No | No | Amount |
| **State Name** | No | No | String (Sysname) |
| **Tax Type** | No | No | String (Sysname) |
| **Taxunit** | No | No | String (Master Reference) |
| **Todate** | No | No | Date |
