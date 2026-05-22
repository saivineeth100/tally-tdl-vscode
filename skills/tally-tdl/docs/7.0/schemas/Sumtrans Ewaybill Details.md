# Sumtrans Ewaybill Details Schema

> **Version**: 7.0

Reference documentation for the **Sumtrans Ewaybill Details** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 43

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Sumvch Bill Date** | No | No | Date |
| **Sumvch Bill Number** | No | No | String |
| **Sumvch Bill Status** | No | No | String |
| **Sumvch Cancel Code** | No | No | String |
| **Sumvch Cancel Reason** | No | No | String |
| **Sumvch Canceldate** | No | No | DateTime |
| **Sumvch Consignee Address** | No | Yes | String |
| **Sumvch Consignee Address Type** | No | No | String |
| **Sumvch Consignee Name** | No | No | String |
| **Sumvch Consignee Place** | No | No | String |
| **Sumvch Consigneegstin** | No | No | String |
| **Sumvch Consigneepincode** | No | No | String |
| **Sumvch Consigneestatename** | No | No | String |
| **Sumvch Consignor Address** | No | Yes | String |
| **Sumvch Consignor Address Type** | No | No | String |
| **Sumvch Consignor Gstin** | No | No | String |
| **Sumvch Consignor Name** | No | No | String |
| **Sumvch Consignor Pincode** | No | No | String |
| **Sumvch Consignor Place** | No | No | String |
| **Sumvch Consignor Statename** | No | No | String |
| **Sumvch Consolidated Bill Date** | No | No | Date |
| **Sumvch Consolidated Bill Number** | No | No | String |
| **Sumvch Document Type** | No | No | String |
| **Sumvch Extension Details** | Yes | No | [Sumtrans Eway Extension Details](Sumtrans%20Eway%20Extension%20Details.md) |
| **Sumvch Generatedon** | No | No | Date |
| **Sumvch Ignore Generation Validation** | No | No | Logical |
| **Sumvch Ignoregstinvalidation** | No | No | Logical |
| **Sumvch Intrastate Applicability** | No | No | Logical |
| **Sumvch Irpsource** | No | No | String |
| **Sumvch Is Cancelled** | No | No | Logical |
| **Sumvch Is Exported For Generation** | No | No | Logical |
| **Sumvch Iscancelpending** | No | No | Logical |
| **Sumvch Multivehicledetails** | Yes | No | [Sumtrans Multivehicle Details](Sumtrans%20Multivehicle%20Details.md) |
| **Sumvch Shippedfromstate** | No | No | String |
| **Sumvch Shippedtostate** | No | No | String |
| **Sumvch State Wise Threshold** | Yes | No | [Sumtrans State Wise Threshold](Sumtrans%20State%20Wise%20Threshold.md) |
| **Sumvch Subtype** | No | No | String |
| **Sumvch Threshold Limit** | No | No | Amount |
| **Sumvch Threshold Limit Includes** | No | No | String (Sysname) |
| **Sumvch Transport Details** | Yes | No | [Sumtrans Transporter Details](Sumtrans%20Transporter%20Details.md) |
| **Sumvch Updateddate** | No | No | DateTime |
| **Sumvch Validity** | No | No | String |
| **Sumvch Validupto** | No | No | DateTime |
