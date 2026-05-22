# License Function

> **Version**: 7.0

Reference documentation for all entries in the **License** function.

> **Total Entries**: 11

## Table of Contents

- [CliSrvBoth](#clisrvboth)
- [CliSrvPort](#clisrvport)
- [CurrentLicStatus](#currentlicstatus)
- [IsGlobalTallyAuditOn](#isglobaltallyauditon)
- [IsPromoCode](#ispromocode)
- [IsTallyAuditOn](#istallyauditon)
- [IsTallyClient](#istallyclient)
- [IsTallyServer](#istallyserver)
- [IsValidAddOnHelpFileExists](#isvalidaddonhelpfileexists)
- [IsValidEMail](#isvalidemail)
- [IsValidGateway](#isvalidgateway)

---

## CliSrvBoth

This function returns application behavoiour (client,Server or Both).

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## CliSrvPort

This function returns application behaviour port.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## CurrentLicStatus

This function returns Number denoting current license status.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

_No parameters._

---

## IsGlobalTallyAuditOn

This function returns True if the Tally audit on feature is set in any of the loaded companies.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsPromoCode

This function is used to check whether the entered information at the time of activation is promocode or serail number.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is a String expression, which specifies the Serial number or Promotional code. | Value | String | Yes | No |

---

## IsTallyAuditOn

This function returns True if the Tally audit on feature is set in the selected company.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 0
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- |
| 1 | This can be any valid TDL expression. | Value | No | No |

---

## IsTallyClient

This function returns TRUE if it is configured as a Tally Client either direct IP to IP or through Link tally server else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsTallyServer

This function returns TRUE if it is configured as a Tally Server either direct IP to IP or through Link tally server else returns FALSE.

### Meta

- **Total Parameters**: 0
- **Total Mandatory Parameters**: 0
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

_No parameters._

---

## IsValidAddOnHelpFileExists

This function checks whether user specified AddOn help file is valid and exists. It returns 0 in case of Success, 1 in case Old version of Help file exists and 2 in case of File not exists.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Long

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | AddOn GUID. | Value | String | Yes | No |

---

## IsValidEMail

This function is used to check whether the entered EMail is valid or not.

### Meta

- **Total Parameters**: 1
- **Total Mandatory Parameters**: 1
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | This parameter is a String expression to specify the email. | Value | String | Yes | No |

---

## IsValidGateway

The function is used to know whether given port number and gateway name(or IP)  is valid gateway or not

### Meta

- **Total Parameters**: 2
- **Total Mandatory Parameters**: 2
- **Category**: License
- **Execution Mode**: Client
- **Return Type**: Logical

### Parameters

| # | Description | Parameter Type | Datatype | Is Mandatory | Variable Argument |
|---| --- | --- | --- | --- | --- |
| 1 | To specify Gateway IP or Name. | Value | String | Yes | No |
| 2 | To specify Gateway IP or Name. | Value | String | Yes | No |

---
