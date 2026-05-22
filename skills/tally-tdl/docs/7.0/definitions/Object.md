# Object Definition

> **Version**: 7.0

Reference documentation for all entries in the **Object** definition.

> **Total Entries**: 9

## Table of Contents

- [Act As](#act-as)
- [Action](#action)
- [Collection](#collection)
- [Current Collection](#current-collection)
- [Current Report](#current-report)
- [Full Width](#full-width)
- [Local Formula](#local-formula)
- [Storage](#storage)
- [Use](#use)

---

## Act As

This attribute allows setting the characteristics of the object whether it is Default / Action / Label / Config / On The Fly / External Action.

### Meta

- **Aliases**: Act As, Behave As
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the keyword to define the characteristic of the object. The allowed keywords are Default / Action / Label / Config / On The Fly / External. | Keyword | Yes | Yes | No | Behavior Type | Action, Config, Default, External Action, Label, On The Fly | No |

---

## Action

This attribute allows specifying a group of actions that can be conducted when the object is selected.

### Meta

- **Aliases**: Action
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is a string value to act as label. Action with same label would be grouped and executed together when the label is called. | Identifier | Yes | Yes |  |  | No |
| 2 | This is a Global or Object-specific TDL Actions. | Keyword | Yes | Yes | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 3 | This is a Global or Object-specific TDL Actions. | Value | No | Yes |  |  | No |

---

## Collection

It is used for temporary purpose while restoring/migrating/importing data and similar usage.This is mainly used to define the collection inside a User defined Object.

### Meta

- **Aliases**: Collection, Collections
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the collection name. Its like aggregate UDF but used for temporary purpose. This is available in current instance of Tally and is destroyed once Tally is closed. | Identifier | Yes | Yes | ObjectField | No |
| 2 | It specifies the type of object for the collection in first SubAttribute. | Identifier | Yes | Yes | Object | No |

---

## Current Collection

This attribute specifies a collection at object level.

### Meta

- **Aliases**: Current Collection
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the collection to be used. | Identifier | Yes | Yes | No | Collection | No |

---

## Current Report

This attribute specifies a report at object level.

### Meta

- **Aliases**: Current Report
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be displayed. | Identifier | Yes | Yes | No | Report | No |

---

## Full Width

If expression is evaluated to true, the first column of the object will occupy entire width of the table. It will not show any other columns.

### Meta

- **Aliases**: Full Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify whether to use full width. | Value | Logical | Yes | No | No | No |

---

## Local Formula

This is used to specify a local formula within the Object.

### Meta

- **Aliases**: Local Formula
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The name of the Local Formula. | Identifier | Yes | Yes | ObjectField | No |
| 2 | The expression which needs to be evaluated. | Value | Yes | No |  | No |

---

## Storage

It is used for temporary purpose while restoring/migrating/importing data and similar usage.This is mainly used to define the methods/storage of a User defined Object.

### Meta

- **Aliases**: Storage
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It is the storage name. Its like UDF used for temporary purpose. This is available in current instance of Tally and is destroyed once Tally is closed. | Identifier | Yes | Yes | ObjectField |  |  | No |
| 2 | It specifies the data type for the current storage. | Keyword | Yes | Yes |  | Method | Aggregate, Amount, Date, DateTime, Due Date, Duration, FlagSet, Logical, Long, Number, NumSet, Quantity, Rate, Rate of Exchange, String, Sys Id, Time | No |

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
| 1 | It acts as label for grouping. | Identifier | Yes | Yes | Object | No |

---
