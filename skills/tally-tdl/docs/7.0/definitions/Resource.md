# Resource Definition

> **Version**: 7.0

Reference documentation for all entries in the **Resource** definition.

> **Total Entries**: 8

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Data Source](#data-source)
- [Resource](#resource)
- [Resource Type](#resource-type)
- [Source](#source)
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

## Data Source

Specifies data source from the binary data.

### Meta

- **Aliases**: Data Source
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Binary data from the data source. | Value | Yes | No | No | No |

---

## Resource

Specifies the value for the source to be used for displaying the resource

### Meta

- **Aliases**: Resource
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the resource | Value | String | Yes | No | No | No |
| 2 | Specifies the name of binary (exe/dll) for the resource given in previous attribute, This is optional | Value | String | No | No | No | No |

---

## Resource Type

It specifies the type of the resource based on the resource file type.

### Meta

- **Aliases**: Resource Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It will accept a valid resource type like Word   XML, Excel XML, XML, JSON, ODT, ODS, JPEG, Cursor, BMP, TSF and Icon. | Keyword | Yes | Yes | No | Resource Type | Bmp, CSS, Cursor, ExcelXML, Gif, HTML, Icon, JAVASCRIPT, Jpeg, JSON, JSONSchema, MSEXCEL, ODS, ODT, Png, TSF, TTFFONT, WordXML, XML | No |

---

## Source

To specify the source file path.

### Meta

- **Aliases**: Source
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The file path along with the name of the source file. | Value | String | Yes | No | No | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Resource | No |

---
