# Recipe Builder

Recipe Builder is a user-friendly web application for creating, reading, updating, and deleting recipes. It fetches data from a dataset, allows modifications, and exports new JSON files for easy sharing and integration.

## Table of Contents
- [Features](#features)
  - [Upload Recipes](#upload-recipes)
  - [Create Recipes](#create-recipes)
  - [Read Recipes](#read-recipes)
  - [Update Recipes](#update-recipes)
  - [Delete Recipes](#delete-recipes)
  - [Export Recipes](#export-recipes)
- [GitHub Integration](#github-integration)
  - [OAuth Login](#oauth-login)
  - [Create Pull Request](#create-pull-request)
- [Development](#development)
  - [General Structure of Codebase](#general-structure-of-codebase)
  - [Example Flow](#example-flow)
  - [React TypeScript Vite](#react-typescript-vite)
  - [Expanding the ESLint Configuration](#expanding-the-eslint-configuration)

## Features

### Upload Recipes
Users can upload a `recipes.json` file to the application. The file is read and the recipes are displayed, allowing for further modifications.

### Create Recipes
Users can create new recipes by providing details such as the recipe name, output item ID, and components (with IDs and quantities). The number of components can be specified, with a maximum of 10.

### Read Recipes
The application displays all recipes in a user-friendly format, showing the output item ID, quantity, and components.

### Update Recipes
Users can update existing recipes by searching for the recipe by name and modifying the details.

### Delete Recipes
Users can delete existing recipes by searching for the recipe by name and removing it from the list.

### Export Recipes
The updated recipes can be exported as a new `recipes.json` file, which can be downloaded and shared.

## GitHub Integration

### OAuth Login
Users can log in with their GitHub account to enable the creation of pull requests directly from the application.

### Create Pull Request
After logging in, users can create a pull request with the new `recipes.json` file to be added to the main dataset repository.

## Development

### General Structure of Codebase

**components/**
- This folder contains all the React components for the application, including `RecipeUploader`, `RecipeCRUD`, `RecipeList`, `RecipeExporter`, `GitHubOAuth`, and `CreatePullRequest`.

**utils/**
- This folder contains utility functions used throughout the application, such as functions for handling API requests and data manipulation.

**styles/**
- This folder contains the CSS files for styling the application.

### Example Flow

The application starts by loading the existing `recipes.json` file from the dataset repository. Users can then perform CRUD operations on the recipes, and export the modified recipes as a new JSON file. If logged in with GitHub, users can create a pull request to add the new recipes to the main repository.

### React TypeScript Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- `@vitejs/plugin-react` uses Babel for Fast Refresh
- `@vitejs/plugin-react-swc` uses SWC for Fast Refresh

### Expanding the ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```javascript
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
