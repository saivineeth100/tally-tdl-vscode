# Duration Function

> **Version**: 7.0

Reference documentation for all entries in the **Duration** function.

> **Total Entries**: 6

## Table of Contents

- [AddDuration](#addduration)
- [Duration](#duration)
- [GetDuration](#getduration)
- [GetEndDateTime](#getenddatetime)
- [GetStartDateTime](#getstartdatetime)
- [SubDuration](#subduration)

---

## AddDuration

Add Duration to another Duration

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Duration
- **Execution Mode**: Client
- **Return Type**: Duration

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify a duration | Value | Duration | Yes | No |
| 2 | To specify a duration | Value | Duration | Yes | No |

---

## Duration

The function $$duration is used to convert a duration specified in string format into the 'Duration' data type.This is mainly required when a string contains a duration on which manipulations are to be performed treating it as a duration format eg: getting the end date after a certain duration.TDL allows Addition or substraction of a number to a duration type field and in turn it will return a duration type field.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Duration
- **Execution Mode**: Client
- **Return Type**: Duration

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  String expression which is to be converted into duration. | Value | Duration | Yes | No |

---

## GetDuration

Gives the duration between two datetime

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Duration
- **Execution Mode**: Client
- **Return Type**: Duration

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify start date time. | Value | DateTime | Yes | No |
| 2 | To specify end date time. | Value | DateTime | Yes | No |

---

## GetEndDateTime

Gets the end date from a particular datetime and a duration

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Duration
- **Execution Mode**: Client
- **Return Type**: DateTime

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify start date time. | Value | DateTime | Yes | No |
| 2 | To specify duration. | Value | Duration | Yes | No |

---

## GetStartDateTime

Gets the start date from a particular datetime and a duration

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Duration
- **Execution Mode**: Client
- **Return Type**: DateTime

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify end date time. | Value | DateTime | Yes | No |
| 2 | To specify duration. | Value | Duration | Yes | No |

---

## SubDuration

Subtracts Duration from another Duration

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Duration
- **Execution Mode**: Client
- **Return Type**: Duration

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify a duration. | Value | Duration | Yes | No |
| 2 | To specify duration which is to be subtracted. | Value | Duration | Yes | No |

---
