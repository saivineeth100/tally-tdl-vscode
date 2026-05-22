# Ewaybill Details Schema

> **Version**: 7.0

Reference documentation for the **Ewaybill Details** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 43

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Bill Date** | No | No | Date |
| **Bill Number** | No | No | String |
| **Bill Status** | No | No | String |
| **Cancel Code** | No | No | String |
| **Cancel Reason** | No | No | String |
| **Canceldate** | No | No | DateTime |
| **Consignee Address** | No | Yes | String |
| **Consignee Address Type** | No | No | String |
| **Consignee Name** | No | No | String |
| **Consignee Place** | No | No | String |
| **Consigneegstin** | No | No | String |
| **Consigneepincode** | No | No | String |
| **Consigneestatename** | No | No | String |
| **Consignor Address** | No | Yes | String |
| **Consignor Address Type** | No | No | String |
| **Consignor Gstin** | No | No | String |
| **Consignor Name** | No | No | String |
| **Consignor Pincode** | No | No | String |
| **Consignor Place** | No | No | String |
| **Consignor Statename** | No | No | String |
| **Consolidated Bill Date** | No | No | Date |
| **Consolidated Bill Number** | No | No | String |
| **Documenttype** | No | No | String |
| **Extension Details** | Yes | No | [Eway Extension Details](Eway%20Extension%20Details.md) |
| **Generatedon** | No | No | Date |
| **Ignore Generation Validation** | No | No | Logical |
| **Ignoregstinvalidation** | No | No | Logical |
| **Intrastate Applicability** | No | No | Logical |
| **Irpsource** | No | No | String |
| **Is Cancelled** | No | No | Logical |
| **Is Exported For Generation** | No | No | Logical |
| **Iscancelpending** | No | No | Logical |
| **Multivehicle Details** | Yes | No | [Multivehicle Details](Multivehicle%20Details.md) |
| **Shippedfromstate** | No | No | String |
| **Shippedtostate** | No | No | String |
| **State Wise Threshold** | Yes | No | [State Wise Threshold](State%20Wise%20Threshold.md) |
| **Subtype** | No | No | String |
| **Threshold Limit** | No | No | Amount |
| **Threshold Limit Includes** | No | No | String (Sysname) |
| **Transport Details** | Yes | No | [Transporter Details](Transporter%20Details.md) |
| **Updateddate** | No | No | DateTime |
| **Validity** | No | No | String |
| **Validupto** | No | No | DateTime |
