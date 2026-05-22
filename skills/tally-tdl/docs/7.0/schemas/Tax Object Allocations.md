# Tax Object Allocations Schema

> **Version**: 7.0

Reference documentation for the **Tax Object Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 64

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Abatementfortax** | No | No | Number |
| **Accountaudit Entries** | Yes | No | [Accountaudit Entries](Accountaudit%20Entries.md) |
| **Annexurestatus** | No | Yes | String (Sysname) |
| **Assessable Amount** | No | No | Amount |
| **Assessablevalue** | No | No | Amount |
| **Auditaddlinfo** | No | No | String |
| **Auditamount** | No | No | Amount |
| **Auditclarification** | No | No | String |
| **Auditdate** | No | No | Date |
| **Auditedby** | No | No | String |
| **Auditname** | No | No | String (Sysname) |
| **Auditnote** | No | No | String |
| **Auditstatus** | No | No | String (Sysname) |
| **Audittime** | No | No | String |
| **Audittype** | No | No | String (Sysname) |
| **Billedquantity** | No | No | Quantity |
| **Cashpartyname** | No | No | String |
| **Category** | No | No | String |
| **Deductee Type** | No | No | String (Sysname) |
| **Duty Ledger** | No | No | String |
| **Excisecreditamount** | No | No | Amount |
| **Exciseunitname** | No | No | String |
| **Exempted** | No | No | Logical |
| **Expenses** | No | No | String (Master Reference) |
| **Expensesamount** | No | No | Amount |
| **Hasinputcredit** | No | No | Logical |
| **Is Optional** | No | No | Logical |
| **Is Special Rate** | No | No | Logical |
| **Isbasedonrealization** | No | No | Logical |
| **Isdeductnow** | No | No | Logical |
| **Ispannotavailable** | No | No | Logical |
| **Ispanvalid** | No | No | Logical |
| **Ispureagent** | No | No | Logical |
| **Issupplemetry** | No | No | Logical |
| **Istdsdeducted** | No | No | Logical |
| **Natureofservice** | No | No | String (Sysname) |
| **Notificationno** | No | No | String |
| **Oldauditentries** | Yes | No | [Audit Entries](Audit%20Entries.md) |
| **Oldauditentryids** | No | Yes | Number (Integer) |
| **Paidamount** | No | No | Amount |
| **Pan Number** | No | No | String |
| **Party Ledger** | No | No | String (Master Reference) |
| **Realised Assessable Amount** | No | No | Amount |
| **Realized Assessable Value** | No | No | Amount |
| **Ref Type** | No | No | String (Sysname) |
| **Reversechargerate** | No | No | Number |
| **Servicetaxliabilitytype** | No | No | String (Sysname) |
| **Stock Item Name** | No | No | String |
| **Sub Cat Exempted** | No | No | Logical |
| **Sub Cat Is Special Rate** | No | No | Logical |
| **Sub Cat Zero Rated** | No | No | Logical |
| **Sub Category** | No | No | String (Sysname) |
| **Sub Category Allocation** | Yes | No | [Sub Category Allocations](Sub%20Category%20Allocations.md) |
| **Sumtaxname** | No | No | String |
| **Tax** | No | No | Amount |
| **Tax Name** | No | No | String (Link Master Reference) |
| **Tax Type** | No | No | String (Sysname) |
| **Taxobject Id** | No | No | Number (Integer) |
| **Taxrate** | No | No | Number |
| **Tdschallandate** | No | No | Date |
| **Tdschallannumber** | No | No | String |
| **Transactionid** | No | No | String |
| **Utilizedcreditamount** | No | No | Amount |
| **Zero Rated** | No | No | Logical |
