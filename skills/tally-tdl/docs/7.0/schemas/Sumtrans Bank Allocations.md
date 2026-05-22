# Sumtrans Bank Allocations Schema

> **Version**: 7.0

Reference documentation for the **Sumtrans Bank Allocations** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 93

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Sumvch Account Number** | No | No | String |
| **Sumvch Account Type** | No | No | String |
| **Sumvch Amount** | No | No | Amount |
| **Sumvch Approvalcode** | No | No | String |
| **Sumvch Bank Employee Name** | No | No | String (Master Reference) |
| **Sumvch Bank Location** | No | No | String |
| **Sumvch Bank Name** | No | No | String |
| **Sumvch Bank Party Name** | No | No | String (Master Reference) |
| **Sumvch Bankcode** | No | No | String |
| **Sumvch Bankers Date** | No | No | Date |
| **Sumvch Bankers Remarks** | No | No | String |
| **Sumvch Bankersstatus** | No | No | String |
| **Sumvch Bankid** | No | No | String |
| **Sumvch Bankkeyvaluescrc** | No | No | Number (Integer) |
| **Sumvch Banklinkexternaltransids** | No | Yes | Number (Integer) |
| **Sumvch Bankmanualstatus** | No | No | String (Sysname) |
| **Sumvch Bankoperationreference** | No | No | String |
| **Sumvch Bankotherreferences** | Yes | No | [Sumtrans Bank Otherrefs](Sumtrans%20Bank%20Otherrefs.md) |
| **Sumvch Bankportalreference** | No | No | String |
| **Sumvch Bankreference** | No | No | String |
| **Sumvch Bankrefnumber** | No | No | String |
| **Sumvch Bankstatus** | No | No | String |
| **Sumvch Bankstatusinfo** | Yes | No | [Sumtrans Bankstatusinfo](Sumtrans%20Bankstatusinfo.md) |
| **Sumvch Banktransactionreference** | No | No | String |
| **Sumvch Batchnumber** | No | No | String |
| **Sumvch Beneficiary Code** | No | No | String |
| **Sumvch Beneficiarybankcharges** | No | No | String |
| **Sumvch Beoperationreference** | No | No | String |
| **Sumvch Betransactionreference** | No | No | String |
| **Sumvch Branch Name** | No | No | String |
| **Sumvch Brsgroupid** | No | No | String |
| **Sumvch Cardnumber** | No | No | String |
| **Sumvch Cashdenomination** | No | No | String |
| **Sumvch Cheque Cross Comment** | No | No | String |
| **Sumvch Cheque Printed** | No | No | Number |
| **Sumvch Chequerange** | No | No | String |
| **Sumvch City** | No | No | String |
| **Sumvch Clearingbankcode** | No | No | String |
| **Sumvch Contractdetails** | Yes | No | [Sumtrans Contractdetails](Sumtrans%20Contractdetails.md) |
| **Sumvch Date** | No | No | Date |
| **Sumvch Delivery Mode** | No | No | String |
| **Sumvch Delivery To** | No | No | String |
| **Sumvch Draweebankcode** | No | No | String |
| **Sumvch Duplicatereference** | No | No | String |
| **Sumvch Email** | No | No | String |
| **Sumvch Errorcode** | No | No | String |
| **Sumvch Filereference** | No | No | String |
| **Sumvch Ifs Code** | No | No | String |
| **Sumvch Imbcode** | No | No | String |
| **Sumvch Instrument Date** | No | No | Date |
| **Sumvch Instrument Number** | No | No | String |
| **Sumvch Instrument Return Date** | No | No | Date |
| **Sumvch Invoicenumber** | No | No | String |
| **Sumvch Isacceptedwithwarning** | No | No | Logical |
| **Sumvch Isconnectedpayment** | No | No | Logical |
| **Sumvch Iscontractused** | No | No | Logical |
| **Sumvch Issplit** | No | No | Logical |
| **Sumvch Istransforced** | No | No | Logical |
| **Sumvch Localbankcharges** | No | No | String |
| **Sumvch Manualstatusremarks** | No | No | String |
| **Sumvch Merchantid** | No | No | String |
| **Sumvch Micr Code** | No | No | String |
| **Sumvch Name** | No | No | String (Link Master Reference) |
| **Sumvch Narration** | No | No | String |
| **Sumvch Payable Location** | No | No | String |
| **Sumvch Payablelocationcode** | No | No | String |
| **Sumvch Payment Favouring** | No | No | String |
| **Sumvch Payment Mode** | No | No | String (Sysname) |
| **Sumvch Paymentgateway** | No | No | String |
| **Sumvch Pdcactualdate** | No | No | Date |
| **Sumvch Pdcremarks** | No | No | String |
| **Sumvch Print Location** | No | No | String |
| **Sumvch Printlocationcode** | No | No | String |
| **Sumvch Pymtadvicestatus** | No | No | String |
| **Sumvch Reservationstatus** | No | No | String |
| **Sumvch Secamount** | No | No | Amount |
| **Sumvch Secondarystatus** | No | No | String (Sysname) |
| **Sumvch Setid** | No | No | String |
| **Sumvch Settleamount** | No | No | Amount |
| **Sumvch Status** | No | No | Logical |
| **Sumvch Terminalid** | No | No | String |
| **Sumvch Tipamount** | No | No | Amount |
| **Sumvch Tipremarks** | No | No | String |
| **Sumvch Transaction Name** | No | No | String |
| **Sumvch Transaction Type** | No | No | String (Sysname) |
| **Sumvch Transactiondigest** | No | No | String |
| **Sumvch Transactionid** | No | No | String |
| **Sumvch Transactionindex** | No | No | String |
| **Sumvch Transfer Mode** | No | No | String |
| **Sumvch Typeoftransaction** | No | No | String |
| **Sumvch Unique Reference Number** | No | No | String |
| **Sumvch Virtualpaymentaddress** | No | No | String |
| **Sumvch Voidamount** | No | No | Amount |
