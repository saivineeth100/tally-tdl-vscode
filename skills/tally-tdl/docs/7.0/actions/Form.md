# Form Action

> **Version**: 7.0

Reference documentation for all entries in the **Form** action.

> **Total Entries**: 22

## Table of Contents

- [Alter Column](#alter-column)
- [Cancel](#cancel)
- [Create Column](#create-column)
- [Delete](#delete)
- [Delete Column](#delete-column)
- [Form Accept](#form-accept)
- [Form End](#form-end)
- [Form Home](#form-home)
- [Form Next Part](#form-next-part)
- [Form Next Part SFD](#form-next-part-sfd)
- [Form Prev Part](#form-prev-part)
- [Form Query Accept](#form-query-accept)
- [Form Query Reject](#form-query-reject)
- [Form Reject](#form-reject)
- [Form Reject to Menu](#form-reject-to-menu)
- [Form Select End](#form-select-end)
- [Form Select Home](#form-select-home)
- [Form Select Range](#form-select-range)
- [Message Box](#message-box)
- [Remove Line](#remove-line)
- [Show Last Removed Line](#show-last-removed-line)
- [Show Removed Lines](#show-removed-lines)

---

## Alter Column

This action is used to Alter a Column in Columnar Report. This works only display mode.

### Meta

- **Aliases**: Alter Column
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

_No parameters._

---

## Cancel

This action is used in Edit Mode to Cancel the current Voucher Object.

### Meta

- **Aliases**: Cancel
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Edit

### Parameters

_No parameters._

---

## Create Column

This action is used to Create a Column in Columnar Report. This works only display mode.

### Meta

- **Aliases**: Create Column
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

_No parameters._

---

## Delete

This action is used in Edit Mode to Delete the Current Object .

### Meta

- **Aliases**: Delete
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Edit

### Parameters

_No parameters._

---

## Delete Column

This action is used to Delete  a Column in Columnar Report.This works only display mode.

### Meta

- **Aliases**: Delete Column
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

_No parameters._

---

## Form Accept

This action is used to accept the form and the control is returned back to the Report or Menu from where the Form is called.

### Meta

- **Aliases**: Form Accept
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Form End

This action takes cursor to the Last field in edit mode. In Display mode it takes the cursor to the Last Scrolled line of the form.

### Meta

- **Aliases**: Form End
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Edit

### Parameters

_No parameters._

---

## Form Home

This action takes the cursor to the First field in edit mode. In the Display mode it takes cursor to the First Scrolled line of the form.

### Meta

- **Aliases**: Form Home
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Form Next Part

### Meta

- **Aliases**: Form Next Part
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Display

### Parameters

_No parameters._

---

## Form Next Part SFD

### Meta

- **Aliases**: Form Next Part SFD
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Display

### Parameters

_No parameters._

---

## Form Prev Part

### Meta

- **Aliases**: Form Prev Part
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

_No parameters._

---

## Form Query Accept

### Meta

- **Aliases**: Form Query Accept
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Form Query Reject

This action is used to reject the form after the query (Quit Y / N). If it is 'N' then it goes back to current location else it rejects the form and the control returns back.

### Meta

- **Aliases**: Form Query Reject
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Form Reject

This action is used to reject the form and the control is returned back to the Report or Menu from where the Form is called.

### Meta

- **Aliases**: Form Reject
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Form Reject to Menu

This action is used to reject the form and the control returns back  directly to its menu.

### Meta

- **Aliases**: Form Reject to Menu, Menu Unconditional Reject
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Form Select End

This action selects all the line from the current focused line to the last line at the bottom of the form.

### Meta

- **Aliases**: Form Select End
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

_No parameters._

---

## Form Select Home

This action selects all the line from the current focused line to the first line at the top of the form.

### Meta

- **Aliases**: Form Select Home
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

_No parameters._

---

## Form Select Range

This action selects all the line from the focused line to the line where mouse is clicked.

### Meta

- **Aliases**: Form Select Range
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

_No parameters._

---

## Message Box

This action is used to display a message to the user. On Pressing any key, it returns to the calling screen.

### Meta

- **Aliases**: Message Box
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an string expression which is displayed in the message box. | Identifier | String | Yes | No | No |
| 2 | This is an string expression which is displayed in the message box. | Identifier | String | Yes | No | No |

---

## Remove Line

This action is used to remove a line.

### Meta

- **Aliases**: Remove Line
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Show Last Removed Line

This action is used to restore last removed line.

### Meta

- **Aliases**: Show Last Removed Line
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

_No parameters._

---

## Show Removed Lines

This action is used to restore all removed lines.

### Meta

- **Aliases**: Show Removed Lines
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Display

### Parameters

_No parameters._

---
