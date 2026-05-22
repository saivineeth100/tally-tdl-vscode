# Generic Function

> **Version**: 7.0

Reference documentation for all entries in the **Generic** function.

> **Total Entries**: 139

## Table of Contents

- [BillExists](#billexists)
- [BillObject](#billobject)
- [BudgetValue](#budgetvalue)
- [BuyTransRate](#buytransrate)
- [CashAccountName](#cashaccountname)
- [ChequeNumExists](#chequenumexists)
- [ClientEvaluate](#clientevaluate)
- [ClientServerString](#clientserverstring)
- [CompanyRemUserName](#companyremusername)
- [CompanyValue](#companyvalue)
- [CurrentValue](#currentvalue)
- [DateFrom](#datefrom)
- [DateTo](#dateto)
- [DecodeBase64ToStr](#decodebase64tostr)
- [DecryptStr](#decryptstr)
- [EncodeFileToBase64](#encodefiletobase64)
- [EncodeStrToBase64](#encodestrtobase64)
- [EncryptStr](#encryptstr)
- [EncryptURLStr](#encrypturlstr)
- [EvalParamExp](#evalparamexp)
- [Evaluate](#evaluate)
- [ExciseExists](#exciseexists)
- [ExclEvaluate](#exclevaluate)
- [ExecNatLangQuery](#execnatlangquery)
- [FileGetActiveSheetName](#filegetactivesheetname)
- [FileGetColumnIdx](#filegetcolumnidx)
- [FileGetColumnName](#filegetcolumnname)
- [FileGetSheetCount](#filegetsheetcount)
- [FileGetSheetIdx](#filegetsheetidx)
- [FileGetSheetName](#filegetsheetname)
- [FileIsEOF](#fileiseof)
- [FileRead](#fileread)
- [FileReadCell](#filereadcell)
- [FileReadRaw](#filereadraw)
- [FileSize](#filesize)
- [FindGSTVoucher](#findgstvoucher)
- [FromValue](#fromvalue)
- [GetEnvVar](#getenvvar)
- [GetFileFullPath](#getfilefullpath)
- [GetMsWordData](#getmsworddata)
- [GetMsWordHtml](#getmswordhtml)
- [GetNoOfConfigUserTDLs](#getnoofconfigusertdls)
- [GetNoOfDisabledUserTDLs](#getnoofdisabledusertdls)
- [GetUserTallyDriveInfo](#getusertallydriveinfo)
- [GetValueFromKeyValueMap](#getvaluefromkeyvaluemap)
- [HelpModuleMapID](#helpmodulemapid)
- [HTTPInfo](#httpinfo)
- [ImportAction](#importaction)
- [ImportInfo](#importinfo)
- [ImportType](#importtype)
- [InCapsuleMode](#incapsulemode)
- [InDeveloperMode](#indevelopermode)
- [InFocusMode](#infocusmode)
- [InitValue](#initvalue)
- [InMigrationMode](#inmigrationmode)
- [InWords](#inwords)
- [IsAnyUserLoggedInForCB](#isanyuserloggedinforcb)
- [IsAutoReport](#isautoreport)
- [IsBelongsTo](#isbelongsto)
- [IsBelongsToCategory](#isbelongstocategory)
- [IsCashLedger](#iscashledger)
- [IsChequeRangeUsed](#ischequerangeused)
- [IsChildOf](#ischildof)
- [IsChildOfCategory](#ischildofcategory)
- [IsClassOf](#isclassof)
- [IsCmpBaseCurrency](#iscmpbasecurrency)
- [IsCOMInterfaceInvokable](#iscominterfaceinvokable)
- [IsCompanyConnectable](#iscompanyconnectable)
- [IsCompanyConnected](#iscompanyconnected)
- [IsDebuggerOn](#isdebuggeron)
- [IsDirectory](#isdirectory)
- [IsDuplicate](#isduplicate)
- [IsDuplicateInErrObj](#isduplicateinerrobj)
- [IsFamilyAllowed](#isfamilyallowed)
- [IsGrpOfGrp](#isgrpofgrp)
- [IsGrpValidForRecompute](#isgrpvalidforrecompute)
- [IsKeyPresentInKeyValueMap](#iskeypresentinkeyvaluemap)
- [IsLastOfSet](#islastofset)
- [IsLedOfGrp](#isledofgrp)
- [IsMstNameDuplicate](#ismstnameduplicate)
- [IsObjectBelongsTo](#isobjectbelongsto)
- [IsObjectExists](#isobjectexists)
- [IsProdTallyPrime](#isprodtallyprime)
- [IsProdTallyPrimeEL](#isprodtallyprimeel)
- [IsProdTallyServer](#isprodtallyserver)
- [IsProfilerOn](#isprofileron)
- [IsRepeatVar](#isrepeatvar)
- [IsServiceInstalled](#isserviceinstalled)
- [IsServiceRunning](#isservicerunning)
- [IsStockLedger](#isstockledger)
- [IsSubReport](#issubreport)
- [IsTDLLoaded](#istdlloaded)
- [IsUnicode](#isunicode)
- [IsUnicodeSupported](#isunicodesupported)
- [IsValidGSTIN](#isvalidgstin)
- [IsValidGSTINFormat](#isvalidgstinformat)
- [IsValidGSTINFormatEx](#isvalidgstinformatex)
- [IsVchTypeOfFamily](#isvchtypeoffamily)
- [LastError](#lasterror)
- [LastImportError](#lastimporterror)
- [LastResult](#lastresult)
- [LedgerProfit](#ledgerprofit)
- [ListCount](#listcount)
- [ListFind](#listfind)
- [ListIndex](#listindex)
- [ListKey](#listkey)
- [ListValue](#listvalue)
- [ListValueEx](#listvalueex)
- [ListValueFind](#listvaluefind)
- [LoopIndex](#loopindex)
- [MakeExportName](#makeexportname)
- [MakeTallyUniqueID](#maketallyuniqueid)
- [MakeUniqueID](#makeuniqueid)
- [NumChildren](#numchildren)
- [NumLinesInScope](#numlinesinscope)
- [ODBCName](#odbcname)
- [Param](#param)
- [PeriodDateFrom](#perioddatefrom)
- [PeriodDateTo](#perioddateto)
- [PrimaryCostCategory](#primarycostcategory)
- [ReadINI](#readini)
- [RecorderStatus](#recorderstatus)
- [RemoteUserID](#remoteuserid)
- [ScenarioValue](#scenariovalue)
- [SchedulerInfo](#schedulerinfo)
- [SellSpecRate](#sellspecrate)
- [SellTransRate](#selltransrate)
- [ServerPort](#serverport)
- [SQLValue](#sqlvalue)
- [StdSpecRate](#stdspecrate)
- [StdXchgRate](#stdxchgrate)
- [TargetSyncCmpName](#targetsynccmpname)
- [TaxBillExists](#taxbillexists)
- [TgtFile](#tgtfile)
- [TgtObject](#tgtobject)
- [ToValue](#tovalue)
- [ValType](#valtype)
- [VarKey](#varkey)
- [XMLName](#xmlname)

---

## BillExists

This function returns a logical value, to check if there is any specified bills are present for the associated party in the list of bills or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is used to specify the Bill Name. | Value | String | Yes | No |
| 2 | This parameter is used to specify the party name, ie; Ledger Name. | Value | String | Yes | No |

---

## BillObject

This function when from the taxobject allocation object then it gives the method value from the selected linkmaster Bill Object else it  gives the method value from the Bill object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Method name or expression for method. | Value | Yes | No |

---

## BudgetValue

This function gives the Budgeted Value of the specified Object.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is a string type. | Value | String | Yes | No |
| 2 | This Parameter is a string type. | Value |  | Yes | No |

---

## BuyTransRate

This function gives the transaction rate of exchange value for a date.If no value is specified it gives the rate for last date before the specified date.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Hybrid
- **Return Type**: Rate of Exchange

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Date for which specified rate of exchange is to be find for buying. | Value | Date | Yes | No |
| 2 | To specify the Name of currency. | Value | String | No | No |

---

## CashAccountName

This function provides the name of the first Cash Ledger from the current company or the specified company. It returns the first Cash Ledger when in the context of Ledger Object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the name of the Company. | Value | No | No |

---

## ChequeNumExists

This function returns a logical value, to check if there is any specified cheques are present for the associated Ledger or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is used to specify the Ledger Name. | Value | String | Yes | No |
| 2 | This parameter is used to specify the cheque number. | Value | String | Yes | No |

---

## ClientEvaluate

This function is used to evaluate a formula at run time on client only. This formula will be evaluated dynamically at the time of usage.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This parameter is used to specify the name of the formula. | Value | Yes | No |

---

## ClientServerString

It returns the mode in which Current instance of Tally is running, ie Server with ODBC, Server without ODBC, Client with ODBC, Client without ODBC etc.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## CompanyRemUserName

It returns the name of Remote user logged in for accessing remote company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## CompanyValue

This function retrieves the value of a method from one company to another. It accepts two parameters. The  first one is the object name representing the Company  and second one represents the Method of that object.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is can be Expression. | Value | String | Yes | No |
| 2 | To specify any expression. | Value |  | Yes | No |

---

## CurrentValue

This function provides the amount as per the value stated for the current date.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is can be Expression. | Value | Yes | No |

---

## DateFrom

This function returns the date from which the period starts. This is particularly useful when it is required to compare the given date with the start date of the period.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## DateTo

This function returns the date with which the period ends. This is particularly useful when it is required to compare given date with the end date of the period.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## DecodeBase64ToStr

This function decodes base64 string to text

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Base64 string to be decoded. | Value | String | Yes | No |

---

## DecryptStr

This function returns decrypted string using 3DES (Triple Data Encription Standard) algorithm.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is a string which is to be decrypted. | Value | String | Yes | No |
| 2 | To specify Password / Key for decryption. | Value | String | Yes | No |

---

## EncodeFileToBase64

This function encodes file to base64 string

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Path of the file to be encoded | Value | String | Yes | No |

---

## EncodeStrToBase64

This function encodes text to base64 string

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Text to be encoded | Value | String | Yes | No |

---

## EncryptStr

This function returns encrypted string using 3DES (Triple Data Encription Standard) algorithm.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is a string which is to be encrypted. | Value | String | Yes | No |
| 2 | To specify Password / Key for encryption. | Value | String | Yes | No |

---

## EncryptURLStr

This function encrypts using DES (Data Encription Standard) algorithm and returns URLEncoded string.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is a string which is to be encrypted. | Value | String | Yes | No |
| 2 | To specify Password / Key for encryption. | Value | String | Yes | No |

---

## EvalParamExp

This function evaluates the system-formula for the parameter that is specified using the function Param. This helps to avoid creating multiple formulas for the similar purpose.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the system-formula expression that has to be evaluated. | Value | Yes | No |
| 2 | To specify the expressions (colon separated) to be evaluated. | Value | Yes | Yes |

---

## Evaluate

This function is used to evaluate a formula at run time. This formula will be evaluated dynamically at the time of usage.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the Formula name. | Value | String | Yes | No |

---

## ExciseExists

This function is used to check whether an Excise Bill exists for a particular party ledger of a particular stock item for a specified bill number.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the Value(Bill No.). | Value | String | Yes | No |
| 2 | To specify  the PartyLedgerName. | Value | String | Yes | No |
| 3 | To specify  the PartyLedgerName. | Value | String | Yes | No |

---

## ExclEvaluate

This function is used to evaluate an expression exclusively i.e., without setting dependencies.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | It specifies the Expression to be evaluated exclusively. | Value | Yes | No |

---

## ExecNatLangQuery

This function executes a Natural Language Query and returns the result.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It is a String Expression for the Query. | Value | String | Yes | No |
| 2 | To specify  a logical flag to indicate, if detailed result of element recognition is required. | Value | Logical | Yes | No |

---

## FileGetActiveSheetName

Returns the name of the active sheet in the workbook

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## FileGetColumnIdx

Returns the Column index given the column name

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Column name for which to return the column Index | Value | String | Yes | No |

---

## FileGetColumnName

Returns the column name given the column Index

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Column Index for which to return the column name | Value | Long | Yes | No |

---

## FileGetSheetCount

Returns the number of sheet present in the active workbook

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## FileGetSheetIdx

Returns the Index of the sheet provided the sheet name

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Sheet Name for which the sheet index has to be returned | Value | String | Yes | No |

---

## FileGetSheetName

Returns the name of the sheet provided the Sheet index

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Sheet Index for which the sheet name has to be returned | Value | Long | Yes | No |

---

## FileIsEOF

Checks whether EOF has been reached or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## FileRead

This function reads the specified number of characters from the current file position. If number of parameters is not specified, file is read till end-of-line or end-of-file. While reading line special characters like, Quote, Line continuation (+) etc. are considered. Also the leading and lagging line spaces are removed

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Number of characters to read from the source file relative from the current file position | Value | Long | No | No |

---

## FileReadCell

Returns the data present in the cell specified

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Row Number | Value | Long | Yes | No |
| 2 | Column Number | Value | Long | Yes | No |

---

## FileReadRaw

This function reads the specified number of characters from the current file position. If number of parameters is not specified, file is read till end-of-line or end-of-file. This function does not consider any special characters excluding end-of-line

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Number of characters to read from the source file relative from the current file position | Value | Long | No | No |

---

## FileSize

This function gives the size of given file.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Path. | Value | String | No | No |

---

## FindGSTVoucher

This function used to find if any matching Inward /Outward Vouchers for given GSTIN and Number. The function returns comma separated list of matching Voucher IDs.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parrameter indicates type of document being searched Inward / Outward | Value | String | Yes | No |
| 2 | Specify Party GSTIN using this parameter. | Value | String | Yes | No |
| 3 | Specify Party GSTIN using this parameter. | Value | String | Yes | No |

---

## FromValue

This function is used to get value of a method in between a given date range($$FromValue:Date and $$ToValue:Date).This function is always used along with $$ToValue.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the From date. | Value | Date | Yes | No |
| 2 | This is an expression whose value is evaluated with respect to specified To Date. | Value |  | Yes | No |

---

## GetEnvVar

This function is used to get the value of the environment variable.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the variable name. | Value | String | Yes | No |

---

## GetFileFullPath

This function returns the full file path for specifed relative file path.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the relative file path. | Value | String | Yes | No |

---

## GetMsWordData

This function Gives the text of microsoft word

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Filename with path | Value | String | Yes | No |

---

## GetMsWordHtml

This function Gives the html of microsoft word

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Filename with path | Value | String | Yes | No |
| 2 | Is clean html needed or not | Value | Logical | No | No |

---

## GetNoOfConfigUserTDLs

This function returns the number of TDLs configured.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## GetNoOfDisabledUserTDLs

This function returns the number of TDLs disabled.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## GetUserTallyDriveInfo

This function retrieves detailed information about TallyDrive usage associated with a specific license and user.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Accepts the License Number as a string input. | Value | String | Yes | No |
| 2 | It takes Email ID as a string input type for string expression. | Value | String | Yes | No |

---

## GetValueFromKeyValueMap

This function is used to evaluate the expression defined for a given key in the Key value map definition

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the Key value map definition that is to be evaluated. | Identifier | Yes | Key Value Map | No |
| 2 | To specify the expressions (colon separated) to be evaluated. | Value | Yes |  | No |

---

## HelpModuleMapID

This function is used to retrieve Help Map Id of the nearest UI element in context e.g. Field, Report, Menu.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## HTTPInfo

This function is used to retrieve details of URL and other information available due to SOAP request.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the type of information to be retrieved. | Keyword |  | Yes | Http Info | Content Length, Header, Url | No |
| 2 | Specify the name of HTTP Header for which value is required. This parameter is applicable only if first parameter is HEADER. | Value | String | No |  |  | No |

---

## ImportAction

This function returns the action of Import.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## ImportInfo

This function is used to retrieve information of the import object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the type of information to be retrieved. This information is extracted from import object. | Keyword | Yes | Import State | Altered, Cancelled, Combined, Created, Deleted, Errors, Exceptions, Ignored | No |

---

## ImportType

This function returns the type of Import.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## InCapsuleMode

This function is used to check if the Tally is running in capsule mode.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InDeveloperMode

This function is used to check if the Developer Mode is On.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InFocusMode

This function returns Yes if the specified tile from the Dashboard is currently in focus mode.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InitValue

This function can be used to initialize any value depending on datatype.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Datatype Name. | Value | String | Yes | No |

---

## InMigrationMode

This function returns TRUE if Migration is in progress else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InWords

This function converts the supplied Amount to Words. i.e., it gives the word equivalent of the supplied value. Format can be 'Forex', 'NoSymbol'.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Amount value. | Value | Yes | No |
| 2 | To specify the format which is a string expression ex. forex, no symbol,only. | Value | No | No |

---

## IsAnyUserLoggedInForCB

This function checks whether any Tally.Net ID is currently logged in for Connected Backup & Restore services.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsAutoReport

This function returns TRUE if the report is run as Auto Report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsBelongsTo

This is used to check if the current object belongs to a specified object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the group name. | Value | String | Yes | No |

---

## IsBelongsToCategory

This function checks if the current object belongs to the category which is passed as a parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Category Name. | Value | String | Yes | No |

---

## IsCashLedger

This function is used to check if the ledger belongs to group Cash-In-hand/Bank Accounts  or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Ledger Name. | Value | No | No |

---

## IsChequeRangeUsed

This functions checks and returns if cheques in the given Cheque Range  have been used or not. This function be used to check if any cheque in the range is used OR all cheques in the range are used

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 4
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is used to specify the Ledger Name. | Value | String | Yes | No |
| 2 | This parameter is used to specify the cheque range start number. | Value | String | Yes | No |
| 3 | This parameter is used to specify the cheque range start number. | Value | String | Yes | No |
| 4 | This parameter is used to specify the length of cheque number. | Value | Number | Yes | No |
| 5 | This parameter is used to specify the length of cheque number. | Value | Logical | No | No |

---

## IsChildOf

This function is used to check if the current object of a collection is child of the specified variable.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Groupn Name. | Value | String | Yes | No |

---

## IsChildOfCategory

This function checks the current object is a child of the specified category or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Category Name. | Value | String | Yes | No |

---

## IsClassOf

This function is used to check the specified class is belongs to the specified voucher type or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Class Name. | Value | String | Yes | No |
| 2 | To specify the Voucher Type Name. | Value | String | Yes | No |

---

## IsCmpBaseCurrency

This function is used to check whether the currency specified is the current company's base currency or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Company name. | Value | String | Yes | No |
| 2 | To specify the Currency name. | Value | String | Yes | No |

---

## IsCOMInterfaceInvokable

This function checks whether a COM interface with the Name exists, and has been registered

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the Name of the COM interface definition whose avaliability is to be checked. It can also take an string expression that results in the name of the Definition. | Identifier | Yes | COM Interface | No |

---

## IsCompanyConnectable

This function is used to check whether a company can be connected to Tally.NET Server or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsCompanyConnected

This function is used to check whether a   company is in connected state or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsDebuggerOn

This function is used to check if the Debugger is On Or OFF. Returns TRUE if Debugger is ON.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsDirectory

This function is used to check the directory path is valid or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify theString expression. | Value | String | Yes | No |

---

## IsDuplicate

It checks the duplicate value for Some specific Fields.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Value which has to be checked for duplicate. | Value | String | Yes | No |
| 2 | To specify the master Id of the object. | Value | Number | No | No |
| 3 | To specify the master Id of the object. | Value | String | No | No |

---

## IsDuplicateInErrObj

It checks the duplicate masters in error master list.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Value which has to be checked for duplicate. | Value | String | Yes | No |
| 2 | To specify the master Id of the object. | Value | Number | No | No |
| 3 | To specify the master Id of the object. | Value | String | No | No |

---

## IsFamilyAllowed

This function returns true if the report is defined in an object which has access.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Any valid action name. | Value | String | Yes | No |

---

## IsGrpOfGrp

It checks whether the given group is belongs to another group or is it independent one.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Group Name | Value | String | Yes | No |
| 2 | Group Name | Value | String | Yes | No |

---

## IsGrpValidForRecompute

Walks on the children of the Group/StockGroup recursively till it reaches ledger/stock item. If at least one of the leaf children (Ledger/Stock Item) is part of voucher then returns TRUE else returns FALSE

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsKeyPresentInKeyValueMap

This function is used to know if a given key exists in the Key value map definition

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the Key value map definition that is to be evaluated. | Identifier | Yes | Key Value Map | No |
| 2 | To specify the expressions (colon separated) to be evaluated. | Value | Yes |  | No |

---

## IsLastOfSet

This function is used to check whether the current form is last form to be printed or not.  If the particular form is last then it will return a True otherwise it is false.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsLedOfGrp

The function checks if a given ledger belongs to a particular group or to any of the sub-groups under a particular group. 

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Ledger Name | Value | String | Yes | No |
| 2 | Group Name | Value | String | Yes | No |

---

## IsMstNameDuplicate

This function checks the duplicate value for the master's Name Field. It works only with default Master fields and Master Alias Field.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Value which has to be checked for duplicate. | Value | String | Yes | No |

---

## IsObjectBelongsTo

To check if the current object belongs to a specified object or not.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Object Type. | Value |  | Yes | No |
| 2 | To specify the name of the object. | Value | String | Yes | No |
| 3 | To specify the name of the object. | Value | String | Yes | No |

---

## IsObjectExists

This function returns a logical value. This function can be used to check if object of given type and name is present in current company.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is used to specify the Object type Name. | Value |  | Yes | No |
| 2 | This parameter is used to specify the Object Name. | Value | String | Yes | No |

---

## IsProdTallyPrime

This function is used to check whether the product is TallyPrime or not. It returns true if the product is TallyPrime.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsProdTallyPrimeEL

This function is used to check whether the product is TallyPrime Edit Log or not. It returns true if the product is TallyPrime Edit Log.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsProdTallyServer

This function is used to check whether the product is TallyPrime Server or not. It returns true if the product is TallyPrime Server.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsProfilerOn

This function is used to check if the profiler is On Or OFF. Returns TRUE if Profiler is ON.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsRepeatVar

The function is used to check whether the variable is repeated at report level or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Variable name. | Identifier | Yes | Variable | No |

---

## IsServiceInstalled

This function is used to check if the specified service is installed on the system or not. It returns true if the service is installed.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts any expression which evaluates to name of the service. | Value | String | Yes | No |
| 2 | Executable path of the service | Value | String | No | No |

---

## IsServiceRunning

This function is used to check if the specified service is running or not.  It returns true if the service is running.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts any expression which evaluates to name of the service. | Value | String | Yes | No |
| 2 | Executable path of the service | Value | String | No | No |

---

## IsStockLedger

This function is used to check whether the ledger belongs to Stock-In-hand or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## IsSubReport

This function returns TRUE if the report is run as Sub Report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsTDLLoaded

Returns whether given TDL is Loaded or Not

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify name (with Path) or GUID of the TDL, to check whether it is loaded or not | Value | String | Yes | No |

---

## IsUnicode

This function returns 'Yes' if Unicode is supported else returns 'No'. It will return 'No' for Tally 7.2 and 'Yes' for all higher versions. This is used to check the multi-lingual facility provided.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsUnicodeSupported

To check whether Unicode is supported or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsValidGSTIN

This functgion validates whether given GSTIN is valid or not

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify GSTIN number to be validated | Value | String | Yes | No |

---

## IsValidGSTINFormat

This function checks to see if given GSTIN format is valid. It only checks correctness of GSTIN as per format

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify GSTIN number to be validated | Value | String | Yes | No |

---

## IsValidGSTINFormatEx

This function checks to see if given GSTIN format is valid. It checks correctness of GSTIN as per all the registration types.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify GSTIN number to be validated | Value | String | Yes | No |

---

## IsVchTypeOfFamily

To check if the voucher belongs to a particular voucher-joint family or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Voucher Type Name. | Value | String | Yes | No |
| 2 | To specify the Voucher Family Name. | Value | String | Yes | No |

---

## LastError

It returns the last error string of action executed in a function.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## LastImportError

This function returns Import error description for the last import done.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## LastResult

It returns the Last action result executed in a function.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## LedgerProfit

It gives the reserved Ledger Name Profit & Loss Account.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## ListCount

This function is used to find the number of items present in the list variable.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of List Variable. | Identifier | Yes | Variable | No |

---

## ListFind

This function is used to find the specified key item in the list variable.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the Name of List Variable. | Identifier |  | Yes | Variable | No |
| 2 | To specify the Unique Key of which value to be returned. | Value | String | Yes |  | No |

---

## ListIndex

This function returns the index for the given the key.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It specifies the Name of List Variable. | Identifier |  | Yes | Variable | No |
| 2 | To specify the unique Key for which the corresponding index to be returned. | Value | String | Yes |  | No |

---

## ListKey

This function returns the key for the given  index.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It specifies the Name of List Variable. | Identifier |  | Yes | Variable | No |
| 2 | Index of the element variable which corresponding key has to be returned. | Value | Long | Yes |  | No |

---

## ListValue

This function returns the value of the list variable for the specified key.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It specifies the Name of List Variable. | Identifier |  | Yes | Variable | No |
| 2 | To specify the Unique Key String for accessing the values later. | Value | String | Yes |  | No |
| 3 | To specify the Unique Key String for accessing the values later. | Value |  | No |  | No |

---

## ListValueEx

It returns the returns the value of an element at the specified index in the list.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It specifies the Name of List Variable. | Identifier |  | Yes | Variable | No |
| 2 | To specify the Element variable present at this index would be returned. | Value | Long | Yes |  | No |
| 3 | To specify the Element variable present at this index would be returned. | Value |  | No |  | No |

---

## ListValueFind

This function is used to check if a given value exists in the list. If a given list has more than one same value, index can be used to retrieve the n'th matching value.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It specifies the Name of List Variable. | Identifier |  | Yes | Variable | No |
| 2 | To find nth matching value in the list. | Value | Long | Yes |  | No |
| 3 | To find nth matching value in the list. | Value |  | Yes |  | No |
| 4 | Optional member specification if the list element is a compound variable. | Value |  | No |  | No |

---

## LoopIndex

This function returns the loop count.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Depth. | Value | Long | No | No |

---

## MakeExportName

The function is used to create the Export File name according to the format specified using the parameters. The parameters include any string formula and format which is used for creation.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify String Formula. | Value | String | Yes | No |
| 2 | To specify the Export format. | Value | String | Yes | No |

---

## MakeTallyUniqueID

This function genarates the a 16 character Unique ID.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## MakeUniqueID

This function genarates the Unique GUID.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## NumChildren

It returns the number of children for the current object.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Hybrid
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the type of the object. | Value |  | No | No |
| 2 | To specify the object name. | Value | String | No | No |

---

## NumLinesInScope

This function is used to know how many lines were considered for any operation, since  various operations can be performed on multiple lines.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the scope ie; All Lines, Selected Lines, UnSelected Lines, Current Line/Lines. | Value | No | No |

---

## ODBCName

This function returns the ODBC Name of the currently used Object or Method.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the currently used object or method. | Value | String | Yes | No |

---

## Param

This function specifies the index of the parameter for the function EvalParamExp.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: (null)

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the index of the parameter expression to be validated by the function EvalParamExp. | Value | Long | Yes | No |

---

## PeriodDateFrom

This function returns the starting date for the current auto column periodicity object.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## PeriodDateTo

This function returns the ending date for the current auto column periodicity object.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## PrimaryCostCategory

This function gives the default Cost Category Name. Name of the first 'Cost Category' of the Current Company.  The name of the Primary Cost Category of the Company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Server
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the company. | Value | No | No |

---

## ReadINI

The function is used to read the INI file and get value of any parameter in the INI.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts the path and filename of the INI file. | Value | String | Yes | No |
| 2 | It accepts section name in the INI file. | Value | String | Yes | No |
| 3 | It accepts section name in the INI file. | Value | String | Yes | No |
| 4 | It accepts an Index number. This is used when multiple values for the same parameter are accepted. | Value | Long | No | No |

---

## RecorderStatus

This function returns the status of the Recorder. i.e. 'Started' , 'Stopped' , 'Paused'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## RemoteUserID

This function returns the current remote user for whom request is being processed.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## ScenarioValue

The function is used to fetch the scenario value  for the particular group such as Actuals. .

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Group Name. | Value | String | Yes | No |
| 2 | To specify the Value expression. | Value |  | Yes | No |

---

## SchedulerInfo

This function retrieves information related to a scheduler, such as its current status or configuration details.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Scheduler Info Key to indicate which piece of scheduler information should be returned. | Value | String | Yes | No |

---

## SellSpecRate

This function gives the specified Selling Rate of a Foreign Currency for a particular Date Range as entered while creating the Foreign Currency in the Currency Master.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Hybrid
- **Return Type**: Rate of Exchange

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Date for which specified rate of exchange is to be find for selling. | Value | Date | Yes | No |
| 2 | To specify the Name of currency. | Value | String | No | No |

---

## SellTransRate

This function gives the transaction rate for a particular date. Here the Date becomes the parameter and using this parameter the function will execute and return the transaction rate for a particular date range as entered while creating a Foreign Currency.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Hybrid
- **Return Type**: Rate of Exchange

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Date for which specified rate of exchange is to be find for selling in any transaction. | Value | Date | Yes | No |
| 2 | To specify the Name of currency. | Value | String | No | No |

---

## ServerPort

This function returns the current port number.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## SQLValue

This function gives the SQL value for a column, used in Natural Language Interface. i.e., selected statement in direct commands. When we pass SQL command in Calculator panel it will fetch the data for the table we passed in SQL command.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Column number depending on which this  function gives the values for a p articular column. | Value | Number | Yes | No |

---

## StdSpecRate

This function is used to give the standard specified rate of the foreign currency.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Hybrid
- **Return Type**: Rate of Exchange

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Date for which standard specified rateis to be find. | Value | Date | Yes | No |
| 2 | To specify the Currency name. | Value | String | No | No |

---

## StdXchgRate

This function gives the standard exchange rate of the foreign currency.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client
- **Return Type**: Rate of Exchange

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Company name. | Value | String | Yes | No |
| 2 | To specify the Currency name. | Value | String | Yes | No |

---

## TargetSyncCmpName

This function returns the name of the target company to which the sync has to happen .

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Client rule for which the target sync company name has to be returned. | Value | String | Yes | No |

---

## TaxBillExists

This function is used to check the existence of the Tax Bill.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Server
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Variable name/FieldName. | Value | String | Yes | No |
| 2 | To specify the Ledger Name. | Value | String | Yes | No |

---

## TgtFile

Executes in context of Target File

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Expression that is to be evaluated. | Value | Yes | No |

---

## TgtObject

This function is used to evaluate the value of expression in the context of target object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This TDL specifies a valid TDL expression. | Value | Yes | No |

---

## ToValue

This function is used to get the value of a method in between a given date range($$FromValue:Date and $$ToValue:Date).This function is always used along with $$FromValue.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the date 'From date'. | Value | Date | Yes | No |
| 2 | To specify the date 'To date' | Value |  | Yes | No |

---

## ValType

This function return the data type of the paramete passed.  This parameter can be a Variable name or Field name and this function returns its data type. If the parameter is the name of a field, then the type of that field is returned.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To  specify any type of parameter E.g. field name or variable name etc. | Value | Yes | No |

---

## VarKey

This function is used to get list variable key value from current object context.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## XMLName

This function XMLizes the specified string i.e. converts the string into uppercase and removes spaces.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the XML tag name. | Value | String | Yes | No |

---
