# QueryBox Definition

> **Version**: 7.0

Reference documentation for all entries in the **QueryBox** definition.

> **Total Entries**: 6

## Table of Contents

- [Default](#default)
- [Gray Background](#gray-background)
- [Horizontal Align](#horizontal-align)
- [Query](#query)
- [Title](#title)
- [Vertical Align](#vertical-align)

---

## Default

Sets the default index to be selected if enter or escape key is pressed.

### Meta

- **Aliases**: Default
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the index to be selected if Enter key is pressed. | Value | Number | Yes | No | No | No |
| 2 | To specify the index to be selected if Escape key is pressed. | Value | Number | Yes | No | No | No |

---

## Gray Background

Specifies if background screen needs to be grayed.

### Meta

- **Aliases**: Gray Background, Grey Background
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which specifies if background needs to be grayed. | Value | Logical | Yes | No | No | No |

---

## Horizontal Align

Specifies the horizontal alignment of the querybox on screen.

### Meta

- **Aliases**: Horizontal Align, Horizontal Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Left,Right,Centre. | Keyword | No | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Query

Lists the query message and key.

### Meta

- **Aliases**: Query
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the Hot Key such as 'Y' etc. | Value | String | Yes | No | No |
| 2 | Specifies the Query option string. | Value | String | Yes | No | No |
| 3 | Specifies the Query option string. | Value | String | No | No | No |

---

## Title

It displays the messsage for the querybox in the corner.

### Meta

- **Aliases**: Title
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the value of the Query Box Title. | Value | String | Yes | No | No | No |

---

## Vertical Align

Specifies the vertical alignment of the query box on screen. The alignment of the form across the height of the page is set by this attribute.

### Meta

- **Aliases**: Vertical Align, Vertical Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the alignment type as Top,Bottom,Centre. | Keyword | No | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---
