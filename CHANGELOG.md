# Changelog

Version history for :Otherscape — Mist Engine Reskin.

## [1.10.28]

- Hid the legacy Color dropdown in the Themebook / Story Theme editor.

## [1.10.27]

- Updated primer examples to mix cyberpunk gear, street-level situations, and magic.

## [1.10.26]

- Reflowed the How to Play cards based on window width and put each roll result icon below its label.

## [1.10.25]

- Added the :Otherscape How to Play primer and the three :Otherscape roll outcome icons.

## [1.10.24]

- Challenge Details hides secret names and descriptions from non-owners, including secrets attached by a Power Set.
- Essence updates run under the rolling client's Foundry permissions. Chat results carry a receipt so a later reservation can reconcile a published roll after a failed usage update. If publication is uncertain and the receipt is missing, the module keeps the reservation blocked to avoid applying the same bonus twice.
- Open category roll dialogs refresh from document updates until submitted for MC confirmation. The approved roll uses the submitted selection.

## [1.10.23]

- Journal reading panes inherit the interface theme when Applications uses its default setting, even with a separate Journal Entry sheet theme.

## [1.10.22]

- The journal viewer applies the Applications theme on render, including when Foundry gives the reading pane its own light theme.

## [1.10.21]

- The Journal Entry viewer now takes its reading-pane palette from the application shell, including when Foundry applies a light theme directly to the pane.

## [1.10.20]

- Kept the dark Journal Entry background active while editing and replaced parchment panels in dark journal pages.

## [1.10.19]

- Matched the Downtime setup and activity forms to the dark application palette and restored dark text on the Rules Reference’s light tag and status chips.

## [1.10.18]

- Added dark application styling for Journal Entry pages, Scene Tags, Downtime, Acting Together, and the Mist Engine Rules Reference.

## [1.10.17]

- Bundled the Metro :Otherscape world landing artwork and documented the Foundry world background path.

## [1.10.16]

- Inactive tabs on the restyled item and Crew Theme sheets use white labels in dark mode.

## [1.10.15]

- Item and Crew Theme sheets use the Power Set slate-and-lime palette when the Foundry Applications theme is dark.

## [1.10.14]

- Restored the original :Otherscape default icons in saved documents and tokens. The active GM repairs managed defaults on first load. User-assigned artwork outside the managed default paths is preserved.
- Theme Kits, Themebooks, and Power Sets switch their default icon to Self, Mythos, or Noise when the category is saved. Clearing the category restores the item type’s generic icon.

## [1.10.13]

- Fixed default icon migration for Foundry embedded Item collections.

## [1.10.12]

- The unlocked character sheet’s Custom Background and Custom Text controls are 32 pixels high.
- Locking the character sheet removes the tab-row Essence button and retains the in-play Essence button.

## [1.10.11]

- Category roll dialogs have unique IDs and receive MC confirmation replies by request ID.
- The Challenge sheet and roll collector share the effective tag and status calculation for attached Power Sets. Roll cleanup clears attached selections. A combined row edits its displayed contributor only. Hover over the row to see its source. A same-name contributor can remain visible after deletion.
- Essence roll execution reserves the prepared bonus with the active GM or a designated active owner. Cancellation before execution leaves it available. Usage is recorded in one update after the result is posted to chat. An interrupted reservation expires after ten minutes.
- Category counts and Essence share a theme selector. Essence requires exactly four recognized personal themes. Rearranging cards has no rules effect.
- An active GM repairs legacy default portraits and token textures in the world once. The new skin applies its portrait assets when sheets render. Actor and token defaults use stable paths in saved data. Compendium content is outside the migration.

## [1.10.10]

- Essence windows opened from unlocked character sheets hide in-play ability buttons, usage checkboxes, reset controls, and prepared-bonus notices. Avatar Agenda is shown as text. Mythos Source setup fields remain available. Locked-sheet Essence windows retain their in-play controls.

## [1.10.9]

- Locked character-sheet power tags display active tags before planned tags, preserving relative order within both groups. Stored tag order and editable-sheet ordering are unchanged.

## [1.10.8]

- Replaced the unlocked character sheet’s inline Essence section with an Essence: <name> button to the left of Main/Other/Biography/Notes. The button opens the existing Essence dialog, including Mythos Source fields and ability controls. The locked-sheet Essence button is unchanged.

