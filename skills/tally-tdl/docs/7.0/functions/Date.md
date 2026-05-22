# Date Function

> **Version**: 7.0

Reference documentation for all entries in the **Date** function.

> **Total Entries**: 27

## Table of Contents

- [Date](#date)
- [DateRange](#daterange)
- [DayOfDate](#dayofdate)
- [DayOfWeek](#dayofweek)
- [DueDateByDate](#duedatebydate)
- [DueDateInDays](#duedateindays)
- [FinYearBeg](#finyearbeg)
- [FinYearEnd](#finyearend)
- [FullMonthName](#fullmonthname)
- [IsSetByDate](#issetbydate)
- [MachineTime](#machinetime)
- [MonthEnd](#monthend)
- [MonthOfDate](#monthofdate)
- [MonthStart](#monthstart)
- [NextMonth](#nextmonth)
- [NextYear](#nextyear)
- [NumOfMonths](#numofmonths)
- [PeriodStart](#periodstart)
- [PrevMonth](#prevmonth)
- [PrevYear](#prevyear)
- [PrintDate](#printdate)
- [PrintTime](#printtime)
- [RelativeDate](#relativedate)
- [ShortMonthName](#shortmonthname)
- [WeekEnd](#weekend)
- [YearEnd](#yearend)
- [YearOfDate](#yearofdate)

---

## Date

The function $$date is used to convert a date specified in string format into the 'Date' data type.This is mainly required when a string contains a date on which manipulations are to be performed treating it as a date format eg: filtering the data based on the date comparison.TDL allows Addition or substraction of a number to a date type field and in turn it will return a date type field.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  String expression which is to beconverted into date. | Value | Date | Yes | No |

---

## DateRange

Evaluates the DateRange formula with the context of BaseDate and Inclusive formula specified.

### Meta

- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Due Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  String expression which for the Due Date. | Value | String | Yes | No |
| 2 | To specify an Expression to Evaluate the Base Date. | Value | Date | Yes | No |
| 3 | To specify an Expression to Evaluate the Base Date. | Value | Logical | No | No |

---

## DayOfDate

This function returns only the day from a complete date time in number format This datetime is converted to number so that some computation can be performed on this.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  DateTime expression. | Value | DateTime | Yes | No |

---

## DayOfWeek

Gives the Day of the specified datetime, e.g., Monday. This function returns the weekday of the datetime specified. The Parameter can be any expression (i.e.,Formula / Storage/ variable etc) in datetime format.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify DateTime expression. | Value | DateTime | Yes | No |

---

## DueDateByDate

This function provides the due date for a bill in date format. The parameter passed to this function is a date. It returns the due date of the bill in terms of date specified.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  Date expression. | Value | Due Date | Yes | No |

---

## DueDateInDays

This function provides the due date for a bill in number of days format. The parameter passed to this function is a date. This returns the due date of the bill in terms of total number of days remaining with respect to the date specified in the parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify  Date expression. | Value | Due Date | Yes | No |

---

## FinYearBeg

This function is used to get the First Day of the company's financial year.The function $$FinYearBeg is used to fetch the starting date of the company's financial year The 1st parameter is a Date value for which the financial year beginning is to be identified and 2nd parameter is the 'Starting From' (i.e., financial year starting from date) of company. Now there is a possibility that the financial year can begin from April, January, etc. In such cases the 2nd parameter helps the system to pick the exact financial year beginning date.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify DateTime expression for which financial year begining datetime for the company is to be found. | Value | DateTime | Yes | No |
| 2 | To specify DateTime expression for which financial year begining datetime for the company is to be found. | Value | DateTime | Yes | No |

---

## FinYearEnd

This function is used to get the Last day of the company's financial year.The function $$FinYearEnd is used to fetch the Ending date of the company's financial year. The 1st parameter is a Date value for which the financial year Ending is to be identified and 2nd parameter is the ?Starting From? (i.e., financial year starting from date) of company. Now, there is a possibility that the financial year can be from April-March or January-December etc., . In such case the 2nd parameter helps the system to pick the exact financial year ending date. Actually it considers day & Month from the 2nd parameter and the year from the 1st parameter for calculating Financial year beginning. Hence 12 months after financial Year Beginning is financial year end.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify DateTime expression. | Value | DateTime | Yes | No |
| 2 | To specify DateTime expression. | Value | DateTime | Yes | No |

---

## FullMonthName

Gives the full name of the month eg: January etc.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify DateTime expression. | Value | DateTime | Yes | No |

---

## IsSetByDate

This function checks if the due date is mentioned on a particular Date instead of Number of Days. It Checks the format  in which the due date is stored i.e. Whether it is in date /no. of days. If it is Date then it returns 'Yes' else 'No'.Return type is logical value.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Date Range. | Value | Due Date | Yes | No |

---

## MachineTime

Gives the system time. The machine time at the moment of evaluation of function ? in the form HH:MM OR HH.MM.SS based on the logical parameter Return type is string.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Logical experssion. 'No' for HH.MM and 'Yes' for HH.MM.SS. | Value | Logical | No | No |

---

## MonthEnd

This function returns the Date for the last day of the given month.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime. | Value | DateTime | Yes | No |

---

## MonthOfDate

This function finds the month corresponding to date.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify DateTime whose month needs to be displayed. | Value | DateTime | Yes | No |

---

## MonthStart

This function returns the first day of the specified month.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime. | Value | DateTime | Yes | No |

---

## NextMonth

This function returns the Next month date of the specified date parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime . | Value | DateTime | Yes | No |

---

## NextYear

This function returns the Next year date of the specified date parameter.The same date for the Next year ? thus 10-Feb-2005 would give 10-Feb-2006.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime. | Value | DateTime | Yes | No |

---

## NumOfMonths

This function returns a numeric value. It is the number of months between the given datetimes.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify DateTime expression. | Value | DateTime | Yes | No |
| 2 | To specify DateTime expression. | Value | DateTime | Yes | No |

---

## PeriodStart

Gives the Starting date of the Balancing Method for the specified object.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to String. | Value | String | Yes | No |
| 2 | This is an expression which evaluates to String. | Value | DateTime | Yes | No |

---

## PrevMonth

This function returns the previous month date of the specified date parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime . | Value | DateTime | Yes | No |

---

## PrevYear

This function returns the date for the previous year specified as parameter.The same date is displayed for the previous year ? thus 10-Feb-2005 would give 10-Feb-2004.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime. | Value | DateTime | Yes | No |

---

## PrintDate

$$PrintDate will display the system date in the particular report whenever there is no parameters.The date of starting the print-out at the moment of evaluation of function ? this will remain constant through out the printing of the current report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## PrintTime

To display the system time on the report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## RelativeDate

This function returns a date value. It gives the backdated relative date for the period specified

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | DateTime expression | Value | DateTime | Yes | No |
| 2 | DateTime expression | Value | String | Yes | No |

---

## ShortMonthName

This function gives the name of the month in short for the specified datetime.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime. | Value | DateTime | Yes | No |

---

## WeekEnd

This function gives the first Sunday's Date.. If the argument itself (DateTime) is a Sunday then it will return the following Sunday.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime. | Value | DateTime | Yes | No |

---

## YearEnd

This Function returns the last date of the Year, by adding 11 months to the datetime parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime. | Value | DateTime | Yes | No |

---

## YearOfDate

This Function gives the four digit Year value for the date time specified.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Date
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to DateTime. | Value | DateTime | Yes | No |

---
