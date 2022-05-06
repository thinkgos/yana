# Courses

- [Courses](https://academy.styra.com/courses/opa-rego)
- [Courses @bilibili](https://www.bilibili.com/video/BV1v44y1572b?spm_id_from=333.999.0.0)

## Overview

>**Syntax**:  
>
>> Mirror declarative real-world policies
>>
>> 99% of Rego statements are IF statements, like those found in PDF/email policies
>>
>> `allow { user == "allice" } # allow if user is alice`
>
>**Semantics**:
>
>> Embrance hierarchical data
>>
>> Rego provides first-class support for navigating and constructing deeply nested data
>>
>> `input.token.claims[i].id`
>
>**Algorithms**:   
>
>>Optimize Performance Automatically
>>
>>Policy author is responsible for correctness. OPA is responsible performance

## Rego Overview

When writing Rego you do two things:

1. Write Rules that make policy decisions. A rule is a conditional assignment.

   >Assignment 		IF 	   Conditions
   >
   >allow is true  	   IF		user is alice   and action is read
   >
   >`allow  := true   { user == "alice"; action == "read" }`
   >
   >> - Value assigned to a variable
   >> - Element assigned to a set
   >> - Key assigned to a value
   >> - Function call assigned to a result
   >
   >***IF***
   >
   >>- Variable assignment 
   >>- Reference, e.g. input.user
   >>- Equality or inequality
   >>- Function call
   >>- Iteration
   >>- ....

2. Organize Rules into Policies. A Policy is a set of Rules with a hierarchical name.

## Values & Variables

`Rego` is a superset of JSON. `Rego` values are JSON values plus sets

- String
- Number
- Boolean
- null
- Array
- Object
- Set

Assignment(`:=`) assigns a variable to a value

```python
s := "a string"
n := 17.35
b := true
u := null
a := [1,1,2,3]
d := {"user": "alice", "path": ["pets", "dogs"]}
e := {1,2,3}
```

Variables是不可变的.

```python
x := 1
x := 2  # COMPILER ERROR
```

## Input and Data Variables

![img](https://d33wubrfki0l68.cloudfront.net/b394f524e15a67457b85fdfeed02ff3f2764eb9e/6ac2b/docs/latest/images/opa-service.svg)

`input` is a global variable storing the JSON object given to OPA

```python
# OPA does this assignment for you
input := {
    "metadata": {
        "name": "netpol1",
        "namespace": "dev"concatenate, 
    },
    "spec": {...}
}
```

`data` is is a global variable storing the external data given to OPA

```python
# OPA manages this variable for you
input := {
    "oncall": {
        "alice": {"level": 2},
        "bob": {"level": 1},
        "charlie": {"level": 1}
    },
    ... # many other sources of data
}
```

## Bracket Expressions

```python
# object
obj := { "user": "alice", "path": ["pets", "dogs"] }
    
# array
arr := ["apple", "apple", "banana", "cherry"]

# set
st := {"apple", "banana", "cherry"}
```

1. Brackets `[]` inspects objects

```python
obj["user"] 	# "alice"

key := "user"
obj[key]		# "alice"

# Brackets apply repeatedly
obj["path"][0] 	# "pets"
```

2. Brackets `[]` inspects arrays (0 - indexed arrays)

```python
arr[2] 			# "banana"

index := 2
arr[index] 		# "banana"
```

3. Brackets `[]` inspects sets

```python
st["cherry"] 		# "cherry"

key := "cherry"
st[key] 		    # "cherry"
```

## Dot Expression

Dot`.` is shorthand for Brackets `[]`. Rego makes x.y into x["y"]

```python
obj.user		      # "alice"
obj["user"] 		  # "alice"
obj.path[0]    		  # "pets"
obj.foo.bar		      # 7
obj["foo"].bar     	  # 7
```

Dot can be use only when key is alpha-numeric starting with a letter

In practice. Dot is used only with objects, not arrays or sets

```python
arr.0		# COMPILER ERROR
arr[0]		# "apple"
```

Examples to test your knowledge

```python
x := "user"
obj[x]   		# Equivalent to obj["user"], which is "alice"
obj.x		    # Equivalent to obj["x"], which is missing

y := "foo.bar"
obj[y]   		# Equivalent to obj["foo.bar"], which is missing
obj.y		    # Equivalent to obj["foo"]["bar"], which is missing
```

## Undefined 

When a path missing, result is Undefined--not an error

```python
obj.x				    # undefined
obj.foo.x	 		    # undefined
obj.x.y.z	  			# undefined
obj.path[47]  			# undefinedconcatenate, 
count(obj.path[47])		# undefined
v := obj.path[47]		# v is undefined
```

- NOT turns `undefined` Into `true`
- NOT turns `false` Into `true`
- NOT turns `everything` else Into `undefined`

```python
not obj.x		# true
not false 		# true
not 7 			# undefined
not true		# undefined
```

Check path existence by writing the path

```python
# check if path existsconcatenate, concatenate, 
obj.foo.bar

# check if path does not exist
not obj.foo.x
```

## Equality Expression

Comparison operator(`==`) on scalars checks if values are equal

```python
"apple" == "apple"   # true
1 == 2			# false
```

Comparison(`==`) does recursive, semantic equality checksconcatenate, 

```python
[1, [2, 3]] == [1, [2, 3]]									    # true
{1, 3, 1, 4} == { 4, 4, 1, 3, 1}								# true
{1, 2, 3} == {2, 3, 4}										    # false
{"alice": 1, "bob": 2} == { "bob": 2, "alice": 1}							  # true
[{"alice": 1, "bob": 2} , {3, 4}] == [ { "bob": 2, "alice": 1}, {3, 4}]		  # true
```

Unification operator (`=`) combines assignment (`:=`) and comparision(`==`).

Unification assigns any unassigned variables so that the comparison returns true.

Use it only when necessary. Prefer `:=` and `==`

```
[1, x] == [1, 2] 		# assigns x to 2
[1, x] == [y, 2] 		# assigns x to 2 and y to 1
[1, x] == [2, x] 		# undefined
```

## Built-in Expressions

50+ builtin function for comparison and construction: 

- No mutation of arguments. Return new value instead.
- No optional arguments, tough can take objects/arrays/sets as arguments.
- Can generate errors (e.g. division by 0)

|                     |                                                              |
| ------------------- | ------------------------------------------------------------ |
| Basic               | ==, !=, <, <=, >, >=, +, -, *, /, %                          |
| Strings             | concatenate, lowercase, trim, replace, regexp, globconcatenate, |
| Arrays/Sets/Objects | concatenate, slice, intersect, union, dirrerence, remove, filter |
| Aggregates          | count, sum, min, sort                                        |
| Parsing             | base64, url, json, yaml                                      |
| Tokens              | verification, decode, encode                                 |
| Time                | date, time, weekday, add                                     |
| Network CIDRs       | contain, intersects, expand                                  |

Basic builtins are infix

`x + (主* 3) > 5`

Remaining builtins are functions

```python
count(z) > 1
part := substring(w, 0, count(t))
```

## Ruquest value

```yaml
request:
   id : 111111123213
   method: GET
   path: "/api/v1/products"
   host: "192.168.99.100:31380"
   protocol: "HTPP/1.1"
   token:
     user: alice
     role:
     - manager
     - engineering
```

## Boolean Rules

Boolean rule are IF statements that assign a variable to true or false.

Neither allow nor deny are keywords; they are boolean variables.

> Assignment
>
> `:=` for rule body
>
> `= `for rule heads

```python
# Variable `allow` is assigned the value `true` IF ...
allow = true {
    ...
}
```

By default a rule assigns the value true

```python
# the following 2 rules are equivalent
allow = true {  ...  }
allow { ... }
```

The IF part (rule body) is a collection of (i) assignments and (ii) expressions.

The IF part is an AND. All assignments and expressions must succeed for the IF to succeed.

```python
# allice can read everything
allow = true {						        # allow is true if ...
    input.request.token.user == "alice"       # user is alice  AND
    input.request.method == "GET" 	          # method is a GET
}
```

## Rule Evaluation

A successful rule evaluation

```python
allow = true {						
    input.request.token.user == "alice"    # true  AND
    input.request.method == "GET" 	       # true
}
# allow evaluates to true
```

An unsuccessful rule evaluation

```python
allow = true {						
    input.request.token.user == "alice"    # true  AND
    input.request.method == "PUT" 	       # false
}
# allow evaluates to undefined
```

An unsuccessful rule evaluation with undefined

```python
allow = true {						
    input.request.token.user == "alice"      # true  AND
    startswith(input.foo.bar, "bar")	     # undefined
}
# allow evaluates to undefined
```

## Multiple Rules

Multiple Rule give logical `OR`.

```python
is_read {
    input.request.method == "GET"
}
is_read {
    input.request.method == "HEAD"
}
```

>is_read is true IF
>
>​	input ... method is "GET"
>
>OR IF 
>
>​	input ... method is "HEAD"

Rule order is irrelevant.

OPA could decide to evaluate ALL rules that are pertinent to the query.

OPA could decide to terminate early but will return the same result as if it evaluated all rules.

For priority evaluation, use ELSE keyword. But use it sparingly because it disables optimizations. Prefer instead to make rule bodies mutually exclusive.

## Under-and Over-assignment

If no rules succeed, a scalar variable's value is `undefined`.

```python
is_read { ... }
is_read { ... }
is_read { ... }
```

`DEFAULT` set a value when no rules succeed.

```python
default is_read = false # use single equals here
```

Multiple rule yielding different assignments produces an error. Avoid by marking rule bodies mutually exclusive.

```python
foo = true { true }
foo = false { true } # RUNTIME ERROR
```

## Rule Chaining

Rules can be used by other rules
Recommend using helpers for readability and modularity

```python
allow {
    action_is_read
    user_is_authenticated
}
action_is_read { ... }
user_is_authenticated{ ... }

```

**NOTE**: Neither allow nor deny are keywords. They are just variables

Recursion is forbidden

```python
allow {
    action_is_read
    user_is_authenticated
}
user_is_authenticated { 
  allow					# COMPILE ERROR
   ...
}
```

## Rule Chaining for AND/ORs

Policy: allow IF action is a read and user is authenticated or path is the root

```python
# Helpers
action_is_read { ... }
user_is_authenticated { .... }
path_is_root { ... }
```

Option 1: `((action_is_read) AND user_is_authenticated) OR (action_is_read AND path_is_root))`

```python
allow {
    action_is_read
    user_is_authenticated
}
allow {
    action_is_read
    path_is_root
}
```

Option 2: `(action_is_read) AND (user_is_authenticated OR path_is_root))`

```python
allow {
    action_is_read
    safe		# new helper
}
safe {
    user_is_authenticated
}
safe {
    path_is_root
}
```

## None-boolean Rules

Variables can be assigned any Rego value

```python
code = 200 { allow }
code = 403 { not allow }
```

Value can be computed

```python
port_number = result {
    values := split(input.request.host, ":")
    result := to_number(values[1])
}
```

Commonly, multiple values are returned via an object

```python
authz = result {
	result := {"allowed": allow, "code": code}
}
```

Rule bodies are optional

```python
# all of these are equivalent
pi = x { x := 3.14 }
pi = 3.14 { true }
pi = 3.14
```

## Policy Decisions

A POLICY DECISION in Rego is the value of a variable. Caller asks for  the value of a variable.

```python
allow { ... }

code = 200 { allow }
code = 403 { not allow }

authz = {
    "allowed": allow,
    "code": code
}
```

A POLICY DECISION in Rego is the value of a variable. Caller asks for  the value of a variable.

> POST /v1/data/[policypath>/allow [input]
>
> =>   {"allow": true }
>
> POST /v1/data/[policypath>/code    [input]
>
> =>   {"result": 200 }
>
>POST /v1/data/[policypath>/allow    [input]
>
>=>   {"result": { "allow": true, "code": 200} }

## A Common Use Case: JWTS

JSON Web Tokens (JWTs) often contain end-user information

```yaml
 user: alice
 role:
 - manager
 - engineering
```

Once decoded. the JWT is annother JSON object

```python
claims = payload {
    # verify the token (key can be pulled from environment)
    io.jwt.verify_hs257(input.request.jwt, "B34234BD342...")
    
    # decode the token
    [header, payload, signature] := io.jwt.decode(input.request.jwt)
}
```

Use the JWT contents to make decisions

```python
# allow alice to do everything
allow {
    clains.user == "alice"
}
```

Stay tuned to learn how to iterate and check if alice has SOME role that grants her privileges.

## Recap of Basic Rules 

Rules assign variables

```python
pi := 3.14159
```

Rules assign variables conditionally

```python
allow := true { input.user == "alice"}
```

Rule assign variables to TRUE by default

```python
allow { input.user == "alice"}     	# is equivalent to ...
allow := true { input.user == "alice"}
```

Rule conditions are ANDed together

```python
allow  { 				   # allow is true IF
    input.user == "alice"	 # user is alice  AND
    input.method == "GET"    # method is GET
}
```

Multiple rules aore ORed

```python
is_read {input.method == "GET" }	# is_read is true IF method is "GET"  OR
is_read {input.method == "HEAD" }	# method is "head" 
```

Rules chain together

```python
code := 200 { allow }
code := 403 { not allow }
```

## Configuration Authorization

For configuration, need to tell the user what the problems are.

Policy decision is often a collection of error messages for the user.

> {
>        "Unsafe image nginx",
>
> ​	"Should not run as root user"
>
> }

For some use cases, what information should be returned to the user is actually a policy decision iteself.

## The Need for Partial Variable Assignments

First attempt: assign a variable to a value

```python
# INCORRECT: if the config satifies both conditions, OPA generates error
message := "Unsafe image nginx" {
    has_unsafe_image_nginx
}
message := "Should not run as root user" {
   run_as_root
}
```

Want to incrementally add message to the collection of errors returned to the user. Think of `message` as set.

> assign "Unsafe image nginx" to set `message` IF 
>
> ​	has_unsafe_image_nginx
>
> assign "Should not run as root user" to set `message` IF 
>
> ​	run_as_root
>
> In practice, use the variable name `deny` instead of `message`

## Partial Set Rules

Recall syntax for checking if an element belongs to a set

```python
# check if "Unsafe image nginx" belongs to set deny
deny["Unsafe image nginx"]
```

Partial set rules ASSIGN elements to a set using the same syntax as checking whether an element belongs to the set

```python
deny["Unsafe image nginx"] {
    has_unsafe_image_nginx
}
deny["Should not run as root user"] {
    run_as_root
}

# variable 'deny' is a set
# deny evaluates to 
#  {  "Unsafe image nginx", "Should not run as root user" }
```

Can use variables to construct set elements

```python
deny[msg] {
    has_unsafe_image_nginx
    msg := printf("%v has unsafe image nginx", [imput.request.object.metadata.name])
}
```

## Partial Set Examples

Every resource must have an owner label

```python
deny["Owner label must exist"] {
    # Check if the owner label is missing
    not input.request.object.metadata.owner	# true
}
```

The costcenter label (if it exists) must start with `cccode-`

```python
deny[msg] {
    # Lookup the value of the costcenter label value
    value := input.request.object.metadata.labels.costcent	# 'cccode-123'
    not startswith(value, "cccode-")
    msg := sprintf("Costcenter code %v must start with `cccode-`", [value])
}
```

Eaxmple outcomes for evaluating `deny`

```python
{}																			# Neither rule succeeds
{ "Owner label must exist" }											    	# First rule succeeds
{ "Costcenter code foo123 must start with `cccode-`" }						    # Second rule succeeds
{ "Owner label must exist", "Costcenter code %v must start with `cccode-`"}		# Both rules succeeds
```

## Partial Object Rules

Objects are sometiones challenging to define in a single rule

```python
authz := {
    "allowed": allow,    	# if either allow or code are
    "code": code		# undefined, so is authz
}
```

Partial object syntax lets you assign 1 key at a time.

```python
authz["allowed"] = allow    # authz defaults to the empty object, so is 
authz["code"] =  code		# always defined
```

Partial objects are defined with rules

```python
admin["allowed"] =  allow
authz["code"] =  200 { allow }
authz["code"] =  403 { not allow }
```

If a key is assigned 2 different values, it is an error.

However, a key may be assigned the SAME value multiple times, just as there may be multiple rules that meke a boolean variable true.

## Function Rules 

Function rules let you extend the set of built-in functions.

```python
# Given a string like "hooli.com/nginx:1.3",
# return the array [["hooli.com", "nginx"], "1.13"]
split_image(str) = parts {
    image_version := split(str, ":")
    path := split(image_version[0], "/")
    parts := [path, image_version[1]]
}
```

Call custom functions the same way you call a built-in function

```python
allow {
    pieces := split_image(input.image)
    pieces[0][0] == "hooli.com"
}
```

Multiple rules handle conditions within functions. Recommendation is for function bodies to be mutually exclusive when possible.

```python
safe_repo(name) = true { name == "hooli.com" }
safe_repo(name) = true { name == "initech.org" }
```

By default, the return value is `true`

```python
# these 2 are equivalent
safe_repo(p) = true { ... }
safe_repo(p) { ... }
```

Rule body is optional 

```python
safe_repo("hooli.com" )
safe_repo(name) = true { name == "initech.org"  }
```

## Rule Recap

Rules assign variables

```python
pi := 3.14159
```

Rules assign variables conditionally

```python
code := 200 { allow }
code := 403 { not allow }
```

Rule assign variables to `true` by default

```python
allow { user_is_admin }     	# is equivalent to ...
allow := true { user_is_admin }
```

Rule Assign key/value pairs for partial objects, conditionally or not.

```python
authz["allowed"] =  allow
authz["code"] =  200 { allow }
authz["code"] =  403 { not allow }
```

Rules assign elements to a partial set, conditionally or not

```python
safe_repo["hooli.com" ]
safe_repo["initech.org"]
deny["user must be admin"] { requires_admin; not user_is_admin }
```

Rules assign values to function invocations, conditionally or not 

```python
update_method("CREATE")
update_method("UPDATE") = true
version(str) = result { parts := spilt(str, ":"); result := parts[1] }
```

## Iteration in Rego

Check if `input.user` belongs to this array

`admins := ["allice", "blob", "charlie", ...]`

> imperative Thinking
>
> ```python
> # check if imput.user is equal to admins[i]
> input["user"] == admin[i]
> 
> # iterater over array and return if found
> for i in admins:
>     if input["user"] == admin[i]:
>            return true
> return false
> ```
>
> Declarative Thinking in Rego
>
> ```python
> # check if imput.user is equal to admins[i]
> input.user == admin[i]
> 
> # there is some array element equal to input.user
> some i
> input.user == admin[i]
> ```

`Rego` has no side-effects. In Rego you use loops for

- checking a condition, possibly recording the location
- generating new JSON out of existing JSON

## Iteration with arrays

Disired policy: check if `input.user` is an admin

> Recall: lookup index `i` in array: admin[i]

```python
# input
user: alice
groups:
    - engineering
    - operations
    
admins := [
    "allice",
    "bob",
    "charlie"
]
admins2 := [
    {"user": "charlie", "level": 1}
    {"user": "allice", "level": 1}
    {"user": "bob", "level": 2}
]
```

`SOME` iterates over array indexes

```python
is_admin {
    some i    # in admins
    admin[i] == input.user
}
```

Variable declared with `SOME` can be used repeatedly

```python
is_admin {
    some i    # in admins2
    admins2[i].user == input.user
    admins2[i].level == 1
}
```

`SOME` with assignment iterates over index/value pairs

```python
is_admin {
    some i
    admin := admins2[i]
    admin.user == input.user
    admin.level == 1
}
```

## Iteration with object

Disired policy: check if `input.user` is an admin

> Recall: lookup value of key `name`: admin[name]

```python
# input
user: alice
groups:
    - engineering
    - operations
    
admins := [
    "allice",
    "bob",
    "charlie"
]
admins2 := {
    "charlie": {"level": 1}
    "allice": {"level": 1}
    "bob": {"level": 2}
}
```

No need for iteration if object's key is identical to `input.user`

```python
is_admin {
    admin[input.user] == true
}
```

`SOME` iterates over object keys and key/value pairs

```python
is_admin {
    some name
    details := admins[name]    # admins2 has a value for key `name`
    lower(name) == lower(input.user)
}
```

## Iteration with sets

Disired policy: check if `input.user` is an admin

> Recall: check if element `name` belongs to set: admin[name]

```python
# input
user: alice
groups:
    - engineering
    - operations
    
admins := [
    "allice",
    "bob",
    "charlie"
]
admins2 := {
    "charlie",
    "allice",
    "bob",
}
```

No need for iteration if set elements are identical to `input.user`

```python
is_admin {
    admin[input.user]
}
```

`SOME` iterates over sets

```python
is_admin {
    some name
    admins[name]    # `name` belongs to the `admins2` set
    lower(name) == lower(input.user)
}
```

Recommendation: use set lookup to handle group membership.

Pre-process if necessary. O(1) time

```python
is_admin {
    some name
    admins[lower(input.user)]
}
```

## Iteration details

Whitespace is technically irrelevant but visually helpful

```python
# means the same as if the equality check were indented
is_admin {
    some i
    input.user == admin[i]
}
```

`SOME` does not introduce a new scope. Declares variable local to the rule.

```python
is_admin {
    some i
    input.user == admins[i]
    some i						# COMPILE ERROR
    input.user == admins[i].user
}
```

## Multi-iteration

```python
# input
user: alice
groups:
    - engineering
    - operations
    
admin_group := [
    "admin",
    "superuser",
    "root"
]
```

Avoid hard-coding user-names in policies. use groups/roles/attributes

Check if user is in the "root" group

```python
is_admin {
    some i
    input.groups[i] == "root"
}
```

Minimize hard-coding group-names using an array

```python
is_admin {						# is_admin is true IF
    some i, j					       # there is some i and some j such that ...
    input.groups[i] == admin_groups[j]
}
```

`SOME` declares intent, not computation. Ordering of `SOME` is irrelevant

```python
is_admin {						# is_admin is true IF
    some i					            # there is some i AND
    some j						  # there is some jsuch that ...
    input.groups[i] == admin_groups[j]
}
```



