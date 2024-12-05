 FAIL  src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts
  ● Test suite failed to run

src/utils/AudioManager.ts: 41: 15-error TS2576: Property 'listener' does not exist on type 'AudioManager'.Did you mean to access the static member 'AudioManager.listener' instead?

	41     if(!this.listener) {
		~~~~~~~~
			src/utils/AudioManager.ts: 42: 12-error TS2576: Property 'listener' does not exist on type 'AudioManager'.Did you mean to access the static member 'AudioManager.listener' instead?

				42       this.listener=new AudioListener();
		~~~~~~~~
			src/utils/AudioManager.ts: 44: 12-error TS2576: Property 'listener' does not exist on type 'AudioManager'.Did you mean to access the static member 'AudioManager.listener' instead?

				44       this.listener.context.suspend();
		~~~~~~~~
			src/utils/AudioManager.ts: 47: 17-error TS2576: Property 'listener' does not exist on type 'AudioManager'.Did you mean to access the static member 'AudioManager.listener' instead?

				47     return this.listener;
		~~~~~~~~
			src/utils/AudioManager.ts: 54: 14-error TS2576: Property 'listener' does not exist on type 'AudioManager'.Did you mean to access the static member 'AudioManager.listener' instead?

				54     if(this.listener&&this.listener.context.state==="suspended") {
					~~~~~~~~
						src/utils/AudioManager.ts: 54: 31-error TS2576: Property 'listener' does not exist on type 'AudioManager'.Did you mean to access the static member 'AudioManager.listener' instead?

							54     if(this.listener&&this.listener.context.state==="suspended") {
								~~~~~~~~
									src/utils/AudioManager.ts: 55: 12-error TS2576: Property 'listener' does not exist on type 'AudioManager'.Did you mean to access the static member 'AudioManager.listener' instead?

										55       this.listener.context.resume()
								~~~~~~~~
									src/utils/AudioManager.ts: 59: 17-error TS7006: Parameter 'err' implicitly has an 'any' type.

    59         .catch((err) => {
										~~~
											src/utils/AudioManager.ts: 71: 15-error TS2576: Property 'listener' does not exist on type 'AudioManager'.Did you mean to access the static member 'AudioManager.listener' instead?

										71     if(!this.listener) {
											~~~~~~~~
