# Environment variables
In order for the services to run you must provide .env files for a specific environment that contains configrations and secrets the application requires. We will not include the .env files in the repository beacuse they contain secrets we don't want compromised via git history. Therefore the files will be ignored from git using the .gitignore file.

```
# Example of .env.dev
NODE_ENV=development
PORT=3003
DATABASE_CONNECTION_STRING=XXXXXX
```

# Development

Install dependencies with 

```
yarn init
```

Start the dev server with

```
yarn dev
```

# Production

Build the prodcution client bundle

```
yarn build
```