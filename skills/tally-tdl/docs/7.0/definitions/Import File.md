# Import File Definition

> **Version**: 7.0

Reference documentation for all entries in the **Import File** definition.

> **Total Entries**: 30

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [BackUp](#backup)
- [Combine](#combine)
- [Empty](#empty)
- [Excel Sheet Name](#excel-sheet-name)
- [Field](#field)
- [Format](#format)
- [Full Object](#full-object)
- [JSONTag](#jsontag)
- [Local Formula](#local-formula)
- [Modifies](#modifies)
- [Object](#object)
- [On](#on)
- [Option](#option)
- [Predefined Map](#predefined-map)
- [Repeat](#repeat)
- [Response Report](#response-report)
- [Set](#set)
- [Show Preview](#show-preview)
- [Space Bottom](#space-bottom)
- [Space Top](#space-top)
- [Switch](#switch)
- [Sync Rules](#sync-rules)
- [SyncRulesAfterSave](#syncrulesaftersave)
- [Use](#use)
- [User Defined Map](#user-defined-map)
- [Width](#width)
- [XSLT](#xslt)

---

## Add

The Add modifiers are used in a definition to Add an attribute to the Definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | The Add modifiers are used in a definition to Add an attribute to the Definition. | Yes | No | No |

---

## Replace

The Replace modifiers are used in a definition to Replace an attribute to the Definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | The Replace modifiers are used in a definition to Replace an attribute to the Definition. | Yes | No | No |

---

## Delete

The Delete modifiers are used in a definition to Delete an attribute to the Definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | The Delete modifiers are used in a definition to Delete an attribute to the Definition. | Yes | No | No |

---

## BackUp

This attribute is used to check whether the system takes a backup before import or not.

### Meta

- **Aliases**: BackUp
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Indicate whether to take a backup before import or not. | Value | Logical | Yes | No | No | No |
| 2 | Specify destination path for backup, if the first sub-attribute value is yes. | Value | String | No | No | No | No |

---

## Combine

This is used to specify whether to total/combine values for duplicate records based on a condition.

### Meta

- **Aliases**: Combine, Total, Totals
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | No | No | No | No |

---

## Empty

This attribute discards a particular record based on condition.

### Meta

- **Aliases**: Empty, Empty if, Empty on
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Any expression that retruns the logical value. | Value | Logical | No | No | No | No |

---

## Excel Sheet Name

This attribute is used to capture the name of the Excel sheet.

### Meta

- **Aliases**: Excel Sheet Name
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Any expression that specifies the Excel sheet name. | Value | String | Yes | No | No | No |

---

## Field

This attribute specifies the field name to be imported and the associated width.

### Meta

- **Aliases**: Field, Fields, Left Field, Left Fields
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the Field/Column Name for the data to be imported. | Identifier |  | Yes | Yes | Field | No |
| 2 | Width of the field in terms of no of charachers. | Value | Long | No | Yes |  | No |

---

## Format

Specifies the format of the file to be imported.

### Meta

- **Aliases**: Format
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It specifies the file format. | Identifier | No | No | No | No |

---

## Full Object

This is used to specify whether the entire object is to be imported or not.

### Meta

- **Aliases**: Full Object
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which accepts either Yes or No. | Value | Logical | No | No | No | No |

---

## JSONTag

To specify the tag name in the exported XML file.

### Meta

- **Aliases**: JSONTag, XMLTag
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the XML tag. | Value | String | No | No | No | No |

---

## Local Formula

This is used to specify a local formula within the Import File Definition.

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

## Modifies

To modify the values while importing.

### Meta

- **Aliases**: Modifies, Modify
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the name of the storage. | Identifier | Yes | Yes | No |
| 2 | It specifies the value to storage. | Identifier | No | No | No |

---

## Object

Specifies the Import Object name which in turn is associated with an Internal Object.

### Meta

- **Aliases**: Object, Objects
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Expression specifying the name of the Import Object which is to be defined. | Identifier | No | No | No | Import Object | No |

---

## On

On keyword is used to specify a list of actions to be executed on the occurance of an Event

### Meta

- **Aliases**: On
- **Type**: Event List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | On keyword is used to specify a list of actions to be executed on the occurance of an Event | Yes | No | No |

---

## Option

Option is an attribute which can be used by various definitions, to provide a conditional result in a program.

### Meta

- **Aliases**: Option, Options
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This specifies the name of the Optional Import File. | Identifier |  | Yes | Yes | Import File | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

---

## Predefined Map

This attribute is used to specify the complete location and name of Tally's predefined map file.

### Meta

- **Aliases**: Predefined Map
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify keyword/sysname at Voucher or Master level. | Value |  | Yes | No | No | No |
| 2 | Specify master type name, voucher type name, or any other voucher type. | Value | String | Yes | No | No | No |
| 3 | Specify master type name, voucher type name, or any other voucher type. | Value | String | Yes | No | No | No |

---

## Repeat

To specify whether the import file contains repeated records or not.

### Meta

- **Aliases**: Repeat
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | No | No | No | No |

---

## Response Report

Specify name of the report which can be used for creating the Response XML or Response JSON. This will be used for creating response string for SOAP Requests.

### Meta

- **Aliases**: Response Report
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to that will be used for creating response XML or response JSON. | Identifier | No | Yes | No | Report | No |

---

## Set

This is used to modify or set the storage value while importing.

### Meta

- **Aliases**: Set, Set as
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | Specifies the name of the storage. | Identifier | Yes | Yes | No |
| 2 | It specifies the value to storage. | Value | No | No | No |

---

## Show Preview

This attribute is used to check whether to show a preview or not.

### Meta

- **Aliases**: Show Preview
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Any logical expression to show a preview or not | Value | Logical | Yes | No | No | No |

---

## Space Bottom

The attribute specifies the no of characters to be excluded from the end of the file.

### Meta

- **Aliases**: Space Bottom
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It should be no of characters. | Value | Long | No | No | No | No |

---

## Space Top

The attribute specifies the no of characters to be excluded from the beginning of  the file.

### Meta

- **Aliases**: Space Top
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It should be no of characters. | Value | Long | No | No | No | No |

---

## Switch

'Switch' attribute is similar to the Option attribute but reduces code complexity and improves the performance. The Switch are grouped using a label Once a condition is satisfied from one group, switch won't  check further conditions from the same group.  It will evaluate the conditions from the other groups specified, if any.

### Meta

- **Aliases**: Switch
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This can be any string combination used to group. | Identifier |  | Yes | Yes |  | No |
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | Yes | Yes | Import File | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | No | No |  | No |

---

## Sync Rules

Specify the Server / Client Rule.

### Meta

- **Aliases**: Sync Rules
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the name of the rule. | Value | String | No | No | No |

---

## SyncRulesAfterSave

After 'SAVE' the voucher, that voucher will sync with Server.

### Meta

- **Aliases**: SyncRulesAfterSave
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | No | No | No | No |

---

## Use

The USE keyword is used in a definition to reuse an existing definition.

### Meta

- **Aliases**: Use
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It acts as label for grouping. | Identifier | No | Yes | Import File | No |

---

## User Defined Map

This attribute is used to specify the complete location and the name of the user-defined map file.

### Meta

- **Aliases**: User Defined Map
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify keyword/sysname at the application or Company level. | Value |  | Yes | No | No | No |
| 2 | Specify the file path or company map key according to the first sub-attribute | Value | String | Yes | No | No | No |

---

## Width

Specifies the total size of one record.

### Meta

- **Aliases**: Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a valid string. | Value | Long | No | No | No | No |

---

## XSLT

Specifies the XSLT file name for transformation while xml import.

### Meta

- **Aliases**: XSLT
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the Xslt file with the path. | Value | String | No | No | No | No |

---
