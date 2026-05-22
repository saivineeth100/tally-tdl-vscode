# Layout Function

> **Version**: 7.0

Reference documentation for all entries in the **Layout** function.

> **Total Entries**: 31

## Table of Contents

- [AltTable](#alttable)
- [Column](#column)
- [ColumnNumber](#columnnumber)
- [ContextKeyword](#contextkeyword)
- [CurrentTable](#currenttable)
- [CurrentTableObj](#currenttableobj)
- [DescName](#descname)
- [EditData](#editdata)
- [FieldColumn](#fieldcolumn)
- [FieldIndex](#fieldindex)
- [FieldKey](#fieldkey)
- [FieldLevel](#fieldlevel)
- [GetOnTheFlyString](#getontheflystring)
- [IsActionObject](#isactionobject)
- [IsConfigObject](#isconfigobject)
- [IsExternalActionObject](#isexternalactionobject)
- [IsFileTypeSupported](#isfiletypesupported)
- [IsLabelObject](#islabelobject)
- [IsOnTheFlyItemSelected](#isontheflyitemselected)
- [IsStartupValue](#isstartupvalue)
- [KeyExplode](#keyexplode)
- [Line](#line)
- [LineKey](#linekey)
- [PrevFld](#prevfld)
- [PrevFldTotal](#prevfldtotal)
- [Table](#table)
- [TableNumItems](#tablenumitems)
- [TableObj](#tableobj)
- [TplColumnObject](#tplcolumnobject)
- [TplLine](#tplline)
- [Value](#value)

---

## AltTable

This function returns method value from the first field table or second field table. If the First Field's Table object has the value then it returns the method value else it returns the method value from the second field's Table object.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the First Field name. | Identifier | Yes | Field | No |
| 2 | To specify the Second Field name. | Identifier | Yes | Field | No |
| 3 | To specify the Second Field name. | Value | Yes |  | No |

---

## Column

This function is used to check the number of columns in multi-column report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## ColumnNumber

This function is used to return the current column number in a multi-column report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## ContextKeyword

This function is used to get the title of the current Report or Menu which can be used to search the context sensitive /online help based on the report or Menu title.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This expression returns Logical value which decides whether the  if topmost report to be skipped if its in report context. If the value is specified as YES, then the title of the parent report is returned. If no report is active then the parameter is ignored. If the attribute Title is not specified in report definiton, then by default it returns the name of report definition. | Value | Logical | No | No |
| 2 | This expression returns Logical value which decides whether the  if topmost report to be skipped if its in report context. If the value is specified as YES, then the title of the parent report is returned. If no report is active then the parameter is ignored. If the attribute Title is not specified in report definiton, then by default it returns the name of report definition. | Value | Logical | No | No |

---

## CurrentTable

This function returns name of table currently shown in table. It is for usage when we use 'Change Table' action.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

_No parameters._

---

## CurrentTableObj

This function returns the method value of the selected object from the table associated with the currently focused field in the report.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression that evaluates to a method. | Value | Yes | No |

---

## DescName

This function provides the description or name of the UI object in which it is used. It is useful when certain titles are to be displayed in reports. To display the report name as a title, some fixed strings can be concatenated with the value returned from the function and used as a title.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## EditData

This function returns the Value of the Current Field. $$EditData will check if the current field is edited and returns the edited value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is the name of the field. | Identifier | No | Field | No |

---

## FieldColumn

This function returns the column number of the field. While counting the field columns it includes the sub fields also.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## FieldIndex

This function returns the index of the field. Index is maintained only for leaf level fields, for all others 0 is returned

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This expression returns Logical value which indicates whether to return index w.r.t to its parent field or line | Value | Logical | No | No |

---

## FieldKey

This functions evaluates the result of the expression in field hierarchy and returna key string

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the expression to be evaluated | Value | Yes | No |
| 2 | To specify the expression to be evaluated | Value | No | No |
| 3 | To specify the ordering of values form the hierarchy. By default ststem will generate key from Top-Bottom. By passing TRUE to this parameter the key will be generated in reverse order | Value | No | No |

---

## FieldLevel

This function returns the depth of the field. The depth/level starts from 1 at parent most field and incremented by 1 for every subsequent level

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## GetOnTheFlyString

This function returns the on-the-fly string entered by user.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## IsActionObject

This function returns whether object behaves as an action object in table. This depends upon 'Behave As' written at object level.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsConfigObject

This function returns whether object behaves as config object in table. This depends upon 'Behave As' written at object level.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsExternalActionObject

This function returns whether object behaves as External Config objectin table. This depends upon 'Behave As' written at object level.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsFileTypeSupported

This function checks whether the specified format / file extension is supported by the system. This is decided based on if any Open with program is registered against this File extension

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the file extension which needs to be checked for its support on the system | Value | String | Yes | No |

---

## IsLabelObject

This function returns whether object behaves as label object in table. This depends upon 'Behave As' written at object level.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsOnTheFlyItemSelected

This function is used to check if the item selected from the table is On The Fly object or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsStartupValue

This function is used to check wheteher the value is the original value or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which specifies the name of the field, line, part or form. | Value | No | No |

---

## KeyExplode

This function checks if the keys Alt + F1 Or Shift + Enter are pressed or not and returns the logical values 'yes' Or 'No' accordingly

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Line

This function gives the Object number of the current collection.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## LineKey

This functions evaluates the result of the expression in Line hierarchy and returna key string

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the expression to be evaluated | Value | Yes | No |
| 2 | To specify the separator to be used between result of two fields | Value | No | No |
| 3 | To specify the separator to be used between result of two fields | Value | No | No |

---

## PrevFld

The function $$PrevFld is used to extract the value of the filed in the previous field. This is useful in Multi column reports where this function is used to get the value of the previous field or to find the difference between two previous field. The function $$PrevFld without any parameter retrieves the value of previous field.   It can optionally accept a single parameter which specifies the field number the value of which is to be extracted.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Accepts an optional parameter of type Number | Value | Number | No | No |

---

## PrevFldTotal

The function $$PrevFldTotal is used to extract the total value of the previous fields. This is useful in Multi column reports. It does not accept any parameter and returns a value of type same as the type of previous fields.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

_No parameters._

---

## Table

This function returns the method value selected from the table which mentioned in the field using the field value.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Field name. | Identifier | Yes | Field | No |
| 2 | To specify the Method name. | Value | Yes |  | No |

---

## TableNumItems

This function returns the number of items in the table. This function is to be invoked from the field level only.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## TableObj

This function returns the Function Value / Method Value from the Table which is mentioned in the Field level attribute.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Field name. | Identifier | Yes | Field | No |
| 2 | To specify the Method/Function name. | Value | Yes |  | No |

---

## TplColumnObject

This function evaluates the given parameter in the context of the Object associated at the Current Column Object Level if available. Otherwise it will default to current object context.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Valid TDL expression. | Value | Yes | No |

---

## TplLine

This function gives the count of current object in the current collection.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## Value

This function refers to the value set in the field. The value set in the field is accessible within that field definition using this function. It also considers the values entered by the user.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Layout
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This specifies the index. | Value | No | No |

---
