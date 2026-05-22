# Data Types, Operators, and Expressions in TDL

## Introduction

Any information stored on a computer system is commonly referred to as data. Based on the value, the data is classified into different types called data types. Data type specifies the type of value and the validity constraint of each data type.

TDL is a business language and it requires the support for various business data types like amount, quantity, rate, apart from the other basic types. 

## Data Types

Based on the requirements of the business, the data types in TDL are classified into two categories: Simple and Compound.

### Simple Data Types

The data types which can hold the data for a specific type only are referred to as Simple Data Types. These cannot be further divided into sub-types. 

*   **String:** Accepts alpha-numeric characters as well as special symbols. There is no restriction on the number of characters.
    *   *Example:* `ABC Company Ltd.`
*   **Number:** Used to store numeric data only. The valid range in TDL is from -92233720368547.7580 to +92233720368547.7580.
    *   *Example:* `98450 98450`
*   **Date:** Used to store dates. The valid range acceptable in TDL is from `1-1-1901` to `31-12-2098`.
*   **Logical:** Used to specify a logical value. It accepts Yes/No, True/False, On/Off, and 0/1.

### Compound Data Types

In a business scenario, data may be a combination of multiple components. TDL provides a comprehensive set of compound data types which consist of further subtypes: Amount, Quantity, Rate, Rate of Exchange, Due Date.

#### Amount
This data type is a combination of subtypes: Base/Direct Base, Forex, Rate, and DrCr.
*   **Base/Direct Base:** Specifies the amount in the base currency applicable for the company.
*   **Forex:** Specifies the value of the amount in a foreign currency.
*   **Rate:** Specifies the Forex rate.
*   **DrCr:** Specifies whether it is a Debit or Credit amount.
*   The valid range is from -92233720368547.7580 to 92233720368547.7580. Four decimal places are applicable for the base amount and forex (based on currency master, forex can go up to four decimal places independently).

#### Quantity
Comprises subtypes: Base units/Primary units, Alternate units/Secondary units, and Unit symbol.
*   **Base Units/Primary Units:** Quantity along with the base unit.
*   **Alternate Unit/Secondary Units:** Quantity in alternate units.
*   **Unit symbol:** The unit symbol for the quantity. 
*   Valid range: -92233720368547.7580 to +92233720368547.7580.

#### Rate
A combination of sub-types: Price, Quantity, and Unit Symbol.
*   **Price:** The price of the item.
*   **Quantity:** The quantity for which the price is specified.
*   **Unit Symbol:** The unit for which the price is specified.
*   Valid range: -92233720368547.7580 to +92233720368547.7580.

#### Rate of Exchange
Used to specify the conversion rate between currencies. Acceptable range is from -92233720368547.7580 to +92233720368547.7580. Decimal places can go up to four (independent of currency master).
*   *Note:* It doesn't have sub-types specified explicitly.

#### Due Date
Stores a date range (From Date and To Date). Only the To Date value is entered, and the value of From Date is determined by the system.
*   *Note:* It doesn't have sub-types specified explicitly.

## The Field Attribute: Type

The type for the field definition is specified using the `Type` attribute.

**Syntax:**
```tdl
[Field: <Field Name>]
    Type : <Data Type> : <Sub-type>
```
*Where `<Data Type>` is the primary data type name, and `<Sub-type>` is the name of the sub-type.*

**Example:**
```tdl
[Field: Qty Secondary Field]
    Type : Quantity : Secondary Units
```

## The Field Attribute: Format

The format for the data type can be specified using the `Format` attribute.

**Syntax:**
```tdl
[Field: <Field Name>]
    Type   : <Data type>
    Format : <List of Formats>
```

**Example:**
```tdl
[Field: NumField]
    Type   : Number
    Format : Decimal: 1, Percentage, Bracketed
```

### Tail Units formatting for Quantity
In TDL, the `Quantity` data type supports simple and compound units of measure. The `Format` attribute has been enhanced to specify the "Tail unit", in which the quantity value needs to be extracted from a compound unit.

