# Bill Schema

> **Version**: 7.0

Reference documentation for the **Bill** schema.

### Meta

- **Aliases**: Bills
- **Is Primary**: Yes

> **Total Properties**: 93

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Abatementamount** | No | No | Amount |
| **Abatementnotificationno** | No | No | String |
| **Addl Surcharge Amount** | No | No | Amount |
| **Assessable Amount** | No | No | Amount |
| **Baseclosing** | No | No | Amount |
| **Bill Credit Period** | No | No | Due Date |
| **Bill Date** | No | No | Date |
| **Bill Id** | No | No | Number (Integer) |
| **Cleared On** | No | No | Date |
| **Closing Balance** | No | No | Amount |
| **Crinterest** | No | Yes | Amount |
| **Drinterest** | No | Yes | Amount |
| **Duebybillcreditdays** | No | No | Amount |
| **Duebymsmecreditdays** | No | No | Amount |
| **Duebymsmedate** | No | No | Amount |
| **Exp First Payable Service Tax Amount** | No | No | Amount |
| **Exp First Payable St Cessrate Amount** | No | No | Amount |
| **Exp First Payable St Secondary Cessrate Amount** | No | No | Amount |
| **Exp First Service Tax Amount** | No | No | Amount |
| **Exp First St Cessrate Amount** | No | Yes | Amount |
| **Exp First St Secondary Cessrate Amount** | No | Yes | Amount |
| **Exp Last Payable Service Tax Amount** | No | No | Amount |
| **Exp Last Payable St Cessrate Amount** | No | No | Amount |
| **Exp Last Payable St Secondary Cessrate Amount** | No | No | Amount |
| **Exp Last Service Tax Amount** | No | No | Amount |
| **Exp Last St Cessrate Amount** | No | Yes | Amount |
| **Exp Last St Secondary Cessrate Amount** | No | Yes | Amount |
| **Expense Amount** | No | No | Amount |
| **Fetched Invoice Value** | No | No | Number |
| **Fetched Tax Value** | No | No | Number |
| **Fetched Taxable Value** | No | No | Number |
| **Final Balance** | No | No | Amount |
| **Forexclosing** | No | No | Amount |
| **Gst Itcatrisk Tax Amt** | No | No | Amount |
| **Gst Status For Os** | No | No | String (Sysname) |
| **Haspayment** | No | No | Logical |
| **Haspurchase** | No | No | Logical |
| **Interest Basis** | No | No |  |
| **Interest Collection** | Yes | No | [Interest Collection](Interest%20Collection.md) |
| **Is Advance** | No | No | Logical |
| **Is Input Avail** | No | No | Logical |
| **Is Tds Ref** | No | No | Logical |
| **Ispanvalid** | No | No | Logical |
| **Ispureagentbill** | No | No | Logical |
| **Lastinterestdate** | No | No | Date |
| **Ledger Entries** | Yes | No | [Voucher](Voucher.md) |
| **Msmeduedate** | No | No | Date |
| **Mth Paid Service Tax Amount** | No | No | Amount |
| **Mth Paid St Cessrate Amount** | No | No | Amount |
| **Mth Paid St Secondary Cessrate Amount** | No | No | Amount |
| **Name** | No | No | String |
| **Opening Balance** | No | No | Amount |
| **Paid Service Tax Amount** | No | No | Amount |
| **Paid St Cessrate Amount** | No | No | Amount |
| **Paid St Secondary Cessrate Amount** | No | No | Amount |
| **Paidbybillcreditdays** | No | No | Amount |
| **Paidbymsmecreditdays** | No | No | Amount |
| **Paidbymsmedate** | No | No | Amount |
| **Paidtilldate** | No | No | Amount |
| **Payable Service Tax Amount** | No | No | Amount |
| **Payable St Cessrate Amount** | No | No | Amount |
| **Payable St Secondary Cessrate Amount** | No | No | Amount |
| **Service Tax Amount** | No | No | Amount |
| **Service Tax Ledger** | No | No | String (Master Reference) |
| **St Cessrate Amount** | No | Yes | Amount |
| **St Party Bill** | No | No | String |
| **St Party Ledger** | No | No | String (Master Reference) |
| **St Secondary Cessrate Amount** | No | Yes | Amount |
| **Stsecondarycessamount** | No | No | Amount |
| **Stsecondarycessrate** | No | No | Number |
| **Surcharge Amount** | No | No | Amount |
| **Tax Bank Challan Number** | No | No | String |
| **Tax Bank Name** | No | No | String |
| **Tax Bill Name** | No | No | String |
| **Tax Challan Bsr Code** | No | No | String |
| **Tax Challan Date** | No | No | Date |
| **Tax Challan Vch Masterid** | No | No | Number (Integer) |
| **Tax Cheque Number** | No | No | String |
| **Tds Addl Surcharge** | No | No | Number |
| **Tds Deductee Is Special Rate** | No | No | Logical |
| **Tds Deductee Section Number** | No | No | String |
| **Tds Deductee Special Rate** | No | No | Number |
| **Tds Ledger Nc** | No | No | String (Master Reference) |
| **Tds Party Bill Date** | No | No | Date |
| **Tds Party Name** | No | No | String (Master Reference) |
| **Tds Party Opening Bal** | No | No | Amount |
| **Tds Surcharge** | No | No | Number |
| **Tds Tax Rate** | No | No | Number |
| **Transactionid** | No | No | String |
| **User Invoice Value** | No | No | Amount |
| **User Tax Value** | No | No | Amount |
| **User Taxable Value** | No | No | Amount |
| **Year End** | No | No | Date |
