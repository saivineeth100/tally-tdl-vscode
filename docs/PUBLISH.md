# Publishing the Extension

The release and publishing process for the Tally TDL extension is fully automated via GitHub Actions.

## How to Publish a Release

The GitHub Action workflow (`.github/workflows/publish.yml`) is triggered automatically whenever you push a new git tag to the repository. The workflow handles dynamic version injection, pre-release detection, and uploading to the VS Code Marketplace.

To publish an update:

1. **Commit your changes**: Ensure all your code is tested and pushed to the repository.
2. **Tag your release**: Create a tag using standard Semantic Versioning. You may optionally include a `v` prefix.
   - For a **stable release**, use a standard version tag:
     ```bash
     git tag v1.0.0
     ```
   - For a **pre-release**, simply include a pre-release identifier (like `-beta`, `-rc`, or `-alpha`). The pipeline will automatically detect this and publish it to the pre-release channel on the Marketplace:
     ```bash
     git tag v1.0.1-beta
     ```
3. **Push the tag**: 
   ```bash
   git push origin --tags
   ```

### What happens next?
- GitHub Actions intercepts the push event.
- It dynamically extracts the version number (e.g., stripping the `v` prefix) and safely injects it into `package.json`.
- It uses the official `semver` parser to analyze the tag. If a pre-release segment is found, it dynamically appends the `--pre-release` flag.
- It packages the extension and publishes it securely to the Marketplace using your `VSCE_PAT` repository secret.
