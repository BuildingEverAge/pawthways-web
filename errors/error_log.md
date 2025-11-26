
24/11/2025
Invalid mobile card layout (image below text)
Description: Image appeared under text only on mobile. Cause: Legacy .spotlight CSS rules overriding mobile layout. Fix: Removed spotlight mobile overrides and forced column layout. Prevention: Delete legacy layout rules when replacing components.

JS template breaks due to unescaped <p> or <div>
Description: <p> or <div> used without backticks broke JS execution. Cause: HTML injected directly without template strings. Fix: Wrapped all dynamic HTML blocks in backticks (…). Prevention: Never insert HTML in JS without backticks.

Return followed by newline stops render()
Description: Cards did not load because return had a newline after it. Cause: JS interpreted return as end of statement. Fix: Moved template string to same line as return. Prevention: Never put a newline after return.

Spotlight CSS conflicting with new rescue-card layout
Description: Cards stretched and layout collapsed. Cause: Template’s .spotlight rules (width: 65%, absolute img) still applied. Fix: Removed spotlight CSS blocks fully. Prevention: Delete old layout systems before adding new ones.

Mixed two layout systems simultaneously
Description: CSS behaved unpredictably. Cause: Using .spotlight HTML with .rescue-card CSS grid. Fix: Unified render to a single layout system. Prevention: Never mix 2 competing layout systems.

Using file:/// created fake CORS errors
Description: Fetch returned CORS errors when testing locally. Cause: Browser blocks fetch on file:// origin. Fix: Tested under http://localhost or deployed domain. Prevention: Never test fetch from file://

Using wrong file (duplicated HTML)
Description: Editing watch-and-help (1).html instead of deployed file. Cause: Multiple duplicates in local folder. Fix: Removed duplicates and edited only the live file. Prevention: Always verify file path before editing.

Broken JS due to leftover stray HTML at end
Description: JS console error “Unexpected token '<'”. Cause: Extra duplicated HTML fragment pasted after function end. Fix: Deleted stray tags. Prevention: Always re-check closing brackets before saving.

CSS changes applied in wrong order
Description: Card layout didn't change after fixes. Cause: Main.css had old rules below new ones. Fix: Removed legacy spotlight block. Prevention: Always search + delete old selectors before adding new.

Cards over-expanded on desktop
Description: Cards were stretched to full width. Cause: Grid minmax too large and spotlight width rules active. Fix: Set proper grid columns and removed old width rules. Prevention: Define grid FIRST, then style cards.

Incorrect ${} structure broke interpolation
Description: Variables showed literal text instead of evaluated values. Cause: Missing backticks or incorrect nesting. Fix: Rebuilt template with clean string structure. Prevention: Test template strings with 1 card before deploying.

sweepCompleted not removing correct cards
Description: Completed cards didn't disappear. Cause: ID mismatch and missing data-id attributes. Fix: Added correct data-id to each card. Prevention: Always include unique identifiers for DOM operations.

appendRescueCard inserted broken HTML
Description: Queue system added malformed cards. Cause: renderRescueHTML had invalid template syntax. Fix: Rebuilt renderRescueHTML with consistent backticks. Prevention: Only use a single template source of truth.

Removing spotlight CSS too late
Description: Styles kept interfering long after redesign. Cause: Partial removal instead of full purge. Fix: Deleted entire spotlight block. Prevention: When migrating, purge old code fully.

JS duplicated: old versions left in file
Description: Browser loaded wrong version of functions. Cause: Old code block pasted below new one. Fix: Removed duplicates. Prevention: Enforce single-source-of-truth functions.

