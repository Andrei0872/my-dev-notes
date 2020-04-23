# Findings

* `InputOptions.external` - decide which files should be considered external modules

## Questions

* `inlineDynamicImports` - why only possible if a single input is provided

* why is this used; try with multiple inputs
  
  ```ts
  awaitLoadModulesPromise<T>(loadNewModulesPromise: Promise<T>): Promise<T> {
		this.latestLoadModulesPromise = Promise.all([
			loadNewModulesPromise,
			this.latestLoadModulesPromise
		]);

		const getCombinedPromise = (): Promise<void> => {
			const startingPromise = this.latestLoadModulesPromise;
			return startingPromise.then(() => {
				if (this.latestLoadModulesPromise !== startingPromise) {
					return getCombinedPromise();
				}
			});
		};

		return getCombinedPromise().then(() => loadNewModulesPromise);
	}
  ```

  expectation: if 2 configs are provided, then `config1` will be loaded after `config2` finishes

* `warnForMissingExports` - `importDescriptions`