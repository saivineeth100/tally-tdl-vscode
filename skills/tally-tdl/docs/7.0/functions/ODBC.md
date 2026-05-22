# ODBC Function

> **Version**: 7.0

Reference documentation for all entries in the **ODBC** function.

> **Total Entries**: 3

## Table of Contents

- [XMLAttr](#xmlattr)
- [XMLCount](#xmlcount)
- [XMLValue](#xmlvalue)

---

## XMLAttr

It finds the attributes in XML document

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: ODBC
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Collection name | Identifier | Yes | Collection | No |
| 2 | Attribute name | Value | Yes |  | No |
| 3 | Attribute name | Value | Yes |  | No |

---

## XMLCount

It finds the number of XML nodes present in a collection

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: ODBC
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Collection name | Identifier | Yes | Collection | No |
| 2 | Collection name | Value | Yes |  | No |
| 3 | NodeName:Pos:Path to NodeName from root. | Value | Yes |  | No |

---

## XMLValue

This function finds the value of a XML node

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: ODBC
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Collection name | Identifier | Yes | Collection | No |
| 2 | NodeName:Pos:Path to NodeName from root. | Value | Yes |  | No |

---
