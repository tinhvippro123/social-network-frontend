# 📐 Contributing Guide — VietBlog

> Commit rules, pull request guidelines, branch naming conventions, and Git workflow for the VietBlog project.

---

## 🔀 Branch Naming Convention

| Pattern | Purpose | Example |
|---------|----------|-------|
| `feature/<name>` | New feature | `feature/chat-enhancement` |
| `fix/<name>` | Bug fix | `fix/dark-mode-toggle` |
| `refactor/<name>` | Code refactoring | `refactor/api-layer` |
| `docs/<name>` | Documentation update | `docs/update-readme` |
| `hotfix/<name>` | Critical fix on production | `hotfix/login-crash` |

### Git Flow

```
main (production)
 └── dev (development)
      ├── feature/chat-enhancement
      ├── feature/refactoring-dry-ui
      ├── fix/dark-mode-toggle
      └── ...
```

- **`main`**: Stable code, ready to deploy.
- **`dev`**: Active development code, integrating features.
- **`feature/*`, `fix/*`**: Working branches, created from `dev`, merged back to `dev` via Pull Request.

---

## 📝 Commit Convention

The project uses the **[Conventional Commits](https://www.conventionalcommits.org/)** standard.

### Format

```
<type>(<scope>): <description>

[body — optional]
```

### Types

| Type | Description | Example |
|------|--------|-------|
| `feat` | A new feature | `feat(chat): add emoji picker` |
| `fix` | A bug fix | `fix(ui): resolve dark mode toggle` |
| `refactor` | A code change that neither fixes a bug nor adds a feature | `refactor: extract API layer from views` |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, etc.) | `style(admin): polish table alignment` |
| `docs` | Documentation only changes | `docs: update dev-notes for session 7` |
| `perf` | A code change that improves performance | `perf(posts): parallel fetch with Promise.all` |
| `chore` | Changes to the build process or auxiliary tools and libraries | `chore: update vite to v8.2` |
| `test` | Adding missing tests or correcting existing tests | `test(auth): add login unit tests` |

### Common Scopes

| Scope | Area |
|-------|---------|
| `ui` | General UI (layout, theme, components) |
| `admin` | Admin dashboard |
| `chat` | Messaging |
| `posts` | Posts/Articles |
| `auth` | Authentication / Registration |
| `views` | View pages |
| `frontend` | Global frontend |
| `backend` | Global backend |
| `api` | API layer |

### Complex Commit Example (with body)

```
feat(chat): add message read receipts

- Single check (✓) = sent
- Double check (✓✓) = delivered
- Blue double check (✓✓) = read
- Auto-mark as read when conversation is opened
```

### ⚠️ Important Notes

- Description MUST be written **in English**, starting with a **base verb**: `add`, `fix`, `remove`, `update` (DO NOT write `added`, `fixes`, `removing`).
- Do not capitalize the first letter of the description: `fix dark mode` ✅ | `Fix dark mode` ❌
- Do not end the description with a period: `add emoji picker` ✅ | `add emoji picker.` ❌

---

## 🔃 Pull Request Guidelines

### Title format

```
<type>(<scope>): <Short description>
```

**Example:**
- `feat(frontend): Refactor DRY UI — Skeleton loaders, separated views, dark mode fix`
- `feat(chat): Enhance messaging — read receipts, emoji, file sharing`
- `fix(admin): Resolve table layout shifts`

### Description template

Every PR should follow this structure:

```markdown
### Description
A 1-2 sentence summary of the PR's purpose.

### Key Changes
- ✨ **New Features**: ...
- 🐛 **Bug Fixes**: ...
- 🏗️ **Refactoring**: ...
- 📊 **Performance**: ...

### Screenshots
*(Paste screenshots here if there are UI changes)*

### Checklist
- [ ] Code builds successfully
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode works correctly
- [ ] Documentation has been updated
```

### Review Process

1. **Create PR** from your `feature/*` or `fix/*` branch → `dev`
2. **Self-review**: Review your own diff before submitting
3. **Merge**: Once approved, merge into `dev` using **Squash and merge** (combine all commits into 1 clean commit)
4. **Delete branch**: After merging, delete the completed feature branch

---

## 📁 Documentation Structure

```
docs/
├── architecture.md     # System architecture, diagrams, tech stack
├── algorithms.md       # Algorithms, business logic
├── flows.md            # Activity flows (user flows, API flows)
├── dev-notes.md        # Development logs by session
└── contributing.md     # Commit, PR, and branch rules (THIS FILE)
```
