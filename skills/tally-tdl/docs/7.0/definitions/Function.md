# Function Definition

> **Version**: 7.0

Reference documentation for all entries in the **Function** definition.

> **Total Entries**: 9

## Table of Contents

- [Action](#action)
- [Fetch Object](#fetch-object)
- [List Var](#list-var)
- [Local Formula](#local-formula)
- [Object](#object)
- [Parameter](#parameter)
- [Return](#return)
- [Static Variable](#static-variable)
- [Variable](#variable)

---

## Action

Actions can be dynamically executed by specifying the Action keyword and / or Action parameters as expressions. This is even possible for those actions which inherently do not support expressions as its parameters.

### Meta

- **Aliases**: Action
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The 'Action' that requires to be executed is mentioned here. Eg. Display / Execute / Export, etc.  This capability can be used for any of the following actions - a) Global Actions b) Function Actions which are simple in nature. | Identifier | Yes | Yes |  |  | No |
| 2 | These are the parameters which are supplied to the Action which can be provided as expressions. | Keyword | No | Yes | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 3 | These are the parameters which are supplied to the Action which can be provided as expressions. | Value | No | Yes |  |  | No |

---

## Fetch Object

Enables Dynamic fetch of Objects at the function level.

### Meta

- **Aliases**: Fetch Object
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The Object Type which needs to be fetched like Ledger,Voucher etc. | Identifier | Yes | Yes | Object | No |
| 2 | The expression which evaluates to the identifier  of the Object to be fetched. | Value | Yes | No |  | No |
| 3 | The expression which evaluates to the identifier  of the Object to be fetched. | Value | No | Yes |  | No |

---

## List Var

This attribute is used to declare the List Variables at the function scope. We can have an inline declaration by additionally specifying the datatype and the count of elements in the list.

### Meta

- **Aliases**: List Var, List Variable
- **Type**: Variable List

### Parameters

_No parameters._

---

## Local Formula

This is used to specify a local formula within the function block.

### Meta

- **Aliases**: Local Formula
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | The name of the Local Formula. | Identifier | Yes | Yes | No |
| 2 | The expression which needs to be evaluated. | Value | Yes | No | No |

---

## Object

Function will inherit the Object context of the caller. This can be overridden by using the attribute Object for function definition. This now becomes the current object for the function.

### Meta

- **Aliases**: Object, Objects
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It is the type of the object. | Identifier |  | Yes | Yes | No | Object | No |
| 2 | It is the unique identifier of the object. | Value | String | No | No | No |  | No |

---

## Parameter

This attribute is used to specify the parameters which are passed to the function. This can be referred within the function as variables. It is possible to specify the DataType and a default value for the parameters. In case a default value is provided there is an option for the caller to skip the parameter value to be passed.

### Meta

- **Aliases**: Parameter, Parameters
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It is the name of the Variable which holds the parameter sent by the caller of the Function. | Identifier | Yes | Yes | Variable |  |  | No |
| 2 | It is the Data type of the Variable sent by the caller of the Function | Keyword | Yes | Yes |  | Method | Aggregate, Amount, Date, DateTime, Due Date, Duration, FlagSet, Logical, Long, Number, NumSet, Quantity, Rate, Rate of Exchange, String, Sys Id, Time | No |
| 3 | It is the Data type of the Variable sent by the caller of the Function | Value | No | No |  |  |  | No |

---

## Return

This statement is used to return the flow of control to the calling program with or without returning a value. When return is used the execution of the function is terminated and the calling program continues from where it had called the function.

### Meta

- **Aliases**: Return, Returns
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This value is optional.The value to be returned is specified here,Else it returns a void. | Keyword | Yes | Yes | No | Method | Aggregate, Amount, Date, DateTime, Due Date, Duration, FlagSet, Logical, Long, Number, NumSet, Quantity, Rate, Rate of Exchange, String, Sys Id, Time | No |

---

## Static Variable

This attribute is used to declare a Variable as Static.By doing so,the value is persisted between successive calls to a Function.

### Meta

- **Aliases**: Static Variable
- **Type**: Variable List

### Parameters

_No parameters._

---

## Variable

This attribute is used to declare Simple Variables at the function scope.These are the variables which are used inside the function for some intermediate calculations.If the datatype is specified it is treated as inline.

### Meta

- **Aliases**: Variable, Variables
- **Type**: Variable List

### Parameters

_No parameters._

---
