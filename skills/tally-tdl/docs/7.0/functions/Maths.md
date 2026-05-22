# Maths Function

> **Version**: 7.0

Reference documentation for all entries in the **Maths** function.

> **Total Entries**: 24

## Table of Contents

- [Abs](#abs)
- [AsPositive](#aspositive)
- [CanDivide](#candivide)
- [ForexAsPositive](#forexaspositive)
- [HexToDec](#hextodec)
- [IsEven](#iseven)
- [IsForexNegative](#isforexnegative)
- [IsNegative](#isnegative)
- [IsOdd](#isodd)
- [Max](#max)
- [Min](#min)
- [MulDiv](#muldiv)
- [MulDivAmt](#muldivamt)
- [Negative](#negative)
- [Number](#number)
- [NumValue](#numvalue)
- [PrevTotal](#prevtotal)
- [RandomNumber](#randomnumber)
- [Round](#round)
- [RoundDown](#rounddown)
- [RoundUp](#roundup)
- [ScaleValue](#scalevalue)
- [SubTotal](#subtotal)
- [Total](#total)

---

## Abs

Gives the absolute value of the specified value

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to either number or amount | Value | Yes | No |

---

## AsPositive

This function converts numeric expression to positive value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is Value expression which is either number or amount. | Value | Yes | No |

---

## CanDivide

This function is used to check whether the Numeric value passed as a first parameter is divisible by numeric Value passed as second parameter. If it is divisible then the function returns a Logical value 'Yes' otherwise returns 'No'.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression numeric expression. | Value | Number | Yes | No |
| 2 | This is an expression numeric expression. | Value | Number | Yes | No |

---

## ForexAsPositive

This function converts numeric expression to forex positive value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is Value expression which is either number or amount. | Value | Yes | No |

---

## HexToDec

Gives the decimal value for the hexadecimal value passed.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Hexadecimal value. | Value | String | Yes | No |

---

## IsEven

This function checks whether the numeric value passed as a parameter is Even number or not. If the given input is an Even value the function will return 'Yes' otherwise it will return 'No'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Number. | Value | Number | Yes | No |

---

## IsForexNegative

To check if the Forex value supplied as parameter is Negative. If the value is negative the function will return 'Yes' otherwise 'No'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Specify the Forex Amount. | Value | Yes | No |

---

## IsNegative

To check if the value supplied as parameter is Negative. If the value is negative the function will return 'Yes' otherwise 'No'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Quantity to be added to the stock. | Value | Yes | No |

---

## IsOdd

This function checks whether the numeric value passed as a parameter is Odd number or not. If the given input is an odd value the function will return 'Yes' otherwise it will return 'No'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Number. | Value | Number | Yes | No |

---

## Max

Gives the Maximum value when two or more values are compared. In the case of string comparison it compares the first characters of both the argument strings and returns the value which is higher of the two in the alphabet. Please note only the first character is considered for comparison.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Number/String/Date/Amount. | Value | Yes | No |
| 2 | This is an expression which evaluates to Number/String/Date/Amount. | Value | Yes | No |

---

## Min

Gives the Minimum value when two or more values are compared. In the case of  string $$Min will compare the first character of the two arguments and return the value which is lower in the alphabet.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Number/String/Date/Amount. | Value | Yes | No |
| 2 | This is an expression which evaluates to Number/String/Date/Amount. | Value | Yes | No |

---

## MulDiv

Multiplies and\or divides number.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to numeric expression. | Value | Number | Yes | No |
| 2 | To specify the Second multiplier numeric expression. | Value | Number | Yes | No |
| 3 | To specify the Second multiplier numeric expression. | Value | Number | Yes | No |

---

## MulDivAmt

Multiplies and\or divides number.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Amount

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to amount. | Value | Amount | Yes | No |
| 2 | This is an expression which evaluates to amount. | Value | Amount | Yes | No |
| 3 | Third divisor numeric expression as amount. | Value | Amount | Yes | No |

---

## Negative

Gives the negative  value of the specified value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to either number or amount. | Value | Yes | No |

---

## Number

This extracts number value of the given parameter. It takes an expression and returns a numeric value. The value contains only four digits after decimal.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Quantity/Amount/  Rate. | Value | Yes | No |

---

## NumValue

Gives the numerical value for the parameter passed.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount/Rate value. | Value | Yes | No |

---

## PrevTotal

The Previous total is also for a specific field and appears at the line level as a running total but does not include the field value of the current line i.e., this function returns blank at 1st line, value of 1st line at 2nd line, value of 1st+2nd line at 3rd line and so on.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Field Name. | Identifier | Yes | Field | No |

---

## RandomNumber

Generates a random number between a given min max range.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Min of the range between which the random number has to be generated. It can be between 0-2147483647 | Value | Long | No | No |
| 2 | Min of the range between which the random number has to be generated. It can be between 0-2147483647 | Value | Long | No | No |

---

## Round

$$Round is used to round off the given value.In the above syntax the function uses 2 parameters. The first parameter NumberToRound  will be the actual value, which has to be rounded. The second - RoundLimit is for giving the Rounding Limit, which would be a numeric expression. The function, '$$Round' is one of the few functions that does not have a defined return type. The type of the value returned is based on the type of the argument passed. For example, if a type, 'Number' is sent, then, the type returned will also be a number.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | The actual value to be roundedwhich is either Number/Amount/Quantity/Rate. | Value |  | Yes | No |
| 2 | To specify the Round limit which is either Number/Amount/Quantity/Rate. | Value | Number | No | No |

---

## RoundDown

$$RoundDown is used to round off the value downwards .  In the above syntax the function uses 2 parameters. The first parameter NumberToRound  will be the actual value, which has to be rounded off. The second - RoundLimit is for specifing the rounding limit.  This function always Rounds the given value downwards, i.e., lesser than the give value.  This function  is one of the few functions that does not have a defined return type. The type of the value returned is based on the type of the argument passed. For example, if a type, 'Number' is sent, then, the type returned will also be a number.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | The actual value to be roundedwhich is either Number/Amount/Quantity/Rate. | Value |  | Yes | No |
| 2 | To specify the Round limit which is either Number/Amount/Quantity/Rate. | Value | Number | No | No |

---

## RoundUp

To specify that the amount is to be rounded off by a specified value upwards.$$RoundUp is used to Round Off the value on the higher side.  In the above syntax the function uses 2 parameters. The first parameter ValueToRound  will be the actual value, which has to be Rounded.The second - RoundLimit is for specifing the Rounding Limit.This function always rounds off the value upwards, i.e., more than the given value This function  is one of the few functions that does not have a defined return type.The type of the value returned is based on the type of the argument passed. For example, if a type, 'Number' is sent, then, the type returned will also be a number.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | The actual value to be roundedwhich is either Number/Amount/Quantity/Rate. | Value |  | Yes | No |
| 2 | To specify the Round limit which is either Number/Amount/Quantity/Rate. | Value | Number | No | No |

---

## ScaleValue

Currently selected scale factor. This function returns the value of the currently selected scale factor.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Maths
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Scale factor. | Value | No | No |

---

## SubTotal

The Sub Total function is exactly like the Total function except that it is a running total for that column and appears on individual Lines and not on the total lines, hence the individual lines will need to use a defined Subtotal field. The Expression Field should be Amount/Number Type. i.e. input should be numerical field. Return type will be Amount.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount/Number/Quantity. | Identifier | Yes | Field | No |

---

## Total

This function is used to total all the values in a specific column for a particular field. The column of the Field being totaled could be a Quantity or Amount or a Number. The Fields being totaled need to be specified in the Part Definition with attribute 'Total' apart from the actual definition of the field. The Expression/Field values should be Amount/Number/Quantity type.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Maths
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Amount/Number/Quantity. | Identifier | Yes | Field | No |

---
