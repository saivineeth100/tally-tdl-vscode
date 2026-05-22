# System Action

> **Version**: 7.0

Reference documentation for all entries in the **System** action.

> **Total Entries**: 152

## Table of Contents

- [Action](#action)
- [Add Tile](#add-tile)
- [Alter](#alter)
- [Alter Collection](#alter-collection)
- [Alter Current Collection](#alter-current-collection)
- [Alter Current Report](#alter-current-report)
- [Alter Ex](#alter-ex)
- [Append](#append)
- [Audit Form](#audit-form)
- [Audit Object](#audit-object)
- [Auto Columns](#auto-columns)
- [Auto Set](#auto-set)
- [Backup Company](#backup-company)
- [Browse Url](#browse-url)
- [Browse Url Ex](#browse-url-ex)
- [Calculator](#calculator)
- [Call](#call)
- [Cancel Object](#cancel-object)
- [Change Crypt Company](#change-crypt-company)
- [Change Output Mode](#change-output-mode)
- [Change Table](#change-table)
- [Clear Table Stack](#clear-table-stack)
- [Close Company](#close-company)
- [Configuration](#configuration)
- [Copy File](#copy-file)
- [Copy To Clipboard](#copy-to-clipboard)
- [Copy Variable](#copy-variable)
- [Create](#create)
- [Create Collection](#create-collection)
- [Create Ex](#create-ex)
- [Cycle Back](#cycle-back)
- [Delete Config Data](#delete-config-data)
- [Delete File](#delete-file)
- [Delete Object](#delete-object)
- [DeleteNotifications](#deletenotifications)
- [DisconnectUser](#disconnectuser)
- [Display](#display)
- [Display Collection](#display-collection)
- [Display Current Collection](#display-current-collection)
- [Display Current Report](#display-current-report)
- [Display Ex](#display-ex)
- [Display Help](#display-help)
- [Do If](#do-if)
- [Dump Debug](#dump-debug)
- [Dump Profile](#dump-profile)
- [Dump Record](#dump-record)
- [Duplicate](#duplicate)
- [Exchange](#exchange)
- [Exec COM Interface](#exec-com-interface)
- [Exec Excel Macro](#exec-excel-macro)
- [Execute Obj Actions](#execute-obj-actions)
- [Execute TDL](#execute-tdl)
- [ExecuteObjectMap](#executeobjectmap)
- [Expand Tile](#expand-tile)
- [Export](#export)
- [Export Collection](#export-collection)
- [Export Current Collection](#export-current-collection)
- [Export Current Report](#export-current-report)
- [Export Snapshot](#export-snapshot)
- [Focus Above Tile](#focus-above-tile)
- [Focus Below Tile](#focus-below-tile)
- [Focus Next Tile](#focus-next-tile)
- [Focus Previous Tile](#focus-previous-tile)
- [ForceDisconnectUser](#forcedisconnectuser)
- [HTTP Request](#http-request)
- [Ignore Field](#ignore-field)
- [Import](#import)
- [Import Snapshot](#import-snapshot)
- [InitClientSync](#initclientsync)
- [Insert](#insert)
- [List Add](#list-add)
- [List Add Ex](#list-add-ex)
- [List Delete](#list-delete)
- [List Delete Ex](#list-delete-ex)
- [List Expand](#list-expand)
- [List Fill](#list-fill)
- [List Key Sort](#list-key-sort)
- [List Reset Sort](#list-reset-sort)
- [List Value Sort](#list-value-sort)
- [Load Language](#load-language)
- [Load TDL](#load-tdl)
- [Load Variable](#load-variable)
- [Log Object](#log-object)
- [Mail](#mail)
- [Mail Collection](#mail-collection)
- [Mail Current Collection](#mail-current-collection)
- [Mail Current Report](#mail-current-report)
- [MailEx](#mailex)
- [Make Dir](#make-dir)
- [MasterImport](#masterimport)
- [Menu](#menu)
- [Menu Reject All](#menu-reject-all)
- [Modify Dashboard Variables](#modify-dashboard-variables)
- [Modify Object](#modify-object)
- [Modify Original](#modify-original)
- [Modify System](#modify-system)
- [Modify Variables](#modify-variables)
- [Modify Variables Only](#modify-variables-only)
- [Multi Field Set](#multi-field-set)
- [Multi Set](#multi-set)
- [Online Snapshot Exchange](#online-snapshot-exchange)
- [Pause Record](#pause-record)
- [Playback Key](#playback-key)
- [Popup Menu](#popup-menu)
- [Print](#print)
- [Print Collection](#print-collection)
- [Print Current Collection](#print-current-collection)
- [Print Current Report](#print-current-report)
- [RaiseNotification](#raisenotification)
- [Refresh Data](#refresh-data)
- [Related Display](#related-display)
- [Remove Tile](#remove-tile)
- [Replace](#replace)
- [Reset Password](#reset-password)
- [Restore Company](#restore-company)
- [Resume Record](#resume-record)
- [Save Variable](#save-variable)
- [Select Company](#select-company)
- [Select Display](#select-display)
- [Set](#set)
- [Set Field](#set-field)
- [Set Object Values](#set-object-values)
- [Show Window](#show-window)
- [Shut Company](#shut-company)
- [Shut Company Collection](#shut-company-collection)
- [Sleep](#sleep)
- [Start Debug](#start-debug)
- [Start Profile](#start-profile)
- [Start Record](#start-record)
- [Start Service](#start-service)
- [Start Timer](#start-timer)
- [Start Vat Session](#start-vat-session)
- [StartScheduler](#startscheduler)
- [Stop Debug](#stop-debug)
- [Stop Profile](#stop-profile)
- [Stop Record](#stop-record)
- [Stop Service](#stop-service)
- [Stop Timer](#stop-timer)
- [Sub Form](#sub-form)
- [Synchronize](#synchronize)
- [Synchronize Fixed](#synchronize-fixed)
- [Trigger Key](#trigger-key)
- [Unload TDL](#unload-tdl)
- [Unzip](#unzip)
- [Upload](#upload)
- [Upload Vat Return](#upload-vat-return)
- [WhatsApp](#whatsapp)
- [WhatsApp Collection](#whatsapp-collection)
- [WhatsApp Current Collection](#whatsapp-current-collection)
- [WhatsApp Current Report](#whatsapp-current-report)
- [WriteINI](#writeini)
- [Zip](#zip)

---

## Action

This action is to execute actions based on dynamic evaluation of parameters.

### Meta

- **Aliases**: Action
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This can be any expression which is evaluated to an action name like LOG, DISPLAY. | Keyword | String | Yes | No | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 2 | This can be any expression which is evaluated to an action name like LOG, DISPLAY. | Value | String | No | No |  |  | No |

---

## Add Tile

This action is used to add a new tile to the Dashboard report.

### Meta

- **Aliases**: Add Tile
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The report name used for executing the addition of a tile to the Dashboard. This report can allow users to choose a tile report from a collection of tile report objects. | Identifier | (null) | Yes | Yes | Report | No |

---

## Alter

This action is used to open a specific report for alteration.

### Meta

- **Aliases**: Alter
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report | Identifier | String | Yes | Yes | Report | No |

---

## Alter Collection

This action is used to serve the collection of objects for alteration purposes. The second parameter optionally can provide object identifier. The third parameter allows providing an error message or no action to be taken. The fourth parameter is provided whether no operation should be performed in case the collection is empty, or trigger report should be opened.

### Meta

- **Aliases**: Alter Collection
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of a collection. | Identifier | String | Yes | Yes | Collection | No |
| 2 | This is the name of a collection. | Value | String | No | No |  | No |
| 3 | An expression which evaluates to whether the trigger report should be displayed or error message in case the specified object is not found in the collection. | Value | Logical | No | No |  | No |
| 4 | An expression which evaluates to whether the trigger report should be displayed or error message in case the specified object is not found in the collection. | Value | Logical | No | No |  | No |

---

## Alter Current Collection

This action executes the alter collection on the collection defined at the object level.

### Meta

- **Aliases**: Alter Current Collection
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any expression which evaluates to the name of the selected object. | Value | String | No | No | No |
| 2 | Any expression which evaluates to the name of the selected object. | Value | Logical | No | No | No |

---

## Alter Current Report

This action executes a alter action on the Report defined at the object level.

### Meta

- **Aliases**: Alter Current Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Alter Ex

This action is  used to Alter Extended objects. Eg. User Security Level.This action inherits the object from the calling environment.

### Meta

- **Aliases**: Alter Ex
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is name of Report. | Identifier | String | Yes | Yes | Report | No |

---

## Append

This action is used to Append a new object after the selected object in current report. Eg. Appending a voucher in DayBook report.

### Meta

- **Aliases**: Append
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be opened to create the object to be appended. | Identifier | String | Yes | Yes | Report | No |

---

## Audit Form

This action is used to Audit forms.

### Meta

- **Aliases**: Audit Form
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Comma separated list of Collection names. | Value | String | Yes | No | No |

---

## Audit Object

This action is used to perform audit on the current object.

### Meta

- **Aliases**: Audit Object
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object/Collection
- **Mode**: Edit

### Parameters

_No parameters._

---

## Auto Columns

This action is used to add an autorepeat column in a report.

### Meta

- **Aliases**: Auto Columns
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | No | Yes | Report | No |

---

## Auto Set

This action is used in the Edit mode to set values to the variable or field.

### Meta

- **Aliases**: Auto Set
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: User Interface
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the variable or field. | Identifier | (null) | Yes | Yes | Variable | No |
| 2 | Name of the variable or field. | Value | String | Yes | No |  | No |

---

## Backup Company

This action is used to take Backup of specified company.

### Meta

- **Aliases**: Backup Company
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Company
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Seperator Character used in the next parameter. | Value | String | Yes | No | No |
| 2 | Seperator Character used in the next parameter. | Value | String | Yes | No | No |

---

## Browse Url

This action opens the item specified by the parameter. The item can be a file or folder or URL or Exe. If no parameter is there by default it will launch Tally website.

### Meta

- **Aliases**: Browse Url, Exec Command
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an string expression which evaluates to path or filename. | Value | String | No | No | No |
| 2 | This is an string expression which evaluates to path or filename. | Value | String | No | No | No |
| 3 | This is optional parameter. Yes for executing in hidden mode. | Value | Logical | No | No | No |
| 4 | This is optional parameter. Yes for executing in hidden mode. | Value | Logical | No | No | No |

---

## Browse Url Ex

This action is same as Browse URL, but waits till browse action is completed.

### Meta

- **Aliases**: Browse Url Ex, Exec Command Ex
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates path or filename. | Value | String | No | No | No |
| 2 | This is an expression which evaluates path or filename. | Value | String | No | No | No |
| 3 | This is optional parameter. Defaults to Yes. Yes for execute and wait for process completion. | Value | Logical | No | No | No |

---

## Calculator

This action is used in a field which requires some computation.

### Meta

- **Aliases**: Calculator
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Call

This action is used to call TDL function.

### Meta

- **Aliases**: Call
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of function to be called. | Identifier | String | Yes | Yes | Function | No |
| 2 | Parameters of the function being called. Properties of this varies based on the function. | Identifier |  | No | Yes |  | No |

---

## Cancel Object

This action is used to Cancel current object.

### Meta

- **Aliases**: Cancel Object
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object/Collection
- **Mode**: Edit

### Parameters

_No parameters._

---

## Change Crypt Company

This action is  used to change the Tally Vault passoword for a Company

### Meta

- **Aliases**: Change Crypt Company
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Company
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is string expression contains the separator character used for each company in next parameter. | Value | String | No | No | No |
| 2 | This is string expression which contains destination path,old vault password,new vault password,company name. | Value | String | No | No | No |

---

## Change Output Mode

Action to change output mode for print/export/mail/upload.

### Meta

- **Aliases**: Change Output Mode
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the action. | Keyword | Long | Yes | Yes | No |

---

## Change Table

This attribute allows calling a new Table or same table with appended values in the same field, without accepting the field or moving to the next field.

### Meta

- **Aliases**: Change Table
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: Object/Collection
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is a list of comma-separated table names. | Identifier |  | Yes | Yes | Collection | No |
| 2 | This is a list of comma-separated table names. | Value | Logical | No | No |  | No |
| 3 | An expression which evaluates to identify default first matching node for the cursor. | Value | Logical | No | No |  | No |
| 4 | An expression which evaluates to identify default first matching node for the cursor. | Value | Logical | No | No |  | No |

---

## Clear Table Stack

Clear all stacked table from Change table action.

### Meta

- **Aliases**: Clear Table Stack
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object/Collection
- **Mode**: Both

### Parameters

_No parameters._

---

## Close Company

This action is used to Close the selected Company.

### Meta

- **Aliases**: Close Company
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Company
- **Mode**: Both

### Parameters

_No parameters._

---

## Configuration

This action opens the configuration for the display report.

### Meta

- **Aliases**: Configuration
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the report. | Identifier | (null) | No | No | Report | No |

---

## Copy File

This action is used to Copy of a file from One Folder to Another Folder (File to File),Uploading of Files from a given Path to a FTP Site,Downloading of File from FTP Site to specified location/folder.

### Meta

- **Aliases**: Copy File
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to destination file name with absolute path. | Value | String | Yes | No | No |
| 2 | Source file name with absolute path. | Value | String | Yes | No | No |

---

## Copy To Clipboard

This action is used to copy the string passed to Windows clipboard. It can be used to copy text from report in Display mode by adding a button to the report, and calling this action by passing appropriate string to be copied.

### Meta

- **Aliases**: Copy To Clipboard
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | String that is to be copied to clipboard. | Value | String | Yes | No | No |

---

## Copy Variable

This action copies values  from source variable to the destination variable. Copying of all variable types  are supported.

### Meta

- **Aliases**: Copy Variable, Copy Variables
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is destination variable name. | Identifier | String | Yes | No | Variable | No |
| 2 | This is destination variable name. | Identifier | String | Yes | No | Variable | No |

---

## Create

This action is used to open a specific report for creating an object.

### Meta

- **Aliases**: Create, Execute
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be opened to create an object. | Identifier | String | Yes | Yes | Report | No |

---

## Create Collection

This action is used to Create Collection of objects which are used in menus such as Voucher collection,Client Rules collection etc.

### Meta

- **Aliases**: Create Collection
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the collection. | Identifier | String | Yes | Yes | Collection | No |

---

## Create Ex

This action is used to Create Extended objects. Eg. User Security Level.

### Meta

- **Aliases**: Create Ex, Execute Ex
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is name of Report. | Identifier | String | Yes | Yes | Report | No |

---

## Cycle Back

This action takes back to previous table.

### Meta

- **Aliases**: Cycle Back
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object/Collection
- **Mode**: Both

### Parameters

_No parameters._

---

## Delete Config Data

This action is used to delete the config data object which can be either an Excel Map object or a Report object saved by the user from the Company or application level.

### Meta

- **Aliases**: Delete Config Data
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Delete File

This action is used to Delete a file from specified location/folder.

### Meta

- **Aliases**: Delete File
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to a file name with absolute path which needs to be deleted. | Value | String | Yes | No | No |

---

## Delete Object

This action is used to Delete the current object.

### Meta

- **Aliases**: Delete Object
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Object/Collection
- **Mode**: Edit

### Parameters

_No parameters._

---

## DeleteNotifications

This action is used to remove all notifications of a specified activity type.

### Meta

- **Aliases**: DeleteNotifications
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Provides the name of the TDL notification activity to be deleted. | Identifier | (null) | Yes | Yes | Notification | No |

---

## DisconnectUser

This action is used to Disconnect the users from companies that are accessed from TallyPrime Server. This function will display a message to the clients, to close the company within 2 minutes  before forcing a close.

### Meta

- **Aliases**: DisconnectUser
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It accepts the name of the TallyPrime Server from which the companies being accessed. | Value | String | Yes | No | No |
| 2 | It accepts the name of the company to be disconnected. '*' can be used to specify all companies. | ExpressionEx | String | Yes | No | No |
| 3 | It accepts the name of the company to be disconnected. '*' can be used to specify all companies. | ExpressionEx | String | Yes | No | No |

---

## Display

This action is  used to display a specific report.

### Meta

- **Aliases**: Display
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Display
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | Yes | Yes | Report | No |

---

## Display Collection

This action is used to serve the collection of objects for display purposes. The second parameter optionally can provide an object identifier. The third parameter allows providing an error message or no action to be taken. The fourth parameter is provided whether no operation should be performed in case collection is empty, or trigger report should be opened.

### Meta

- **Aliases**: Display Collection
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of a collection. | Identifier | String | Yes | Yes | Collection | No |
| 2 | An expression that evaluates to Name of a selected object. | Value | String | No | No |  | No |
| 3 | An expression that evaluates to Name of a selected object. | Value | Logical | No | No |  | No |
| 4 | An expression that evaluates whether the trigger report should be displayed or not in case the collection is empty. | Value | Logical | No | No |  | No |

---

## Display Current Collection

This action executes the display collection on the collection defined at the object level.

### Meta

- **Aliases**: Display Current Collection
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any expression which evaluates to the name of the selected object. | Value | String | No | No | No |
| 2 | Any logical expression. This parameter checks whether the trigger report should be displayed or the error message in case the specified object is not found in the collection. | Value | Logical | No | No | No |

---

## Display Current Report

This action executes a display action on the Report defined at the object level.

### Meta

- **Aliases**: Display Current Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Display Ex

This action is used to Display Extended objects such as User Security Level.This action inherits the object from wherever it is called.

### Meta

- **Aliases**: Display Ex
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Display
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is name of the report. | Identifier | String | Yes | Yes | Report | No |

---

## Display Help

This action is used to display context based help from tally reference chm file. It lanches the help file of the module if GUID is provided otherwise Context is picked from active report. If no report active then context is taken from current menu.

### Meta

- **Aliases**: Display Help
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an optional argument to specify the GUID of the module of which help needs to be opened. | Value | String | No | No | No |
| 2 | This is an optional argument to specify the GUID of the module of which help needs to be opened. | Value | String | No | No | No |

---

## Do If

Do If evaluates the given condition to true or false. If true, it executes the specified action. It can also be used in user defined functions.

### Meta

- **Aliases**: Do If
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | A value, or an expression that can be evaluated to True or False. | Value | Logical | Yes | No |  |  | No |
| 2 | A value, or an expression that can be evaluated to True or False. | Keyword | Long | Yes | Yes | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 3 | List of parameters as required by the action specified, separated by colon. | Value |  | No | Yes |  |  | No |

---

## Dump Debug

Dumps all expressions Debuged.

### Meta

- **Aliases**: Dump Debug
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the File to which the Information is to be written. Default is Debug.xlsx | Value | String | No | No | No |

---

## Dump Profile

Dumps all Profiled Information to the file passed as Parameter.

### Meta

- **Aliases**: Dump Profile
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the File to which the Profile Information is to be written. Default is tdlprof.xlsx | Value | String | No | No | No |
| 2 | This specifies whether zero valued items be dumped or not, Default is No. | Value | Logical | No | No | No |

---

## Dump Record

Dumps all Recordings. Each recording is dumped with its name and Keys

### Meta

- **Aliases**: Dump Record, Dump Recording
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the File to which the Recordings is to be written to. Default is macros.log | Value | String | No | No | No |
| 2 | Seperator To be Used between the recording name and Keys. Default is '~' | Value | String | No | No | No |

---

## Duplicate

This action is used to Duplicate the selected object in current report. Eg. Duplicating voucher in DayBook report.

### Meta

- **Aliases**: Duplicate
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be opened to create the object to be duplicated. | Identifier | String | Yes | Yes | Report | No |

---

## Exchange

This action is used to exchange values of two variables. Variables should be same data type.

### Meta

- **Aliases**: Exchange
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Variable
- **Mode**: Display
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Variable. | Identifier | String | Yes | No | Variable | No |
| 2 | Name of Variable. | Identifier | String | Yes | No | Variable | No |

---

## Exec COM Interface

This is used to invoke the defined COM Interface.

### Meta

- **Aliases**: Exec COM Interface
- **Total Parameters**: Variable
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It accepts the name of COM Interface Definition. The COM Interface Definition provides the information like name of function, return type and type of parameters. | Identifier | (null) | Yes | No | COM Interface | No |
| 2 | It accepts the name of COM Interface Definition. The COM Interface Definition provides the information like name of function, return type and type of parameters. | Identifier | (null) | No | No |  | No |

---

## Exec Excel Macro

This action is used to execute a macro defined in an excel sheet.

### Meta

- **Aliases**: Exec Excel Macro
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to the name of the macro to be executed. | Value | String | Yes | No | No |
| 2 | This is an expression which evaluates to the name of the macro to be executed. | Identifier | Logical | No | Yes | No |

---

## Execute Obj Actions

This action is used at the field level to refer to the action label of the collection when an object is selected.

### Meta

- **Aliases**: Execute Obj Actions
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is a label to identify the action. | Identifier | Yes | Yes | No |

---

## Execute TDL

Loads a TDL file and executes an action after loading optionally 

### Meta

- **Aliases**: Execute TDL
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the TDL file to be loaded , could be of any known TDL formats (.tdl, .tcp, .txt) | Value | String | Yes | No |  |  | No |
| 2 | Name of the TDL file to be loaded , could be of any known TDL formats (.tdl, .tcp, .txt) | Value | Logical | No | No |  |  | No |
| 3 | Specifies The Action to be executed after loading TDL | Keyword | Long | No | Yes | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 4 | Specifies The Action to be executed after loading TDL | Value |  | No | Yes |  |  | No |

---

## ExecuteObjectMap

This action is used to execute the object map definition.

### Meta

- **Aliases**: ExecuteObjectMap
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object/Collection
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This parameter is used to specify the name of the object map. | Identifier | (null) | Yes | Yes | Object Map | No |

---

## Expand Tile

This action is used to open the active tile report in the expanded view of the Dashboard.

### Meta

- **Aliases**: Expand Tile
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Export

This action initiates data export activity using the given report.

### Meta

- **Aliases**: Export
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | Yes | Yes | Report | No |
| 2 | This is an expression when eveluated to TRUE it supresses the configuration window. | Value | Logical | No | No |  | No |
| 3 | This is an expression when eveluated to TRUE it supresses the configuration window. | Value | Logical | No | No |  | No |

---

## Export Collection

This action is used to serve the collection of objects for export purposes. The second parameter optionally can provide an object identifier. The third parameter allows providing an error message or no action to be taken. The fourth parameter is provided whether no operation should be performed in case collection is empty, or trigger report should be opened.

### Meta

- **Aliases**: Export Collection
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of a collection. | Identifier | String | Yes | Yes | Collection | No |
| 2 | This is the name of a collection. | Value | String | No | No |  | No |
| 3 | An expression which evaluates to whether the trigger report should be displayed or error message in case the specified object is not found in the collection. | Value | Logical | No | No |  | No |
| 4 | An expression which evaluates to whether the trigger report should be displayed or error message in case the specified object is not found in the collection. | Value | Logical | No | No |  | No |

---

## Export Current Collection

This action executes the export collection on the collection defined at the object level.

### Meta

- **Aliases**: Export Current Collection
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any expression which evaluates to the name of the selected object. | Value | String | No | No | No |
| 2 | Any expression which evaluates to the name of the selected object. | Value | Logical | No | No | No |

---

## Export Current Report

This action executes an Export action on the Report defined at the object level.

### Meta

- **Aliases**: Export Current Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Export Snapshot

This action Exports the snapshot for  given company and rule.

### Meta

- **Aliases**: Export Snapshot
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evalautes to TRUE - for exporting Client rule snapshot, FALSE - for exporting Server rule snapshot. | Value | Logical | Yes | No | No |
| 2 | This is an expression which evalautes to TRUE - for exporting Client rule snapshot, FALSE - for exporting Server rule snapshot. | Value | String | Yes | No | No |
| 3 | This is an espression which evaluates to the name of the rule. | Value | String | Yes | No | No |
| 4 | This is an espression which evaluates to the name of the rule. | Value | String | Yes | No | No |

---

## Focus Above Tile

This action is used to shift the focus from the currently active tile to the tile above it in the Dashboard report. 

### Meta

- **Aliases**: Focus Above Tile
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Focus Below Tile

This action is used to shift the focus from the currently active tile to the tile below it in the Dashboard report.

### Meta

- **Aliases**: Focus Below Tile
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Focus Next Tile

This action is used to shift the focus from the currently active tile to its next tile in the Dashboard report.

### Meta

- **Aliases**: Focus Next Tile
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Focus Previous Tile

This action is used to shift the focus from the currently active tile to its previous tile in the Dashboard report.

### Meta

- **Aliases**: Focus Previous Tile
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## ForceDisconnectUser

This action is used to forcefully disconnect the users from companies that are accessed from TallyPrime Server.

### Meta

- **Aliases**: ForceDisconnectUser
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It accepts the name of the Tally.Server from which the companies are being accessed. | Value | String | Yes | No | No |
| 2 | It accepts the name of the company to be disconnected. '*' can be used to specify all companies. | ExpressionEx | String | Yes | No | No |
| 3 | It accepts the name of the company to be disconnected. '*' can be used to specify all companies. | ExpressionEx | String | Yes | No | No |

---

## HTTP Request

HTTP Request Action can be used to submit data to a server over HTTP and gather the response. This will enable a TDL Report to perform a HTTP Post to a remote location.

### Meta

- **Aliases**: HTTP Request
- **Total Parameters**: 6
- **Total Mandatory Parameters**: 5
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an expression that resolves to a URL | ExpressionEx | String | Yes | No |  |  |  | No |
| 2 | This is an expression that resolves to a URL | Keyword | String | Yes | No |  | HTTP Methods | GET, POST, PUT | No |
| 3 | Request Format XML/JSON/JSON EX | Keyword | String | Yes | No |  | File Data Format | JSON, JSONEX, XML | No |
| 4 | Request Format XML/JSON/JSON EX | Keyword | String | Yes | No |  | Encoding | ASCII, Unicode, Unicode8, UTF16, UTF8 | No |
| 5 | This is the name of the TDL Report which will be used for generating XML/JSON Request to be sent. Only header will be considered when HTTP Method is GET. | Identifier | String | Yes | No | Report |  |  | No |
| 6 | This is the name of the TDL Report which will be used for generating XML/JSON Request to be sent. Only header will be considered when HTTP Method is GET. | Identifier | String | No | No | Function |  |  | No |

---

## Ignore Field

This action allows clearing the text of the field. The second parameter also allows resetting the cursor to the position required.

### Meta

- **Aliases**: Ignore Field
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | An expression which evaluates to logical value to indicate text to be cleared from field. | Value | Logical | No | No | No |
| 2 | An expression which evaluates to logical value to indicate text to be cleared from field. | Value | Logical | No | No | No |

---

## Import

This action initiates data import activity using the given report.

### Meta

- **Aliases**: Import
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of Report / Import File. | Identifier | (null) | Yes | Yes | No |
| 2 | Name of Report / Import File. | Value | Logical | No | No | No |

---

## Import Snapshot

This action Imports snapshot for the given company and rule.

### Meta

- **Aliases**: Import Snapshot
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | TRUE - for importing Client rule snapshot, FALSE - for importing Server rule snapshot. | Value | Logical | Yes | No | No |
| 2 | TRUE - for importing Client rule snapshot, FALSE - for importing Server rule snapshot. | Value | String | Yes | No | No |
| 3 | This is an espression which evaluates to the name of the rule. | Value | String | Yes | No | No |
| 4 | This is an espression which evaluates to the name of the rule. | Value | String | Yes | No | No |

---

## InitClientSync

Requests the client(s) to initiate Synchronization. Used to initiate sync from server side.

### Meta

- **Aliases**: InitClientSync
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the company for which synchronization has to be performed. If this is empty, synchronization will be initiated for all the open companies | Value | String | No | No | No |
| 2 | Name of the rule to be synchronized from a given company. If this is empty, synchronization will be initiated for all server rules available in the company | Value | String | No | No | No |

---

## Insert

This action is used to Insert a new object before the selected object in a current report. Eg. Inserting a voucher in DayBook report.

### Meta

- **Aliases**: Insert
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be opened to create the object to be inserted. | Identifier | String | Yes | Yes | Report | No |

---

## List Add

This action adds an element to the List variable based on Key.

### Meta

- **Aliases**: List Add, List Append, List Set
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the list variable. | Identifier | String | Yes | No | Variable | No |
| 2 | Name of the list variable. | Value | String | Yes | No |  | No |
| 3 | This is an expression which evaluates to the value to be set. | Value |  | No | No |  | No |
| 4 | This is an expression which evaluates to the value to be set. | Identifier |  | No | Yes |  | No |

---

## List Add Ex

This action adds an element to the List variable based on Index.

### Meta

- **Aliases**: List Add Ex, List Append Ex
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name to the list variable. | Identifier | String | Yes | No | Variable | No |
| 2 | Name to the list variable. | Value |  | No | No |  | No |
| 3 | Member specification. | Identifier |  | No | Yes |  | No |

---

## List Delete

This action deletes element(s) from the specified List variable based on Key.

### Meta

- **Aliases**: List Delete, List Remove
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the list variable from which the element(s) are to be deleted. | Identifier | String | Yes | No | Variable | No |
| 2 | Key for which the corresponding element variable has to be deleted. If not specified, deletes all the elements of the specified list variable. | Value | String | No | No |  | No |

---

## List Delete Ex

This action deletes element(s) from the specified List variable based on the Index value.

### Meta

- **Aliases**: List Delete Ex, List Remove Ex
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the list variable from which the element(s) are to be deleted. | Identifier | String | Yes | No | Variable | No |
| 2 | Index of the element variable which is to be deleted from the list. If not specified, deletes all the elements of the specified list variable. | Value | Long | No | No |  | No |

---

## List Expand

This action expands the List variable by specified number of elements.

### Meta

- **Aliases**: List Expand
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of List variable. | Identifier | String | Yes | No | Variable | No |
| 2 | This is an expression which specifies the number of elements to be added in the list variable. | Value | Long | No | No |  | No |

---

## List Fill

This action fills a List variable from a Collection.

### Meta

- **Aliases**: List Fill
- **Total Parameters**: 5
- **Total Mandatory Parameters**: 2
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the List Variable. | Identifier | String | Yes | No | Variable | No |
| 2 | Collection Name. | Identifier |  | Yes | Yes | Collection | No |
| 3 | Collection Name. | Value | String | No | No |  | No |
| 4 | This is an expression which evaluates Value Formula. | Value |  | No | No |  | No |
| 5 | This is an expression which evaluates Value Formula. | Identifier |  | No | Yes |  | No |

---

## List Key Sort

This action sorts the elements of List variable based on KEY.

### Meta

- **Aliases**: List Key Sort, List Sort
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the List Variable. | Identifier | String | Yes | No | Variable | No |
| 2 | Name of the List Variable. | Identifier | Logical | No | Yes |  | No |
| 3 | Datatype for KEY used for sorting. | Identifier | Long | No | Yes |  | No |
| 4 | Datatype for KEY used for sorting. | Identifier |  | No | Yes |  | No |

---

## List Reset Sort

This action resets the sort to the insertion order.

### Meta

- **Aliases**: List Reset Sort
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the List Variable. | Identifier | String | Yes | No | Variable | No |

---

## List Value Sort

This action sorts the element of the List Variable based on Value.

### Meta

- **Aliases**: List Value Sort
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the List Variable. | Identifier | String | Yes | No | Variable | No |
| 2 | This accepts value True to sort the elements in Ascending order else FALSE. | Identifier | Logical | No | Yes |  | No |
| 3 | This accepts value True to sort the elements in Ascending order else FALSE. | Identifier | Long | No | Yes |  | No |
| 4 | Member specification in case of compound variable. | Identifier |  | No | Yes |  | No |

---

## Load Language

This action is used to load a language dictionary given a language ID.

### Meta

- **Aliases**: Load Language
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to language ID. | Value | Number | Yes | No | No |

---

## Load TDL

Specify file-path of the TDL to be loaded

### Meta

- **Aliases**: Load TDL
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of State for which VAT Upload session is to be created. | Value | String | Yes | No | No |

---

## Load Variable

This action loads the values of the variable which were persisted into a file.

### Meta

- **Aliases**: Load Variable, Load Variables
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | File name where variable were persisted. | Value | String | Yes | No |  | No |
| 2 | This is List of comma separated variables. | Identifier | (null) | No | No | Variable | No |

---

## Log Object

This action is to log the context object, its method and collection in the specified name.

### Meta

- **Aliases**: Log Object
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is File name where to log the context of the object. | Identifier | String | Yes | Yes | No |
| 2 | This is an expression which returns the Expression OverWrite flag. | Value | Logical | No | No | No |

---

## Mail

This action mails the specified report.

### Meta

- **Aliases**: Mail
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Name of Report. | Identifier | String | Yes | Yes | Report | No |
| 2 | This is an expression when eveluated to TRUE it supresses the configuration window. | Value | Logical | No | No |  | No |

---

## Mail Collection

This action is used to serve the collection of objects for mail purpose. The second parameter optionally can provide object identifier. The third parameter allows providing an error message or no action to be taken. The fourth parameter is provided whether no operation should be performed in case the collection is empty, or trigger report should be opened.

### Meta

- **Aliases**: Mail Collection
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of a collection. | Identifier | String | Yes | Yes | Collection | No |
| 2 | An expression that evaluates to Name of a selected object. | Value | String | No | No |  | No |
| 3 | An expression that evaluates to Name of a selected object. | Value | Logical | No | No |  | No |
| 4 | An expression which evaluates to whether the trigger report should be displayed or not in case the collection is empty. | Value | Logical | No | No |  | No |

---

## Mail Current Collection

This action executes the mail collection on the collection defined at the object level.

### Meta

- **Aliases**: Mail Current Collection
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any expression which evaluates to the name of the selected object. | Value | String | No | No | No |
| 2 | Any logical expression. This parameter checks whether the trigger report should be displayed or the error message in case the specified object is not found in the collection. | Value | Logical | No | No | No |

---

## Mail Current Report

This action executes a mail action on the Report defined at the object level.

### Meta

- **Aliases**: Mail Current Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## MailEx

This action mails the specified report.

### Meta

- **Aliases**: MailEx
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Name of Report. | Identifier | String | Yes | Yes | Report | No |

---

## Make Dir

Creates a directory.

### Meta

- **Aliases**: Make Dir
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The directory path that needs to be created. Creates the entire path if it does not exist. | Value | String | Yes | No | No |

---

## MasterImport

This action will import default masters to the current company. Currently only payroll masters gets re-imported

### Meta

- **Aliases**: MasterImport
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the Stage information to be displayed in progress info section of Progress Bar in Migration scenarios. | Value | String | No | No | No |

---

## Menu

This action is used to launch a menu.

### Meta

- **Aliases**: Menu
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Menu name which is to be launched | Identifier | String | Yes | Yes | Menu | No |

---

## Menu Reject All

This action is used to Reject all menus.

### Meta

- **Aliases**: Menu Reject All
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Modify Dashboard Variables

This action is used to launch a report in Auto mode and modify the values of all existing tile variables if the scope is set to the dashboard. Once the modification is done successfully, all tiles will refresh to reflect the updated values.

### Meta

- **Aliases**: Modify Dashboard Variables
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Variable
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the report name | Identifier | String | No | Yes | Report | No |

---

## Modify Object

This action is used to update/modify   multiple values of an object from any  level.

### Meta

- **Aliases**: Modify Object
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object/Collection
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Comma separated list of Method Name and value pair. | Identifier | String | Yes | Yes | No |

---

## Modify Original

This action is used to launch a report in Auto mode and modify the value of a variables in the context of parent report. But this replaces the Current auto report with the specified report for variable modification.

### Meta

- **Aliases**: Modify Original
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Variable
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | No | Yes | Report | No |

---

## Modify System

This action launches a report in Auto mode and allows to modify the  variables at system scope.

### Meta

- **Aliases**: Modify System
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Variable
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | No | Yes | Report | No |

---

## Modify Variables

This action is used to launch a report in Auto mode and modify the value of a variables in the context of parent report. After a successful modification, refreshes the parent report.

### Meta

- **Aliases**: Modify Variables
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Variable
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | No | Yes | Report | No |

---

## Modify Variables Only

This action is used to launch a report in Auto mode and modify the value of a variables in the context of parent report. But it does not refresh the parent report after acceptance.

### Meta

- **Aliases**: Modify Variables Only
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Variable
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | No | Yes | Report | No |

---

## Multi Field Set

This action is used to set values into multiple fields.

### Meta

- **Aliases**: Multi Field Set
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Comma separated list of Field  Name and Variable name pair | Identifier | String | Yes | Yes | Field | No |
| 2 | Expression or values to be set into the fields. | Value | String | Yes | No |  | No |

---

## Multi Set

Sets the multiple Member Variable with the values specified. These members value pairs can be specified comma separated.

### Meta

- **Aliases**: Multi Set
- **Total Parameters**: Variable
- **Total Mandatory Parameters**: 3
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the List variable. | Identifier | Yes | Yes | Variable | No |
| 2 | Member Variable specification. | Identifier | Yes | Yes |  | No |
| 3 | Member Variable specification. | Value | Yes | No |  | No |

---

## Online Snapshot Exchange

This action is initiates online snapshot exchange for the given company and rule.

### Meta

- **Aliases**: Online Snapshot Exchange
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evalautes to the name of the company. | Value | String | Yes | No | No |
| 2 | This is an expression which evalautes to the name of the company. | Value | String | Yes | No | No |

---

## Pause Record

Used to Pause current Recording.

### Meta

- **Aliases**: Pause Record, Pause Recording
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

_No parameters._

---

## Playback Key

This action is used to playback recorded macros.

### Meta

- **Aliases**: Playback Key
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This takes an expression that contains comma seperated keys. | Value | String | Yes | No | No |
| 2 | This takes an expression that contains comma seperated keys. | Value | Long | No | No | No |

---

## Popup Menu

This action launches a popup menu from the button.

### Meta

- **Aliases**: Popup Menu
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify the name of the popup menu. | Identifier | String | Yes | Yes | Menu | No |

---

## Print

This action is used to Print a report.

### Meta

- **Aliases**: Print
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Display
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | Yes | Yes | Report | No |
| 2 | This is an expression which evaluates to a logical value to indicate whether to show configuration screen and UI or not. | Value | Logical | No | No |  | No |

---

## Print Collection

This action is used to serve the collection of objects for print purpose. The second parameter optionally can provide object identifier. The third parameter allows providing an error message or no action to be taken. The fourth parameter is provided whether no operation should be performed in case collection is empty, or trigger report should be opened.

### Meta

- **Aliases**: Print Collection
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of a collection. | Identifier | String | Yes | Yes | Collection | No |
| 2 | An expression that evaluates to Name of a selected object. | Value | String | No | No |  | No |
| 3 | An expression that evaluates to Name of a selected object. | Value | Logical | No | No |  | No |
| 4 | An expression which evaluates to whether the trigger report should be displayed or not in case the collection is empty. | Value | Logical | No | No |  | No |

---

## Print Current Collection

This action executes the print collection on the collection defined at the object level.

### Meta

- **Aliases**: Print Current Collection
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any expression which evaluates to the name of the selected object. | Value | String | No | No | No |
| 2 | Any logical expression. This parameter checks whether the trigger report should be displayed or the error message in case the specified object is not found in the collection. | Value | Logical | No | No | No |

---

## Print Current Report

This action executes a print action on the Report defined at the object level.

### Meta

- **Aliases**: Print Current Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## RaiseNotification

This action is used to open or raise a notification report and use this  specifically where notification-related behavior is required.

### Meta

- **Aliases**: RaiseNotification
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies the name of the TDL notification. | Identifier | (null) | Yes | Yes | Notification | No |
| 2 | It specifies the text to be displayed for a notification. | Value | String | Yes | No |  | No |

---

## Refresh Data

This action is used to update the company data in memory with latest updates from the  database in case of a multi user environment.

### Meta

- **Aliases**: Refresh Data
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Related Display

This action is used to display other Related reports from current report. Eg. Dislaying movement analysis report in stock voucher report.

### Meta

- **Aliases**: Related Display
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | Yes | Yes | Report | No |

---

## Remove Tile

This action is used to remove the active tile from a Dashboard report.

### Meta

- **Aliases**: Remove Tile
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## Replace

This Action is used to replace the current report by another such as Stock Item Creation,Godown Creation,Stock Group Creation reports can be switched among themselves.

### Meta

- **Aliases**: Replace
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | Yes | Yes | Report | No |

---

## Reset Password

Provides an option to user to change his password.

### Meta

- **Aliases**: Reset Password
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

_No parameters._

---

## Restore Company

This action is used to Restore the specified company.

### Meta

- **Aliases**: Restore Company
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Company
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Seperator Character used in the next parameter. | Value | String | Yes | No | No |
| 2 | This is string expression which contains Company destination path,source path,company name,company number. | Value | String | Yes | No | No |

---

## Resume Record

Used to Resume the Paused Recording.

### Meta

- **Aliases**: Resume Record, Resume Recording
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

_No parameters._

---

## Save Variable

The action SAVE VARIABLE is used to persist the Report Scope Variables in a user specified file.

### Meta

- **Aliases**: Save Variable, Save Variables
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the file to save. | Value | String | Yes | No |  | No |
| 2 | This is a list of comma separated variables. | Identifier | (null) | No | No | Variable | No |

---

## Select Company

This action is used to Select a Company.

### Meta

- **Aliases**: Select Company
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Company
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is string expression contains the separator character used for each company in next parameter. | Value | String | No | No | No |
| 2 | This is string expression which contains Name and number of the Company. | Value | String | No | No | No |

---

## Select Display

This action is used to display list of reports belonging to a specific category such as displaying inventory reports/accounting reports from monthly summary report.

### Meta

- **Aliases**: Select Display
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report. | Identifier | String | No | Yes | Report | No |

---

## Set

This action to set values to the variable or Field.

### Meta

- **Aliases**: Set
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Variable
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the variable. | Identifier | (null) | Yes | No | Variable | No |
| 2 | Name of the variable. | Value | String | Yes | No |  | No |

---

## Set Field

This action is used to set the value of the owner field in edit mode.

### Meta

- **Aliases**: Set Field
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This as a Value or expression to be set. | Value | String | No | No | No |

---

## Set Object Values

The action Set Object values work only in the Edit mode of a Report . It updates/modifies the values of an object from current context as specified. The object values are updates in memory. The changes are stored in the Tally database only when the primary object is saved.

### Meta

- **Aliases**: Set Object Values
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object/Collection
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Comma separated list of Method Name and value pair. | Identifier | String | Yes | Yes | No |

---

## Show Window

Creates a directory.

### Meta

- **Aliases**: Show Window
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify Yes / No to indicate whether to Show the Window or Hide. Default value is Yes. | Value | Logical | No | No | No |

---

## Shut Company

This action is used to Shutdown a Company.

### Meta

- **Aliases**: Shut Company
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Company
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is string expression contains the separator character used for each company in next parameter. | Value | String | No | No | No |
| 2 | This is string expression which contains Name and number of the Company. | Value | String | No | No | No |

---

## Shut Company Collection

This action enables to shut company with a selection of a company from anywhere in the system.

### Meta

- **Aliases**: Shut Company Collection
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Object/Collection
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This has to be the name of the collection to list companies. This must have a Trigger report for showing Select Table listing the company collection. | Identifier | String | Yes | Yes | Collection | No |

---

## Sleep

This action suspends the execution for specified Time.

### Meta

- **Aliases**: Sleep
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Time for which to suspend the execution of current thread. | Value | Long | Yes | No | No |

---

## Start Debug

Used to Start Debugging. All Expressions Evaluated will be Debugged.

### Meta

- **Aliases**: Start Debug
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

_No parameters._

---

## Start Profile

Used to Start Profiling. Every Function, Collection Gather and Expressions Are Profiled once the Profiling has started.

### Meta

- **Aliases**: Start Profile
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This specifies whether the profiler is to be run in detailed (In-Depth) mode. Default is No. | Value | Logical | No | No | No |

---

## Start Record

Used to Start Recording. Every Key entered will be recorded, which can be later used to Play Back.

### Meta

- **Aliases**: Start Record, Start Recording
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the Recording. Defualt is Macro | Value | String | No | No | No |

---

## Start Service

This action is used to start the specified service.

### Meta

- **Aliases**: Start Service
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It accepts expression which evaluates to name of the service. | Identifier | String | Yes | No | No |

---

## Start Timer

This Action starts a Timer for a specified Duration.

### Meta

- **Aliases**: Start Timer
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is name of the timer. | Value | String | Yes | No | No |
| 2 | This is name of the timer. | Value | Long | Yes | No | No |

---

## Start Vat Session

This action is used for Creating a session for VAT Upload.

### Meta

- **Aliases**: Start Vat Session
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 3
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of State for which VAT Upload session is to be created. | Value | String | Yes | No |  | No |
| 2 | Specify the name of State for which VAT Upload session is to be created. | Value | String | Yes | No |  | No |
| 3 | Specify the password for VAT Upload Portal | Value | String | Yes | No |  | No |
| 4 | Specify the password for VAT Upload Portal | Identifier | (null) | No | No | Report | No |

---

## StartScheduler

This action starts and runs the scheduler service. If the service is not already installed, it will be installed automatically and then started. If it is already installed, the action simply starts and runs it.

### Meta

- **Aliases**: StartScheduler
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Stop Debug

Used to Stop Debugging. If the First Parameter is Passed then the information is also dumped into the file.

### Meta

- **Aliases**: Stop Debug
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the File to which the Information is to be written. | Value | String | No | No | No |

---

## Stop Profile

Used to Stop Profiling. If the First Parameter is Passed then the information is also dumped into the file. 

### Meta

- **Aliases**: Stop Profile
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the File to which the Information is to be written. If this parameter is not passed the dump is not generated. | Value | String | No | No | No |
| 2 | This specifies whether zero valued items be dumped or not, Default is No. | Value | Logical | No | No | No |

---

## Stop Record

Used to Stop Recording.

### Meta

- **Aliases**: Stop Record, Stop Recording
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Both

### Parameters

_No parameters._

---

## Stop Service

This action is used to stop the specified service.

### Meta

- **Aliases**: Stop Service
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It accepts an expression which evaluates to name of the service. | Identifier | String | Yes | No | No |

---

## Stop Timer

This action stops the specified timer.

### Meta

- **Aliases**: Stop Timer
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the name of Timer. | Value | String | Yes | No | No |

---

## Sub Form

This action enables to execute a report through a button from the current context.

### Meta

- **Aliases**: Sub Form
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This refers to the name of a report. | Identifier | String | Yes | Yes | Report | No |

---

## Synchronize

This action initiates synchronization and exchanges data between client and server.

### Meta

- **Aliases**: Synchronize
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which evaluates to Name of the company.  If this is empty, synchronization will be initiated for all the open companies. | Value | String | No | No | No |
| 2 | This is an expression which evaluates to Name of the company.  If this is empty, synchronization will be initiated for all the open companies. | Value | String | No | No | No |

---

## Synchronize Fixed

Initiates synchronization and exchanges data between client and server

### Meta

- **Aliases**: Synchronize Fixed
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

_No parameters._

---

## Trigger Key

This action is used to execute the Trigger Key action. This supports comma-separated list of expressions, each evaluating to give a key/key-sequence

### Meta

- **Aliases**: Trigger Key
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Key to be executed. | Value | String | Yes | No | No |

---

## Unload TDL

This action is used to unload the specified TDL by its name or GUID.

### Meta

- **Aliases**: Unload TDL
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify name of the TDL or GUID of the TDL to be unloaded. | Value | String | Yes | No | No |

---

## Unzip

Action to extract a zip archive file.

### Meta

- **Aliases**: Unzip
- **Total Parameters**: 6
- **Total Mandatory Parameters**: 2
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Target folder name. | Value | String | Yes | No | No |
| 2 | Target folder name. | Value | String | Yes | No | No |
| 3 | Password with which to extract zip contents. | Value | String | No | No | No |
| 4 | Password with which to extract zip contents. | Value | Logical | No | No | No |
| 5 | Whether to show progress bar or not. | Value | Logical | No | No | No |
| 6 | Whether to show progress bar or not. | Value | Logical | No | No | No |

---

## Upload

Mails specicfied report to output to given address in selected format

### Meta

- **Aliases**: Upload
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of the report to be used for exporting | Identifier | String | Yes | Yes | Report | No |
| 2 | Specify the name of the report to be used for exporting | Value | Logical | No | No |  | No |

---

## Upload Vat Return

This action is used for uploading VAT Returns.

### Meta

- **Aliases**: Upload Vat Return
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Number

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the URL to which - the VAT Returns to be uploaded. The URL also specifies the required parameters such as - itis VAT, state, Period, Type and Filename etc. | Value | String | Yes | No | No |
| 2 | Specify the URL to which - the VAT Returns to be uploaded. The URL also specifies the required parameters such as - itis VAT, state, Period, Type and Filename etc. | Value | String | Yes | No | No |
| 3 | Specify the type of file (format of the file) to be uploaded for VAT Returns | Value | String | Yes | No | No |
| 4 | Specify the type of file (format of the file) to be uploaded for VAT Returns | Value | String | Yes | No | No |

---

## WhatsApp

This action shares the specified report via WhatsApp.

### Meta

- **Aliases**: WhatsApp
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Any expression which evaluates to the Name of Report. | Identifier | String | Yes | Yes | Report | No |
| 2 | Any expression which evaluates to the Name of Report. | Value | Logical | No | No |  | No |

---

## WhatsApp Collection

This action is used to serve the collection of objects for WhatsApp purposes.

### Meta

- **Aliases**: WhatsApp Collection
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: User Interface
- **Mode**: Display

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of a collection. | Identifier | String | Yes | Yes | Collection | No |
| 2 | Specify the name of a collection. | Value | String | No | No |  | No |
| 3 | Any expression. It checks whether to display the trigger report when the specified object is not found in the collection. This is an optional parameter. | Value | Logical | No | No |  | No |
| 4 | Any expression. It checks whether to display the trigger report when the specified object is not found in the collection. This is an optional parameter. | Value | Logical | No | No |  | No |

---

## WhatsApp Current Collection

This executes the WhatsApp collection on the Collection defined at the object level.

### Meta

- **Aliases**: WhatsApp Current Collection
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any expression which evaluates the name of the selected object. | Value | String | No | No | No |
| 2 | Any expression which evaluates the name of the selected object. | Value | Logical | No | No | No |

---

## WhatsApp Current Report

This executes a WhatsApp action on the Report defined at the object level.

### Meta

- **Aliases**: WhatsApp Current Report
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## WriteINI

This action is used to add/alter the value of any parameter in the specified INI file.

### Meta

- **Aliases**: WriteINI
- **Total Parameters**: 5
- **Total Mandatory Parameters**: 3
- **Category**: Generic Operations
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It accepts the path and filename of the INI file. | Value | String | Yes | No | No |
| 2 | It accepts the path and filename of the INI file. | Value | String | Yes | No | No |
| 3 | It accepts Parameter whose value is to be fetched from the INI. | Value | String | Yes | No | No |
| 4 | It accepts Parameter whose value is to be fetched from the INI. | Value | String | No | No | No |
| 5 | It accepts It can be used when multiple values for the same parameter are accepted. In the absence of index where the parameter accepts multiple values, the value of last index will be updated. | Value | Long | No | No | No |

---

## Zip

Action to create a zip archive file.

### Meta

- **Aliases**: Zip
- **Total Parameters**: 6
- **Total Mandatory Parameters**: 2
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of target zip file. | Value | String | Yes | No | No |
| 2 | Source Path to zip. | Value | String | Yes | No | No |
| 3 | Source Path to zip. | Value | String | No | No | No |
| 4 | Whether to overwrite existing file or not. | Value | Logical | No | No | No |
| 5 | Whether to overwrite existing file or not. | Value | Logical | No | No | No |
| 6 | Whether to show progress bar or not. | Value | Logical | No | No | No |

---
