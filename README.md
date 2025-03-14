# Recipe Builder

Recipe Builder is a user-friendly web application for creating, reading, updating, and deleting recipes. It fetches data from a dataset, allows modifications, and exports new JSON files for easy sharing and integration.

---

## **Table of Contents**
- [Features](#features)
  - [Upload Recipes](#upload-recipes)
  - [Create Recipes](#create-recipes)
  - [Read Recipes](#read-recipes)
  - [Update Recipes](#update-recipes)
  - [Delete Recipes](#delete-recipes)
  - [Export Recipes](#export-recipes)
  - [Scripts](#scripts)
  - [Versioning](#versioning)
- [Deployment](#deployment)


---

## **Features**

### **Upload Recipes**
Users can upload a `recipes.json` file to the application. The file is read and the recipes are displayed, allowing for further modifications.

### **Create Recipes**
Users can create new recipes by providing details such as the recipe name, output item ID, and components (with IDs and quantities). The number of components can be specified, with a maximum of 10.

### **Read Recipes**
The application displays all recipes in a user-friendly format, showing the output item ID, quantity, and components.

### **Update Recipes**
Users can update existing recipes by searching for the recipe by name and modifying the details.

### **Delete Recipes**
Users can delete existing recipes by searching for the recipe by name and removing it from the list.

### **Export Recipes**
The updated recipes can be exported as a new `recipes.json` file, which can be downloaded and shared.

---
## **Versioning**
Update version number in `package.json`
uses `import pkg from '../package.json';` to update version text next to tile.

## **Scripts**
The following scripts are available in `package.json`:

`npm run dev` Starts the development server.                  
`npm run build` Compiles TypeScript and builds for production.  
`npm run build-and-dev` Builds the project and starts the dev server.   
`npm run preview` Serves a local preview of the production build.
`npm run commit "message"` Quick commit helper adds (all files and commits with a message).

## **Deployment**

### **📌 Start the Development Server**
To start the development server, run:
`npm run dev`

### **📌 To clean and reinstall dependencies**
`npm run clean`

### **🚀 Deployment**
The project is deployed using GitHub Pages. To deploy manually, run:
`npm run build`
`npm run deploy`

### **🌍Access the Live Project**
After deployment, your project will be available at:
https://gillicode.github.io/recipe-builder/
