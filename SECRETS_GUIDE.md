# Environment Variables & Secrets Management

To securely build and distribute this Tauri application, you must inject your API keys and code signing certificates at build time without exposing them in your source code.

## 1. Local Development
For local testing, duplicate the `.env.example` file and rename it to `.env.local`. Vite will automatically load variables prefixed with `VITE_` during `npm run dev`.

```bash
cp .env.example .env.local
```

> **Warning:** Make sure `.env.local` is added to your `.gitignore` to prevent accidental commits.

## 2. GitHub Actions & CI/CD Pipeline
For production builds, the GitHub Actions pipeline requires several repository secrets to compile the app and sign the binaries. 

Navigate to your repository on GitHub: **Settings > Secrets and variables > Actions**, and add the following **Repository secrets**:

### Application API Keys
These keys are injected into the frontend at build-time.
- `VITE_YOUTUBE_CLIENT_ID`: Your Google Cloud OAuth 2.0 Client ID.
- `VITE_INSTAGRAM_CLIENT_ID`: Your Meta / Instagram Graph API App ID.

### Tauri Updater & Code Signing
Tauri requires private keys to sign the update packages so the updater can securely verify them.
- `TAURI_PRIVATE_KEY`: Your generated Tauri private key for the updater (`tauri signer generate -w ~/.tauri/myapp.key`).
- `TAURI_KEY_PASSWORD`: The password for your Tauri private key.

### GitHub Release Token
- `GITHUB_TOKEN`: This is usually provided automatically by GitHub Actions, but ensure the workflow permissions have "Read and write permissions" enabled under **Settings > Actions > General > Workflow permissions**.

## 3. Configuring the Tauri Updater
Once you have generated your updater keys using the Tauri CLI, you must place the **Public Key** into your `tauri.conf.json` file. The private key remains in GitHub Secrets.

```json
"plugins": {
  "updater": {
    "endpoints": [
      "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json"
    ],
    "pubkey": "YOUR_GENERATED_PUBLIC_KEY_STRING_HERE"
  }
}
```

By following this guide, your sensitive API credentials and signing keys will remain secure and completely separated from your version control history.
