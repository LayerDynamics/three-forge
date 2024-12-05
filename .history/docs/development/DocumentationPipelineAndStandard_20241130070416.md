### **Documentation Pipeline and Standards**

The documentation pipeline ensures that the game engine's systems, hooks, and components are well-documented for developers. We will use **JSDoc** for code documentation and **Docusaurus** for system-level and API documentation. This pipeline will cover how to write, generate, and publish documentation for easy accessibility.

---

### **1. Documentation Pipeline Overview**

| **Step**                  | **Description**                                                                | **Tool/Library**               |
|---------------------------|--------------------------------------------------------------------------------|--------------------------------|
| **Code Documentation**    | Annotate all functions, classes, and modules with JSDoc comments.              | JSDoc                         |
| **API Documentation**     | Generate static HTML files from JSDoc comments for easy navigation.            | JSDoc, TypeDoc                |
| **System-Level Docs**      | Create guides for using systems, hooks, and components.                        | Docusaurus                    |
| **Automated Generation**  | Automate documentation generation during builds.                               | Node.js scripts, GitHub Actions |
| **Publishing**            | Host generated documentation on a public site.                                | GitHub Pages, Netlify         |

---

### **2. Standards for Documentation**

#### **2.1 JSDoc Standards**
- **Functions**: Document parameters, return values, and exceptions.
- **Classes**: Document properties, methods, and usage examples.
- **Modules**: Provide an overview of the module's purpose.

| **Annotation** | **Usage**                                                                                     |
|-----------------|-----------------------------------------------------------------------------------------------|
| `@param`       | Describes a function parameter.                                                              |
| `@returns`     | Describes the return value of a function.                                                    |
| `@throws`      | Describes exceptions that a function may throw.                                              |
| `@example`     | Provides example usage of a function, class, or method.                                      |
| `@type`        | Describes the type of a property or variable (useful for non-TypeScript projects).           |

---

#### **2.2 File-Level Documentation Example**
Every file must begin with a brief description of its purpose.

```typescript
/**
 * @file AbilitySystem.ts
 * @description Implements the core logic for managing abilities, including activation and cooldown tracking.
 */
```

#### **2.3 Function Documentation Example**

```typescript
/**
 * Activates an ability by its ID.
 * @param {string} id - The unique identifier of the ability to activate.
 * @param {number} timestamp - The current timestamp (used for cooldown tracking).
 * @returns {boolean} - Returns true if the ability was successfully activated, otherwise false.
 * @throws {Error} Throws an error if the ability does not exist or is on cooldown.
 * @example
 * const success = abilitySystem.activateAbility('fireball', Date.now());
 * if (success) {
 *   console.log('Ability activated!');
 * }
 */
public activateAbility(id: string, timestamp: number): boolean {
  const ability = this.store.getState().abilities[id];
  if (!ability) {
    throw new Error(`Ability with ID ${id} does not exist.`);
  }
  if (timestamp < ability.lastUsed + ability.cooldown) {
    return false; // On cooldown
  }
  ability.lastUsed = timestamp;
  return true;
}
```

---

#### **2.4 Class Documentation Example**

```typescript
/**
 * Class representing the AbilitySystem.
 * Manages player and NPC abilities, including activation, cooldowns, and effect tracking.
 * @class AbilitySystem
 */
export class AbilitySystem {
  private abilities: Record<string, Ability>;

  /**
   * Initializes the AbilitySystem.
   * @constructor
   */
  constructor() {
    this.abilities = {};
  }

  /**
   * Adds a new ability to the system.
   * @param {Ability} ability - The ability to add.
   */
  public addAbility(ability: Ability): void {
    this.abilities[ability.id] = ability;
  }
}
```

---

### **3. Generating Documentation**

#### **3.1 Installing JSDoc**
Install JSDoc as a development dependency:
```bash
npm install --save-dev jsdoc
```

#### **3.2 Configuring JSDoc**
Create a `jsdoc.json` configuration file to customize output:
```json
{
  "tags": {
    "allowUnknownTags": true
  },
  "source": {
    "include": ["src"],
    "includePattern": ".+\\.ts(doc|x)?$",
    "excludePattern": "(^|\\/|\\\\)_"
  },
  "opts": {
    "destination": "./docs/api",
    "recurse": true,
    "template": "default"
  },
  "plugins": []
}
```

