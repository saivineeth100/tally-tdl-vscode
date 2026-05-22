# Progress Bar Definition

> **Version**: 7.0

Reference documentation for all entries in the **Progress Bar** definition.

> **Total Entries**: 9

## Table of Contents

- [Activity Name](#activity-name)
- [Context](#context)
- [Note](#note)
- [ProcessName](#processname)
- [Progress Indication](#progress-indication)
- [Stages](#stages)
- [Subcontext](#subcontext)
- [Total Count](#total-count)
- [Use](#use)

---

## Activity Name

This attribute is used to specify the Activity Name displayed to the user within the progress bar. This is a mandatory attribute for progress bar.

### Meta

- **Aliases**: Activity Name
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the activity name for progress bar (string). | Value | String | Yes | No | No | No |

---

## Context

This attribute is used to specify the context within the progress bar.

### Meta

- **Aliases**: Context
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the context name for progress bar (string). | Value | String | Yes | No | No | No |

---

## Note

This attribute is used to specify the note in the progress bar.

### Meta

- **Aliases**: Note
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the note string for progress bar. | Value | String | Yes | No | No | No |

---

## ProcessName

This attribute is used to specify the process name within the progress bar.

### Meta

- **Aliases**: ProcessName
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the process name for progress bar (string). | Value | String | Yes | No | No | No |

---

## Progress Indication

This attribute is used to specify the progress indication within the progress bar.

### Meta

- **Aliases**: Progress Indication
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the progress indication string for progress bar. | Value | String | Yes | No | No | No |

---

## Stages

This attribute is used to specify the list of stages in the progress. A minimum of two stages must be specified for them to be drawn in the progress window.

### Meta

- **Aliases**: Stages
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to describe the purpose of each stage in the progress bar. | Value | String | Yes | No | No |

---

## Subcontext

This attribute is used to specify the sub-context within the progress bar.

### Meta

- **Aliases**: Subcontext
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the sub-context name for progress bar (string). | Value | String | Yes | No | No | No |

---

## Total Count

This attribute is used for defining the total number of items being processed. If the count is unknown, it can be set to 0. This is mandatory for progress bar.

### Meta

- **Aliases**: Total Count
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This sub-attribute is used to specify the total count of processed items. | Value | Number | Yes | No | No | No |

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
| 1 | Name of the definition to be reused. | Identifier | No | Yes | Progress Bar | No |

---