**Syntax:**
```tdl
[Field: <Field Name>]
    Type   : Quantity
    Set As : $<Method Name>
    Format : "Tail Units:" + <String Expression>
```
*Where `<String Expression>` must evaluate to any Tail Unit Name used in the Item.*

**Example:**
```tdl
[Field: Qty Format Enhancement]
    Use    : Qty Primary Field
    Set As : $ClosingBalance
    Format : "Tail Units:" + "kgs"
```
*If closing balance is 12 bags 5 kgs 250 gms, format "Tail Units:kgs" returns `125 kgs 250 gms`, while "Tail Units:gms" returns `125250 gms`.*

---

## Data Type Formats

Various formats are available to represent data based on the data type specified.

### Number Formats

| Format | Value of Field | Value Returned |
| :--- | :--- | :--- |
| Comma | 1000 (Default) | 1,000 |
| No Comma | 1,000 | 1000 |
| Positive/Signed | 1000 | (+) 1000 |
| Decimal: `<no of decimals>` | 1000.19 | 1000.2 (Round off) |
| No Zero | 0.00 | (Blank field) |
| Percentage | 1.00 | 1 % |
| Bracketed | 1.00 | (1.00) |

### Amount Formats

| Format | Value of Field | Value Returned |
| :--- | :--- | :--- |
| Comma | 1000 (Default) | 1,000 |
| No Comma | 1,000 | 1000 |
| Positive/Signed | 1000 | (+) 1000 |
| Decimal: `<no of decimals>` | 1000.19 | 1000.2 (Round off) |
| DrCr/CrDr | 1000.00 | 1000 Cr |
| Symbol/Currency | 1000 | Rs.1000 |
| Show Base Currency | 1000 | Rs.1000 |
| Forex | 1200 | $1200 |
| All Symbols | 1260 | Converted value to base currency |
| No Zero | 0.00 | (Blank field) |
| No Symbol | 1000.00 | 1000.00 |
| Bracketed: For Negative | -100 | (100) |

### Quantity Formats

| Format | Value of Field | Value Returned |
| :--- | :--- | :--- |
| Comma | 1000 (Default) | 1,000 |
| No Comma | 1,000 | 1000 |
| SDF | 1000 | 1000 (Cr Side), -1000 (Dr Side) |
| Positive/Signed | 1000 | +(1000) |
| Decimal: `<no of decimals>` | 1000.19 | 1000.2 (Rounded off) |
| DrCr/CrDr | 1000 | 1000.00 Dr / 1000.00 Cr |
| Units | 750 | 750 kgs / 750 nos |
| TailUnits | 10 Crtn 5 Box 3 Pcs | 1253 Pcs (converts to least unit) |
| TailUnits:Box | 10 Crtn 5 Box 3 Pcs | 125 Box (converts to Box unit) |
| Shortform | 10 Crtn 5 Box 3 Pcs | 10-5-3 |
| No Compact | 10Crtn 5 Box 3 Pcs | 10- 5-3 (use with Shortform) |
| No Zero | 0.00 | (Blank Field) |

### Rate and Rate of Exchange Formats

| Format | Value of Field | Value Returned |
| :--- | :--- | :--- |
| Comma | 1000 | 1,000 |
| No Comma | 1,000 | 1000 |
| Positive/Signed | 1000 | +(1000) |
| Decimal: `<no of decimals>` | 1000.19 | 1000.2 (Rounded off) |
| DrCr | 1000 | 1000.00 Dr/Nos or 1000.00 Cr/Nos |
| Units | 750 | 750 kgs, 750 Nos |
| TailUnits | 10 Crtn 5 Box 3 Pcs | 1253 pcs |
| TailUnits:Box | 10 Crtn 5 Box 3 Pcs | 125 Box |
| Shortform | 10 Crtn 5 Box 3 Pcs | 10-5-3 |
| No Compact | 10 Crtn 5 Box 3 Pcs | 10-5-3 |
| No Zero | 0.00 | (Blank Field) |

---

## Calendar Data Types

All data types pertaining to date and time are collectively referred to as Calendar data types: **Date**, **Time**, **DateTime**, **Duration**, and **Due Date**.

### 1. Date
Data container can hold only Date values (range: Jan 1, 1901 to Dec 31, 9999). Default separator is `-` (hyphen).
Century behavior is applied when a 2-digit year is provided.

