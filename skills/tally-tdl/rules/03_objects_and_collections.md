# Objects, Collections, and Internal Object Structure

TDL is completely an object-oriented language. Whether it is creating an interface or storing some information in the Tally database, the fundamental artifact is an Object. All the interfaces and data storing elements are objects.

## Objects
Any information that is stored in a computer is referred to as data. All information related to an entity is referred to as an object. For example, an employee is an entity bearing properties like Employee Code, Employee Name, Salary, and so on. Each entity contains its own set of values for these attributes.

In order to store and manipulate this information, we need procedures (methods) that operate on data. Data and methods combined together are referred to as an Object. Objects are persisted or stored in the database. 

### Tally Object Structure
By design, the Tally database is hierarchical in nature (objects are stored in a tree-like structure).
Each node in the tree can be a tree in itself. In this structure, a parent can have multiple children but every child can have only one parent. All the characteristics of a child are inherited from its parent and no child can exist without a parent.

Multiple objects are collectively referred to as a **Collection**. In other words, a collection contains multiple objects where an object can further contain methods and collections.
- **Methods** are used to retrieve stored values.
- **Collection** consists of further objects.

Whether it is an interface that is to be created or data that needs to be persisted into the Tally database, the object follows a hierarchical structure. 

Let us understand the database object structure with an example of a `Ledger` object:
- `Ledger` is the Base/Primary object.
- This object has methods `Name`, `Parent`, `Opening Balance`, and a collection of secondary objects `Ledger Bill Allocations`.
- The collection `Ledger Bill Allocations` can further contain multiple opening bills.
- Each bill allocation object further has methods: `Name`, `Bill Date`, `Bill Due Date`, and `Bill Amount`. 

### Object Types

#### 1. Interface Objects
Objects that are used for rendering the user interface. The `Report`, `Form`, `Part`, `Line`, `Field`, `Menu`, `Table`, and `Button` are Interface objects. 
- Independent items: `Report` and `Menu` can exist on their own.
- Dependent items: `Form`, `Part`, `Line`, `Table`, and `Field` come into existence only when they are contained by their parent in the interface object hierarchy chain.

#### 2. Data Objects
A data object is a region of storage that contains a value or group of values. Every interface object is associated with a data object to perform operations.
Data objects can be:
- **Internal Objects**: Provided by the platform, stored as a part of the Tally database, and can be manipulated by the Tally user (e.g., Company, Group, Ledger, Stock Group, Stock item, Voucher Type, Cost Category, Cost Centre).
- **TDL/External Objects**: Used for intermediate data manipulations and temporary storage. Cannot be stored in the Tally database.
  - **Static objects**: Hardcoded in the TDL code and used for specific purposes like accepting inputs. Cannot be altered by the Tally user.
  - **Dynamic objects**: Temporary objects created in memory. The source can be ODBC, XML, DLL, etc.

## Collections
The fundamental data gathering and processing element of TDL is the collection definition. A collection is a group of objects/collections. 

**Syntax:**
```tdl
[Collection: <Collection Name>]
```
Where `<Collection Name>` is the identifier assigned to the desired collection of objects.

### Types of Collections
- **Simple Collections**: Contains multiple objects which contain a single method and zero sub-collections. (e.g., Names, Addresses).
- **Compound Collections**: Contains multiple objects containing multiple methods and sub-collections. (e.g., Ledgers, Stock items).

---

## Populating a Collection

### Using Internal Objects
Internal objects are populated using the attribute `Type`.

**Syntax:**
```tdl
[Collection: <Collection Name>]
Type : <Object Type>:[<Parent Type>]
```
- `<Object Type>`: Name of the primary object or sub-type.
- `<Parent Type>`: Name of the parent object of the sub-type (optional, required if object-type is a sub-collection type).

If both are specified and the current object context does not belong to the parent type, the attribute `Child Of` is mandatory.

**Example 1: Primary Objects**
```tdl
[Collection: LedgerList]
Type : Ledger
```

**Example 2: Sub Objects**
```tdl
[Collection: Ledger Vouchers]
Type     : Vouchers : Ledger
Child Of : ##LedgerName
```

### Using External Objects

#### Static Objects
Created by hardcoding values using attributes like `List Name` or `Object`.

**Collection Attribute – List Name**
Used when field input needs to be limited to a given Table or List.
```tdl
[Collection: NameOfCourses]
List Name : BCom, BBM, BA, BCA, BSc
```