## [1.10.7]

- Custom text color now uses white hex text, a Clear Custom Color caption, and a 1px swatch border. Both control states share a fixed-height action area and the same 30px swatch column with 1rem spacing, keeping the swatch position unchanged.

## [1.10.6]

- When custom text color is set, the editor displays a clear-color button, the uppercase hex code, and the display-only swatch, left to right. Clearing restores the Custom Text Color selection button and the locked sheet’s default text color.

## [1.10.5]

- The custom text color swatch is display-only and removed from keyboard navigation. Only the Custom Text Color button opens the palette.

## [1.10.4]

- The unlocked character-sheet custom text color control now uses a Custom Text Color button plus a separate swatch with 1rem spacing. Both open the native color palette. Existing values and unset colors are preserved; selecting a color updates system.customFontColor for the locked sheet.

## [1.10.3]

- Game-icons defaults now reference modules/game-icons-net/whitetransparent/<name>.svg directly; removed the seven bundled copies. Paths were verified against the game-icons-net 0.0.45 release archive. The required dependency remains. Old bundled default paths are recognized for automatic migration, preserving custom artwork. The user-supplied Crew silhouette and guide-derived Challenge/category icons remain bundled.

## [1.10.2]

- Replaced the Crew Theme default with the user-provided group silhouette, displayed in white with a transparent background. The original image is embedded losslessly with a color-key filter so its shapes are preserved.

## [1.10.1]

- Declared game-icons-net as a required module dependency.

## [1.10.0] — Default icons

- Added transparent type-specific defaults: Character ID Card, Crew Three Friends, Challenge guide reticle; Loadout Briefcase, Themebook Book Cover, Theme Kit Card Pick, Moment of Evolution Upgrade, Power Set Power Lightning, Scene Data Clapperboard. Themebooks, Theme Kits, and Power Sets switch to the assigned Self/Mythos/Noise symbol, reverting to their type default if the category is cleared. Category icons use red/pink, purple, and cyan; generic icons use slate for visibility on light/dark surfaces. Known old defaults and module-managed icons update automatically; custom artwork is preserved. The active GM updates existing world Actors/Items and embedded Items on ready. New/imported documents use the same rules. Default prototype-token artwork follows Actor defaults; existing placed tokens are not rewritten. Attribution: icons/defaults/ATTRIBUTION.md.

## [1.9.4]

- Restored native add and lock/edit controls on locked Challenges with attached Power Sets. Combined tag/status rows support name editing, positive/negative and tag/status toggles, selection, status bubbles, deletion, and an explicit Edit dialog for name/type/tier/polarity. Actions route to matching source entries in the base Actor and attached Power Set Items instead of using projected array indices. A same-name combined row edits/deletes all contributors, preventing removed entries from reappearing from another source. No-Power-Set sheets retain native controls. Combined status markings now include all contributing tiers.

## [1.9.3]

- Applied the corrected editor templates to unlocked Challenges too. Details retains Tags & Statuses, omits Mighty Aspects, uses Limits headers only when limits exist, and retains only the legend Threat/Consequence plus buttons. The locked combined view is preserved.

## [1.9.2]

- Power Sets now use a dedicated editor template instead of removing sections after rendering. Tags & Statuses is retained, Mighty Aspects is omitted, and Tags & Statuses / Limits headers render only when the corresponding array contains an item. Dedicated Threats markup retains legend plus buttons and omits duplicate bottom buttons.

## [1.9.1]

- Power Set editors now follow the Applications light/dark theme. Removed Mighty Aspects from the editor and duplicate bottom Threat/Consequence add buttons. Tags & Statuses and Limits column headers disappear when empty.
- Locked Challenge Details now project the base Challenge plus all attached Power Sets: rating increases sum, roles deduplicate, limits merge by name (0 takes precedence; otherwise the highest value; newest nonempty consequence wins), same-name statuses retain the higher value, and features, secrets, and threats append. The unlocked Details tab still edits only the base. This is a display projection, not a permanent document merge or a change to scene-app mechanics. The combined floating tag/status display is read-only to avoid editing the wrong base or attached indices. Removing a Power Set immediately removes its projected contributions; previously merged legacy records cannot be decomposed.