**Formats Keyword:**
*   **Short Date:** `22-Dec-1999` -> `22-12-99`
*   **Long Date:** `22-Dec-1999` -> `Wednesday, 22 Dec, 1999`
*   **Universal Date:** (Default format) `22-12-1999` -> `22-Dec-1999`
*   **Month Beginning:** `04-12-1999` -> `Dec - 99`
*   **Month Ending:** `14-12-1999` -> `Dec - 99`

**Input Keywords:**
Allows setting date values using keywords like `Today`, `Tomorrow`, `Yesterday`, `Month`, `Week`, `Year`.

**Date Qualifiers:**
Used in combination with input keywords: `This`, `Last` / `Prev` / `Previous`, `Next`.
*Example:* `Set As: Last Financial Year` (Sets value to the 1st day of the last financial year).
*Note:* Week is assumed to begin on Sunday.

### 2. Time
Represents absolute time of the day with milliseconds precision (`hh:mm:ss:MMM`). Default separator is `:` (colon).

**Formats Keyword:** (Example: 12 hour, 24 hour)
**Input Keywords:** `Now`

### 3. DateTime
Represents a date along with absolute time (`dd-mm-yy hh:mm:ss:MMM`). Range: `Jan 1, 1901 00:00:00:000` to `Dec 31, 2098 23:59:59:999`.

**Input Formats:**
*   **Date Only:** Accepts both Date and Time, but displays only Date.
*   **Time Only:** Accepts both Date and Time, but displays only Time.

**Input Keywords:**
`Today`, `Tomorrow`, `Yesterday`, `Month`, `Week`, `Year`, `Now`.
*(Note: For keywords like 'Tomorrow', 'Yesterday', the time part remains whatever time is already available in the field, or defaults to `0:00`).*

**Date Qualifiers:**
All qualifiers for `Date` are applicable to `DateTime`.

**Subtypes:**
*   `Date`: `Type : DateTime : Date` (Displays only date portion).
*   `Time`: `Type : DateTime : Time` (Displays only time portion).

### 4. Duration
Represents the interval between two Date/Time values, measured in years, months, weeks, days, hours, minutes, and seconds.

**Formats:**
Any combination of formats (e.g., `"Months, Days"`). `Week` is an independent format and cannot be clubbed with others.
*   If value is entered without units, it is considered as **days** by default (e.g., `10` -> `10 days`).
*   Negative Duration is not allowed.

### 5. Due Date
Represents a Due Date (e.g. Purchase Order, Credit Period). Flexible range of values: Date or Duration from the starting date.

**Input Formats:**
Four input formats: `Days`, `Weeks`, `Months`, `Years`. If no format is specified, `Days` is the default.

