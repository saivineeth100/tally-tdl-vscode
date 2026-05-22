# TDL Procedural Capabilities

TDL functions are action statements defined by an application developer. The developer has a complete control over the sequence in which these actions get executed. A TDL function extends the following benefits to the TDL programmer:
- Perform a set of actions sequentially with or without any conditional statements.
- Allow looping and conditional execution of a set of actions.
- Defining once and executing it repetitively passing a different set of parameters.
- Define variables, manipulate and set values in it.
- Work on data elements like getting an object context from the calling UI, changing the context, looping the objects of a collection, reading data from source and setting value in the target object, and so on.
- Creation and manipulations of the existing internal objects.

With the advent of TDL functions, conditional evaluation of statements and looping has been made possible. Functions basically can be used for performing complex calculations or executing a set of actions serially. Functions can accept parameter(s) as input, and return a 'Value' to the caller.

---

## Function Building Blocks

In TDL, a Function is also a definition. It has two blocks:
1. Definition Block
2. Procedural Block

### A Glimpse into the Function

```tdl
[Function : Function Name]
;; Definition Block
;; Parameter Specification
Parameter : Parameter 1 : Datatype
Parameter : Parameter 2 : Datatype

;; Variable Declarations
Variable : Var 1 : Number
Variable : Var 2 : String

;; Explicit Object Association
Object : ObjName : ObjectType

;;Return Value
Returns : Datatype
;;Definition Block Ends here

;;Procedural Block
Label 1 : Statement 1
Label 2 : Statement 2
|
|
Label n : Statement n
;; Procedural Block Ends here
```

---

## Definition Block Attributes

The definition block is utilized for parameter specification, variable declaration, return values, and object context specification.

### Parameter Specification

This implies specifying the list of parameters which are passed by the calling code. The values thus obtained are referred to in the function with these variable names.

**Syntax:**
```tdl
PARAMETER : <Parameter Name> : <Data Type>
```
Where,
- `<Parameter Name>` is the name of the Variable which holds the parameter sent by the caller of the Function.
- `<Data Type>` is the Data type of the Variable sent by the caller of the Function.

**Example:**
```tdl
[Function: FactorialOf]
Parameter : InputNumber : Number
```
The Function `FactorialOf` receives a number as the parameter from the Caller.

**Optional Parameters**
Only the rightmost parameters can be optional. Any parameter from the left or middle cannot be optional. If the parameter value is not supplied, the default value specified within the 'Parameter' attribute is used.

**Syntax for Optional Parameters:**
```tdl
Parameter : <Mandatory Parameter1> : <Data Type1>
Parameter : <Mandatory Parameter2> : <Data Type2>
Parameter : <Optional Parameter1> : <Data Type3> [: Parameter Value]
Parameter : <Optional Parameter2> : <Data Type4> [: Parameter Value]
```

**Example:**
```tdl
[Function : Split VchNo]
;; Returns the number part of voucher number from a string
Parameter : pVchNo : String
Parameter : pSplitChar : String : "/"
00 : FOR TOKEN : TokenVar : ##pVchNo : ##pSplitChar
10 : IF        : $$LoopIndex = 2
20 : RETURN    : ##TokenVar
30 : ENDIF
40 : END FOR
```
Here, the 2nd parameter `pSplitChar` is optional with a default value of `/`.

### Variable Declaration

Variables required for intermediate calculations within a function. They lose their value after exiting the function.

**Syntax:**
```tdl
VARIABLE : <Variable Name> [: <Data Type>]
```
- `<Variable Name>`: Name of the Variable.
- `<Data Type>`: Data type of the Variable (Optional). If not specified, the interpreter looks for a separate variable definition with the name specified.

**Example:**
```tdl
[Function : FactorialOf]
Parameter : InputNumber : Number
Variable  : Counter : Number
Variable  : Factorial : Number
```

#### Static Variable Declaration
A Static Variable retains its value between successive calls to a function during the entire session.

**Syntax:**
```tdl
STATIC VARIABLE : <Variable Name> [: <Data Type>]
```

**Example:**
```tdl
[Function : Sample Function]
Static Variable : Sample Static Var : Number
```

### Return Value Specification

If a function returns a value to the caller, its data type is specified using the `RETURNS` statement.

**Syntax:**
```tdl
RETURNS : <Data Type>
```

**Example:**
```tdl
[Function : FactorialOf]
Parameter : InputNumber : Number
Returns   : Number
Variable  : Factorial : Number
```

### Object Specification

