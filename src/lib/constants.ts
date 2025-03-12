export const PROMPT_SUMMARY = `You are a helpful assistant that helps me write a summary of the given text.

Text:
{{TEXT}}

Respond me with the summary of the text:`;
  
export const PROMPT_GRAMMAR_CORRECTION = `Correct the grammar of the following word:

Word:
{{WORD}}

Respond me with the corrected word or the word unchanged with no further explanation.
`;

export const PROMPT_INLINE_CONTINUATION = `Help me in writing out the continuation of the given text

Guidelines:
- The continuation should be a sentence that is a continuation of the given text.
- The continuation should make sense to the Whole_text so check if there comes text after Continuation_from_here.
- If the Whole_text and Continuation_from_here matches just ignore the Whole_text and continue with the continuation on Continuation_from_here
- The continuation should not be to long max 5 words
- Check on whitespace on the last word of the Continuation_from_here if there is a whitespace or a punctuation mark.

Whole_text:
{{WHOLE_TEXT}}

Continuation_from_here:
{{TEXT}}

Respond me with the continuation of the text:
`;

export const PROMPT_INLINE_REPLACEMENTS = `Help me in fixing a text and check the given text for potential grammar mistakes.
 Don't provide fixes that exceed 3 words break it down into smaller fixes. If there are no mistakes just return an empty array.

## Given text:
{{TEXT}}

Respond me with this format:
[ 
    {
      "original": "{{ORIGINAL}}", // The original text that should be fixed
      "fixed": "{{FIXED}}" // The fixed text for the original text
    }
    ...
]

# Example:

## Given text:
Im goin to the store The weather is nie today.

## Respond:
[ 
    {
      "original": "Im goin",
      "fixed": "I'm going"
    },
    {
      "original": "nie",
      "fixed": "nice"
    }
]
`;

export const PROMPT_INLINE = `You are a helpful assistant that helps me write a sentence that is a continuation of the given text and fixes potential mistakes of the whole text.

<Whole text>:
{{WHOLE_TEXT}}

<Continuation from here>:
{{TEXT}}

Respond me with this format:
{
  "continuation": "{{SUGGESTION}}", // The suggestion for the <Continuation from here>, take whitespaces into account
  "replacements": [ // Optional, replacements for words of the <Whole text>
    {
      "original": "{{ORIGINAL}}", // The original text that would be replaced
      "replacement": "{{REPLACEMENT}}" // The replacement for the original text
    }
  ]
}

Example:

<Whole text>:
I'm going to the store The weather is nie today.

<Continuation from here>:
I'm going to the store

{
  "continuation": "and I will buy some fruits.",
  "replacements": [
    {
      "original": "going",
      "replacement": "heading"
    },
    {
      "original": "nie",
      "replacement": "nice"
    }
  ]
}
`;

// API endpoint for suggestions
export const SUGGESTION_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const PROMPT_CHAT = `You are a heplful assistant that helps th user on his requests.

Conversation history:
{{CONVERSATION_HISTORY}}

User request:
{{USER_REQUEST}}
`;

export const PROMPT_GRAMMAR = `Fix the grammar of the following text:

Text:
{{TEXT}}

Respond me with the fixed text or "No changes needed":
`;

export const PROMPT_REPHRASE = `Rephrase the following text:

Text:
{{TEXT}}



Respond me with the rephrased text or "No changes needed":
`;
