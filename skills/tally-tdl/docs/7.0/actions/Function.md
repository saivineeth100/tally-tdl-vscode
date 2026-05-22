# Function Action

> **Version**: 7.0

Reference documentation for all entries in the **Function** action.

> **Total Entries**: 89

## Table of Contents

- [Accept Alter](#accept-alter)
- [Accept Create](#accept-create)
- [Accept Object](#accept-object)
- [Add Sheet](#add-sheet)
- [Break](#break)
- [Close Encrypted Target File](#close-encrypted-target-file)
- [Close File](#close-file)
- [Close Target File](#close-target-file)
- [Continue](#continue)
- [Decrement](#decrement)
- [Display Msg](#display-msg)
- [Else](#else)
- [End Batch Post](#end-batch-post)
- [End Block](#end-block)
- [End For](#end-for)
- [End If](#end-if)
- [End Msg](#end-msg)
- [End Progress](#end-progress)
- [End Sub](#end-sub)
- [End Unzip](#end-unzip)
- [End Walk](#end-walk)
- [End While](#end-while)
- [End XSub](#end-xsub)
- [End Zip](#end-zip)
- [Extract Path](#extract-path)
- [Finalize ProgressBar](#finalize-progressbar)
- [For Coll](#for-coll)
- [For Each](#for-each)
- [For Range](#for-range)
- [For Token](#for-token)
- [Format Excel Sheet](#format-excel-sheet)
- [If](#if)
- [Increment](#increment)
- [Initialize ProgressBar](#initialize-progressbar)
- [Insert Collection Object](#insert-collection-object)
- [Log](#log)
- [Log Target](#log-target)
- [Message Report](#message-report)
- [Msg Box](#msg-box)
- [New Object](#new-object)
- [Open File](#open-file)
- [ProgressBar Set Active Stage](#progressbar-set-active-stage)
- [ProgressBar Set ItemsDone](#progressbar-set-itemsdone)
- [ProgressBar Update Activity Name](#progressbar-update-activity-name)
- [ProgressBar Update Context](#progressbar-update-context)
- [ProgressBar Update Note](#progressbar-update-note)
- [ProgressBar Update Process Name](#progressbar-update-process-name)
- [ProgressBar Update Progress Indication](#progressbar-update-progress-indication)
- [ProgressBar Update SubContext](#progressbar-update-subcontext)
- [ProgressBar Update Total Count](#progressbar-update-total-count)
- [Query Box](#query-box)
- [Query Box Ex](#query-box-ex)
- [Query Report](#query-report)
- [Remove Sheet](#remove-sheet)
- [Rename Sheet](#rename-sheet)
- [Reset Value](#reset-value)
- [Return](#return)
- [Seek File](#seek-file)
- [Seek Source File](#seek-source-file)
- [Set Active Sheet](#set-active-sheet)
- [Set File Log Off](#set-file-log-off)
- [Set File Log On](#set-file-log-on)
- [Set Log Off](#set-log-off)
- [Set Log On](#set-log-on)
- [Set Object](#set-object)
- [Set Target](#set-target)
- [Set Value](#set-value)
- [Show Progress](#show-progress)
- [Start Batch Post](#start-batch-post)
- [Start Block](#start-block)
- [Start Progress](#start-progress)
- [Start Sub](#start-sub)
- [Start Unzip](#start-unzip)
- [Start XSub](#start-xsub)
- [Start Zip](#start-zip)
- [Sub Action](#sub-action)
- [Truncate File](#truncate-file)
- [Unzip Exclude Path](#unzip-exclude-path)
- [Walk Collection](#walk-collection)
- [While](#while)
- [Write Cell](#write-cell)
- [Write Cell Ex](#write-cell-ex)
- [Write Column](#write-column)
- [Write File](#write-file)
- [Write File Line](#write-file-line)
- [Write Row](#write-row)
- [XSub Action](#xsub-action)
- [Zip Add Path](#zip-add-path)
- [Zip Exclude Path](#zip-exclude-path)

---

## Accept Alter

This action accepts the Target Object to Company DB. Alters an exiting object in DB. If the object does not exists it results in error. Alias is ALTER TARGET.

### Meta

- **Aliases**: Accept Alter, Alter Target
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Object/Collection
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Accept Create

This action accepts the Target Object to Company Data base. That is it saves the target object to the Database. This creates a new object in the database if it does not exist else results in an error. Alias is CREATE TARGET.

### Meta

- **Aliases**: Accept Create, Create Target
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Object/Collection
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Accept Object

This action accepts the Target Object to Company DB. This automatically handles creation/alteration based on the way object was created using NEW OBJECT. Alias is SAVE TARGET.

### Meta

- **Aliases**: Accept Object, Save Target
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Object/Collection
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Add Sheet

This action adds a sheet in the current workbook which is opened for writing. Sheet will always be inserted at the end.

### Meta

- **Aliases**: Add Sheet
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It can be an expression which evaluates to the string and will be considered as the name of the sheet. | Value | String | Yes | No | No |

---

## Break

Break action is used terminate the execution of the remaining statements inside the loop and the control is transferred to the statement immediately following the loop.

### Meta

- **Aliases**: Break
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## Close Encrypted Target File

This action is used to close an opened target file as encrypted file.

### Meta

- **Aliases**: Close Encrypted Target File
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Type of encryption. Currently only support SCBPKCS7 for PKCS& encrytion supported by SCB and BOBAES256CBC for AES 256 supported by BOB. Later will support other symmetric and assymetric algo | Identifier | Long | Yes | Yes | Encryption Type | BOBAES256CBC, SCBPKCS7 | No |
| 2 | Public or symmetric key buffer | Value | String | No | No |  |  | No |

---

## Close File

This action is used to close an opened source file.

### Meta

- **Aliases**: Close File
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Close Target File

This action is used to close an opened target file.

### Meta

- **Aliases**: Close Target File
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Continue

This action is used to continue the loop with the next iteration after skipping the subsequent statements after that.

### Meta

- **Aliases**: Continue
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## Decrement

This Action is used to decrement the value of a Variable by the specified Number. If the decrement number is not specified then by default the value is decremented by 1.

### Meta

- **Aliases**: Decrement
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the Simple Non Repeat Variable of Number type whose value is to be decremented. | Identifier | String | Yes | No | Variable | No |
| 2 | This is an optional parameter which specifies the decrement count. If this is not specified then the variable is decremented by 1. | Value | Long | No | No |  | No |

---

## Display Msg

This action is used to display a message box to user in Async mode. It doesnt Wait for an Input from user.

### Meta

- **Aliases**: Display Msg, Start Msg Box
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the value displayed on the title bar of the message window. | Value | String | Yes | No | No |
| 2 | This is an expression and it is the actual message which is displayed in the box. | Value | String | Yes | No | No |

---

## Else

All the subsequent statements after the ELSE action are executed if the condition specified within IF Action is FALSE.

### Meta

- **Aliases**: Else
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## End Batch Post

.

### Meta

- **Aliases**: End Batch Post
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-File I/O
- **Mode**: Both

### Parameters

_No parameters._

---

## End Block

This action is used to close the block of statements initiated using the START BLOCK, the Object context is restored back to the original state.

### Meta

- **Aliases**: End Block
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## End For

This action is used to end the FOR loop.

### Meta

- **Aliases**: End For
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## End If

This action is used to close the block of statements specified within the IF statement.

### Meta

- **Aliases**: End If
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## End Msg

Thiwsaction is used to end a prevoiusly Displayed Message.

### Meta

- **Aliases**: End Msg, End Msg Box
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## End Progress

When a task is completed, Progress Bar can be stopped by using action END PROGRESS.

### Meta

- **Aliases**: End Progress
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## End Sub

This action is used to close the block of statements initiated using the START SUB.

### Meta

- **Aliases**: End Sub
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## End Unzip

This action is used to extract the files at the specified target directory.

### Meta

- **Aliases**: End Unzip
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Target Folder for extraction. | Value | String | Yes | No | No |
| 2 | Target Folder for extraction. | Value | Logical | No | No | No |
| 3 | Whether to show progress bar or not. | Value | Logical | No | No | No |

---

## End Walk

This action is used to end the walk collection loop.

### Meta

- **Aliases**: End Walk
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Object/Collection
- **Mode**: Both

### Parameters

_No parameters._

---

## End While

This action is used to close the body of loop started with While Action.

### Meta

- **Aliases**: End While
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## End XSub

This action is used to close the block of statements initiated using the START XSUB.

### Meta

- **Aliases**: End XSub
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## End Zip

This action makes the zip file.

### Meta

- **Aliases**: End Zip
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Password to give to target Zip file. | Value | String | No | No | No |
| 2 | Whether to show progress bar or not. | Value | Logical | No | No | No |

---

## Extract Path

This action is used to add a path to be included for unzipping.

### Meta

- **Aliases**: Extract Path
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The path to be extracted from the zip file. | Value | String | Yes | No | No |

---

## Finalize ProgressBar

When a task is completed, Progress Bar can be stopped by using action Finalize ProgressBar.

### Meta

- **Aliases**: Finalize ProgressBar
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

_No parameters._

---

## For Coll

This action is used to walk the collection for a specific value.

### Meta

- **Aliases**: For Coll, For Collection
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Procedural-Object/Collection
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of variable used for the iteration. | Identifier | String | Yes | Yes | Variable | No |
| 2 | This is the name of variable used for the iteration. | Value | String | Yes | No |  | No |
| 3 | It can be an expression and the value of this is returned in the iterator variable. If the value expression is not specified the name of the object is returned. | Value |  | No | No |  | No |
| 4 | It can be an expression and the value of this is returned in the iterator variable. If the value expression is not specified the name of the object is returned. | Value | Logical | No | No |  | No |

---

## For Each

The FOR EACH action is used to iterate over the values in the list variable. The number of iterations depends on the number items in the list variable.

### Meta

- **Aliases**: For Each, For In
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is the name of the variable which holds the Key value in every occurrence of the iteration. | Identifier | String | Yes | Yes | Variable | No |
| 2 | It is the name of the variable which holds the Key value in every occurrence of the iteration. | Identifier | String | Yes | No | Variable | No |

---

## For Range

This action allows the user to loop on range of numbers or date. This loop can be used to repeat a loop for the given range of specified values. The range can either be incremental or decremental.

### Meta

- **Aliases**: For Range
- **Total Parameters**: 6
- **Total Mandatory Parameters**: 4
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is the name of variable used for the iteration. | Identifier | String | Yes | Yes | Variable | No |
| 2 | It is the name of variable used for the iteration. | Identifier |  | Yes | Yes |  | No |
| 3 | This is an expression which evaluates to number or date values. It refers to the starting value of the range. | Value | Number | Yes | No |  | No |
| 4 | This is an expression which evaluates to number or date values. It refers to the starting value of the range. | Value | Number | Yes | No |  | No |
| 5 | This is an expression which evaluates to number by which the <StartRangeExpr> value is incremented. Its optional and the default value is one. | Value | Number | No | No |  | No |
| 6 | This is an expression which evaluates to number by which the <StartRangeExpr> value is incremented. Its optional and the default value is one. | Identifier | String | No | Yes |  | No |

---

## For Token

This action is used to walk a String expression separated by a delimiter character. It is used to loop on a String expression and returns one value at a time. The value is returned in the iterator variable.

### Meta

- **Aliases**: For Token
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 2
- **Category**: Procedural-General
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of variable used for the iteration. | Identifier | String | Yes | Yes | Variable | No |
| 2 | This is the name of variable used for the iteration. | Value | String | Yes | No |  | No |
| 3 | It can be any expression which evaluates into a character used for separating string expression. It is optional. The default separator char is ':'. | Value | String | No | No |  | No |
| 4 | It can be any expression which evaluates into a character used for separating string expression. It is optional. The default separator char is ':'. | Value | Logical | No | No |  | No |

---

## Format Excel Sheet

This action is used to modify properties of excel sheet. Only the properties supported by the system can be modified.

### Meta

- **Aliases**: Format Excel Sheet
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Property that is to be modified in the excel sheet. Supported properties are ColumnWidth, CellTextWrap. | Keyword | String | Yes | No | ExcelSheet Properties | CellTextWrap, ColumnWidth | No |
| 2 | Property that is to be modified in the excel sheet. Supported properties are ColumnWidth, CellTextWrap. | Value |  | Yes | No |  |  | Yes |

---

## If

This action is used to specify a condition.The subsequent statements within the IF and END IF are executed based on whether the condition evaluates to true or false.

### Meta

- **Aliases**: If
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any value or expression that can be evaluated to TRUE or FALSE. | Value | Logical | Yes | No | No |

---

## Increment

This Action is used to increment the value of a Variable by the specified Number. If the increment number is not specified then by default the value is incremented by 1.

### Meta

- **Aliases**: Increment
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Variable
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the Simple Non Repeat Variable of Number type whose value is to be incremented. | Identifier | String | Yes | No | Variable | No |
| 2 | This is an optional parameter which specifies the increment count. If this is not specified then the variable is incremented by 1. | Value | Long | No | No |  | No |

---

## Initialize ProgressBar

This action initializes progress bar object by executing a ProgressBar definition mentioned in the parameter

### Meta

- **Aliases**: Initialize ProgressBar
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows the name of the Progress Bar definition. | Identifier | Long | Yes | No | Progress Bar | No |

---

## Insert Collection Object

This action inserts the new object of the type specified in the collection and makes it as current target object. This object is inserted into the collection at the end.

### Meta

- **Aliases**: Insert Collection Object
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-Object/Collection
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the collection. | Identifier | String | Yes | Yes | Collection | No |
| 2 | Name of the collection. | Value | Long | No | No |  | No |
| 3 | This is an expression which evaluates to logical value. | Value | Long | No | No |  | No |

---

## Log

During expression evaluation, intermediate values of the expression can be passed to calculator window and a log file 'tdlfunc.log' inside the application directory.

### Meta

- **Aliases**: Log
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Edit
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This is an expression whose value need to be passed to the calculator window. | Value | No | No | No |

---

## Log Target

This action is used to create the log of object, its method and collection for the target object to the specified file.  It accepts filename as a parameter.

### Meta

- **Aliases**: Log Target
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It accepts the name of file along with the path in which the log is created. If no file name is specified the contents of object are logged in 'TDLfunc.log' when logging is disabled otherwise it logs in to the Calculator pane. | Identifier | String | No | Yes | No |
| 2 | It accepts the name of file along with the path in which the log is created. If no file name is specified the contents of object are logged in 'TDLfunc.log' when logging is disabled otherwise it logs in to the Calculator pane. | Value | Logical | No | No | No |

---

## Message Report

This action allows the developer to display a message Report with a specified string.

### Meta

- **Aliases**: Message Report
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report to be used as message box. | Identifier | String | Yes | Yes | Report | No |
| 2 | Name of Report to be used as message box. | Value | String | No | No |  | No |
| 3 | Any expression which displays the actual message in the Message Report. This value can be extracted using $$InfoParam in the report context. | Value | String | No | No |  | No |
| 4 | Any expression which displays the actual message in the Message Report. This value can be extracted using $$InfoParam in the report context. | Value | Long | No | No |  | No |

---

## Msg Box

This action is used to display a message box to user.

### Meta

- **Aliases**: Msg Box
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 2
- **Category**: Procedural-User Interface
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the value displayed on the title bar of the message window. | Value | String | Yes | No | No |
| 2 | This is the value displayed on the title bar of the message window. | Value | String | Yes | No | No |
| 3 | This indicates if the background window to be greyed out during message display. It takes two values ie YES/NO | Value | Logical | No | No | No |

---

## New Object

Creates a New object from object specification and sets it as target object.

### Meta

- **Aliases**: New Object
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-Object/Collection
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the type of the object to be created. | Identifier | String | Yes | Yes | Object | No |
| 2 | This  is the unique identifier of the object. | Value | String | No | No |  | No |
| 3 | This  is the unique identifier of the object. | Value | Logical | No | No |  | No |

---

## Open File

This action is used to open a text/excel file for read/write operations.

### Meta

- **Aliases**: Open File
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Filename to be opened. | Value | String | No | No |  |  | No |
| 2 | Filename to be opened. | Identifier | Long | No | Yes | File Format | Excel, Text | No |
| 3 | File Open mode. | Identifier | Long | No | Yes | File open mode | Read, Write | No |
| 4 | File Open mode. | Identifier | Long | No | Yes | Encoding | ASCII, Unicode, Unicode8, UTF16, UTF8 | No |

---

## ProgressBar Set Active Stage

This action is used to set the active stage. This will reset the Total Count.

### Meta

- **Aliases**: ProgressBar Set Active Stage
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter is used to show a number which denotes active satge in the Progress Bar | Value | Long | Yes | No | No |

---

## ProgressBar Set ItemsDone

This action is used to set the number of steps completed in the task.

### Meta

- **Aliases**: ProgressBar Set ItemsDone
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows a number which denoted the amount of work completed in the Progress bar. | Value | Long | Yes | No | No |

---

## ProgressBar Update Activity Name

This action is used to set Activity Name to be displayed in progress bar window.

### Meta

- **Aliases**: ProgressBar Update Activity Name
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows the Title for the Progress Bar. | Value | String | Yes | No | No |

---

## ProgressBar Update Context

This action is used to set Context to be displayed in progress bar window.

### Meta

- **Aliases**: ProgressBar Update Context
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows the Context for the Progress Bar. | Value | String | Yes | No | No |

---

## ProgressBar Update Note

This action is used to set Note to be displayed in progress bar window.

### Meta

- **Aliases**: ProgressBar Update Note
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows the Note for the Progress Bar. | Value | String | Yes | No | No |

---

## ProgressBar Update Process Name

This action is used to set Process Name to be displayed in progress bar window.

### Meta

- **Aliases**: ProgressBar Update Process Name
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows the Process Name for the Progress Bar. | Value | String | Yes | No | No |

---

## ProgressBar Update Progress Indication

This action is used to set Progress indication to be displayed in progress bar window.

### Meta

- **Aliases**: ProgressBar Update Progress Indication
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows the Progress for the Progress Bar. | Value | String | Yes | No | No |

---

## ProgressBar Update SubContext

This action is used to set Subcontext to be displayed in progress bar window.

### Meta

- **Aliases**: ProgressBar Update SubContext
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows the Subcontext for the Progress Bar. | Value | String | Yes | No | No |

---

## ProgressBar Update Total Count

This action is used to reset the total number of steps involved in the task. This will reset the Items Done.

### Meta

- **Aliases**: ProgressBar Update Total Count
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This parameter shows the total number of steps in the Progress Bar. | Value | Long | Yes | No | No |

---

## Query Box

This action is used to Display a confirmation box to user and ask for an yes/no response.

### Meta

- **Aliases**: Query Box
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the message which is displayed inside the box. This can be an expression. | Value | String | Yes | No | No |
| 2 | This is the message which is displayed inside the box. This can be an expression. | Value | Logical | No | No | No |
| 3 | This is a flag which indicates the response when the user presses ESC key. This can be specified as YES/NO. A YES value for this flag indicates that the response should be treated as YES on press of an ESC key. | Value | Logical | No | No | No |

---

## Query Box Ex

This action is used to Display a extended confirmation box to user.

### Meta

- **Aliases**: Query Box Ex
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the Query Box description to be displayed. | Identifier | (null) | Yes | No | QueryBox | No |

---

## Query Report

This action allows displaying a Query Report with the specified string.

### Meta

- **Aliases**: Query Report
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Edit
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report to be used as query box. | Identifier | String | Yes | Yes | Report | No |
| 2 | Name of Report to be used as query box. | Value | String | No | No |  | No |
| 3 | Any expression which displays the actual message in the Query Report. This value can be extracted using $$InfoParam in the report context. | Value | String | No | No |  | No |
| 4 | Any expression which displays the actual message in the Query Report. This value can be extracted using $$InfoParam in the report context. | Value | Long | No | No |  | No |

---

## Remove Sheet

This action removes the specified sheet from current workbook.

### Meta

- **Aliases**: Remove Sheet
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Sheet Name to be removed from the active workbook. | Value | String | Yes | No | No |

---

## Rename Sheet

Renames an existing sheet to the New sheet name specified.

### Meta

- **Aliases**: Rename Sheet
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Sheet Name to be renamed in the active workbook. | Value | String | Yes | No | No |
| 2 | New Sheet Name | Value | String | Yes | No | No |

---

## Reset Value

This action sets the value of the method using the Value Formula. If Value Formula is not specified it sets the existing value to null.

### Meta

- **Aliases**: Reset Value
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Object/Collection
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the method. | Identifier | String | No | Yes | No |
| 2 | This is an optional parameter and if it is used, it will reset the value of the method. | Value |  | No | No | No |

---

## Return

This action is used to return the flow of control to the calling program with or without returning a value.

### Meta

- **Aliases**: Return
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Edit

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This can be any value or expression.This is the value which is returned to the caller. | Value | No | No | No |

---

## Seek File

 This action is used to seek to the specified position in the target file.

### Meta

- **Aliases**: Seek File
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It can be any expression which evaluates to number which considered as number of characters.Number of chars to seek. -1 to seek to End of File. | Value | Long | Yes | No | No |

---

## Seek Source File

This action sets the current file pointer to the position specified.

### Meta

- **Aliases**: Seek Source File
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It can be any expression which evaluates to number which is no of characters. | Value | Long | Yes | No | No |

---

## Set Active Sheet

This action is used to change the active sheet during read and write operations.

### Meta

- **Aliases**: Set Active Sheet
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | <Sheet Name> can be an expression which evaluates to the string and will be considered as the name of the sheet. Sheet name to be made active. | Value | String | Yes | No | No |

---

## Set File Log Off

This Action is used in conjunction with SET FILE LOG ON. Logging to the file 'tdlfunc.log' can be stopped by action SET FILE LOG OFF. 

### Meta

- **Aliases**: Set File Log Off
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Edit

### Parameters

_No parameters._

---

## Set File Log On

This action is used to Log the values of an expression to log file 'tdlfunc.log'.

### Meta

- **Aliases**: Set File Log On
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Edit

### Parameters

_No parameters._

---

## Set Log Off

This Action is used in conjunction with SET FILE LOG ON. Logging to the file 'tdlfunc.log' can be stopped by action SET FILE LOG OFF. 

### Meta

- **Aliases**: Set Log Off
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Edit

### Parameters

_No parameters._

---

## Set Log On

This action is used to Log the values of an expression to log file 'tdlfunc.log'.

### Meta

- **Aliases**: Set Log On
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Debugging
- **Mode**: Edit

### Parameters

_No parameters._

---

## Set Object

This action sets the current object with the object Specification. If no object specification is given the target object will be  set as the current object.

### Meta

- **Aliases**: Set Object
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Object/Collection
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is an optional parameter and it is the name of the secondary object. | Identifier | String | No | Yes | No |

---

## Set Target

This action sets the target object with the Object Specification. If no object specification is given the current object will be set as the target object.

### Meta

- **Aliases**: Set Target
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Object/Collection
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the secondary object. | Identifier | String | No | Yes | No |

---

## Set Value

This action sets value of a method for the target object. The value formula is evaluated with respect to the current object context.

### Meta

- **Aliases**: Set Value
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-Object/Collection
- **Mode**: Edit
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is the name of the method of the Target Object which needs to be set. | Identifier | String | No | Yes | No |
| 2 | This is the value which needs to be set to the method. It is optional. | Value |  | No | No | No |

---

## Show Progress

This Action shows the current status of the task to the user.

### Meta

- **Aliases**: Show Progress
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is a number denotes the amount of work completed. | Value | Long | No | No | No |
| 2 | This can be used to update the progress status | Value | String | No | No | No |

---

## Start Batch Post

Starts batch posting. The batch post mode is optimized for posting large amount of data.

### Meta

- **Aliases**: Start Batch Post
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-File I/O
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Number of posts have occurred since the start of the batch. Defaults value is -1. | Value | Long | No | No | No |

---

## Start Block

This action is used to save the current state and execute some actions within the block and return back to the original state.

### Meta

- **Aliases**: Start Block
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## Start Progress

This action setup the Progress Bar by mentioning total number of steps involved in the task. In addition to this, Title, Sub Title and Subject of the Progress Bar also can be given as parameter.

### Meta

- **Aliases**: Start Progress
- **Total Parameters**: 4
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-User Interface
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It denotes the whole task quantified as a number. | Value | Long | Yes | No | No |
| 2 | It denotes the whole task quantified as a number. | Value | String | No | No | No |
| 3 | It shows the Sub Title. | Value | String | No | No | No |
| 4 | It shows the Sub Title. | Value | String | No | No | No |

---

## Start Sub

This is used to execute a set of actions as a 'sub' procedure effecting the dependency accumulation and triggering.

### Meta

- **Aliases**: Start Sub
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## Start Unzip

This action is used to set the unzip source file and password.

### Meta

- **Aliases**: Start Unzip
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Source Zip file name. | Value | String | Yes | No | No |
| 2 | Source Zip file name. | Value | String | No | No | No |
| 3 | Skip CRC check for this archive file. | Value | Logical | No | No | No |

---

## Start XSub

This is used to execute a set of actions as an exclusive 'sub' procedure effecting the dependency accumulation and triggering.

### Meta

- **Aliases**: Start XSub
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

_No parameters._

---

## Start Zip

This action is used to initialize the target zip file.

### Meta

- **Aliases**: Start Zip
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Target Zip file name. | Value | String | Yes | No | No |
| 2 | Whether to overwrite existing zip file or not. | Value | Logical | No | No | No |

---

## Sub Action

This action is to execute action considering it as a 'sub' procedure and effecting the dependency accumulation and triggering.

### Meta

- **Aliases**: Sub Action
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Action keyword to be executed as a SUB | Keyword | Long | Yes | Yes | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 2 | Action keyword to be executed as a SUB | Value |  | No | Yes |  |  | No |

---

## Truncate File

This action is used to resets the file content.

### Meta

- **Aliases**: Truncate File
- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

_No parameters._

---

## Unzip Exclude Path

This action is used to add a path to be excluded from unzipping.

### Meta

- **Aliases**: Unzip Exclude Path
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Path to exclude from extraction. | Value | String | Yes | No | No |

---

## Walk Collection

The Walk Collection is used to execute a set of statements for each object of the collection.

### Meta

- **Aliases**: Walk Collection
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-Object/Collection
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It can be any expression which evaluates to collection name. | Identifier | String | Yes | No | Collection | No |
| 2 | This can be an expression which evaluates to logical value. If it is True then the collection objects are traversed in reverse order. This parameter is optional. | Value | Logical | No | No |  | No |

---

## While

This action is used to specify the conditional expression to  execute the body of the loop.

### Meta

- **Aliases**: While
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-General
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Any value or expression that can be evaluated to TRUE or FALSE. | Value | Logical | Yes | No | No |

---

## Write Cell

This action Writes the specified content at the cell address specified by row and column number of the currently active sheet.

### Meta

- **Aliases**: Write Cell
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Row Number | Value | Long | Yes | No | No |
| 2 | Row Number | Value | Long | Yes | No | No |
| 3 | Data to be written in the cell specified. | Value | String | Yes | No | No |

---

## Write Cell Ex

This action Writes the specified content at the cell address specified by row and column number of the currently active sheet. Apart from writing the data, it also sets focus to the given Cell

### Meta

- **Aliases**: Write Cell Ex
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Row Number | Value | Long | Yes | No | No |
| 2 | Column Number | Value | Long | Yes | No | No |
| 3 | Column Number | Value | String | Yes | No | No |

---

## Write Column

This action writes multiple cell values at a specified column in the active sheet. The number of values separated by commas are written starting from the initial row number specified for the column.

### Meta

- **Aliases**: Write Column
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Variable Row Number from where to start writing cell data | Value | Long | Yes | No | No |
| 2 | Variable Row Number from where to start writing cell data | Value | Long | Yes | No | No |
| 3 | Comma separated contents to be written | Value | String | Yes | No | No |

---

## Write File

This action is used to append a file with the text specified and it is always works on the target file context.

### Meta

- **Aliases**: Write File
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It can be any expression which evaluates to data that need to be written to the file. | Value | String | Yes | No | No |

---

## Write File Line

This action is similar to WRITE FILE but it also places a new line character (New Line/Carriage Return) after the text. All the subsequent writes begin from the next line.This action always works on the target context.

### Meta

- **Aliases**: Write File Line
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It can be any expression which evaluates to data that need to be written to the file. | Value | String | Yes | No | No |

---

## Write Row

This action writes multiple cell values at a specified row in the active sheet. The number of values separated by commas are written starting from the initial column number specified for the row specified.

### Meta

- **Aliases**: Write Row
- **Total Parameters**: 3
- **Total Mandatory Parameters**: 3
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Fixed Row Number in which to write the content. | Value | Long | Yes | No | No |
| 2 | Variable Column Number from where to start writing data. | Value | Long | Yes | No | No |
| 3 | Variable Column Number from where to start writing data. | Value | String | Yes | No | No |

---

## XSub Action

This action is to execute action considering it as an exclusive 'sub' procedure and effecting the dependency accumulation and triggering.

### Meta

- **Aliases**: XSub Action
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Generic Operations
- **Mode**: Both

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Action keyword to be executed as a SUB | Keyword | Long | Yes | Yes | TDL Actions | Accept Alter, Accept Create, Accept Object, Action, Add Sheet, Add Tile, Alter, Alter Collection, Alter Column, Alter Current Collection, Alter Current Report, Alter Ex, Alter Object, Alter Target, Append, Audit Form, Audit Object, Auto Columns, Autoform Report, Auto Set, Backup Company, Break, Browse Url, Browse Url Ex, Calculator, Call, Cancel, Cancel Object, Change Crypt Company, Change Output Mode, Change Table, Clear Table Stack, Close Company, Close Encrypted Target File, Close File, Close Target File, Configuration, Continue, Copy File, Copy To Clipboard, Copy Variable, Copy Variables, Create, Create Collection, Create Column, Create Ex, Create Target, Cycle Back, Decrement, Delete, Delete Column, Delete Config Data, Delete File, DeleteNotifications, Delete Object, DisconnectUser, Display, Display Collection, Display Current Collection, Display Current Report, Display Ex, Display Help, Display Msg, Display Object, Do If, Dump Debug, Dump Profile, Dump Record, Dump Recording, Duplicate, Else, End Batch Post, End Block, End For, End If, End Msg, End Msg Box, End Progress, End Report, End Sub, End Unzip, End Walk, End While, End XSub, End Zip, Exchange, Exec COM Interface, Exec Command, Exec Command Ex, Exec Excel Macro, Execute, Execute Ex, Execute Obj Actions, ExecuteObjectMap, Execute TDL, Expand Tile, Explode, Export, Export Collection, Export Current Collection, Export Current Report, Export Report, Export Snapshot, Extract Path, Field Accept, Field Backspace, Field Blank, Field Char Delete, Field Char Delete Left, Field Char Left, Field Char NewLine, Field Char Right, Field Copy, Field Cut, Field Down, Field End, Field Erase, Field Home, Field Insert Mode, Field New Line, Field Next, Field Next Field SFD, Field Paste, Field Prev, Field Select End, Field Select Home, Field Select Left Char, Field Select Left Word, Field Select Right Char, Field Select Right Word, Field Select Word, Field Sub Form, Field Table Accept, Field Table Maximize, Field Table Mode, | No |
| 2 | Action keyword to be executed as a SUB | Value |  | No | Yes |  |  | No |

---

## Zip Add Path

This action adds a path to be included for zipping.

### Meta

- **Aliases**: Zip Add Path
- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Path to be zipped. | Value | String | Yes | No | No |
| 2 | Path to be zipped. | Value | Logical | No | No | No |

---

## Zip Exclude Path

This action adds a path to be excluded from zipping.

### Meta

- **Aliases**: Zip Exclude Path
- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Procedural-File I/O
- **Mode**: Both
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Exclusion pattern. | Value | String | Yes | No | No |

---
