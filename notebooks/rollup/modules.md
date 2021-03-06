# Modules

## Phases

### Bundle creation

* modules are parsed: 
* chunks are created

### Bundle generation



---

## Bundle Creation

* firstly, the bundle is created
  * contains only the _necessary_ code ❓

* the `Graph` is created
  * holds the `acorn parser`
  * holds the `PluginDriver` - entity
  * holds the `Global Scope`
  * what's its main role ❓
  * by default it includes these acorn plugins
    ```ts
    acornPluginsToInject.push(
			injectImportMeta, // `import.meta`
			injectExportNsFrom, // `export * from`
			injectClassFields, // `class Foo { prop = 'prop'; #privateProp = 'privateProp' }`
			injectStaticClassFeatures // class Foo { static prop = '123' }
		);
    ```
  * the `ModuleLoader` is created
    * responsible for properly loading a module(e.g fetching its dependencies)
    * calling certain hooks - `load`, `resolveId`
    * `getHasModuleSideEffects` ? 
  
* **build phase**
  * 

## Loading modules

* after the file has been read
  * the first `AST` is generated by the `acorn parser`
  * this `AST` is then analyzed; rollup creates a new `AST` based on the one generated by `acorn`;
   
    this is useful as each node holds important logic(e.g: `ImportDeclaration`);
    each node of rollup's `AST` corresponds to a node of `acorn`'s `AST`

    each rollup node holds a reference to the current module that's being fetched:
    ```ts
    this.astContext = { /* ... */ }
    ```
  * the (dynamic/not dynamic)dependencies are fetched: the modules(`Module.sources` -> populated in `addImport`) that the current module depends on will be resolved
  * during this phase, it also adds variables to their scope -> a tree of scopes

* resolving dependencies: `resolvedIds`
* linking dependencies & determining circular dependencies
* `ast.bind`

* tree-shaking(_inclusion_) phase; the relevant **nodes** are included; 
  ```ts
  import obj from '...';
  import { fn1, fn2 } from '...';

  obj.prop1(); // `obj.prop2` not used

  fn1(); // `fn2` not used
  ```

  * how are dynamic dependencies handle (e.g dynamic `import`)
  * ❓ explore why tree-shaking is _not possible_ when dealing with objects, but possible when dealing with functions; e.g try
  * when a prop/method is not removed from an object after tree-shaking phase ❓
  * `needsTreeshakingPass` - `true` when a new variable gets included; ensures that the trees are traversed one more time to make sure everything is included

* chunks creation
  * analyzing the module graph:
    * `analyzeModuleGraph`: transitive dependencies; `dynamicImports` are treated as `entry modules`
    * getting relevant dependencies: `imports`; 
    * `getDependenciesToBeIncluded`: why exports are considered `relevant dependencies` if: `this.isEntryPoint || this.dynamicallyImportedBy.length > 0 || this.graph.preserveModules`
    * `dependentEntryPointsByModule: Map<K, V>`: `K` - the dependency; `V` - the module which depends on that dependency
      ```ts
      // main.js
      import foo from './foo';

      // dependentEntryPointsByModule = { fooModule: [mainModule] }
      ``` 
  * `getDependenciesToBeIncluded` where transitive dependencies are resolved ! 😃

* `module.userChunkNames.add(name);`; `module.chunkFileNames.add(fileName);` ❓ 

## Internal Modules

## External Modules

* you can provide an array of `RegExp`/ids(full paths maybe) for the `InputOptions.external` option
* it is a module that does not have other dependencies 

## Other relevant entities

### Graph

* `includeStatements` > `module.preserveSignature` ❓

### ModuleLoader

* held by: `Graph`
* holds the **global scope**

### Module

* holds a scope: `ModuleScope`(child scope); it has a local `this`
  * a new variable is added when a `module scope` is created

* `importDescriptions[k] = v`; 
  `k` - the `local` name of the import
    ```ts
    import foo from './foo'; // specifier.local.name = `k` = `foo`
    import { foo as test } from './foo'; // specifier.local.name = `k` = `test`; specifier.local.imported = 'foo'
    ```
  `v` - specifier `{ module, name: 'default' '*', '{ thisName }', source: string, start: number }`
  
  filled by `addImport`; in `addModulesToImportDescriptions`, `resolvedIds` are _connected_ with `importDescriptions`

  ❓ `addModulesToImportDescriptions`- where the module from `specifier` is `filled in`(`module: null as any, // filled in later`)

* `Module.traceVariable()`
  `if (name in this.importDescriptions) {}`: during _binding phase_, when the `callee` of the `CallExpression` is an `identifier`(e.g: `foo()`); this is going to set the variable

  a variable can either be in this **module's scope**, on it is **imported from another module**(calling `otherModule.getVariableForExportName`)

