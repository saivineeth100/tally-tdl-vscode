# Bank Allocations Schema

> **Version**: 7.0

Reference documentation for the **Bank Allocations** schema.

### Meta

- **SDF Id**: STR
- **Is Primary**: No

> **Total Properties**: 98

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Account Number** | No | No | String |
| **Account Type** | No | No | String |
| **Amount** | No | No | Amount |
| **Approvalcode** | No | No | String |
| **Bank Employee Name** | No | No | String (Master Reference) |
| **Bank Location** | No | No | String |
| **Bank Name** | No | No | String |
| **Bank Party Name** | No | No | String (Master Reference) |
| **Bankcode** | No | No | String |
| **Bankderivedstatus** | No | No | String (Sysname) |
| **Bankers Date** | No | No | Date |
| **Bankers Remarks** | No | No | String |
| **Bankersstatus** | No | No | String |
| **Bankid** | No | No | String |
| **Bankkeyvaluescrc** | No | No | Number (Integer) |
| **Banklinkexternaltransids** | No | Yes | Number (Integer) |
| **Banklinkreconstatus** | No | No | String (Sysname) |
| **Banklinkrecordid** | No | No | Number (Integer) |
| **Bankmanualstatus** | No | No | String (Sysname) |
| **Bankoperationreference** | No | No | String |
| **Bankotherreferences** | Yes | No | [Bank Otherrefs](Bank%20Otherrefs.md) |
| **Bankportalreference** | No | No | String |
| **Bankreconstatus** | No | No | String (Sysname) |
| **Bankreference** | No | No | String |
| **Bankrefnumber** | No | No | String |
| **Bankstatus** | No | No | String |
| **Bankstatusinfo** | Yes | No | [Bankstatusinfo](Bankstatusinfo.md) |
| **Banktransactionreference** | No | No | String |
| **Batchnumber** | No | No | String |
| **Beneficiary Code** | No | No | String |
| **Beneficiarybankcharges** | No | No | String |
| **Beoperationreference** | No | No | String |
| **Betransactionreference** | No | No | String |
| **Branchname** | No | No | String |
| **Brsgroupid** | No | No | String |
| **Cardnumber** | No | No | String |
| **Cashdenomination** | No | No | String |
| **Cheque Cross Comment** | No | No | String |
| **Cheque Printed** | No | No | Number |
| **Chequerange** | No | No | String |
| **City** | No | No | String |
| **Clearingbankcode** | No | No | String |
| **Contractdetails** | Yes | No | [Contractdetails](Contractdetails.md) |
| **Date** | No | No | Date |
| **Delivery Mode** | No | No | String |
| **Delivery To** | No | No | String |
| **Draweebankcode** | No | No | String |
| **Duplicatereference** | No | No | String |
| **Email** | No | No | String |
| **Errorcode** | No | No | String |
| **Filereference** | No | No | String |
| **Ifs Code** | No | No | String |
| **Imbcode** | No | No | String |
| **Instrument Date** | No | No | Date |
| **Instrument Number** | No | No | String |
| **Instrument Return Date** | No | No | Date |
| **Invoicenumber** | No | No | String |
| **Isacceptedwithwarning** | No | No | Logical |
| **Isconnectedpayment** | No | No | Logical |
| **Iscontractused** | No | No | Logical |
| **Issplit** | No | No | Logical |
| **Istransforced** | No | No | Logical |
| **Linkedobjectsdetails** | No | No |  |
| **Localbankcharges** | No | No | String |
| **Manualstatusremarks** | No | No | String |
| **Merchant Id** | No | No | String |
| **Micrcode** | No | No | String |
| **Name** | No | No | String (Link Master Reference) |
| **Narration** | No | No | String |
| **Payable Location** | No | No | String |
| **Payablelocationcode** | No | No | String |
| **Payment Favouring** | No | No | String |
| **Payment Mode** | No | No | String (Sysname) |
| **Paymentgateway** | No | No | String |
| **Pdcactualdate** | No | No | Date |
| **Pdcremarks** | No | No | String |
| **Print Location** | No | No | String |
| **Printlocationcode** | No | No | String |
| **Pymtadvicestatus** | No | No | String |
| **Reservationstatus** | No | No | String |
| **Secamount** | No | No | Amount |
| **Secondarystatus** | No | No | String (Sysname) |
| **Setid** | No | No | String |
| **Settleamount** | No | No | Amount |
| **Status** | No | No | Logical |
| **Terminalid** | No | No | String |
| **Tipamount** | No | No | Amount |
| **Tipremarks** | No | No | String |
| **Transaction Name** | No | No | String |
| **Transaction Type** | No | No | String (Sysname) |
| **Transactiondigest** | No | No | String |
| **Transactionid** | No | No | String |
| **Transactionindex** | No | No | String |
| **Transfer Mode** | No | No | String |
| **Typeoftransaction** | No | No | String |
| **Unique Reference Number** | No | No | String |
| **Virtualpaymentaddress** | No | No | String |
| **Voidamount** | No | No | Amount |
