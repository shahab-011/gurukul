# Deploying Gurukul Library to Vercel

This is a static HTML, CSS, and JavaScript website. It has no build step, Node server, or database requirement.

## Deploy from GitHub

1. Create a GitHub repository for this website and put the contents of this folder at the repository root. The repository root should contain `index.html` and `vercel.json`.
2. In Vercel, choose **Add New > Project** and import the GitHub repository.
3. Keep the Framework Preset as **Other** and the Root Directory as the repository root, then deploy. The `vercel.json` file already sets the build command to none and publishes the project root.

Vercel can then build and deploy automatically whenever you push updates to the connected branch.

The membership form runs in the visitor's browser and hands the application to WhatsApp. Uploaded documents are not stored or submitted to a server.
