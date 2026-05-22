# Variables in TDL

Variables in TDL (Tally Definition Language) are entities which can hold values during the execution of a program. The values of these variables are initialized when they are created and can change during the entire execution of the program. Variables are context-free structures which do not require any specific object context for manipulation. They are declared by name and can be operated using the same name. It is also possible to access and operate variables declared at the parent scope.

Variables are lightweight data structures capable of storing multiple values of the same type or different types. They support various manipulation operations like insert, update, delete, sort, and find.

## Types of Variables

A variable can hold a single value, or more than one value of the same type or different types. It can be declared at various scopes such as Report, Function, and System Level.

1. **Simple Variable**: Allows the storage of a single value of the specified data type.
2. **Simple Repeat Variable**: Can hold method values of multiple objects of a collection based on an implicit index. This concept is used in Columnar Reports only, where the lines should be repeated vertically and the fields should be repeated horizontally.
3. **Compound Variable**: Allows storing values of different data types by making the variable itself compound (i.e., allowing Variable declaration inside itself). These sub-variables are called member variables. A member variable can be a single instance or a list variable. It can also be a compound variable, creating a hierarchy. Conceptually, a Compound Variable is similar to an Object.
4. **List Variable**: A container variable that holds multiple variables (simple or compound). Each of these is called an Element Variable. Element Variables hold a value as well as a key, if specified.
   - **Simple List Variable**: Holds multiple values of a single data type.
   - **Compound List Variable**: Holds multiple values of different data types.

---

## Variable Definition and Its Attributes

A Variable definition specifies the behavior of the variable. 

### Syntax
```tdl
[Variable : <Variable Name>]
    Attribute : Value
```
Where `<Variable Name>` is the name of the variable.

### Attribute – TYPE
Determines the data type (e.g., String, Number, Date). If absent, it assumes `String` by default.
```tdl
[Variable : GroupNameVar]
    Type : String
```

### Attribute – DEFAULT
Specifies the initial/default value for all instances of the variable (at any scope).
```tdl
[Variable : GroupNameVar]
    Type    : String
    Default : $$LocaleString:"SundryDebtors"
```

### Attribute – VOLATILE
Set to `Yes` by default. If `Yes`, a variable declared in a called Report/Function will assume the last value from the caller's scope (parent scope). Variables defined at the function level are Non-Volatile by default.
```tdl
[Variable : GroupNameVar]
    Type     : String
    Volatile : Yes
```

### Attribute – PERSISTENT
Decides retention periodicity. Setting `Persistent` to `Yes` retains the value across application sessions in `TallySav.Cfg`. Only variables declared at the system scope can be persisted.
```tdl
[Variable : SV Backup Path]
    Type       : String
    Persistent : Yes
```

### Attribute – REPEAT
Used in Columnar Reports. Accepts a Collection name and an optional Method name. Extracts method values from each object of the collection based on an implicit index.
```tdl
[Variable : SVCurrentCompany]
    Volatile : Yes
    Repeat   : ##DSPRepeatCollection
```

### Attribute – VARIABLE
Defines member variables (Simple/Compound) for a Compound Variable. Data Type and Value can be specified (inline declaration) for Simple Variables.
```tdl
[Variable : CLV Emp]
    Variable : Name : String
    Variable : Age  : Number : 25
    Variable : Relatives
```

### Attribute – LIST VARIABLE
Specifies a list of Simple/Compound Variables.
```tdl
[Variable : CLV Emp]
    List Variable : City      : String : 3
    List Variable : Relatives
```

---

## Variable Declaration and Scope

### System Scope Declaration
Started when the application begins, available everywhere.
```tdl
[System : Variable]
    Variable Name : <Initial Value>
    ;; OR
    Variable : <Variable Names> : [<Data Type> : [<Value>]]
    ;; OR
    List Variable : <Variable Names> : [<Data Type> : [<Value>]]
    ;; OR
    Variable : <Instance Names> : [<Variable Name>]
```

### Report Scope Declaration
Exist for the life of the report. The variables are accessible from the report and all elements executed within it. Report variables can be initialized using `SET` and `PRINT SET`.
```tdl
[Report : Balance Sheet]
    Variable : Explode Flag
```

### Function Scope Declaration
Variables declared within User Defined Functions (UDF). Exist until the function ends. They never inherit values from the parent context (Volatile has no effect). Allows `STATIC` variables, which act like System variables but are accessed only within the function (List variables are not supported as Static).
```tdl
[Function : Sample Function]
    Static Variable : Sample Static Var : Number
```

