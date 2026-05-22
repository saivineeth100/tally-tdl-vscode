# Paylink Schema

> **Version**: 7.0

Reference documentation for the **Paylink** schema.

### Meta

- **Is Primary**: Yes

> **Total Properties**: 110

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Account Number** | No | No | String |
| **Account Type** | No | No | String |
| **Approvalcode** | No | No | String |
| **Bank Employee Name** | No | No | String (Master Reference) |
| **Bank Location** | No | No | String |
| **Bank Name** | No | No | String |
| **Bank Party Name** | No | No | String (Master Reference) |
| **Bankamount** | No | No | Amount |
| **Bankbatchamount** | No | No | Amount |
| **Bankcode** | No | No | String |
| **Bankersstatus** | No | No | String |
| **Bankid** | No | No | String |
| **Banklinkrecordid** | No | No | Number (Integer) |
| **Bankmanualstatus** | No | No | String (Sysname) |
| **Bankoperationreference** | No | No | String |
| **Bankotherreferences** | Yes | No | [Bank Otherrefs](Bank%20Otherrefs.md) |
| **Bankparent** | No | No | String (Master Reference) |
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
| **Cardamount** | No | No | Amount |
| **Cardbatchamount** | No | No | Amount |
| **Cardnumber** | No | No | String |
| **Cardparent** | No | No | String (Master Reference) |
| **Cardpendingamount** | No | No | Amount |
| **Cashdenomination** | No | No | String |
| **Chargesamount** | No | No | Amount |
| **Chargesbatchamount** | No | No | Amount |
| **Cheque Cross Comment** | No | No | String |
| **Cheque Printed** | No | No | Number |
| **Chequerange** | No | No | String |
| **City** | No | No | String |
| **Clearingbankcode** | No | No | String |
| **Contractdetails** | Yes | No | [Contractdetails](Contractdetails.md) |
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
| **Invoicenumber** | No | No | String |
| **Isacceptedwithwarning** | No | No | Logical |
| **Iscardopening** | No | No | Logical |
| **Isconnectedpayment** | No | No | Logical |
| **Iscontractused** | No | No | Logical |
| **Isopeningbrs** | No | No | Logical |
| **Istransforced** | No | No | Logical |
| **Ledger Contributor List** | Yes | No | [Ledger Contributor List](Ledger%20Contributor%20List.md) |
| **Ledger Entries** | Yes | No | [Voucher](Voucher.md) |
| **Link Master Entries** | Yes | No | [Paylink](Paylink.md) |
| **Linkedobjectsdetails** | No | No |  |
| **Localbankcharges** | No | No | String |
| **Manualstatusremarks** | No | No | String |
| **Merchant Id** | No | No | String |
| **Micrcode** | No | No | String |
| **Name** | No | No | String |
| **Parentobjidentifier** | No | No | Number (Integer) |
| **Pay Allocation Data** | Yes | No | [Pay Allocation Data](Pay%20Allocation%20Data.md) |
| **Payable Location** | No | No | String |
| **Payablelocationcode** | No | No | String |
| **Paybatch** | No | No | String (Link Master Reference) |
| **Paylinkid** | No | No | Number (Integer) |
| **Payment Favouring** | No | No | String |
| **Paymentgateway** | No | No | String |
| **Paymentstatus** | No | No | String (Sysname) |
| **Primary Status** | No | No | String (Sysname) |
| **Print Location** | No | No | String |
| **Printlocationcode** | No | No | String |
| **Pymtadvicestatus** | No | No | String |
| **Recostartdate** | No | No | Date |
| **Reservationstatus** | No | No | String |
| **Secondarystatus** | No | No | String (Sysname) |
| **Setid** | No | No | String |
| **Settleamount** | No | No | Amount |
| **Startdate** | No | No | Date |
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
| **Vchclassname** | No | No | String |
| **Vchnarration** | No | No | String |
| **Vchtype Name** | No | No | String |
| **Vchtypeispayroll** | No | No | Logical |
| **Virtualpaymentaddress** | No | No | String |
| **Voidamount** | No | No | Amount |
| **Vouchermstid** | No | No | Number (Integer) |
| **Vouchernumber** | No | No | String |
