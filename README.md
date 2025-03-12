# LiAce - AI text Editor

!UNFINISHED!


## Overview

Trying to build a UX friendly open AI text editor.

## Features

- Grammar inline fixes via Tab
- Continuation via Tab
- Mark text and fix
- Mark text and rephrase#
- Versioning
- Site preview
- Export


## Installation

Easy as that
```sh
npm install

npm run dev
```

## API Configuration

1. Create a `.env` file based on the `.env.example` template.
2. Configure your API endpoint in the `.env` file.

**Important**: The API endpoint must return a response in the format `{result: string}`. This format is required for the text generation and suggestion features to work properly.