* `Module.getVariableForExportName()`
  * invoked when a dependant module calls for variables that are not declared in the its(dependant's) scope;
  * checks the local variables; then `export { var } from '...'`; then the variables exported by this module(e.g: `export const foo = 123;`, `export default () => {}`); if still not found, it will try to find it by recursively looking through the `export *` modules ⬇️

  `getVariableForExportNameRecursive()`
    * search a variable name through `export *` modules(which are kept in `this.exportAllModules`)

* `brokenFlow` ❓

### Variable

* what is a `declarator`
* `hasEffectsWhenAccessedAtPath` ❓
* `init`; e.g `ExportDefaultDeclaration` -> `init` = `ExportDefaultDeclaration.declaration`(which can be `ArrowFunctionExpression`)
* each identifier corresponds with a `variable` ❓
  ```ts
  import foo from './test';
  
  foo(); // `foo` identifier holds the `ExportDefaultVariable` from `./test`
  ``` 

* `alwaysRendered`

#### Global Variable

```ts
function hasEffectsWhenCalledAtPath(path: ObjectPath) {
  return !isPureGlobal([this.name, ...path]); // !false e.g `console.log`; `log` is not `pure`
} 
```

### AST node

* has a ref to its `parent`, the module's scope(`child scope`)

* `VariableDeclaration`
  ```
    VD { declarations: [VariableDeclarator] }

    VariableDeclarator { id: Identifier | ArrayPattern, init: Literal | ArrayExpression }
  ```

  when initialized, it will add the `declarations` to the current scope(e.g module scope, block scope)
  if `id === Identifier`: `id.declare`;
  

* `ArrayExpression`
  ```
  AE { elements: [Identifier | Literal] }
  ```

* ArrayPattern
  `const [a, b, c] = ...`;

* AssignmentPattern vs AssignmentExpression
  AssignmentExpression: `a = 123`;
  AssignmentPattern: `const { a: b = 123 } = ...`; `b = 123`; the `left` node will be added to the (closest ?) scope; `(a = 19) => {}`

* ArrowFunctionExpression
  when initialized: the params are declared(added to the scope - `ReturnScope`) and their `alwaysRendered` prop is set to `true`

* BlockStatement: will not create a `BlockScope` if it's the body of a `function/arrow function`

* ClassDeclaration
  { body: ClassBody; id: Identifier }
  on init, add the name of the class(`Identifier`) to the module scope
  * ClassBody - on init, store the constructor separately

* ExportAllDeclaration
  `exported === null`: `export * from 'foo'`;
    the source(`foo`) will be added to `Module.sources`
  `exported !== null`: `export * as test from 'foo';`
  ```ts
  Module.reexportDescriptions[test] = { source, module, localName: '*' }
  ```

* ExportDefaultDeclaration
  an `ExportDefaultVariable` will be created and then added to the module's scope
  ```ts
  Module.exports.default = { identifier: IdentifierOfTheExported, localName: 'default' }
  ```

  `ExportDefaultVariable`: `export default () => {}`; `variable.declarator` = ExportDefaultDeclaration; `variable.init` = ArrowFunctionExpression

### Chunk

* `link()`
  * for each dependency of each of the **chunk's module**, check if the dep should be added to the current **chunk's dependencies**(yes, if the dep's chunk is not identical with the current one / the dep is an external module(e.g a `JSON` file))
  * setting the `exports` and `imports` for this current chunk ❓

* `canModuleBeFacade` ❓
* what are facades `generateFacades`
* what are the dependencies of a chunk

---

## Things to cover separately

* `MagicString` - linked lists :)

---

## To Try

* multiple inputs
* `-i` option; 
* `InputOptions.{perf, cache.{modules, plugins}, experimentalCacheExpiry, shimMissingExports, context, moduleContext, preserveSymlinks}`
* `InputOptions.preserveModules` -  Preserve module's structure - not hoisting transitive dependencies
* `InputOptions.strictDeprecations` - make errors out of warnings
* `InputOptions.{acornInjectPlugins, acorn}` - custom options for `acorn`
* `markPureCallExpressions`
* dynamic dependencies
* manual chunks
* `dynamicallyImportedBy`
* `EntryModule`(provided via **input option**) vs a `Module`(a dependency)
* how are circular dependencies avoided(`barrel` file ❓)
* `dynamicImports`
* `getPathIfNotComputed`
  ```ts
  if (object instanceof Identifier) {} // **console**.log();
  if (object instanceof MemberExpression) {} // a.b().c()
  ``` 
* what kind of expression is `**foo()**.log()` ?
* `MemberExpression` -> `bind()` -> `if (baseVariable && baseVariable.isNamespace)`
  -> `getPropertyKey()` `this.propertyKey === null` ? `foo['test']()`
* `CallExpression` -> `bind()`-> `if (this.callee instanceof Identifier)` foo()
* `export *` / `import *`
* `ParameterScope` > `includeCallArguments`
* `inlineDynamicImports`
* circular dep
* tree shaking: `renderStatementList` -> `treeshakeNode`
* dynamic imports
* manual chunks: `assignEntryToStaticDependencies`
* `const foo = () => {}`
* `ExportDefaultDeclaration` > `this.variable.getOriginalVariable() !== this.variable`
* `inputOptions.input` as array
* when providing `inputOptions.input`, you can also provide an object: `{ name: value }`
* `InputOptions.cache` - speed up builds in **watch mode**
