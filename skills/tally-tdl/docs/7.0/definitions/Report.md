# Report Definition

> **Version**: 7.0

Reference documentation for all entries in the **Report** definition.

> **Total Entries**: 55

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Auto](#auto)
- [Belongs To](#belongs-to)
- [Collection](#collection)
- [Column Report](#column-report)
- [Column Var](#column-var)
- [Config](#config)
- [Copies](#copies)
- [Dashboard Report Type](#dashboard-report-type)
- [Date Picker Type](#date-picker-type)
- [Default Tile](#default-tile)
- [Disable Period On Tile](#disable-period-on-tile)
- [Empty](#empty)
- [Export](#export)
- [Export Empty Fields](#export-empty-fields)
- [Export Header](#export-header)
- [Fetch Collection](#fetch-collection)
- [Fetch Object](#fetch-object)
- [Fetch Values](#fetch-values)
- [Filter](#filter)
- [Form](#form)
- [Full Screen](#full-screen)
- [Goto Subtitle](#goto-subtitle)
- [Goto Title](#goto-title)
- [Help](#help)
- [Inheritable Collection](#inheritable-collection)
- [Is ODBC Table](#is-odbc-table)
- [Keep Xml Case](#keep-xml-case)
- [List](#list)
- [List Var](#list-var)
- [Local](#local)
- [MultiObjects](#multiobjects)
- [Object](#object)
- [On](#on)
- [Option](#option)
- [Output Config Report](#output-config-report)
- [Output Pre Config Report](#output-pre-config-report)
- [Plain JSON](#plain-json)
- [Precheck](#precheck)
- [PreFetch Object](#prefetch-object)
- [PreLoad Control](#preload-control)
- [Print Set](#print-set)
- [Repeat](#repeat)
- [Set](#set)
- [Skip Value Filter](#skip-value-filter)
- [Stripe](#stripe)
- [Switch](#switch)
- [Title](#title)
- [Trigger](#trigger)
- [Unique](#unique)
- [Update TopReport](#update-topreport)
- [Use](#use)
- [Variable](#variable)

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

## Auto

This attribute is used to tell the system that it is a specialized report which does not instantiate its own variables and objects. It also does not bring the confirmation box 'Accept' when the report is accepted.

### Meta

- **Aliases**: Auto, Dynamic
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | Yes | No | No | No |

---

## Belongs To

By specifying the 'Family' name for a report, the same report can be given access for the users through security control. Once we give the family name for a report, it appears in the reports list in security control. The same family name can be given for the same category of reports.

### Meta

- **Aliases**: Belongs To, Family
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It accepts the string value as 'family' name. | Value | String | Yes | No | No | No |

---

## Collection

Majorly used for printing directly from the menu, the collection name is the primary collection on which the report will repeat. And the method name is the next level sub collections method.

### Meta

- **Aliases**: Collection, Collections
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Separator Char | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the collection on which the report will repeat. | Identifier |  | Yes | Yes | No | Collection |  | No |
| 2 | The optional variable name can be passed here which will inherit object name in the variable and further the variable can be used in the report. | Identifier |  | No | Yes | No | Variable | ',' | No |
| 3 | The optional variable name can be passed here which will inherit object name in the variable and further the variable can be used in the report. | Value | Logical | No | No | No |  |  | No |

---

## Column Report

It is used in case of multicolumnar reports. Report Name specified with this attribute is executed when the New Column button is activated.

### Meta

- **Aliases**: Column Report
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the report which gets triggered when 'New Column' button is pressed. This is used to get the config info from the user for the selection of column details. | Identifier | Yes | Yes | No | Report | No |

---

## Column Var

This attribute lists out the variables based on which the multi-columns values are repeated. This is introduced mainly to support columnar reports in remote.

### Meta

- **Aliases**: Column Var
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It denotes the name of the variable. | Identifier | Yes | Yes | Variable | No |

---

## Config

This attribute specifies the configuration report name when the configuration action does not have a report name as a parameter.

### Meta

- **Aliases**: Config, Config Report
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The name of a Report. | Identifier | Yes | No | No | Report | No |

---

## Copies

The number of Copies to be printed can be set with this attribute.  The default value is one for all the forms, under a report.

### Meta

- **Aliases**: Copies
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It accepts any numerical value. | Value | Long | Yes | No | No | No |

---

## Dashboard Report Type

This attribute specifies whether the report is of dashboard type or not.

### Meta

- **Aliases**: Dashboard Report Type, Dashboard Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify any logical expression. It checks whether the report is of dashboard type or not. | Value | Logical | Yes | No | No | No |

---

## Date Picker Type

To specify the date picker type in the browser report. For example, Range, Date or None. If it is set to Range, it impacts SVFromDate and SVTodate. If it is set to a day, it impacts SVCurrentdate.

### Meta

- **Aliases**: Date Picker Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify a valid date type based on the report type. For example, Range, Date or None. | Keyword | Yes | Yes | No | Date Picker Type | Day, None, Range | No |

---

## Default Tile

This attribute is used to list the collection of tiles that need to be part of the original view of the Dashboard.

### Meta

- **Aliases**: Default Tile, Default Tiles
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the collection names that need to be part of default tiles. | Identifier | Yes | Yes | Collection | No |

---

## Disable Period On Tile

This attribute determines whether the period is hidden on a specific tile in the dashboard or not. Set it to Yes to hide the period, or No to display the period on the tile.

### Meta

- **Aliases**: Disable Period On Tile
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression which evaluates to a logical value that controls the behavior. | Value | Logical | Yes | No | No | No |

---

## Empty

This attribute decides whether the forms attached to the report will be printed or not. This is used in multi printing reports.

### Meta

- **Aliases**: Empty, Empty if, Empty on
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | Yes | No | No | No |

---

## Export

It determines whether the current report is exportable or not.

### Meta

- **Aliases**: Export, Output
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no.  Default value of this attribute is No. | Value | Logical | Yes | No | No | No |

---

## Export Empty Fields

Set this attribute to Yes to include empty fields as headers when exporting the report. Default is No.

### Meta

- **Aliases**: Export Empty Fields
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to Yes or No, indicating whether empty fields should be exported as headers. | Value | Logical | Yes | No | No | No |

---

## Export Header

Specifies the header information when posting a report as XML or JSON (Request Report or Pre-Request Report).

### Meta

- **Aliases**: Export Header, Header
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Defines the header information for XML or JSON reports. | Value | String | Yes | No | No |

---

## Fetch Collection

This attribute is used when the same collection is used in the report either for repeating the line over its objects or multiple functions using the same, then a collection of those objects can be pre fetched at the report level using Fetch Collection. This is useful in case of remote access since the data has to come from the server and the client need not send the request again and again.

### Meta

- **Aliases**: Fetch Collection
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the collection whose objects need to be pre fetched at Report. | Identifier | Yes | Yes | Collection | No |

---

## Fetch Object

This attribute is used when multple methods of a single object is required for a report, then that object can be fetched at report level using Fetch Object. This is useful in case of remote access since the data has to come from the server and the client need not send the request again and again.

### Meta

- **Aliases**: Fetch Object
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter specifies the type of the object. | Identifier | Yes | Yes | Object | No |
| 2 | This can be any of the string expression. | Value | Yes | No |  | No |
| 3 | This can be any of the string expression. | Value | No | Yes |  | No |

---

## Fetch Values

This attribute allows the computation of user defined methods based on the current object Context.

### Meta

- **Aliases**: Fetch Values
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | The List of user defined/external methods which needs to be computed. | Value | Yes | Yes | No |

---

## Filter

The Filtered attribute is used to filter non-group companies from Group companies and is applicable only for a non-group company.

### Meta

- **Aliases**: Filter, Filtered, Filters
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | Yes | No | No | No |

---

## Form

The Form attribute defines a form or set of forms associated with the report.

### Meta

- **Aliases**: Form, Forms
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the form. | Identifier | Yes | Yes | Form | No |

---

## Full Screen

It helps to control the display of command window/calculator pane. Full screen displays the report in the full screen.

### Meta

- **Aliases**: Full Screen
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | Yes | No | No | No |

---

## Goto Subtitle

The subtitle of the Report to be specified along with Goto Title in Goto Report lists.

### Meta

- **Aliases**: Goto Subtitle
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the value of the Report Subtitle to be used in Goto lists. | Value | String | Yes | No | No | No |

---

## Goto Title

The title of Report to be used in Goto Report lists. If not specified, Title will be used.

### Meta

- **Aliases**: Goto Title
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the value of the Report Title to be used in Goto lists. | Value | String | Yes | No | No | No |

---

## Help

This attribute takes the System formula which in turn has a Help ID or the Help id as its parameter, the id connects the report with a particular help file.

### Meta

- **Aliases**: Help
- **Type**: Dual List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the Help ID for the help file. | Value | Long | Yes | No | No |
| 2 | Expression that returns the GUID of the addon/module for invoking help | Value | String | No | No | No |

---

## Inheritable Collection

This attribute specifies the name of the collections which can be inherited by the child collections.

### Meta

- **Aliases**: Inheritable Collection, Inheritable Collections
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is the collection name which can be inherited. | Identifier | Yes | Yes | Collection | No |

---

## Is ODBC Table

Attribute to determine if the table should be shown or not when messagebox opens.

### Meta

- **Aliases**: Is ODBC Table, Show Table
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies Logical value. | Value | Logical | Yes | No | No | No |

---

## Keep Xml Case

By setting KeepXmlCase attribute Yes, the program will not convert to upper case automatically while exporting but will keep/preserve the case as specified by the programmer.

### Meta

- **Aliases**: Keep Xml Case
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | Yes | No | No | No |

---

## List

ListName is an attribute used in the report definition that will accept the name of the report. Later the same report name will be shown in 'Select Report' table list. If the list name is not given for a particular report, it takes the report name itself in the 'Select Report'.

### Meta

- **Aliases**: List, List Name
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a valid string to List as a name. | Value | String | Yes | No | No | No |

---

## List Var

It is similar to the variable definition except that List variable can hold array of same variables values. A variable at the declaration time can be either declared as a single instance or a list by using a List Variable declaration attribute.

### Meta

- **Aliases**: List Var, List Variable
- **Type**: Variable List

### Parameters

_No parameters._

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

## MultiObjects

This attribute is required to be specified in case multiple objects of the same collection are being modified in the Report.

### Meta

- **Aliases**: MultiObjects, Multiple Objects
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the collection name whose objects are being modified. | Identifier |  | Yes | Yes | Collection | No |
| 2 | To specify if objects with error need to be ignored to continue for subsequent objects. Default behaviour is to stop execution on first error object. | Value | Logical | No | No |  | No |

---

## Object

To specify the Object associated with the Report.

### Meta

- **Aliases**: Object, Objects
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies the type of the object.  For eg: Object: Voucher. | Identifier |  | Yes | Yes | No | Object | No |
| 2 | It accepts the object name. For e.g., Cash,Sundry Debtors etc. | Value | String | No | No | No |  | No |

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
| 1 | This specifies the name of the Optional Report. | Identifier |  | Yes | Yes | Report | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

---

## Output Config Report

Report Name specified with this attribute gets executed when the Print button is activated.This is used to get the inputs from the user for the priting configuration and sets the variable. Later the same will be used in the printing of the base report.

### Meta

- **Aliases**: Output Config Report, Print
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It accepts the report name as a parameter. | Identifier | Yes | Yes | No | Report | No |

---

## Output Pre Config Report

This attribute is used to get the inputs from the user for the printing configuration and sets the variable for printing the base report.

### Meta

- **Aliases**: Output Pre Config Report
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The name of a Report. | Identifier |  | Yes | No | Report | No |
| 2 | A logical expression that determines when the pre-configuration report appears. | Value | Logical | Yes | No |  | No |

---

## Plain JSON

Set this attribute to Yes to generate the output (XML/JSON) without formatting, i.e., a plain file without indents or new lines. If not specified, the default is No (formatted output).

### Meta

- **Aliases**: Plain JSON, Plain Output, Plain Xml
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to Yes or No. Set to Yes for plain output (no formatting), or No for formatted output (with indents and new lines). | Value | Logical | Yes | No | No | No |

---

## Precheck

This attribute helps to check a condition before launching the report. If the condition satisfies the report is launched else specified query is displayed for resolution of the failed condition.

### Meta

- **Aliases**: Precheck, PreLoad Check
- **Type**: PreLoad Check List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | This attribute helps to check a condition before launching the report. If the condition satisfies the report is launched else specified query is displayed for resolution of the failed condition. | Yes | No | No |

---

## PreFetch Object

At the report level the Set attribute for changing variable value takes precedence and Fetch Object is evaluated later. In this case fetching the object first becomes mandatory. For this purpose Pre Fetch Object can be used which will be evaluated before.

### Meta

- **Aliases**: PreFetch Object
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It denotes the type of the Object. | Identifier | Yes | Yes | Object | No |
| 2 | It denotes the name of the object. | Value | Yes | No |  | No |
| 3 | It denotes the name of the object. | Value | No | Yes |  | No |

---

## PreLoad Control

This attribute is used to open a message box with a message and prevent opening the report if the first parameter is true.

### Meta

- **Aliases**: PreLoad Control
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any expression that evaluates to a logical value. | Value | Logical | Yes | No | No |
| 2 | Any string expression whose value is to be set in the message box. This is passed to the query report, where it is accessible with $$InfoParam. |  |  | Yes | No | No |
| 3 | Any string expression whose value is to be set in the message box. This is passed to the query report, where it is accessible with $$InfoParam. | Value | Long | No | No | No |

---

## Print Set

This is used to set the value to the variable for the report, only in print action/mode

### Meta

- **Aliases**: Print Set
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It accepts the name of the variable. | Identifier | Yes | No | Variable | No |
| 2 | The value to be provided to the variable. | Value | Yes | No |  | No |

---

## Repeat

The repeat variables can hold multiple value of the same type. These values can be accessed via an implicit index framework from the field, when field is repeated. Repeat variables are supported only in report scope for the purpose of the column reports. These variables can be filled using a collection and method specification in the variable.

### Meta

- **Aliases**: Repeat
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It accepts variable name. | Identifier | Yes | Yes | Variable | No |

---

## Set

This attribute initializes the value of the variable for the report.

### Meta

- **Aliases**: Set, Set as
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Used to specify the variable name. | Identifier | Yes | No | Variable | No |
| 2 | The value to be provided to the variable. | Value | Yes | No |  | No |

---

## Skip Value Filter

This attribute is used to skip the value filter when inheriting from a report where value filter is applied.

### Meta

- **Aliases**: Skip Value Filter
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which accepts either yes or no. | Value | Logical | Yes | No | No | No |

---

## Stripe

This attribute enables (Yes) /disables (No) Stripes for the report to improve readability. By default it'll be set as Yes and specific format of data will have Stripes enabled. The behavior can be overridden by usage of same attribute in the child (Form).

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
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | Yes | Yes | Report | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | No | No |  | No |

---

## Title

It displays the title for the report in the left top corner.

### Meta

- **Aliases**: Title
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the value of the Report Title. | Value | String | Yes | No | No | No |

---

## Trigger

Primarily used to enhance the user-friendliness of Tally and always associated with a key combination.  A trigger comes into effect when a pre-defined combination of keys is pressed to obtain a desired result. It is used to fill the information from SubForm.

### Meta

- **Aliases**: Trigger
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | Yes | No | No | No |

---

## Unique

This attribute determines whether each instance of the report is unique which helps in evaluation of PrintSet of each instance.

### Meta

- **Aliases**: Unique
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | Yes | No | No | No |

---

## Update TopReport

Refresh Only the Active report. During drilldown only the top most report should refresh unless pressed escape

### Meta

- **Aliases**: Update TopReport
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either  yes or no. | Value | Logical | Yes | Yes | No | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Report | No |

---

## Variable

Used to declare the variables at the report level.This variable is available to this report and all its child reports and functions.

### Meta

- **Aliases**: Variable, Variables
- **Type**: Variable List

### Parameters

_No parameters._

---