A Function inherits the Object context of the caller. This can be overridden by using the `Object` attribute, making it the current object for the function.

**Syntax:**
```tdl
Object : <Object Type> : <Object Identifier>
```

**Example:**
```tdl
[Function : Sample Function]
Object : Ledger : "Party"
```

---

## Procedural Block

This block contains a set of statements. Every statement inside the procedural block has to be uniquely identified by a label specification.

**Syntax:**
```tdl
<LABEL SPECIFICATION> : <Programming Construct>
;; OR
<LABEL SPECIFICATION> : <Action> : <Action Parameter>
```

**Example:**
```tdl
[Function : DispStockSummary]
01 : Display : Stock Summary
02 : Display : Stock Category Summary
```

The valid statements fall into:
1. **Programming Constructs**: Conditional, Looping, Control
2. **Actions**: System, Object/Context Manipulation, UI, Debugging, File I/O

---

## Programming Constructs

### 1. Conditional Constructs

#### IF–ENDIF
A two-way decision statement to control the flow based on a logical expression.

**Syntax:**
```tdl
IF : <Logical Expression>
    STATEMENT 1
    …
    STATEMENT N
ENDIF
```

#### IF–ELSE–ENDIF
Executes alternate statements if the condition is false.

**Syntax:**
```tdl
IF : <Logical Expression>
    STATEMENT 1
    …
    STATEMENT N
ELSE
    STATEMENT 1
    …
    STATEMENT N
ENDIF
```

**Example (Greatest of three numbers):**
```tdl
[Function : FindGreatestNumbers]
Parameter : A : Number
Parameter : B : Number
Parameter : C : Number
RETURNS   : Number
01 : IF      : ##A > ##B
02 :   IF      : ##A > ##C
03 :     RETURN : ##A
04 :   ELSE
05 :     RETURN : ##C
06 :   END IF
07 : ELSE
08 :   IF      : ##B > ##C
09 :     RETURN : ##B
10 :   ELSE
11 :     RETURN : ##C
12 :   END IF
13 : END IF
```

#### DO IF
When an IF-ENDIF block contains only one statement, it can be written on a single line.

**Syntax:**
```tdl
DO IF : <Logical Expression> : <STATEMENT>
```

### 2. Looping Constructs

#### WHILE – END WHILE
Executes a block of statements repeatedly as long as a condition evaluates to TRUE.

**Syntax:**
```tdl
WHILE : <Logical Expression>
    STATEMENT 1
    …
    STATEMENT N
ENDWHILE
```

#### WALK COLLECTION – END WALK
Used to iterate over objects in a Collection, making the current object in the context of iteration the active object context.

**Syntax:**
```tdl
WALK COLLECTION : <Collection Name>
    STATEMENT 1
    …
    STATEMENT N
ENDWALK
```

#### FOR COLLECTION
Context-free walk over a collection. It assigns the returned expression to the iterator variable instead of changing the object context.

**Syntax:**
```tdl
FOR COLLECTION : <Iterator Variable> : <Collection Name> [: <Value Expression> : <Reverse Loop>]
```
- `<Iterator Variable>`: Implicitly created variable.
- `<Value Expression>`: Returned in the iterator variable (Default: name of the object).
- `<Reverse Loop>`: True/False to traverse backwards (Default: False).

**Example:**
```tdl
30 : FOR COLLECTION : i : Group : $ClosingBalance > 1000
40 :   LOG : ##i
50 : END FOR
```

#### FOR TOKEN
Used to walk a string expression separated by a delimiter character.

**Syntax:**
```tdl
FOR TOKEN : <Iterator Variable> : <String Expression> [: <Delimiter Char>]
```

**Example:**
```tdl
01 : FOR TOKEN : TokenVar : "Tally : Shopper : Tally Developer" : ":"
02 : LOG : ##TokenVar
03 : END FOR
```

#### FOR RANGE
Allows looping on a range of numbers or dates. The range can be incremental or decremental.

**Syntax:**
```tdl
FOR RANGE : <Iterator Variable> : <Data Type> : <Start Value> : <End Value> [: <Increment By> [: <Period>]]
```
- `<Data Type>`: Number or Date.
- `<Period>`: 'Day', 'Week', 'Month', or 'Year' (Only for Date type).

**Example (Number Range):**
```tdl
01 : FOR RANGE : IteratorVar : Number : 2 : 10 : 2
02 :   LIST ADD  : EvenNo : ##IteratorVar
03 : END FOR
```

