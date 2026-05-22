# Line Definition

> **Version**: 7.0

Reference documentation for all entries in the **Line** definition.

> **Total Entries**: 44

## Table of Contents

- [Access Name](#access-name)
- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Belongs To](#belongs-to)
- [Border](#border)
- [Combine](#combine)
- [DMPMode](#dmpmode)
- [Empty](#empty)
- [Excel Add Row](#excel-add-row)
- [Explode](#explode)
- [Field](#field)
- [Fixed](#fixed)
- [Full Object](#full-object)
- [Height](#height)
- [Help](#help)
- [Indent](#indent)
- [Invisible](#invisible)
- [JSON Tag As Desc Name](#json-tag-as-desc-name)
- [JSONTag](#jsontag)
- [Key](#key)
- [Line](#line)
- [Local](#local)
- [Local Formula](#local-formula)
- [Next Page](#next-page)
- [No Cursor](#no-cursor)
- [On](#on)
- [Option](#option)
- [Page Break](#page-break)
- [Pre Printed](#pre-printed)
- [Pre Printed Border](#pre-printed-border)
- [Preaccept Object Map](#preaccept-object-map)
- [Remove](#remove)
- [Repeat](#repeat)
- [Right Field](#right-field)
- [Select](#select)
- [Set](#set)
- [Skip Rows](#skip-rows)
- [Space Bottom](#space-bottom)
- [Space Top](#space-top)
- [Stripe](#stripe)
- [Switch](#switch)
- [Use](#use)
- [XMLAttr](#xmlattr)

---

## Access Name

This attribute is used to identify the line by using unique access name.

### Meta

- **Aliases**: Access Name
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It can be a formula and evaluated to string. | Value | String | No | No | No | No |

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

## Belongs To

This attribute exports the complete object hierarchy associated with the line, when its value is Yes. The default value is No.

### Meta

- **Aliases**: Belongs To, Family
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to Yes or No. | Value | Logical | No | No | No | No |

---

## Border

Specifies the border for the line.

### Meta

- **Aliases**: Border
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the name of border. | Identifier |  | Yes | Yes | No | Border | No |
| 2 | Specifies whether the border is to be applied for the particular line. | Value | Logical | No | No | No |  | No |

---

## Combine

This attribute is to sum up all the repeated fields.

### Meta

- **Aliases**: Combine, Total, Totals
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This specifies the name of the filed. | Identifier | No | Yes | Field | No |

---

## DMPMode

This is available in Form, Part, Line, Field and it is used only in dot matrix mode of printing to set the style.

### Meta

- **Aliases**: DMPMode
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | DMP Mode can take following values. 'Normal', 'Bold ', 'Italics', 'Underline', 'Condensed', 'Enlarged', 'DoubleLine' | Value | String | No | No | No | No |

---

## Empty

This attribute removes the line from the Part based on condition.

### Meta

- **Aliases**: Empty, Empty if, Empty on
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Any expression that retruns the logical value. | Value | Logical | No | No | No | No |

---

## Excel Add Row

This attribute is used to insert a row in Excel sheet based on a condition.

### Meta

- **Aliases**: Excel Add Row
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It can be any expression that returns logical value to Insert a row in excel sheet. | Value | Logical | No | No | No | No |

---

## Explode

Explodes a part from the line based on the condition specified.

### Meta

- **Aliases**: Explode, Explosions
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the part. | Identifier |  | Yes | Yes | Part | No |
| 2 | To give condition on which the explode will happen. | Value | Logical | No | No |  | No |

---

## Field

It is used to specify the field name in this line.

### Meta

- **Aliases**: Field, Fields, Left Field, Left Fields
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the field. | Identifier | No | Yes | Field | No |

---

## Fixed

This attribute helps to skip the line such that the cursor will not positioned on it.

### Meta

- **Aliases**: Fixed
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Expression evaluating to Yes/No.Specifying the value to yes will not move the focus to this line. | Value | Logical | No | No | No | No |

---

## Full Object

This attribute exports the object storages associated with the line, including UDFs when its value is Yes. The default value is No.

### Meta

- **Aliases**: Full Object
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to Yes or No. | Value | Logical | No | No | No | No |

---

## Height

Specifies the height of the line.

### Meta

- **Aliases**: Height
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the height of the line. | Value | Number | No | No | No | Yes |

---

## Help

Specifies the Index / Id of the help file for help.

### Meta

- **Aliases**: Help
- **Type**: Dual List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the Index / Id of the help file for help. | Value | Long | Yes | No | No |
| 2 | Expression that returns the GUID of the addon/module for invoking help | Value | String | No | No | No |

---

## Indent

This attribute specifies the space to be left from the Left margin before the contents of the line begin.

### Meta

- **Aliases**: Indent
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies an indention for the line. | Value | Number | No | No | No | Yes |

---

## Invisible

It specifies whetther the line is to be visible or not.

### Meta

- **Aliases**: Invisible
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifying the value to yes sets the line as invisible. | Value | Logical | No | No | No | No |

---

## JSON Tag As Desc Name

This attribute uses the JSON tag as the descriptive name in the JSON export when using the new JSON format.

### Meta

- **Aliases**: JSON Tag As Desc Name
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression which evaluates to a logical value that controls the behavior. | Value | Logical | No | No | No | No |

---

## JSONTag

To specify the tag name for the line in the exported JSON/XML file. If not specified, the tag name for the line doesn't appear in the output.

### Meta

- **Aliases**: JSONTag, XMLTag
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the JSON/XML tag. | Value | String | No | No | No | No |

---

## Key

A key definition can be used by the Line definition to initiate the action as defined in the key definition by the Action attribute.

### Meta

- **Aliases**: Key, Keys
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Key name that is associated to the line. | Identifier | No | Yes | Key | No |

---

## Line

To define another line under a line.  If this attribute is specified the attributes Fields / Right Fields cannot be specified simultaneously.

### Meta

- **Aliases**: Line, Lines, Top Line, Top Lines
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the line. | Identifier | No | Yes | Line | No |

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

This is used to specify a local formula within the Line.

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

## Next Page

Specifies when the Line is printed in the next page in Print mode.

### Meta

- **Aliases**: Next Page
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the condition in which case the line has to be printed in the next page. | Value | Logical | No | No | No | No |

---

## No Cursor

This attribute is used to disallow the cursor on the line when in create or alter mode.   The default value of this attribute is set to Yes.

### Meta

- **Aliases**: No Cursor
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Expression evaluating to Yes/No.Specifying the value to yes will disallow the cursor on the line when in create or alter mode. | Value | Logical | No | No | No | No |

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
| 1 | This specifies the name of the Optinal Line. | Identifier |  | Yes | Yes | Line | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

---

## Page Break

The attribute Page Break in a line is used to specify closing page breaks and opening pagebreaks in case of horizontal page breaks. Used mostly in case of multicolumn reports.

### Meta

- **Aliases**: Page Break
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Separator Char | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | The field names which appear as opening page breaks. | Identifier |  | Yes | Yes | Field |  | No |
| 2 | The field names which appear as closing page breaks. | Identifier |  | No | Yes | Field | ',' | No |
| 3 | The field names which appear as closing page breaks. | Value | Logical | No | No |  |  | No |

---

## Pre Printed

Specifies whether the static text will be preprinted for the printing.

### Meta

- **Aliases**: Pre Printed
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Expression evaluating to Yes/No.When the attribute is set to Yes will not print the contents of the Line on the paper assuming the statiionary is pre-printed stationary. | Value | Logical | No | No | No | No |

---

## Pre Printed Border

Specifies whether the border for the line will be preprinted for the printing.

### Meta

- **Aliases**: Pre Printed Border
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Expression evaluating to Yes/No.If this condition is Yes then the border specified for the line will be pre printed for the printing. | Value | Logical | No | No | No | No |

---

## Preaccept Object Map

This attribute is used to call object map before the line accept.

### Meta

- **Aliases**: Preaccept Object Map
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to call object map definition before the line accept. | Identifier |  | Yes | Yes | Object Map | No |
| 2 | This sub-attribute is used to specify the logical expression, which is to be evaluated, if yes, calls object map. | Value | Logical | No | No |  | No |

---

## Remove

This attribute removes the line from the Interface.

### Meta

- **Aliases**: Remove, Remove if, Remove on
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It can be any expression that returns logical value to remove the line. | Value | Logical | No | No | No | No |

---

## Repeat

Repeats the field with the specified collection. If collection is not specified and no SET attribute is used field is repeated on reports number of columns in case of columner report.

### Meta

- **Aliases**: Repeat
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the field to be repeated. | Identifier | Yes | Yes | No | Field | No |
| 2 | Collection name on which the field to be repeated. This is an optional parameter. | Identifier | No | Yes | No | Collection | No |

---

## Right Field

The Fields are aligned to the right of the Line.

### Meta

- **Aliases**: Right Field, Right Fields
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the field name aligned to the right. | Identifier | No | Yes | Field | No |

---

## Select

This attribute indicates that the line (or lines within this line) is selectable or not.

### Meta

- **Aliases**: Select, Selectable
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The default value of attribute Selectable for repeated lines is Yes and for non-repeated lines it is No. | Value | Logical | No | No | No | No |

---

## Set

This is used to specify the Repeat for fields in absence of Collection, system will uses this value and create as many columns.

### Meta

- **Aliases**: Set, Set as
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the number columns to be created for the line. | Value | Long | No | No | No | No |

---

## Skip Rows

This attribute used Skip Rows in excel export.

### Meta

- **Aliases**: Skip Rows
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Number of Rows to be skipped in excel export. | Value | Long | No | No | No | No |

---

## Space Bottom

Specifies the bottom margin.

### Meta

- **Aliases**: Space Bottom
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the bottom margin. | Value | Number | No | No | No | Yes |

---

## Space Top

Specifies the top margin.

### Meta

- **Aliases**: Space Top
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the top margin. | Value | Number | No | No | No | Yes |

---

## Stripe

This attribute enables (Yes) /disables (No) Stripes for the Line to improve readability. By default it'll be set as Yes and specific format of data will have Stripes enabled. The behavior can be overridden by usage of same attribute in the children (Part, Line).

### Meta

- **Aliases**: Stripe, Stripes
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Can only specify Yes/No. | Value | Logical | No | No | No | No |

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
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | Yes | Yes | Line | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | No | No |  | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Line | No |

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
| 1 | Used to specify the Attribute Name for the XML Tag. | Value | String | No | No | No |
| 2 | To specify the value for the Attribute. | Value | String | No | No | No |

---
