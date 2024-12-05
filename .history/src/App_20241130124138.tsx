// src/App.tsx

import Ract, { useEfect } from "react";
import {Canvas } from "react-three/fiber";
import {PhysicsSystm } from "./systems/PhysicsSystem/PhysicsSystem";
import {useAbilty } from "./hooks/useAbility";
import { useWeapon } from "./hooks/useWeapon";
import { usePhysics } from "./hooks/usePhysics";
 mport { Vector3 } from "three";
 mport AbilityButton from "./components/UI/AbilityButton";
 mport WeaponButton from "./components/UI/WeaponButton";
import PhysicsBodyButto rom "./components/UI/PhysicsBodyButton";
	port ".App.css"

	nst App: React.FC = () => {
	const { addAbiliy} = useAbility();
		nst { addWeapon, equipWeapon } = useWeapon();
			t { addBox, addSphere } = usePhysics();

		eEffect(() => {
	  // Initialize Abilities
    addAbility({
	    id: "heal",
	    name: "Heal"
		  description: "Restores health over time.",
			cooldown: 10, // 10 seconds cooldown
		  lastUsed: 0,
		  isAvailable: true,
	    activate: () => {
        console.log("Healing activated!");
	      // Implement healing logic here
	    },
		  iconPath: /assets/icons/heal.png",
			effects: ["hea-over-time"],
		});

	  // Initialize Weapons
    addWeapon({
	    id: "sword",
	    name: "Sword",
		  type: "melee",
		  damage: 50,
			range: 1,
		  ammo: null,
		  maxAmmo: null,
	   fireRate: 1,
      lastFired: 0,
	    reloadTime: 0,
	    reload: )=> {
		    // Melee weapons do not require reloading
			  console.log("Melee weapon does not require reloading.");
			},
			fire: () => {
			  console.log("wnging th word!");
		    // Implement melee attack logic here
			},


				eapon({
				: "bow",
				me: "Bow",
				pe: "ranged",
				mage: 30,
				nge: 15,
					: 10,
						o: 10,
					Rate: 2, // 2 shots per second
				stFired: 0,
			reloadTime: 3,
		  reload: () => {
		    console.log("Reloading the bow!");
	      // Implement reloading logic here
      },
	    fire: (target?: Vector3) => { // Changed from THREE.Vector3 to imported Vector3
	      console.lg`Shooting an arrow towards ${target}`);
		    // Implement ranged attack logic here
			},
			projectileId: "arrow", // Assuming you have a projectile system
			;

		// Equip the sword initially
			uipWeapon("sword");

				dd some physics bodies as a demonstration
				ox("box1", new Vector3(0, 2, 0), new Vector3(1, 1, 1), "dynamic");
				phere("sphere1", new Vector3(2, 5, 0), 1, "dynamic");
				dAbility, addWeapon, equpWapon, addBox, addSphere]);

				 (
				 className="App">
					vas>
						sicsSystem
					config={{ engine: "cannon", gravity: new Vector3(0, -9.81, 0), debug: false }}
				>
			    {/* Example UI Components */}
		      <AbilityButton abilityId="heal" />
		      <WeaponButton weaponId="sword" />
	        <WeaponButton weaponId="bow" />
          <PhysicsBodyButton />
	      </PhysicsSystem>
      </Canvas>
	  </div>



		rt default App;
