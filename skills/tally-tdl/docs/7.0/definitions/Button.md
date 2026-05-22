# Button Definition

> **Version**: 7.0

Reference documentation for all entries in the **Button** definition.

> **Total Entries**: 37

## Table of Contents

- [Action](#action)
- [Action List](#action-list)
- [ActionEx](#actionex)
- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Background](#background)
- [Border](#border)
- [BottomToolbar Position](#bottomtoolbar-position)
- [Cancel](#cancel)
- [Color](#color)
- [Focus BG](#focus-bg)
- [Height](#height)
- [Help](#help)
- [Horizontal Align](#horizontal-align)
- [Image](#image)
- [Inactive Color](#inactive-color)
- [Key](#key)
- [Key Color](#key-color)
- [Key Style](#key-style)
- [Key Vertical Align](#key-vertical-align)
- [Line](#line)
- [Mode](#mode)
- [Modifier Button](#modifier-button)
- [Option](#option)
- [Scope](#scope)
- [Skip Forward](#skip-forward)
- [Space Left](#space-left)
- [Space Right](#space-right)
- [Style](#style)
- [Switch](#switch)
- [Title](#title)
- [Tooltip](#tooltip)
- [Type](#type)
- [Use](#use)
- [Vertical Align](#vertical-align)
- [Width](#width)

---

## Action

It specifies the action that is to be performed if the button/Key is clicked / activated.

### Meta

- **Aliases**: Action
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It can be any Global or Object Specific Action except the Function specific Actions. | Keyword | Yes | Yes | No | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 2 | The various parameters seperated by a colon as required by the Action specified. | Value | No | Yes | No |  |  | No |

---

## Action List

Lists the Key Names which are to be triggered in sequence when this button/key is clicked / activated.

### Meta

- **Aliases**: Action List
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the Key/ Button. | Identifier | No | Yes | Key | No |

---

## ActionEx

Use ActionEx to specify multiple actions for execution on invoking a key or button.

### Meta

- **Aliases**: ActionEx
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | A string to uniquely identify the specified action. | Identifier | Yes | Yes |  |  | No |
| 2 | A global or object specific action except function specific action. | Keyword | Yes | Yes | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 3 | A global or object specific action except function specific action. | Value | No | Yes |  |  | No |

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

This attribute specifies the background color for the button.

### Meta

- **Aliases**: Background
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the color. | Identifier | Yes | No | No | Color | No |

---

## Border

This attribute specifies the border for the button.

### Meta

- **Aliases**: Border
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the style. | Identifier |  | Yes | Yes | No | Border | No |
| 2 | To add borders based on the given condition. | Value | Logical | No | No | No |  | No |

---

## BottomToolbar Position

Specifies the position of the key in bottom toolbar starting from BottomToolBarBtn1 to BottomToolBarBtn10.

### Meta

- **Aliases**: BottomToolbar Position
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The button position can be any of permissible keywords starting from 'BottomToolBarBtn1' to 'BottomToolBarBtn10'. | Keyword | Yes | Yes | No | No |

---

## Cancel

It is used to deactivate the button based on some condition.

### Meta

- **Aliases**: Cancel, Inactive
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The condition which determines whether whether to deactivate the button/key. | Value | Logical | No | No | No | No |

---

## Color

This attribute specifies the foreground color for the title of the button.

### Meta

- **Aliases**: Color, Shade
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the color. | Identifier | Yes | No | No | Color | No |

---

## Focus BG

This attribute specifies the background color of the button when it is focused.

### Meta

- **Aliases**: Focus BG, Focus BG Color, Focus BG Colour, Focus BG Shade
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the color. | Identifier | Yes | No | No | Color | No |

---

## Height

This attribute specifies the height of the button.

### Meta

- **Aliases**: Height
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the height. | Value | Number | No | No | No | Yes |

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
| 1 | It is the index of the help file. | Value | Long | Yes | No | No |
| 2 | Expression that returns the GUID of the addon/module for invoking help | Value | String | No | No | No |

---

## Horizontal Align

This attribute specifies the horizontal alignment of the button. The default alignment is left.

### Meta

- **Aliases**: Horizontal Align, Horizontal Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Left, Right, Centre. | Keyword | Yes | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Image

This attribute is used to draw the image from the specified resource.

### Meta

- **Aliases**: Image
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the image to be drawn when key is active | Identifier | Yes | No | No | Resource | No |
| 2 | To specify the image to be drawn when the key is inactive | Identifier | No | No | No | Resource | No |

---

## Inactive Color

This attribute specifies the foreground  color of key and title of the button when it is inactive.

### Meta

- **Aliases**: Inactive Color, Inactive Colour, Inactive Shade
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the color. | Identifier | Yes | No | No | Color | No |

---

## Key

This attribute is used to give a unique key combination which is used to trigger the button/key when associated at various interfaces.

### Meta

- **Aliases**: Key, Keys
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the Key combinations for ex alt+ K ,ctrl+U etc. | Value | String | Yes | Yes | No | No |

---

## Key Color

This attribute specifies the foreground color of the key of the button.

### Meta

- **Aliases**: Key Color, Key Colour, Key Shade
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the color. | Identifier | Yes | No | No | Color | No |

---

## Key Style

This attribute specifies the style for the key of the button.

### Meta

- **Aliases**: Key Style
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the style. | Identifier | No | No | No | Style | No |

---

## Key Vertical Align

This attribute specifies the vertical alignment for the key of the button. The default alignment is same as vertical alignment of the button.

### Meta

- **Aliases**: Key Vertical Align, Key Vertical Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Top, Bottom, Centre. | Keyword | Yes | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Line

This attribute specifies the number of lines for the title of the button.

### Meta

- **Aliases**: Line, Lines, Top Line, Top Lines
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the number of lines. | Value | Number | No | No | No | Yes |

---

## Mode

Specifies whether the action of the key has to be performed in Display mode, Edit mode or both the modes.

### Meta

- **Aliases**: Mode
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies the mode type ie, Display, Edit, etc. | Keyword | No | Yes | No | Edit Mode | Both, Display, Edit | No |

---

## Modifier Button

This attribute specifies a dynamic modifier for the button. This allows the same button to be extended using modifier keys (E.g. Crtl, Alt, Shift) for another action.

### Meta

- **Aliases**: Modifier Button, Modifier Buttons, Modifier Key, Modifier Keys
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the modifier button. | Identifier | Yes | Yes | Key | No |

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
| 1 | This specifies the name of the Optional Key. | Identifier |  | Yes | Yes | Key | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

---

## Scope

It specifies the scope for the action which is to be performed.

### Meta

- **Aliases**: Scope
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It can have any of the following possible values: Current Line/ Line, All Lines, Selected Lines, Unselected Lines etc. | Keyword | No | Yes | No | Action Scope | All Lines, Current Line, Dashboard, Line, None, Report, Selected Lines, Unselected Lines | No |

---

## Skip Forward

This attribute skips the button while navigating forward. The focus comes back to the button when the key backsapce is pressed from the next button.

### Meta

- **Aliases**: Skip Forward
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the logical condition which controls the behavior. | Value | Logical | No | No | No | No |

---

## Space Left

This attribute specifies space to be left on the left side of the button. 

### Meta

- **Aliases**: Space Left
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Measurement. | Value | Number | No | No | No | Yes |

---

## Space Right

This attribute specifies space to be left on the right side of the button. 

### Meta

- **Aliases**: Space Right
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify a particular Measurement. | Value | Number | No | No | No | Yes |

---

## Style

This attribute specifies the style for the title of the button.

### Meta

- **Aliases**: Style
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the style. | Identifier | No | No | No | Style | No |

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
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | Yes | Yes | Key | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | No | No |  | No |

---

## Title

It can be used to give a meaningful Title to the Button being displayed on the Button Bar.

### Meta

- **Aliases**: Title
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the Title for the button. | Value | String | No | No | No | No |

---

## Tooltip

Specifies the tooltip text to be displayed on mouse hover.

### Meta

- **Aliases**: Tooltip
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | String to be displayed as tooltip for button. | Value | String | Yes | No | No | No |

---

## Type

It specifies the category of buttons.

### Meta

- **Aliases**: Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The button type can be any of the permissible types as PrintButton,Export Button,MailButton etc. | Keyword | No | Yes | No | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Key | No |

---

## Vertical Align

This attribute specifies the vertical alignment of the button. The default alignment is center.

### Meta

- **Aliases**: Vertical Align, Vertical Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Top, Bottom, Centre. | Keyword | Yes | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Width

This attribute specifies the width of the button.

### Meta

- **Aliases**: Width
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the width. | Value | Number | No | No | No | Yes |

---