## [1.9.0] — Power Sets

- Renamed Challenge Add-On to Power Set (internal challenge-addon type retained for compatibility). Its sheet includes a Self/Mythos/Noise selector and description. Challenges have a Power Sets tab with category-styled cards, individual editing and deletion in edit mode, and a read-only tab in locked mode only when sets exist. Legacy short-challenge templates move from Details into this tab.
- Newly dropped Power Sets are stored as independent embedded copies instead of being permanently merged. Their rating increase, roles, limits, tags, specials, and threats are displayed separately; they do not automatically modify base Challenge statistics. Removing an attached set leaves the base Challenge intact. Previously merged Add-Ons retain only names upstream: those records are shown with a warning, and removing a record does not undo merged content.

## [1.8.0] — Journal reading styles

- Journal reading mode now follows the Applications light/dark palette using the backgrounds and typography from Otherscape Garage style guide pages 4 and 12. Includes five heading levels, Exo 2 body text, optional lead/lede classes, inline tag/status/limit/location highlights, readable content links and tables. No columns are imposed on existing journal content. The new styles exclude content containing active rich-text editors. Background textures are extracted from the user-supplied guide.

## [1.7.6]

- Swapped locked-sheet power-tag indicator bars: active tags use their theme category color; planned tags use white.

## [1.7.5]

- The native mist-engine-fvtt.tidyTagsOnCharacterSheet user setting now hides div.os-planned-tag when true. Changing the setting immediately updates visibility, preserving the existing onChange callback.

## [1.7.4]

- Removed all Essence MC guidance and added the player-facing descriptions for all eight Essences above their abilities. Existing ability controls are preserved.

## [1.7.3]

- Separated Essence actions, usage checklists, and reset controls into full-width stacked groups. Checkbox alignment stays consistent when abilities are used. Applies to Cyborg, Spiritualist, and Transhuman in both dialog and inline editor.

## [1.7.2]

- Fixed the Essence dialog inheriting the premium portrait margin. Its text panel now fills the window, with an opaque background, consistent padding, and readable paragraph spacing.

## [1.7.1]

- Locked-sheet theme roll buttons now sit to the right of Tags & Statuses. A fourth button opens a compact Essence window containing its ability, trackers, and applicable controls. The unlocked sheet retains Essence editing.

## [1.7.0] — Essence

- Essence requires exactly four personal themes with recognized categories, excluding Story themes. Category rolls and Essence use the same eligible theme list. Mythos Source fields in character edit mode distinguish Avatar from Conduit. The panel includes each ability and GM-only MC guidance. Spiritualist and Cyborg can prepare bonuses for the next eligible roll; successful roll execution marks their session use. Avatar can recover burned power tags and record an Agenda. Session and scene trackers reset manually. Transhuman outcome changes, immunities, fictional permissions, and theme transformations are adjudicated with the MC rather than applied automatically.

## [1.6.0]

### Added

- Added Roll with Self, Roll with Mythos, and Roll with Noise buttons to locked character sheets, displaying the number of non-story themes in each category.
- Added separate category roll dialogs with Quick, Detailed, and Reaction resolution and support for the existing MC confirmation workflow.
- Used the selected category's theme count in place of positive tags while retaining negative tags and applicable statuses. Excluded positive helping tags and prevented burning tags for Power.
- Added roll guidance explaining that the MC determines domain applicability and that general affinity does not grant specific abilities.

### Fixed

- Cleared pending burn marks and applicable relationship selections during category-roll cleanup without consuming a tag burn.

## [1.5.6]

### Changed

- Changed the short description on locked character sheets to Exo 2.

## [1.5.5]

### Fixed

- Indented the Theme Specials heading to align with the motivation heading.

## [1.5.4]

### Fixed

- Left-aligned the Theme Specials heading and removed its text shadow.

## [1.5.3]

### Fixed

- Increased locked theme-card selector specificity so category-colored power-tag panels and planned-tag styling override the underlying sheet styles.
- Added a distinct highlight for selected weakness tags.
- Hid planned weakness tags on locked character sheets.

## [1.5.2]

### Changed

