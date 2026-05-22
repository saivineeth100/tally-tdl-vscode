# Voucher Class List Schema

> **Version**: 7.0

Reference documentation for the **Voucher Class List** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 33

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Adjdiffinfirstledger** | No | No | Logical |
| **Adjdiffinfirstledgeritem** | No | No | Logical |
| **Bankallocfor** | No | No | String (Sysname) |
| **Class For Vat** | No | No | Logical |
| **Classfordealerexciseshortage** | No | No | Logical |
| **Classforexcise** | No | No | Logical |
| **Classname** | No | No | String |
| **Defaultaccallocforitem** | Yes | No | [Defaultaccallocforitem](Defaultaccallocforitem.md) |
| **Exclude List** | No | Yes | String (Master Reference) |
| **For Job Costing** | No | No | Logical |
| **Include List** | No | Yes | String (Master Reference) |
| **Isdefaultclass** | No | No | Logical |
| **Ledgerentrieslist** | Yes | No | [Voucher Class Ledger List](Voucher%20Class%20Ledger%20List.md) |
| **Ledgerforinventorylist** | Yes | No | [Voucher Class Ledger List](Voucher%20Class%20Ledger%20List.md) |
| **Pos Card Ledger** | No | No | String (Master Reference) |
| **Pos Cash Ledger** | No | No | String (Master Reference) |
| **Pos Cheque Ledger** | No | No | String (Master Reference) |
| **Pos Gift Ledger** | No | No | String (Master Reference) |
| **Posenablecardledger** | No | No | Logical |
| **Posenablecashledger** | No | No | Logical |
| **Posenablechequeledger** | No | No | Logical |
| **Posenablegiftledger** | No | No | Logical |
| **Posenableonaccountledger** | No | No | Logical |
| **Posonaccountledger** | No | No | String |
| **Productcodedetails** | Yes | No | [Productcodedetails](Productcodedetails.md) |
| **Use For Fbt** | No | No | Logical |
| **Usebankallocforcc** | No | No | Logical |
| **Useforcompound** | No | No | Logical |
| **Useforexcisecommercialinvoice** | No | No | Logical |
| **Useforgainloss** | No | No | Logical |
| **Useforgodowntransfer** | No | No | Logical |
| **Useforinterest** | No | No | Logical |
| **Useforservicetax** | No | No | Logical |
