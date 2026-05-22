# System Function

> **Version**: 7.0

Reference documentation for all entries in the **System** function.

> **Total Entries**: 33

## Table of Contents

- [CapInfo](#capinfo)
- [CmpUserLevel](#cmpuserlevel)
- [CmpUserName](#cmpusername)
- [COMExecute](#comexecute)
- [ContainDirectories](#containdirectories)
- [CurrentCompany](#currentcompany)
- [CurrentDate](#currentdate)
- [CurrentPeriodFrom](#currentperiodfrom)
- [CurrentPeriodTo](#currentperiodto)
- [CurrentSimpleCompany](#currentsimplecompany)
- [DebugLog](#debuglog)
- [ExcelInfo](#excelinfo)
- [GetFileNameFromPath](#getfilenamefrompath)
- [GetParentDirectory](#getparentdirectory)
- [IsAnyCmpOwner](#isanycmpowner)
- [IsCmpOwner](#iscmpowner)
- [IsDirectoryExists](#isdirectoryexists)
- [IsFileExists](#isfileexists)
- [IsHiddenFileDir](#ishiddenfiledir)
- [IsInternetActive](#isinternetactive)
- [IsPathNetworkShared](#ispathnetworkshared)
- [IsSimpleCompany](#issimplecompany)
- [MakeFTPName](#makeftpname)
- [MakeHTTPName](#makehttpname)
- [MakeMAILName](#makemailname)
- [OriginalCompany](#originalcompany)
- [ParentPeriodFrom](#parentperiodfrom)
- [SetWorkingDir](#setworkingdir)
- [SysInfo](#sysinfo)
- [SystemPeriodFrom](#systemperiodfrom)
- [SystemPeriodTo](#systemperiodto)
- [ValidatePath](#validatepath)
- [WordInfo](#wordinfo)

---

## CapInfo

This function is used to retrieve capsule related information.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: System
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Keyword Set | Keywords | Variable Argument |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the type of information to be retrieved. Such as ComponentName, RevisionID. | Keyword |  | Yes | Cap Info | ComponentName, RevisionID | No |
| 2 | Its the parameter which needs to be passed for the query being done. Such as Capsule ID | Value | Long | Yes |  |  | No |

---

## CmpUserLevel

This function provides the current user Level , i.e, ?Owner? Or  ?Data  Entry? depends on the Security control.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## CmpUserName

This function returns the Tally Vault user name.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## COMExecute

This function is used to invoke the defined COM Interface. It can invoke Interfaces with only IN Parameters.

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Refers To | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Name of the COM Interface defined using definition type COM Interface. | Identifier | Yes | COM Interface | No |
| 2 | This is used to specify the IN Parameters accepted by the COM Interface in the same order as specified in the COM Interface Definition. | Value | No |  | Yes |

---

## ContainDirectories

This function is used to check whether the directory path contains sub (directories) folders or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the string expression. | Value | String | Yes | No |

---

## CurrentCompany

This function is used to refer to the name of the company which has been currently loaded. This function does not accept any parameter and returns the company name as result.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## CurrentDate

This function is used to pick up the Current Date set in Tally. This does not accept any parameter and returns a value of type Date.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## CurrentPeriodFrom

The above function is used Display the Starting Date of the Current financial Period. It does not take any parameters but returns a value of type Date.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## CurrentPeriodTo

The above function is used to display the Ending Date of the Current Period.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## CurrentSimpleCompany

This function returns the current simple company Name, which is not a group company.In case of this function is called in a Group company,  it returns first simple company under that.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## DebugLog

This function is used to log all the parsing evaluation done when tally is run in DevMode. The expression evaluation results can be viewed in tally working directory with the excel filename starting with 'debug'.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This parameter specifies the expression whose parsing has to be logged. | Value | Yes | No |

---

## ExcelInfo

This function is used to get the Excel 'version' and to check whether 'XLSX' format is supported.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts any one of the keywords IsXLSXSupported or Version. The keyword IsXLSXSupported is used to check if the format 'xlsx' is supported and Version to get the Excel version number. | Value | String | Yes | No |

---

## GetFileNameFromPath

This function returns file name or the last directory from the specified path.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the path. | Value | String | Yes | No |

---

## GetParentDirectory

This function returns the parent directory for specifed path.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the path. | Value | String | Yes | No |

---

## IsAnyCmpOwner

This function checks whether the person is an administrator or not and has permission for company operations.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsCmpOwner

This function checks if the person is the Administrator. Here Administrator is the person who is assigned as Admin in the Company Creation/Alteration Report Only.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsDirectoryExists

This function allows to find if given directory exists or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the Path. | Value | Yes | No |

---

## IsFileExists

This function allows to find if given file exists or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Path. | Value | String | Yes | No |

---

## IsHiddenFileDir

This function is used to check the directory or file is hidden or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | To specify the path of the directory or file to be checked whether hidden or not. | Value | Yes | No |

---

## IsInternetActive

This function allows to find if there is an active modem or a LAN Internet connection on the local system

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsPathNetworkShared

This function return True if the path provided is a Network shared.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | Specify the path to be checked. | Value | Yes | No |

---

## IsSimpleCompany

This function is used to check whether the currently opened company is a Simple Company or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Name of the company. | Value | String | Yes | No |

---

## MakeFTPName

The function $$MakeFTPName is used for creating the file transfer protocol based on the specifications. The parameters becomes FtpServer, FtpUser, FtpPassword, FtpPath.  FTPServer is used for  specifying the server , FTPUser is for specifying the user and so on.

### Meta

- **Total Parameters**: 4
- **Total Mandatory Parameters**: 4
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the FTP server name and optional port. | Value | String | Yes | No |
| 2 | To specify the FTP user name. | Value | String | Yes | No |
| 3 | To specify the FTP user name. | Value | String | Yes | No |
| 4 | To specify the FTP full path name. | Value | String | Yes | No |

---

## MakeHTTPName

The function $$MakeHTTPName is used for creating the Hyper Text Transfer Protocol for the specified security features.  The Syntax includes the string formula HttpUrl, HttpIsSecure, Http User Name, HttpPassword & CompanyName.

### Meta

- **Total Parameters**: 5
- **Total Mandatory Parameters**: 4
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify HTTP URL can be of the form URL:8000/filename or URL/filename. | Value | String | Yes | No |
| 2 | To specify the HTTP is secure or not. | Value | Logical | Yes | No |
| 3 | To specify the HTTP is secure or not. | Value | String | Yes | No |
| 4 | To specify the HTTP password. | Value | String | Yes | No |
| 5 | To specify the HTTP password. | Value | String | No | No |

---

## MakeMAILName

Constructs a SMTP mail to URL from various parameters for sending mail.

### Meta

- **Total Parameters**: 10
- **Total Mandatory Parameters**: 8
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Mail To field | Value | String | Yes | No |
| 2 | Mail To field | Value | String | Yes | No |
| 3 | Mail From field | Value | String | Yes | No |
| 4 | Mail From field | Value | String | Yes | No |
| 5 | Mail subject field | Value | String | Yes | No |
| 6 | Mail subject field | Value | String | Yes | No |
| 7 | Mail password field | Value | String | Yes | No |
| 8 | Mail password field | Value | String | Yes | No |
| 9 | Mail Use SSL on Standard SMTP Port | Value | String | No | No |
| 10 | Mail Use SSL on Standard SMTP Port | Value | String | No | No |

---

## OriginalCompany

Returns the name of Original Company to which the Object Belongs. This is evaluated in the context of Primary Object available in current context

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: String

### Parameters

_No parameters._

---

## ParentPeriodFrom

The function $$ParentPeriodFrom is used to fetch starting date of the accounting period. It accepts no parameter and returns a date value which is present in the From date of the period.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## SetWorkingDir

This function allows you to change the current working directory.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify the Path to be set as Working Directory. If not given then default application path wil be set. | Value | String | No | No |

---

## SysInfo

This function is used to retrieve system related information.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Returns any one of the following: Machine Name, Machine IP Address, Machine MAC Address, Current Windows User, Current System Date, Working folder, Application folder, Returns whether Tally is running on Windows or Not, Windows Version, The IPv4 and IPv6 URL on which Tally is Running. | Value | String | Yes | No |

---

## SystemPeriodFrom

$$SystemPeriodFrom function will give the value of the starting date of the currently selected company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## SystemPeriodTo

$$SystemPeriodTo function will give the value of the ending date of the currently selected company.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Date

### Parameters

_No parameters._

---

## ValidatePath

This function is used to check whether syntax of a path is correct.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the path. | Value | String | Yes | No |

---

## WordInfo

This function is used to get the Word 'version' supported. This can also be used to find  if Word is installed

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: System
- **Execution Mode**: Client

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | It accepts any one of the keywords IsDOCXSupported or Version. The keyword IsDOCSupported is used to check if the format 'docx' is supported and Version to get the Word version number. | Value | String | Yes | No |

---
