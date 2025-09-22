# Torchbox Constitution

This repository contains the Torchbox Constitution documentation built with MkDocs.

## Setting up a local build

### Dependencies

The following are required to run the local environment:

- Python, version 3.6 or up
- pip (Python package installer)

### Running the local build for the first time

1. Clone the repository:
```bash
git clone git@github.com:torchbox/torchbox-constitution.git
cd torchbox-constitution
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the local development server:
```bash
mkdocs serve
```

The documentation will be available at: <http://localhost:8000/>

## Deployment

To deploy the documentation to GitHub Pages:

```bash
mkdocs gh-deploy
```

The documentation is automatically deployed to: https://constitution.torchbox.com/

## Documentation Structure

The documentation covers:

- Introduction
- Co-owner Rights & Responsibilities
- Purpose & Principles
- Structure & Governance
- Financial Management
- Glossary

All documentation is written in Markdown and located in the `/docs` folder.