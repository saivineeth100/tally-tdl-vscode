# Business Function

> **Version**: 7.0

Reference documentation for all entries in the **Business** function.

> **Total Entries**: 332

## Table of Contents

- [AccountName](#accountname)
- [ActualPaidFor](#actualpaidfor)
- [AddlColumnValue](#addlcolumnvalue)
- [Alias](#alias)
- [AllocIndentQty](#allocindentqty)
- [Allow](#allow)
- [AllowCreateAnyVoucher](#allowcreateanyvoucher)
- [AllowCreateVoucher](#allowcreatevoucher)
- [AnyGSTNotificationPending](#anygstnotificationpending)
- [AttdFor](#attdfor)
- [BankersDate](#bankersdate)
- [BillValue](#billvalue)
- [BuySpecRate](#buyspecrate)
- [CCAQtyClosing](#ccaqtyclosing)
- [CCAQtyCredits](#ccaqtycredits)
- [CCAQtyDebits](#ccaqtydebits)
- [CCAQtyOpening](#ccaqtyopening)
- [CCBQtyClosing](#ccbqtyclosing)
- [CCBQtyCredits](#ccbqtycredits)
- [CCBQtyDebits](#ccbqtydebits)
- [CCBQtyOpening](#ccbqtyopening)
- [CCClosing](#ccclosing)
- [CCCredits](#cccredits)
- [CCDebits](#ccdebits)
- [CCGLClosing](#ccglclosing)
- [CCGLCredits](#ccglcredits)
- [CCGLDebits](#ccgldebits)
- [CCGLOpening](#ccglopening)
- [CCGSAQtyClosing](#ccgsaqtyclosing)
- [CCGSAQtyCredits](#ccgsaqtycredits)
- [CCGSAQtyDebits](#ccgsaqtydebits)
- [CCGSAQtyOpening](#ccgsaqtyopening)
- [CCGSBQtyClosing](#ccgsbqtyclosing)
- [CCGSBQtyCredits](#ccgsbqtycredits)
- [CCGSBQtyDebits](#ccgsbqtydebits)
- [CCGSBQtyOpening](#ccgsbqtyopening)
- [CCOpening](#ccopening)
- [ClassLogicalValue](#classlogicalvalue)
- [CmpExistsOnDisk](#cmpexistsondisk)
- [CmpNumberFromPath](#cmpnumberfrompath)
- [ColumnValue](#columnvalue)
- [CompanyBaseCurrency](#companybasecurrency)
- [CopyFrom](#copyfrom)
- [DirectAllVch](#directallvch)
- [DirectCancVch](#directcancvch)
- [DirectOptionalVch](#directoptionalvch)
- [DirectTotalVch](#directtotalvch)
- [ExplicitAllow](#explicitallow)
- [FilterAssessableAmt](#filterassessableamt)
- [FilterVATTaxAmt](#filtervattaxamt)
- [FirstContraAcc](#firstcontraacc)
- [FirstContraInv](#firstcontrainv)
- [FirstPartyName](#firstpartyname)
- [GetChequeRange](#getchequerange)
- [GetCmpNameFromPath](#getcmpnamefrompath)
- [GetCmpNumFromPath](#getcmpnumfrompath)
- [GetDateExprValueFromPrevSignedReturn](#getdateexprvaluefromprevsignedreturn)
- [GetDiscountFromLevel](#getdiscountfromlevel)
- [GetExtDataFirstContriDate](#getextdatafirstcontridate)
- [GetExtDataLastContriDate](#getextdatalastcontridate)
- [GetForexAmount](#getforexamount)
- [GetItemQuantity](#getitemquantity)
- [GetLastExchangeOnlineTime](#getlastexchangeonlinetime)
- [GetLastPinDistance](#getlastpindistance)
- [GetLatestExtDataInfoID](#getlatestextdatainfoid)
- [GetLocForPin](#getlocforpin)
- [GetLogicalExprValueFromPrevSignedReturn](#getlogicalexprvaluefromprevsignedreturn)
- [GetMappedMaster](#getmappedmaster)
- [GetPartyGSTINs](#getpartygstins)
- [GetPriceFromLevel](#getpricefromlevel)
- [GetPricePrevDate](#getpriceprevdate)
- [GetSysIdExprValueFromPrevSignedReturn](#getsysidexprvaluefromprevsignedreturn)
- [GetTaxObjPartyValue](#gettaxobjpartyvalue)
- [GetTSServerName](#gettsservername)
- [GetVchCount](#getvchcount)
- [GlobalAllow](#globalallow)
- [GlobalExplicitAllow](#globalexplicitallow)
- [GodownGroupValue](#godowngroupvalue)
- [GodownItemValue](#godownitemvalue)
- [GrossPayFor](#grosspayfor)
- [GrossVchPayFor](#grossvchpayfor)
- [GrpInQty](#grpinqty)
- [GrpInValue](#grpinvalue)
- [GrpOutQty](#grpoutqty)
- [GrpOutValue](#grpoutvalue)
- [GrpPurcBaseValue](#grppurcbasevalue)
- [GrpPurcQty](#grppurcqty)
- [GrpPurcValue](#grppurcvalue)
- [GrpSaleQty](#grpsaleqty)
- [GrpSaleValue](#grpsalevalue)
- [HasCommonUnit](#hascommonunit)
- [HeadUnits](#headunits)
- [HiLoClDate](#hilocldate)
- [HiLoClQty](#hiloclqty)
- [HiLoClVal](#hiloclval)
- [HiLoCrDate](#hilocrdate)
- [HiLoCrQty](#hilocrqty)
- [HiLoCrVal](#hilocrval)
- [HiLoDrDate](#hilodrdate)
- [HiLoDrQty](#hilodrqty)
- [HiLoDrVal](#hilodrval)
- [HiLoNettCrVal](#hilonettcrval)
- [IsAccountingVch](#isaccountingvch)
- [IsAdjustmentClassification](#isadjustmentclassification)
- [IsAnyFetchedDataReset](#isanyfetcheddatareset)
- [IsAttdTypeValid](#isattdtypevalid)
- [IsAttendance](#isattendance)
- [IsAttendanceType](#isattendancetype)
- [IsAudited](#isaudited)
- [IsAuditModified](#isauditmodified)
- [IsAuthAsAuditor](#isauthasauditor)
- [IsBatch](#isbatch)
- [IsBill](#isbill)
- [IsBudget](#isbudget)
- [IsBudgetReport](#isbudgetreport)
- [IsCompany](#iscompany)
- [IsContra](#iscontra)
- [IsContriPresentInLatestIMSExtData](#iscontripresentinlatestimsextdata)
- [IsCostCategory](#iscostcategory)
- [IsCostCentre](#iscostcentre)
- [IsCreditNote](#iscreditnote)
- [IsCurrency](#iscurrency)
- [IsDebitNote](#isdebitnote)
- [IsDeducteeType](#isdeducteetype)
- [IsDelNote](#isdelnote)
- [IsDisplayReportModified](#isdisplayreportmodified)
- [IsDuplicateARESerialNumber](#isduplicateareserialnumber)
- [IsDuplicateNumber](#isduplicatenumber)
- [IsDuplicateSerialNumber](#isduplicateserialnumber)
- [IsDuplicateTaxRegistration](#isduplicatetaxregistration)
- [IsEmptyObject](#isemptyobject)
- [IsExcise](#isexcise)
- [IsExciseDutyClassification](#isexcisedutyclassification)
- [IsFBTAType](#isfbtatype)
- [IsFBTCategory](#isfbtcategory)
- [IsGodown](#isgodown)
- [IsGroup](#isgroup)
- [IsGSTClassification](#isgstclassification)
- [IsIncomeTaxClassification](#isincometaxclassification)
- [IsIncomeTaxSlab](#isincometaxslab)
- [IsIndent](#isindent)
- [IsIndentVoucher](#isindentvoucher)
- [IsInventoryVch](#isinventoryvch)
- [IsInvVch](#isinvvch)
- [IsJobMaterialIssue](#isjobmaterialissue)
- [IsJobMaterialReceive](#isjobmaterialreceive)
- [IsJobOrderIn](#isjoborderin)
- [IsJobOrderOut](#isjoborderout)
- [IsJournal](#isjournal)
- [IsLBTClassification](#islbtclassification)
- [IsLedger](#isledger)
- [IsMemo](#ismemo)
- [IsMerchantProfile](#ismerchantprofile)
- [IsMethodChangedDuringImport](#ismethodchangedduringimport)
- [IsObjectInImportMode](#isobjectinimportmode)
- [IsObjectInMigReaccept](#isobjectinmigreaccept)
- [IsObjectInReaccept](#isobjectinreaccept)
- [IsOrder](#isorder)
- [IsOrderVch](#isordervch)
- [IsOverRun](#isoverrun)
- [IsOwner](#isowner)
- [IsPayment](#ispayment)
- [IsPayroll](#ispayroll)
- [IsPayrollVch](#ispayrollvch)
- [IsPeriod](#isperiod)
- [IsPhysStock](#isphysstock)
- [IsPrimaryCompany](#isprimarycompany)
- [IsPurchase](#ispurchase)
- [IsPurcOrder](#ispurcorder)
- [IsRcptNote](#isrcptnote)
- [IsReceipt](#isreceipt)
- [IsRejIn](#isrejin)
- [IsRejOut](#isrejout)
- [IsRevJrnl](#isrevjrnl)
- [IsSales](#issales)
- [IsSalesOrder](#issalesorder)
- [IsSerialNumber](#isserialnumber)
- [IsState](#isstate)
- [IsStCategory](#isstcategory)
- [IsStockCategory](#isstockcategory)
- [IsStockGroup](#isstockgroup)
- [IsStockItem](#isstockitem)
- [IsStockJrnl](#isstockjrnl)
- [IsTariffClassification](#istariffclassification)
- [IsTaxUnit](#istaxunit)
- [IsTDLObject](#istdlobject)
- [IsTDSRate](#istdsrate)
- [IsTrack](#istrack)
- [IsTrueInAnyCmp](#istrueinanycmp)
- [IsTSAuthorised](#istsauthorised)
- [IsTSCompany](#istscompany)
- [IsTSPath](#istspath)
- [IsUnderRun](#isunderrun)
- [IsUnit](#isunit)
- [IsUserAllowed](#isuserallowed)
- [IsValidCompanyDir](#isvalidcompanydir)
- [IsValidTSEndPointPath](#isvalidtsendpointpath)
- [IsVatClassification](#isvatclassification)
- [IsVoucher](#isvoucher)
- [IsVoucherType](#isvouchertype)
- [LanguageName](#languagename)
- [LastCreatedVchAltId](#lastcreatedvchaltid)
- [LastCreatedVchId](#lastcreatedvchid)
- [LedgerGodownMatTransInQty](#ledgergodownmattransinqty)
- [LedgerGodownMatTransInValue](#ledgergodownmattransinvalue)
- [LedgerGodownMatTransOutQty](#ledgergodownmattransoutqty)
- [LedgerGodownMatTransOutValue](#ledgergodownmattransoutvalue)
- [LedgerGodownMatTransQty](#ledgergodownmattransqty)
- [LedgerGodownMatTransValue](#ledgergodownmattransvalue)
- [LedInCost](#ledincost)
- [LedInPrice](#ledinprice)
- [LedInQty](#ledinqty)
- [LedInValue](#ledinvalue)
- [LedOutPrice](#ledoutprice)
- [LedOutQty](#ledoutqty)
- [LedOutValue](#ledoutvalue)
- [LedPurcBaseValue](#ledpurcbasevalue)
- [LedPurcCost](#ledpurccost)
- [LedPurcPrice](#ledpurcprice)
- [LedPurcQty](#ledpurcqty)
- [LedPurcValue](#ledpurcvalue)
- [LedSalePrice](#ledsaleprice)
- [LedSaleQty](#ledsaleqty)
- [LedSaleValue](#ledsalevalue)
- [MakeConfigDataKey](#makeconfigdatakey)
- [MasterSerialNumber](#masterserialnumber)
- [MasterSerialNumberType](#masterserialnumbertype)
- [NextChequeNumber](#nextchequenumber)
- [NumActiveVchType](#numactivevchtype)
- [NumAttendance](#numattendance)
- [NumConnectableCmps](#numconnectablecmps)
- [NumConnectedCmps](#numconnectedcmps)
- [NumContra](#numcontra)
- [NumCreditNote](#numcreditnote)
- [NumDebitNote](#numdebitnote)
- [NumDelNote](#numdelnote)
- [NumIndent](#numindent)
- [NumJobMaterialIssue](#numjobmaterialissue)
- [NumJobMaterialReceive](#numjobmaterialreceive)
- [NumJobOrderIn](#numjoborderin)
- [NumJobOrderOut](#numjoborderout)
- [NumJournal](#numjournal)
- [NumMemo](#nummemo)
- [NumOfVchType](#numofvchtype)
- [NumPayment](#numpayment)
- [NumPayroll](#numpayroll)
- [NumPhysStock](#numphysstock)
- [NumPurchase](#numpurchase)
- [NumPurcOrder](#numpurcorder)
- [NumPurcQuot](#numpurcquot)
- [NumRcptNote](#numrcptnote)
- [NumReceipt](#numreceipt)
- [NumRejIn](#numrejin)
- [NumRejOut](#numrejout)
- [NumRevJrnl](#numrevjrnl)
- [NumSales](#numsales)
- [NumSalesOrder](#numsalesorder)
- [NumSalesQuot](#numsalesquot)
- [NumStockJrnl](#numstockjrnl)
- [OnAccountTotal](#onaccounttotal)
- [OrigVchGrpCrTotal](#origvchgrpcrtotal)
- [OrigVchGrpDrTotal](#origvchgrpdrtotal)
- [OrigVchGrpTotal](#origvchgrptotal)
- [OrigVchLedCrTotal](#origvchledcrtotal)
- [OrigVchLedCstCrTotal](#origvchledcstcrtotal)
- [OrigVchLedCstDrTotal](#origvchledcstdrtotal)
- [OrigVchLedCstTotal](#origvchledcsttotal)
- [OrigVchLedDrTotal](#origvchleddrtotal)
- [OrigVchLedTotal](#origvchledtotal)
- [PaidFor](#paidfor)
- [PaidForCr](#paidforcr)
- [PaidForDr](#paidfordr)
- [PayFor](#payfor)
- [PayheadComputeAsString](#payheadcomputeasstring)
- [PayType](#paytype)
- [PNAlias](#pnalias)
- [ResidualRate](#residualrate)
- [ResidualValue](#residualvalue)
- [RestoreListExists](#restorelistexists)
- [SelectedCmps](#selectedcmps)
- [SelectedNonTSCmps](#selectednontscmps)
- [StockAge](#stockage)
- [StockAgeValue](#stockagevalue)
- [StockPartyAge](#stockpartyage)
- [StockPartyAgeValue](#stockpartyagevalue)
- [TailUnits](#tailunits)
- [TSPingInfo](#tspinginfo)
- [ValidateTINMod97](#validatetinmod97)
- [VchItemTotal](#vchitemtotal)
- [VchLedTotal](#vchledtotal)
- [VchPayFor](#vchpayfor)
- [VchPurcBaseValue](#vchpurcbasevalue)
- [VchPurcCost](#vchpurccost)
- [VchPurcPrice](#vchpurcprice)
- [VchPurcQty](#vchpurcqty)
- [VchPurcValue](#vchpurcvalue)
- [VchRate](#vchrate)
- [VchSalePrice](#vchsaleprice)
- [VchSaleQty](#vchsaleqty)
- [VchSaleValue](#vchsalevalue)
- [VchTotalQty](#vchtotalqty)
- [VchTypeAttendance](#vchtypeattendance)
- [VchTypeContra](#vchtypecontra)
- [VchTypeCreditNote](#vchtypecreditnote)
- [VchTypeDebitNote](#vchtypedebitnote)
- [VchTypeDelNote](#vchtypedelnote)
- [VchTypeIndent](#vchtypeindent)
- [VchTypeJobMaterialIssue](#vchtypejobmaterialissue)
- [VchTypeJobMaterialReceive](#vchtypejobmaterialreceive)
- [VchTypeJobOrderIn](#vchtypejoborderin)
- [VchTypeJobOrderOut](#vchtypejoborderout)
- [VchTypeJournal](#vchtypejournal)
- [VchTypeMemo](#vchtypememo)
- [VchTypeMfgJrnl](#vchtypemfgjrnl)
- [VchTypeOfFamily](#vchtypeoffamily)
- [VchTypePayment](#vchtypepayment)
- [VchTypePayroll](#vchtypepayroll)
- [VchTypePhysStock](#vchtypephysstock)
- [VchTypePurchase](#vchtypepurchase)
- [VchTypePurcOrder](#vchtypepurcorder)
- [VchTypePurcQuot](#vchtypepurcquot)
- [VchTypeRcptNote](#vchtypercptnote)
- [VchTypeReceipt](#vchtypereceipt)
- [VchTypeRejIn](#vchtyperejin)
- [VchTypeRejOut](#vchtyperejout)
- [VchTypeRevJrnl](#vchtyperevjrnl)
- [VchTypeSales](#vchtypesales)
- [VchTypeSalesOrder](#vchtypesalesorder)
- [VchTypeSalesQuot](#vchtypesalesquot)
- [VchTypeStockJrnl](#vchtypestockjrnl)
- [VoucherNumber](#vouchernumber)
- [VoucherNumberBySeries](#vouchernumberbyseries)

---

## AccountName

This function returns account name under the context of All ledger entries/Ledger entries.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## ActualPaidFor

This function returns the Total Amount of all the Payment Vouchers made through a specified Bank Ledger to a specified Employee for a given period.Exception:This is used in the Payment Advice Report of Payroll.

### Meta

- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Employee name. | Value | String | Yes | No |
| 2 | To specify Payroll Bank ledger name. | Value | String | Yes | No |
| 3 | To specify Payroll Bank ledger name. | Value | Date | Yes | No |
| 4 | The To date of that period. | Value | Date | Yes | No |
| 5 | The To date of that period. | Value | Logical | No | No |
| 6 | Ignore date | Value | Logical | No | No |

---

## AddlColumnValue

This function is used to add column in multicolumnar reports.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

_No parameters._

---

## Alias

This function returns the alias name of the current object.For every object there is an alias name.This can be entered in master level.By this function that name is retrieved.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the alias number. | Value | Long | No | No |
| 2 | To specify the whether to return last alias if specified index is not found. | Value | Logical | No | No |

---

## AllocIndentQty

This function gives the allocated amount for the bill name in the bill vouchers of the bill, which are specified in the Ledger Entry collection of the object Bill.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

_No parameters._

---

## Allow

This function checks the permissions for the currently logged in user.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | The permissions ex. Print,Create | Value | Yes | No |
| 2 | The object on which the permission needs to be checked. | Value | Yes | No |

---

## AllowCreateAnyVoucher

This function checks if user has security access to create a voucher of any voucher type or not. Based on optional parameter, it will consider whether voucher type is active or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Whether active should be considered or not. | Value | Logical | No | No |
| 2 | Company name. If this argument is empty, Current company is considered. | Value | String | No | No |

---

## AllowCreateVoucher

This function checks if user has security access to create a voucher of given voucher type or not. The function returns result based on current for current comapny OR given company also considering isactive (optional) - if provided.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Name of Voucher Type for to check if user is allowed to create voucher. | Value | String | Yes | No |
| 2 | Whether active should be considered or not. | Value | Logical | No | No |
| 3 | Whether active should be considered or not. | Value | String | No | No |

---

## AnyGSTNotificationPending

This function returns if GST Notification is pending for given Company (if given) or any company

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the Type (sysname). Default is Any. Currently supported SysName is Any. We can extend it to UnRead, UnSeen when needed | Value | String | No | No |
| 2 | Specify the Type (sysname). Default is Any. Currently supported SysName is Any. We can extend it to UnRead, UnSeen when needed | Value | String | No | No |

---

## AttdFor

This function is used to fetch the number of days an employee is Absent or present for a specific period.Here parameter passed 'Absent' is an attendance type.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Employee name. | Value | String | Yes | No |
| 2 | To specify From date. | Value | Date | Yes | No |
| 3 | To specify From date. | Value | Date | Yes | No |
| 4 | To specifyAttendance type like Absent, present etc. | Value | String | Yes | No |

---

## BankersDate

Retrives the $BankersDate value from the voucher. This function works only in the voucher object context.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## BillValue

This function is used to retrieve the bill value of an object by passing or not passing multiple parameters. Passing without parameters, retrieves the net bill amount.Passing a logical value 'Yes', retrieves the Debit bill amount. Passing a logical value 'No', retrieves the credit bill value. Passing a logical value  retrieves either overdue bills, From age, To Age or the due date values.

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Logical Value.Yes for debit bill amount. | Value | Logical | No | No |
| 2 | To specify Overdue bills. | Value | Logical | No | No |
| 3 | To specify Overdue bills. | Value | Number | No | No |
| 4 | To specify To age. | Value | Number | No | No |
| 5 | To specify To age. | Value | Logical | No | No |

---

## BuySpecRate

This function gives the specified rate of exchange value for a date.If no value is specified it gives the rate for last date before the specified date.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Hybrid
- **Return Type**: Rate of Exchange

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Date for which specified rate of exchange is to be find for buying. | Value | Date | Yes | No |
| 2 | To specify Date for which specified rate of exchange is to be find for buying. | Value | String | No | No |

---

## CCAQtyClosing

This function provides the Closing Balance Quantity of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Closing Balance Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the Cost Centre Account name. | Value | String | Yes | No |

---

## CCAQtyCredits

This function provides the Credit Quantity of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Credit Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the Cost Centre Account name. | Value | String | Yes | No |

---

## CCAQtyDebits

This function provides the Debit Quantity of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Debit Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the Cost Centre Account name. | Value | String | Yes | No |

---

## CCAQtyOpening

This function provides the Opening Quantity of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Opening Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the Cost Centre Account name. | Value | String | Yes | No |

---

## CCBQtyClosing

This function provides the Closing Quantity of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Closing Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the Cost Centre Account name. | Value | String | Yes | No |

---

## CCBQtyCredits

This function provides the Credit Quantity of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Credit Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the Cost Centre Account name. | Value | String | Yes | No |

---

## CCBQtyDebits

This function provides the Debit Quantity of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Debit Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the Cost Centre Account name. | Value | String | Yes | No |

---

## CCBQtyOpening

This function provides the Opening Quantity of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Opening Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the Cost Centre Account name. | Value | String | Yes | No |

---

## CCClosing

This function provides the Closing Balance of the specified Cost Centre. The function accepts the CostCentreName as parameter and as a result, displays the Closing Balance.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Cost Center name. | Value | String | Yes | No |

---

## CCCredits

This function provides the Credit amount total of the specified Cost Centre.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Cost Center name. | Value | String | Yes | No |

---

## CCDebits

This function provides the total debit amount of the specified cost center.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Cost Center name. | Value | String | Yes | No |

---

## CCGLClosing

This returns Closing balance value of a Cost Centre for a particular group or Ledger in the parameter and retrieves value under Cost Centre object. The Ledger Name and Group Name parameter in this function accepts formulae, variable and string.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Ledger name. | Value | String | Yes | No |
| 2 | To specify the Group name. | Value | String | Yes | No |
| 3 | To specify the Group name. | Value | Logical | No | No |

---

## CCGLCredits

This returns the total credit balance value of a Cost Centre for a particular group or Ledger in the parameter and retrieves value under Cost Centre object.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Ledger name. | Value | String | Yes | No |
| 2 | To specify the Ledger name. | Value | String | Yes | No |
| 3 | Consider children also. | Value | Logical | No | No |

---

## CCGLDebits

This returns total Debit balance value of a Cost Centre for a particular group or Ledger in the parameter and retrieves value under Cost Centre object. Ledger Name and Group Name parameter accepts functions, variable and string.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Ledger name. | Value | String | Yes | No |
| 2 | To specify the Group name. | Value | String | Yes | No |
| 3 | To specify the Group name. | Value | Logical | No | No |

---

## CCGLOpening

This returns Opening balance value of a Cost Centre for a particular group or Ledger in the parameter and retrieves value under Cost Centre object.The Ledger Name and Group Name parameter in this function accepts functions, variable and string.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Ledger name. | Value | String | Yes | No |
| 2 | To specify the Ledger name. | Value | String | Yes | No |
| 3 | Consider children also | Value | Logical | No | No |

---

## CCGSAQtyClosing

This returns the Closing Quantity for the Cost Centre.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Group name | Value | String | Yes | No |
| 3 | Group name | Value | Logical | No | No |

---

## CCGSAQtyCredits

This function returns the Credit Quantity for the Cost Centre.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Ledger name | Value | String | Yes | No |
| 3 | Consider children also | Value | Logical | No | No |

---

## CCGSAQtyDebits

This function returns the Debit Quantity for the Cost Centre.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Group name | Value | String | Yes | No |
| 3 | Group name | Value | Logical | No | No |

---

## CCGSAQtyOpening

This function returns the opening Quantity for the Cost Centre.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Ledger name | Value | String | Yes | No |
| 3 | Consider children also | Value | Logical | No | No |

---

## CCGSBQtyClosing

This function returns the closing Quantity for the Cost Centre.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Group name | Value | String | Yes | No |
| 3 | Group name | Value | Logical | No | No |

---

## CCGSBQtyCredits

This function returns the credit Quantity for the Cost Centre.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Ledger name | Value | String | Yes | No |
| 3 | Consider children also | Value | Logical | No | No |

---

## CCGSBQtyDebits

This function returns the Debit Quantity for the Cost Centre.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Group name | Value | String | Yes | No |
| 3 | Group name | Value | Logical | No | No |

---

## CCGSBQtyOpening

This function returns the Opening Quantity for the Cost Centre

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Ledger name | Value | String | Yes | No |
| 3 | Consider children also | Value | Logical | No | No |

---

## CCOpening

This function provides the Opening Balance of the specified Cost Centre.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Cost Center name. | Value | String | Yes | No |

---

## ClassLogicalValue

This function is used to check if the method for a Particular voucher Type of Particular class is enabled or not.If enabled, a Logical Value Yes is returned, else a No is returned.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher Type name. | Value | String | Yes | No |
| 2 | To specify the Voucher Type name. | Value | String | Yes | No |
| 3 | To specify the Method name. | Value |  | Yes | No |

---

## CmpExistsOnDisk

This function is used to check availability of companies in the given path.Current path is the path given in company selection prompt.If in the path any companies exist,this function returns the logical value 'yes' else it will return 'no'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the path to be searched for companies. | Value | String | Yes | No |

---

## CmpNumberFromPath

This function returns the company number from the specifed path as string.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the path. | Value | String | Yes | No |

---

## ColumnValue

Returns the columnar total for each repeated ledger.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

_No parameters._

---

## CompanyBaseCurrency

Gives the base currency of the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## CopyFrom

This function is used to copy the content of entire object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Object name whose values are copied | Value | String | No | No |

---

## DirectAllVch

This function provides the total number of vouchers for the specified voucher type name.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  Voucher Type Name. | Value | String | Yes | No |

---

## DirectCancVch

This function provides the total number of cancelled vouchers for the specified voucher type name.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher Type Name. | Value | String | Yes | No |

---

## DirectOptionalVch

This function provides the total number of optional vouchers for the specified voucher type name.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher Type Name. | Value | String | Yes | No |

---

## DirectTotalVch

This function provides the total number of vouchers saved for a particular voucher type.Retirn type is number.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher Type Name. | Value | String | Yes | No |

---

## ExplicitAllow

This function checks if the permission is allowed to view a report etc. explicitly for a user, who otherwise would not have access by default.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This takes mode name 'Display'. | Value | Yes | No |
| 2 | This takes mode name 'Display'. | Value | Yes | No |

---

## FilterAssessableAmt

This function is used to get the VAT Assessable Amount of a Tax classification by filter.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Name of the Tax classification. | Value | String | Yes |  | No |
| 2 | This is an expression which evaluates to Name of the Tax classification. | Identifier |  | Yes | System Formulae | No |

---

## FilterVATTaxAmt

This function is used to get the VAT Tax Amount of a Tax classification by filter.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Name of the Tax classification. | Value | String | Yes |  | No |
| 2 | This is an expression which evaluates to Name of the Tax classification. | Identifier |  | Yes | System Formulae | No |

---

## FirstContraAcc

This function retrieves first contra Ledger Name against the selected Ledger / Group. This is basically used in Ledger / Group Voucher report. Typically in a Voucher, if first amount is 'Debit' then it would return First 'Credit' Ledger Name in the voucher.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Logical expression.If debit it returns first credit ledger name in the voucher and vice versa | Value | Logical | Yes | No |

---

## FirstContraInv

This function retrieves first contra Stock Item Name against the selected Stock Item. This is used in Stock Voucher report. Typically in a Stock Journal Voucher, there is an inward and outward movement of Stock. In such case a Stock Item's Stock Journals are displayed. If the selected Stock Item has inward movement it would retrieve the First Stock Item Name in the Outward movement.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Stock item name | Value | String | Yes | No |

---

## FirstPartyName

Gives the first occurence of specified inventory item in stock

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Takes a stock item name | Value | String | Yes | No |

---

## GetChequeRange

It gives the last available cheque no.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Name of the Ledger | Value | String | Yes | No |
| 2 | cheque no. to get the range | Value | Number | Yes | No |

---

## GetCmpNameFromPath

This function returns the company name from the specifed path.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the path. | Value | String | Yes | No |

---

## GetCmpNumFromPath

This function returns the company number from the specifed path.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the path. | Value | String | Yes | No |

---

## GetDateExprValueFromPrevSignedReturn

This function searches for signed returnwise details with given return, section and period less than the given, parses the given expression in that object context and returns the date value.In case of any failure/signed version not found then Empty value is returned

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the expression to parse | Identifier |  | Yes | No |
| 2 | Specify the Return Period. | Value | Date | Yes | No |
| 3 | Specify the Return Period. | Value | String | Yes | No |
| 4 | Specify the Section Name | Value | String | No | No |

---

## GetDiscountFromLevel

To get a discount value for specified Price Level, Date & Quantity.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Name of Stock Item. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Name of Price Level. | Value | String | Yes | No |
| 3 | This is an expression which evaluates to Name of Price Level. | Value | Date | Yes | No |
| 4 | This is an expression which evaluates to Quantity. | Value | Quantity | Yes | No |

---

## GetExtDataFirstContriDate

Returns the first contri date of the batch. If the tax unit is given returns for the specific tax unit. If not given it returns the first contri date among all tax units present.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter specifies the tax unit. | Value | String | No | No |

---

## GetExtDataLastContriDate

Returns the last contri date of the batch. If the tax unit is given returns for the specific tax unit. If not given it returns the last contri date among all tax units present.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter specifies the tax unit. | Value | String | No | No |

---

## GetForexAmount

Returns the amount with forex content.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This has to be a method name which is of type amount. | Value | Yes | No |

---

## GetItemQuantity

This function returns the quantity as per specified UOM and for the specified item with number of decimals specified.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | specify the stock Item Name. | Value | String | Yes | No |
| 2 | specify the stock Item Name. | Value | Quantity | Yes | No |
| 3 | Specify the unit. | Value | String | Yes | No |
| 4 | Specify the unit. | Value | Number | No | No |

---

## GetLastExchangeOnlineTime

This function returns last exchanged date and time for given parameter(s). Purpose is mandatory and rest of the parameters are optional

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: DateTime

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Purpose Type | Value | String | Yes | No |
| 2 | To specify the Purpose Type | Value | String | No | No |
| 3 | To specify name of Return. Provide syaname | Value | String | No | No |
| 4 | To specify name of Return. Provide syaname | Value | String | No | No |

---

## GetLastPinDistance

The function is used to retrieve the last saved distance for the pincode combination specified in the eway bill for a specific party ledger.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Party ledger name. | Value | String | Yes | No |
| 2 | To specify the Party ledger name. | Value | Number | Yes | No |
| 3 | To specify the expression for pincode 2 | Value | Number | Yes | No |

---

## GetLatestExtDataInfoID

Returns the last batch ID from the IMS download. If Tax Unit is provided, give LatestExternal data info id(batch id) for that tax unit, otherwise give the latest from all the tax units

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter specifies the tax unit. | Value | String | No | No |

---

## GetLocForPin

The function is used to retrieve the last saved Location for specific PIN for a given Master Type and Name. Currently the data is persisted only for Ledger and Default Tax Unit

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the object type name. | Value | String | Yes | No |
| 2 | To specify the object type name. | Value | String | Yes | No |
| 3 | To specify the expression which provides pincode | Value | Number | Yes | No |

---

## GetLogicalExprValueFromPrevSignedReturn

This function searches for signed returnwise details with given return, section and period less than the given, parses the given expression in that object context and returns the logical value.In case of any failure/signed version not found then Empty value is returned

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the expression to parse | Identifier |  | Yes | No |
| 2 | Specify the Return Period. | Value | Date | Yes | No |
| 3 | Specify the Return Period. | Value | String | Yes | No |
| 4 | Specify the Section Name | Value | String | No | No |

---

## GetMappedMaster

This function returns the Mapped Master based on the key identifier of the particular purpose, name and category of Master Map object and further mapping it with compare string and applicable voucher type passed.

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is used to specify the key identifier having purpose, name and category to be accessed for. | Identifier |  | Yes | No |
| 2 | To specify the Compare String. | Value | String | Yes | No |
| 3 | To specify the Compare String. | Value | String | No | No |
| 4 | To specify Applicable Master for Stock Item Category specify Applicable Ledger else default is Any Party or for Unit category specify Applicable StockItem. For other categories it is set as empty. | Value | String | No | No |
| 5 | To specify Applicable Master for Stock Item Category specify Applicable Ledger else default is Any Party or for Unit category specify Applicable StockItem. For other categories it is set as empty. | Value | Logical | No | No |

---

## GetPartyGSTINs

This function returns comma (or any other character specified in optional parameter) separated list of GSTINs configured in the Given Ledger Master. If the Ledger specifies is not found, then return Empty String

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Ledger name. | Value | String | Yes | No |
| 2 | To specify the Ledger name. | Value | String | No | No |

---

## GetPriceFromLevel

To get a price for a specified Price Level, Date & Quantity.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Name of Stock Item. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Name of Stock Item. | Value | String | Yes | No |
| 3 | This is an expression which evaluates to Date. | Value | Date | Yes | No |
| 4 | This is an expression which evaluates to Date. | Value | Quantity | Yes | No |

---

## GetPricePrevDate

To get the selling price date for the last sale made using the current price level for a given product.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Name of Stock Item. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Name of Stock Item. | Value | String | Yes | No |
| 3 | This is an expression which evaluates to Date. | Value | Date | Yes | No |

---

## GetSysIdExprValueFromPrevSignedReturn

This function searches for signed returnwise details with given return, section and period less than the given, parses the given expression in that object context and returns the sysid. In case of any failure/signed version not found then Empty value is returned

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the expression to parse | Identifier |  | Yes | No |
| 2 | Specify the Return Period. | Value | Date | Yes | No |
| 3 | Specify the Return Period. | Value | String | Yes | No |
| 4 | Specify the Section Name | Value | String | No | No |

---

## GetTaxObjPartyValue

This function gives the tax object party value.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Sysname of Category. | Value | Sys Id | Yes | No |
| 2 | To specify Name Of PartyLedgerName. | Value | String | Yes | No |
| 3 | To specify Name Of PartyLedgerName. | Value | String | No | No |

---

## GetTSServerName

This function return the server name for a given end point.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts an expression, which evaluates to an end point string. | Value | String | Yes | No |

---

## GetVchCount

This function provides the total number of  voucher counts between specified 'from date' and 'to date'. It includes 'regular', 'optional' and 'cancelled' vouchers. 'From Date' & 'To Date' parameters needs to be specified for this calculation .

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Parameter takes Date expression as input.To specify starting Date of counting vouchers. | Value | Date | Yes | No |
| 2 | Parameter takes Date expression as input.To specify ending date of counting vouchers. | Value | Date | Yes | No |

---

## GlobalAllow

This function checks whether the current user has the right to an operation of the family across all the loaded companies or not. It will return 'Yes' if the operation is allowed in at least one company.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the type of permission. | Value | Yes | No |
| 2 | The family on which the permission needs to be checked. | Value | Yes | No |
| 3 | The family on which the permission needs to be checked. | Value | No | No |

---

## GlobalExplicitAllow

This function checks whether the permission is allowed explicitly for a user or not. By default, this user will not have access to all the loaded companies.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This takes mode name 'Display'. | Value |  | Yes | No |
| 2 | This takes mode name 'Display'. | Value |  | Yes | No |
| 3 | The Company name. | Value | String | No | No |

---

## GodownGroupValue

Returns the value for the method in a godown for a stock group.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Server

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Godown Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Stock Group Name. | Value | String | Yes | No |
| 3 | This is an expression which evaluates to Stock Group Name. | Value |  | Yes | No |

---

## GodownItemValue

This function is used to retrieve the value of a method, by passing the Godown Name and StockItem. The Value or Quantity of the given StockItem, in the given Godown is retrieved by this method.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Server

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Godown Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Stock Item Name. | Value | String | Yes | No |
| 3 | This is an expression which evaluates to Stock Item Name. | Value |  | Yes | No |

---

## GrossPayFor

This Function is used to find the total Amount paid to an Employee for a particular ledger for a specified period without considering Attendance.

### Meta

- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Cost centre name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Cost centre name. | Value | String | Yes | No |
| 3 | This is an expression which evaluates to From date. | Value | Date | Yes | No |
| 4 | This is an expression which evaluates to From date. | Value | Date | Yes | No |
| 5 | A logical formula evaluating to whether Attendance requires to be ignored. This is an optional parameter. By Default it is No. | Value | Logical | No | No |
| 6 | A logical formula evaluating to whether Attendance requires to be ignored. This is an optional parameter. By Default it is No. | Value | Logical | No | No |

---

## GrossVchPayFor

This function calculates the pay value for the corresponding payhead.

### Meta

- **Total Parameters**: 8
- **Total Mandatory Parameters**: 5
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Ledger name | Value | String | Yes | No |
| 3 | CostCentre Name | Value | String | Yes | No |
| 4 | CostCentre Name | Value | Date | Yes | No |
| 5 | SVTodate | Value | Date | Yes | No |
| 6 | SVTodate | Value | Logical | No | No |
| 7 | If yes then ignore date otherwise not | Value | Logical | No | No |
| 8 | If yes then ignore date otherwise not | Value | Logical | No | No |

---

## GrpInQty

This function provides the total quantity inward in Material Transfer In or Out of a specified stock item for a specified accounting Group Name.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## GrpInValue

This function provides the total inward value in Material Transfer In or Out of a specified stock item for a specified accounting Group Name.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## GrpOutQty

This function provides the total quantity outward in Material Transfer In or Out of the specified stock item for the specified accounting Group Name.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## GrpOutValue

This function provides the total outward value in Material Transfer In or Out of a specific stock item for the specified accounting Group Name.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## GrpPurcBaseValue

This function provides the total purchase value of a specified stock item for a specified accounting Group Name excluding addl cost.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## GrpPurcQty

This function provides the total quantity purchased of a specified stock item for a specified accounting Group Name.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## GrpPurcValue

This function provides the total purchase value of a specified stock item for a specified accounting Group Name.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## GrpSaleQty

This function provides the total quantity sold of the specified stock item for the specified accounting Group Name.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## GrpSaleValue

This function provides the total sales value of a specific stock item for the specified accounting Group Name.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Group Name. | Value | String | Yes | No |

---

## HasCommonUnit

This function checks whether the unit entered and the unit available at the master is same.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to the unit entered. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to the unit entered. | Value | String | Yes | No |

---

## HeadUnits

This function returns simple head unit used/referenced in a given UoM. If given UoM is simple then it returns the same. If UoM is empty then it return empty. If UoM given is not available then it results in error

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the name of UoM for which simple UoM needs to be retrieved | Value | String | Yes | No |

---

## HiLoClDate

This function provides the higher or lower value of a date based on the logical parameter specified for a closing balance of an object. If the parameter is Yes then it will return lower date.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a Logical formula based on which it displays highest or lowest date. | Value | Logical | Yes | No |

---

## HiLoClQty

This function provides the higher or lower quanity of a collection given. If the parameter is Yes then it will return higher quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  Logical expression based on which it displays highest or lowest quantity. | Value | Logical | Yes | No |

---

## HiLoClVal

This function provides the higher or lower amount of a collection given. If the parameter is Yes then it will return higher amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a  Logical expression based on which it displays highest or lowest value. | Value | Logical | Yes | No |

---

## HiLoCrDate

This function provides the higher or lower  outward movement date of a collection given. If the parameter is Yes then it will return latest date.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a Logical formula based on which it displays highest or lowest outward movement date. | Value | Logical | Yes | No |

---

## HiLoCrQty

This function provides the higher or lower outward movement quantity of a collection given. If the parameter is Yes then it will return lowest outward quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a  Logical formula based on which it displays highest or lowest outward movement quantity. | Value | Logical | Yes | No |

---

## HiLoCrVal

This function provides the highest or lowest credit amount of a collection given. If the parameter is Yes then it will return higher amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Logical expression based on which it displays highest or lowest credit amount. | Value | Logical | Yes | No |

---

## HiLoDrDate

This function provides the higher or lower  inward movement date of a collection given. If the parameter is Yes then it will return latest date.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a  Logical formula based on which it displays highest or lowest inward movement date. | Value | Logical | Yes | No |

---

## HiLoDrQty

This function provides the higher or lower inward movement quantity of a collection given. If the parameter is Yes then it will return lowest outward quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a Logical formula based on which it displays highest or lowest inward movement quantity. | Value | Logical | Yes | No |

---

## HiLoDrVal

This function provides the highest or lowest debit amount of a collection given. If the parameter is Yes then it will return higher amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  Logical expression based on which it displays highest or lowest debit amount. | Value | Logical | Yes | No |

---

## HiLoNettCrVal

This function provides the highest or lowest credit nett amount of a collection given. If the parameter is Yes then it will return higher amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Logical expression based on which it displays highest or lowest credit amount. | Value | Logical | Yes | No |

---

## IsAccountingVch

This function is used to check if the specified voucher type is Accounting Voucher or not. It returns logical value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the name of the voucher type. | Value | String | Yes | No |

---

## IsAdjustmentClassification

To check the if the Current object is of type 'IsAdjustmentClassification'. The function $$IsAdjustmentClassification is used to check whether the Current object is of type 'IsAdjustmentClassification'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'IsAdjustmentClassification' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAnyFetchedDataReset

This function checks to see if any Fetched Data is reset for given Purpose, Tax Unit, Return and Date Range. Even if any data was reset for sub-set of given period then Returns as Yes

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 5
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Purpose Type | Value | String | Yes | No |
| 2 | To specify the Purpose Type | Value | String | Yes | No |
| 3 | To specify Return Name | Value | String | Yes | No |
| 4 | To specify Return Name | Value | Date | Yes | No |
| 5 | To Date of the period specified | Value | Date | Yes | No |

---

## IsAttdTypeValid

To filter Valid Attendance Type for an Employee in the Attendance Voucher.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Attendance Type Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Cost Centre name. | Value | String | Yes | No |

---

## IsAttendance

This function checks whether the voucher is of type Attendance or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsAttendanceType

The function returns 'Yes' if the current object is 'Attendance' otherwise it returns a 'No'. This function is used to identify the 'Voucher Type' master.Returns a logical value

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAudited

This function checks whether current object is audited or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAuditModified

This function checks whether the current object audited is modified or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAuthAsAuditor

This function is used to check if the user level has access to Auditing or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsBatch

This function will check whether the current object  is of the type Batch or Batches.  If it is Batch or Batches it will return 'Yes' otherwise 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsBill

To check whether the current object is of the type Bill or not. $$IsBill will check whether the currently active object is Bill or not.  If it is Bill it will return True otherwise return false.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsBudget

To check if the current object is of type 'Budget'.It return logical 'Yes' if current object is of type budget else it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsBudgetReport

This function checks if the current report is a Budget Report or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsCompany

To check if the current object is of type company or not.It returns a Logical value 'Yes' if current object is of type company, else it returns a 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsContra

This function is used to check if the Voucher Type is Contra or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsContriPresentInLatestIMSExtData

Returns if there are contributors present in the latest external data info id for the given Tax Unit.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter specifies the tax unit. | Value | String | Yes | No |

---

## IsCostCategory

To check if the current object is a cost category or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsCostCentre

This function checks if the current object is a Cost Centre or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsCreditNote

This function is used to check if the Voucher Type is Credit Note or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsCurrency

Used to check if the current object is Currency

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsDebitNote

This function is used to check if the Voucher Type is DebitNote or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## IsDeducteeType

The Function  checks whether the dedcutee type is enabled or not. The Function $$IsDedcuteeType is used to check whether the object seleted is of type Deductee type is or not. This is used in TDS module. This function does not accept any parameter and returns a logical value 'Yes' if the object is of type  Deductee type  otherwise it returns 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsDelNote

This function is used to check if the Voucher Type is Delivery Note or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsDisplayReportModified

This function is used to track variable modifications in non-edit reports. When it returns TRUE, it indicates that at least one variable has been modified. Saving a view will reset this value to FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsDuplicateARESerialNumber

This function checks for same serial number for a particular Serial Number Master.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Serial Number Master Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Serial Number. | Value | String | Yes | No |

---

## IsDuplicateNumber

This functions checks for same voucher number for same voucher type.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value |  | Yes | No |
| 2 | This is an expression which evaluates to Voucher date. | Value | Date | No | No |

---

## IsDuplicateSerialNumber

This function checks for same serial number for a particular Serial Number Master.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Serial Number Master Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Serial Number. | Value | String | Yes | No |

---

## IsDuplicateTaxRegistration

This function returns TRUE if given registration number for a TaxUnit is duplicate, i.e. a TaxUnit of same tax type with same registration number already exists.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | The registration number to be checked for duplicate. | Value | Yes | No |

---

## IsEmptyObject

This functions checks whether current object is empty or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsExcise

This function is used to check if the current object is Excise or Not. If the object is excise, this function returns the value 'Yes', Else it returns the value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsExciseDutyClassification

To check the if the Current object is of type 'ExciseDutyClassification'. The function $$IsExciseDutyClassification is used to check whether the Current object is of type 'ExciseDutyClassification'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'ExciseDutyClassification' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsFBTAType

This function is used to check if the current object is FBT Accesse type

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsFBTCategory

This function is used to check if the current object belongs to FBT category

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGodown

To check if the active object is of type 'Godown'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGroup

This function checks whether the object belongs to a group or not

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsGSTClassification

To check the if the Current object is of type 'GSTClassification'. The function $$IsGSTClassification is used to check whether the Current object is of type 'GSTClassification'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'GSTClassification' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsIncomeTaxClassification

To check the if the Current object is of type 'IsITClassification'. The function $$IsITClassification is used to check whether the Current object is of type 'IsITClassification'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'IsITClassification' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsIncomeTaxSlab

To check the if the Current object is of type 'IsITSlab'. The function $$IsITSlab is used to check whether the Current object is of type 'IsITSlab'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'IsITSlab' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsIndent

To check if the active object is indented or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsIndentVoucher

This function is used to check if the Voucher Type is Indent  or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsInventoryVch

This function checks whether the currently selected voucher is Inventory voucher or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsInvVch

This function is used to check if the specified voucher type is Inventory voucher or not (excluding order vouchers). It returns logical value

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the name of the voucher type. | Value | String | Yes | No |

---

## IsJobMaterialIssue

This function is used to check if the Voucher Type is Material Issue or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsJobMaterialReceive

This function is used to check if the Voucher Type is Material Receive or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsJobOrderIn

This function is used to check if the Voucher Type is Job Order In or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsJobOrderOut

This function is used to check if the Voucher Type is Job Order Out or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsJournal

This function is used to check if the Voucher Type is Journal or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsLBTClassification

To check the if the Current object is of type 'IsLBTClassification'. The function $$IsLBTClassification is used to check whether the Current object is of type 'IsLBTClassification'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'IsLBTClassification' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsLedger

To check if the current object is of type 'Ledger'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsMemo

This function is used to check if the Voucher Type is Memorandum or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsMerchantProfile

The function $$IsMerchantProfile is used to check whether the current object is of type 'Merchant Profile'. This function does not accept any parameters. It returns a logical value of 'Yes' if the current object is of type 'Merchant Profile', otherwise it returns a logical value of 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsMethodChangedDuringImport

This function returns if the given method is updated during Import or not. The meaning of update is is defined bsaed on if the there was any TAG present in source XML Data

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify name of method | Value | String | No | No |

---

## IsObjectInImportMode

This function returns if Object is being imported. To deliverthis system checks the status of Primary Object in the curent hierarchy

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsObjectInMigReaccept

This function returns if Object in the context is in Migration ReAccept or Not

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsObjectInReaccept

This function returns if Object in the context is in ReAccept or Not

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsOrder

To check if the current reference/object is of type Order.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsOrderVch

This function is used to check if the specified voucher type is Order Voucher or not. It returns logical value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the name of the voucher type. | Value | String | Yes | No |

---

## IsOverRun

This function checks whether the values have preceeded the actual values of the current object or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount. | Value | Yes | No |

---

## IsOwner

This function checks the owner of the current object.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsPayment

This function is used to check if the Voucher Type is Payment or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsPayroll

This function is used to check if the Voucher Type is Payroll or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsPayrollVch

This function is used to check if the specified voucher type is Payroll Voucher or not. It returns logical value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the name of the voucher type. | Value | String | Yes | No |

---

## IsPeriod

To check if the current object is of type Period and returns a logical value.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsPhysStock

This function is used to check if the Voucher Type is Physical Stock or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsPrimaryCompany

This function is used to differentiate b/w a Simple Company and a Group Company.This function returns 'Yes' for the Group Company and 'No' for the Simple Company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsPurchase

This function is used to check if the Voucher Type is Purchase or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsPurcOrder

This function is used to check if the Voucher Type is Purchase Order or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsRcptNote

This function is used to check if the Voucher Type is Receipt Note or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsReceipt

This function is used to check if the Voucher Type is Receipt or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsRejIn

This function is used to check if the Voucher Type is Rejection In or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsRejOut

This function is used to check if the Voucher Type is Rejection Out or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsRevJrnl

This function is used to check if the Voucher Type is Reversing Journal or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsSales

This function is used to check if the Voucher Type is Sales or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsSalesOrder

This function is used to check if the Voucher Type is Sales Order or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsSerialNumber

To check the if the Current object is of type 'SerialNumber'. The function $$IsSerialNumber is used to check whether the Current object is of type 'SerialNumber'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'SerialNumber' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsState

This function is used to check whether the current object is of type State. It returns 'Yes' if the current object is of type State, or else it returns 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsStCategory

This function is used to check whether the current object is of type Service Tax. It returns 'Yes' when the current object is of type of Service Tax, or else it returns 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsStockCategory

This function is used to check whether the current object is of type Stock Category. It returns 'Yes' when the current object is of type of Stock Category, or else it returns 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsStockGroup

To check if currently activated object is a stock group or not.  If it is stock group, the function returns a Logical value 'Yes' , else it returns a logical value 'No'. This function accepts no parameter and returns a logical value.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsStockItem

This function is used to check whether the current object is of type Stock Item. It returns 'Yes' when the current object is of type of Stock Item, or else it returns 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsStockJrnl

This function is used to check if the Voucher Type is Stock Journal or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher type name. | Value | String | No | No |

---

## IsTariffClassification

To check the if the Current object is of type 'TariffClassification'. The function $$IsTariffClassification is used to check whether the Current object is of type 'TariffClassification'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'TariffClassification' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsTaxUnit

To check the if the Current object is of type 'TaxUnit'. The function $$IsTaxunit is used to check whether the Current object is of type 'Taxunit'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'TaxUnit' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsTDLObject

This function checks whether the currently active object is internal storable object or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsTDSRate

This function is used to check whether the object is of type TDS Nature of Payment. It returns 'Yes' if the object is of that type, or else it returns 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsTrack

To check whether the current object is of the type Track.If it is valid then it returns logical value 'yes' otherwise it returns logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsTrueInAnyCmp

This function checks the given expression across all the loaded companies.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Expression to be checked across all the loaded companies. | Value | Yes | No |

---

## IsTSAuthorised

This function returns TRUE if security is enabled on the specified TallyPrime Server else it returns false.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the name of the Tally Server. | Value | String | Yes | No |

---

## IsTSCompany

This function checks whether the current company is opened through TallyPrime Server or not. It returns a logical value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the name of the company. | Value | String | No | No |

---

## IsTSPath

This function checks whether the given path is TallyPrime Server path or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts an expression, which evaluates to a directory path. | Value | String | Yes | No |

---

## IsUnderRun

This function checks whether the values have exceeded the actual values of the current object or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount. | Value | Yes | No |

---

## IsUnit

To check if the current object is of type 'Unit of Measure'. The function $$IsUnit is used for checking the type of the current Object.  This function returns a logical value.  This function checks whether the currently activating object is of type is Unit of measure  or not. If it is unit of measure then it returns a 'Yes' value otherwise it is 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsUserAllowed

This function verifies and returns true if user is allowed to perform operations on current Tally Server.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the name of the user. | Value | String | Yes | No |
| 2 | It accepts the name of the user. | Value | String | Yes | No |
| 3 | It accepts the name of the Tally Server. | Value | String | Yes | No |

---

## IsValidCompanyDir

This function checks whether specified path is valid company directory path or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to company directory path. | Value | String | Yes | No |

---

## IsValidTSEndPointPath

This function checks whether the given string is a valid TallyPrime Server end point or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts an expression, which evaluates to an end point string. | Value | String | Yes | No |

---

## IsVatClassification

To check if the current object is of type VAT /Tax Class. The function $$IsVatClassification is used to check whether the current object is of type VAT/Tax class. It accepts no parameter and returns a logical value 'yes' if the current object is type VAT /Tax class otherwise returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsVoucher

To check whether the current object is of the type-voucher. The function $$IsVoucher is used for checking the type of the current Object.If the Current object is of type 'Voucher' then it returns a logical value 'Yes' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsVoucherType

To check the if the Current object is of type 'Voucher Type'. The function $$IsVoucherType is used to check whether the Current object is of type 'Voucher Type'.This function does not accept any parameter and returns a logical value of ?Yes? if Current object is of type 'Voucher Type' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## LanguageName

This function finds the default language name corresponding to a language ID and index.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Language ID for which name needs to be searched. | Value | Number | No | No |
| 2 | This is an expression which evaluates to index of the Language ID of the name that needs to be returned. | Value | Number | No | No |
| 3 | This is an expression which evaluates to index of the Language ID of the name that needs to be returned. | Value | Logical | No | No |

---

## LastCreatedVchAltId

This function returns last created voucher's alter id. The value is returned for the Voucher created manually in the same instance - where this TDL Function is executed.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## LastCreatedVchId

This function returns last created voucher id

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## LedgerGodownMatTransInQty

This function provides the inward quantity for the stock item for the party and for the godown.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Stock Item Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Stock Item Name. | Value | Logical | Yes | No |
| 3 | This is an expression which evaluates to Party Name. | Value | String | No | No |
| 4 | This is an expression which evaluates to Party Name. | Value | String | No | No |

---

## LedgerGodownMatTransInValue

This function provides the inward Value for the stock item for the party and for the godown.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Stock Item Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Stock Item Name. | Value | Logical | Yes | No |
| 3 | This is an expression which evaluates to Party Name. | Value | String | No | No |
| 4 | This is an expression which evaluates to Party Name. | Value | String | No | No |

---

## LedgerGodownMatTransOutQty

This function provides the Outward quantity for the stock item for the party and for the godown.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Stock Item Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Stock Item Name. | Value | Logical | Yes | No |
| 3 | This is an expression which evaluates to Party Name. | Value | String | No | No |
| 4 | This is an expression which evaluates to Party Name. | Value | String | No | No |

---

## LedgerGodownMatTransOutValue

This function provides the Outward value for the stock item for the party and for the godown.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Stock Item Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Stock Item Name. | Value | Logical | Yes | No |
| 3 | This is an expression which evaluates to Party Name. | Value | String | No | No |
| 4 | This is an expression which evaluates to Party Name. | Value | String | No | No |

---

## LedgerGodownMatTransQty

This function provides the total quantity for the stock item for the party and for the godown.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Stock Item Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Stock Item Name. | Value | Logical | Yes | No |
| 3 | This is an expression which evaluates to Party Name. | Value | String | No | No |
| 4 | This is an expression which evaluates to Party Name. | Value | String | No | No |

---

## LedgerGodownMatTransValue

This function provides the total value for the stock item for the party and for the godown.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Stock Item Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Stock Item Name. | Value | Logical | Yes | No |
| 3 | This is an expression which evaluates to Party Name. | Value | String | No | No |
| 4 | This is an expression which evaluates to Party Name. | Value | String | No | No |

---

## LedInCost

This function returns the inward cost of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedInPrice

This function returns the inward price of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedInQty

This function returns the inward quantity of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedInValue

This function returns the inward value of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedOutPrice

This function returns the outward price of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedOutQty

This function returns the outward quantity of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedOutValue

This function returns the outward value of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedPurcBaseValue

This function returns the purchase value of a stock item for the specified ledger excluding addl cost.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedPurcCost

This function returns the purchase cost of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedPurcPrice

This function returns the purchase price of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedPurcQty

This function returns the purchase quantity of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedPurcValue

This function returns the purchase value of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedSalePrice

This function returns the sale price of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedSaleQty

This function returns the sale quantity of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## LedSaleValue

This function returns the sale value of a stock item for the specified ledger.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## MakeConfigDataKey

This function creates the config data key from the given key parameters by combining them using a separator.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Specifies the configuration type, which serves as the corresponding System ID (Sys ID) string for either Report view or ExcelTallyMap. | Value | Yes | No |
| 2 | Specifies the configuration type, which serves as the corresponding System ID (Sys ID) string for either Report view or ExcelTallyMap. | Value | Yes | No |
| 3 | Specifies the configuration type name. | Value | No | No |

---

## MasterSerialNumber

This will return the new serial number for a serialmaster and for da date

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | SerialNumber Master Name | Value | String | Yes | No |
| 2 | Date for which the serial number is required | Value | Number | Yes | No |
| 3 | Date for which the serial number is required | Value | String | No | No |

---

## MasterSerialNumberType

This function checks for serial number method type for specified Serial Number Master.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Serial Number Master Name. | Value | String | Yes | No |

---

## NextChequeNumber

It gives the last available cheque no.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Name of the Ledger | Value | String | Yes | No |
| 2 | from cheque no. for range | Value | Number | No | No |
| 3 | from cheque no. for range | Value | Number | No | No |

---

## NumActiveVchType

This function gets the number of active voucher types based on the parameters passed

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Voucher type name. If this argument is empty, all the voucher types will be considered. | Value | String | No | No |
| 2 | Voucher type name. If this argument is empty, all the voucher types will be considered. | Value | Logical | No | No |
| 3 | Consider security access or not. If this argument is empty, No will be considered. | Value | Logical | No | No |
| 4 | Consider security access or not. If this argument is empty, No will be considered. | Value | String | No | No |

---

## NumAttendance

This function returns the total number of Attendance Types in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumConnectableCmps

This function returns the number of Connectable companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## NumConnectedCmps

This function returns the number of Connected companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## NumContra

This function returns total number of Contra Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumCreditNote

This function returns total number of Credit Note Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumDebitNote

This function returns total number of Debit Note Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumDelNote

This function returns total number of Delivery Note Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumIndent

This function returns total number of Indent Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumJobMaterialIssue

This function returns total number of Indent Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumJobMaterialReceive

This function returns total number of Indent Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumJobOrderIn

This function returns total number of Indent Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumJobOrderOut

This function returns total number of Indent Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumJournal

This function returns total number of Journal Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumMemo

This function returns total number of Memorandum Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumOfVchType

This returns the total number of voucher types present under a given Voucher Type.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Voucher Type Name. | Value | String | Yes | No |

---

## NumPayment

This function returns total number of Payment Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumPayroll

This function returns total number of Payroll Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumPhysStock

This function returns total number of Physical Stock Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumPurchase

This function is used to count the number of purchase vouchers in Tally. This function does not accept any parameter and returns a numeric value.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumPurcOrder

This function returns total number of Purchase Order Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumPurcQuot

This function returns total number of Purchase Quotation Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumRcptNote

This function returns total number of Receipt Note Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumReceipt

This function returns total number of Receipt Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumRejIn

This function returns total number of Rejection In Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumRejOut

This function returns total number of Rejection Out Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumRevJrnl

This function returns total number of Reversing Journal Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumSales

This function is used to count the number of sales vouchers in Tally. This function does not accept any parameter and returns a numeric value.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumSalesOrder

This function returns total number of Sales Order Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumSalesQuot

This function returns total number of Sales Quotation Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## NumStockJrnl

This function returns total number of Stock Journal Vouchers entered in the current company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## OnAccountTotal

This function returns the total amount entered with the reference 'On Account' for a specified ledger.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | Yes | No |

---

## OrigVchGrpCrTotal

$$OrgVchGrpCrTotal will give the credit total amount for the specified group, which is supplied as a Parameter and returns a value of type Amount.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Group name | Value | String | Yes | No |
| 2 | Voucher View Name | Value | String | No | No |

---

## OrigVchGrpDrTotal

$$OrgVchGrpCrTotal will give the debit total amount for the specified group, which is supplied as a Parameter and returns a value of type Amount.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Group name | Value | String | Yes | No |
| 2 | Voucher View Name | Value | String | No | No |

---

## OrigVchGrpTotal

To refer to the Group Net total which is displayed in the Group Summary. The function $$OrgVchGrpDrTotal will give the debit total amount for the specified group which is supplied as a Parameter and returns a value of type Amount.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Group name | Value | String | Yes | No |
| 2 | Voucher View Name | Value | String | No | No |

---

## OrigVchLedCrTotal

The function $$OrigVchLedCrTotal is used to give Ledger Credit total when a user select the Button Ledger Wise in Group summary. The Ledger Name is passed as an argument to this function and it will return a value of type Amount.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Voucher View Name | Value | String | No | No |

---

## OrigVchLedCstCrTotal

The function is used to find the ledgerwise cost center credit value for the current voucher. It accepts two parameters first one representing the Ledger Name and second representing the Cost center name and returns value of type Amount.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Cost center name | Value | String | Yes | No |
| 3 | Cost center name | Value | String | No | No |

---

## OrigVchLedCstDrTotal

The function is used to find the ledgerwise cost center debit value for the current voucher. It accepts two parameters first one representing the Ledger Name and second representing the Cost center name and returns value of type Amount.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Ledger name | Value | String | Yes | No |
| 3 | Voucher View Name | Value | String | No | No |

---

## OrigVchLedCstTotal

The function is used to find the ledgerwise cost center value for the current voucher. It accepts two parameters first one representing the Ledger Name and second representing the Cost center name and returns value of type Amount.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Cost center name | Value | String | Yes | No |
| 3 | Cost center name | Value | String | No | No |

---

## OrigVchLedDrTotal

The function $$OrigVchLedDrTotal is used to give Ledger Debit total when a user select the Button Ledger Wise in Group summary. The Ledger Name is passed as an argument to this function and it will return a value of type Amount.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Ledger name | Value | String | No | No |

---

## OrigVchLedTotal

The function $$OrigVchLedTotal is used to give Ledger Net total when a user select the Button Ledger Wise in Group summary. The Ledger Name is passed as an argument to this function and it will return a value of type Amount.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | Yes | No |
| 2 | Ledger name | Value | String | No | No |

---

## PaidFor

This function is used to find the Amount paid for a Cost centre, for a particular ledger, and for a specified period

### Meta

- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It should be a Cost Centre Name | Value | String | Yes | No |
| 2 | It should be a Cost Centre Name | Value | String | Yes | No |
| 3 | From Date of the period specified | Value | Date | Yes | No |
| 4 | From Date of the period specified | Value | Date | Yes | No |
| 5 | Ignore attendance | Value | Logical | No | No |
| 6 | Ignore attendance | Value | Logical | No | No |

---

## PaidForCr

This function is used to find the Credit amount total for an Employee for a particular ledger and for specified period.

### Meta

- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It should be a Cost Centre Name | Value | String | Yes | No |
| 2 | It should be a Cost Centre Name | Value | String | Yes | No |
| 3 | From Date of the period specified | Value | Date | Yes | No |
| 4 | From Date of the period specified | Value | Date | Yes | No |
| 5 | Ignore attendance | Value | Logical | No | No |
| 6 | Ignore attendance | Value | Logical | No | No |

---

## PaidForDr

This function is used to find the Debit amount total for an Employee for a particular ledger and for specified period.

### Meta

- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It should be a Cost Centre Name | Value | String | Yes | No |
| 2 | It should be a Cost Centre Name | Value | String | Yes | No |
| 3 | From Date of the period specified | Value | Date | Yes | No |
| 4 | From Date of the period specified | Value | Date | Yes | No |
| 5 | Ignore attendance | Value | Logical | No | No |
| 6 | Ignore attendance | Value | Logical | No | No |

---

## PayFor

This function gives the amount for a particular payhead of a particular Employee based upon the from date, to date , considering(Y/N) attendance and considering(Y/N) the joining date of the cost centre.

### Meta

- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Cost Centre Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Cost Centre Name. | Value | String | Yes | No |
| 3 | This is an expression which evaluates to From Date. | Value | Date | Yes | No |
| 4 | This is an expression which evaluates to From Date. | Value | Date | Yes | No |
| 5 | A logical formula evaluating to whether Attendance requires to be ignored. This is an optional parameter. By Default it is No. | Value | Logical | No | No |
| 6 | A logical formula evaluating to whether Attendance requires to be ignored. This is an optional parameter. By Default it is No. | Value | Logical | No | No |

---

## PayheadComputeAsString

This function returns the concatenated string. This function takes all the payhead values mentioned in the payhead computation subform and returns a formula.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Hybrid
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Ledger name. | Value | String | No | No |

---

## PayType

To fetch the calculation type for a Particular payhead.

### Meta

- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Cost Centre Name. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to Ledger Name. | Value | String | Yes | No |
| 3 | This is an expression which evaluates to Ledger Name. | Value | Date | Yes | No |
| 4 | This is an expression which evaluates to To Date | Value | Date | Yes | No |
| 5 | This is an expression which evaluates to To Date | Value | Logical | No | No |
| 6 | 'Ignore date' Which date. | Value | Logical | No | No |

---

## PNAlias

This function returns Part Number's Alias name of stock item.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the alias Numbers, default as 1 for the first alias and 2 for second alias. | Value | Long | No | No |

---

## ResidualRate

The function  is used to extract the Rate of a stock item.This function returns value of type Rate. This is extensively used in Stock Journal.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Stock item name. | Value | String | Yes | No |
| 2 | To specify Stock item name. | Value | String | Yes | No |
| 3 | To specify the Godown name. | Value | String | Yes | No |
| 4 | To specify the Godown name. | Value | Quantity | Yes | No |

---

## ResidualValue

The function is used to extract the total amount of a stock item.This function returns value of type Amount. This is used extensively in Stock Journal.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Stock item name. | Value | String | Yes | No |
| 2 | To specify Stock item name. | Value | String | Yes | No |
| 3 | To specify the Godown name. | Value | String | Yes | No |
| 4 | To specify the Godown name. | Value | Quantity | Yes | No |

---

## RestoreListExists

This function is used to check the existence of backup companies in the given path.If they exists the function returns a logical value 'Yes' else it returns a 'No'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Path of backup file. | Value | String | Yes | No |

---

## SelectedCmps

This function does not accept any parameter. It returns the number of Selected companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## SelectedNonTSCmps

This function returns the total number of companies which are not loaded via Tally server. i.e. companies from local or shared data folders.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## StockAge

This Function is used for retrieving the quantity of the expired stock based on the sorting and the ageing style.  It will return the total quantity of the expired stock items.

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Logical value. | Value | Logical | Yes | No |
| 2 | The starting age from which items are shown. | Value | Long | Yes | No |
| 3 | The starting age from which items are shown. | Value | Long | Yes | No |
| 4 | To specify the Ageing style.There are 4 types of ageing styles. | Value | String | No | No |
| 5 | To specify the Ageing style.There are 4 types of ageing styles. | Value | String | No | No |

---

## StockAgeValue

This Function is used for retrieving the amount of the expired stock based on the ageing style.  It will return the total amount of the expired stock items.

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Logical value. | Value | Logical | Yes | No |
| 2 | This is an expression which evaluates to Logical value. | Value | Long | Yes | No |
| 3 | The final age upto which items areto be shown. | Value | Long | Yes | No |
| 4 | The final age upto which items areto be shown. | Value | String | No | No |
| 5 | To specify the type of godowns to use. | Value | String | No | No |

---

## StockPartyAge

This Function is used for retrieving the quantity of the stock item for the required party for the given age range.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | The starting age from which items are shown. | Value | Long | Yes | No |
| 2 | The final age upto which items are to be shown. | Value | Long | Yes | No |
| 3 | The final age upto which items are to be shown. | Value | Logical | Yes | No |
| 4 | To specify the party name. | Value | String | No | No |

---

## StockPartyAgeValue

This Function is used for retrieving the value of the stock item for the required party for the given age range.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | The starting age from which items are shown. | Value | Long | Yes | No |
| 2 | The final age upto which items are to be shown. | Value | Long | Yes | No |
| 3 | The final age upto which items are to be shown. | Value | Logical | Yes | No |
| 4 | To specify the party name. | Value | String | No | No |

---

## TailUnits

This function returns simple unit used/referenced in a given UoM. If given UoM is simple then it returns the same. If UoM is empty then it return empty. If UoM given is not available then it results in error

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the name of UoM for which simple UoM needs to be retrieved | Value | String | Yes | No |

---

## TSPingInfo

This function is used to retrieve general information related to TallyPrime Server

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the name of the Tally Server. | Value | String | Yes | No |
| 2 | It accepts any one of the keywords- HASINFO, ISEDUCATIONAL, and LICENSEEXPIRYDAYSLEFT. HASINFO returns true or false if the client is able to get information for this TallyPrime Server (otherwise ISEDUCATIONAL and LICENSEEXPIRYDAYSLEFT fail in a TDL expression). ISEDUCATIONAL returns true if the TallyPrime Server is running in educational mode and LICENSEEXPIRYDAYSLEFT will return the number of subscription days remaining. | Value | String | Yes | No |

---

## ValidateTINMod97

Validates a given TIN number and returns whether it is valid or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the TIN number to be validated. | Value | String | Yes | No |

---

## VchItemTotal

Gives the total actual quantity of the current stock item for the current voucher. This Function will give the Total quantity of the current stock item for the selected voucher.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Item name | Value | String | No | No |

---

## VchLedTotal

Gives the total amount of the current ledger for the current voucher. This function will give the total amount of the current ledger of the current voucher.Here Ledger name is the parameter which is used for finding the total.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger name | Value | String | No | No |

---

## VchPayFor

The function is used to fetch the amount in the voucher for a specified payhead. The payhead is supplied through the Ledger name which is passed as a parameter. It returns a value of type amount. This is used especially in payroll module.

### Meta

- **Total Parameters**: 8
- **Total Mandatory Parameters**: 5
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Ledger name. | Value | String | Yes | No |
| 2 | To specify Ledger name. | Value | String | Yes | No |
| 3 | To specify the CostCentre Name. | Value | String | Yes | No |
| 4 | To specify the CostCentre Name. | Value | Date | Yes | No |
| 5 | If yes then ignore date otherwise not. | Value | Date | Yes | No |
| 6 | If yes then ignore date otherwise not. | Value | Logical | No | No |
| 7 | If yes then ignore date otherwise not | Value | Logical | No | No |
| 8 | If yes then ignore date otherwise not | Value | Logical | No | No |

---

## VchPurcBaseValue

This function will display the purchase value of a specified stock item for the current purchase voucher excluding addl cost.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify Voucher Type Name. | Value | String | Yes | No |

---

## VchPurcCost

Gives purchase cost of a specified stock item for the current voucher. This Function Returns the Purchase cost for the specified stock item based on the expression mentioned.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify Voucher Type Name. | Value | String | Yes | No |

---

## VchPurcPrice

This function will gives the purchase price for the specified stock item.  Any string expression is acting as the Parameter of this function.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify Voucher Type Name. | Value | String | Yes | No |

---

## VchPurcQty

This function will display the purchase quantity of a specified stocjkitem for the current purchase voucher. Here the string Expression is the parameter.  By using this expression it will be executed.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify Voucher Type Name. | Value | String | Yes | No |

---

## VchPurcValue

This function will display the purchase value of a specified stock item for the current purchase voucher.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify Voucher Type Name. | Value | String | Yes | No |

---

## VchRate

This function returns the rate of a Stock Item in a voucher. This function works under Inventory Entries Object.The rate for a particular Item can be retrieved using this function.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Rate

### Parameters

_No parameters._

---

## VchSalePrice

This function gives the sales price, ie it returns the price of the particular stockitem for the sales voucher.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Rate

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify Voucher Type Name. | Value | String | Yes | No |

---

## VchSaleQty

This function will returns the sales quantity for the specified stock item depending upon the given string expression.  Here the string expression is the parameters which is used for gathering the values which includes methods, another functions etc.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify Voucher Type Name. | Value | String | Yes | No |

---

## VchSaleValue

This function returns the sales value of the specified stock item for the current sales voucher.Here the string expression is the parameter which is used for getting the name of the particular stock item for checking the value by using this function.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify Voucher Type Name. | Value | String | Yes | No |

---

## VchTotalQty

This function returns the total number of Stock Items in a voucher. This function works under Inventory Entries Object. The total quantity for a particular Item can be retrieved using this function.Return type is Quantity.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

_No parameters._

---

## VchTypeAttendance

This function returns the name of the voucher type 'Attendance'. Return type is string.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeContra

This function returns the name of the voucher type Contra.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeCreditNote

This function returns the name of the voucher type Credit Note.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeDebitNote

This function returns the name of the voucher type Debit Note.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeDelNote

This function returns the name of the voucher type 'Delivery note'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeIndent

This function returns the name of the voucher type - Indent.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeJobMaterialIssue

This function returns the name of the voucher type - Indent.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeJobMaterialReceive

This function returns the name of the voucher type - Indent.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeJobOrderIn

This function returns the name of the voucher type 'Job Order In'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeJobOrderOut

This function returns the name of the voucher type 'Job Order Out'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeJournal

This function returns the name of the voucher type Journal.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeMemo

This function returns the name of the voucher type - Memo.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeMfgJrnl

This function returns the name of the voucher type 'Mfg.Jouranl'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## VchTypeOfFamily

This function changes the voucher type as mentioned in it's first parameter chgvchtype.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | The change voucher type. | Value | String | Yes | No |
| 2 | The change voucher type. | Value | String | No | No |

---

## VchTypePayment

This function returns the name of the voucher type Payment.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypePayroll

This function returns the name of the voucher type Payroll.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypePhysStock

This function returns the name of the voucher type 'Physical Stock Transfer'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypePurchase

This function returns the name of the voucher type - Purchase.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypePurcOrder

This function returns the name of the voucher type 'Purchase Order'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypePurcQuot

This function returns the name of the voucher type 'Purchase Quotation'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeRcptNote

This function returns the name of the voucher type 'Receipt note'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeReceipt

This function returns the name of the voucher type Receipt.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeRejIn

This function returns the name of the voucher type 'Rejection In'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeRejOut

This function returns the name of the voucher type 'Rejection Out'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeRevJrnl

This function returns the name of the voucher type 'Reversal Journal'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeSales

This function returns the name of the voucher type - Sales.Return type is string.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeSalesOrder

This function returns the name of the voucher type 'Sales order'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeSalesQuot

This function returns the name of the voucher type 'Sales Quote'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VchTypeStockJrnl

This function returns the name of the voucher type 'Stock Journal'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Business
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher type name. | Value | String | No | No |

---

## VoucherNumber

This function returns the voucher number for a new voucher or an existing voucher in case of some date change or other parameters on which it depends.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Voucher type master name | Value | String | Yes | No |
| 2 | Date for which the voucher number is required | Value | Number | Yes | No |
| 3 | Date for which the voucher number is required | Value | String | No | No |

---

## VoucherNumberBySeries

This functions return the Voucher number based on given Voucher Type, Voucher Series, Voucher Style and Key (if present).

### Meta

- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Business
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Voucher type master name | Value | String | Yes | No |
| 2 | Voucher type master name | Value | String | Yes | No |
| 3 | Numbering Style | Value | String | Yes | No |
| 4 | Numbering Style | Value | Number | Yes | No |
| 5 | Voucher key | Value | String | No | No |
| 6 | Voucher key | Value | String | No | No |

---
