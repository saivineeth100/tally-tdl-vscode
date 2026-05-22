# Color Definition

> **Version**: 7.0

Reference documentation for all entries in the **Color** definition.

> **Total Entries**: 9

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Color](#color)
- [Greyback RGB](#greyback-rgb)
- [Inactive RGB](#inactive-rgb)
- [RGB](#rgb)
- [SysColor](#syscolor)
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

## Color

Specifies the hue, saturation & brightness/luminosity of a color. If we change the hue, the values for red, green, & blue will be changed to match. It ranges from 0 to 239. Saturation is the strength or purity of color in a specified hue. Luminosity is the lightness or darkness in a color. Saturation & luminosity range is from 0 to 240.

### Meta

- **Aliases**: Color, Shade
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the hue, saturation & brightness/luminosity of a color. | Value | Yes | Yes | No | No |

---

## Greyback RGB

We can specify the color to be used when the corresponding element is in greyback state.

### Meta

- **Aliases**: Greyback RGB
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the amount of red, green, & blue in the color for the corresponding element is in greyback state. | Value | Yes | Yes | No | No |

---

## Inactive RGB

We can specify the color to be used when the corresponding element is in inactive state.

### Meta

- **Aliases**: Inactive RGB
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the amount of red, green, & blue in the color for the corresponding element is in inactive state. | Value | Yes | Yes | No | No |

---

## RGB

We can use the combination of red, green, and blue to define any color. The values that Red, Green & Blue each can have, ranges from 0 to 255. This gives the user an option to select from 24 bit Colour.

### Meta

- **Aliases**: RGB
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the amount of red, green, & blue in the color. | Value | Yes | Yes | No | No |

---

## SysColor

Specifies the default system colors.

### Meta

- **Aliases**: SysColor
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It is one of the default system color. | Keyword | Yes | Yes | No | Sys Color | 3d Dark Shadow, 3d Face, 3d Highlight, 3d Light, 3d Shadow, Active Border, Active Caption, Button Text, Caption Text, Desktop, Disabled Text, Inactive Border, Inactive Caption, Inactive Caption Text, Menu Background, Menu Text, Scrollbar, Selected, Selected Text, Tooltip Background, Tooltip Text, Window Background, Window Frame, Window Text, Workspace | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Color | No |

---