- Restyled locked theme cards to match the illustrated pre-generated-character reference, including category-colored tag panels, motivation text, Story text, and Theme Specials.
- Distinguished active and planned tags through different panel treatments.
- Moved Theme Specials into their own styled block below the motivation and Story text.

### Fixed

- Restored Story fields previously hidden by the module and displayed nonempty Story text on locked theme cards.

## [1.5.1]

### Fixed

- Applied the one-step strong-hit reduction to No Return and Ultimate in Go Out in a Blaze.
- Changed No Return's strong-hit consequence from replacing a theme to burning all tags in the chosen theme.
- Changed Ultimate's strong-hit consequence from taking a tier-6 status to replacing the chosen theme.
- Kept Inescapable's tier-6 consequence regardless of the roll.

## [1.5.0]

### Added

- Replaced the Sacrifice dialog with Go Out in a Blaze, using Significant, No Return, Ultimate, and Inescapable degrees.
- Displayed the selected degree's outcome and consequences in the dialog.
- Added a modifier field, roll resolution, and a chat card displaying the selected degree and resulting outcome and consequences.
- Added the Significant degree's reduced consequence on a strong hit.

## [1.4.19]

### Changed

- Moved the Decay and Upgrade captions below their corresponding bubbles in both locked and unlocked character sheets, matching the Evolution track's layout.

## [1.4.18]

### Changed

- Removed the Tags label above power tags on locked character sheets.
- Replaced the generic Motivation heading with Identity for Self, Ritual for Mythos, and Itch for Noise, including the corresponding legacy LitM category aliases.

## [1.4.17]

### Fixed

- Made Challenge status-level bubbles readable with distinct active and inactive colors.
- Removed the horizontal separator lines beneath Challenge Threat sections.

## [1.4.16]

### Fixed

- Strengthened the Challenge limit-number selector so the larger number styling takes precedence.
- Vertically centered limit names beside their numbers.

## [1.4.15]

### Changed

- Restyled locked Challenge limits as lime banners with uppercase names and larger numbers.
- Removed the separator before the displayed limit number.
- Renamed the Quintessence item type to Moment of Evolution.

### Removed

- Hid Rote and Short Challenge / Vignette from the item creation dialog without unregistering their underlying system types.

## [1.4.14]

### Changed

- Reordered the Theme Kit header so the themebook category dropdown precedes the theme kit/themebook-choice dropdown.
- Added 1rem spacing between the icon and header fields and between the two dropdowns.

## [1.4.13]

### Added

- Replaced the Theme Kit form's free-text `themekit_type` input with a dropdown populated from matching Theme Kits in accessible world items and compendiums.
- Filtered available names by the selected `themebook_type` while preserving an existing or custom saved value.

### Changed

- Hid the weakness double-down-arrow indicator on locked character theme cards and assigned Crew theme cards.

## [1.4.12]

### Changed

- Applied the four-core-theme top row and supporting-card lower row to unlocked character sheets as well as locked sheets.
- Added wider edit-mode card columns for the existing controls.

### Fixed

- Restored Quest/Motivation fields and their tab after they had been hidden alongside Story fields. Story and Milestones remained hidden at this stage.

## [1.4.11]

### Changed

- Renamed Quintessences to Moments of Evolution on the character sheet and changed Promise to Evolution.
- Ordered the locked character sheet's supporting cards as Loadout, Crew, Crew Relationship, and Moments of Evolution.

### Removed

- Hid Story fields and the Milestone track. This revision also hid Quest/Motivation controls, which were restored in 1.4.12.

## [1.4.10]

### Fixed

- Resolved the chat palette from the interface theme rather than nested application theme classes, restoring the dark-mode negative side box when light-themed chat containers are present.

## [1.4.9]

### Fixed

- Increased rich-text toolbar icon and label contrast against dark toolbar backgrounds.
- Added readable hover, focus, active, and disabled toolbar states without changing document-body text colors.

## [1.4.8]

### Changed

- Applied the theme-card palette to Crew cards in both locked and unlocked character sheets.
- Restyled the empty Crew card message and Create New / Assign Existing buttons.
- Kept assigned Crew power tags full-width and hid unused burn-indicator space.

## [1.4.7]

### Removed