### 3. Control Constructs

#### BREAK
Immediately exits the loop (`WHILE`, `WALK COLLECTION`) and transfers control outside the loop.

**Syntax:**
```tdl
BREAK
```

#### CONTINUE
Skips the rest of the statements in the loop and continues with the next iteration.

**Syntax:**
```tdl
CONTINUE
```

#### START BLOCK – END BLOCK
Temporarily saves the current state (object contexts), executes actions within the block, and restores the original state upon `END BLOCK`.

**Syntax:**
```tdl
START BLOCK
   Block Statements
END BLOCK
```

#### RETURN
Terminates the function execution and optionally returns a value.

**Syntax:**
```tdl
RETURN [: <Value Expression>]
```

---

## Action Statements Used in TDL Function

#### SET
Used to assign values to variables.

**Syntax:**
```tdl
SET : <Variable Name> : <Value Expression>
```

#### EXCHANGE
Used to swap the values of two variables of the same data type.

**Syntax:**
```tdl
EXCHANGE : <Variable1> : <Variable2>
```

#### INCREMENT
Increments the value of a variable(s) by a numerical value.

**Syntax:**
```tdl
INCREMENT : <Variable Name> [, <Variable Name2>, …] [: <Number>]
```

#### DECREMENT
Decrements the value of a variable(s) by a numerical value.

**Syntax:**
```tdl
DECREMENT : <Variable Name> [, <Variable Name2>, …] [: <Number>]
```

---

## Use Case – Import from Excel

The following example demonstrates using procedural capabilities and file I/O capabilities to import stock items from an Excel or text file.

```tdl
;; 1. Variable setup
Local : Field : Name Field : Modifies : SIC Source : Yes
Local : Field : Name Field : Variable : SIC Source
Local : Field : Name Field : Modifies : SIC DirPath : Yes
Local : Field : Name Field : Variable : SIC DirPath

[System : Variable]
SIC Source : "Excel"
SIC DirPath : "C:\Tally.ERP9"

;; 2. Calling import function on form accept
On : Form Accept : Yes : Call : Smp Import Stock Items

;; 3. Open File based on the source
[Function: Smp Import Stock Items]
20 : IF : ##SICSource = "Excel"
30 :   OPEN FILE : @@TSPLSMPTotFilePath : Excel : READ
40 : ELSE
50 :   OPEN FILE : @@TSPLSMPTotFilePath : Text : READ
60 : ENDIF

;; 4. Read Excel Cell and populate list
120 : WHILE : NOT $$IsEmpty:($$FileReadCell:##Row:##ItemColumns.ItemName)
130 :   LISTADDEX : ItemDetails
140 :   SET : ItemDetails[$$LoopIndex].ItemName : $$FileReadCell:##Row:##ItemColumns.ItemName
150 :   SET : ItemDetails[$$LoopIndex].ItemGrp: $$FileReadCell:##Row:##ItemColumns.ItemGrp
160 :   SET : ItemDetails[$$LoopIndex].ItemUOM: $$FileReadCell:##Row:##ItemColumns.ItemUOM
170 :   INCREMENT: Row
180 : END WHILE

;; 5. Create Objects and handle errors
380 : WALK COLLECTION : TSPL SMP Imp StockItem Summ
390 :   SET : Last Status : ""
400 :   IF : $$IsEmpty:$Name:StockItem:$SICStockItem
410 :     NEW OBJECT: Stock Item
420 :     SET VALUE : Name : $SICStockItem
430 :     IF : NOT $$IsEmpty:$Name:StockGroup:$SICStockGroup
440 :       SET VALUE : Parent : $SICStockGroup
450 :     ELSE
460 :       SET : LastStatus : "Group" + $SICStockGroup + "does not exist"
470 :     ENDIF
480 :     IF : NOT $$IsEmpty:$Symbol:Unit:$SICStockUOM
490 :       SET VALUE : Base Units : $SICStockUOM
500 :     ELSE
510 :       SET : LastStatus : "Unit" + $SICStockUOM + "does not exist"
520 :     ENDIF
530 :     IF : $$IsEmpty:##LastStatus
540 :       SAVE TARGET
550 :       SET : Last Status : "Imported Successfully"
560 :     ENDIF
570 :   ENDIF
        ;; Write logs / Update compound variables for display
580 :   IF : ##SICOpenLogFile
590 :     WRITE FILE LINE : $SICStockItem + ##SICTextSep + ##LastStatus
600 :   ENDIF
670 : END WALK
```
