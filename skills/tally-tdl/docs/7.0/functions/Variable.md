# Variable Function

> **Version**: 7.0

Reference documentation for all entries in the **Variable** function.

> **Total Entries**: 12

## Table of Contents

- [ColumnVarValue](#columnvarvalue)
- [ExecVar](#execvar)
- [FieldVar](#fieldvar)
- [HighValue](#highvalue)
- [IsActualsVar](#isactualsvar)
- [IsCommon](#iscommon)
- [IsCurrentVar](#iscurrentvar)
- [IsDefaultVar](#isdefaultvar)
- [IsSysNameVar](#issysnamevar)
- [LowValue](#lowvalue)
- [NumSets](#numsets)
- [ParentFieldVar](#parentfieldvar)

---

## ColumnVarValue

This function is used to get variable's value at current column of auto report's context.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify variable name. | Identifier | Yes | Variable | No |

---

## ExecVar

This function gets the Report Variables from the parent report.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  Variable name. | Identifier | Yes | Variable | No |

---

## FieldVar

This function is used to get the values from the variable whose value is changing in a field. This function is useful in multi-column reports where the value of the variable changes frequently in a Field. It accepts a single parameter namely the variable name and returns the value based on the type of Variable.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Variable name. | Identifier | Yes | Field | No |

---

## HighValue

This function provides the End Date for the current periodicity. For Example, when you select Quarterly, Half Yearly or Yearly as a periodicity in the report it will return the end date for that period.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Date. | Identifier | Yes | Variable | No |

---

## IsActualsVar

The function $$IsActualsVar is used to verify whether the content of the variable which is passed as a parameter has a content 'Actuals' or not. If the content of the variable is 'Actuals' then it returns a logical value 'Yes' otherwise returns a logical value 'No'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Variable name. | Identifier | Yes | Variable | No |

---

## IsCommon

This function is used with repeated variable to check for the duplicate values.It returns logical value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Field name. | Identifier | Yes | Variable | No |

---

## IsCurrentVar

This function will returns FALSE if variable value is blank or sysname or 'Stock-In-Hand' or otherwise it will return TRUE.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Variable name. | Identifier | Yes | Variable | No |

---

## IsDefaultVar

This function will return FALSE if variable value is blank or 'Default' otherwise it will return TRUE.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Variable name. | Identifier | Yes | Variable | No |

---

## IsSysNameVar

The function $$IsSysNameVar is to check whether the specified variable name is system variable name or not.  If the Variable is a System Variable then it returns a logical value 'Yes' otherwise it returns a logical value 'No'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Variable name. | Identifier | Yes | Variable | No |

---

## LowValue

Gives the beginning date for the current periodicity. For Example, when you select Quarterly, Half Yearly or Yearly as a periodicity in the report it will return the beginning date for that period.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Date. | Identifier | Yes | Variable | No |

---

## NumSets

Gives the number of Columns in the Report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Variable
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## ParentFieldVar

It gets the field variable value from its parent report. Using this function varibale defined in the parent report can be accessd by Drill down Reports. Here Parameter Type we pass need not be a System Variable.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Variable name. | Identifier | Yes | Variable | No |

---
