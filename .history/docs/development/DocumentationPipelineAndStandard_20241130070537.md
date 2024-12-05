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

### **Advanced JSDoc Templates and Customization**

We will focus on **customizing JSDoc templates** to generate professional, visually appealing, and comprehensive documentation. The goal is to enhance developer understanding and make the generated documentation easy to navigate.

---

### **1. Customizing JSDoc Output**

JSDoc generates documentation using a default template, but we can enhance it using third-party templates or create a custom one.

#### **1.1 Installing a Custom Template**
Use a popular template such as **Minami** for a clean and modern look:
```bash
npm install --save-dev minami
```

Update your `jsdoc.json` configuration file to use the Minami template:
```json
{
  "opts": {
    "destination": "./docs/api",
    "recurse": true,
    "template": "node_modules/minami"
  }
}
```

Generate the documentation:
```bash
npx jsdoc -c jsdoc.json
```

---

#### **1.2 Creating a Custom JSDoc Template**

If existing templates don't meet your needs, you can create a custom template. This involves customizing the HTML, CSS, and layout of the generated documentation.

##### Steps to Create a Custom Template:
1. **Clone the Default Template**:
   ```bash
   cp -r node_modules/jsdoc/templates/default my-jsdoc-template
   ```
2. **Modify Template Files**:
   - Update `layout.tmpl` to adjust the overall structure.
   - Add custom styles in `static/styles.css`.
3. **Point to Your Template**:
   Update the `jsdoc.json` file:
   ```json
   {
     "opts": {
       "destination": "./docs/api",
       "recurse": true,
       "template": "./my-jsdoc-template"
     }
   }
   ```

Example: Add a logo and update the footer in `layout.tmpl`:
```html
<header>
  <img src="logo.png" alt="Game Engine Logo" />
  <h1>Game Engine Documentation</h1>
</header>
<main>
  {{> content}}
</main>
<footer>
  <p>Copyright © 2024 Game Engine Team</p>
</footer>
```

---

### **2. Enhancing JSDoc with Plugins**

JSDoc plugins can extend functionality, such as supporting advanced syntax or additional annotations.

#### **2.1 Installing and Using Plugins**
Install plugins to enhance your JSDoc output. For example:
- **Markdown Support**: Parse Markdown in JSDoc comments.
- **TypeScript Support**: Improve handling of TypeScript-specific syntax.

Install the Markdown plugin:
```bash
npm install --save-dev jsdoc-plugin-markdown
```

Add the plugin to your `jsdoc.json`:
```json
{
  "plugins": ["node_modules/jsdoc-plugin-markdown"]
}
```

#### **2.2 Markdown in JSDoc**
Now you can write Markdown in your JSDoc comments:
```typescript
/**
 * A **special** function that demonstrates markdown rendering.
 *
 * - **Feature 1:** Handles complex logic.
 * - **Feature 2:** Integrates with multiple systems.
 *
 * ### Example Usage
 *
 * ```javascript
 * mySpecialFunction({ param: "value" });
 * ```
 *
 * @param {Object} options - The configuration options.
 * @param {string} options.param - A required parameter.
 */
function mySpecialFunction(options) {
  console.log(options.param);
}
```

---

### **3. Advanced Annotations for Complex Use Cases**

#### **3.1 Extending Functionality with `@typedef`**
Use `@typedef` to define reusable custom types, which improves readability for complex parameters or return values.

Example:
```typescript
/**
 * @typedef {Object} Ability
 * @property {string} id - The unique identifier for the ability.
 * @property {string} name - The display name of the ability.
 * @property {number} cooldown - The cooldown time in seconds.
 */

/**
 * Adds a new ability to the system.
 * @param {Ability} ability - The ability object to add.
 */
function addAbility(ability) {
  console.log(`Added ability: ${ability.name}`);
}
```

---

#### **3.2 Documenting Events with `@fires`**
If a function emits custom events, document them with `@fires`:
```typescript
/**
 * Activates an ability and triggers an event.
 * @fires AbilitySystem#activated
 */
function activateAbility(id) {
  /**
   * AbilitySystem#activated
   * @event AbilitySystem#activated
   * @type {Object}
   * @property {string} id - The ID of the activated ability.
   */
  console.log(`Ability ${id} activated!`);
}
```

---

#### **3.3 Documenting Inheritance with `@extends`**
For classes extending a base class, use `@extends` to document the relationship.

Example:
```typescript
/**
 * Base class for all systems.
 * @class
 */
class BaseSystem {
  constructor() {
    console.log("Base system initialized.");
  }
}

/**
 * The AbilitySystem extends the BaseSystem to manage abilities.
 * @extends BaseSystem
 * @class
 */
class AbilitySystem extends BaseSystem {
  constructor() {
    super();
    console.log("Ability system initialized.");
  }
}
```

---

#### **3.4 Documenting Modules with `@module`**
Use `@module` to document modules and their exports.

Example:
```typescript
/**
 * @module AbilitySystem
 * Provides functionality for managing abilities.
 */

/**
 * Adds a new ability to the system.
 * @param {string} id - The ID of the ability.
 */
export function addAbility(id) {
  console.log(`Ability ${id} added.`);
}
```

---

### **4. Automating Documentation Updates**

To ensure documentation stays up-to-date, automate its generation as part of the development pipeline.

#### **4.1 Add a Script in `package.json`**
Add a script to regenerate documentation:
```json
"scripts": {
  "docs": "npx jsdoc -c jsdoc.json"
}
```

Run the script:
```bash
npm run docs
```

---

#### **4.2 Integrating JSDoc in CI/CD**
Add a GitHub Actions workflow to generate and deploy documentation automatically.

_File: `.github/workflows/generate-docs.yml`_
```yaml
name: Generate and Deploy JSDoc

on:
  push:
    branches:
      - main

jobs:
  generate-docs:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Generate JSDoc
        run: npm run docs

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/api
```

---

### **5. Hosting JSDoc Output**

#### **5.1 GitHub Pages**
If using GitHub Pages:
1. Generate the documentation into the `docs/api` folder.
2. Set up GitHub Pages to serve the `docs/api` folder.

#### **5.2 Netlify**
1. Point Netlify to the `docs/api` folder as the publish directory.
2. Use the `npm run docs` command during build to generate fresh documentation.

---

### **6. Enhancing JSDoc Output**

#### **6.1 Search Integration**
Add search functionality to JSDoc output using **Algolia DocSearch** or similar tools.

#### **6.2 Adding Versioning**
- Use JSDoc versioning tools like **GitVersion** to track changes between versions.
- Embed the version in the generated documentation.

#### **6.3 Advanced Styling**
Customize styles in the JSDoc template by editing:
- `static/styles.css` for layout and design.
- Add branding elements like logos or custom fonts.

---

### **Summary**

| **Feature**                     | **Tool/Technique**       | **Description**                                                                 |
|----------------------------------|--------------------------|---------------------------------------------------------------------------------|
| **Custom Templates**             | Minami or custom design  | Use or create a template for modern documentation output.                      |
| **Advanced Annotations**         | JSDoc                    | Use `@typedef`, `@fires`, and `@extends` to handle complex documentation cases. |
| **Markdown Support**             | jsdoc-plugin-markdown    | Write detailed, formatted documentation using Markdown.                        |
| **Automation**                   | npm scripts, CI/CD       | Automate documentation generation and deployment.                              |
| **Hosting**                      | GitHub Pages, Netlify    | Host generated documentation for public or private use.                        |
