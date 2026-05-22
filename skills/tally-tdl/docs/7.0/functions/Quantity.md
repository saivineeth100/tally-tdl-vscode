# Quantity Function

> **Version**: 7.0

Reference documentation for all entries in the **Quantity** function.

> **Total Entries**: 15

## Table of Contents

- [AltBase](#altbase)
- [AsInQty](#asinqty)
- [AsOutQty](#asoutqty)
- [AsQty](#asqty)
- [AsSignedQty](#assignedqty)
- [IfCr](#ifcr)
- [IfDr](#ifdr)
- [IfForexCr](#ifforexcr)
- [IfForexDr](#ifforexdr)
- [IfInwards](#ifinwards)
- [IfOutwards](#ifoutwards)
- [IsInwards](#isinwards)
- [NettQty](#nettqty)
- [QtySubtract](#qtysubtract)
- [UnitSymbol](#unitsymbol)

---

## AltBase

This function sets all values of quantity with respect to the base values.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Logical value. | Value | Logical | Yes | No |
| 2 | This is an expression which evaluates to Logical value. | Value | Quantity | Yes | No |

---

## AsInQty

This function treats the quantity received as Inward Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity. | Value | Yes | No |

---

## AsOutQty

This function defines the quantity sent as Outward Quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity. | Value | Yes | No |

---

## AsQty

This function converts the numeric expression to quantity.  It compares a quantity with non quantity numeric expression.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any numeric expression. | Value | Yes | No |

---

## AsSignedQty

This function is used to change the sign of the supplied value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity value. To this quantity a sign is to be added. | Value | Yes | No |

---

## IfCr

This function verifies if the value is a Credit value and returns True.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount value. | Value | Yes | No |

---

## IfDr

This function verifies if the value is a Debit value and returns True.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount value. | Value | Yes | No |

---

## IfForexCr

This function verifies if the Forex value is a Credit value and returns True.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount value. | Value | Yes | No |

---

## IfForexDr

This function verifies if the Forex value is a Debit value and returns True.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount value. | Value | Yes | No |

---

## IfInwards

This function returns True if the quantity is an Inward quantity and returns True.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity value. | Value | Yes | No |

---

## IfOutwards

This function verifies and returns True if the quantity is an Outward quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity value. | Value | Yes | No |

---

## IsInwards

This function returns True if the quantity is an Inward quantity.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity value. | Value | Quantity | Yes | No |

---

## NettQty

This function gives the Nett Quantity of the parameters passed.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity. | Value | Quantity | Yes | No |
| 2 | This is an expression which evaluates to Quantity. | Value | Quantity | No | No |

---

## QtySubtract

This function is used to subtract two quantity values which are passed as a parameter. It accepts two parameters of type Quantity and returns a quantity value along with units.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client
- **Return Type**: Quantity

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity. | Value | Quantity | Yes | No |
| 2 | This is an expression which evaluates to Quantity. | Value | Quantity | No | No |

---

## UnitSymbol

This function gives the unit in which quantities are measured. When the above function is applied for quantities the unit in which the quantities are measured will be returned.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Quantity
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity. | Value | Yes | No |

---
