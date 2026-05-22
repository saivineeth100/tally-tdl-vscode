# Object Collection Function

> **Version**: 7.0

Reference documentation for all entries in the **Object Collection** function.

> **Total Entries**: 70

## Table of Contents

- [AccessObj](#accessobj)
- [AsFlagSet](#asflagset)
- [AsNumSet](#asnumset)
- [AsReqObj](#asreqobj)
- [BaseOwner](#baseowner)
- [CanCancel](#cancancel)
- [CanDelete](#candelete)
- [CollAmtTotal](#collamttotal)
- [CollAmtTotalEx](#collamttotalex)
- [CollectionField](#collectionfield)
- [CollectionFieldByKey](#collectionfieldbykey)
- [CollNumTotal](#collnumtotal)
- [CollNumTotalEx](#collnumtotalex)
- [CollQtyTotal](#collqtytotal)
- [CollQtyTotalEx](#collqtytotalex)
- [CollSrcObj](#collsrcobj)
- [EvaluateRuleSet](#evaluateruleset)
- [FilterAmtTotal](#filteramttotal)
- [FilterAmtTotalEx](#filteramttotalex)
- [FilterCount](#filtercount)
- [FilterCountEx](#filtercountex)
- [FilterNumTotal](#filternumtotal)
- [FilterNumTotalEx](#filternumtotalex)
- [FilterQtyTotal](#filterqtytotal)
- [FilterQtyTotalEx](#filterqtytotalex)
- [FilterValue](#filtervalue)
- [FirstObj](#firstobj)
- [FlagGetDescription](#flaggetdescription)
- [FlagGetValue](#flaggetvalue)
- [FlagsCount](#flagscount)
- [FlagsCountFromLevel](#flagscountfromlevel)
- [FlagSetAND](#flagsetand)
- [FlagSetOR](#flagsetor)
- [FlagsIsAllTrue](#flagsisalltrue)
- [FlagsIsAllTrueFromLevel](#flagsisalltruefromlevel)
- [FlagsIsAnyTrue](#flagsisanytrue)
- [FlagsIsAnyTrueFromLevel](#flagsisanytruefromlevel)
- [FlagsListDescription](#flagslistdescription)
- [FlagsListDescriptionFromLevel](#flagslistdescriptionfromlevel)
- [IsCollSrcObjChanged](#iscollsrcobjchanged)
- [IsEmptyCollection](#isemptycollection)
- [IsFirstObj](#isfirstobj)
- [IsLastObj](#islastobj)
- [IsRemoved](#isremoved)
- [ItemSerial](#itemserial)
- [LastObj](#lastobj)
- [LineObject](#lineobject)
- [LoopCollObj](#loopcollobj)
- [Name](#name)
- [NameGetValue](#namegetvalue)
- [NextObj](#nextobj)
- [NumFilledItems](#numfilleditems)
- [NumGetValue](#numgetvalue)
- [NumItems](#numitems)
- [ObjBudget](#objbudget)
- [ObjCompany](#objcompany)
- [ObjectOf](#objectof)
- [ObjFromDate](#objfromdate)
- [ObjScenario](#objscenario)
- [ObjToDate](#objtodate)
- [ObjValMethod](#objvalmethod)
- [Owner](#owner)
- [PartNumber](#partnumber)
- [PrevObj](#prevobj)
- [ReportObject](#reportobject)
- [ReptField](#reptfield)
- [ReqObject](#reqobject)
- [ReqOwner](#reqowner)
- [SetAutoColumns](#setautocolumns)
- [Type](#type)

---

## AccessObj

This function allows evaluating any formula in the context of a UI object, which is specified by a Definition type and Access Name

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify Definion Type; Can accept either Part or Line; these are only two which supports AccessName. | Keyword |  | Yes | Desc Type | Border, Button, Collection, Color, Colour, COM Interface, Field, Form, Function, Import File, Import Object, Include, Key, Key Value Map, Line, Menu, Name Set, Notification, Object, Object Map, Part, Progress Bar, QueryBox, Report, Resource, Rule Set, Style, System, Table, Variable | No |
| 2 | To specify Definion Type; Can accept either Part or Line; these are only two which supports AccessName. | Value | String | Yes |  |  | No |
| 3 | To specify Formula which needs to be evaluated in the Access Object's context. | Value |  | Yes |  |  | No |

---

## AsFlagSet

This function converts a given Num Set into a Flag Set.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: FlagSet

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression that evaluates to a Num Set. | Value | NumSet | Yes | No |

---

## AsNumSet

This function converts a given Flag Set into a Num Set.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: NumSet

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression that evaluates to a Flag Set. | Value | FlagSet | Yes | No |

---

## AsReqObj

This Function overrides the default requestor and bookmarks the current object as Requestor Object for referring later during the subsequent evaluation when referred using ReqObject Function.  When ReqObject Function is used, the same evaluates the parameter in the context of this Object context that is bookmarked as a Requestor.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Valid TDL expression. | Value | Yes | No |

---

## BaseOwner

This function gives/checks the Base Owner (i.e., Object) of the associated method. When prefixed to an expression in TDL, the Current Object changes to the base owner object, for the purpose of evaluation of the expression. The Expression can be any Valid TDL Expression which may consist of method, function etc.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Parameter of Any Data Type | Value | Yes | No |

---

## CanCancel

This function checks whether the current object can be cancelled or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## CanDelete

This function checks whether the current object can be deleted or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## CollAmtTotal

This function returns the sum of the required Method of Type Amount from all the Objects of the specified Collection.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 2 | To specify Value Expression of Type Amount. | Value | Yes |  | No |

---

## CollAmtTotalEx

This function returns the sum of the required Method of Type Amount from all the Objects of the specified Collection.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier |  | Yes | Collection | No |
| 2 | To specify Value Expression of Type Amount. | Value |  | Yes |  | No |
| 3 | To specify Value Expression of Type Amount. | Value | String | No |  | No |

---

## CollectionField

This function returns the value of a method at a particular position of the given collection.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Method/System Formula. | Value | Yes |  | No |
| 2 | To specify Position/ Record Number. | Value | Yes |  | No |
| 3 | To specify Position/ Record Number. | Identifier | Yes | Collection | No |
| 4 | To specify the Object Identifier (Object Type and Name). This is an optional parameter. If specified, Collection Name specified under 3rd parameter is considered as sub collection under this Object. | Value | No |  | No |

---

## CollectionFieldByKey

The function enables the TDL Programmer to create *in-memory indexed collections* based on some 'Search Key'. This indexed collection will have significant performance improvement.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Method name. | Value | Yes |  | No |
| 2 | To specify Key Formula. | Identifier | Yes |  | No |
| 3 | To specify Key Formula. | Identifier | Yes | Collection | No |

---

## CollNumTotal

This function returns the sum of the required Method of Type Number from all the Objects of the specified Collection.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 2 | To specify Value Expression of Type Number. | Value | Yes |  | No |

---

## CollNumTotalEx

This function returns the sum of the required Method of Type Number from all the Objects of the specified Collection.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier |  | Yes | Collection | No |
| 2 | To specify Value Expression of Type Number. | Value |  | Yes |  | No |
| 3 | To specify Value Expression of Type Number. | Value | String | No |  | No |

---

## CollQtyTotal

This function returns the sum of the required Method of Type Quantity from all the Objects of the specified Collection.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 2 | To specify Value Expression of Type Quantity. | Value | Yes |  | No |

---

## CollQtyTotalEx

This function returns the sum of the required Method of Type Quantity from all the Objects of the specified Collection.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier |  | Yes | Collection | No |
| 2 | To specify Value Expression of Type Quantity. | Value |  | Yes |  | No |
| 3 | To specify Value Expression of Type Quantity. | Value | String | No |  | No |

---

## CollSrcObj

This function evaluates the given expression in context of an object of the source collection from which a Walk is being evaluated.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the expression to be evaluated. | Value | Yes | No |

---

## EvaluateRuleSet

This function evaluates a Rule Set in the current context and returns the result as a Flag Set.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: FlagSet

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the Rule Set definition that is to be evaluated. | Identifier | Yes | Rule Set | No |

---

## FilterAmtTotal

This function returns the sum of the required Method of Type  Amount from all the Objects of a specified collection satisfying the given filter expression.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 2 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier | Yes | System Formulae | No |
| 3 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Value | Yes |  | No |

---

## FilterAmtTotalEx

This function returns the sum of the required Method of Type  Amount from all the Objects of a specified collection satisfying the given filter expression.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier |  | Yes | Collection | No |
| 2 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier |  | Yes | System Formulae | No |
| 3 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Value |  | Yes |  | No |
| 4 | To specify name of the identity to keep track of object id's | Value | String | No |  | No |

---

## FilterCount

This function returns the count of the objects in a Collection that has passed the filter.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Hybrid
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 2 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier | No | System Formulae | No |

---

## FilterCountEx

This function returns the count of the objects in a Collection that has passed the filter.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Hybrid
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier |  | Yes | Collection | No |
| 2 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier |  | No | System Formulae | No |
| 3 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Value | String | No |  | No |

---

## FilterNumTotal

This function returns the sum of the required Method of Type  Number from all the Objects of a specified collection satisfying the given filter expression.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 2 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier | Yes | System Formulae | No |
| 3 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Value | Yes |  | No |

---

## FilterNumTotalEx

This function returns the sum of the required Method of Type  Number from all the Objects of a specified collection satisfying the given filter expression.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier |  | Yes | Collection | No |
| 2 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier |  | Yes | System Formulae | No |
| 3 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Value |  | Yes |  | No |
| 4 | To specify name of the identity to keep track of object id's | Value | String | No |  | No |

---

## FilterQtyTotal

This function returns the sum of the required Method of Type  Quantity from all the Objects of a specified collection satisfying the given filter expression.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 2 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier | Yes | System Formulae | No |
| 3 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Value | Yes |  | No |

---

## FilterQtyTotalEx

This function returns the sum of the required Method of Type  Quantity from all the Objects of a specified collection satisfying the given filter expression.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier |  | Yes | Collection | No |
| 2 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier |  | Yes | System Formulae | No |
| 3 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Value |  | Yes |  | No |
| 4 | To specify name of the identity to keep track of object id's | Value | String | No |  | No |

---

## FilterValue

This function returns the value of a method at a particular position of the resultant collection which satisfies the given filter expression.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Object Collection
- **Execution Mode**: Hybrid

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Method/ System Formula. | Value | Yes |  | No |
| 2 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 3 | To specify Name of the Collection. | Value | Yes |  | No |
| 4 | To specify System formula without prefixing @@ must evaluate to Logical Value. | Identifier | Yes | System Formulae | No |

---

## FirstObj

This function evaluates the given parameter in the context of the first object in the Collection.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Method Name. | Value | Yes | No |

---

## FlagGetDescription

This function returns the description string associated with a given flag or rule in a Rule Set.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier for which the description is required. | Identifier |  | Yes | No |
| 2 | Specifies the rule identifier/expression that results in rule identifier for which the description is required. | Value | FlagSet | Yes | No |

---

## FlagGetValue

This function returns the logical value of a flag in a Flag Set.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier in dotted notation. To access the master aggregate rule, specify '*' as the rule identifier. | Identifier |  | Yes | No |
| 2 | Specifies the rule identifier/expression that results in rule identifier in dotted notation. To access the master aggregate rule, specify '*' as the rule identifier. | Value | FlagSet | Yes | No |

---

## FlagsCount

This function returns count of flags in a given level that match the value passed.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier of the parent rule. To perform this aggregation on the first level rules in the Rule Set, pass '*' as the rule identifier. | Identifier |  | Yes | No |
| 2 | Specifies the rule identifier/expression that results in rule identifier of the parent rule. To perform this aggregation on the first level rules in the Rule Set, pass '*' as the rule identifier. | Value | FlagSet | Yes | No |
| 3 | Specifies the logical flag value to check for. | Value | Logical | No | No |
| 4 | Specifies the logical flag value to check for. | Value | Logical | No | No |

---

## FlagsCountFromLevel

This function returns count of flags in a given level across parents that match the value passed.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier which indicates the level at which the aggregation is to be performed as well as the flag from which to start the aggregation. To perform aggregation on all rules at a certain level, the identifier of the first rule in that level must be specified. | Identifier |  | Yes | No |
| 2 | Specifies the rule identifier/expression that results in rule identifier which indicates the level at which the aggregation is to be performed as well as the flag from which to start the aggregation. To perform aggregation on all rules at a certain level, the identifier of the first rule in that level must be specified. | Value | FlagSet | Yes | No |
| 3 | Specifies the logical flag value to be matched. | Value | Logical | No | No |
| 4 | Specifies the logical flag value to be matched. | Identifier |  | No | No |

---

## FlagSetAND

This function performs an AND operation of two flag sets specified.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: FlagSet

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the first flag set to perform the AND operation. | Value | FlagSet | Yes | No |
| 2 | Specifies the first flag set to perform the AND operation. | Value | FlagSet | Yes | No |

---

## FlagSetOR

This function performs an OR operation of the two flag sets specified.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: FlagSet

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the first flag set to perform the OR operation. | Value | FlagSet | Yes | No |
| 2 | Specifies the first flag set to perform the OR operation. | Value | FlagSet | Yes | No |

---

## FlagsIsAllTrue

This function returns True if all the child rules (rules of next dimension) of a given rule are True.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier of the parent rule. To perform this aggregation on the first level rules in the Rule Set, pass '*' as the rule identifier. | Identifier |  | Yes | No |
| 2 | Specifies the rule identifier/expression that results in rule identifier of the parent rule. To perform this aggregation on the first level rules in the Rule Set, pass '*' as the rule identifier. | Value | FlagSet | Yes | No |
| 3 | Specifies whether to only include the immediate children of the parent rule or to include all rules in the hierarchy of the parent rule. Default is No/False i.e., only consider immediate children. To perform this aggregation on all rules in the Rule Set, pass '*' as the rule identifier and specify this value as True. | Value | Logical | No | No |

---

## FlagsIsAllTrueFromLevel

This function returns True if all the rules at a specified level across parent rules are True.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier which indicates the level at which the aggregation is to be performed as well as the flag from which to start the aggregation. To perform aggregation on all rules at a certain level, the identifier of the first rule in that level must be specified. | Identifier |  | Yes | No |
| 2 | Specifies the Flag Set value as an expression (Result of Rule Set evaluation). | Value | FlagSet | Yes | No |
| 3 | Specifies the Flag Set value as an expression (Result of Rule Set evaluation). | Identifier |  | No | No |

---

## FlagsIsAnyTrue

This function returns True if any of the child rules (rules of next dimension) of a given rule are True.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier of the parent rule. To perform this aggregation on the first level rules in the Rule Set, pass '*' as the rule identifier. | Identifier |  | Yes | No |
| 2 | Specifies the rule identifier/expression that results in rule identifier of the parent rule. To perform this aggregation on the first level rules in the Rule Set, pass '*' as the rule identifier. | Value | FlagSet | Yes | No |
| 3 | Specifies whether to only include the immediate children of the parent rule or to include all rules in the hierarchy of the parent rule. Default is No/False i.e., only consider immediate children. | Value | Logical | No | No |

---

## FlagsIsAnyTrueFromLevel

This function returns True if any of the rules at a specified level across parent rules are True.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier which indicates the level at which the aggregation is to be performed as well as the flag from which to start the aggregation. To perform aggregation on all rules at a certain level, the identifier of the first rule in that level must be specified. | Identifier |  | Yes | No |
| 2 | Specifies the Flag Set value as an expression (Result of Rule Set evaluation). | Value | FlagSet | Yes | No |
| 3 | Specifies the Flag Set value as an expression (Result of Rule Set evaluation). | Identifier |  | No | No |

---

## FlagsListDescription

This function returns a string that contains the descriptions of the immediate child rules for the parent rule identifier. The strings are separated by the separator character.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the parent rule identifier/expression that results in rule identifier. To perform this operation on the first level rules in the Rule Set, pass '*' as the rule identifier. | Identifier |  | Yes | No |
| 2 | Specifies the parent rule identifier/expression that results in rule identifier. To perform this operation on the first level rules in the Rule Set, pass '*' as the rule identifier. | Value | FlagSet | Yes | No |
| 3 | Specifies flag value (True/False) for which the descriptions must be extracted (Default is Yes). | Value | Logical | No | No |
| 4 | Specifies flag value (True/False) for which the descriptions must be extracted (Default is Yes). | Value | String | No | No |

---

## FlagsListDescriptionFromLevel

This function returns a string that contains the descriptions of all rules at the level specified by the rule identifier (across parents). The strings are separated by the separator character. Duplicate descriptions are automatically ignored and only unique ones are taken.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier to indicate the level and from where to start extracting the description list. | Identifier |  | Yes | No |
| 2 | Specifies the rule identifier/expression that results in rule identifier to indicate the level and from where to start extracting the description list. | Value | FlagSet | Yes | No |
| 3 | Specifies the flag value (True/False) for which the descriptions must be extracted (Default is Yes). | Value | Logical | No | No |
| 4 | Specifies the flag value (True/False) for which the descriptions must be extracted (Default is Yes). | Value | String | No | No |

---

## IsCollSrcObjChanged

This function returns TRUE if Source object is changed during a depth walk. Can be used to identify that we are still in depth walk of same source object

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsEmptyCollection

This function returns TRUE if the given collection is empty else returns FALSE.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection whose emptiness needs to get checked. | Identifier | Yes | Collection | No |
| 2 | To specify Name of the Collection whose emptiness needs to get checked. | Value | No |  | No |
| 3 | To specify Source Object For e.g., AllLedgerEntries. | Value | No |  | No |

---

## IsFirstObj

This function returns TRUE if the current object is the first Object in the Collection else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsLastObj

This function returns TRUE if the current object is the last Object in the Collection else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsRemoved

This function returns TRUE if the current object is marked as removed in the Collection else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## ItemSerial

This function helps to auto generate Line Numbers starting from 0. It does not accept any parameter and returns Numerical value. It differs from other such function by its starting number i.e. 0.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## LastObj

This function evaluates the given parameter in the context of the last object in the Collection.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Method/ System Formula. | Value | Yes | No |

---

## LineObject

This function evaluates the given parameter in the context of the Object associated at the Line Level.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Valid TDL expression. | Value | Yes | No |

---

## LoopCollObj

This function is used to retrieve the value of a method/ field of the current object in the loop collection.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify One or more parameter representing any Collection name or Method Name. | Value | Yes | No |

---

## Name

This function returns the current object name.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## NameGetValue

This function returns the string value for a given Name Set and Name Identity.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the name identifier/expression that results in rule identifier. | Identifier | Yes |  | No |
| 2 | Specifies the name identifier/expression that results in rule identifier. | Identifier | Yes | Name Set | No |

---

## NextObj

This function evaluates the given parameter in the context of the next/subsequent object in the Collection.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Method or Formula or Storage. | Value | Yes | No |

---

## NumFilledItems

This function is used to identify the number of non empty objects in a given collection. For example, if there are 5 Ledgers created in a company and entries are made for only 3 ledgers, $$NumFilledItems of Ledger Collection returns 3.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Hybrid
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | No | Collection | No |
| 2 | To specify Name of the Collection. | Value | No |  | No |

---

## NumGetValue

This function returns the integer value of an element in a Num Set.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier/expression that results in rule identifier. | Identifier |  | Yes | No |
| 2 | Specifies the rule identifier/expression that results in rule identifier. | Value | NumSet | Yes | No |

---

## NumItems

This function returns the count of Objects present in the given collection.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Hybrid
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | No | Collection | No |
| 2 | To specify Name of the Collection. | Value | No |  | No |

---

## ObjBudget

This function returns the 'Budget' Object Parameter in the current context.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## ObjCompany

Returns the 'Company' Object Parameter in the current context

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## ObjectOf

This function allows evaluating any formula in the context of the data object associated with a UI object, that is specified by a Definition type and Access Name.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify Definion Type; Can accept either Part or Line; these are only two which supports AccessName. | Keyword |  | Yes | Desc Type | Border, Button, Collection, Color, Colour, COM Interface, Field, Form, Function, Import File, Import Object, Include, Key, Key Value Map, Line, Menu, Name Set, Notification, Object, Object Map, Part, Progress Bar, QueryBox, Report, Resource, Rule Set, Style, System, Table, Variable | No |
| 2 | To specify Definion Type; Can accept either Part or Line; these are only two which supports AccessName. | Value | String | Yes |  |  | No |
| 3 | To specify Formula which needs to be evaluated in the Access Object's context. | Value |  | Yes |  |  | No |

---

## ObjFromDate

This function returns the 'From date' Object Parameter in the current context.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## ObjScenario

This function returns the 'Scenario' Object Parameter in the current context.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## ObjToDate

This function returns the 'To Date' Object Parameter in the current context.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## ObjValMethod

This function returns the 'Valuation Method' Object Parameter in the current context.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## Owner

This function evaluates the given parameter in the context of the owner object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Method Name. | Value | Yes | No |

---

## PartNumber

This function fetches the Part number of a stock item.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## PrevObj

This function evaluates the given parameter in the context of the previous object in the Collection.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Valid TDL expression. | Value | Yes | No |

---

## ReportObject

This function evaluates the given parameter in the context of the Object associated at the Report Level.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Valid TDL expression. | Value | Yes | No |

---

## ReptField

This function extracts the value of the method at a specified line number within the collection wherein the method to be retrieved must be a repeated method such as Address.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Collection. | Identifier | Yes | Collection | No |
| 2 | To specify Line Number. | Value | Yes |  | No |
| 3 | To specify Line Number. | Value | No |  | No |

---

## ReqObject

This function evaluates the given expressions in the context of the Requestor Data Object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Valid TDL expression. | Value | Yes | No |

---

## ReqOwner

This function evaluates the given expressions in the context of the Requestor Interface Object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object Collection
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Valid TDL expression. | Value | Yes | No |

---

## SetAutoColumns

This function which needs to be triggered at the Form level with a Dummy option enables the current report to contain multiple columns depending upon the parameters passed.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the List of Variables separated by Comma. | Value | No | No |

---

## Type

This function returns the current Object Type.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object Collection
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---
