# Rule Set Definition

> **Version**: 7.0

Reference documentation for all entries in the **Rule Set** definition.

> **Total Entries**: 12

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Aggr Rule](#aggr-rule)
- [Break On](#break-on)
- [Local Formula](#local-formula)
- [Name Map](#name-map)
- [NameSet](#nameset)
- [Rule](#rule)
- [Rule Set](#rule-set)
- [Use](#use)
- [Walk On](#walk-on)

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

## Aggr Rule

This attribute specifies the user defined aggregations that will be precomputed from the Rule Set in which it is specified.

### Meta

- **Aliases**: Aggr Rule
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the Name (Aggr Rule Identifier) for the aggregate rule that is to be precomputed. | Identifier | Yes | Yes |  |  | No |
| 2 | Specifies the type of aggregation to be performed. This is a predefined list. | Keyword | Yes | Yes | Aggregate Rule | All True, AND, Any True, OR | No |
| 3 | Specifies the type of aggregation to be performed. This is a predefined list. | Identifier | No | Yes |  |  | No |

---

## Break On

Break On attribute allows you to control the execution flow after executing the current rule. It provides vertical flow control for evaluating the rules. If this attribute is not specified, it is assumed that execution should never break.

### Meta

- **Aliases**: Break On
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies if further rule execution should break or continue. If the current rule result matches this value, the execution of rules in the current Rule Set will stop after the current rule. | Value | Logical | Yes | Yes | No | No |

---

## Local Formula

This is used to specify a local formula within the Rule Set.

### Meta

- **Aliases**: Local Formula
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | The name of the Local Formula. | Identifier | Yes | Yes | No |
| 2 | The expression which needs to be evaluated. | Value | Yes | No | No |

---

## Name Map

Specifies mapping of a rule to a specific rule description.

### Meta

- **Aliases**: Name Map
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the rule identifier for which the description mapping must be done. | Identifier | Yes | Yes |  | No |
| 2 | Specifies the name identifier (as defined in the Name Set). | Identifier | Yes | Yes |  | No |
| 3 | Specifies the name identifier (as defined in the Name Set). | Identifier | No | Yes | Name Set | No |

---

## NameSet

This attribute specifies Name Set for mapping the rules to their respective descriptions. All strings from the specified Name Set are referred to as rule descriptions.

### Meta

- **Aliases**: NameSet
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies a Name Set definition for mapping the rules to their rule descriptions (Strings). | Identifier | Yes | Yes | No | Name Set | No |

---

## Rule

This attribute specifies a rule for the current Rule Set. It can be repeated for specifying more rules.

### Meta

- **Aliases**: Rule
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies a rule identifier for the current rule. | Identifier |  | Yes | Yes |  |  | No |
| 2 | Logical expression which is evaluated in the context of requester/source/target object being passed from the evaluation context. | Value | Logical | Yes | No |  |  | No |
| 3 | Logical expression which is evaluated in the context of requester/source/target object being passed from the evaluation context. | Keyword |  | No | Yes | Rule Break On | False, Never, No, True, Yes | No |

---

## Rule Set

Specifies a single next dimensional Rule Set. This can be repeated to specify more than one Rule Set as next dimension.

### Meta

- **Aliases**: Rule Set
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies a Rule Set definition as the next dimension. | Identifier | Yes | Yes | Rule Set | No |
| 2 | The comma separated list of rules of current Rule Set for which this Rule Set is the next dimension. If not specified, the dimension is applicable for all the rules in the current Rule Set. | Identifier | No | Yes |  | No |
| 3 | The comma separated list of rules of current Rule Set for which this Rule Set is the next dimension. If not specified, the dimension is applicable for all the rules in the current Rule Set. | Identifier | No | Yes |  | No |

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
| 1 | Name of the definition to be used | Identifier | No | Yes | Rule Set | No |

---

## Walk On

Walk On condition controls the hierarchical execution flow after a rule is executed. If not specified, it is assumed that next dimension evaluation should always be done.

### Meta

- **Aliases**: Walk On
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies if the next dimensional Rule Set(s) must be executed for the current rule or not. If the current rule result matches this value, the next dimensional Rule Set(s) will be executed. | Value | Logical | Yes | Yes | No | No |

---
