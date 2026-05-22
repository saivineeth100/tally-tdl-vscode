# Menu Definition

> **Version**: 7.0

Reference documentation for all entries in the **Menu** definition.

> **Total Entries**: 21

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Border3D](#border3d)
- [Bottom Button](#bottom-button)
- [Button](#button)
- [Control](#control)
- [Gradient](#gradient)
- [Help](#help)
- [Item](#item)
- [Key Item](#key-item)
- [Indent](#indent)
- [Key](#key)
- [Local](#local)
- [Local Formula](#local-formula)
- [Option](#option)
- [Switch](#switch)
- [Symbol](#symbol)
- [Title](#title)
- [ToolBar Button](#toolbar-button)
- [Use](#use)

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

## Border3D

It applies 3D border to the Menu.

### Meta

- **Aliases**: Border3D
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Bottom Button

List the buttons to be displayed at the bottom of the bar when the menu is triggered.

### Meta

- **Aliases**: Bottom Button, Bottom Buttons
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the Button. | Identifier | No | Yes | Key | No |

---

## Button

List the buttons to be displayed at the top of the bar when the menu is triggered.

### Meta

- **Aliases**: Button, Buttons, Top Button, Top Buttons
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the Button. | Identifier | No | Yes | Key | No |

---

## Control

Controls the display of the specified menu item.

### Meta

- **Aliases**: Control
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the Item in the menu. | Value |  | Yes | No | No |
| 2 | Condition is based on which the menu item is displayed. | Value | Logical | No | No | No |

---

## Gradient

It applies Gradience to the Menu.

### Meta

- **Aliases**: Gradient
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Logical Value either Yes/No. | Value | Logical | No | No | No | No |

---

## Help

This attribute takes the System formula which in turn has a Help ID or the Help id as its parameter, the id connects the menu with a particular help file.

### Meta

- **Aliases**: Help
- **Type**: Dual List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the index of the help file. | Value | Long | No | No | No |
| 2 | Expression that returns the GUID of the addon/module for invoking help | Value | String | No | No | No |

---

## Item

Adds an Item to the menu.

### Meta

- **Type**: Menu Item List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | Adds an Item to the menu. | Yes | No | No |

---

## Key Item

Adds an Item to the menu.

### Meta

- **Type**: Menu Item List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | Adds an Item to the menu. | Yes | No | No |

---

## Indent

Adds an Item to the menu.

### Meta

- **Type**: Menu Item List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | Adds an Item to the menu. | Yes | No | No |

---

## Key

Adds a hot key to the menu item specified.

### Meta

- **Aliases**: Key, Keys
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | Name of the Menu Item. | Value | Yes | No | No |
| 2 | Single character hot key for the menu item specified. | Value | No | No | No |

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

This is used to specify a local formula within the Menu.

### Meta

- **Aliases**: Local Formula
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | The name of the Local Formula. | Identifier | Yes | Yes | No |
| 2 | The expression which needs to be evaluated. | Value | No | No | No |

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
| 1 | This specifies the name of the Optional Menu | Identifier |  | Yes | Yes | Menu | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

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
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | No | Yes | Menu | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | No | No |  | No |

---

## Symbol

It appends the specified unicode character to the specified menu item based on the specified condition.

### Meta

- **Aliases**: Symbol
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the menu item for which symbol is specified. | Value |  | Yes | No | No |
| 2 | Character symbol to be displayed for the specified menu item. | Value |  | Yes | No | No |
| 3 | Character symbol to be displayed for the specified menu item. | Value | Logical | No | No | No |

---

## Title

It gives the title for the menu

### Meta

- **Aliases**: Title
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It accepts any valid string value. | Value | String | No | No | No | No |

---

## ToolBar Button

Adds the buttons to Toolbar.

### Meta

- **Aliases**: ToolBar Button, ToolBar Buttons
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the Button. | Identifier | No | Yes | Key | No |

---

## Use

The USE keyword is used in a definition to reuse an existing definition.

### Meta

- **Aliases**: Use
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It acts as label for grouping. | Identifier | No | Yes | Menu | No |

---