### Inline Declaration
Variables can be defined during declaration itself (limited behavior). Only Data Type and Default Value can be specified. If Data Type is omitted or is a variable name, it's treated as a pre-defined variable.
*Note: Inline variables at system scope cannot be persisted. Compound List Variables cannot be declared inline.*
```tdl
[Report : Cust Group Report]
    Variable : VarGroupName1, VarGroupName2 : String : "Sundry Debtors"
```
```tdl
[System : Variable]
    List Variable : VarGroupName1, VarGroupName2 : String : 10
```

### Field Acting as a Variable
A Field can act as a simple variable, inheriting the data type from the field itself.
```tdl
[Field : Employee Name]
    Variable : EmpNameVar
```

### Definition Name and Instance Name Differentiation
Allows creating multiple variable instances of a compound structure without duplicating the definition.
```tdl
[Report : Employee Report]
    Variable : Prem : Employee
    Variable : Ramesh : Employee
    Local : Variable : Ramesh : Add : Variable : EmpID : String
```

---

## Using Modifiers with Variables

Variables allow static modifiers (Add, Delete, Change) and dynamic modifiers (Local).

### Static Modification
```tdl
[#Variable : SV From Date]
    Delete : Default
```

### Locally Modifying Variables
Allows reusing a compound structure and modifying it locally in a report.
```tdl
[Report : Employee Report2]
    Variable : CLV EMP
    Local : Variable : CLV EMP : Add : Variable : Qualification : String
    Local : Variable : CLV EMP : Delete : Variable : Age
```
```tdl
[Variable : CLVEMP]
    Variable : Contact Address
    Local : Variable : Contact Address : Add : Variable : State : String
```

---

## List Variable Manipulations

List variables can hold multiple values using a **Key** (default type String) or an **Index** (integer based, generated internally). The variable path can be specified using **Dotted Notation Syntax**.

### Variable Path Specification
```tdl
<Element Variable>.<Member Variable>.<Simple Member>
```
Example: `##CLVEMP[2].Relatives[1].age`

### Scope Specification in Variable Dotted Syntax
- `..` (Double Dot) denotes owner scope.
- `...` (Triple Dot) denotes owner's owner scope.
- `().` denotes system scope.
- `(<Definition Type>, <Definition Name Expression>).` for absolute scope.

Example:
```tdl
##..TSPLSMPScopeVar
##().TSPLSMPScopeVar
##(Function,"TSPLSMP ScopeSpec").TSPLSMPScopeVar
```

---

### Adding/Deleting/Expanding Elements

#### LIST ADD (Aliases: LIST APPEND, LIST SET)
Adds an element to the list based on KEY. Key is mandatory. Overwrites if key exists.
```tdl
LIST ADD : SLV Emp : "E001" : "Kumar"
LIST ADD : CLVEmp : "E001" : 25 : Age
```

#### LIST ADD EX (Alias: LIST APPENDEX)
Adds an element to the list WITHOUT a key.
```tdl
LIST ADD EX : SLV Emp : "Kumar"
LIST ADDEX  : CLV Emp : 25 : Age
```

#### LIST DELETE (Alias: LIST REMOVE)
Deletes an element from the list based on Key. If key is missing, deletes all elements.
```tdl
LIST DELETE : SLV Emp : "E001"
```

#### LIST DELETE EX (Alias: LIST REMOVE EX)
Deletes an element from the list based on Index. Negative index denotes reverse position. If index is missing, deletes all elements.
```tdl
LIST DELETE EX : CLVEmp : 10
```

#### LIST EXPAND
Creates the specified number of blank elements (without key) and inserts them into the list.
```tdl
LIST EXPAND : CLVEMP[1].Relatives : 10
```

---

### Value Specifications

#### SET / PRINT SET (At Report & Form Level)
```tdl
SET      : CLVEMP[1].Name : "Kumar"
PRINTSET : CLVEMP[1].Name : "Kumar"
```

#### SET (At Function Level)
Updates simple variables. For compound variables, sets the first member variable. For list variables, value is treated as a count to expand the list.
```tdl
SET : CLVEMP[1].Name: "Kumar"
```

#### MULTI SET
Sets the values of compound member variables in one call.
```tdl
MULTI SET : CLVEMP[1] : Name : "Vimal", Age : 26, Salary : ($$AsAmount:10000)
```

#### EXCHANGE
Swaps the values of two variables of the same data type.
```tdl
EXCHANGE : EmpVarOld : EmpVarNew
EXCHANGE : EMP Salary : CLVEmp[1].Salary
```

