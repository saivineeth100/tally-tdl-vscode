# Report Action

> **Version**: 7.0

Reference documentation for all entries in the **Report** action.

> **Total Entries**: 14

## Table of Contents

- [Autoform Report](#autoform-report)
- [End Report](#end-report)
- [Export Report](#export-report)
- [HTTP Post](#http-post)
- [Mail Report](#mail-report)
- [Next Report](#next-report)
- [Next Tile Report In Focus](#next-tile-report-in-focus)
- [Prev Report](#prev-report)
- [Prev Tile Report In Focus](#prev-tile-report-in-focus)
- [Print Report](#print-report)
- [Replace Report](#replace-report)
- [Upload Report](#upload-report)
- [WhatsApp Report](#whatsapp-report)
- [Zoom Report](#zoom-report)

---

## Autoform Report

### Meta

- **Aliases**: Autoform Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Edit

### Parameters

_No parameters._

---

## End Report

### Meta

- **Aliases**: End Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Export Report

This Action initiates the export for the current Report.

### Meta

- **Aliases**: Export Report
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an optional parameter which accepts Name of Report. | Identifier | String | No | No | Report | No |
| 2 | This is an optional parameter which accepts Name of Report. | Value | Logical | No | No |  | No |
| 3 | This is an expression when evaluated to TRUE it overwrites the Export file if present. If specified as No then it will overwrite the file based on user confirmation. However if NO-CONFIG is specified as Yes, then export is failed if File is already present. | Value | Logical | No | No |  | No |

---

## HTTP Post

HTTP Post Action can be used to submit data to a server over HTTP and gather the response. This will enable a TDL Report to perform a HTTP Post to a remote location.

### Meta

- **Aliases**: HTTP Post
- **Total Parameters**: 5
- **Total Mandatory Parameters**: 3
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an expression that resolves to a URL | ExpressionEx | String | Yes | No |  |  |  | No |
| 2 | This is an expression that resolves to a URL | Keyword | String | Yes | No |  | Encoding | ASCII, Unicode, Unicode8, UTF16, UTF8 | No |
| 3 | This is the name of the TDL Report which will be used for generating XML/JSON Request to be sent. | Identifier | String | Yes | No | Report |  |  | No |
| 4 | This is the name of the TDL Report which will be used for generating XML/JSON Request to be sent. | Identifier | String | No | No | Report |  |  | No |
| 5 | This is displayed when the post is successful. | Identifier | String | No | No | Report |  |  | No |

---

## Mail Report

This Action initiates the mailing for the current Report.

### Meta

- **Aliases**: Mail Report
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an optional parameter which accepts Name of Report. | Identifier | String | No | Yes | Report | No |
| 2 | This is an optional parameter which accepts Name of Report. | Value | Logical | No | No |  | No |

---

## Next Report

This action is used to display the next report (Used with Cyclic Actions such as Display Collection/Alter Collection to display Previous Object).

### Meta

- **Aliases**: Next Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Next Tile Report In Focus

This action displays the next tile report within the Dashboard, while in the Expand or Focus view of a tile report.

### Meta

- **Aliases**: Next Tile Report In Focus
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Prev Report

This action is used to display the previous report (Used with Cyclic Actions such as Display Collection/Alter Collection to display Previous Object).

### Meta

- **Aliases**: Prev Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Prev Tile Report In Focus

This action displays the previous tile report within the Dashboard, while in the Expand or Focus view of a tile report.

### Meta

- **Aliases**: Prev Tile Report In Focus
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Print Report

This Action initiates the print for the current Report.

### Meta

- **Aliases**: Print Report
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an optional parameter which accepts Name of Report | Identifier | String | No | Yes | Report | No |
| 2 | This is an optional parameter which accepts Name of Report | Value | Logical | No | No |  | No |

---

## Replace Report

### Meta

- **Aliases**: Replace Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Edit

### Parameters

_No parameters._

---

## Upload Report

This Action initiates the upload for the current Report.

### Meta

- **Aliases**: Upload Report
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an optional parameter which accepts Name of Report. | Identifier | String | No | Yes | Report | No |
| 2 | This is an optional parameter which accepts Name of Report. | Value | Logical | No | No |  | No |

---

## WhatsApp Report

This action initiates the sharing of the current Report via WhatsApp.

### Meta

- **Aliases**: WhatsApp Report
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Any expression which evaluates to the Name of Report. This is an optional parameter. | Identifier | String | No | Yes | Report | No |
| 2 | Any expression which evaluates to the Name of Report. This is an optional parameter. | Value | Logical | No | No |  | No |

---

## Zoom Report

### Meta

- **Aliases**: Zoom Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

_No parameters._

---
