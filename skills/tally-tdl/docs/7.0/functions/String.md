# String Function

> **Version**: 7.0

Reference documentation for all entries in the **String** function.

> **Total Entries**: 159

## Table of Contents

- [BaseString](#basestring)
- [CaseConvert](#caseconvert)
- [CommaList](#commalist)
- [CountOccurences](#countoccurences)
- [ExactMatch](#exactmatch)
- [ExciseSupplierRGNo](#excisesupplierrgno)
- [ExtractNumbers](#extractnumbers)
- [ExtractPatternEx](#extractpatternex)
- [FetchSeparator](#fetchseparator)
- [FullList](#fulllist)
- [FullListEx](#fulllistex)
- [GetMethodNameValue](#getmethodnamevalue)
- [GetValidFileName](#getvalidfilename)
- [GroupAdvances](#groupadvances)
- [GroupBank](#groupbank)
- [GroupBankOD](#groupbankod)
- [GroupBranches](#groupbranches)
- [GroupCapital](#groupcapital)
- [GroupCash](#groupcash)
- [GroupCurrentAssets](#groupcurrentassets)
- [GroupCurrentLiab](#groupcurrentliab)
- [GroupDeposits](#groupdeposits)
- [GroupDirectExpenses](#groupdirectexpenses)
- [GroupDirectIncomes](#groupdirectincomes)
- [GroupDuties](#groupduties)
- [GroupFixedAssets](#groupfixedassets)
- [GroupIndirectExpenses](#groupindirectexpenses)
- [GroupIndirectIncomes](#groupindirectincomes)
- [GroupInvestments](#groupinvestments)
- [GroupLoansLiab](#grouploansliab)
- [GroupMiscExp](#groupmiscexp)
- [GroupProvisions](#groupprovisions)
- [GroupPurchase](#grouppurchase)
- [GroupReserves](#groupreserves)
- [GroupSales](#groupsales)
- [GroupSecuredLoans](#groupsecuredloans)
- [GroupStock](#groupstock)
- [GroupSundryCreditors](#groupsundrycreditors)
- [GroupSundryDebtors](#groupsundrydebtors)
- [GroupSuspense](#groupsuspense)
- [GroupUnsecuredLoans](#groupunsecuredloans)
- [GSTTaxUnitFirstApplDate](#gsttaxunitfirstappldate)
- [IgnoreTallyNoiseCharsUCase](#ignoretallynoisecharsucase)
- [IsActuals](#isactuals)
- [IsAllEmpty](#isallempty)
- [IsAlphabet](#isalphabet)
- [IsAlphaNumeric](#isalphanumeric)
- [IsAnyEmpty](#isanyempty)
- [IsCurrent](#iscurrent)
- [IsDefault](#isdefault)
- [IsEmpty](#isempty)
- [IsEnd](#isend)
- [IsEndOfList](#isendoflist)
- [IsEqual](#isequal)
- [IsExcelColumnNameValid](#isexcelcolumnnamevalid)
- [IsExcelColumnRangeValid](#isexcelcolumnrangevalid)
- [IsGroupAdvances](#isgroupadvances)
- [IsGroupBank](#isgroupbank)
- [IsGroupBankOD](#isgroupbankod)
- [IsGroupBranches](#isgroupbranches)
- [IsGroupCapital](#isgroupcapital)
- [IsGroupCash](#isgroupcash)
- [IsGroupCurrentAssets](#isgroupcurrentassets)
- [IsGroupCurrentLiab](#isgroupcurrentliab)
- [IsGroupDeposits](#isgroupdeposits)
- [IsGroupDirectExpenses](#isgroupdirectexpenses)
- [IsGroupDirectIncomes](#isgroupdirectincomes)
- [IsGroupDuties](#isgroupduties)
- [IsGroupFixedAssets](#isgroupfixedassets)
- [IsGroupIndirectExpenses](#isgroupindirectexpenses)
- [IsGroupIndirectIncomes](#isgroupindirectincomes)
- [IsGroupInvestments](#isgroupinvestments)
- [IsGroupLoansLiab](#isgrouploansliab)
- [IsGroupMiscExp](#isgroupmiscexp)
- [IsGroupProvisions](#isgroupprovisions)
- [IsGroupPurchase](#isgrouppurchase)
- [IsGroupReserves](#isgroupreserves)
- [IsGroupSales](#isgroupsales)
- [IsGroupSecuredLoans](#isgroupsecuredloans)
- [IsGroupStock](#isgroupstock)
- [IsGroupSundryCreditors](#isgroupsundrycreditors)
- [IsGroupSundryDebtors](#isgroupsundrydebtors)
- [IsGroupSuspense](#isgroupsuspense)
- [IsGroupUnsecuredLoans](#isgroupunsecuredloans)
- [IsLedgerProfit](#isledgerprofit)
- [IsNegSDF](#isnegsdf)
- [IsNotApplicable](#isnotapplicable)
- [IsNumber](#isnumber)
- [IsPatternMatch](#ispatternmatch)
- [IsSysName](#issysname)
- [IsSysNameEqual](#issysnameequal)
- [IsTDLSysNameEqual](#istdlsysnameequal)
- [IsValidFileName](#isvalidfilename)
- [LanguageSysValue](#languagesysvalue)
- [LanguageTDLSysValue](#languagetdlsysvalue)
- [LocaleString](#localestring)
- [MakeEllipsis](#makeellipsis)
- [NewLine](#newline)
- [NumAdjustmentClassification](#numadjustmentclassification)
- [NumAttdTypes](#numattdtypes)
- [NumBudgets](#numbudgets)
- [NumClientRules](#numclientrules)
- [NumCostCategories](#numcostcategories)
- [NumCostCentres](#numcostcentres)
- [NumCurrencies](#numcurrencies)
- [NumDeducteeTypes](#numdeducteetypes)
- [NumEmployeeGroups](#numemployeegroups)
- [NumEmployees](#numemployees)
- [NumExciseDutyClassification](#numexcisedutyclassification)
- [NumFBTATypes](#numfbtatypes)
- [NumFBTCategory](#numfbtcategory)
- [NumFixedClientRules](#numfixedclientrules)
- [NumGodowns](#numgodowns)
- [NumGroups](#numgroups)
- [NumGSTClassification](#numgstclassification)
- [NumIncomeTaxClassification](#numincometaxclassification)
- [NumIncomeTaxSlab](#numincometaxslab)
- [NumLBTClassification](#numlbtclassification)
- [NumLedgers](#numledgers)
- [NumMerchantProfiles](#nummerchantprofiles)
- [NumPayheads](#numpayheads)
- [NumPriceLevels](#numpricelevels)
- [NumScenarios](#numscenarios)
- [NumSerialNumber](#numserialnumber)
- [NumServerRules](#numserverrules)
- [NumStates](#numstates)
- [NumStCategories](#numstcategories)
- [NumStockCategories](#numstockcategories)
- [NumStockGroups](#numstockgroups)
- [NumStockItems](#numstockitems)
- [NumTariffClassification](#numtariffclassification)
- [NumTaxUnit](#numtaxunit)
- [NumTaxUnitByType](#numtaxunitbytype)
- [NumTCSRates](#numtcsrates)
- [NumTDSRates](#numtdsrates)
- [NumUnits](#numunits)
- [NumVatClassifications](#numvatclassifications)
- [NumVchTypes](#numvchtypes)
- [PercEncode](#percencode)
- [RemoveChar](#removechar)
- [RemoveExcelNoiseCharacter](#removeexcelnoisecharacter)
- [RemovePattern](#removepattern)
- [SeparatorChar](#separatorchar)
- [Sprintf](#sprintf)
- [StrByCharCode](#strbycharcode)
- [String](#string)
- [StringFindAndReplace](#stringfindandreplace)
- [StringLength](#stringlength)
- [StringPart](#stringpart)
- [StringRemovePrefixSuffix](#stringremoveprefixsuffix)
- [StringRemWord](#stringremword)
- [StringWord](#stringword)
- [StringWordEx](#stringwordex)
- [SysName](#sysname)
- [TDLSysName](#tdlsysname)
- [Translate](#translate)
- [TrimNeg](#trimneg)
- [VarRangeValue](#varrangevalue)
- [ZeroFill](#zerofill)

---

## BaseString

This function translates any non-English language string to English language provided necessary dictionary and translations are present. If required dictionary or translation is not present then actual string is returned.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String . | Value | String | Yes | No |

---

## CaseConvert

This function is used to convert all letters of a String which is passed as parameter to relevant case.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Type of case conversion to be performed. | Keyword |  | Yes | Case | All Capital, All Lower, First Upper Case, Lower Case, Normal, Proper Case, Small Case, Title Case, Title Case Exact, Upper Case | No |
| 2 | Type of case conversion to be performed. | Value | String | Yes |  |  | No |

---

## CommaList

This function concatenates all the values specified as parameters with comma separation to form a single string.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a String.Multiple parameters of the same type can be specified. | Value | No | Yes |

---

## CountOccurences

This function counts the number of occurence of a substring in a given string

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Input string to find the occurences of substring | Value | String | Yes | No |
| 2 | Substring to be searched | Value | String | Yes | No |

---

## ExactMatch

This function is used to compare two strings for exact match.It returns a Logical Value.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a String. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to a String. | Value | String | Yes | No |

---

## ExciseSupplierRGNo

This function takes first parameter as godown or taxunit object type and second as master name and then optionally any number of voucher types. This function returns the last value of last voucher TradersSupplierRGNo among all the voucher type

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | godown or taxunit object type | Value | String | Yes | No |
| 2 | master name | Value | String | Yes | No |
| 3 | master name | Value |  | No | Yes |

---

## ExtractNumbers

This function gets the numeric string from a alpha-num string

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Alpha numeric input string | Value | String | Yes | No |

---

## ExtractPatternEx

This function extracts the values mentioned in the pattern from the string

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is used to specify the string. | Value | String | Yes | No |
| 2 | This Parameter is used for the pattern to be extracted, which could be a set of characters or/and range of characters. For example: A, z, 9, a-f | Value | String | Yes | No |
| 3 | This Parameter is used for the pattern to be extracted, which could be a set of characters or/and range of characters. For example: A, z, 9, a-f | Value | Logical | No | No |
| 4 | This parameter is used to retain commas in the pattern. Default: No | Value | Logical | No | No |
| 5 | This parameter is used to retain commas in the pattern. Default: No | Value | Logical | No | No |

---

## FetchSeparator

This function returns C_FETCH_SEPARATOR character that is used for separating multiple object names in FETCH OBJECT attribute.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## FullList

This function returns a list of comma separated values of a given particular method specified as 2nd parameter form a collection which is passed as 1st parameter.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the name of the collection. | Identifier | Yes | Collection | No |
| 2 | To specify the name of the collection. | Value | Yes |  | No |

---

## FullListEx

This function returns a list of specified character separated values of a given particular method specified as 2nd parameter from a collection which is passed as 1st parameter.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the separator character. | Value | String | Yes |  | No |
| 2 | To specify the separator character. | Identifier |  | Yes | Collection | No |
| 3 | To specify the method names seperated by colon. | Value |  | Yes |  | No |

---

## GetMethodNameValue

This function is used to get value of the method.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the method name. | Value | String | Yes | No |

---

## GetValidFileName

This function returns the Valid FileName by removing disallowed characters.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify filename as Input | Value | String | Yes | No |

---

## GroupAdvances

This function returns the name of the Reserved group in Tally called Advances.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupBank

This function returns the name of the  Reserved Group Name Bank Account.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupBankOD

This function returns the name of the Reserved Group Bank OD A/c.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupBranches

This function returns the name of the Reserved group Branch/Divisions.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupCapital

This function returns the name of the reserved group Capital Account.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupCash

This function returns the name of the  Reserved group in Tally called Cash-In-Hand.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupCurrentAssets

This function returns the name of the reserved group Current Assets.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupCurrentLiab

Gives the name of the reserved group Current Liabilities.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupDeposits

This function returns the name of the Reserved group in Tally called Deposits.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupDirectExpenses

This function returns the name of the  Reserved Group, Direct Expenses.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupDirectIncomes

This function returns the name of the Reserved Group, Direct Incomes.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupDuties

This function returns the name of the Reserved Group Name Duties & Taxes.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupFixedAssets

This function returns the name of the reserved group Fixed Assets.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupIndirectExpenses

This function returns the name of Reserved Group Indirect Expenses.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupIndirectIncomes

This function returns the name of Reserved Group Indirect Incomes.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupInvestments

This function returns the name of the  reserved group Investments.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupLoansLiab

This function returns the name of the  reserved group Loans(Liability).

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## GroupMiscExp

Returns name of the reserved group Misc. Expenses (ASSET).

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupProvisions

This function returns the name of the Reserved Group Provisions.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupPurchase

This function returns the name of the Reserved Group, Purchase Account.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupReserves

It returns the name of the Reserved Group Reserves & Surplus.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupSales

This function returns the Reserved Group Name Sales Account.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupSecuredLoans

This function returns the Reserved Group Name Secured Loans.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupStock

This function returns the Reserved Group Name Stock-in-Hand.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupSundryCreditors

This function returns the Name of the Reserved Group Sundry Creditors.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupSundryDebtors

This function refers to the Reserved group in Tally called Sundry Debtors.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupSuspense

This function returns the name of the Reserved Group Suspense A/c.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GroupUnsecuredLoans

This function returns the Reserved Group Name Unsecured Loans.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | No | No |

---

## GSTTaxUnitFirstApplDate

Gives earliest GST applicable date across all GST tax units.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Server
- **Return Type**: Date

### Parameters

_No parameters._

---

## IgnoreTallyNoiseCharsUCase

Return string after removing noise characters and converting it to upper case

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Hybrid
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify string which is to be converted to upper case after removing noise characters. | Value | String | Yes | No |

---

## IsActuals

To check whether the value of the parameter is 'Actual'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Budget Name. | Value | Yes | No |

---

## IsAllEmpty

This function checks whether all the passed parameters having empty values or not. This function accepts multiple parameters.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the expressions to be evaluated. | Value | Yes | Yes |

---

## IsAlphabet

To check if the parameter passed has only alphabet.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | String that has to be checked if it has only alphabet. | Value | Yes | No |

---

## IsAlphaNumeric

To check if the parameter passed has only alphabet and numbers.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | String that has to be checked if it has only alphabet and numbers. | Value | Yes | No |

---

## IsAnyEmpty

To check if the any expression evaluates to an empty value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | The expressions to be evaluated. | Value | Yes | Yes |

---

## IsCurrent

This function will return true if variable value is blank or sysname 'Stock-In-Hand'. It's same as 'IsCurrentVar' but used for repeated variable.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Identifier | Yes | Variable | No |

---

## IsDefault

This function returns true if the value passed to it is TDLSysName 'Default'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Value | String | Yes | No |

---

## IsEmpty

To check if the parameter passed is Empty.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression. | Value | Yes | No |

---

## IsEnd

To check if the selected item is an End Of List.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Value | String | Yes | No |

---

## IsEndOfList

To check if the selected item is an End Of List.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Value | String | Yes | No |

---

## IsEqual

To check whether the two parameters passed is equal or not.The function $$IsEqual is used to check whether the parameters that is passed to the function is equal or not. These parameters can be of any type and the function returns a logical value 'Yes' if they are equal otherwise it returns 'No'.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is a  Parameter of any Data Type. | Value | Yes | No |
| 2 | This is a  Parameter of any Data Type. | Value | Yes | No |

---

## IsExcelColumnNameValid

This function is used to check if the string passed is a valid Excel column or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the column name. | Value | String | Yes | No |

---

## IsExcelColumnRangeValid

This function is used to check if the ending Excel column is greater than or equal to the starting Excel column or not.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Start column name. | Value | String | Yes | No |
| 2 | To specify the End column name. | Value | String | Yes | No |

---

## IsGroupAdvances

This function is used to  check  if the current object is the group  ?Loans & Advances?.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupBank

This function is used to check if the group belongs to Bank Accounts or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupBankOD

To check if the current object is the reserved group Bank OD Accounts.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupBranches

It is used to check whether the current object is the Group.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupCapital

To check if the current object is the reserved group Capital Account.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupCash

This function is used to check if the group belongs to Cash-in-Hand or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupCurrentAssets

To check if the current object is the reserved group Current Assets.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupCurrentLiab

To check if the current object is the reserved group Current Liabilities.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupDeposits

This function is used to  check  if the current object is the group Deposits.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupDirectExpenses

To check if the current object is the reserved group Direct Expenses

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupDirectIncomes

This function is used to check, whether the group belongs to Direct Incomes or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupDuties

This function is used to check if the group belongs to Duties and Taxes.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupFixedAssets

To check if the current object is the reserved group Fixed Assets.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupIndirectExpenses

This function is used to check if the group belongs to Indirect Expenses or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupIndirectIncomes

This function is used to check if the group belongs to Indirect Incomes or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupInvestments

To check if the current object is the reserved group Investments.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupLoansLiab

To check if the current object is the reserved group Loan Liability.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupMiscExp

This function is used to check if the specified group belongs to Misc Expenses or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupProvisions

This function is used to check if the group belongs to ?Provisions? or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupPurchase

This function is used to check if the specified group belongs to Purchase Accounts or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupReserves

This function is used to check if the specified group belongs to Reserves & Surplus or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupSales

This function is used to check if the specified group belongs to Sales Accounts or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupSecuredLoans

This function is used to check if the specified group belongs to Secured Loans or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupStock

This function is used to check if the specified group belongs to Stock in hand or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupSundryCreditors

This function is used to check if the specified group belongs to SundryCreditors or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupSundryDebtors

This function is used to check if the specified group belongs to Sundry Debtors or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupSuspense

This function is used to check if the specified group belongs to Suspense A/c or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsGroupUnsecuredLoans

This function is used to check if the specified group belongs to Unsecured Loans or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Group. | Value | String | No | No |

---

## IsLedgerProfit

This function is used to check if the specified Ledger is  Profit & Loss A/c or not. If no parameter is specified then it checks whether the current object is Profit & Loss A/c or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the Ledger. | Value | String | No | No |

---

## IsNegSDF

To check if the Symbol prefix used during SDF import/export has been specified as (-). It returns a logical value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Field name or a formula name. | Value | String | Yes | No |

---

## IsNotApplicable

To check whether the parameter passed is marked as Not Applicable.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This can be any expression. | Value | String | Yes | No |

---

## IsNumber

To check if the parameter passed has only numbers.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | String that has to be checked if it has only numeric. | Value | Yes | No |

---

## IsPatternMatch

This function is used to check if the regex pattern matches the input string.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This specifies the string that needs to match the given pattern. | Value | String | Yes | No |
| 2 | This is to specify the regex pattern | Value | String | Yes | No |
| 3 | This is to specify the regex pattern | Value | Logical | No | No |

---

## IsSysName

This function returns 'Yes' if the expression passed as parameter is a System Name or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Method/Storage/Formula/Variable etc | Value | Yes | No |

---

## IsSysNameEqual

This Function takes two parameters as input and checks if the string value passed is equivalent to the SysName which is given as first parameter. If it is equal then it returns 'Yes' Else 'No'.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify System name. | Value | Yes | No |
| 2 | String expression whose value is to be checked against a  system name. | Value | Yes | No |

---

## IsTDLSysNameEqual

This Function takes two parameters as input and checks if the string value passed is equivalent to the TDLSysName which is given as first parameter. If it is equal then it returns 'Yes' Else 'No'.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify TDL System name. | Identifier |  | Yes | System TDL Names | No |
| 2 | String expression whose value is to be checked against a TDL system name. | Value | String | Yes |  | No |

---

## IsValidFileName

This function is used to check whether the entered File name contains disallowed characters, If found it will return FALSE.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify filename as Input | Value | String | Yes | No |

---

## LanguageSysValue

This function returns the language specific value for the string passed. If value is stored in some other language and the user changes the language then value returned by the function will be in the selected language.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Value | String | Yes | No |

---

## LanguageTDLSysValue

This function gives the string display name for TDL sysnames according to the selected language.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Identifier | Yes | System TDL Names | No |

---

## LocaleString

The function $$LocaleString is used to provide multilingual support for TDL. It uses Unicode to provide support for different languages. It accepts a single parameter and make it unicode compatible. Strings which are presented through $$LocaleString are identified for Translation. Strings with out $$LocaleString are displayed in English. Now suppose the strings are displayed using this function and there is no translation for that, then the same string will appear in English.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String . | Value | String | Yes | No |

---

## MakeEllipsis

This function is used to make ellipsis of a string.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a string | Value | String | Yes | No |
| 2 | To specify the limit for ellipsis. | Value | Number | No | No |

---

## NewLine

This function returns a new line character. This can be concatenated with strings to provide a newline character between them.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## NumAdjustmentClassification

Gives the number of Adjustment Classification available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumAttdTypes

Gives the total number of Attendance/Production Voucher Types in current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumBudgets

Gives the total number of Budgets present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumClientRules

Gives the number of client rule existing in current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumCostCategories

Gives the total number of CostCategories present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumCostCentres

Gives the total number of Cost Centres present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumCurrencies

Gives the total number of currencies present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumDeducteeTypes

Gives the number of Deductee Types masters existing in current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumEmployeeGroups

Gives the total number of employees groups for the payroll in current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumEmployees

Gives the total number of employees for the payroll in current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumExciseDutyClassification

Gives the number of excise duty classification  available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the name of the Excise Duty Classification master. | Value | No | No |

---

## NumFBTATypes

Gives the number of FBTAType available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumFBTCategory

Gives the number of FBT Category available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumFixedClientRules

Gives the number of fixed client rule existing in current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumGodowns

Gives the total number of Godowns created for the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumGroups

Gives the total number of Groups present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumGSTClassification

Gives the number of GST Classifications.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumIncomeTaxClassification

Gives the number of IT Slab available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumIncomeTaxSlab

Gives the number of IT Classification available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumLBTClassification

Gives the number of IT Slab available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumLedgers

Gives the total number of ledgers present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumMerchantProfiles

Gives the number of Merchant Profiles present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumPayheads

Gives the total number of PayHeads present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumPriceLevels

Gives the number of Price Levels present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumScenarios

Gives the total number of Scenarios created for the specific company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Name of the Company | Value | No | No |

---

## NumSerialNumber

Gives the number of serial number's available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the name of the serial number master . | Value | No | No |

---

## NumServerRules

Gives the number of server rules created in the current company and mainly used for synchronization.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumStates

Gives the number state objects available in Tally.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumStCategories

Gives the number of ST categories available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumStockCategories

Gives the total number of Stock Categories present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumStockGroups

Gives the total number of Stock Groups in the Current Company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumStockItems

Gives the total number of Stock Items created for the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumTariffClassification

Gives the number of tariff classification object available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the name of the Tariff Classification master . | Value | No | No |

---

## NumTaxUnit

Gives the number of TAX Units available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumTaxUnitByType

Gives the number of TAX Units available based on given taxtype. Also it will give count of taxunits based on Applicable date specified as 2nd argument only in case of Gst Taxtype

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify Tax Type sysname for which number of tax units is request. If specified blank / not specified, then returns total number of tax units | Value | String | No | No |
| 2 | Specify aplicability date. If specified the returns number of Tax units that are applicable from given date. If not specified, then returns total count | Value | Date | No | No |

---

## NumTCSRates

Gives the number of TCS Rates available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumTDSRates

Gives the number of TDS Nature of Payments available.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumUnits

Gives the number of Units of Measure present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumVatClassifications

Gives the number of Vat/Tax classifications available in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## NumVchTypes

Gives the number of Voucher Types present in the current company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Name of the Company. | Value | No | No |

---

## PercEncode

This function will return the URL encoding of the Expression passed as Parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which returns String value. | Value | String | Yes | No |

---

## RemoveChar

This function removes the specified character from the string.

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Use to specify the string | Value | String | Yes | No |
| 2 | Character to be removed. e.g., : ' ', '!' | Value | String | Yes | No |
| 3 | Character to be removed. e.g., : ' ', '!' | Value | Logical | No | No |
| 4 | Remove the enclosed characters between other characters. Default : Yes | Value | Logical | No | No |
| 5 | Remove the enclosed characters between other characters. Default : Yes | Value | Logical | No | No |

---

## RemoveExcelNoiseCharacter

This function returns a string after eliminating noise characters (such as tabs, spaces, and newlines) from the beginning and end of the string. If there are noise characters between two words, they will be replaced with a single space.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the string containing noise characters. | Value | String | Yes | No |

---

## RemovePattern

This function removes the values mentioned in the pattern from the string

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Alpha numeric input string | Value | Yes | No |
| 2 | Pattern to be removed, could be a set of characters or/and range of characters. Eg : A, z, 9, @, a-f | Value | Yes | No |

---

## SeparatorChar

This function returns C_SEPARATOR character that is used internally by Tally.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## Sprintf

This function is introduced to help display the concatenated text properly in the translated version. Using $$LocaleString function, the text would become intertwined and would become unreadable.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | String format specifiers | Value | Yes | No |
| 2 | String parameters | Value | No | Yes |

---

## StrByCharCode

This function returns a string containing the character, given the character CODE passed as parameter

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the Unicode CODE of the character | Value | Number | Yes | No |

---

## String

This function converts the expression which is passed as parameter to a string.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any expression. | Value | Yes | No |
| 2 | Format specification. | Value | No | No |

---

## StringFindAndReplace

This function find a pattern and replaces it with another in a String

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Input String | Value | String | Yes | No |
| 2 | Find this sub-string in the string | Value | String | Yes | No |
| 3 | Find this sub-string in the string | Value | String | Yes | No |
| 4 | Preceedind and Trailing Spaces required in the pattern. Default : No | Value | Logical | No | No |

---

## StringLength

This function will return the length of the Expression passed as Parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which returns String value. | Value | String | Yes | No |

---

## StringPart

This function is used to extract & return characters from an expression which is passed as 1st parameter. This function starts fetching the characters from the 1st parameter with the starting position as 2nd parameter. Now the number of characters to fetch is specified as 3rd parameter.The first character of an expression is identified as 0th position.i.e., the position of Nth character of an expression is identified as (N-1). Therefore to fetch Nth character of an expression the 2nd parameter should be (N-1) and 3rd parameter is 1.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String/Numeric/Amount. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to String/Numeric/Amount. | Value | Number | Yes | No |
| 3 | To specify the number of characters to be fetched. | Value | Number | Yes | No |

---

## StringRemovePrefixSuffix

This function removes the specified prefix/suffix from given string. If the prefix/suffix is not found the same input string is returned. The prefix/suffix comparison is not case sensitive. Last parameter is optional if not specified or specified as NO then function will attempt removal of prefix.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Input String | Value | String | Yes | No |
| 2 | Suffix string to be removed from input string | Value | String | Yes | No |
| 3 | Suffix string to be removed from input string | Value | Logical | No | No |

---

## StringRemWord

This function returns the remaining word of a string that appears after the given position.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is  a Numeric expression to specify the position of the word in the string expression. | Value | Number | Yes | No |
| 2 | This is  a Numeric expression to specify the position of the word in the string expression. | Value | String | Yes | No |

---

## StringWord

This function extracts the word from a string espression based on the specified position.This function fetches the word from a string, whose position is specified as 1st parameter.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a Numeric expression to specify the position of the word in the string expression. | Value | Number | Yes | No |
| 2 | This is a Numeric expression to specify the position of the word in the string expression. | Value | String | Yes | No |

---

## StringWordEx

Give the value according to position of the expression

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Tdl expression with seperator | Value | String | Yes | No |
| 2 | Tdl expression with seperator | Value | String | Yes | No |
| 3 | Position of the value in the given expression | Value |  | No | No |
| 4 | Position of the value in the given expression | Value | Logical | No | No |

---

## SysName

System names are specified using this function. For representing some system names, this function is used. The parameter should be passed without any quotes.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify System name. | Value | Yes | No |

---

## TDLSysName

This function gives the string display name for TDL sysnames according to the language selected.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Identifier | Yes | System TDL Names | No |

---

## Translate

This function translates the specified string expression based on language id. If not specified then by default this is English.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to String. | Value | Long | No | No |

---

## TrimNeg

This function is used for removing the negative sign . If the value is positive it will return the same value. Otherwise remove the sign and return the positive value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a String expression from which negative sign is to be removed. | Value | String | Yes | No |

---

## VarRangeValue

This function returns a list of specified character separated values of a given variable between the start and end postions.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify Variable Name. | Identifier |  | Yes | Variable | No |
| 2 | To specify the Separator character for list. | Identifier |  | No | Collection | No |
| 3 | To specify the Separator character for list. | Value | Long | No |  | No |
| 4 | To specify the End position (inclusive). | Value | Long | No |  | No |

---

## ZeroFill

This function will prefix the string specified by the first argument with the number of zeros based on the length of the string specified by the second argument. In the Syntax String is the  parameter which is passed. Num is the maximum length of the String.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: String
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This expression either returns Number or Amount value. | Value | Number | Yes | No |
| 2 | To specify Number of zeros to be prefixed. | Value | Number | Yes | No |

---
