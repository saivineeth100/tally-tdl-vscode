# Company Property Function

> **Version**: 7.0

Reference documentation for all entries in the **Company Property** function.

> **Total Entries**: 139

## Table of Contents

- [BatchesExist](#batchesexist)
- [Cheque](#cheque)
- [ChequePrintable](#chequeprintable)
- [CNoteAsInvoice](#cnoteasinvoice)
- [CostCategoriesExist](#costcategoriesexist)
- [DCNotesExist](#dcnotesexist)
- [DNoteAsInvoice](#dnoteasinvoice)
- [GodownsExist](#godownsexist)
- [HasDataErrors](#hasdataerrors)
- [HasVouchers](#hasvouchers)
- [IsAccountingOn](#isaccountingon)
- [IsAllBillWiseOn](#isallbillwiseon)
- [IsAnyAttendanceVTYPOn](#isanyattendancevtypon)
- [IsAnyCNoteVTYPOn](#isanycnotevtypon)
- [IsAnyContraVTYPOn](#isanycontravtypon)
- [IsAnyDelyNoteVTYPOn](#isanydelynotevtypon)
- [IsAnyDNoteVTYPOn](#isanydnotevtypon)
- [IsAnyEPaymentEnabled](#isanyepaymentenabled)
- [IsAnyInvUsedForPOS](#isanyinvusedforpos)
- [IsAnyJobMatIssueVTYPOn](#isanyjobmatissuevtypon)
- [IsAnyJobMatReceiveVTYPOn](#isanyjobmatreceivevtypon)
- [IsAnyJobOrderInVTYPOn](#isanyjoborderinvtypon)
- [IsAnyJobOrderOutVTYPOn](#isanyjoborderoutvtypon)
- [IsAnyJournalVTYPOn](#isanyjournalvtypon)
- [IsAnyMemoVTYPOn](#isanymemovtypon)
- [IsAnyPaymentVTYPOn](#isanypaymentvtypon)
- [IsAnyPayrollVTYPOn](#isanypayrollvtypon)
- [IsAnyPhysStockVTYPOn](#isanyphysstockvtypon)
- [IsAnyPurchaseVTYPOn](#isanypurchasevtypon)
- [IsAnyPurcOrderVTYPOn](#isanypurcordervtypon)
- [IsAnyRcptNoteVTYPOn](#isanyrcptnotevtypon)
- [IsAnyReceiptVTYPOn](#isanyreceiptvtypon)
- [IsAnyRejectionInVTYPOn](#isanyrejectioninvtypon)
- [IsAnyRejectionOutVTYPOn](#isanyrejectionoutvtypon)
- [IsAnyRevJournalVTYPOn](#isanyrevjournalvtypon)
- [IsAnySalesOrderVTYPOn](#isanysalesordervtypon)
- [IsAnySalesVTYPOn](#isanysalesvtypon)
- [IsAnyStockJournalVTYPOn](#isanystockjournalvtypon)
- [IsAttendanceVTYPOn](#isattendancevtypon)
- [IsBatchWiseOn](#isbatchwiseon)
- [IsBillWiseOn](#isbillwiseon)
- [IsBudgetsOn](#isbudgetson)
- [IsChqPrintingOn](#ischqprintingon)
- [IsCNoteVTYPOn](#iscnotevtypon)
- [IsCompositeDealer](#iscompositedealer)
- [IsContraVTYPOn](#iscontravtypon)
- [IsCostCategoryOn](#iscostcategoryon)
- [IsCostCentresOn](#iscostcentreson)
- [IsCostTrackingOn](#iscosttrackingon)
- [IsDataErrPresentInGrpCmp](#isdataerrpresentingrpcmp)
- [IsDCNoteOn](#isdcnoteon)
- [IsDelyNoteVTYPOn](#isdelynotevtypon)
- [IsDiscountsOn](#isdiscountson)
- [IsDNoteVTYPOn](#isdnotevtypon)
- [IsEditLogOn](#iseditlogon)
- [IsePaymentEnabled](#isepaymentenabled)
- [IsExciseOn](#isexciseon)
- [IsExciseReportsOn](#isexcisereportson)
- [IsExciseTraderOn](#isexcisetraderon)
- [IsFBTOn](#isfbton)
- [IsGlobalAccountingOn](#isglobalaccountingon)
- [IsGlobalBatchWiseOn](#isglobalbatchwiseon)
- [IsGlobalBillWiseOn](#isglobalbillwiseon)
- [IsGlobalCostCentresOn](#isglobalcostcentreson)
- [IsGlobalCostTrackingOn](#isglobalcosttrackingon)
- [IsGlobalEditLogOn](#isglobaleditlogon)
- [IsGlobalExciseTraderOn](#isglobalexcisetraderon)
- [IsGlobalGSTOn](#isglobalgston)
- [IsGlobalInterestOn](#isglobalintereston)
- [IsGlobalInventoryOn](#isglobalinventoryon)
- [IsGlobalJobCostingOn](#isglobaljobcostingon)
- [IsGlobalJobWorkOn](#isglobaljobworkon)
- [IsGlobalMultiCurrencyOn](#isglobalmulticurrencyon)
- [IsGlobalMultiGodownOn](#isglobalmultigodownon)
- [IsGlobalPaymentRequestOn](#isglobalpaymentrequeston)
- [IsGlobalPayrollOn](#isglobalpayrollon)
- [IsGlobalPayrollStatOn](#isglobalpayrollstaton)
- [IsGlobalPurcOrdersOn](#isglobalpurcorderson)
- [IsGlobalSalesOrdersOn](#isglobalsalesorderson)
- [IsGlobalServiceTaxOn](#isglobalservicetaxon)
- [IsGlobalTCSOn](#isglobaltcson)
- [IsGlobalTDSOn](#isglobaltdson)
- [IsGlobalTrackingOn](#isglobaltrackingon)
- [IsGlobalTrackVouchersOn](#isglobaltrackvoucherson)
- [IsGSTOn](#isgston)
- [IsIndentOn](#isindenton)
- [IsIntegrated](#isintegrated)
- [IsInventoryOn](#isinventoryon)
- [IsInvoicingOn](#isinvoicingon)
- [IsInvUsedForPOS](#isinvusedforpos)
- [IsJobCostingOn](#isjobcostingon)
- [IsJobMatIssueVTYPOn](#isjobmatissuevtypon)
- [IsJobMatReceiveVTYPOn](#isjobmatreceivevtypon)
- [IsJobOrderInVTYPOn](#isjoborderinvtypon)
- [IsJobOrderOutVTYPOn](#isjoborderoutvtypon)
- [IsJobWorkOn](#isjobworkon)
- [IsJournalVTYPOn](#isjournalvtypon)
- [IsMaterialTransferOn](#ismaterialtransferon)
- [IsMemoVTYPOn](#ismemovtypon)
- [IsMultiCurrencyOn](#ismulticurrencyon)
- [IsMultiGodownOn](#ismultigodownon)
- [IsPaymentRequestOn](#ispaymentrequeston)
- [IsPaymentVTYPOn](#ispaymentvtypon)
- [IsPayrollOn](#ispayrollon)
- [IsPayrollStatOn](#ispayrollstaton)
- [IsPayrollVTYPOn](#ispayrollvtypon)
- [IsPerishableOn](#isperishableon)
- [IsPhysStockVTYPOn](#isphysstockvtypon)
- [IsPurchaseVTYPOn](#ispurchasevtypon)
- [IsPurcOrdersOn](#ispurcorderson)
- [IsPurcOrderVTYPOn](#ispurcordervtypon)
- [IsRcptNoteVTYPOn](#isrcptnotevtypon)
- [IsReceiptVTYPOn](#isreceiptvtypon)
- [IsRejectionInVTYPOn](#isrejectioninvtypon)
- [IsRejectionOn](#isrejectionon)
- [IsRejectionOutVTYPOn](#isrejectionoutvtypon)
- [IsRemindersOn](#isreminderson)
- [IsRemoteAuditUser](#isremoteaudituser)
- [IsRemoteCompany](#isremotecompany)
- [IsRemoteNormalUser](#isremotenormaluser)
- [IsRemoteUser](#isremoteuser)
- [IsRevJournalVTYPOn](#isrevjournalvtypon)
- [IsRevJrnlOn](#isrevjrnlon)
- [IsSalesOrdersOn](#issalesorderson)
- [IsSalesOrderVTYPOn](#issalesordervtypon)
- [ISSalesTaxCessOn](#issalestaxcesson)
- [IsSalesVTYPOn](#issalesvtypon)
- [IsServiceTaxOn](#isservicetaxon)
- [IsStockCategoryOn](#isstockcategoryon)
- [IsStockJournalVTYPOn](#isstockjournalvtypon)
- [IsTCSOn](#istcson)
- [IsTDSOn](#istdson)
- [IsTrackingOn](#istrackingon)
- [IsTrackVouchersOn](#istrackvoucherson)
- [ItemBatchesExist](#itembatchesexist)
- [PurcAsInvoice](#purcasinvoice)
- [RejNotesExist](#rejnotesexist)
- [RevJrnlsExist](#revjrnlsexist)
- [RevLedForOpBal](#revledforopbal)

---

## BatchesExist

This function is used to check whether the ?Maintain Batch-wise details? in F11 is enabled or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any TDL expression. | Value | No | No |

---

## Cheque

This function provides the methods specified for a Bank with respect to the Cheque for the Current Company.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Company Property
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Attribute of Cheque i.e. Height,Width etc. | Value | Yes | No |
| 2 | To specify the Bank Name. | Value | Yes | No |
| 3 | To specify the Bank Name. | Value | Yes | No |

---

## ChequePrintable

This function is used to check whether the Cheque details for a Particular Bank of a Current Company are to be printed or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Bank Name. | Value | Yes | No |
| 2 | To specify the Bank Name. | Value | Yes | No |

---

## CNoteAsInvoice

This function is used to check whether the feature 'Use Invoice mode for Credit Notes' is set to Yes or No in F11 Feature 

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | valid TDL expression | Value | No | No |

---

## CostCategoriesExist

This function is used to check if there are any cost categories in existence in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is can be valid TDL expression. | Value | No | No |

---

## DCNotesExist

This function is used to check if there are any debit / credit notes in existence in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## DNoteAsInvoice

This function is used to check if the option 'Use Invoice mode for Debit Notes'  in F11 --> Inventory Feature's  is set to Yes or No.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## GodownsExist

This function is used to check whether there are any Godowns in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## HasDataErrors

This function checks if any errors are present in the company entirely or based on specific activity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is used to specify the Activity where you have to check the availability of errors (Sync, Migrate, and so on) | Value | String | No | No |

---

## HasVouchers

This function verifies the existence of a Voucher in the company.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value |  | No | No |
| 2 | This can be any valid TDL expression. | Value | String | No | No |

---

## IsAccountingOn

This function is used to check if Accounting has been enabled for the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsAllBillWiseOn

This function is used to check if the BillWise Feature for trading and non-trading a/c's has been configured in the F11 Accounting Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsAnyAttendanceVTYPOn

This function checks whether the voucher type Attendance has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyCNoteVTYPOn

This function checks whether the voucher type Credit Note has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyContraVTYPOn

This function checks whether the voucher type Contra has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyDelyNoteVTYPOn

This function checks whether the voucher type Delivery Note has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyDNoteVTYPOn

This function checks whether the voucher type Debit Note has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyEPaymentEnabled

This function checks whether the feature E-payment is enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyInvUsedForPOS

This function is used to check if Invoice is used for POS in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyJobMatIssueVTYPOn

This function checks whether the voucher type Job Material Issued has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyJobMatReceiveVTYPOn

This function checks whether the voucher type Job Material Received has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyJobOrderInVTYPOn

This function checks whether the voucher type Job Order In has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyJobOrderOutVTYPOn

This function checks whether the voucher type Job Order Out has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyJournalVTYPOn

This function checks whether the voucher type Journal has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyMemoVTYPOn

This function checks whether the voucher type Memo has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyPaymentVTYPOn

This function checks whether the voucher type Payment has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyPayrollVTYPOn

This function is used to check if Payroll Vouchers is enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyPhysStockVTYPOn

This function checks whether the voucher type Physical Stock has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyPurchaseVTYPOn

This function checks whether the voucher type Purchase has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyPurcOrderVTYPOn

This function checks whether the voucher type Purchase Order has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyRcptNoteVTYPOn

This function checks whether the voucher type Receipt Note has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyReceiptVTYPOn

This function checks whether the voucher type Receipt has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyRejectionInVTYPOn

This function checks whether the voucher type Rejection In has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyRejectionOutVTYPOn

This function checks whether the voucher type Rejection Out has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyRevJournalVTYPOn

This function checks whether the voucher type Reverse Journal has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnySalesOrderVTYPOn

This function checks whether the voucher type Sales Order has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnySalesVTYPOn

This function checks whether the voucher type Sales has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyStockJournalVTYPOn

This function checks whether the voucher type Stock Journal has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAttendanceVTYPOn

This function checks whether the voucher type Attendance has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsBatchWiseOn

This function is used to check if the BatchWise Feature has been configured in the F11 Inventory Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsBillWiseOn

This function is used to check if the BillWise Feature for trading a/c's has been configured in the F11 Accounting Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsBudgetsOn

This function is used to check if the 'Maintain Budgets and Controls' feature (Budgets & Scenario Management) has been configured in F11 Accounting Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsChqPrintingOn

This function is used to check whether the cheque printing option is activated or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsCNoteVTYPOn

This function checks whether the voucher type Credit Note has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsCompositeDealer

This function is used to check the composite dealer.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsContraVTYPOn

This function checks whether the voucher type Contra has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsCostCategoryOn

This function is used to check if the Cost Category Feature has been configured in the F11 Inventory Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsCostCentresOn

This function is used to check if the Cost Centre Feature has been configured in the F11 Accounting Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsCostTrackingOn

This function is used to check the Cost Tracking is On or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsDataErrPresentInGrpCmp

Returns TRUE if any of the constituent companies of the given group company has data errors. Gets the group company name from SVCurrentCompany variable.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsDCNoteOn

This function is used to check if 'Use Debit/Credit Note'in F11 Inventory Features is set to Yes or No.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsDelyNoteVTYPOn

This function checks whether the voucher type Delivery Note has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsDiscountsOn

This function is used to check if the feature  'Separate Discount Column on Invoices' is set to Yes or No in F11 Inventory Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsDNoteVTYPOn

This function checks whether the voucher type Delivery Note has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsEditLogOn

This function checks whether the option Edit Log is enabled for the Company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsePaymentEnabled

This function checks whether the E-Payment has been enabled in current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsExciseOn

This function is used to check if the selected company have ?Follow Excise rules for Invoicing  is  On? in the F11 Statutory Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsExciseReportsOn

This function is used to check the Excise Reports is set to yes or no.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsExciseTraderOn

This function is used to check the Excise Traders is On or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsFBTOn

This function is used to check the FBT is On or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsGlobalAccountingOn

This function checks whether Accounting has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalBatchWiseOn

This function checks whether the option Batchwise has been configured for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalBillWiseOn

This function checks whether BillWise for trading accounts has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalCostCentresOn

This function checks whether Cost Centre has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalCostTrackingOn

This function checks whether the Cost Tracking is enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalEditLogOn

This function checks and returns whether the option Edit Log is enabled in any loaded Company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalExciseTraderOn

This function checks whether the option Excise Traders has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalGSTOn

This function checks whether the option Enable Goods and Services Tax (GST) has been configured for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalInterestOn

This function checks whether the option Interest Calculation has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalInventoryOn

This function checks whether Inventory has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalJobCostingOn

This function checks whether Job Costing has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalJobWorkOn

This function checks whether the option of Job work has been enabled in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalMultiCurrencyOn

This function checks whether the option Allow Multi-Currency (General) has been configured for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalMultiGodownOn

This function checks whether the option Maintain Multiple Godowns has been configured for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalPaymentRequestOn

This function checks whether the F11 feature 'Enable Payment Request' has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalPayrollOn

This function checks whether the Maintain Payroll feature (Cost/Profit Centres Management) has been configured in F11 Features for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalPayrollStatOn

This function checks whether the Payroll Stat has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalPurcOrdersOn

This function checks whether the option Allow Purchase Order Processing has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalSalesOrdersOn

This function checks whether the option Allow Sales Order Processing has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalServiceTaxOn

This function checks whether the option Enable Service Tax has been configured for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalTCSOn

This function checks whether the option Enable Tax Collected at Source (TCS) has been configured for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalTDSOn

This function checks whether the option Enable Tax Deducted at Source (TDS) has been configured for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalTrackingOn

This function checks whether the option Use Tracking Numbers has been enabled for any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGlobalTrackVouchersOn

This function checks whether the option Track vouchers has been enabled in all the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGSTOn

This function is used to check if Enable GST has been configured in F11 Statutory & Taxation Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsIndentOn

This function is used to check whether the indent is On or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsIntegrated

This function is used to check if the Accounts and Inventory have been integrated in the F11 Company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsInventoryOn

This function is used to check if inventory  has been enabled or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsInvoicingOn

This function is used to check if the Invoicing feature has been configured in the F11 Company Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsInvUsedForPOS

This function checks whether the Invoice is used for POS in current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsJobCostingOn

This function is used to check the job costing is On or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsJobMatIssueVTYPOn

This function checks whether the voucher type Job material Issued has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsJobMatReceiveVTYPOn

This function checks whether the voucher type Job Material Received has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsJobOrderInVTYPOn

This function checks whether the voucher type Job Order In has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsJobOrderOutVTYPOn

This function checks whether the voucher type Job Order Out has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsJobWorkOn

This function is used to check the Job Work is On or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsJournalVTYPOn

This function checks whether the voucher type Journal has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsMaterialTransferOn

This function is used to check the Material Transfer is On or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsMemoVTYPOn

This function checks whether the voucher type Memo has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsMultiCurrencyOn

This function is used to check if the Allow Multi Currency feature (General) has been configured in the F11 Accounting Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsMultiGodownOn

This function is used to check if the Maintain Multiple Godowns feature (Storage & Classification) has been configured in F11 Inventory Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsPaymentRequestOn

This function checks whether the option Enable Payment Request is enabled for the Company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsPaymentVTYPOn

This function checks whether the voucher type Payment has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsPayrollOn

This function is used to check if the Maintain Payroll feature (Cost/Profit Centres Management) has been configured in F11 Accounting Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsPayrollStatOn

This function is used to check the Payroll Stat is On or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsPayrollVTYPOn

This function checks whether the voucher type Payroll has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsPerishableOn

This function is used to check whether the ?Set expiry date for batches? in F11 Inventory Features is activated or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsPhysStockVTYPOn

This function checks whether the voucher type Physical Stock has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsPurchaseVTYPOn

This function checks whether the voucher type Purchase has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsPurcOrdersOn

This function is used to check if 'Allow Purchase Order Processing'  in F11 Inventory Features is set to Yes or No.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsPurcOrderVTYPOn

This function checks whether the voucher type Sales Order has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsRcptNoteVTYPOn

This function checks whether the voucher type Receipt Note has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsReceiptVTYPOn

This function checks whether the voucher type Receipt has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsRejectionInVTYPOn

This function checks whether the voucher type Rejection In has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsRejectionOn

This function is used to check if 'Use Rejection Inward/Outward Notes' in F11 Inventory Features is set to Yes or No.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsRejectionOutVTYPOn

This function checks whether the voucher type Rejection Out has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsRemindersOn

This function is used to check the reminders.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsRemoteAuditUser

This function is used to check the RemoteAuditUser.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsRemoteCompany

This function is used to check whether the company is remote or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsRemoteNormalUser

This function is used to check the RemoteNormalUser.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsRemoteUser

This function is used to check the remote user.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsRevJournalVTYPOn

This function checks whether the voucher type Reverse Journal has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsRevJrnlOn

This function is used to check if the Use Reversing Journals & Optional Vouchers feature (Budgets & Scenario Management) has been configured in F11 Accounting Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsSalesOrdersOn

This function is used to check if 'Allow Sales Order Processing' in F11 Features -> Inventory Features is set to Yes or No.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsSalesOrderVTYPOn

This function checks whether the voucher type Sales Order has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## ISSalesTaxCessOn

This function is used to check if Enable Sales Tax Cess has been configured in F11 Statutory & Taxation Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsSalesVTYPOn

This function checks whether the voucher type Sale has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsServiceTaxOn

This function is used to check if Enable Service Tax has been configured in F11 Statutory & Taxation Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsStockCategoryOn

This function is used to check if 'Maintain Stock Categories ?' is enabled in F11 features or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsStockJournalVTYPOn

This function checks whether the voucher type Stock Journal has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Any valid TDL expression. | Value | No | No |

---

## IsTCSOn

This function is used to check if Enable Tax Collected at Source (TCS) has been configured in F11 Statutory & Taxation Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsTDSOn

This function is used to check if Enable Tax Deducted at Source (TDS) has been configured in F11 Statutory & Taxation Features.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsTrackingOn

This function is used to check if 'Use Tracking Numbers (Delivery/Reciept Notes)in F11 Features -> Inventory Features ' is set to Yes or No.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsTrackVouchersOn

This function checks whether the option Track vouchers has been enabled in the company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## ItemBatchesExist

This function is used to check if the Stock item has batches or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify a valid TDL expression. | Value |  | No | No |
| 2 | To specify a valid TDL expression. | Value | String | No | No |

---

## PurcAsInvoice

This function is used to check if 'Enter Purchases in Invoice Format' in F11 Inventory Features  is set to Yes or No.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## RejNotesExist

This function is used to check if any Rejection Note entries exist in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## RevJrnlsExist

This function is used to check if there is any reversing journal in existence in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## RevLedForOpBal

Function returns whether revenue ledgers are considered for costcneter opening balance or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Company Property
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a company name. | Value | No | No |

---
