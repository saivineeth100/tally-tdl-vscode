# Part Definition

> **Version**: 7.0

Reference documentation for all entries in the **Part** definition.

> **Total Entries**: 72

## Table of Contents

- [Access Name](#access-name)
- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Background](#background)
- [Balance](#balance)
- [Border](#border)
- [Bottom Line](#bottom-line)
- [Bottom Part](#bottom-part)
- [Break](#break)
- [Break On](#break-on)
- [Button](#button)
- [Cell Write](#cell-write)
- [Combine](#combine)
- [Common Border](#common-border)
- [Default Line](#default-line)
- [Digital Sign](#digital-sign)
- [Display X Axis Legend](#display-x-axis-legend)
- [DMPMode](#dmpmode)
- [Enable Graph Cursor](#enable-graph-cursor)
- [Excel AutoFit](#excel-autofit)
- [Excel Sheet Name](#excel-sheet-name)
- [Fixed](#fixed)
- [Float](#float)
- [Graph Display Cursor Label](#graph-display-cursor-label)
- [Graph Display Num Rows](#graph-display-num-rows)
- [Graph Style](#graph-style)
- [Graph Type](#graph-type)
- [Height](#height)
- [Help](#help)
- [Horizontal Align](#horizontal-align)
- [Image](#image)
- [Invisible](#invisible)
- [JSON Tag As Desc Name](#json-tag-as-desc-name)
- [JSONTag](#jsontag)
- [Left Part](#left-part)
- [Line](#line)
- [Local](#local)
- [Local Formula](#local-formula)
- [Number Of Display Lines In Scroll](#number-of-display-lines-in-scroll)
- [Object](#object)
- [ObjectEx](#objectex)
- [On](#on)
- [Option](#option)
- [Page Break](#page-break)
- [Pre Printed](#pre-printed)
- [Pre Printed Border](#pre-printed-border)
- [Preaccept Object Map](#preaccept-object-map)
- [Print BG](#print-bg)
- [QR Code](#qr-code)
- [Repeat](#repeat)
- [Retain Focus](#retain-focus)
- [Scroll](#scroll)
- [Scroll Indicator Style](#scroll-indicator-style)
- [Select](#select)
- [Set](#set)
- [Set Always](#set-always)
- [Shorten Y Axis Label](#shorten-y-axis-label)
- [Skip Forward](#skip-forward)
- [Space Bottom](#space-bottom)
- [Space Left](#space-left)
- [Space Right](#space-right)
- [Space Top](#space-top)
- [Stripe](#stripe)
- [Switch](#switch)
- [Sync](#sync)
- [Use](#use)
- [Vertical](#vertical)
- [Vertical Align](#vertical-align)
- [Width](#width)
- [X Axis Label Word Wrap](#x-axis-label-word-wrap)
- [XMLAttr](#xmlattr)

---

## Access Name

To identify a part by using a unique access name.

### Meta

- **Aliases**: Access Name
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a formula and evaluated to string. | Value | String | No | No | No | No |

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

This attribute sets the background color for the part.

### Meta

- **Aliases**: Background
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the Background color of the part. | Identifier | No | No | No | Color | No |

---

## Balance

This attribute help to decide balance method of value, it will take parameter like daily ($Date), Weekly etc., based on that it will inserted total line and opening line, but a form can contain multiple parts.. so at the part level balancing decides, whether the balancing attributes given at the form level will get applied for this part or not

### Meta

- **Aliases**: Balance, Balancing, Closing Bal, Closing Balance
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To apply the balance method this this part or not. | Value | Logical | No | No | No | No |

---

## Border

Describes the type of Border to be used for the specific Part.

### Meta

- **Aliases**: Border
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the Border to be used. | Identifier |  | Yes | Yes | No | Border | No |
| 2 | To add borders based on the given condition. | Value | Logical | No | No | No |  | No |

---

## Bottom Line

It is used to place the lines at the bottom of the Part with respect to the Height specified within the Part Definition.

### Meta

- **Aliases**: Bottom Line, Bottom Lines
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of Line. | Identifier | No | Yes | Line | No |

---

## Bottom Part

It occupies the Bottom Section of the Part.

### Meta

- **Aliases**: Bottom Part, Bottom Parts, Right Part, Right Parts
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of part. | Identifier | No | Yes | Part | No |

---

## Break

This attribute is usually associated with the attribute Repeat in the alter mode of the form.  The repetition of the line belonging to the collection is stopped when the condition specified in the attribute Break After is satisfied.

### Meta

- **Aliases**: Break, Break After
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The formula which evaluates to Yes/No. | Value | Logical | No | No | No | No |

---

## Break On

This attribute is usually associated with the attribute Repeat in the alter mode of the form.  The repetition of the line belonging to the collection is stopped when the condition specified in the attribute Break On is satisfied.

### Meta

- **Aliases**: Break On
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The formula which evaluates to Yes/No. | Value | Logical | No | No | No | No |

---

## Button

This attribute specifies the buttons inside the part definition.

### Meta

- **Aliases**: Button, Buttons, Top Button, Top Buttons
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the button. | Identifier | No | Yes | Key | No |

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

## Combine

The values of this attribute can only be the field names defined in the part.  The total or subtotal of field / fields can be accessed anywhere in the part using the functions $$Total and $$SubTotal respectively.

### Meta

- **Aliases**: Combine, Total, Totals
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the field name. | Identifier | No | Yes | Field | No |

---

## Common Border

Allocates common border for the Part ei, decides if the borders specified for one line should be extended for entire part as such. To stop the extension of the border towards up, subtitle : Yes can be given the required fields.

### Meta

- **Aliases**: Common Border, Common Borders
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies if the borders specified for one line should be extended for all or not. | Value | Logical | No | No | No | No |

---

## Default Line

It is used to highlight the appropriate line which satisfies the given condition. All the methods of the object associated with the line, can be used while specifying the condition.

### Meta

- **Aliases**: Default Line
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | When the Report is invoked, the Line for which the condition is true is highlighted by default. | Value | Logical | Yes | No | No | No |

---

## Digital Sign

This attribute specifies whether the digital signature is displayed in the part or not.

### Meta

- **Aliases**: Digital Sign, Digital Signature
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify if the part is used to display the digital signature. | Value | Logical | Yes | No | No | No |

---

## Display X Axis Legend

This attribute is used to display the x-axis legend. Its default value is set to FALSE.

### Meta

- **Aliases**: Display X Axis Legend
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies whether the graph's x-axis legends should be displayed or not. | Value | Logical | No | No | No | No |

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

## Enable Graph Cursor

This attribute is used to specify whether cursor movements should be enabled for the graph or not.

### Meta

- **Aliases**: Enable Graph Cursor
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify any logical expression. | Value | Logical | No | No | No | No |

---

## Excel AutoFit

This is useful during Excel Export. If this is set to 'Yes',   the field values will automatically fit in the cell during Excel Export.

### Meta

- **Aliases**: Excel AutoFit
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies if the Auto Fit property in excel is set for excel export | Value | Logical | No | No | No | No |

---

## Excel Sheet Name

Specify the name of Sheet in Excel on which data needs to be exported.

### Meta

- **Aliases**: Excel Sheet Name
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the sheet. | Value | String | Yes | No | No | No |
| 2 | This is a condition which if succeeds then a new sheet with the specified name is created. | Value | Logical | No | No | No | No |

---

## Fixed

This attribute helps to skip the part in alteration mode.

### Meta

- **Aliases**: Fixed
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies if the part need to be skiped or not. | Value | Logical | No | No | No | No |

---

## Float

This is a logical attribute. If the value is set to Yes, then the bottom lines will appear immediately after completing the scrolled lines. If this is specified as No, then the bottom lines will always appear at the bottom of the part

### Meta

- **Aliases**: Float, Floating Bottom
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Logical Value specifying Yes/No. | Value | Logical | No | No | No | No |

---

## Graph Display Cursor Label

This attribute is used to display a label with the value associated with the data point the cursor is focused on in the graph. This attribute is evaluated only if 'Enable graph cursor' is also set to TRUE.

### Meta

- **Aliases**: Graph Display Cursor Label
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify any logical expression. | Value | Logical | No | No | No | No |

---

## Graph Display Num Rows

This attribute is used to specify the maximum number of rows displayed in a graph. When this threshold is exceeded, horizontal scrolling is enabled. This attribute is evaluated only if 'Enable graph cursor' is set to TRUE.

### Meta

- **Aliases**: Graph Display Num Rows
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The maximum number of rows supported for display in a graph. This value will only be applied if it is less than the actual number of rows being displayed in the part. | Value | Long | No | Yes | No | No |

---

## Graph Style

This attribute is used to configure the graph's style, such as choosing between a Bar graph or a Line graph.

### Meta

- **Aliases**: Graph Style
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify a valid graph style. | Value | String | Yes | Yes | No | No |

---

## Graph Type

This attribute is used to draw the graph. If this attribute is made Yes then Bar graph is displayed. To get 'X' and 'Y' axis, the part should contain 2 fields each specifying Graph Label : Yes/No.

### Meta

- **Aliases**: Graph Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies whether the graph is to be drawn for the part. | Value | No | No | No | No |

---

## Height

Helps to set the height to a Part. If height is not specified for a part, it will take depending upon the number of line within it.

### Meta

- **Aliases**: Height
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the width of the part. | Value | Number | No | No | No | Yes |

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
| 1 | Specifies the index / id of the help file. | Value | Long | Yes | No | No |
| 2 | Expression that returns the GUID of the addon/module for invoking help | Value | String | No | No | No |

---

## Horizontal Align

This attribute specifies the horizontal alignment of the part.

### Meta

- **Aliases**: Horizontal Align, Horizontal Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Left, Right, Centre. | Keyword | No | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Image

This attribute is used to draw the image from the specified resource.

### Meta

- **Aliases**: Image
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies image is to be drawn for the part. | Identifier | No | No | No | Resource | No |

---

## Invisible

This attribute decides the visibility of the part. If the Part is made Invisible, then the Part will occupy no space.

### Meta

- **Aliases**: Invisible
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies whether the part should be visible or not. | Value | Logical | No | No | No | No |

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

To specify the tag name for the part in the exported JSON/XML file. If not specified, the tag name for the part doesn't appear in the output.

### Meta

- **Aliases**: JSONTag, XMLTag
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the JSON/XML tag. | Value | String | No | No | No | No |

---

## Left Part

It occupies the Top Section of the Part.

### Meta

- **Aliases**: Left Part, Left Parts, Part, Parts, Top Part, Top Parts
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of part. | Identifier | No | Yes | Part | No |

---

## Line

It is used to place lines at the top.

### Meta

- **Aliases**: Line, Lines, Top Line, Top Lines
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of Line. | Identifier | No | Yes | Line | No |

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

This is used to specify a local formula within the Part.

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

## Number Of Display Lines In Scroll

This attribute is utilized only when vertical scrolling is enabled within the part and when both the containing form and part have no specified height, and the containing form is not set to Full Height. Under these specific conditions, the attribute will determine the number of lines to be displayed in the part, with any remaining lines available for scrolling. The part's height will be dynamically calculated based on the value of this attribute.

### Meta

- **Aliases**: Number Of Display Lines In Scroll, Num Of Display Lines In Scroll
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the number of lines to be displayed in the scroll. | Value | Long | Yes | No | No | No |

---

## Object

This attribute is used to associate an Object at the part level.

### Meta

- **Aliases**: Object, Objects
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the Collection of Secondary Objects. | Identifier |  | Yes | Yes | No | Collection |  |  | No |
| 2 | This can be First or Last which denotes the position index. | Keyword |  | Yes | Yes | No |  | Seek Type | Beginning, End, First, Last | No |
| 3 | This can be First or Last which denotes the position index. | Value | Logical | No | No | No |  |  |  | No |

---

## ObjectEx

It provides the ease of using enhanced method formula syntax while specifying the object association.

### Meta

- **Aliases**: ObjectEx
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The formula which is used to specify the Object to be associated with the Part using dotted method syntax. | Value | No | Yes | No | No |

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
| 1 | This specifies the name of the Optional Part. | Identifier |  | Yes | Yes | Part | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

---

## Page Break

This attribute specifies the Closing Page Line and the Opening Page Line. This attribute is used in case the number of lines to be printed exceeds the number of lines that can be fitted in the Part.

### Meta

- **Aliases**: Page Break
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Separator Char | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a closing line. | Identifier |  | No | Yes | Line |  | No |
| 2 | To specify an opening line. | Identifier |  | No | Yes | Line | ',' | No |
| 3 | To specify an opening line. | Value | Logical | No | No |  |  | No |

---

## Pre Printed

This attribute works in conjunction with the preprinted / plain button in the print configuration screen. When the attribute is set to Yes, it will not print the contents of the Part on the paper assuming the stationary is pre-printed stationary.

### Meta

- **Aliases**: Pre Printed
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify if the part is to be considered as pre printed or not. | Value | Logical | No | No | No | No |

---

## Pre Printed Border

This attribute works in conjunction with the preprinted / plain button in the print configuration screen.  When the attribute is set to Yes will not print the border of the Part on the paper assuming the stationary is pre-printed stationary.

### Meta

- **Aliases**: Pre Printed Border
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify if the border of the Part needs to be printed or not. | Value | Logical | No | No | No | No |

---

## Preaccept Object Map

This attribute is used to call the object map before the part accept.

### Meta

- **Aliases**: Preaccept Object Map
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to call object map definition before the part accept. | Identifier |  | Yes | Yes | Object Map | No |
| 2 | This sub-attribute is used to specify the logical expression, which is to be evaluated, if yes, calls object map. | Value | Logical | No | No |  | No |

---

## Print BG

This attribute allows the background color to be defined for the Part. The color thus applied for the Part will not be displayed on the screen but will be printed in color on the color printer and in shades of grey on the black & white printer.

### Meta

- **Aliases**: Print BG
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify background color for the part while printing. | Identifier | No | No | No | Color | No |

---

## QR Code

This attribute is used to generate QR Code from the text specified

### Meta

- **Aliases**: QR Code
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the string that is to be encoded into QR code | Value | String | Yes | No | No | No |
| 2 | Specifies whether the QR code should have a border or not,default value is YES | Value | Logical | No | No | No | No |

---

## Repeat

The line is repeated with respect to the collection name specified. In the repeated lines we can retreive any data we require form the collection and the same can be printed or displayed. It is also possible to repeat a line without a collection in context of variable usage.

### Meta

- **Aliases**: Repeat
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the line which you need to repeat. | Identifier | Yes | Yes | No | Line | No |
| 2 | To specify on which collection it should repeat and retreive the data. | Identifier | No | Yes | No | Collection | No |
| 3 | To specify on which collection it should repeat and retreive the data. | Value | No | No | No |  | No |

---

## Retain Focus

It indicates that part should retain information about the line which is currently in focus even if the focus is moved to other part.

### Meta

- **Aliases**: Retain Focus
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Setting this to 'Yes' allows the part to make the same line as the current line when it gets back the focus. | Value | Logical | No | No | No | No |

---

## Scroll

This attribute has to be specified if a line or field that is repeated with respect to a collection. If this attribute is set to No (default value), all the lines that are displayed will be shrunk into the part and may be illegible to view.

### Meta

- **Aliases**: Scroll, Scrolled
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | The value Yes allows the part to be scrolled vertically or both vertically and horizontally. | Keyword | No | Yes | No | Scroll Type | Both, Flow, Horizontal, Vertical | No |

---

## Scroll Indicator Style

This attribute is used to set the style of the scroll indicator in the part. It will be applicable only when vertical scrolling is enabled within the part.

### Meta

- **Aliases**: Scroll Indicator Style
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of the style of the scroll indicator. | Identifier | No | No | No | Style | No |

---

## Select

It indicates that the lines owned by this Part are selectable or not and the default value for the same is Yes.

### Meta

- **Aliases**: Select, Selectable
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Yes indicates that the lines are Selectable. | Value | Logical | No | No | No | No |

---

## Set

This attribute sets number of lines to be displayed in the part.

### Meta

- **Aliases**: Set, Set as
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The formula specifying no of lines. | Value | Long | No | No | No | No |

---

## Set Always

This attribute sets the values defined in the fields of the Part dynamically.  whenever any changes take place in the values of the fields which are dependent on the fields in the part, they are always modified.

### Meta

- **Aliases**: Set Always
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify that  the field value should get updated every time when there is a change in dependent part / field / formula etc. | Value | Logical | No | No | No | No |

---

## Shorten Y Axis Label

This attribute is used to shorten the y-axis labels and provide a legend in case the values are above thresholds, such as showing in thousands, if the value is above 999. Its default value is set to FALSE.

### Meta

- **Aliases**: Shorten Y Axis Label
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies whether the graph's y-axis labels are to be shortened or not. | Value | Logical | No | No | No | No |

---

## Skip Forward

This attribute skips the part when navigating forward using the right or bottom arrow key. The focus returns to the part when navigating backwards using the left or up arrow key from the next part.

### Meta

- **Aliases**: Skip Forward
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression which evaluates to a logical value that controls the behavior. | Value | Logical | No | No | No | No |

---

## Space Bottom

This attribute helps to specify the bottom space that a part should have.

### Meta

- **Aliases**: Space Bottom
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The attribute specifies space at the bottom of the Part. | Value | Number | No | No | No | Yes |

---

## Space Left

This attribute helps to specify the left space that a part should have.

### Meta

- **Aliases**: Space Left
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The attribute specifies space at the left of the Part. | Value | Number | No | No | No | Yes |

---

## Space Right

This attribute helps to specify the right space that a part should have.

### Meta

- **Aliases**: Space Right
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The attribute specifies space at the right of the Part. | Value | Number | No | No | No | Yes |

---

## Space Top

This attribute helps to specify the top space that a part should have.

### Meta

- **Aliases**: Space Top
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The attribute specifies space at the top of the Part. | Value | Number | No | No | No | Yes |

---

## Stripe

This attribute enables (Yes) /disables (No) Stripes for the Part to improve readability. By default it'll be set as Yes and specific format of data will have Stripes enabled. The behavior can be overridden by usage of same attribute in the children (Part, Line).

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
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | Yes | Yes | Part | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | No | No |  | No |

---

## Sync

This attribute determines synchronization of horizontal or vertical Parts of the Part. Default value of this attribute is NO.

### Meta

- **Aliases**: Sync, Synchronize
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the part need to be synchronised or not. | Value | Logical | No | No | No | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Part | No |

---

## Vertical

This attribute determines whether the Parts defined under the Part needs to be aligned Vertical or Horizontal. If the attribute value is set to yes then the parts are vertically aligned else they are horizontally aligned.

### Meta

- **Aliases**: Vertical
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify if the parts to be vertically aligned or horizontaly aligned. | Value | Logical | No | No | No | No |

---

## Vertical Align

This attribute specifies the vertical alignment of the part.

### Meta

- **Aliases**: Vertical Align, Vertical Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Top, Bottom, Centre. | Keyword | No | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Width

The attribute specifies total width of the Part. This can be specified in percentages of the page or in mms.

### Meta

- **Aliases**: Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the width of the part. | Value | Number | No | No | No | Yes |

---

## X Axis Label Word Wrap

This attribute is used to specify whether the x-axis label text in the graph should undergo word/text wrapping.

### Meta

- **Aliases**: X Axis Label Word Wrap
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify any logical expression. | Value | Logical | No | No | No | No |

---

## XMLAttr

Specifies the Attribute and attribute value for the xml tag.

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
