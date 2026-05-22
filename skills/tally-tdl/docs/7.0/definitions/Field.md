# Field Definition

> **Version**: 7.0

Reference documentation for all entries in the **Field** definition.

> **Total Entries**: 88

## Table of Contents

- [Act On Table Element](#act-on-table-element)
- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Align](#align)
- [Alter](#alter)
- [ASCII Only](#ascii-only)
- [Auto](#auto)
- [Background](#background)
- [Border](#border)
- [Border3D](#border3d)
- [Bound](#bound)
- [Cancel](#cancel)
- [Case](#case)
- [Cell](#cell)
- [Cell Write](#cell-write)
- [Color](#color)
- [Common Table](#common-table)
- [Control](#control)
- [Cyclic Behavior](#cyclic-behavior)
- [Default Table Item](#default-table-item)
- [Display](#display)
- [DMPMode](#dmpmode)
- [Excel Formula](#excel-formula)
- [Fetch Object](#fetch-object)
- [FG Highlight](#fg-highlight)
- [Field](#field)
- [Fixed](#fixed)
- [Format](#format)
- [Full Width](#full-width)
- [Graph Label](#graph-label)
- [Graph Value](#graph-value)
- [Graph X Axis Legend Title](#graph-x-axis-legend-title)
- [Help](#help)
- [Indent](#indent)
- [Info](#info)
- [Invisible](#invisible)
- [Is ODBC Table](#is-odbc-table)
- [JSONTag](#jsontag)
- [KBLanguage](#kblanguage)
- [Key](#key)
- [Line](#line)
- [Local](#local)
- [Local Formula](#local-formula)
- [Max](#max)
- [Modifies](#modifies)
- [Notify](#notify)
- [Object](#object)
- [On](#on)
- [Option](#option)
- [Pre Printed](#pre-printed)
- [Pre Printed Border](#pre-printed-border)
- [Preaccept Object Map](#preaccept-object-map)
- [Print BG](#print-bg)
- [Print FG](#print-fg)
- [Print Style](#print-style)
- [Quick Search](#quick-search)
- [Read Only](#read-only)
- [Scale](#scale)
- [Scroll](#scroll)
- [Set](#set)
- [Set Always](#set-always)
- [Set By Condition](#set-by-condition)
- [Skip](#skip)
- [Skip Action](#skip-action)
- [Skip Cell](#skip-cell)
- [Skip Forward](#skip-forward)
- [Skip SysNames](#skip-sysnames)
- [Space Left](#space-left)
- [Space Right](#space-right)
- [Storage](#storage)
- [Style](#style)
- [Sub Form](#sub-form)
- [Sub Title](#sub-title)
- [Switch](#switch)
- [Table](#table)
- [Table Search](#table-search)
- [Tooltip](#tooltip)
- [Trigger](#trigger)
- [TriggerEx](#triggerex)
- [Type](#type)
- [Unique](#unique)
- [Use](#use)
- [Valid](#valid)
- [Variable](#variable)
- [Wide Space](#wide-space)
- [Width](#width)
- [XMLAttr](#xmlattr)

---

## Act On Table Element

This attribute allows specifying the action that should be performed when an object is selected from a Table.

### Meta

- **Aliases**: Act On Table Element
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This is to provide a condition. | Value | Logical | No | No |  |  | No |
| 2 | This is to provide action. The action would be executed if the condition is true. | Keyword |  | Yes | Yes | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 3 | This is to provide action. The action would be executed if the condition is true. | Value |  | No | Yes |  |  | No |

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

## Align

This attribute aligns the particular field as per the string formula stated.

### Meta

- **Aliases**: Align, Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the alignment for the content of the field. | Keyword | Yes | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Alter

Specifies the report name which is to be executed in alter mode based on the condition when Ctrl+E is hit in combination at the field.

### Meta

- **Aliases**: Alter
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be altered. | Identifier |  | Yes | Yes | Report | No |
| 2 | Condition to alter the report specified with the report name. | Value | Logical | No | No |  | No |

---

## ASCII Only

It restricts the user input in the field to ASCII characters (English characters) only irrespective of the keyboard language.

### Meta

- **Aliases**: ASCII Only
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | Yes | No | No | No |

---

## Auto

The values specified as parameters with the attribute Dynamic, are dynamically added to the table being displayed by the current field.

### Meta

- **Aliases**: Auto, Dynamic
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The string values to be added dynamically in the table. | Value | String | No | No | No |

---

## Background

This attribute sets the background color for the field.

### Meta

- **Aliases**: Background
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of the color. | Identifier | Yes | No | No | Color | No |

---

## Border

Specifies the border for the field.

### Meta

- **Aliases**: Border
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the Border. | Identifier |  | Yes | Yes | No | Border | No |
| 2 | This is an expression which evaluates to logical value. | Value | Logical | No | No | No |  | No |

---

## Border3D

It applies 3D border to the field.

### Meta

- **Aliases**: Border3D
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Bound

This attribute is used typically in auto column reports to restrict the maximum and mimimum width of the field.

### Meta

- **Aliases**: Bound
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Separator Char | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It is used to specify the Lower Bound of the width. | Value | Long | Yes | No | No |  | No |
| 2 | It is used to specify the Upper Bound of the width. | Value | Long | No | No | No | ',' | No |

---

## Cancel

The inactive attribute is used, when the defined field is to be excluded from processing under certain conditions.

### Meta

- **Aliases**: Cancel, Inactive
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which evaluates to either  yes or no. | Value | Logical | No | No | No | No |

---

## Case

Specifies the case of the text contained in the field.

### Meta

- **Aliases**: Case
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the type of the case. Ie, Title case, normal etc. | Keyword |  | Yes | Yes | No | Case | All Capital, All Lower, First Upper Case, Lower Case, Normal, Proper Case, Small Case, Title Case, Title Case Exact, Upper Case | No |
| 2 | To specify condition whether to user can toggle the case or not. Default value is Yes i.e. case for any field can be toggled unless specified. | Value | Logical | No | No | No |  |  | No |

---

## Cell

Specifies the number of cells to be occupied for the field content in the excel sheet in case of excel export.

### Meta

- **Aliases**: Cell, Cells
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It accepts any numerical value. | Value | Long | Yes | No | No | No |

---

## Cell Write

Enables writing a cell in the Excel file,before the whole information gets written.

### Meta

- **Aliases**: Cell Write
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | Yes | No | No | No |
| 2 | The Logical Value either Yes/No - to specify whether to set focus while writing data to cell, Default value is No | Value | Logical | No | No | No | No |

---

## Color

Specifies the fore color of the content of the field.

### Meta

- **Aliases**: Color, Shade
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the color. | Identifier | Yes | No | No | Color | No |

---

## Common Table

If the attribute Common Table is set Yes, then the same memory is used to access the table for each instance of the field, hence reducing the memory required for the application drastically.

### Meta

- **Aliases**: Common Table
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | Yes | No | No | No |

---

## Control

This attribute pops up a message box with the content as specified in the String Expression when the an invalid value is entered in the field as per condition specified .

### Meta

- **Aliases**: Control
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the message to be displayed in the message box. | Identifier |  | Yes | Yes | System Formulae | No |
| 2 | It is a logical condition which specifies the validation condition. | Value | Logical | Yes | No |  | No |

---

## Cyclic Behavior

This attribute allows the field to regather the table when the values are changed for the Table.

### Meta

- **Aliases**: Cyclic Behavior, Process Change Table
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is to provide logical value. | Value | Logical | Yes | Yes | No | No |

---

## Default Table Item

This attribute facilitates to position the focus of cursor in a Table associated with the field. In the absence of the condition; the focus of the cursor is placed to the first item in the Table.

### Meta

- **Aliases**: Default Table Item
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an expression evaluates to a string in the Table. | Value | Logical | No | No | No | No |

---

## Display

Specifies the report name which is to be executed in Display mode based on the condition when Enter key is hit at the line.

### Meta

- **Aliases**: Display
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be displayed. | Identifier |  | Yes | Yes | Report | No |
| 2 | Condition to display the report specified with the report name. | Value | Logical | No | No |  | No |

---

## DMPMode

Specify the Dot matrix mode to be used for printing. This is applicable only for dot matrix mode of printing (and ignored in case of other printing modes.

### Meta

- **Aliases**: DMPMode
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Values allowed under this are: 'Normal', 'Bold', 'Italics', 'Underline', 'Condensed', 'Enlarged', 'DoubleLine' | Value | String | No | No | No | No |

---

## Excel Formula

Specifies the excel formula that needs to be inserted in the excel cell while exporting.

### Meta

- **Aliases**: Excel Formula
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | String Expression which will be set as excel formula. | Value | String | Yes | No | No | No |

---

## Fetch Object

This attribute is used to Fetch Object values dynamically based on current field values.

### Meta

- **Aliases**: Fetch Object
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the object type identifier. | Identifier | Yes | Yes | Object | No |
| 2 | This can be any of the expression. | Value | Yes | No |  | No |
| 3 | This can be any of the expression. | Value | No | Yes |  | No |

---

## FG Highlight

This attribute allows you to highlight specific words in a field with a defined style and color.

### Meta

- **Aliases**: FG Highlight
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It evaluates to an expression which defines the text to be highlighted. | Value | String | Yes | No |  | No |
| 2 | To specify the style to apply for rendering the highlighted text. | Identifier |  | Yes | No | Style | No |
| 3 | To specify the style to apply for rendering the highlighted text. | Identifier |  | Yes | No | Color | No |

---

## Field

It specifies the field name under the field definitions,where a field can consist of multiple fields within it.

### Meta

- **Aliases**: Field, Fields, Left Field, Left Fields
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | List of field names. | Identifier |  | Yes | Yes | Field | No |
| 2 | This expression evaluates to a Logical value. | Value | Logical | No | Yes |  | No |

---

## Fixed

The attribute Fixed when used in the field does not allow the user to change the value of the field.

### Meta

- **Aliases**: Fixed
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Format

Specifies the format for the content of field.

### Meta

- **Aliases**: Format
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | String defining the format of the value of the field. | Value | String | No | No | No | No |

---

## Full Width

Specifies whether the field will occupy the remaining width in the line.

### Meta

- **Aliases**: Full Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Graph Label

Specifies whether the field value serves as the x-axis Label for the graph.

### Meta

- **Aliases**: Graph Label
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Graph Value

Specifies whether the field value serves as the x-axis values for the graph.

### Meta

- **Aliases**: Graph Value
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Graph X Axis Legend Title

This attribute specifies the graph x axis legend title. The default value for this attribute is the description name of the field.

### Meta

- **Aliases**: Graph X Axis Legend Title
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies X Axis Legend title to be displayed. | Value | String | No | Yes | No | No |

---

## Help

This helps to get the help of the area depending upon the context we are in. Specifies the index / id of the help file.

### Meta

- **Aliases**: Help
- **Type**: Dual List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the index / id of the help file for help. | Value | Long | Yes | No | No |
| 2 | Expression that returns the GUID of the addon/module for invoking help | Value | String | No | No | No |

---

## Indent

Specifies an indentation for the field. This formula can decide as to what extent each instance of the field has to be indented from the initial place.

### Meta

- **Aliases**: Indent
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Number of characters to move from left. | Value | Number | No | No | No | Yes |

---

## Info

Specifies the value to be displayed in the field and overwrites the value specifed with 'Set as'

### Meta

- **Aliases**: Info
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | String Expression whose value is to be set in the field | Value | No | No | No | No |

---

## Invisible

It specifies the condition on which the field should be invisible.

### Meta

- **Aliases**: Invisible
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The condition which evaluates to either Yes/No. | Value | Logical | No | No | No | No |

---

## Is ODBC Table

It controls the Display type for the Table specified with the field with the Table Attribute.

### Meta

- **Aliases**: Is ODBC Table, Show Table
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Permissible Values are Always,On Error,On First Key,Never & Default | Keyword | No | Yes | No | Table Type | Always, Always and Never Hide, Default, Never, On Blank, On Empty, On Error, On First Key | No |

---

## JSONTag

To specify the tag name for the field in the exported JSON/XML file. In the absence of this attribute, the tag name defaults to the definition name.

### Meta

- **Aliases**: JSONTag, XMLTag
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the JSON/XML tag. | Value | String | No | No | No | No |

---

## KBLanguage

This is used to set the Language id for the field.

### Meta

- **Aliases**: KBLanguage
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the language id. | Value | Long | No | No | No | No |

---

## Key

Lists the keys associated with the field.

### Meta

- **Aliases**: Key, Keys
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the key. | Identifier | No | Yes | Key | No |

---

## Line

This attribute is used to display more than one line in a field.  By default maximum of 1 line gets displayed.

### Meta

- **Aliases**: Line, Lines, Top Line, Top Lines
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the number of lines in number directly or using a variable. | Value | Long | No | No | No | No |

---

## Local

The Local attribute is used in the context of the definition to set local value within the scope of that definition only.

### Meta

- **Aliases**: Local
- **Type**: Local List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | The Local attribute is used in the context of the definition to set local value within the scope of that definition only. | Yes | No | No |

---

## Local Formula

This is used to specify a local formula within the Field.

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

## Max

This attribute specifies the maximum number of characters that can be entered in the current field.Minimum no. of characters is zero and maximum is 972

### Meta

- **Aliases**: Max, Maximum
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a numerical value which is less than 972. | Value | Long | Yes | No | No | No |

---

## Modifies

This attribute is used to update / modify the value of the variable . The value can variable value can be modified either based on the field's acceptance or form's acceptance.

### Meta

- **Aliases**: Modifies, Modify
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the variable to be modified. | Identifier |  | Yes | No | No | Variable | No |
| 2 | Specifying Yes will modify the variable value as soon as the field gets accepted. No will update once the form is accepted. | Value | Logical | No | No | No |  | No |
| 3 | Specifying Yes will modify the variable value as soon as the field gets accepted. No will update once the form is accepted. | Value |  | No | No | No |  | No |

---

## Notify

Notifies the user based on the condition with a message/ prompt.

### Meta

- **Aliases**: Notify
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Formula whose value is to be displayed if the specified condition is satisfied. | Identifier |  | Yes | Yes | System Formulae | No |
| 2 | Condition on which the warning is given. | Value | Logical | Yes | No |  | No |

---

## Object

This is used to specify Object Association at the field level.

### Meta

- **Aliases**: Object, Objects
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the Object Type eg Ledger,Cost Center etc. | Identifier |  | Yes | Yes | No | Object | No |
| 2 | Specifies the Object Identifier formula. | Value | String | Yes | No | No |  | No |

---

## On

ON keyword is used to specify a list of Actions to be executed on the occurance of an Event.

### Meta

- **Aliases**: On
- **Type**: Event List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | ON keyword is used to specify a list of Actions to be executed on the occurance of an Event. | Yes | No | No |

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
| 1 | This specifies the name of the Optional Field. | Identifier |  | Yes | Yes | Field | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

---

## Pre Printed

Specifies whether the static text will be preprinted for the printing.

### Meta

- **Aliases**: Pre Printed
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Pre Printed Border

Specifies whether the border for the field will be preprinted for the printing.

### Meta

- **Aliases**: Pre Printed Border
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Preaccept Object Map

This attribute is used to call the object map before the field accept.

### Meta

- **Aliases**: Preaccept Object Map
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to call the object map definition before the field accept. | Identifier |  | Yes | Yes | Object Map | No |
| 2 | This sub-attribute is used to specify the logical expression, which is to be evaluated, if yes, calls object map. | Value | Logical | No | No |  | No |

---

## Print BG

Specifies the background color of the field in print mode.

### Meta

- **Aliases**: Print BG
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the background color of the field in print mode. | Identifier | No | No | No | Color | No |

---

## Print FG

Specifies the foreground color of the field in print mode.

### Meta

- **Aliases**: Print FG
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the foreground color of the field in print mode. | Identifier | No | No | No | Color | No |

---

## Print Style

This attribute sets the style of font for the field to be printed on the printer.

### Meta

- **Aliases**: Print Style
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Style name in which the value is to be printed in print mode. | Identifier | No | No | No | Style | No |

---

## Quick Search

It allows the search of the content of the value present in the field by using an alphabet key press.

### Meta

- **Aliases**: Quick Search
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Read Only

Specifies whether the field content is readonly or not based on the condition.

### Meta

- **Aliases**: Read Only
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Condition specifing the editablity of the field value. | Value | Logical | No | No | No | No |

---

## Scale

This attribute can be used to specify the scale factor for the value displayed in the field which can be either hundreds,thousands,crores etc.

### Meta

- **Aliases**: Scale
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the scale factor for the value displayed in the field. | Value | No | No | No | No |

---

## Scroll

Specifies whether the field can be scrolled horizontally or not.

### Meta

- **Aliases**: Scroll, Scrolled
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Set

This attribute sets the value to be displayed / printed by the field.

### Meta

- **Aliases**: Set, Set as
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the value to be displayed. | Value | No | No | No | No |

---

## Set Always

This attribute is used to refresh the values in the field each time the values in the variables / fields it refers to get affected / changed.

### Meta

- **Aliases**: Set Always
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Set By Condition

Specifies the value that is set to the field based on the condition.

### Meta

- **Aliases**: Set By Condition
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Value to be set. | Value | Logical | Yes | No | No |
| 2 | Condition on which the value is set. | Value |  | Yes | No | No |

---

## Skip

This attribute causes the cursor to skip the particular field and hence, the value in the field cannot be altered by the user, even if the report is in Create or Alter mode.

### Meta

- **Aliases**: Skip, Skip on
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which evaluates to either  yes or no. | Value | Logical | No | No | No | No |

---

## Skip Action

This attribute facilitates to position the focus of cursor in a Table associated with the field. Its evaluated if 'Default table item' not specified or condition fails.

### Meta

- **Aliases**: Skip Action, Skip Actions
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Skip Cell

This attribute causes the field to skip the particular field during export

### Meta

- **Aliases**: Skip Cell, Skip Cells
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which evaluates to either  yes or no. | Value | Logical | No | No | No | No |

---

## Skip Forward

Skips the field forward. When backsapce is hit from the next field then focus moves to this field.

### Meta

- **Aliases**: Skip Forward
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Logical Condition which controls the behavior. | Value | Logical | No | No | No | No |

---

## Skip SysNames

This attribute when enabled will not store the system names if selected from the table values by the user.

### Meta

- **Aliases**: Skip SysNames, Skip System Names
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Space Left

The attribute specifies space to be left on the left of the Field.This space is additional to the field width.

### Meta

- **Aliases**: Space Left
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the left margin. | Value | Number | No | No | No | Yes |

---

## Space Right

The attribute specifies space to be left on the right of the Field.This space is additional to the field width.

### Meta

- **Aliases**: Space Right
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the right margin. | Value | Number | No | No | No | Yes |

---

## Storage

Specifies the method of the object where the field value is to be saved.

### Meta

- **Aliases**: Storage
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the method where the value to be stored. | Identifier | Yes | Yes | No |  | No |
| 2 | Specifies the complete path of the Object whose method is altered eg Ledger Entries | Identifier | No | Yes | No | Collection | No |
| 3 | Specifies the complete path of the Object whose method is altered eg Ledger Entries | Value | No | No | No |  | No |

---

## Style

Specifies the style of content of the field.

### Meta

- **Aliases**: Style
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It determines the appearance of the text to be displayed by using a font scheme. | Identifier | No | No | No | Style | No |

---

## Sub Form

Specifies the report name which is to be executed when enter key is hit based on the condition.

### Meta

- **Aliases**: Sub Form, Sub Forms
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Report to be triggred when enter key is hit. | Identifier |  | Yes | Yes | Report | No |
| 2 | Condition on which the Form will be triggered. | Value | Logical | No | No |  | No |

---

## Sub Title

It specifies whether the field acts as a sub-title or not.

### Meta

- **Aliases**: Sub Title
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

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
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | Yes | Yes | Field | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | No | No |  | No |

---

## Table

Specifies the table that is to be displayed for selection of value based on the condition specified.

### Meta

- **Aliases**: Table, Tables
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Table to be listed based on condition. | Identifier |  | Yes | Yes | Collection | No |
| 2 | It is a logical condition which specifies the validation condition. | Value | Logical | No | No |  | No |

---

## Table Search

Table Search is used to filter the table by 'Contains' method. Based on the user's inputs, it continuously reduces the table records that are being satisfied using 'Contains' search.

### Meta

- **Aliases**: Table Search
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify as to whether to activate the 'reducing list' for the tables based on user's inputs. | Value | Yes | No | No | No |
| 2 | To specify as to whether the 'reducing list' should be based on the first column value or all the column values present in the table. True will consider all the columns present in the table. | Value | No | No | No | No |

---

## Tooltip

Specifies the value to be displayed as a tip,if the mouse points to the field.

### Meta

- **Aliases**: Tooltip
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a string expression which is to be displayed as a tooltip. | Value | String | Yes | No | No | No |

---

## Trigger

This attribute is used to invoke a report to get the inputs from the user based on the given condition. The user input then can be pushed to the parent field using 'output' attribute at the form level in the trigger report.

### Meta

- **Aliases**: Trigger
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the Report to be displayed. | Identifier |  | Yes | Yes | Report | No |
| 2 | The Logical condition which evaluates to yes/no. | Value | Logical | No | No |  | No |

---

## TriggerEx

The attribute Trigger Ex allows to add values to the dynamic table through an expession or user defined functions.

### Meta

- **Aliases**: TriggerEx
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is an expression/function which evaluates to a String if the <Trigger Condition> is true. | Value | String | Yes | No | No |
| 2 | It is a logical value which evaluates to either  yes or no. | Value | Logical | No | No | No |

---

## Type

Specifies the type of the value of the field.

### Meta

- **Aliases**: Type
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the data type. | Keyword | Yes | Yes | No | Method | Aggregate, Amount, Date, DateTime, Due Date, Duration, FlagSet, Logical, Long, Number, NumSet, Quantity, Rate, Rate of Exchange, String, Sys Id, Time | No |
| 2 | Specifies the subtype in case the Data Type is a composite type. | Keyword | No | Yes | No | Sub Type | Alternate Units, Base, Base Units, Date, Direct Base, DrCr, Forced, Forex, Price, Primary Units, Quantity, Rate, Secondary Units, Time, Unit Symbol | No |

---

## Unique

When this attribute is set to Yes the values accepted will be unique with respect to the collection associated with the storage attribute of the field.

### Meta

- **Aliases**: Unique
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |
| 2 | Takes Logical Value - Yes/No and default value is No. Applicable for String data type. Use this attribute to determine whether to perform exact string comparision. when specified as Yes - it will perform case-insensitive exact compare of strings to find uniqueness | Value | Logical | No | No | No | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Field | No |

---

## Valid

Validates the value of the field based on the condition.The cursor will not move to the next field until the condition is satisfied.

### Meta

- **Aliases**: Valid, Validate, Validation
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Condition to validate the field value | Value | Logical | No | No | No | No |

---

## Variable

When the field value is to be accessed as a variable this attribute is used.

### Meta

- **Aliases**: Variable, Variables
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The name of the variable. | Identifier | No | Yes | No | Variable | No |

---

## Wide Space

This allows increased spacing between the characters of the string value specified in the field.

### Meta

- **Aliases**: Wide Space, Wide Spaced
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Width

Specifies width of the field.

### Meta

- **Aliases**: Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the width of the field. | Value | Number | No | No | No | Yes |

---

## XMLAttr

Specifies the Atrribute and attribute value for the xml tag.

### Meta

- **Aliases**: XMLAttr
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the Attribute. | Value | String | No | No | No |
| 2 | Value to attribute | Value | String | No | No | No |

---
