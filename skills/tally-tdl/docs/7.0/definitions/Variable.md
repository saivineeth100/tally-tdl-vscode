# Variable Definition

> **Version**: 7.0

Reference documentation for all entries in the **Variable** definition.

> **Total Entries**: 15

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Default](#default)
- [List Var](#list-var)
- [Local](#local)
- [Persist](#persist)
- [Repeat](#repeat)
- [Set Always](#set-always)
- [System Name](#system-name)
- [Table](#table)
- [Type](#type)
- [Use](#use)
- [Variable](#variable)
- [Volatile](#volatile)

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

## Default

Gives the default value of the variable.

### Meta

- **Aliases**: Default
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To set the default value for the variable. | Value | No | No | No | No |

---

## List Var

Specify a list of either a Simple or Compound Variable.

### Meta

- **Aliases**: List Var, List Variable
- **Type**: Variable List

### Parameters

_No parameters._

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

## Persist

Specifies whether the value of the variable can be persisted/retained across multiple tally instances or not.

### Meta

- **Aliases**: Persist, Persistent
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | When it is set to Yes, the variable will retain its value even after exiting tally.(Default value: No) | Value | Logical | No | No | No | No |

---

## Repeat

Specifies the name of the Collection based on which the variable assumes multiple vales in context of a multi-columnar report.

### Meta

- **Aliases**: Repeat
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a collection name. | Identifier |  | Yes | No | No | Collection | No |
| 2 | This is the name of the method from the collection from which the value is picked up for the variable. | Value | String | No | No | No |  | No |

---

## Set Always

It modifies the value of the variable immediately.

### Meta

- **Aliases**: Set Always
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a logical value which  accepts either Yes or No. | Value | Logical | No | No | No | No |

---

## System Name

Specifies whether sysnames can be stored in the variable.

### Meta

- **Aliases**: System Name
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | If it is YES the variable can hold a sysname. | Value | Logical | No | No | No | No |

---

## Table

This attribute overrides the default collection used in the variable.  This attribute is used locally in a report to override the default table for the variable.

### Meta

- **Aliases**: Table, Tables
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is a collection which overrides the default collection for the variable. | Identifier | No | No | No | Collection | No |

---

## Type

Specifies the type of the data held by the variable.

### Meta

- **Aliases**: Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It refers to the type of data to be stored in the variable. | Keyword | No | Yes | No | Method | Aggregate, Amount, Date, DateTime, Due Date, Duration, FlagSet, Logical, Long, Number, NumSet, Quantity, Rate, Rate of Exchange, String, Sys Id, Time | No |

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
| 1 | It acts as label for grouping. | Identifier | No | Yes | Variable | No |

---

## Variable

To specify a Simple or Compound Variable within a Variable Definition.

### Meta

- **Aliases**: Variable, Variables
- **Type**: Variable List

### Parameters

_No parameters._

---

## Volatile

Specifies whether the value of the variable can retained across multiple scopes.

### Meta

- **Aliases**: Volatile
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | When it is set to Yes, the variable reatins the previous value from the caller scope   in current instance of Tally. (Default value: Yes) | Value | Logical | No | No | No | No |

---
