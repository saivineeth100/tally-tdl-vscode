# Notification Definition

> **Version**: 7.0

Reference documentation for all entries in the **Notification** definition.

> **Total Entries**: 18

## Table of Contents

- [Activity Desc](#activity-desc)
- [Activity Name](#activity-name)
- [ActivityID](#activityid)
- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Delete All Previous](#delete-all-previous)
- [Expiry DateTime](#expiry-datetime)
- [Expiry Duration](#expiry-duration)
- [Expiry Relative](#expiry-relative)
- [Handler](#handler)
- [Is Company Notif](#is-company-notif)
- [Persist](#persist)
- [Raise New](#raise-new)
- [Snooze Type](#snooze-type)
- [Snooze Value](#snooze-value)
- [Type](#type)
- [Use](#use)

---

## Activity Desc

This attribute specifies the description associated with the notification report.

### Meta

- **Aliases**: Activity Desc, Activity Description
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is  used to define the string value that represents the activity description shown in the notification report. | Value | String | Yes | No | No | No |

---

## Activity Name

This attribute is used to specify the activity name for the notification report.

### Meta

- **Aliases**: Activity Name
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to a string value. | Value | String | Yes | No | No | No |

---

## ActivityID

This attribute is used to provide an ID to the notification which will help in uniquely identifying each notification.

### Meta

- **Aliases**: ActivityID
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | A unique value of type Long, which serves as the identifier for the notification. | Value | Long | Yes | No | No | No |

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

## Delete All Previous

It specifies whether all previous notifications of this activity type should be deleted when raising a new activity of the same type. The default value is No. If set to Yes, the Raise New attribute is ignored, and a new activity will always be created.

### Meta

- **Aliases**: Delete All Previous
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to a logical value (Yes/No). | Value | Logical | No | No | No | No |

---

## Expiry DateTime

It specifies the date and time when the notification should expire. This is used only when Expiry Relative is set to No. If this value is not provided, the Expiry Relative setting will be ignored.

### Meta

- **Aliases**: Expiry DateTime
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the absolute date and time for the notification to expire. | Value | DateTime | No | No | No | No |

---

## Expiry Duration

This attribute is used to specify the duration after which the notification should expire, but only if Expiry Relative is set to Yes.

### Meta

- **Aliases**: Expiry Duration
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It provides the expiry duration, by default it is in days, it will be calculated from the time the notification is raised. | Value | Long | Yes | No | No |  |  | No |
| 2 | It specifies the keyword for unit of time and it can be one of: Week(s), Day(s), Hour(s), Minute(s), or Second(s). | Keyword |  | No | No | No | Duration Unit | Day, Days, Hour, Hours, Minute, Minutes, Second, Seconds, Week, Weeks | No |

---

## Expiry Relative

This attribute is used to specify whether the expiry value of a particular notification an absolute date/time or relative like the expiry starts from the notification creation time. If it is not specified, it is treated as no expiry for this notification.

### Meta

- **Aliases**: Expiry Relative
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to a logical value (Yes/No). | Value | Logical | No | No | No | No |

---

## Handler

This attribute is used to invoke a TDL function when the user presses Enter on a notification.

### Meta

- **Aliases**: Handler
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is used to specify the name of the function. | Identifier | Yes | No | No | Function | No |

---

## Is Company Notif

It specifies whether the notification is at company level or at application level. The default value is Yes, i.e., at company level.

### Meta

- **Aliases**: Is Company Notif, Is Company Notify
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to a logical value (Yes/No). | Value | Logical | Yes | No | No | No |

---

## Persist

It specifies whether the notification is temporarily held in memory or persisted across sessions. The default value is Yes.

### Meta

- **Aliases**: Persist, Persistent
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to a logical value (Yes/No). | Value | Logical | No | No | No | No |

---

## Raise New

If the present notification with same activity already exists on the notification report, it specifies whether a new notification can be raised or not. The default value is Yes.

### Meta

- **Aliases**: Raise New
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to a logical value (Yes/No). | Value | Logical | No | No | No | No |

---

## Snooze Type

It specifies whether the notification can be snoozed or not.

### Meta

- **Aliases**: Snooze Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It takes the default values of snooze types. The snooze type can be NextReminderDate or NextProductUpdate. | Keyword | No | Yes | No | Snooze Type | NextProductUpdate, NextReminderDate | No |

---

## Snooze Value

This attribute is applicable only when the Snooze Type is set to NextReminderDate. The value will specify the time for which the notification is snoozed.

### Meta

- **Aliases**: Snooze Value
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It takes a unique value and it must be a positive long integer. It is used to specify the snooze duration. | Value | Long | Yes | No | No |  |  | No |
| 2 | It takes a keyword representing the time unit. If omitted, it defaults to days. The value for the unit can be weeks/week, days/day, hours/hour, minutes/minute, seconds/second. | Keyword |  | No | No | No | Duration Unit | Day, Days, Hour, Hours, Minute, Minutes, Second, Seconds, Week, Weeks | No |

---

## Type

It specifies the type of the notification.

### Meta

- **Aliases**: Type
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It takes the value for the notification type. Notification types can be Normal, Non-Dismissible, No-read, No-read-no-dismiss. The default value will always be Normal. | Keyword | No | Yes | No | Notification Type | Non-dismissible, No-read, No-read-no-dismiss, Normal | No |

---

## Use

The USE keyword is used in a definition to reuse an existing definition.

### Meta

- **Aliases**: Use
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It acts as label for grouping. | Identifier | No | Yes | No |

---