### Constraints & Compatibility
*   **COM Support:** Extended for Calendar Data Types `Time` and `DateTime`.
*   **Type Casting DateTime <-> Date/Time:** Setting a Date/Time field with a DateTime value extracts the relevant portion. Functions `$$Date`, `$$Time`, `$$DateTime` can be interchanged.
*   **Time** is cyclic (e.g., 1 am - 12 hours = 1 pm) and independent of Date (changing PM to AM doesn't change Date).
*   In `DateTime` fields, Date must be entered first. Conversion from `Time` to `DateTime` uses current date, while conversion from `Date` to `DateTime` defaults to `0:00` time.

---

## Data Conversion (Type Casting)

Converting data of a given type into another type is known as type-casting. 

### Implicit Data Conversion
Done automatically by the language compiler. Implicit conversion can occur from all data types to `String` data type.

| Set As Type | To Number | To Amount | To Rate of Exchange | To Quantity | To Rate | To Date | To Due-Date | To String | To Logical |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **String** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Number** | Yes | Yes | Yes | Yes | Yes | No | Yes | Yes | No |
| **Date** | No | No | No | No | No | Yes | Yes | Yes | No |
| **Logical** | Yes | No | No | No | No | No | No | Yes | Yes |

*   Implicit conversion happens from Amount, Rate Of Exchange, Quantity and Rate to Number.
*   Strings like `"6-Jun-2011"` automatically convert to Date.
*   Logical field accepts `0/1` implicitly. Strings `"True"`, `"False"`, `"On"`, `"Off"`, `"Yes"`, `"No"` map implicitly.

### Explicit Data Conversion
Required when data types cannot be converted implicitly. 
Functions: `$$AsAmount`, `$$AsQty`, `$$AsRate`, `$$Inwords`, `$$Number`, `$$String`, `$$Date`.

**Syntax:** `<Conversion Function> : <Value>`

**Example:**
```tdl
[Field: Clg Bal]
    Type   : Amount
    Set As : $$AsAmount:"Rs.1000"
```

---

## Operators in TDL

### Unary Operators
*   `%`: Specifies dimension in percentage of page/screen. Also used as a pattern matching character (any character any number of times).
    *   *Example:* `Width : 20 %Screen`, `If @@CMPMailName LIKE "%Ltd."`
*   `-`: Negates the value of its operand.
    *   *Example:* `Set As : -100`

### Arithmetic Operators
Applicable to all Data Types (with exceptions).
*   `+` : Addition
*   `-` : Subtraction
*   `/` : Division
*   `*` : Multiplication

### Logical Operators
*   `OR`: True if either operand is True.
*   `AND`: True when both operands are True.
*   `NOT` / `!`: Reverses value of the operand.
*   `TRUE`/`ON`/`YES`: Checks if operand is True.
*   `FALSE`/`OFF`/`NO`: Checks if operand is False.

### Comparison Operators
*   `=` / `Equal` / `Equals`: Checks if both operands are equal. *(Note: `=` is a comparison operator, not assignment).*
*   `<` / `Less Than` / `Lesser`: Less than check.
*   `>` / `Greater Than` / `More`: Greater than check.
*   `In`: Checks if value is in a comma-separated list.
    *   *Example:* `If #Myfield IN (100,200,300)`
*   `Null`: Checks if operand is empty.
    *   *Example:* `If #Myfield Null`
*   `Between ... And`: Checks if operand is in range (inclusive).
    *   *Example:* `If #Myfield Between 50 And 150`

### String Operators
*   `Contains` / `Containing`: Checks if operand1 has string operand2.
*   `Starting With` / `Beginning With` / `Starting`: Checks if string starts with operand1.
*   `Ending With` / `Ending`: Checks if string ends with operand1.
*   `Like`: Uses `%` as a wildcard (zero or more characters) for pattern matching.
    *   *Example:* `If $Name Like "%Party"`

---

## Operator Precedence

The expression value is evaluated based on the following operator precedence (can be overridden with parenthesis):
1.  **Arithmetic Operators:** `/` or `*`, then `+` or `-`
2.  **Logical Operators:** `NOT`, then `AND`, then `OR`
3.  **Comparison Operators:** Evaluated in order of appearance
4.  **String Operators:** Evaluated in order of appearance

---

## Data Types Supported by Arithmetic Operators

| Operand 1 | Operand 2 (Number) | Operand 2 (Amount) | Operand 2 (Rate of Exchange) | Operand 2 (Quantity) | Operand 2 (Rate) | Operand 2 (Date) | Operand 2 (Due-Date) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Number** | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Amount** | Yes | Yes | Yes | Yes | Yes | No | No |
| **RateEx** | Yes | Yes | Yes | No | No | No | No |
| **Qty** | Yes | Yes | No | Yes | Yes | No | No |
| **Rate** | Yes | Yes | No | Yes | Yes | No | No |
| **Date** | Yes | No | No | No | No | No | Yes |
| **Due Date** | Yes | No | No | No | No | Yes | Yes |

*   For `Date`, **ONLY** addition and subtraction is supported.
*   For `String`, **ONLY** addition is supported.

---

## Expressions in TDL

A TDL expression is a combination of an operand and operator, where an operand can be either a field/variable value, method/function/formula evaluation result, constant/keyword/identifier. In the expression, a constant can be of type String, Logical, or Number. 
*Note:* Compound data types (Date, Quantity, Amount, Rate) are not supported as Constants. Identifiers accept definition names which can be derived from an expression.