#### **3.3 Generating API Documentation**
Run JSDoc to generate static documentation:
```bash
npx jsdoc -c jsdoc.json
```

---

### **4. System-Level Documentation**

#### **4.1 Installing Docusaurus**
Install Docusaurus to generate guides and walkthroughs:
```bash
npx create-docusaurus@latest docs-site classic
cd docs-site
npm install
```

#### **4.2 Creating Documentation Structure**
Add system documentation under the `docs/` folder:
```plaintext
docs/
├── introduction.md          # Overview of the game engine.
├── systems/
│   ├── ability-system.md    # Documentation for the AbilitySystem.
│   ├── weapon-system.md     # Documentation for the WeaponSystem.
├── hooks/
│   ├── use-ability.md       # Documentation for useAbility hook.
│   ├── use-weapon.md        # Documentation for useWeapon hook.
└── components/
    ├── game-object.md       # Documentation for GameObject component.
```

#### **4.3 Example System Documentation**
_File: `docs/systems/ability-system.md`_
```markdown
# Ability System

The **Ability System** is responsible for managing all player and NPC abilities, including their activation, cooldowns, and effects.

## Features

- Add, activate, and remove abilities.
- Track ability cooldowns.
- Integrate with other systems like the Weapon System.

## Example Usage

```typescript
import { AbilitySystem } from "./systems/AbilitySystem";

const abilitySystem = new AbilitySystem();
abilitySystem.addAbility({
  id: "fireball",
  name: "Fireball",
  cooldown: 5,
});
abilitySystem.activateAbility("fireball", Date.now());
```

## API Reference

### `addAbility(ability: Ability): void`
Adds a new ability to the system.

### `activateAbility(id: string, timestamp: number): boolean`
Activates an ability if it is not on cooldown.
```

#### **4.4 Starting the Documentation Site**
Run Docusaurus locally to preview the site:
```bash
npm run start
```

---

### **5. Automation**

#### **5.1 Automating Documentation Generation**
Create a script to generate both JSDoc and Docusaurus documentation:
_File: `generateDocs.js`_
```javascript
const { execSync } = require("child_process");
const path = require("path");

// Paths
const jsdocConfig = path.resolve(__dirname, "jsdoc.json");
const jsdocOutput = path.resolve(__dirname, "docs/api");

console.log("Generating JSDoc...");
execSync(`npx jsdoc -c ${jsdocConfig}`, { stdio: "inherit" });

console.log("Building Docusaurus...");
execSync(`npm run build`, { cwd: path.resolve(__dirname, "docs-site") });

console.log("Documentation generated successfully!");
```

#### **5.2 Automating in CI/CD**
Add a GitHub Actions workflow to generate and deploy documentation:
_File: `.github/workflows/docs.yml`_
```yaml
name: Generate and Deploy Documentation

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Generate JSDoc
        run: npx jsdoc -c jsdoc.json

      - name: Build Docusaurus
        run: npm run build --prefix docs-site

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs-site/build
```

---

### **6. Publishing**

#### **6.1 Hosting with GitHub Pages**
Deploy the generated site (e.g., `/docs-site/build`) to GitHub Pages using the CI/CD pipeline.

#### **6.2 Hosting with Netlify**
For Netlify:
1. Connect the repository.
2. Set the build command to:
   ```bash
   npm run build --prefix docs-site
   ```
3. Set the publish directory to `docs-site/build`.

---

### **Summary**

| **Step**                      | **Tool**        | **Description**                                                                 |
|-------------------------------|----------------|-------------------------------------------------------------------------------|
| **Code Documentation**         | JSDoc          | Annotate code with JSDoc comments and generate API docs.                     |
| **System Documentation**       | Docusaurus     | Create guides and walkthroughs for systems, hooks, and components.           |
| **Automation**                 | Node.js, CI/CD | Automate generation and deployment of documentation.                         |
| **Hosting**                    | GitHub Pages   | Publish static documentation for public or internal use.                     |

