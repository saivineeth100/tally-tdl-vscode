# Key Value Map Definition

> **Version**: 7.0

Reference documentation for all entries in the **Key Value Map** definition.

> **Total Entries**: 8

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Default](#default)
- [Key](#key)
- [Key Type](#key-type)
- [Key Value](#key-value)
- [Use](#use)

---

## Add

These attributes are used in a definition to Add an attribute to the Definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | These attributes are used in a definition to Add an attribute to the Definition. | Yes | No | No |

---

## Replace

These attributes are used in a definition to Replace an attribute to the Definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | These attributes are used in a definition to Replace an attribute to the Definition. | Yes | No | No |

---

## Delete

These attributes are used in a definition to Delete an attribute to the Definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | These attributes are used in a definition to Delete an attribute to the Definition. | Yes | No | No |

---

## Default

This attribute is used to specify the TDL expression which will be used if the match is not found

### Meta

- **Aliases**: Default
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the TDL expression for returning the default value if the match is not found | Value | Yes | No | No | No |

---

## Key

This attribute is used to specify the list of key constant values which will be used as keys for the map to search

### Meta

- **Aliases**: Key, Keys
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the constant key value | Value | Yes | Yes | No |

---

## Key Type

This attribute is used to allow the specification of data type for the key of a map

### Meta

- **Aliases**: Key Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to define the data type of the Key | Keyword | Yes | Yes | No | Key Value Type | Error Id, Long, String, Sys Id | No |

---

## Key Value

This attribute is used to specify the map between the key and the TDL expression

### Meta

- **Aliases**: Key Value
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the constant key value | Value | Yes | Yes | No |
| 2 | This sub-attribute is used to specify the TDL expression | Value | Yes | No | No |

---

## Use

This attribute is used as a keyword in a definition to reuse an existing definition.

### Meta

- **Aliases**: Use
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute acts as a label for grouping. | Identifier | No | Yes | Key Value Map | No |

---
