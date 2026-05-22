# Object Map Definition

> **Version**: 7.0

Reference documentation for all entries in the **Object Map** definition.

> **Total Entries**: 19

## Table of Contents

- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Copy Object](#copy-object)
- [Delete Collection Object](#delete-collection-object)
- [Insert Collection Object](#insert-collection-object)
- [Local Formula](#local-formula)
- [Object Map](#object-map)
- [Repeat](#repeat)
- [Reset Values](#reset-values)
- [Set](#set)
- [Set Direct Values](#set-direct-values)
- [Set Multi Values](#set-multi-values)
- [Set Var](#set-var)
- [Source Object](#source-object)
- [Target Object](#target-object)
- [Target Object Ex](#target-object-ex)
- [Use](#use)
- [Variable](#variable)

---

## Add

These modifiers are used in a definition to Add an attribute in the definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | These modifiers are used in a definition to Add an attribute in the definition. | Yes | No | No |

---

## Replace

These modifiers are used in a definition to Replace an attribute in the definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | These modifiers are used in a definition to Replace an attribute in the definition. | Yes | No | No |

---

## Delete

These modifiers are used in a definition to Delete an attribute in the definition.

### Meta

- **Type**: Modifier List
- **Is Discrete**: No

### Parameters

| # | Description | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- |
| 1 | These modifiers are used in a definition to Delete an attribute in the definition. | Yes | No | No |

---

## Copy Object

This attribute is used to copy values of objects from the source object context into the target object context.

### Meta

- **Aliases**: Copy Object
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to indicate whether to copy direct methods or full objects. | Keyword | Yes | Yes | No | Object Copy Type | Direct Methods Only, Dir Methods Only, Full, Primary Methods Only | No |

---

## Delete Collection Object

This attribute helps to delete the objects of the collection based on the index and condition given.

### Meta

- **Aliases**: Delete Collection Object
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to indicate the name of the collection from which objects are needed to be deleted. | Identifier |  | Yes | Yes | Collection | No |
| 2 | This sub-attribute is used to indicate a particular object in the collection that will get deleted. | Value | Long | No | Yes |  | No |
| 3 | This sub-attribute is used to indicate a particular object in the collection that will get deleted. | Value | Logical | No | No |  | No |

---

## Insert Collection Object

This attribute is used to insert the new object inside the sub-collection

### Meta

- **Aliases**: Insert Collection Object
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to indicate the name of the collection in which new objects are needed to be added. | Identifier | Yes | Yes | No | Collection | No |

---

## Local Formula

This attribute is used to specify a local formula within the Object Map.

### Meta

- **Aliases**: Local Formula
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to define the name of the Local Formula. | Identifier |  | Yes | Yes | No |
| 2 | This sub-attribute is used to define the expression which needs to be evaluated. | Value | Logical | Yes | No | No |

---

## Object Map

This attribute is used to call another object map definition.

### Meta

- **Aliases**: Object Map
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the object map definition that needs to be executed. | Identifier |  | Yes | Yes | Object Map | No |
| 2 | This sub-attribute is used to specify the condition which is evaluated if true. | Value | Logical | No | No |  | No |

---

## Repeat

This attribute is used to walk over the collection and to perform mappings, the Object Map Name specified here is repeated over the specified collection.

### Meta

- **Aliases**: Repeat
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the name of the object map definition. | Identifier |  | Yes | Yes | Object Map | No |
| 2 | This sub-attribute is used to specify the name of the collection. | Identifier |  | Yes | Yes | Collection | No |
| 3 | This sub-attribute is used to specify the name of the collection. | Value | Logical | No | No |  | No |

---

## Reset Values

This attribute is used to reset the value of storage based on the condition given.

### Meta

- **Aliases**: Reset Values
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to mention multiple storages. | Identifier |  | Yes | Yes | No |
| 2 | This sub-attribute is used to give conditions which will be evaluated. | Value | Logical | No | No | No |

---

## Set

This attribute is used to initialize and set value for the storages of the target object.

### Meta

- **Aliases**: Set, Set as
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to give the name of the method. | Identifier |  | Yes | Yes | No |
| 2 | This sub-attribute is used to give a value expression to set the method to. | Value |  | No | No | No |
| 3 | This sub-attribute is used to give a value expression to set the method to. | Value | Logical | No | No | No |

---

## Set Direct Values

This attribute is used when we have to set the storage value from the source object to the target object.

### Meta

- **Aliases**: Set Direct Values
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the storage name of the Target object. | Identifier | Yes | Yes | No |
| 2 | This sub-attribute is used to specify the storage name of the Source object. | Identifier | No | Yes | No |

---

## Set Multi Values

This attribute is used to initialize and set values for the multiple methods of the target object which have the same name.

### Meta

- **Aliases**: Set Multi Values
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the list of fields. | Identifier |  | Yes | Yes | No |
| 2 | This sub-attribute is used to specify the condition which needs to be evaluated with respect to the source object context. | Value | Logical | No | No | No |

---

## Set Var

This attribute is used to set the values to a variable conditionally.

### Meta

- **Aliases**: Set Var
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the name of the variable. | Identifier |  | Yes | Yes | Variable | No |
| 2 | This sub-attribute is used to specify the value expression to set the variable to. | Value |  | Yes | No |  | No |
| 3 | This sub-attribute is used to specify the value expression to set the variable to. | Value | Logical | No | No |  | No |

---

## Source Object

This attribute is used to for setting the primary or sub-object as the source object using method formula syntax.

### Meta

- **Aliases**: Source Object
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the formula which is used to specify the Object to be associated with the Object Map using dotted method syntax. | Value | Yes | Yes | No | No |

---

## Target Object

This attribute is used to for setting the primary or sub-object as the target object using method formula syntax.

### Meta

- **Aliases**: Target Object
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the formula which is used to specify the Object to be associated with the Object Map using dotted method syntax. | Value | Yes | Yes | No | No |

---

## Target Object Ex

This attribute is used for setting the sub-object as target object from a sub-collection, based on a condition. If object is not found, it will insert an object in the collection and set it as the target.

### Meta

- **Aliases**: Target Object Ex
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to indicate the name of the collection. | Identifier |  | Yes | Yes | No | Collection | No |
| 2 | This sub-attribute is used to specify the index. | Value | Long | No | Yes | No |  | No |
| 3 | This sub-attribute is used to specify the index. | Value | Logical | No | No | No |  | No |

---

## Use

This keyword is used as a definition to reuse an existing definition.

### Meta

- **Aliases**: Use
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute acts as a label for grouping. | Identifier | No | Yes | Object Map | No |

---

## Variable

This attribute is used to declare the variables at the Object Map level.

### Meta

- **Aliases**: Variable, Variables
- **Type**: Variable List

### Parameters

_No parameters._

---
