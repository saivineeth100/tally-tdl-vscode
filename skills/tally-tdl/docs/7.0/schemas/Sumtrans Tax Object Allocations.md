# Sumtrans Tax Object Allocations Schema

> **Version**: 7.0

Reference documentation for the **Sumtrans Tax Object Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 35

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Sumvch Abatementfortax** | No | No | Number |
| **Sumvch Accountauditentries** | Yes | No | [Sumtrans Accountaudit Entries](Sumtrans%20Accountaudit%20Entries.md) |
| **Sumvch Assessablevalue** | No | No | Amount |
| **Sumvch Cashpartyname** | No | No | String |
| **Sumvch Deducteetype** | No | No | String (Sysname) |
| **Sumvch Exempted** | No | No | Logical |
| **Sumvch Expenses** | No | No | String (Master Reference) |
| **Sumvch Expensesamount** | No | No | Amount |
| **Sumvch Hasinputcredit** | No | No | Logical |
| **Sumvch Is Optional** | No | No | Logical |
| **Sumvch Is Special Rate** | No | No | Logical |
| **Sumvch Isbasedonrealization** | No | No | Logical |
| **Sumvch Isdeductnow** | No | No | Logical |
| **Sumvch Ispannotavailable** | No | No | Logical |
| **Sumvch Ispanvalid** | No | No | Logical |
| **Sumvch Ispureagent** | No | No | Logical |
| **Sumvch Issupplemetry** | No | No | Logical |
| **Sumvch Istdsdeducted** | No | No | Logical |
| **Sumvch Natureofservice** | No | No | String (Sysname) |
| **Sumvch Notificationno** | No | No | String |
| **Sumvch Oldauditentries** | Yes | No | [Sumtrans Audit Entries](Sumtrans%20Audit%20Entries.md) |
| **Sumvch Oldauditentryids** | No | Yes | Number (Integer) |
| **Sumvch Pannumber** | No | No | String |
| **Sumvch Partyledger** | No | No | String (Master Reference) |
| **Sumvch Realized Assessable Value** | No | No | Amount |
| **Sumvch Reversechargerate** | No | No | Number |
| **Sumvch Servicetaxliabilitytype** | No | No | String (Sysname) |
| **Sumvch Sub Category Allocation** | Yes | No | [Sumtrans Sub Category Allocations](Sumtrans%20Sub%20Category%20Allocations.md) |
| **Sumvch Sumtaxname** | No | No | String |
| **Sumvch Tax Name** | No | No | String (Link Master Reference) |
| **Sumvch Taxtype** | No | No | String (Sysname) |
| **Sumvch Tdschallandate** | No | No | Date |
| **Sumvch Tdschallannumber** | No | No | String |
| **Sumvch Transactionid** | No | No | String |
| **Sumvch Zero Rated** | No | No | Logical |
