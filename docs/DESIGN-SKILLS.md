# Design references and agent skills

The visual direction combines the abyssal teal/cyan surfaces and bioluminescent particles from the supplied Auros reference with the black-void composition, violet signal accent, and constellation visual from the supplied Dala reference. The existing Archai logo remains the source of brand identity.

## References
- Frontend Design: https://github.com/anthropics/skills/tree/main/skills/frontend-design
- UI/UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Addy Osmani Agent Skills: https://github.com/addyosmani/agent-skills
- LLM Council skill: https://github.com/aiwithremy/claude-skills-llm-council

## Install in a compatible coding-agent environment
```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
npx skills add https://github.com/addyosmani/agent-skills
npx skills add https://github.com/aiwithremy/claude-skills-llm-council
```

These are coding-agent instructions, not runtime dependencies of the deployed website. Install them in the agent environment you actually use (for example, Cline/Cursor/Codex) and review the generated skill files before executing any instructions. The environment used for this archive could not complete the package download within its network timeout, so the skills are documented here rather than falsely marked as installed.