#### INCREMENT / DECREMENT
Special actions in `Function` scope to increment/decrement Number variables. By default increments/decrements by 1.
```tdl
INCREMENT : Counter : 2
DECREMENT : Counter : 1
```

#### Value Modification at Field Level (MODIFIES)
Field attribute `Modifies` sets the variable value using the keyed-in field value.
```tdl
[Field : EMP Age]
    Modifies : EMPAgeVar : Yes
```

---

### Retrieving Value from List

#### `$$ListValue`
Retrieves the value of an element in the list for a given Key.
```tdl
$$ListValue : CLVEmp : ##KeyVar : Age
```

#### `$$ListValueEx`
Retrieves the value of an element at the specified Index.
```tdl
$$ListValueEx : CLVEmp : ##IndexVar : Age
```

#### `##` Operator
Index-based retrieval using the `##` operator with dotted syntax. Returns the first member value for a compound variable without a path. On a list variable, returns the number of items.
```tdl
LOG : ##CLVEmp[2].Relatives[1].Name
```

---

### Looping Construct
#### `FOR IN` (Alias: `FOR EACH`)
Iterates over values in a list variable. Only elements with a Key are walked. Iterator variable holds the key value.
```tdl
FOR IN : KeyVar : CLV Emp
    LOG : $$ListValue:CLVEmp:##KeyVar:Age
END FOR
```

---

### List Variable Specific Functions

- `$$ListKey`: Returns the key for a given index. (`$$ListKey:SLVEMP:2`)
- `$$ListIndex`: Returns the index for a given key. (`$$ListIndex:SLVEMP:E001`)
- `$$ListCount`: Returns the number of items in the list. (`$$ListCount:SLVEMP`)
- `$$ListFind`: Checks if a given key exists (Returns YES/NO). (`$$ListFind:SLVEMP:E001`)
- `$$ListValueFind`: Checks if a given value exists. (`$$ListValueFind:CLVEmp:1:PRIYA:Name`)

---

### Populating a List from a Collection

#### LIST FILL
Fills a list from a collection without a loop. Evaluates key and value formulas in the context of each object.
```tdl
LIST FILL : CLV Emp : Employees : $Name : $Designation : Designation
```

---

### Sorting of List Elements

#### LIST KEY SORT (Alias: LIST SORT)
Sorts list elements based on the key.
```tdl
LIST KEY SORT : SLVEmp : Yes : String ;; Yes = Ascending, No = Descending
```

#### LIST VALUE SORT
Sorts list elements based on the value.
```tdl
LIST VALUE SORT : CLVEmp : Yes : String
```

#### LIST RESET SORT
Resets the sorting method to the insertion order.
```tdl
LIST RESET SORT : SLVEMP
```

---

### Variable Copy

#### COPY VARIABLE
Copies content from one variable to another (Simple, Compound, List).
```tdl
COPY VARIABLE : DestinationVar : SourceVar
```
For Compound/List variables, content is copied from member variables with matching names.

---

### Persistence of Scope Variables

Variables at the Report and System scopes can be persisted into a `.pvf` file and loaded as needed.

#### SAVE VARIABLE
Persists variables in a user-specified file.
```tdl
SAVE VARIABLE : <FileName> [: <Variable List>]
```
- `<Variable List>` is comma-separated. Using `*` saves all variables at the current scope (Report or System) ignoring the `Persist: Yes` flag.
- Dotted notation is allowed to access parent scopes. System scope variable must be prefixed with `().` (e.g., `().SVInMillions`).
```tdl
SAVE VARIABLE : SLReportCfg.pvf : *, ().SVInMillions
```

#### LOAD VARIABLE
Loads variables from a specified file.
```tdl
LOAD VARIABLE : <FileName> [: <Variable List>]
```
- `*` is ignored while loading.
- `Persist` flag of the variable is ignored during load.
```tdl
LOAD VARIABLE : SLReportCfg.pvf : SaveLoadVar1, ().SVInMillions
```

---

### Common Variable Functions

- `$$IsSysNameVar`: Checks if a variable holds a SysName (like 'Not Applicable', 'End of List').
- `$$IsDefaultVar`: Checks if the simple variable value is 'Default' or blank.
- `$$IsActualsVar`: Checks if the simple variable value is Blank, SysName, or 'ACTUALS'.
- `$$IsCurrentVar`: Checks if the simple variable value is Blank, SysName, or 'Stock in hand'.
- `$$ExecVar`: Returns the value of a variable in the parent report chain.
- `$$FieldVar`: Returns the value of the field acting as a variable with the specified name.
- `$$ParentFieldVar`: Gets the field variable value from its parent report.
