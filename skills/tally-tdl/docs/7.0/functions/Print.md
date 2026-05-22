# Print Function

> **Version**: 7.0

Reference documentation for all entries in the **Print** function.

> **Total Entries**: 27

## Table of Contents

- [CopyNo](#copyno)
- [InDMPMode](#indmpmode)
- [InDraftMode](#indraftmode)
- [InPixelMode](#inpixelmode)
- [InPreviewMode](#inpreviewmode)
- [InPrintMode](#inprintmode)
- [IsMultiPagePrintJob](#ismultipageprintjob)
- [IsMultiPartPrintJob](#ismultipartprintjob)
- [NatLangInfo](#natlanginfo)
- [OriginalNo](#originalno)
- [PageNo](#pageno)
- [PageRangeOk](#pagerangeok)
- [PaperSizeInInches](#papersizeininches)
- [PaperSizeInLines](#papersizeinlines)
- [PaperSizeInMM](#papersizeinmm)
- [PaperType](#papertype)
- [PartNo](#partno)
- [PortName](#portname)
- [PrintBottomClip](#printbottomclip)
- [PrinterInfo](#printerinfo)
- [PrintersExist](#printersexist)
- [PrintLeftClip](#printleftclip)
- [PrintRightClip](#printrightclip)
- [PrintSizeInInches](#printsizeininches)
- [PrintSizeInMM](#printsizeinmm)
- [PrintTopClip](#printtopclip)
- [SetNo](#setno)

---

## CopyNo

This function gives the current Copy Number.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## InDMPMode

This function returns TRUE if the printing mode selected is DMP Mode (Dot Matrix Printing) else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InDraftMode

This function returns TRUE if the printing mode selected is Quick/Draft Mode else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InPixelMode

This function returns TRUE if the printing mode selected is Neat Mode else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InPreviewMode

This function returns TRUE only if a report is being generated for showing Preview.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## InPrintMode

This function returns TRUE only if a particular report is accessed through a Menu/Button/Key with Print action else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsMultiPagePrintJob

This function returns TRUE if printing spans across multiple pages i.e., more than one page else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsMultiPartPrintJob

This function returns TRUE if the number of columns being printed spans across multiple pages else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## NatLangInfo

This function is used to retrieve information from current Natural Language query being executed.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Print
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the type of information to be retrieved. This infromation is extracted from the Natural Command / Query being processed by the system. | Keyword | Yes | NatLangInfo | Company, From Date, Object FullName, Object Name, Object Type, SecondaryObject Name, SecondaryObject Type, To Date, Username | No |

---

## OriginalNo

This function returns the Number of the current Form being printed within the current Report.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## PageNo

This function returns the current page number being printed.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## PageRangeOk

This function returns the page range specified.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify page range for printing only selected pages. | Value | String | Yes | No |

---

## PaperSizeInInches

This function returns the page size in inches calculated based on the selected printer which is the parameter to this function.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PaperSizeInLines

This function returns the page size in number of lines and columns calculated based on the selected printer which is the parameter to this function.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PaperSizeInMM

This function returns the page size in Millimeters calculated based on the selected printer which is the parameter to this function.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PaperType

This function returns the type of the paper based on the selected printer which is the parameter to this function.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PartNo

Thif function returns the Page Number if the Columns being printed spans across multiple pages.  The Page No is being assigned as Page 1(A), Page 1(B), Page 2(A), Page 2(B), etc.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## PortName

This function returns the Port name of the selected printer if Printer Name is supplied as a parameter. In absence of any parameters, it returns the Port Name of the first printer in the list of installed printers.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PrintBottomClip

This function sets the default Space Bottom for the current page for the selected printer which is the parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PrinterInfo

This function is used to retrieve printer related information.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: Print
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | Yes |  |  | No |
| 2 | This function retrieves given printer specified information, those are TopMarginInMMs, LeftMarginInMMs, BottomMarginInMMs, RightMarginInMMs, IsExists, PrintSizeInInches, PrintSizeInMMs, PrintSizeInLines, PaperSizeInInches, PaperSizeInMMs, PaperSizeInLines, PaperType, PortName, PortName, PrinterType and Orientation . | Keyword |  | Yes | Printer Info | BottomMarginInMMs, LeftMarginInMMs, Orientation, PaperSizeInInches, PaperSizeInLines, PaperSizeInMMs, PaperType, PortName, PrinterExists, PrinterSizeInInches, PrinterSizeInMMs, PrinterType, PrintSizeInInches, PrintSizeInLines, PrintSizeInMMs, RIghtMarginInMMs, Status, TopMarginInMMs | No |

---

## PrintersExist

The function returns TRUE if printer is installed on the System else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## PrintLeftClip

This function sets the default Space Left for the current page for the selected printer which is the parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PrintRightClip

This function sets the default Space Right for the current page for the selected printer which is the parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PrintSizeInInches

This function returns the page size in inches calculated based on the selected printer which is the parameter to this function.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PrintSizeInMM

This function returns the page size in Millimeters calculated based on the selected printer which is the parameter to this function.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## PrintTopClip

This function sets the default Space Top for the current page for the selected printer which is the parameter.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Name of the Printer. | Value | String | No | No |

---

## SetNo

This function gives the current Set Number.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: Print
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---