**Collection Attribute – Object**
Creates a collection using user-defined TDL objects.
```tdl
[Collection : CourseDetails]
Objects : Course1, Course2, Course3
Format  : $CourseName, 30

[Object : Course1]
CourseName: "BCom"
Duration  : "3 Years"

[Object : Course2]
CourseName: "Bsc"
Duration  : "3 Years"

[Object : Course3]
CourseName: "BBM"
Duration  : "4 Years"
```

#### Dynamic Objects
Created dynamically from external sources like HTTP, XML, DLL, ODBC, XML File, variables, current/parent reports, or a directory.

**1. Using an In-Memory Object**
```tdl
[Collection: Coll Customer]
New Object : Customer Data

[Object: Customer Data]
Storage    : Name : String
Storage    : CustId : String
```

**2. Using HTTP/HTTPS – XML Objects**
```tdl
[Collection: <Collection Name> ]
Remote URL        : <HTTP/HTTPS URL Address>
Remote Request    : <Request-Report-Name> , <Pre-Request-Edit-Report> : <Encoding Type>
XML Object Path   : <Start-node> : <Path-to-start-node>
XML Object        : <TDL-Object-Name>
```

**3. Using an SQL Object from an ODBC Source**
```tdl
[Collection: <Collection Name>]
ODBC      : <ODBC Driver Connection Strings; File Path>
SQL       : <SQL Select Query>
SQLObject : <TDL-Object-Name>
```

**4. Using Various Data Sources**
The attribute `Data Source` accepts the Type and Identity.
**Syntax:** `DataSource : <Type> : <Identity>: [<Encoding>]`

- `File XML`, `HTTP XML`
- `File JSON`, `HTTP JSON`
- `ODBC`
- `Report`, `Parent Report` (Scope: `Selected Lines`, `UnSelected Lines`, `Current Line`, `All Lines`, etc.)
- `DLL` (Type: `Plugin XML` or `AxPlugin XML`)
- `Variable`
- `Directory`

**Example: JSON via HTTP**
```tdl
[Collection: TSPLGetBranchesColl]
Data Source      : HTTP JSON: "http://localhost/HttpJson/getbranchlist.php"
JSON Object Path : "BranchName:1"
```

---

## Object Association
Object association links an Interface Object with one or more Data Objects. If an Interface object is not explicitly associated, an `Anonymous Object` (no methods/collections/parameters) is associated with it. 

### Report Level Object Association
```tdl
Object : <ObjectType> [: <Object Identifier Formula>]
```
**Example:**
```tdl
[Report: Sample Report]
Object : Ledger : "Cash"
```

### Part Level Object Association
Parts inherit objects from the Report/Part/Line. To override:

**Method 1: Object Attribute**
```tdl
Object : <SupplierCollection> : <SeekTypeKeyword> [: <SeekCondition>]
```
```tdl
[Part : Sample Part]
Line   : Sample Line
Object : InventoryEntries:First:@@StkNameFilter
```

**Method 2: ObjectEx Attribute**
Allows primary object association with dotted notation.
```tdl
Object Ex : <Method Formula Syntax>
```
```tdl
[Part : Sample Part]
Object Ex : (Ledger,"Customer").BillAllocations[1, @@Condition1]
```

### Line Level Object Association
Uses the Part attribute `Repeat` to iterate.
**Syntax:**
```tdl
Repeat : <Line Name> : <Collection Name> : [<Supplier Collection> : <SeekTypeKeyword> : <SeekCondition>]
```
OR Using Method Formula Syntax:
```tdl
Repeat : <Line Name> : <MethodFormulaSyntax>
```
**Example:**
```tdl
[Part : Sample Part]
Line   : Sample Line
Repeat : Sample Line : (Ledger, "Customer").BillAllocations
```

### Field Level Object Association
Inherits from the Parent line/field. Explicit object specification acts as the Secondary Context Object during formula evaluation.

---

## Methods
Methods retrieve values from objects. The storage name is prefixed with `$` symbol.

**Types:**
- **Internal Methods:** Defined by the platform (e.g., `$Name`, `$Parent`).
- **External Methods:** User-defined methods in TDL.

### Accessing Methods
**1. From Current Object:**
```tdl
$<MethodName>
```

**2. By Reference:**
```tdl
$<Method Name> : <Object Name>:<formula>
```
Example: `$Name : Ledger : ##SVLedgerName`

**3. Using Index:**
```tdl
$<Method Name> : <Collection Name> : <Seek Type>
```
Example: `$LedgerName : LedgerEntries:First`

