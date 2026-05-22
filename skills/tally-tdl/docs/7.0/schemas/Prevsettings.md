# Prevsettings Schema

> **Version**: 7.0

Reference documentation for the **Prevsettings** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 16

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Allowrecvlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Allowsendlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Disallowrecvlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Disallowsendlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Recvdata** | No | No | Logical |
| **Remignorevchnumbering** | No | No | Logical |
| **Remoteenabledonewaysync** | No | No | Logical |
| **Remoteignoremodvtmasters** | No | No | Logical |
| **Remoteoverridevchbankmanualstatus** | No | No | String (Sysname) |
| **Remoteupdmoditemopbal** | No | No | Logical |
| **Remoteupdmodledopbal** | No | No | Logical |
| **Senddata** | No | No | Logical |
| **Serverisremotealter** | No | No | Logical |
