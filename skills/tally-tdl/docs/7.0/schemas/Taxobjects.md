# Taxobjects Schema

> **Version**: 7.0

Reference documentation for the **Taxobjects** schema.

### Meta

- **Is Primary**: Yes

> **Total Properties**: 39

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Abatementfortax** | No | No | Number |
| **Accountaudit Entries** | Yes | No | [Accountaudit Entries](Accountaudit%20Entries.md) |
| **Assessablevalue** | No | No | Amount |
| **Cashpartyname** | No | No | String |
| **Category** | No | No | String |
| **Deductee Type** | No | No | String (Sysname) |
| **Exempted** | No | No | Logical |
| **Expenses** | No | No | String (Master Reference) |
| **Expensesamount** | No | No | Amount |
| **Hasinputcredit** | No | No | Logical |
| **Is Advance** | No | No | Logical |
| **Is Optional** | No | No | Logical |
| **Is Special Rate** | No | No | Logical |
| **Isbasedonrealization** | No | No | Logical |
| **Isdeductnow** | No | No | Logical |
| **Ispannotavailable** | No | No | Logical |
| **Ispanvalid** | No | No | Logical |
| **Ispureagent** | No | No | Logical |
| **Issupplementary** | No | No | Logical |
| **Istdsdeducted** | No | No | Logical |
| **Ledger Entries** | Yes | No | [Voucher](Voucher.md) |
| **Natureofservice** | No | No | String (Sysname) |
| **Notificationno** | No | No | String |
| **Oldauditentries** | Yes | No | [Audit Entries](Audit%20Entries.md) |
| **Oldauditentryids** | No | Yes | Number (Integer) |
| **Pan Number** | No | No | String |
| **Party Ledger** | No | No | String (Master Reference) |
| **Realized Assessable Value** | No | No | Amount |
| **Reversechargerate** | No | No | Number |
| **Runningbalance** | No | No | Amount |
| **Servicetaxliabilitytype** | No | No | String (Sysname) |
| **Sub Category List** | Yes | No | [Sub Category List](Sub%20Category%20List.md) |
| **Tax Date** | No | No | Date |
| **Tax Name** | No | No | String |
| **Tax Type** | No | No | String (Sysname) |
| **Tdschallandate** | No | No | Date |
| **Tdschallannumber** | No | No | String |
| **Transactionid** | No | No | String |
| **Zero Rated** | No | No | Logical |
