# Collection Definition

> **Version**: 7.0

Reference documentation for all entries in the **Collection** definition.

> **Total Entries**: 92

## Table of Contents

- [Activity Type](#activity-type)
- [Add](#add)
- [Replace](#replace)
- [Delete](#delete)
- [Advanced](#advanced)
- [Aggr By Track](#aggr-by-track)
- [Aggr Compute](#aggr-compute)
- [Aggr Compute Track](#aggr-compute-track)
- [Alias](#alias)
- [Align](#align)
- [Allow Noise Chars](#allow-noise-chars)
- [Altered Due To](#altered-due-to)
- [AlternateURL](#alternateurl)
- [API](#api)
- [Belongs To](#belongs-to)
- [Break On](#break-on)
- [By](#by)
- [Child Of](#child-of)
- [Cleared](#cleared)
- [Client Only](#client-only)
- [Collection](#collection)
- [Color](#color)
- [Column Align](#column-align)
- [Column Var](#column-var)
- [Compute](#compute)
- [Compute Var](#compute-var)
- [Data Source](#data-source)
- [EditLog User Name](#editlog-user-name)
- [Excel Sheet Info](#excel-sheet-info)
- [Exclude](#exclude)
- [Explode](#explode)
- [Export Header](#export-header)
- [Fetch](#fetch)
- [Filter](#filter)
- [Filter Var](#filter-var)
- [Format](#format)
- [Full Height](#full-height)
- [Include](#include)
- [Include Deleted](#include-deleted)
- [Indent](#indent)
- [Input JSON](#input-json)
- [Input Parameter](#input-parameter)
- [Is ODBC Table](#is-odbc-table)
- [JSON Object](#json-object)
- [JSON Object Path](#json-object-path)
- [KBLanguage](#kblanguage)
- [Keep Contributors](#keep-contributors)
- [Keep Source](#keep-source)
- [List](#list)
- [Local Formula](#local-formula)
- [Max](#max)
- [New Object](#new-object)
- [Object](#object)
- [Object Action](#object-action)
- [ODBC](#odbc)
- [Option](#option)
- [Parm Var](#parm-var)
- [Prefetch](#prefetch)
- [Primary Status](#primary-status)
- [ReCompute](#recompute)
- [Recon Status](#recon-status)
- [RemoteRequest](#remoterequest)
- [Repeat](#repeat)
- [Report](#report)
- [Report List](#report-list)
- [ReWalk](#rewalk)
- [Search Key](#search-key)
- [Secondary Status](#secondary-status)
- [Set](#set)
- [Sort](#sort)
- [Source Collection](#source-collection)
- [Source Fetch](#source-fetch)
- [Source PreFetch](#source-prefetch)
- [Source Var](#source-var)
- [SQL](#sql)
- [SQL Parms](#sql-parms)
- [SQLValues](#sqlvalues)
- [Style](#style)
- [Sub Title](#sub-title)
- [Switch](#switch)
- [Table Sort](#table-sort)
- [Table Text Compare](#table-text-compare)
- [Title](#title)
- [Transaction Type](#transaction-type)
- [Trigger](#trigger)
- [Type](#type)
- [Unique](#unique)
- [Use](#use)
- [Variable](#variable)
- [Walk](#walk)
- [WalkEx](#walkex)
- [XSLT](#xslt)

---

## Activity Type

This attribute will be used to specify the activity type of edit log

### Meta

- **Aliases**: Activity Type
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the actual activity type | Value | Yes | No | No |

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

## Advanced

This attribute allows hiding certain objects in a collection. The objects meeting this condition are hidden and are displayed when user types in the string for searching.

### Meta

- **Aliases**: Advanced
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Separator Char | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is a conditional expression. The Table elements that satisfy the given conditions will be treated as Advanced table item. | Value | Yes | No | No |  | No |
| 2 | If expression mentioned evaluates to True, it means that advanced nodes will be part of table search listing when user enters text. Else in case of False, advanced nodes will only be part of search listing when there are no starts with matches in non-advanced nodes. | Value | No | No | No | ',' | No |

---

## Aggr By Track

Attribute to track the object id's

### Meta

- **Aliases**: Aggr By Track, By Track
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Attribute to track the object id's | Value | String | Yes | No | No | No |

---

## Aggr Compute

This attribute is used for aggregation purpose based on the criteria(s) specified with attribute By.

### Meta

- **Aliases**: Aggr Compute, Aggr Method
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It refers to the method where the result can be stored and referred to later. | Identifier | Yes | Yes | ObjectField |  |  | No |
| 2 | It takes operation to be performed on the given method within the given criteria i.e., Sum, Max or Min. | Keyword | Yes | Yes |  | Aggr Type | Add, High, Last, Low, Max, Min, Sum | No |
| 3 | It takes operation to be performed on the given method within the given criteria i.e., Sum, Max or Min. | Value | Yes | No |  |  |  | No |

---

## Aggr Compute Track

Attribute help to keep track of objects contributed to the aggr method

### Meta

- **Aliases**: Aggr Compute Track, Aggr Method Track
- **Type**: Dual List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It refers to the method where the result can be stored and referred to later. | Identifier |  | Yes | Yes | No |
| 2 | Identifier to keep track of objects | Value | String | No | No | No |

---

## Alias

The attribute will display the aliases of the groups in the specified table.

### Meta

- **Aliases**: Alias, Aliases, With Alias, With Aliases
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Logical value to specify whether aliases will be considered for display or Not. | Value | Logical | Yes | No | No | No |

---

## Align

This attribute aligns the collection by the field to the position assigned (Top/Left/Right/Centre)  when the collection is used as a Table in the field definition.

### Meta

- **Aliases**: Align, Alignment
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | It is either of the keywords Top/Left/Right/Center. | Keyword | Yes | Yes | No | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Allow Noise Chars

This attribute allows the exclusion of noise characters while populating objects in a table.

### Meta

- **Aliases**: Allow Noise Chars, Table Has Path
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is a logical value and the default value is No. It specifies if noise chars are allowed in table itself or not. | Value | Logical | Yes | No | No | No |
| 2 | This is a logical value and the default value is No. It specifies whether allow noise characters to appear in results when user has typed something in the field. | Value | Logical | No | No | No | No |

---

## Altered Due To

This attribute will be used to specify the altered due to information

### Meta

- **Aliases**: Altered Due To
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the actual altered due to info | Value | Yes | No | No |

---

## AlternateURL

It is used to specify the alternate URL (for Remote Url) of the HTTP server delivering the XML data.

### Meta

- **Aliases**: AlternateURL
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The alternate URL of the HTTP server delivering the XML data. | Value | String | Yes | No | No |

---

## API

It is used to specify the URL of the HTTP server delivering the XML data.

### Meta

- **Aliases**: API, Remote URL
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The URL of the HTTP server delivering the XML data. | Value | String | Yes | No | No | No |

---

## Belongs To

This attribute can be used only with child of attribute.By default this attribute value is “no”, If It is specified as “No” then all object having parent as a object name specified in child of attribute (i.e. Direct Childs) will be gathered. If it is specified as a “Yes” the all direct indirect Childs of object name specified in child of attribute will be gathered.

### Meta

- **Aliases**: Belongs To, Family
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This evaluates to either Yes/No. | Value | Logical | Yes | No | No | No |

---

## Break On

This attribute is used to validate the XML or JSON data received from the DLL function. Typically, an error code is provided as a parameter. If this string is found in the received data, the collection will not be gathered.

### Meta

- **Aliases**: Break On
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the string value used as an error indicator to validate the XML or JSON data. | Value | No | No | No | No |

---

## By

It allows to specify the criteria based on which the aggregation is done.

### Meta

- **Aliases**: By
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the suitable name for the grouped method. | Identifier |  | Yes | Yes | ObjectField | No |
| 2 | It should be evaluated to method names on which Aggregation operation needs to be performed. | Value | String | No | No |  | No |

---

## Child Of

If the main object of collection in attribute Type specified is transaction type and sub object as well, then Child of attribute accepts the name of sub object.It gives all transaction having occurrence of sub object. If the main object of collection is master type then child of attribute accepts name of parent. Then the collection will be gathered for all masters  belonging to parent specified.

### Meta

- **Aliases**: Child Of
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | If main object type is transaction type then it accepts object name of object type specified in second attribute of type. If main object type is master then it accepts name of parent. | Value | String | Yes | No | No | No |

---

## Cleared

This attribute will include only cleared bills/voucher depending upon it's value Yes or No.

### Meta

- **Aliases**: Cleared
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies whether to include only cleared bill/vouchers or not. | Value | Logical | Yes | No | No | No |

---

## Client Only

This attribute is used to collect data from the collection locally, and not to send request to the server for collection data.

### Meta

- **Aliases**: Client Only
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies to collect collection data locally without sending request to the server. | Value | Logical | Yes | No | No | No |

---

## Collection

This attribute is used to represent the resultant collection and it will be union of  all objects  of  the collections specified  in the list.

### Meta

- **Aliases**: Collection, Collections
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | List of collections. | Identifier |  | Yes | Yes | Collection | No |
| 2 | This is the name of loop collection and it is optional. | Identifier |  | No | Yes | Collection | No |
| 3 | This is the name of loop collection and it is optional. | Value | Logical | No | No |  | No |

---

## Color

This attribute allows changing the font colour/foreground colour of column values in a Table.

### Meta

- **Aliases**: Color, Shade
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The name of a color. | Identifier |  | Yes | No | Color | No |
| 2 | Table Items whose result of expression defined yields an 'Yes' will apply the color defined. | Value | Logical | No | No |  | No |

---

## Column Align

This attribute allows providing comma-separated alignment values for the columns (Left/Right/Centre/Prompt).

### Meta

- **Aliases**: Column Align
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | The value has to be either of the keywords of alignment ( Right / Left / Center / Prompt). | Keyword | Yes | Yes | Align Type | Bottom, Center, Centre, Justified, Left, Prompt, Right, Top | No |

---

## Column Var

It is used for repeating the variables in for columnar report.

### Meta

- **Aliases**: Column Var
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It specifies the variable name to be repeated for columnar report. | Identifier | Yes | Yes | Variable | No |

---

## Compute

This attributes is used to fetch the required methods from the source collection and allows to assign an alias to the methods.

### Meta

- **Aliases**: Compute, Method
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is a string which is assigned as alias for the specified method | Identifier | Yes | Yes | ObjectField | No |
| 2 | Method Name | Value | No | No |  | No |

---

## Compute Var

It evaluates the value based on the current objects.

### Meta

- **Aliases**: Compute Var
- **Type**: Variable List

### Parameters

_No parameters._

---

## Data Source

To populate a collection using a variety of sources. Valid data source types are JSON, HTTP JSON, XML, HTTP XML, ODBC, Rule Set, and so on.

### Meta

- **Aliases**: Data Source
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | A valid data source type - File JSON, File XML, ODBC, HTTP JSON, HTTP XML, Report, Variable, Rule Set, Flag Set, Name Set, Num Set, XML String, JSON String and so on. | Keyword |  | Yes | Yes | No | Data Source | Antivirus Details, Application Excel Maps, Application Report Views, Associated Tnet Lic List, Autobackups on Disk, Autobackup Status, Autobackup Versions, AxPlugIn XML, Backup EmailIds List, Bank Statement, Capsule Xml, Cmp Scheduled Task List, Company Excel Maps, Company Report Views, Company Restore List, Company Selection List, Computer Details, Customer Profile, Directory, Directory Selection List, Event Log List, Excel Column Names, Excel Header Names, Excel Sheet Names, Exchange, Exchange Activity Objects, Exchange Cache, Exchange Contributors, Exchange Objects, Extensions List, File JSON, File JSONZip, File Selection List, File XML, Firewall Details, Flag Set, Hard Disk Details, HTTP JSON, HTTP JSON EX, HTTP XML, Imf Statement, JSON Files, JSON String, LoggedIn Session List, Name Set, Net Adapter Details, Notification, Num Set, Online Backup List, Online Backup Version List, Parent Report, PlugIn JSON, PlugIn JSON EX, PlugIn XML, Recon, Report, Report Stack, Rule Set, Scheduled Task List, Secure Capsule Xml, System Installed Instances, TDL Statistics, Template Sections, TGS Computer Details, USB Sign Certificates, Variable, XML String | No |
| 2 | An identity or source location for the specified data source type - a file, a URL, or a definition name based on the type of data source. | Value | String | Yes | No | No |  |  | No |
| 3 | An identity or source location for the specified data source type - a file, a URL, or a definition name based on the type of data source. | Keyword |  | No | Yes | No | Encoding | ASCII, Unicode, Unicode8, UTF16, UTF8 | No |

---

## EditLog User Name

This attribute will be used to specify the user names based on which Edit Logs to be considered, currently this attribute is used only by Edit Log Query/Collection to consider Masters and Transactions based on username(s) provided. Multiple values can be considered, use quoted string as username may also have quote.

### Meta

- **Aliases**: EditLog User Name
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies name / names of users. | Value | Yes | No | No |

---

## Excel Sheet Info

This attribute is used to specify the sheet name of the Excel, as well as the starting and ending cell/column names.

### Meta

- **Aliases**: Excel Sheet Info
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the sheet name of the Excel. | Value | String | Yes | No | No | No |
| 2 | Specify the starting cell/column name of the Excel sheet. | Value | String | No | No | No | No |
| 3 | Specify the starting cell/column name of the Excel sheet. | Value | String | No | No | No | No |

---

## Exclude

This attribute is used to exclude the group specified from the collection.

### Meta

- **Aliases**: Exclude
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | Name of the object to be excluded from the collection. | Value | No | Yes | No |

---

## Explode

This attribute allows exploding to another collection in a Table. By default, the exploded collection will be displayed in the table. Based on the second parameter, the collection would be exploded. If the third parameter is specified as FALSE/ NO, then the collection will be gathered during the collection construct; however; would not be displayed. By default, the third parameter is TRUE/YES.

### Meta

- **Aliases**: Explode, Explosions
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | The name of a collection. | Identifier | Yes | Yes | Collection | No |
| 2 | The conditional expression when evaluated to TRUE will lead to the gathering of the explode collection. | Value | No | No |  | No |
| 3 | The conditional expression when evaluated to TRUE will lead to the gathering of the explode collection. | Value | No | No |  | No |

---

## Export Header

To specify the HTTP request headers for a GET or POST request.

### Meta

- **Aliases**: Export Header, Header
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to a string. | Value | String | Yes | No | No |

---

## Fetch

This attributes is used to fetch the required methods from the source collection.

### Meta

- **Aliases**: Fetch, Native Method
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | List of methods to be fetched. | Identifier | No | Yes | ObjectField | No |

---

## Filter

It specifies in which the record to be included based on the condition.

### Meta

- **Aliases**: Filter, Filtered, Filters
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the condition based on which the objects get filtered. | Identifier | No | Yes | System Formulae | No |

---

## Filter Var

It evaluates the value based on the objects available in collection after the evaluation of attributes Fetch and Compute.

### Meta

- **Aliases**: Filter Var
- **Type**: Variable List

### Parameters

_No parameters._

---

## Format

Adds a column to the table to show specific values from the object.

### Meta

- **Aliases**: Format
- **Type**: Triple List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Separator Char | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Formating value expression | Value |  | Yes | No |  | No |
| 2 | Width of the column. | Value | Long | No | Yes | ',' | No |
| 3 | Width of the column. | Value | String | No | Yes |  | No |

---

## Full Height

It is used to check whether the table display of the collection will have full height or not.

### Meta

- **Aliases**: Full Height
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies whether full height to be used or not for the collection. | Value | Logical | Yes | No | No | No |

---

## Include

Lists the object(group, ledger etc) names to be included in the collection.

### Meta

- **Aliases**: Include
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | Name of the object to be included in the collection. | Value | No | Yes | No |

---

## Include Deleted

This attribute is used to determine whether the deleted transactions are to be included as part of a collection or not. This is applicable only for the voucher of the company.

### Meta

- **Aliases**: Include Deleted
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This attribute evaluates to either Yes or No. If the value is specified as Yes, then the deleted vouchers retained will also be delivered. The default value is No. | Value | Logical | Yes | No | No | No |

---

## Indent

This attribute aids to move the characters to the left in the column. However, it is highly used within Exploded Tables.

### Meta

- **Aliases**: Indent
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Any expression that evaluates to a number. | Value | Long | Yes | No | No | No |

---

## Input JSON

This attribute is used to pass XML or JSON format data to an external DLL.

### Meta

- **Aliases**: Input JSON, Input XML
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of the TDL report that generates XML or JSON data to be passed as input to the DLL function. | Value | No | Yes | No | No |

---

## Input Parameter

The attribute Input Parameter is used to pass single string value to the DLL function.

### Meta

- **Aliases**: Input Parameter
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This is an expression which returns a string value to be passed to the DLL function. | Value | String | No | No | No | No |

---

## Is ODBC Table

This attribute is used to check whether this collection is exposed to ODBC or Not.

### Meta

- **Aliases**: Is ODBC Table, Show Table
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | If this value is Yes this collection will be exposed to ODBC. | Value | Logical | No | No | No | No |

---

## JSON Object

To specify the object (user-defined or schema object) to which the data in the JSON/XML file has to be mapped.

### Meta

- **Aliases**: JSON Object, XML Object
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of the object. | Identifier | No | No | No | Object | No |

---

## JSON Object Path

To specify the path to the data fragment in the JSON or XML file to be extracted and converted into a TDL object in the collection. By default, extraction starts from the root node.

### Meta

- **Aliases**: JSON Object Path, SQLObject, XML Object Path
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the name and position of the JSON/XML node from which the data should be extracted. | Value | Yes | No | No | No |

---

## KBLanguage

This is used to gather master created in particular language id.If we require all masters irrespective of language in which it is created,provide parameter as zero else provide the language id of the masters as required.

### Meta

- **Aliases**: KBLanguage
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | If the language id is specified as 0 then all masters will be gathered other wise only maters created in provided langauge id will be gathered. | Value | Long | No | No | No | No |

---

## Keep Contributors

Used to specify if the contributors are to be maintained as a sub collection. This can later be used to identify which objects participated in the aggregation

### Meta

- **Aliases**: Keep Contributors
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the contributors collection. A sub collection by this name will be created in each aggregated object and will be populated with the contributors of the aggregation. | Value | String | Yes | Yes | No | No |

---

## Keep Source

Keep Source is used to retain the source data in main memory.

### Meta

- **Aliases**: Keep Source
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | YES/No specifies keep source at current owner or not. '().' Specifies the object associated with Menu/Report/Function, which comes first in the owner->owner chain. … doted notation walk-up the owner chain by number of dots . | Value | Yes | Yes | No | No |

---

## List

This attribute is used to list the strings to be included as the content of the collection.

### Meta

- **Aliases**: List, List Name
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Object name/ strings to be included in the collection. | Value | String | No | No | No |

---

## Local Formula

This is used to specify a local formula within the Import Object Definition .

### Meta

- **Aliases**: Local Formula
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | The name of the Local Formula. | Identifier | Yes | Yes | No |
| 2 | The expression which needs to be evaluated. | Value | Yes | No | No |

---

## Max

This is the maximum number of records to be gathered from database.

### Meta

- **Aliases**: Max, Maximum
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Expression to specify a number. | Value | Long | No | No | No | No |

---

## New Object

Depending upon the condition, the type of the object will be added at the collection level

### Meta

- **Aliases**: New Object
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | specifies the user defined object type to be added to the collection. | Identifier |  | No | Yes | Object | No |
| 2 | Specifies the condition based on which object type will be added. | Value | Logical | No | No |  | No |

---

## Object

This attribute specifies the user defined objects that needs to be part of the collection.

### Meta

- **Aliases**: Object, Objects
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specify the name of the objects. | Identifier | No | Yes | Object | No |

---

## Object Action

This attribute will be used to select object update action

### Meta

- **Aliases**: Object Action
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the object action type | Value | Yes | No | No |

---

## ODBC

This attribute is used to specify the FileDSN.  The data from ODBC tables can be pulled in Tally and can be saved and displayed as a report. To achieve the connectivity DSN has to be created.

### Meta

- **Aliases**: ODBC
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It specifies theFile DSN name in order to get data in tally from ODBC tables. | Value | String | Yes | No | No | No |

---

## Option

Option is an attribute which can be used by various definitions, to provide a conditional result in a program.

### Meta

- **Aliases**: Option, Options
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This specifies the name of the Optional collection. | Identifier |  | Yes | Yes | Collection | No |
| 2 | Logical Condition/ expression which returns logical value. | Value | Logical | No | No |  | No |

---

## Parm Var

The attribute Param Var is a context free structure available within the collection which evaluates the expression in context of the caller/Request or Object.

### Meta

- **Aliases**: Parm Var
- **Type**: Variable List

### Parameters

_No parameters._

---

## Prefetch

This attributes is used to prefetch the required methods into the source object.

### Meta

- **Aliases**: Prefetch
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | List of methods to be prefetched. | Identifier | No | Yes | No |

---

## Primary Status

This attribute will be used to select link masters which has a specific primary status

### Meta

- **Aliases**: Primary Status
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the actual primary status | Value | Yes | No | No |

---

## ReCompute

This attributes is used to fetch the required methods from the source collection and allows to assign an alias to the methods. Executed only in Re-walk mode

### Meta

- **Aliases**: ReCompute, Rewalk Method
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | This is a string which is assigned as alias for the specified method | Identifier | Yes | Yes | ObjectField | No |
| 2 | Method Name | Value | No | No |  | No |

---

## Recon Status

This attribute will be used to select external data which has a specific recon status

### Meta

- **Aliases**: Recon Status
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the actual recon status | Value | Yes | No | No |

---

## RemoteRequest

It is used to specify the report name which is to be sent to the HTTP server as an XML or JSON Request and the XML or JSON Response is obtained in the collection.

### Meta

- **Aliases**: RemoteRequest
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report which sends the request in XML or JSON format to the web page on the remote server. | Value | No | Yes | No | Report |  |  | No |
| 2 | It specifies the name of the report which accepts the user-input. | Keyword | No | Yes | No |  | Encoding | ASCII, Unicode, Unicode8, UTF16, UTF8 | No |

---

## Repeat

This attribute is used to specify the periodicity between two dates Like week, month etc. Whenever we need to repeat the collection based on the periodicity,this attribute is used

### Meta

- **Aliases**: Repeat
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | If we need to repeat period collection for periodicity month then specify this as month | Value | String | Yes | No | No | No |

---

## Report

It displays a new report specified in this attribute, based on the object selected from the collection in the trigger report.

### Meta

- **Aliases**: Report, Reports
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be displayed. | Identifier | Yes | Yes | No | Report | No |

---

## Report List

Lists the Report names whose names are  to be displayed in the content of the collection.

### Meta

- **Aliases**: Report List
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Name of the report to be displayed as the content of the collection. | Identifier | No | Yes | Report | No |

---

## ReWalk

This is used in line with Walk attribute. To allow a re-walk of the collection specified during walk and execute Re-compute statements

### Meta

- **Aliases**: ReWalk
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This evaluates to either Yes/No. | Value | Logical | Yes | No | No | No |

---

## Search Key

It is used to create index dynamically where the key is defined and the Collection is indexed in the memory using the Key. Any object can be searched instantly using the index.

### Meta

- **Aliases**: Search Key
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the method/s to be used to create the index | Value | String | Yes | No | No | No |

---

## Secondary Status

This attribute will be used to select link masters which has a specific secondary status

### Meta

- **Aliases**: Secondary Status
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the actual secondary status | Value | Yes | No | No |

---

## Set

This attribute is used to set the default value to the field of a table.

### Meta

- **Aliases**: Set, Set as
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Formula specifying the value. | Value | String | Yes | No | No | No |

---

## Sort

Specifies the sorting method on the specified method/ function/ formula.

### Meta

- **Aliases**: Sort
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Specifies the sorting method to be used. | Value | String | Yes | No | No |
| 2 | The Method Name on which sorting is performed. | Value |  | No | No | No |

---

## Source Collection

In summary collection, it specifies the collections to be used for source data.

### Meta

- **Aliases**: Source Collection
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It specifies name of the collection whose methods, subobjects, are provided in the current collection for further processing. | Identifier | No | Yes | Collection | No |

---

## Source Fetch

This attribute is used to fetch the required methods from an object of the source collection.

### Meta

- **Aliases**: Source Fetch, Source Native Method
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | List of methods to be fetched. | Identifier | No | Yes | No |

---

## Source PreFetch

This attribute is used to prefetch the required methods into an object of the source collection.

### Meta

- **Aliases**: Source PreFetch, Source Pre Native Method
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | List of methods to be prefetched. | Identifier | No | Yes | No |

---

## Source Var

It evaluates the value based on the source object.

### Meta

- **Aliases**: Source Var
- **Type**: Variable List

### Parameters

_No parameters._

---

## SQL

It is used to access the data from external text file/ODBC table.

### Meta

- **Aliases**: SQL
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Any sql statement ie, a select statement specifying the data to be accessed from external text file etc. | Value | String | Yes | No | No | No |

---

## SQL Parms

If any parameters to be passed on to Tally with the procedure by SQL Query should be declared by the attribute SQLParms. The parameters names within TDL should be declared as System Variables with specific Data Types.

### Meta

- **Aliases**: SQL Parms
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | To specify the parameter name to be passed on to the Tally. | Identifier | No | Yes | Variable | No |

---

## SQLValues

This attribute is used to declare the matrix of values that will get retuned from the an SQL Procedure.

### Meta

- **Aliases**: SQLValues
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | Name of the Column specified in SQL procedure which is returned. | Value | Yes | No | No |
| 2 | The value which is returned to the corresponding Column. | Value | No | No | No |

---

## Style

This attribute allows changing the font style of column values in a Table.

### Meta

- **Aliases**: Style
- **Type**: Dual List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | An expression that evaluates to name of style definition. | Identifier |  | Yes | No | Style | No |
| 2 | Applies the Font Style to the Table Items whose result of expression defined yields an Yes. | Value | Logical | No | No |  | No |

---

## Sub Title

It  gives title for each columns in the table.

### Meta

- **Aliases**: Sub Title
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | Title for the column. | Value | String | Yes | No | No |

---

## Switch

'Switch' attribute is similar to the Option attribute but reduces code complexity and improves the performance. The Switch are grouped using a label Once a condition is satisfied from one group, switch won't  check further conditions from the same group.  It will evaluate the conditions from the other groups specified, if any.

### Meta

- **Aliases**: Switch
- **Type**: Triple List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | This can be any string combination used to group. | Identifier |  | Yes | Yes |  | No |
| 2 | This name must be of  same definition type in which the switch modifier is used. | Identifier |  | Yes | Yes | Collection | No |
| 3 | This name must be of  same definition type in which the switch modifier is used. | Value | Logical | No | No |  | No |

---

## Table Sort

This attribute enables the sorting of the table columns based on their data types. You can specify a method, function, or formula for sorting.

### Meta

- **Aliases**: Table Sort
- **Type**: Single List
- **Is Discrete**: Yes

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | Specify the method name on which table sorting should be performed. | Value | Yes | No | No |

---

## Table Text Compare

This attribute is used to specify the comparison function during the sorting of columns.

### Meta

- **Aliases**: Table Text Compare
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Keyword Set | Keywords | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Sorting comparison keyword (Default, Exact Compare, Ignore Case). | Keyword | Yes | Yes | No | Compare Type | Default, Exact Compare, Ignore Case | No |

---

## Title

Specifies the Title for the Collection.

### Meta

- **Aliases**: Title
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Expression to specify the title for the collection. | Value | String | No | No | No | No |

---

## Transaction Type

This attribute will be used to select link masters which has a specific transaction type

### Meta

- **Aliases**: Transaction Type
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Dimension Expression |
|---| --- | --- | --- | --- | --- |
| 1 | It specifies the actual transaction type | Value | Yes | No | No |

---

## Trigger

Triggers a report from collection and triggered report will work on selected object by user  in collection.

### Meta

- **Aliases**: Trigger
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of Report to be triggered. | Identifier | No | Yes | No | Report | No |

---

## Type

It is used to specify the type of objects the collection  Holds.

### Meta

- **Aliases**: Type
- **Type**: Dual

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is name of object for which collection is build. | Value | Yes | Yes | No | No |
| 2 | This attribute will be used in case of he object type of collection is a transaction/voucher .This attribute is used in two ways if we want to gather collection of main object with combination of other object. Like,if we required to collect vouchers of cost center then main object is Voucher and sub object is cost center. In this case we need to provide cost center name in child of attribute. | Value | No | Yes | No | No |

---

## Unique

It is used to control the display of unique values in the table for a specified method based on the values selected from the table previously in a field. The display of values is changed dynamically based on the field value.

### Meta

- **Aliases**: Unique
- **Type**: Triple

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Separator Char | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | It is a table object method whose value is uniquely displayed in the table. | Value | Yes | No | No |  | No |
| 2 | It is a field object method whose value is uniquely displayed in the table. | Value | No | No | No | ',' | No |
| 3 | It is a field object method whose value is uniquely displayed in the table. | Value | No | No | No | ',' | No |

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
| 1 | It acts as label for grouping. | Identifier | Yes | Yes | Collection | No |

---

## Variable

Specifies the Variable name that holds the object selected by user to supply triggered report.

### Meta

- **Aliases**: Variable, Variables
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Is List | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the variable which holds the object selected by user to supply trigger report. | Identifier | No | Yes | No | Variable | No |

---

## Walk

Walk allows specifying further elements to walk on the source and can be specified to any depth for within the source object.

### Meta

- **Aliases**: Walk
- **Type**: Single List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- |
| 1 | It is the name of the Sub Objects/ Sub Collection, whose methods are required in the current collection. | Identifier | No | Yes | Collection | No |

---

## WalkEx

WalkEx allows the specification of multiple walks on the same source object.

### Meta

- **Aliases**: WalkEx
- **Type**: Dual List
- **Is Discrete**: No

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Refers To | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Specifies the collection descriptions that contain the walk specifications to use. | Identifier |  | No | Yes | Collection | No |
| 2 | It specifies the condition to determine if walk needs to be executed. | Value | Logical | No | No |  | No |

---

## XSLT

The attribute XSLT is used to transforming XML document received from an external source to another XML document.

### Meta

- **Aliases**: XSLT
- **Type**: Single

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Is Constant | Is List | Dimension Expression |
|---| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name of the XSLT file name. | Value | String | Yes | No | No | No |

---
