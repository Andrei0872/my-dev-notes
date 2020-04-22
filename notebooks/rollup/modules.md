# Modules

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

## Internal Modules

## External Modules

## To Try

* multiple inputs
* `-i` option; 
* `InputOptions.{perf, cache.{modules, plugins}, experimentalCacheExpiry, shimMissingExports, context, moduleContext, preserveSymlinks}`
* `InputOptions.preserveModules` -  Preserve module's structure - not hoisting transitive dependencies
* `InputOptions.strictDeprecations` - make errors out of warnings
* `InputOptions.{acornInjectPlugins, acorn}` - custom options for `acorn`
* `markPureCallExpressions`