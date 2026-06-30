---
name: ripgrep match-token drop
description: Why grep output for a substring (e.g. "guess" inside testids) can look mangled, and how to get exact strings.
---

When searching for a literal that appears as a substring inside identifiers
or copy (e.g. `rg "guess"` matching `text-no-guess-p1` or "no guess yet"),
the captured/observed output can render with the matched token visually
dropped, leaving misleading fragments like `text-no-n-p1`.

**Why:** match highlighting / ANSI handling in the captured shell output can
strip the matched run, so what you read back is not the literal file content.

**How to apply:** to get exact strings for an edit or a testid rename, pipe
through `cat -v`, or just open the file with the read tool / a targeted line
range. Do not copy testids or copy strings out of a plain `rg` observation
when the search term is a substring of the thing you need verbatim.
