# COM Interface Definition

> **Version**: 7.0

Reference documentation for all entries in the **COM Interface** definition.

> **Total Entries**: 9

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Class](#class)
- [Interface](#interface)
- [Parameter](#parameter)
- [Project](#project)
- [Return](#return)
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

## Class

Name of the class to be used.

### Meta

- **Aliases**: Class
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the class. | Value | String | Yes | No | No | No |

---

## Interface

Name of the external function which needs to be called with the help og this description.

### Meta

- **Aliases**: Interface
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the external function defined inside a class/namespace of 3rd party COM Server. | Value | String | Yes | No | No | No |

---

## Parameter

This attribute is used to specify the parameter name/datatype and whether it is in or out for a COM Interface.

### Meta

- **Aliases**: Parameter, Parameters
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is the name of the Parameter in COM Interface description. | Identifier | Yes | Yes |  |  | No |
| 2 | Data type of the parameter. | Keyword | Yes | Yes | COMDatatype | Amount, Bool, Boolean, Byte, Char, Currency, Date, Double, Float, Integer, Logical, Long, Long Long, Number, Scode, Short, String, Unsigned char, Unsigned Integer, Unsigned Long, Unsigned Long Long, Unsigned short, Variant, WChar | No |
| 3 | Data type of the parameter. | Keyword | No | Yes | ParamInOut | In, In Out, Out | No |

---

## Project

Name of the project/namespace which contains the class to be used.

### Meta

- **Aliases**: Project
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the project/namespace. | Value | String | Yes | No | No | No |

---

## Return

Return type of the function.

### Meta

- **Aliases**: Return, Returns
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Return datatype of the function being described. | Keyword | Yes | Yes | No | Method | Aggregate, Amount, Date, DateTime, Due Date, Duration, FlagSet, Logical, Long, Number, NumSet, Quantity, Rate, Rate of Exchange, String, Sys Id, Time | No |

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
| 1 | It acts as label for grouping. | Identifier | Yes | Yes | COM Interface | No |

---
