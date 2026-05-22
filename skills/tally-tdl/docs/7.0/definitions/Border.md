# Border Definition

> **Version**: 7.0

Reference documentation for all entries in the **Border** definition.

> **Total Entries**: 10

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Bottom](#bottom)
- [Color](#color)
- [Left](#left)
- [Print FG](#print-fg)
- [Right](#right)
- [Top](#top)
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

## Bottom

Specifies the type of border to draw the Bottom. Parameters may be specified using comma-separated parameters.

### Meta

- **Aliases**: Bottom
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It takes the following values: [Thin/Thick], [Flush], [FullLength], [Double] Thin: specifies a thin line border. Thick: specifies a thick line border. Flush: When space top/bottom is used in line/part etc. this can be used so that the space will be left at top/bottom after the border. Full Length: It draws the complete border including specified space left/right. Double: It draws double lined border. | Keyword | No | Yes | Border Type | Bold, Double Lined, Flush, Full Length, Normal, Thick, Thin | No |

---

## Color

Specifies the border color in display/alter/create mode.

### Meta

- **Aliases**: Color, Shade
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies the name of the color. | Identifier | Yes | No | No | Color | No |

---

## Left

Specifies the type of border to draw the Left. Parameters may be specified using comma-separated parameters.

### Meta

- **Aliases**: Left
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It takes the following values:[Thin/Thick], [Double], [Flush], [Full Length], [Double]. Thin: specifies a thin line border. Thick: specifies a thick line border. Double: It draws double lined border.                                          Flush: Border is drawn inclusive of the space given at the Left.   Full Length : To disregard the space given at the left or right or top or bottom and to get the border in full length.                         Double: This parameter specifies whether the line is to be single or double. If this is not specified, then the border is of single line. | Keyword | No | Yes | Border Type | Bold, Double Lined, Flush, Full Length, Normal, Thick, Thin | No |

---

## Print FG

Specifies the border color in print mode.

### Meta

- **Aliases**: Print FG
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies the border color while printing. | Identifier | Yes | No | No | Color | No |

---

## Right

Specifies the type of border to draw the Right. Parameters may be specified using comma-separated parameters.

### Meta

- **Aliases**: Right
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It takes the following values:[Thin/Thick], [Double], [Flush], [Full Length], [Double]. Thin: specifies a thin line border. Thick: specifies a thick line border. Double: It draws double lined border.                                          Flush: Border is drawn inclusive of the space given at the right.   Full Length : To disregard the space given at the left or right or top or bottom and to get the border in full length.                         Double: This parameter specifies whether the line is to be single or double. If this is not specified, then the border is of single line. | Keyword | No | Yes | Border Type | Bold, Double Lined, Flush, Full Length, Normal, Thick, Thin | No |

---

## Top

Specifies the type of border to draw the Top. Parameters may be specified using comma-separated parameters.

### Meta

- **Aliases**: Top
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This attribute takes the following values:[Thin/Thick], [Flush], [FullLength], [Double] Thin: specifies a thin line border. Thick: specifies a thick line border. Flush: When space top/bottom is used in line/part etc. this can be used so that the space will be left at top/bottom after the border. Full Length: It draws the complete border including specified space left/right. Double: It draws double lined border. | Keyword | No | Yes | Border Type | Bold, Double Lined, Flush, Full Length, Normal, Thick, Thin | No |

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
| 1 | It acts as label for grouping. | Identifier | Yes | Yes | Border | No |

---
