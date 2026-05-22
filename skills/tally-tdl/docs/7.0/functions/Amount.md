# Amount Function

> **Version**: 7.0

Reference documentation for all entries in the **Amount** function.

> **Total Entries**: 17

## Table of Contents

- [AmountAdd](#amountadd)
- [AmountSubtract](#amountsubtract)
- [AsAmount](#asamount)
- [AsCrAmt](#ascramt)
- [AsDrAmt](#asdramt)
- [BaseValue](#basevalue)
- [Currency](#currency)
- [ForexValue](#forexvalue)
- [InDigits](#indigits)
- [IsBaseCurrency](#isbasecurrency)
- [IsDebit](#isdebit)
- [IsDr](#isdr)
- [IsForexDr](#isforexdr)
- [NettAmount](#nettamount)
- [RateXValue](#ratexvalue)
- [SignedAmount](#signedamount)
- [WithForexRate](#withforexrate)

---

## AmountAdd

This function adds the two amount values passed as parameters.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Amount | Yes | No |
| 2 | This is an expression which evaluates to a Amount. | Value | Amount | No | No |

---

## AmountSubtract

This function subtracts the second amount value from the first amount value which are passed as parameters.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Amount | Yes | No |
| 2 | This is an expression which evaluates to a Amount. | Value | Amount | No | No |

---

## AsAmount

Thist function is used to convert data types of the value from one form to amount type. This function states the calculated value as an Amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any numeric expression. | Value | Yes | No |

---

## AsCrAmt

This function is used to set the amount passed as credit amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Yes | No |

---

## AsDrAmt

This function is used to set the amount passed as debit amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Yes | No |

---

## BaseValue

This function provides the Value in the specified Base Currency. This function accepts a parameter of type Amount and returns the value in specified Base Currency.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Yes | No |

---

## Currency

This function displays the Currency of a Particular Ledger by accepting a Parameter of type Amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Yes | No |

---

## ForexValue

This function converts the Currency value from one form to another. The function $$ForexValue is used to convert the currency value which is supplied as parameter to Forex value. It accepts a single parameter and returns value of type Amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount/Rate. | Value | Yes | No |

---

## InDigits

This function converts the supplied Amount to digit in words.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Amount | Yes | No |
| 2 | This is an expression which evaluates to a Amount. | Value |  | No | No |

---

## IsBaseCurrency

This function is used to check if the currency stated is the Currency of the current object.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to  Amount or Rate. | Value | Yes | No |

---

## IsDebit

This function is used to check if the amount is a Debit amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Amount | Yes | No |

---

## IsDr

This function is used to check if the amount is a Debit amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Amount | Yes | No |

---

## IsForexDr

This function is used to check if the Forex amount is a Debit amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Amount | Yes | No |

---

## NettAmount

This function is used to give the Nett Amount of two parameters.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Yes | No |
| 2 | This is an expression which evaluates to a Amount. | Value | No | No |

---

## RateXValue

This function accepts Amount and converts it to RateX value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Rate of Exchange

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount/Rate. | Value | Yes | No |

---

## SignedAmount

This function is used to give a minus sign before a value if it is a negative value.If the value is positive then it will leave that place otherwise put a minus sign.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Amount
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Yes | No |
| 2 | This is an expression which evaluates to Logical Value. | Value | No | No |

---

## WithForexRate

If the amount has the same forex as the RateX then amount will be set as per the new RateX specified. Here Parameter type ?RateX? accepts Amount and it will be converted into RateX using function '$$RateXValue'.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Amount
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a Amount. | Value | Amount | Yes | No |
| 2 | This is an expression which evaluates to RateX value. | Value | Rate of Exchange | Yes | No |

---
