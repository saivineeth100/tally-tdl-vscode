# Form Definition

> **Version**: 7.0

Reference documentation for all entries in the **Form** definition.

> **Total Entries**: 76

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Background](#background)
- [Balance](#balance)
- [Belongs To](#belongs-to)
- [Bottom Button](#bottom-button)
- [Bottom Part](#bottom-part)
- [Bottom ToolBar Button](#bottom-toolbar-button)
- [Button](#button)
- [Cell Write](#cell-write)
- [Color](#color)
- [Confirm Text](#confirm-text)
- [Control](#control)
- [Control Ex](#control-ex)
- [Default](#default)
- [Default Field](#default-field)
- [Default Value](#default-value)
- [DMPMode](#dmpmode)
- [Empty](#empty)
- [Excel AutoFit](#excel-autofit)
- [Excel No Format](#excel-no-format)
- [Excel Sheet Name](#excel-sheet-name)
- [Export](#export)
- [Fetch Object](#fetch-object)
- [Full Height](#full-height)
- [Full Object](#full-object)
- [Full Width](#full-width)
- [Gray Back](#gray-back)
- [Height](#height)
- [Help](#help)
- [Horizontal Align](#horizontal-align)
- [JSON Map](#json-map)
- [JSONTag](#jsontag)
- [Key](#key)
- [Left Part](#left-part)
- [Local](#local)
- [Local Formula](#local-formula)
- [Min Height](#min-height)
- [Min Width](#min-width)
- [No Confirm](#no-confirm)
- [Notify](#notify)
- [On](#on)
- [Opening Bal](#opening-bal)
- [Option](#option)
- [Output Config Report](#output-config-report)
- [Output Template](#output-template)
- [Page Break](#page-break)
- [Persist](#persist)
- [Preaccept Object Map](#preaccept-object-map)
- [Preload Object Map](#preload-object-map)
- [Print after Save](#print-after-save)
- [Print BG](#print-bg)
- [Print FG](#print-fg)
- [Print Style](#print-style)
- [Repeat](#repeat)
- [Resource](#resource)
- [Set](#set)
- [Set Always](#set-always)
- [Space Bottom](#space-bottom)
- [Space Left](#space-left)
- [Space Right](#space-right)
- [Space Top](#space-top)
- [Stripe](#stripe)
- [Style](#style)
- [Sub Form](#sub-form)
- [Switch](#switch)
- [Sync](#sync)
- [Sync Rules](#sync-rules)
- [SyncRulesAfterSave](#syncrulesaftersave)
- [ToolBar Button](#toolbar-button)
- [Use](#use)
- [Vertical Align](#vertical-align)
- [Volatile](#volatile)
- [Width](#width)
- [XMLAttr](#xmlattr)

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

## Background

Specifies the Background color of the Form.

### Meta

- **Aliases**: Background
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular color. | Identifier | No | No | No | Color | No |

---

## Balance

The attribute inserts the total line in the form depending upon the type of balancing method set for the form, i.e. Daily, Weekly or Yearly.

### Meta

- **Aliases**: Balance, Balancing, Closing Bal, Closing Balance
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the Total line to be used. | Identifier | Yes | Yes | Line | No |
| 2 | Formula Name to return date based on the Balancing Methos Daily,Weekly or yearly. | Value | No | No |  | No |

---

## Belongs To

This attribute works along with Full Object. Set Belongs To and Full Object to Yes to export the dependencies associated with the object(s) being exported. By default its value is No.

### Meta

- **Aliases**: Belongs To, Family
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to Yes or No. | Value | Logical | No | No | No | No |

---

## Bottom Button

Lists the button names that appear bottom of the right vertical side of the Screen.

### Meta

- **Aliases**: Bottom Button, Bottom Buttons
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify which button/key to be added. | Identifier | No | Yes | Key | No |

---

## Bottom Part

Lists the part names appearing at the bottom of the Screen.

### Meta

- **Aliases**: Bottom Part, Bottom Parts, Right Part, Right Parts
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the Parts to be used. | Identifier | No | Yes | Part | No |

---

## Bottom ToolBar Button

List the button names that appear at the bottom of the form [Bottom Toolbar].

### Meta

- **Aliases**: Bottom ToolBar Button, Bottom ToolBar Buttons
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify which button/key to be added. | Identifier | No | Yes | Key | No |

---

## Button

Lists the button/key names appearing when the form is triggered.

### Meta

- **Aliases**: Button, Buttons, Top Button, Top Buttons
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify which button/key to be added. | Identifier | No | Yes | Key | No |

---

## Cell Write

Specifies whether the data should be written to the excel sheet cell by cell or as a whole.

### Meta

- **Aliases**: Cell Write
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No.If the value is Yes then the cell write will used to export value to excel sheet cell by cell. If the value is No then the entire data is dumped as a whole. | Value | Logical | Yes | No | No | No |

---

## Color

Specifies the foreground color at Form level.

### Meta

- **Aliases**: Color, Shade
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the color. | Identifier | Yes | No | No | Color | No |

---

## Confirm Text

Specify the title to be displayed for Confirm Query on Form Accept

### Meta

- **Aliases**: Confirm Text, Query Text
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To Specify value of Title to be displaye for Form Accept Query | Value | String | Yes | No | No | No |

---

## Control

Applies Control at the form level based on the the specified condition with a prompt / message given as the first parameter.The save for the form fails if the condition evaluates to false.

### Meta

- **Aliases**: Control
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the String to be displayed. | Identifier |  | Yes | Yes | System Formulae | No |
| 2 | To specify the control based on the logical condition. | Value | Logical | Yes | No |  | No |

---

## Control Ex

Applies Control Ex at the form level based on the the specified condition which prompts the extended query box.

### Meta

- **Aliases**: Control Ex
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the extended query box name. | Identifier |  | Yes | No | QueryBox | No |
| 2 | To specify the control based on the logical condition. | Value | Logical | Yes | No |  | No |
| 3 | To specify the control based on the logical condition. | Identifier |  | No | No | Variable | No |

---

## Default

This attribute is used to specify the cursor focus in the report based on the logical condition. Absence of this condition always sets the cursor focus to the first line (non-fixed).

### Meta

- **Aliases**: Default
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the String to be displayed. | Value | String | No | No | No | No |

---

## Default Field

Defaults the field with the value in the Default Value attribute value if the specified condition is true.

### Meta

- **Aliases**: Default Field
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify which Field to be used. | Identifier |  | Yes | Yes | No | Field | No |
| 2 | To specify the default field's value based on the logical formula. | Value | Logical | No | No | No |  | No |

---

## Default Value

This attribute sets the Default Value for the field set with the Default Field Attribute in the Form which do not have a value set with the attribute Set as. The benefit thus achieved is that when the cursor focus goes to that filed, it stays in the last position of the default string. For e.g, default value of Ch. No.: in narration field. 

### Meta

- **Aliases**: Default Value
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the String to be displayed. | Value | String | No | No | No | No |

---

## DMPMode

This is available in Form, Part, Line, Field and it is used only in dot matrix mode of printing to set the style.

### Meta

- **Aliases**: DMPMode
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Values allowed under this are: 'Normal', 'Bold', 'Italics', 'Underline', 'Condensed', 'Enlarged', 'DoubleLine'. | Value | String | No | No | No | No |

---

## Empty

This attribute is used to make the 'Form' empty based on some condition in multi printing.

### Meta

- **Aliases**: Empty, Empty if, Empty on
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical condition for the Attribute. | Value | Logical | No | No | No | No |

---

## Excel AutoFit

Used for Excel Export, and specifies if the AutoFit property of excel should be enabled or not.

### Meta

- **Aliases**: Excel AutoFit
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical condition for the Attribute. | Value | Logical | No | No | No | No |

---

## Excel No Format

This attribute when used in the form does not allow changes to format during export.

### Meta

- **Aliases**: Excel No Format
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Excel Sheet Name

Used for Excel Export, and gives the name for the sheet in the exported Workbook.

### Meta

- **Aliases**: Excel Sheet Name
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the Sheet Name to be displayed. | Value | String | Yes | No | No | No |
| 2 | This is a condition which if succeeds then a new sheet with the specified name is created. | Value | Logical | No | No | No | No |

---

## Export

This is used to pass the field value to the parent report from the current (trigger) report once the current report's form is accepted. This is useful to get the input from the user and pass it to the caller's report.

### Meta

- **Aliases**: Export, Output
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The specified field value will get pasted from current report to the caller/parent report's field from which the trigger report is called. | Identifier | No | Yes | No | Field | No |

---

## Fetch Object

This attribute is used when multiple forms are available at a report and for each form the methods pertaining to different objects are to be fetched.

### Meta

- **Aliases**: Fetch Object
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter is object type identifier. | Identifier | Yes | Yes | Object | No |
| 2 | This can be any Expression. | Value | Yes | No |  | No |
| 3 | This can be any Expression. | Value | No | Yes |  | No |

---

## Full Height

Sets the hieght of the form to 100 % of the screen if the value is Yes.

### Meta

- **Aliases**: Full Height
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical condition for the Attribute. | Value | Logical | No | No | No | No |

---

## Full Object

This attribute exports the object storages associated with the Report, including UDFs when its value is yes. The default value is No.

### Meta

- **Aliases**: Full Object
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to Yes or No. | Value | Logical | No | No | No | No |

---

## Full Width

Sets the width of the form to 100 % of the screen if the value is Yes.

### Meta

- **Aliases**: Full Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical condition for the Attribute. | Value | Logical | No | No | No | No |

---

## Gray Back

This attribute helps the user to control whether the screen should be greyed-out before showing the query box or not.?The default value for this attribute is FALSE.

### Meta

- **Aliases**: Gray Back, Grey Back
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical expression. | Value | Logical | Yes | No | No | No |

---

## Height

Sets the height of the form to the value specified.It can be specified in any unit of measurement supported by tally eg mms,inch,or % of screen/page.

### Meta

- **Aliases**: Height
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the unit of measurement. | Value | Number | No | No | No | Yes |

---

## Help

Specifies the index / id of the help file.

### Meta

- **Aliases**: Help
- **Type**: Dual List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the Index value for the attribute. | Value | Long | Yes | No | No |
| 2 | Expression that returns the GUID of the addon/module for invoking help | Value | String | No | No | No |

---

## Horizontal Align

Specifies the horizontal alignment of the form on screen. The alignment of the form across the width of the page is set by this attribute.  The default alignment is centre of the form horizontally.

### Meta

- **Aliases**: Horizontal Align, Horizontal Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Left,Right,Centre. | Keyword | No | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## JSON Map

Maps tokens in the document template to expressions whose evaluated values replace the tokens during print or export.

### Meta

- **Aliases**: JSON Map, Map, XML Map
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the token in the template. | Value | String | Yes | Yes |  | No |
| 2 | A valid expression whose value will replace the token during printing or export. | Value | String | Yes | No |  | No |
| 3 | A valid expression whose value will replace the token during printing or export. | Identifier |  | No | Yes | Collection | No |

---

## JSONTag

To specify the tag name for the form in the exported JSON/XML file. If not specified, the tag name for the form doesn't appear in the output.

### Meta

- **Aliases**: JSONTag, XMLTag
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the JSON/XML tag. | Value | String | No | No | No | No |

---

## Key

The attribute Keys determines the list of keys active for the form.

### Meta

- **Aliases**: Key, Keys
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify which key to be added. | Identifier | No | Yes | Key | No |

---

## Left Part

Lists the part names appearing at the left side.

### Meta

- **Aliases**: Left Part, Left Parts, Part, Parts, Top Part, Top Parts
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the Parts to be used. | Identifier | No | Yes | Part | No |

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

This is used to specify a local formula within the Form.

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

## Min Height

This attribute sets the minimum height of the form to the specified value. It supports all the Tally supported units of measurements.

### Meta

- **Aliases**: Min Height
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the height of the form in Tally supported units of measurements. | Value | Number | No | No | No | Yes |

---

## Min Width

This attribute sets the minimum width of the form to the specified value. It supports all the Tally supported units of measurements.

### Meta

- **Aliases**: Min Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the width of the form in Tally supported units of measurements. | Value | Number | No | No | No | Yes |

---

## No Confirm

This attribute is used to specifiy whether to get the confirmation from the user before quit or save.Setting No Confirm to yes does not display the confirmation screen.

### Meta

- **Aliases**: No Confirm, No Confirmation
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical condition for the Attribute. | Value | Logical | No | No | No | No |

---

## Notify

This attribute notifies the user based on the condition with a warning message at the form level.

### Meta

- **Aliases**: Notify
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the formula and the value to be displayed when the specified condition is satisfied. | Identifier |  | Yes | Yes | System Formulae | No |
| 2 | This sub-attribute is used to specify the condition on which the warning is given. | Value | Logical | Yes | No |  | No |
| 3 | This sub-attribute is used to specify the condition on which the warning is given. | Value | Long | No | No |  | No |

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

## Opening Bal

This attribute inserts the opening balance line in the form. This attribute works with the combination of 'Balancing'.

### Meta

- **Aliases**: Opening Bal, Opening Balance
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the opening balance line to be used. | Identifier | No | No | No | Line | No |

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
| 1 | This specifies the name of the Optional Form. | Identifier |  | Yes | Yes | Form | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

---

## Output Config Report

Specifies the Form to be used for print.

### Meta

- **Aliases**: Output Config Report, Print
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the Report to be printed. | Identifier | No | Yes | Report | No |

---

## Output Template

To specify the output file that is to be used for printing or exporting.

### Meta

- **Aliases**: Output Template
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The name of the output file for export | Value | String | Yes | No | No | No |

---

## Page Break

Lists the part names that is seen as the header and footer for the each page in print.

### Meta

- **Aliases**: Page Break
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Separator Char | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the Parts to be used as Footer at the end of the page. | Identifier |  | Yes | Yes | Part |  | No |
| 2 | To specify the Parts to be used as Header at the new page. | Identifier |  | No | Yes | Part | ',' | No |
| 3 | To specify the Parts to be used as Header at the new page. | Value | Logical | No | No |  |  | No |

---

## Persist

### Meta

- **Aliases**: Persist, Persistent
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 |  | Value | Logical | No | No | No | No |

---

## Preaccept Object Map

This attribute is used to call the object map before the form accept.

### Meta

- **Aliases**: Preaccept Object Map
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to call object map definition before the form accept. | Identifier |  | Yes | Yes | Object Map | No |
| 2 | This sub-attribute is used to specify the logical expression which is to be evaluated, if yes calls object map. | Value | Logical | No | No |  | No |

---

## Preload Object Map

This attribute is used to call the object map before the form load.

### Meta

- **Aliases**: Preload Object Map, PreProcess Object Map
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is object map definition which is to be called before form load. | Identifier |  | Yes | Yes | Object Map | No |
| 2 | This sub-attribute is used to specify the logical expression which is to be evaluated. | Value | Logical | No | No |  | No |

---

## Print after Save

This attribute is used to trigger the printing once the form is accepted/saved.

### Meta

- **Aliases**: Print after Save
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical condition for the Attribute. | Value | Logical | No | No | No | No |

---

## Print BG

Gives Background Color while printing. The color thus applied for the Form will not be displayed on the screen but will be printed in color on the color printer and in shades of grey on the black & white printer.

### Meta

- **Aliases**: Print BG
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Color. | Identifier | No | No | No | Color | No |

---

## Print FG

Specifies the foreground color at Form level for Print Mode.

### Meta

- **Aliases**: Print FG
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the color. | Identifier | Yes | No | No | Color | No |

---

## Print Style

Specifies the text style at Form level for Print Mode.

### Meta

- **Aliases**: Print Style
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It determines the appearance of the text to be displayed by using a font scheme. | Identifier | Yes | No | No | Style | No |

---

## Repeat

This attributes is used to indicate that the specific XML Map wherever referenced needs to be repeated as columns. The usage of this attribute will determine how to repeat. If Collection name is specified is 'STRING' then value will be repeated by character else the value will be repeated. Release 5.0 supports only Repat by Character

### Meta

- **Aliases**: Repeat
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the XML MAP. XML Map specified must be declared using XML Map attribute | Value | String | Yes | Yes |  | No |
| 2 | Name of the collection on which the data needs to be repeated by columns. Specify 'STRING' if the intent is to repeat by Character | Identifier |  | Yes | Yes | Collection | No |

---

## Resource

To specify the name of the document template that is to be used for printing or exporting. The document types useful for both printing and exporting are Word XML, Excel XML, ODT and ODS. The document types useful for exporting alone are XML and JSON.

### Meta

- **Aliases**: Resource
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The name of the Resource definition. | Identifier | Yes | Yes | No | Resource | No |

---

## Set

Initializes the value of the variable.

### Meta

- **Aliases**: Set, Set as
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the Variable Name to which the value needs to be set. | Identifier | Yes | No | Variable | No |
| 2 | To specify the value that needs to be set to the Variable. | Value | Yes | No |  | No |

---

## Set Always

Sets/Forces the value of the variable each time the form refreshes.

### Meta

- **Aliases**: Set Always
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the Variable Name to which the value needs to be set. | Identifier | Yes | No | Variable | No |
| 2 | To specify the value that needs to be set to the Variable. | Value | Yes | No |  | No |

---

## Space Bottom

The attribute specifies space to left at the bottom of the form.  It can be specified in any unit of measurement supported by tally eg mms,inch,or % of screen/page.

### Meta

- **Aliases**: Space Bottom
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Measurement. | Value | Number | No | No | No | Yes |

---

## Space Left

The attribute specifies space to be left on the left of the form. It can be specified in any unit of measurement supported by tally eg mms,inch,or % of screen/page.

### Meta

- **Aliases**: Space Left
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Measurement. | Value | Number | No | No | No | Yes |

---

## Space Right

The attribute specifies space to be left unutilised on the right of the form. It can be specified in any unit of measurement supported by tally eg mms,inch,or % of screen/page.

### Meta

- **Aliases**: Space Right
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Measurement. | Value | Number | No | No | No | Yes |

---

## Space Top

The attribute specifies space to be left in top of  the form.  It can be specified in any unit of measurement supported by tally eg mms,inch,or % of screen/page.

### Meta

- **Aliases**: Space Top
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Measurement. | Value | Number | No | No | No | Yes |

---

## Stripe

This attribute enables (Yes) /disables (No) Stripes for the form to improve readability. By default it'll be set as Yes and specific format of data will have Stripes enabled. The behavior can be overridden by usage of same attribute in the child (Part).

### Meta

- **Aliases**: Stripe, Stripes
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Can only specify Yes/No. | Value | Logical | No | No | No | No |

---

## Style

Specifies the text style at Form level.

### Meta

- **Aliases**: Style
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It determines the appearance of the text to be displayed by using a font scheme. | Identifier | Yes | No | No | Style | No |

---

## Sub Form

This attribute specifies whether the message box or query box should be placed with reference to the Form or the entire canvas.

### Meta

- **Aliases**: Sub Form, Sub Forms
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical expression. | Value | Logical | Yes | No | No | No |

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
| 1 | This can be any string combination used to group. | Identifier |  | No | Yes |  | No |
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | No | Yes | Form | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | Yes | No |  | No |

---

## Sync

This attribute is used to specify the String Formula, based on which the Parts(Horizontal) will be Synchronized. For e.g., in case multi column cash book printing, the horizontal parts are aligned based on 'date'.

### Meta

- **Aliases**: Sync, Synchronize
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Condition. | Value | No | No | No | No |

---

## Sync Rules

This is used to specify a list of Client Rules which needs to be synchronized after accept.

### Meta

- **Aliases**: Sync Rules
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | List of Client Rules to be synchronized. | Value | No | No | No |

---

## SyncRulesAfterSave

 It is used to trigger Synchronization after saving the data.

### Meta

- **Aliases**: SyncRulesAfterSave
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This the expression which is evaluated to a logical value. | Value | Logical | No | No | No | No |

---

## ToolBar Button

Lists the names of the buttons appearing on the toolbar.

### Meta

- **Aliases**: ToolBar Button, ToolBar Buttons
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify which button/key to be added. | Identifier | No | Yes | Key | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Form | No |

---

## Vertical Align

Specifies the vertical alignment of the form on screen. The alignment of the form across the height of the page is set by this attribute.  The default alignment is centre of the form vertically on screen.

### Meta

- **Aliases**: Vertical Align, Vertical Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Top,Bottom,Centre. | Keyword | No | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Volatile

This attribute is basically used to refresh/destroy the form content and re-generate based on some logical condition. This is used in default TDL to refresh the voucher form when the user changes the voucher class.

### Meta

- **Aliases**: Volatile
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical condition for the Attribute. | Value | Logical | No | No | No | No |

---

## Width

The attribute specifies total width of the form. It can be specified in any unit of measurement supported by tally eg mms,inch,or % of screen/page.

### Meta

- **Aliases**: Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Width. | Value | Number | No | No | No | Yes |

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
| 1 | To specify the attribute name to the XML Tag. | Value | String | Yes | No | No |
| 2 | To specify the attribute value to the XML Tag. | Value | String | Yes | No | No |

---
