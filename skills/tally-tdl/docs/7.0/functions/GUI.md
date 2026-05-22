# GUI Function

> **Version**: 7.0

Reference documentation for all entries in the **GUI** function.

> **Total Entries**: 78

## Table of Contents

- [BalanceLines](#balancelines)
- [BalanceSiblings](#balancesiblings)
- [BlankSiblings](#blanksiblings)
- [CurrentTableItemExplodeOwner](#currenttableitemexplodeowner)
- [DashboardTotalTiles](#dashboardtotaltiles)
- [DoExplosionsFit](#doexplosionsfit)
- [ExplodeLevel](#explodelevel)
- [ExplodeOwner](#explodeowner)
- [FirstLineNumber](#firstlinenumber)
- [FocusedTileTitle](#focusedtiletitle)
- [GetLongestLineLength](#getlongestlinelength)
- [HasLinesDeleted](#haslinesdeleted)
- [HelpModuleId](#helpmoduleid)
- [InAcceptMode](#inacceptmode)
- [InAlterMode](#inaltermode)
- [InAppendMode](#inappendmode)
- [InBrowserExport](#inbrowserexport)
- [InBrowserPeriodChange](#inbrowserperiodchange)
- [InChangeView](#inchangeview)
- [InCreateMode](#increatemode)
- [InDisplayMode](#indisplaymode)
- [InDuplicateMode](#induplicatemode)
- [InDynamicAlterMode](#indynamicaltermode)
- [InEditMode](#ineditmode)
- [InExecuteMode](#inexecutemode)
- [InExportAction](#inexportaction)
- [InExportMode](#inexportmode)
- [InfoParam](#infoparam)
- [InfoString](#infostring)
- [InInsertMode](#ininsertmode)
- [InMailAction](#inmailaction)
- [InMailMode](#inmailmode)
- [InMobileBrowserExport](#inmobilebrowserexport)
- [InPrintAction](#inprintaction)
- [InTrueColorMode](#intruecolormode)
- [InUploadAction](#inuploadaction)
- [InWhatsAppAction](#inwhatsappaction)
- [InWhatsAppMode](#inwhatsappmode)
- [IsCaseToggled](#iscasetoggled)
- [IsCheckAlwaysInDashboardTiles](#ischeckalwaysindashboardtiles)
- [IsEdited](#isedited)
- [IsExploded](#isexploded)
- [IsExportable](#isexportable)
- [IsFieldEdited](#isfieldedited)
- [IsFirstChildOnNextPage](#isfirstchildonnextpage)
- [IsFirstInPart](#isfirstinpart)
- [IsFromTriggerReport](#isfromtriggerreport)
- [IsLastLine](#islastline)
- [IsLastPage](#islastpage)
- [IsLastVertPart](#islastvertpart)
- [IsNextActiveSibling](#isnextactivesibling)
- [IsNextSibling](#isnextsibling)
- [IsOpeningBal](#isopeningbal)
- [IsRepeatColumnContext](#isrepeatcolumncontext)
- [IsReportInEditMode](#isreportineditmode)
- [IsRightToLeftLangScript](#isrighttoleftlangscript)
- [IsSiblingExploded](#issiblingexploded)
- [IsTriggerReport](#istriggerreport)
- [LastLineNumber](#lastlinenumber)
- [LineNumber](#linenumber)
- [LoadKeyboardLayout](#loadkeyboardlayout)
- [Loword](#loword)
- [NextActiveSibling](#nextactivesibling)
- [NextSibling](#nextsibling)
- [NumExplosions](#numexplosions)
- [NumFlowLinesCanFit](#numflowlinescanfit)
- [NumLanguages](#numlanguages)
- [NumUILanguages](#numuilanguages)
- [ParentIsMenu](#parentismenu)
- [PrevLine](#prevline)
- [PrevLineField](#prevlinefield)
- [PrevLineVisible](#prevlinevisible)
- [TableExplodeLevel](#tableexplodelevel)
- [TableExplodeOwner](#tableexplodeowner)
- [TopLine](#topline)
- [ValidateandGetKeyboard](#validateandgetkeyboard)
- [WindowHeight](#windowheight)
- [WindowWidth](#windowwidth)

---

## BalanceLines

This function is used to check balance number of lines (repeated lines), including the exploded part-lines present, in a given part.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## BalanceSiblings

This function is used to check balance number of lines (repeated line) only in the exploded part.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## BlankSiblings

This function checks if there is any blank sibling or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## CurrentTableItemExplodeOwner

This function evaluates the method in the context of the explode owner of the selected item.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression that evaluates to a method. | Value | Yes | No |

---

## DashboardTotalTiles

This function returns the current count of tiles in the Dashboard.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Number

### Parameters

_No parameters._

---

## DoExplosionsFit

In case of printing, if a line is exploded then this function can be used to check whether the exploded part fits in the given page. It returns logical expression Yes if it is true.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## ExplodeLevel

This function checks the level of Explosion.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## ExplodeOwner

Can be used to extract the method of the Explode owner using the field name from where it is Exploded.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify  Field name. | Value | Yes | No |

---

## FirstLineNumber

This function returns 1 if no repeated lines exist. Otherwise the number of first repeated line for that part is returned. If you have 4 lines in a part, of which 4th one is repeated line, then $$FirstLineNumber returns 4.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## FocusedTileTitle

This function returns the name of the currently active tile within the Dashboard.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Hybrid
- **Return Type**: String

### Parameters

_No parameters._

---

## GetLongestLineLength

This function gives the length of the longest line in the given text. In text separated by '\n', it'll give length of longest text block without a newline.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any expression which evaluates to a string. | Value | Yes | No |

---

## HasLinesDeleted

This function is used for verifying whether any lines are deleted from the report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## HelpModuleId

This function returns Module Id of the help if defined in the current context of report or menu

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## InAcceptMode

This function verifies if the current Print Action was a result of an Acceptance of the previous report (for Print After Save Scenarios).

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InAlterMode

This function returns 'Yes' only if the Report is accessed through a Menu/Button/Key with the action as 'Alter'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InAppendMode

If you are creating a new voucher in append mode (Alt + A) from Day book or any voucher Register, then it checks whether the current Voucher Creation is in Append mode or not. The new voucher number will be an incremental number of the voucher from where it is appended.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InBrowserExport

It checks if the report is being displayed in the browser. It returns 'yes' if the report is being displayed.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InBrowserPeriodChange

It checks if the report is being displayed in the browser after a period change. It returns 'yes' if the report is being displayed.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InChangeView

This function returns whether the current report is opened from Change View Action.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InCreateMode

This function returns 'Yes' only if the report is Created through a Menu/Button/Key with the action as 'Create'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InDisplayMode

This function returns 'Yes' only if a particular report is accessed through a Menu/Button/Key with the action as 'Display'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InDuplicateMode

This function returns 'Yes' only if the voucher is created through a Button/Key with the action as 'Duplicate'. In Day book or any voucher Register, if we create a duplicate voucher (Alt + 2), then this function returns 'Yes'. It checks whether the current Voucher is in Duplication Mode.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InDynamicAlterMode

To check if the Parent of the current report is in Alter mode. It checks whether the previous or Parent Report, like any Main Report of any configuration report or any Subform is in Alter Mode or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InEditMode

This function is used to check if the selected mode is in Edit Mode. It checks if the current report is running in create mode or alter mode, it is like a combine function of $$InCreateMode and $$InAlter mode.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InExecuteMode

To check if the selected mode is in Execute Mode. It checks if current report is executed by Execute action of a Button or Key.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InExportAction

This function verifies if the selected mode is Export Action.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InExportMode

This function verifies if the selected mode is in the Export Mode.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InfoParam

This function extracts the value of the string from the actions message report and query report which is to be set in Query or Message box.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## InfoString

This function extracts the string from the actions message report and query report which is to be set in Query or Message box.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## InInsertMode

In Day book or any Voucher Register, if we are creating a new voucher in Insert mode (Alt + I), It checks whether the current Voucher Creation is in Insert mode or not. The new voucher number will be a decremented number of the voucher from where it is inserted.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InMailAction

This function returns 'Yes' only if the Report is accessed through a Button/Key with the action as 'Mail Report'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InMailMode

This function returns TRUE only if a particular report is accessed through a Menu/Button/Key with Mail action else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InMobileBrowserExport

It checks if the report is being displayed in a mobile browser. It returns 'yes' if the report is being displayed.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InPrintAction

This function verifies if the selected mode is Print Action.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InTrueColorMode

If the current color quality for the Monitor is set to 'True Color' (e.g. 24bit, 32 bit etc) then the function returns 'Yes' else if the color quality is set to '16 bit', '256 colors' etc., then it returns 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InUploadAction

This function returns 'Yes' only if the Report is accessed through a Button/Key with the action as 'Upload Report'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InWhatsAppAction

This function checks whether the selected mode is WhatsApp action or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InWhatsAppMode

This function checks whether the selected mode is WhatsApp or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsCaseToggled

This function is used to check if the field case has been toggled or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Field Name. | Identifier | No | Field | No |

---

## IsCheckAlwaysInDashboardTiles

This function is used to check whether any tile within the Dashboard contains the ?Check Always? attribute. It is intended for use at the preload check level of a Dashboard report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Hybrid
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsEdited

The value of the field changed manualy it returns 'Yes' else returns 'No'.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsExploded

This function checks whether the passed part name is exploded or not. If the part is exploded then it returns 'Yes' else 'No'. It also checks whether the current part is exploded or not if no parameter is passed.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Part name. | Value | String | No | No |

---

## IsExportable

This function checks if the Export attribute has been enabled or not for the current object.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsFieldEdited

This function states if the field has been edited or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Field Name. | Identifier | No | Field | No |

---

## IsFirstChildOnNextPage

This function returns a logical expression 'Yes' if a line is exploded and if first child or sub object apparently prints on the next page.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsFirstInPart

This function checks if the line in the part is first. This returns 'Yes' in case it is true.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsFromTriggerReport

This function returns whether a 'trigger' report was opened for context selection before opening the current report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsLastLine

This function is used to check is this the last scroll line in printing.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsLastPage

This function is used to check is this the last page in printing.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsLastVertPart

This function is used to check is this the last part in printing.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsNextActiveSibling

To check if the subsequent object is the object of the current collection used in the current explosion.(Ignores removed lines (Alt+R))

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsNextSibling

To check if the subsequent object is the object of the current collection used in the current explosion.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsOpeningBal

To check whether this line is opening line added due to OpeningBal attribute defined in Form for balancing. 

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsRepeatColumnContext

This function specifies whether the auto-report was opened when cursor present in column of parent report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsReportInEditMode

To check if the report is in edit mode.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsRightToLeftLangScript

This function checks language script is Right-To-Left or not

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Language Id | Value | Long | Yes | No |

---

## IsSiblingExploded

This function checks if the sibling has an exploded part or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsTriggerReport

This function returns whether the report is opened from 'Trigger' attribute of collection while doing actions like Display Collection, Alter Collection etc.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## LastLineNumber

This function retrieves Last Line Number of the part in the page. It retrieves the Last Line Number of a Part in each Page of printing. Supposing the Part is repeated with a collection having 59 items, in first page part is able to fit only 47 items, it retrieves 47 in the first page and 59 in the second page.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## LineNumber

Gives the Line Number of the specified line in a page.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## LoadKeyboardLayout

This function load specified languge keyboard layout

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Language Id | Value | Long | Yes | No |

---

## Loword

This function returns language ID from locale ID

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Language Id | Value | Long | Yes | No |

---

## NextActiveSibling

To refer to Next Line's Field Name or Method Name.(Ignores removed lines (Alt+R))

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Field/Method Name. | Value | Yes | No |

---

## NextSibling

To refer to Next Line's Field Name or Method Name.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Field Name. | Value | Yes | No |

---

## NumExplosions

Gives the Number of Explosions taken place for a line.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## NumFlowLinesCanFit

This function is used to get number of balance flow lines available to print.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## NumLanguages

This function returns number of Keyboard / Input Languages supported.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## NumUILanguages

This function returns number of UI / Display Languages supported.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## ParentIsMenu

This function checks whether the current report is called by a Menu Object or not.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## PrevLine

To refer to previous Line's Field Name or Method Name.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Field Name. | Value | Yes | No |

---

## PrevLineField

To refer to the value from the same field of the previous line.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client

### Parameters

_No parameters._

---

## PrevLineVisible

To check if the previous line stated is displayed.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## TableExplodeLevel

This function returns the level of Explosion for the current Table Item.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## TableExplodeOwner

This function facilitates to extract method value from the parent collection of the exploded table/collection. The function evaluates the value while the Table is constructed.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This is an expression that evaluates to a method. | Value | Yes | No |

---

## TopLine

To refer to Top Line's Field Name or Method Name.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify Field Name. | Value | Yes | No |

---

## ValidateandGetKeyboard

This function validates and loads specified languge keyboard layout

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Language Id | Value | Long | Yes | No |

---

## WindowHeight

This function returns the current window height.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## WindowWidth

This function returns the current window width.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: GUI
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---
