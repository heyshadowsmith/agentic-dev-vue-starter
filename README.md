# Agentic Dev Vue Starter

## Prompt library

The app is a library for the prompts that you give to AI tools.
You save a prompt one time, and then you use it again with new details.
The browser keeps the prompts in `localStorage`, thus the data stays on your computer.

### Pages

| Path                | Page                                                    |
| ------------------- | ------------------------------------------------------- |
| `/`                 | The list of prompts, with search, tag filters and sort. |
| `/new`              | A form for a new prompt.                                |
| `/prompts/:id`      | The page where you fill in and copy a prompt.           |
| `/prompts/:id/edit` | A form that changes a prompt.                           |

An unknown path or prompt ID shows a "Not found" message with a link to the list.

### Prompts

Each prompt has a title, a body, tags, an ID, a time of creation and a time of the last change.
The app also records the number of uses and the time of the last use.
A use is a successful copy to the clipboard.

On the list, you can make, edit, duplicate, pin and delete prompts.
The app asks for confirmation before it deletes a prompt.
A duplicate gets a new ID and the title "(copy)", and the edit form opens for it.

### Find a prompt

The search finds text in the title, the body and the tags while you type.
Each word that you type must occur in one of these fields.
Select one or more tags to show only the prompts with all of the selected tags.

You can sort the list in three orders:

- **Recently used:** the last prompt that you copied comes first.
- **Most used:** the prompt with the most uses comes first.
- **Title:** the titles are in alphabetical order.

Pinned prompts always come before the other prompts.

Press Ctrl+K, or Cmd+K on macOS, to open the quick switcher.
Type a part of a title, and then push Enter to open the prompt.

### Variables

Write a variable in the body as `{{name}}`.
Spaces inside the braces are permitted, for example `{{ name }}`.
A name can contain letters, digits, `_` and `-`.

Write a default value after a vertical bar, for example `{{tone|friendly}}`.
The app removes the spaces at the two ends of the default value.
A default value cannot contain braces.

You can use the same variable more than one time.
The page shows one field for it, and each occurrence gets the same value.
If only one occurrence has a default value, that default value applies to all occurrences.
If two occurrences have different default values, the first one applies.

The app does not change text that is not a valid variable.
For example, `{{first name}}`, `{{}}` and `{{name` stay in the result as you wrote them.

The page of a prompt shows one field for each variable, with its default value.
The preview shows the result while you type.
Push "Copy to clipboard" to copy the result.
A message tells you if the copy is successful or if the browser stopped it.

### Export and import

Push "Export" to download all prompts as a JSON file.
Push "Import" to add the prompts from a JSON file.

The app examines the full file before it changes the data.
If the file is not valid, the app shows the problem and does not change your prompts.
If the file is valid, a dialog shows the number of prompts to add and the number to skip.
The app skips a prompt if a prompt with the same ID is already in the library.
The app adds the prompts only after you confirm.

The file contains an object with the version and the list of prompts:

```json
{
  "version": 1,
  "prompts": [
    {
      "id": "6f1c2a52-3b4e-4a8e-9d1c-2f7f3b1e9a10",
      "title": "Code review",
      "body": "Review this {{language|TypeScript}} code:\n\n{{code}}",
      "tags": ["dev", "review"],
      "createdAt": 1767225600000,
      "updatedAt": 1767225600000,
      "pinned": false,
      "useCount": 3,
      "lastUsedAt": 1767312000000
    }
  ]
}
```

These are the rules for each prompt:

| Field        | Rule                                                      |
| ------------ | --------------------------------------------------------- |
| `id`         | Text that is not empty. It must be unique.                |
| `title`      | Text that is not empty.                                   |
| `body`       | Text.                                                     |
| `tags`       | A list of text. The app changes tags to lowercase.        |
| `createdAt`  | Milliseconds since 1 January 1970 UTC.                    |
| `updatedAt`  | Milliseconds since 1 January 1970 UTC.                    |
| `pinned`     | Optional. True or false. The default is false.            |
| `useCount`   | Optional. A whole number of 0 or more. The default is 0.  |
| `lastUsedAt` | Optional. Milliseconds, or `null`. The default is `null`. |

The app also reads a file that contains only the list of prompts, without the object around it.
If `version` is in the file, its value must be 1.

### Storage

The app saves the library in `localStorage` with the key `prompt-library`.
The format is the same as the format of the export file.

If the stored data is not valid JSON or is not a library, the app starts with an empty library.
If only some prompts are not valid, the app keeps the valid prompts.
In the two cases, the app copies the old data to the key `prompt-library-backup` before it saves again.

If the browser cannot save, the app shows a message.
Export your prompts to keep a copy.
When you change the library in a different tab, the app reads the new data.