- Hid Journey from the actor creation dialog while retaining the registered system actor type and existing documents.

## [1.4.6]

### Changed

- Replaced the locked Challenge sheet's LitM difficulty symbols with the style guide's targeting reticle.

### Removed

- Hid duplicate bottom-of-section Threat and Consequence add buttons, retaining the plus buttons in the fieldset legends.

## [1.4.5]

### Added

- Added dedicated Challenge-sheet styling based on page 7 of the style guide, using a slate frame, lime headings, readable statistics, and styled content sections in both interface themes.
- Applied corresponding styling to the unlocked sheet while retaining its native fields, actions, and tabs.

## [1.4.4]

### Changed

- Used the page 5 side box for light-mode chat and the page 13 negative side box for dark-mode chat.
- Added light/dark palette tokens for chat text, frames, roll results, controls, and focus states.
- Shared interface-theme detection with locked theme cards.

## [1.4.3]

### Changed

- Arranged locked character sheets into a top row of up to four core personal themes and a lower row for the remaining Main-tab cards.
- Changed locked power-tag rows to a two-column layout with independently wrapping tag text and a fixed burn-control column on the right.

## [1.4.2]

### Added

- Added light and dark locked theme-card styles based on the supplied reference, including shaped tag panels, striped weakness panels, and styled motivation and Theme Specials sections.
- Added a fireball icon to replace the LitM scratch/burn artwork and positioned the burn control on the right.

## [1.4.1]

### Changed

- Hid LitM theme-type choices from Theme Kit and Themebook dropdowns except for the currently saved legacy value, preserving compatibility with existing items.

## [1.4.0]

### Added

- Added distinct OS - Noise, OS - Mythos, and OS - Self dropdown values stored as `os-noise`, `os-mythos`, and `os-self`.
- Extended category icons and banner styling to the new values while retaining the legacy LitM visual aliases.

### Changed

- Replaced the earlier display-only relabeling approach with separately stored Otherscape category values.

## [1.3.4]

### Changed

- Relabeled LitM - Origin, LitM - Adventure, and LitM - Greatness as OS - Noise, OS - Mythos, and OS - Self in the Theme Kit and Themebook type dropdowns, preserving the underlying LitM values in this revision.

## [1.3.3]

### Fixed

- Prevented custom character-sheet backgrounds from inheriting the skin's small tiled-grid sizing.
- Applied non-repeating, top-left-aligned custom artwork with `background-size: contain`.

## [1.3.2]

### Fixed

- Cleared the upstream result-artwork offset so chat outcome icons align inline with result labels such as 10+.

## [1.3.1]

### Added

- Added the page 11 Success and Consequences icons to chat roll results.
- Added a mixed-success icon combining the Success reticle with the Consequences burst motif.

## [1.3.0]

### Added

- Added the page 27 Noise, Mythos, and Self category icons in place of Origin, Adventure, and Greatness.
- Added blue Noise, purple Mythos, and red Self character-theme title banners.
- Applied category-icon substitutions to supported sheet and journal elements.

## [1.2.0]

### Added

- Added chat-message styling based on the page 13 negative side box, including a clipped frame, hazard accents, scanlines, and styled roll-result panels.
- Styled sender names, roll headings, selected tags, and private-message outlines to fit the new chat presentation.

## [1.1.0]

### Changed

- Aligned the skin with the Otherscape Garage Style Guide's slate-and-lime palette and scanline/grid textures.
- Replaced Barlow Condensed headings with Bebas Neue and adopted Exo 2 for body text, retaining IBM Plex Mono for accents.
- Refined sheet, card, dialog, heading, and inline-highlight styling to match the guide.
- Added blue location and triggered-scene highlights for custom journal markup.

## [1.0.0]

### Added

- Released the initial unofficial :Otherscape visual skin and English terminology overrides for Foundry VTT 14 and Mist Engine 14.5.5.
- Added scoped styling for character and Challenge sheets, item sheets, cards, dialogs, chat results, and scene-tag displays without editing the installed system.
- Introduced Otherscape terminology including Loadout, Crew, Motivation, Upgrade, Decay, Downtime, and MC across supported localized interface text.
- Bundled Barlow Condensed and IBM Plex Mono fonts with their license files.