**4. Directly From Any Object (Dotted Notation):**
```tdl
$<PrimaryObjectSpec>.<SubObjectPathSpec>.<MethodName>
```
- `<PrimaryObjectSpec>`: `(<Primary Object Type Keyword>, <Primary Object Identifier Formula>)`
- `<SubObjectPathSpec>`: `CollectionName[<Index Formula>, [<Condition>]]`

Example:
```tdl
$(Ledger,@@PartyLedger).BillAllocations[1].OpeningBalance
```

---

## Collection Capabilities

### Fetching Methods
It is mandatory to fetch the internal methods required from the object.
**Attribute – Fetch**
```tdl
Fetch : Date, Narration
Fetch : ?   ;; All methods of the object in context
Fetch : *   ;; All methods and sub-collections of the object
```

**Attribute – Fetch Object** (Report/Form/Field/Function level)
```tdl
Fetch Object : <Object Type> : <Expression>: <List of methods>
```

**Function – $$FetchSeparator**
Used for separating multiple object names.
```tdl
Fetch Object: Ledger: "Debtor North" + $$FetchSeparator + "Debtor South": Name, Parent
```

**Attribute – Compute**
Computes external methods for each object in the collection.
```tdl
Compute : VchDate : $Date
```

### Union and Looping
Union combines multiple Collections.
**Syntax:**
```tdl
Collection : <List of Data Collections>
```
Looping repeats a data collection over each object of a loop collection.
**Syntax:**
```tdl
Collection : <List of Data Collection>:[<Loop Collection Name>[:<Condition for Loop Collection>]]
```

### Filtering
Used to retrieve specific objects.
- **Child Of**: Retrieves objects whose direct parent is the specified parameter. `Child Of : $$GroupSundryDebtors`
- **Belongs To**: Determines whether to include all lower-level objects or just the first level. `Belongs To : Yes`
- **Filter**: Takes a system formula for condition-based filtering. `Filter : NameFilter`

### Sorting
**Attribute – Sort**
```tdl
Sort : <Sort Name> : <List of Expressions>
```
Prefix the method name with `-` for descending order.
Example: `Sort : Default : $ClosingBalance, -$Name`

### Searching (Indexing)
**Attribute – Search Key**
Indexes objects based on method(s) for instant access.
```tdl
Search Key : $Name
```
Access via function: `$$CollectionFieldByKey : <Method Name> : <Key Formula> : <Collection Name>`

---

## Advanced Capabilities

### Extraction and Chaining
**Function – $$CollectionField**
Gets the value of an expression applied on the nth object of a collection.
```tdl
$$CollectionField:<ValueExpression>:<PositionNumber>:<CollectionName>
```

### Grouping & Aggregation
Allows you to walk down object hierarchies and gather values.
- **Source Collection:** Specifies the base collection.
- **Walk:** Traverses the sub-objects hierarchy. `Walk : Inventory Entries, Batch Allocations`
- **By:** Specifies the grouping criteria. `By : StockItemName : $StockItemName`
- **Aggr Compute:** Performs aggregation operations (`Sum`, `Max`, `Min`). `Aggr Compute : TotBilledQty : Sum : $BilledQty`

**Aggregation Functions:**
- `$$CollAmtTotal : <CollectionName> : <ValueExpression>`
- `$$CollQtyTotal : <CollectionName> : <ValueExpression>`
- `$$CollNumTotal : <CollectionName> : <ValueExpression>`

### WalkEx Approach (Performance Optimization)
`WalkEx` specifies a collection list where walk paths are traversed in a single pass, massively improving performance compared to Union Collections with duplicate Walk passes.
```tdl
[Collection: Union LedStk Vouchers]
Source Collection : VoucherSource
WalkEx            : Ledger Details, StockItem Details
Keep Source       : ().
```

### HTTP XML/JSON Remoting & Request Headers
Collections can fetch from or POST to HTTP servers.

**Attribute – Export Header**
Allows sending HTTP headers for requests.
```tdl
[Collection: <Collection Name>]
Export Header: <String Expression>
Remote URL   : <Target URL>
```
For POST, you can specify `RemoteRequest` to build the request body.

### Variable Attributes for Collections
- **Source Var:** Evaluates the variable based on the source object.
- **Compute Var:** Evaluates the variable based on the sub-object of the source object.
- **Filter Var:** Evaluates the variable based on the filtered objects available after `Fetch` and `Compute`.

**Sequence of Evaluation:**
1. Source Collection
2. Source Var
3. Walk
4. Compute Var
5. By
6. Aggr Compute
7. Compute
8. Filter Var
9. Filter

### Dynamic Object Support
Allows defining the type of object added to a collection on-the-fly.
```tdl
NEWOBJECT : <type-of-object> : <condition>
```
