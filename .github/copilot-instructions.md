# Copilot Instructions for Rostretto

Welcome to the Rostretto project! This document provides onboarding and operational guidelines for AI agents (e.g., GitHub Copilot, Copilot Chat, or similar tools) contributing to this codebase. Please follow these instructions to ensure code quality, maintainability, and consistency.

## 1. Project Overview
- **Type:** React Native Web application for scheduling/staffing
- **Tech Stack:** React Native, React Native Web, TypeScript
- **UI:** Shared components for mobile/web, custom theming
- **State Management:** Local state, selectors, and viewmodels

## 2. Style and Theming Conventions
- **All colors must be sourced from `theme/colours.ts`.**
- **Always use `styles.` as the StyleSheet variable name.**
- **Do not use alternate style variable names (e.g., `s.` or `S.`).**
- **Component styles should be defined using `StyleSheet.create` or plain objects, but always referenced as `styles.`.**
- **For new UI, prefer extracting shared components to `components/shared/` if used on both web and mobile.**

## 3. File and Folder Structure
- **Screens:** `screens/` (e.g., `SchedulerScreen.web.tsx`, `CapabilitiesScreen.web.tsx`)
- **Components:** `components/` (with subfolders for domains)
- **Theme:** `theme/colours.ts` (central color palette), `theme/index.ts`
- **Utilities:** `utils/`, `helpers/`, `constants/`
- **Data:** `data/` (repositories, sources, mocks)
- **Models:** `models/` (types, schemas, normalisers)
- **State:** `state/` (selectors, types)
- **Viewmodels:** `viewmodels/`

## 4. Coding Standards
- **TypeScript only.**
- **Use functional components and hooks.**
- **Prefer named exports.**
- **Keep imports organized: external libraries first, then internal modules.**
- **Write concise, descriptive comments for complex logic.**
- **Follow DRY (Don't Repeat Yourself) and KISS (Keep It Simple, Stupid) principles.**

## 5. Cross-Platform Guidelines
- **If a component or screen has both web and mobile versions, use `.web.tsx` and `.tsx` extensions.**
- **Shared logic should be extracted to `shared/` or `utils/` where possible.**
- **Web-specific code should only appear in `.web.tsx` files.**

## 6. Testing and Validation
- **Manual testing is required for both web and mobile.**
- **Lint and type-check before submitting changes.**
- **Ensure no broken JSX or unmatched tags in any file.**
- **Run the app after major UI changes to verify correctness.**

## 7. AI Agent Best Practices
- **Never introduce new style variable names. Always use `styles.`.**
- **When refactoring, ensure all color values come from `theme/colours.ts`.**
- **If fixing JSX, validate that all tags are properly matched and closed.**
- **If unsure about a convention, check `CapabilitiesScreen.web.tsx` as a reference.**
- **Do not generate or edit onboarding docs unless explicitly requested.**
- **If you break a screen, attempt to fully fix it before ending your turn.**

## 8. Documentation
- **Update this file if project conventions change.**
- **No README.md is present; this file serves as the primary onboarding doc for AI agents.**

---

_Last updated: 2024-06-11_
